/** Verifies published HTML, assets and source links have not been modified. */
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(await readFile(resolve(root, 'SOURCE_SHA256.json'), 'utf8'));
let checked = 0;
const failures = [];
for (const [file, hash] of Object.entries(baseline.files)) {
  const path = resolve(root, file);
  try {
    if (!(await stat(path)).isFile()) { failures.push(`Not a file: ${file}`); continue; }
    const actual = createHash('sha256').update(await readFile(path)).digest('hex');
    if (actual !== hash) failures.push(`Modified: ${file}`);
    checked++;
  } catch { failures.push(`Missing: ${file}`); }
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`FAIL — ${failures.length} source changes detected`);
  process.exitCode = 1;
} else {
  console.log(`PASS — all ${checked} original HTML, CSS/JS content and asset files match the uploaded archive SHA-256 checksums.`);
}
