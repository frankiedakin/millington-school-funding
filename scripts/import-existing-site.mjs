import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const origin = new URL('https://pfams.anonai.workers.dev/');
const manifest = JSON.parse(await readFile(new URL('./existing-site-manifest.json', import.meta.url), 'utf8'));
let next = 0;
let completed = 0;

async function download(file) {
  if (!/^site\/(?:data\.json|sources\/[a-z0-9.-]+)$/.test(file.path)) {
    throw new Error(`Unexpected import path: ${file.path}`);
  }
  const url = new URL(file.path.slice('site/'.length), origin);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      if (bytes.length !== file.size || sha !== file.sha) {
        throw new Error(`Saved-copy verification failed for ${file.path}: ${bytes.length} bytes, ${sha}`);
      }
      const target = resolve(file.path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
      completed++;
      if (completed % 10 === 0 || completed === manifest.length) {
        console.log(`Verified ${completed}/${manifest.length} imported files`);
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < manifest.length) await download(manifest[next++]);
}));
console.log('Every imported file matches the saved baseline.');
