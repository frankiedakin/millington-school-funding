import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../site/data.json', import.meta.url), 'utf8'));
const rows = data.ledger.filter(row => row.year >= 2015 && row.year <= 2026);
const cents = value => Math.round(value * 100);
const byYear = year => rows.find(row => row.year === year);
const annualTotals = [2124562.22,1768161.02,1470366.98,540594.88,772885.39,775012.50,765404.85,788238.89,1251644.18,938175.81,761581.06,1012056.05];
assert.equal(rows.length, annualTotals.length);
for (const [index, row] of rows.entries()) {
  assert.equal(row.year, 2015 + index);
  assert.equal(cents(row.reportedTotal), cents(annualTotals[index]), `Workbook total for FY${row.year}`);
  assert.equal(cents(row.reportedTotal), cents(row.subtotal) + cents(row.mixedDrinkTax) + cents(row.miscellaneous));
  assert.equal(cents(row.subtotal), ['operating','settlement','capital','startup'].reduce((sum,key) => sum + cents(row[key]),0));
  assert.equal(cents(row.miscellaneous), row.miscItems.reduce((sum,item) => sum + cents(item.amount),0));
  assert.ok(data.sources[row.source]?.local.endsWith('.xlsx'));
}
assert.equal(cents(data.cityReportedSupportTotal), 1296868383);
assert.equal(cents(data.citySupportTotal), 1196734253);
assert.equal(rows.reduce((sum,row) => sum + cents(row.reportedTotal),0), cents(data.cityReportedSupportTotal));
assert.equal(rows.reduce((sum,row) => sum + cents(row.subtotal),0), cents(data.citySupportTotal));
assert.equal(byYear(2015).startup, 2100000);
assert.equal(cents(byYear(2017).capital), 69537153);
assert.ok(byYear(2018).unlistedComponents.includes('settlement'));
assert.match(byYear(2018).note, /prior schedule listed \$230,219/);
assert.equal(byYear(2024).miscellaneous, 23234); // Reverse-direction IT services are excluded.
assert.equal(byYear(2025).miscItems.find(item => item.description.includes('opportunity')).amount, 95000);
assert.equal(byYear(2026).miscItems.length, 7);
assert.equal(data.cityHistoryReconciliation.capitalRecalculated, 2295371.53);
assert.equal(cents(data.cityHistoryReconciliation.directTransferReported) - cents(data.cityHistoryReconciliation.directTransferRecalculated), 2456222);
const budget = data.ledger.find(row => row.year === 2027);
assert.equal(budget.subtotal, 775000);
assert.equal(budget.reportedTotal, undefined); // A future budget is not an all-in historical actual.
assert.equal(budget.basis, 'Budget');
assert.equal(data.records.find(row => row.district === '798' && row.year === 2026).metrics.municipal.basis, 'City reported');
console.log('PASS: 12 annual workbook totals, category sums, miscellaneous detail, reconciliation and budget/blank distinctions.');
