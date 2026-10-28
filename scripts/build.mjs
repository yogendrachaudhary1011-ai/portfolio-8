/** Creates a static deployable dist/ containing byte-identical original pages and assets. */
import { cp, mkdir, rm, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
for (const page of ['index.html', 'perro.html', 'perro-deepdive.html', 'mercore.html', '.nojekyll', 'admin.html', 'firebase-applet-config.json']) {
  try {
    await copyFile(resolve(root, page), resolve(dist, page));
  } catch {}
}
// Write instant redirect for 404.html so static deployments also redirect to / immediately
const redirect404 = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><script>window.location.replace('/');</script><title>Redirecting...</title></head><body><script>window.location.replace('/');</script></body></html>`;
await writeFile(resolve(dist, '404.html'), redirect404, 'utf8');
await cp(resolve(root, 'framerusercontent.com'), resolve(dist, 'framerusercontent.com'), {recursive: true});
try {
  await cp(resolve(root, 'assets'), resolve(dist, 'assets'), {recursive: true});
} catch {}
try {
  await cp(resolve(root, 'data'), resolve(dist, 'data'), {recursive: true});
} catch {}
// Also sync to public/ in case Vercel project settings default output to public
const pub = resolve(root, 'public');
try {
  await mkdir(pub, {recursive: true});
  for (const page of ['index.html', 'perro.html', 'perro-deepdive.html', 'mercore.html', '.nojekyll', 'admin.html', 'firebase-applet-config.json']) {
    try {
      await copyFile(resolve(root, page), resolve(pub, page));
    } catch {}
  }
  await writeFile(resolve(pub, '404.html'), redirect404, 'utf8');
  await cp(resolve(root, 'framerusercontent.com'), resolve(pub, 'framerusercontent.com'), {recursive: true});
  await cp(resolve(root, 'assets'), resolve(pub, 'assets'), {recursive: true});
  await cp(resolve(root, 'data'), resolve(pub, 'data'), {recursive: true});
} catch (e) {
  console.warn('Sync to public note:', e.message);
}
console.log('Built dist/ and public/ with byte-for-byte copies of all published Framer pages and assets.');
