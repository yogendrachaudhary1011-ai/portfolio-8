/**
 * Minimal byte-preserving static server for the published Framer mirror.
 * No DOM, CSS, JS, animation data, or page content is touched or rewritten.
 * Google AI Studio Build uses npm run dev and discovers PORT / 0.0.0.0.
 * No npm dependencies are needed.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};
const pageAliases = new Map([
  ['/', '/index.html'],
  ['/index', '/index.html'],
  ['/perro', '/perro.html'],
  ['/perro-deepdive', '/perro-deepdive.html'],
  ['/mercore', '/mercore.html'],
  ['/404', '/404.html'],
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const get = flag => {
    const idx = args.indexOf(flag);
    return idx < 0 ? null : args[idx + 1];
  };
  const rawPort = get('--port') || process.env.PORT || '3000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port ${rawPort}`);
  }
  return { port, host: get('--host') || process.env.HOST || '0.0.0.0' };
}

async function tryServe(pathname, req, res) {
  const target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + sep)) return false;
  try {
    const details = await stat(target);
    if (!details.isFile()) return false;
    res.writeHead(200, {
      'Content-Type': mime[extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': details.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(target).on('error', err => { console.error(err); res.destroy(err); }).pipe(res);
    return true;
  } catch (err) {
    if (err?.code === 'ENOENT' || err?.code === 'ENOTDIR') return false;
    throw err;
  }
}

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const raw = (req.url || '/').split(/[?#]/)[0];
    const decoded = decodeURIComponent(raw);
    // The browser's source HTML uses relative resource paths; keep their paths intact.
    if (!decoded.startsWith('/') || decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').includes('..')) {
      res.writeHead(400).end('Invalid path');
      return;
    }
    const pathname = pageAliases.get(decoded) || decoded;
    if (await tryServe(pathname, req, res)) return;
    // An actual 404 keeps the source site's 404 markup unchanged.
    const fallback = resolve(root, '404.html');
    const details = await stat(fallback);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': details.size, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') res.end();
    else createReadStream(fallback).pipe(res);
  } catch (err) {
    console.error('[portfolio-server]', err);
    if (!res.headersSent) res.writeHead(500).end('Internal server error');
    else res.destroy(err);
  }
});
const { port, host } = parseArgs();
server.listen(port, host, () => {
  console.log(`Portfolio available at http://localhost:${server.address().port}/`);
  console.log('Source Framer HTML, CSS, JS, assets, animation data and interactions are served unchanged.');
});
