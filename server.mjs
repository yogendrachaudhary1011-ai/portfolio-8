/**
 * Minimal byte-preserving static server for the published Framer mirror.
 * No DOM, CSS, JS, animation data, or page content is touched or rewritten.
 * Google AI Studio Build uses npm run dev and discovers PORT / 0.0.0.0.
 * No npm dependencies are needed.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile, writeFile, mkdir } from 'node:fs/promises';
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
  '.pdf': 'application/pdf',
};
const pageAliases = new Map([
  ['/', '/index.html'],
  ['/index', '/index.html'],
  ['/admin', '/admin.html'],
  ['/admin.html', '/admin.html'],
  ['/perro', '/perro.html'],
  ['/perro.html', '/perro.html'],
  ['/perro-deepdive', '/perro-deepdive.html'],
  ['/perro-deepdive.html', '/perro-deepdive.html'],
  ['/mercore', '/mercore.html'],
  ['/404', '/index.html'],
  ['/404.html', '/index.html'],
  ['/about', '/index.html'],
  ['/work', '/index.html'],
  ['/projects', '/index.html'],
  ['/contact', '/index.html'],
  ['/process', '/index.html'],
  ['/experience', '/index.html'],
  ['/resume', '/assets/aistudio/Yogendra_Chaudhary_CV_cc247373.pdf'],
  ['/vedic-sewa', '/perro-deepdive.html'],
  ['/vedic-sewa.html', '/perro-deepdive.html'],
  ['/somtu', '/mercore.html'],
  ['/somtu.html', '/mercore.html'],
  ['/numira', '/perro.html'],
  ['/numira.html', '/perro.html'],
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const get = flag => {
    const idx = args.indexOf(flag);
    return idx < 0 ? null : args[idx + 1];
  };
  // In Google AI Studio Build, dev server must always bind to port 3000 on 0.0.0.0.
  // Never bind to 8080 which is occupied by internal nginx ingress in this environment.
  const rawPort = get('--port') || (process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : '3000');
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port ${rawPort}`);
  }
  return { port, host: get('--host') || '0.0.0.0' };
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
  const raw = (req.url || '/').split(/[?#]/)[0];
  const decoded = decodeURIComponent(raw);

  if (decoded === '/api/content') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    const dataFile = resolve(root, 'data/content.json');
    if (req.method === 'GET' || req.method === 'HEAD') {
      try {
        const text = await readFile(dataFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        if (req.method === 'HEAD') res.end();
        else res.end(text);
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: err.message }));
        return;
      }
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          await mkdir(resolve(root, 'data'), { recursive: true });
          await writeFile(dataFile, JSON.stringify(parsed, null, 2), 'utf8');

          // Sync to Firestore database in background
          try {
            const cfg = JSON.parse(await readFile(resolve(root, 'firebase-applet-config.json'), 'utf8'));
            if (cfg.apiKey && cfg.projectId && cfg.firestoreDatabaseId) {
              const toFields = obj => {
                const fields = {};
                for (const [k, v] of Object.entries(obj)) {
                  if (typeof v === 'string') fields[k] = { stringValue: v };
                  else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
                  else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
                  else if (Array.isArray(v)) {
                    fields[k] = {
                      arrayValue: {
                        values: v.map(item => ({ mapValue: { fields: toFields(item) } }))
                      }
                    };
                  } else if (typeof v === 'object' && v !== null) {
                    fields[k] = { mapValue: { fields: toFields(v) } };
                  }
                }
                return fields;
              };
              const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}/documents/portfolio/main?key=${cfg.apiKey}`;
              await fetch(firestoreUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: toFields(parsed) })
              });
            }
          } catch (syncErr) {
            console.warn('Firestore server sync note:', syncErr.message);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Content saved to database successfully' }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    // The browser's source HTML uses relative resource paths; keep their paths intact.
    if (!decoded.startsWith('/') || decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').includes('..')) {
      res.writeHead(400).end('Invalid path');
      return;
    }
    if (decoded === '/404' || decoded === '/404.html') {
      res.writeHead(302, { 'Location': '/', 'Cache-Control': 'no-cache' });
      res.end();
      return;
    }
    const pathname = pageAliases.get(decoded) || decoded;
    if (await tryServe(pathname, req, res)) return;
    // 404 screen removed so it never shows up: redirect missing routes to homepage
    res.writeHead(302, { 'Location': '/', 'Cache-Control': 'no-cache' });
    res.end();
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
