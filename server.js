import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port setup
const PORT = process.env.PORT || 3000;

// Resolver for aspiration controller (supports both before-refactoring and after-refactoring)
async function resolveAspirationHandler() {
  try {
    const { AspirationController } = await import('./src/controllers/aspirationController.js');
    const controller = new AspirationController();
    return (req) => controller.getAspirations(req);
  } catch {
    const { getAspirationsController } = await import('./src/aspirationManager.js');
    return (req) => getAspirationsController(req);
  }
}

const handleGetAspirations = await resolveAspirationHandler();

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: /api/aspirations
  if (pathname === '/api/aspirations' && req.method === 'GET') {
    const roleHeader = req.headers['x-user-role'] || 'Akademisi';
    const currentUser = {
      userId: 'USR-AKD-001',
      fullName: 'Dr. Dewi Khairani, M.Sc.',
      role: roleHeader
    };

    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    try {
      const result = await handleGetAspirations({
        user: currentUser,
        query
      });

      res.writeHead(result.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, statusCode: 500, message: err.message }));
    }
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[ASMA Server] Running at: http://localhost:${PORT}`);
  console.log(`[ASMA Server] Fokus Fitur FR-7: Melihat Daftar Aspirasi (Portal Akademisi)`);
});
