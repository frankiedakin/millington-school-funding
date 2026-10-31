import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setupOverview} from '../site/overview.js';

const data = JSON.parse(await readFile(new URL('../site/data.json', import.meta.url), 'utf8'));
const extract = JSON.parse(await readFile(new URL('../site/sources/millington-operating-spending-fy2025.json', import.meta.url), 'utf8'));
const observation = (district, year, metric) => data.records.find(r => r.district === district && r.year === year)?.metrics[metric];
const spending = observation('798', 2025, 'operating_pp');
assert.equal(extract.numerator, spending.numerator);
assert.equal(extract.denominator, spending.denominator);
assert.equal(extract.denominator, observation('798', 2025, 'enrollment').value);
assert.ok(Math.abs(extract.numerator / extract.denominator - spending.value) < .0001);
assert.equal(extract.roundedValue, Math.round(spending.value));
assert.equal(extract.enrollmentDate, '2024-10-01');
assert.equal(extract.source.table, 51);
assert.match(extract.kind, /not the original state workbook/);
const source = data.sources[data.cityHistoryReconciliation.source];
const pdf = await readFile(new URL('../site/' + source.local, import.meta.url));
assert.equal(createHash('sha256').update(pdf).digest('hex'), source.sha256, 'Preserve the supplied PDF bytes');

const element = {innerHTML: '', addEventListener() {}};
globalThis.document = {querySelector(selector) {assert.equal(selector, '#research-overview'); return element;}};
setupOverview({data, observation, sourceHtml: id => `<a href="${data.sources[id].local}">Saved extract</a>`, openDialog() {}, explore() {}});
for (const text of ['$34,939,339.27', '2,461 students', '$14,197.21', 'October 1, 2024', 'all funding sources', 'not this numerator', 'sources/millington-operating-spending-fy2025.json']) assert.ok(element.innerHTML.includes(text), text);
delete globalThis.document;
console.log('PASS: per-pupil arithmetic, enrollment basis, rendered calculation disclosure and unchanged primary PDF.');
