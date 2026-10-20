import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const site = new URL('site/', root);
const data = JSON.parse(await readFile(new URL('data.json', site), 'utf8'));
assert.ok(Array.isArray(data.records) && data.records.length > 0, 'Research records missing');
assert.ok(data.sources && typeof data.sources === 'object', 'Source catalog missing');
let localCount = 0;
for (const source of Object.values(data.sources)) {
  if (!source.local) continue;
  const path = source.local.split(/[?#]/)[0];
  const target = new URL(path, site);
  assert.ok(target.href.startsWith(site.href), `Source escapes site: ${path}`);
  const info = await stat(target);
  assert.ok(info.isFile() && info.size > 0, `Missing or empty source: ${path}`);
  localCount++;
}
const html = await readFile(new URL('index.html', site), 'utf8');
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const path = match[1].split(/[?#]/)[0];
  if (!path || /^[a-z]+:|^\/\//i.test(path)) continue;
  await stat(new URL(path, site));
}
for (const name of await readdir(site)) {
  if (!name.endsWith('.js')) continue;
  execFileSync(process.execPath, ['--check', fileURLToPath(new URL(name, site))], {stdio: 'pipe'});
  const source = await readFile(new URL(name, site), 'utf8');
  for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (match[1].startsWith('.')) await stat(new URL(match[1].split(/[?#]/)[0], site));
  }
}
console.log(`PASS: research data, ${localCount} local source documents, HTML assets and JavaScript imports/syntax.`);
