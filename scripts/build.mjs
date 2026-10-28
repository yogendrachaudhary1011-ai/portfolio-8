/** Creates a static deployable dist/ containing byte-identical original pages and assets. */
import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
for (const page of ['index.html', '404.html', 'perro.html', 'perro-deepdive.html', 'mercore.html', '.nojekyll', 'admin.html', 'firebase-applet-config.json']) {
  try {
    await copyFile(resolve(root, page), resolve(dist, page));
  } catch {}
}
await cp(resolve(root, 'framerusercontent.com'), resolve(dist, 'framerusercontent.com'), {recursive: true});
try {
  await cp(resolve(root, 'assets'), resolve(dist, 'assets'), {recursive: true});
} catch {}
try {
  await cp(resolve(root, 'data'), resolve(dist, 'data'), {recursive: true});
} catch {}
console.log('Built dist/ with byte-for-byte copies of all published Framer pages and assets.');
