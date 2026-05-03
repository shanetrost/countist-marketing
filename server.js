import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, 'dist');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webp': 'image/webp',
};

createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].replace(/\/+$/, '') || '/');

  const candidates = [
    join(DIST, p),
    join(DIST, p, 'index.html'),
    join(DIST, p + '.html'),
  ];

  for (const file of candidates) {
    try {
      const s = await stat(file);
      if (s.isFile()) {
        const body = await readFile(file);
        const ext = extname(file);
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        res.end(body);
        return;
      }
    } catch {}
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}).listen(PORT, '0.0.0.0', () => console.log(`Listening on ${PORT}`));
