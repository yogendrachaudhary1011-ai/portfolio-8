/** HTTP smoke test: page bytes, route aliases, image bytes, 404 and HTTP protections. */
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = 18937;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.mjs', '--port', String(port), '--host', '127.0.0.1'], {cwd:root, stdio:['ignore','pipe','pipe']});
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk.toString(); });
async function get(path, opts = {}) {
 const response = await fetch(base + path, opts);
 return {response, bytes: Buffer.from(await response.arrayBuffer())};
}
try {
  let ready = false;
  for (let i=0; i<50; i++) {
    try { const r = await fetch(base); ready = r.status===200; if (ready) break; }
    catch { await delay(80); }
  }
  if (!ready) throw new Error('Server did not start. '+stderr);
  const cases = [
    ['/', 'index.html'], ['/index.html','index.html'], ['/perro','perro.html'],
    ['/perro.html','perro.html'], ['/mercore','mercore.html'],
    ['/mercore.html','mercore.html'], ['/perro-deepdive','perro-deepdive.html'],
    ['/perro-deepdive.html','perro-deepdive.html'],
  ];
  for (const [route, filename] of cases) {
    const {response,bytes} = await get(route);
    if (response.status!==200 || !bytes.equals(await readFile(resolve(root,filename)))) throw new Error(`Mismatch: ${route}`);
  }
  const images = JSON.parse(await readFile(resolve(root,'SOURCE_SHA256.json'))).files;
  const sample = Object.keys(images).find(x=>x.endsWith('.png') && x.startsWith('framerusercontent.com/'));
  const {response:im,bytes:ib} = await get('/'+sample);
  if(im.status!==200 || !ib.equals(await readFile(resolve(root,sample))) || !im.headers.get('content-type')?.startsWith('image/png')) throw new Error('Image bytes or type differ');
  const notfound = await get('/does-not-exist', { redirect: 'manual' });
  if (notfound.response.status!==302 || notfound.response.headers.get('location')!=='/') throw new Error('404 redirect failed');
  const fourOhFour = await get('/404.html', { redirect: 'manual' });
  if (fourOhFour.response.status!==302 || fourOhFour.response.headers.get('location')!=='/') throw new Error('/404.html redirect failed');
  const notfoundFollowed = await get('/does-not-exist');
  if (notfoundFollowed.response.status!==200 || !notfoundFollowed.bytes.equals(await readFile(resolve(root,'index.html')))) throw new Error('404 fallback to home failed');
  const bad = await get('/%2e%2e%2Fpackage.json');
  if (bad.response.status!==400) throw new Error('Traversal protection failed');
  console.log(`PASS — ${cases.length} original page routes, image asset bytes, 404 eliminated with home redirect, and path validation.`);
} finally {child.kill('SIGTERM');}
