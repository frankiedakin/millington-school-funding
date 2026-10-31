"""Apply the reviewed October 31 PDF revision without altering the source file."""
import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / 'site/data.json'
data = json.loads(path.read_text())
local = 'sources/school-funding-historicals-2026-10-31.pdf'
source_id = 'mill-history-20261031'
digest = 'd4d227e785c4dad70d1eaacc561897b71ed83603a29cff888b790c7541735b13'
assert hashlib.sha256((root / 'site' / local).read_bytes()).hexdigest() == digest

def total(values):
    return float(sum(Decimal(str(v)) for v in values).quantize(Decimal('.01')))

data['sources'][source_id] = {
    'title': 'City of Millington Funding to MMSD FY15–26 · revised historical schedule',
    'url': local, 'local': local, 'accessed': '2026-10-31', 'sha256': digest,
    'detail': 'City-provided PDF received October 31, 2026, preserved unchanged. Page 1 reports $13,315,717 in direct and indirect support and $2,642,405 in capital support. Pages 2–4 itemize miscellaneous support. FY2016 capital includes $1,000,000 for the annex and $347,033 for drainage. The PDF rounds to whole dollars; unchanged cents are retained from the October 22 workbook. The added FY2016 amount is available only to whole-dollar precision. See the reconciliation notes for the printed direct-transfer footer and blank FY2018 settlement entry. This is City-reported history, not an independent audit of all payments.'
}
data['sources']['mill-drainage-fy2016-audit'] = {
    'title': 'City of Millington FY2016 financial statements · drainage actual expenditure',
    'url': 'https://www.millingtontn.gov/DocumentCenter/View/2215#page=90',
    'accessed': '2026-10-31',
    'detail': 'Printed page 80 (PDF page 90), Capital Improvements Fund, Wilkinsville/CitySchlsDrainage: $347,033 in the Actual Amounts column. This is a rounded-dollar annual expenditure, separate from the project budget. The FY2017 amount comes from the City historical schedule.'
}
historical = [r for r in data['ledger'] if 2015 <= r['year'] <= 2026]
for row in historical:
    row['source'] = source_id
    row['sourcePage'] = 1
    if 'sourceCells' in row:
        row['priorWorkbookCells'] = row.pop('sourceCells')
    row['precisionNote'] = 'PDF displays whole dollars. Unchanged cents come from the retained October 22 workbook; its cell references are historical, not PDF cell references.'
    if row['year'] == 2016:
        row['capital'] = 1347033
        row['capitalDescription'] = 'High School Annex ($1,000,000) and drainage ($347,033)'
        row['note'] = 'FY2016: The revised City schedule adds $347,033 in drainage work to the $1,000,000 High School Annex entry. The drainage amount agrees with the FY2016 audit, printed page 80, to whole-dollar precision. This is City capital work benefiting the schools, not an additional cash transfer to MMSD. The two-year drainage total is approximately $1,042,405, including the FY2017 amount.'
        row['additionalSources'] = ['mill-drainage-fy2016-audit']
    elif row['year'] == 2017:
        row['note'] = 'FY2017: The schedule lists $695,372 for Wilkinsville/schools drainage work ($695,371.53 in the retained workbook). FY2016 separately includes $347,033 for the same project. The combined amount is approximately $1,042,405. City project spending is distinct from cash transferred into the district budget.'
    elif row['year'] == 2018:
        row['note'] = 'FY2018: The revised PDF leaves settlement/OPEB blank. The prior schedule listed $230,219. This view follows the revised schedule and does not establish whether that installment was paid or its funding source. Blank cells are not proof of no payment.'
    row['subtotal'] = total(row[k] for k in ['operating', 'settlement', 'capital', 'startup'])
    row['reportedTotal'] = total([row['subtotal'], row['mixedDrinkTax'], row['miscellaneous']])

data['citySupportTotal'] = total(r['subtotal'] for r in historical)
data['cityReportedSupportTotal'] = total(r['reportedTotal'] for r in historical)
capital = total(r['capital'] for r in historical)
by_year = {r['year']: r for r in historical}
direct = total([total(r[k] for r in historical) for k in ['operating', 'settlement', 'mixedDrinkTax', 'startup']] + [1000000, by_year[2024]['capital'], by_year[2026]['capital']])
assert round(data['cityReportedSupportTotal']) == 13315717
assert round(capital) == 2642405
assert direct == 11875818.30
printed_annual = [2124562, 2115194, 1470367, 540595, 772885, 775013, 765405, 788239, 1251644, 938176, 761581, 1012056]
assert [int(Decimal(str(r['reportedTotal'])).quantize(Decimal('1'), rounding=ROUND_HALF_UP)) for r in historical] == printed_annual
data['cityHistoryReconciliation'] = {
    'source': source_id,
    'broadSupportReported': 13315717,
    'capitalReported': 2642405,
    'capitalRecalculated': capital,
    'directTransferReported': 11900381,
    'priorWorkbookDirectTransferFormulaTotal': 11900380.52,
    'directTransferRecalculated': direct,
    'notes': [
        'The revised PDF reports $13,315,717 in direct and indirect support. The annual categories total $13,315,716.83 using retained workbook cents plus the rounded FY2016 drainage addition, which rounds to the printed total.',
        'FY2016 capital is now $1,347,033: $1,000,000 for the High School Annex plus $347,033 in drainage expenditure. FY2017 drainage remains $695,371.53. The two-year drainage sum is approximately $1,042,405. The earlier $1,045,000 narrative is not substituted for this documented sum.',
        'The PDF capital subtotal is now $2,642,405. It includes FY2026 capital and agrees, after rounding, with the $2,642,404.53 sum of annual entries. The earlier omitted-$250,000 subtotal error is resolved.',
        'The printed direct-transfer footer remains $11,900,381. It matches the original workbook calculation of $11,900,380.52, which counted FY2015 mixed-drink tax twice. Removing that $24,562.22 duplication gives $11,875,818.30 under the original selected-category definition. The added drainage expenditure is excluded from this calculation. The PDF contains no formulas, and this reconciliation is not an independent audit of which items were cash transfers.',
        'FY2018 settlement/OPEB remains blank, whereas the prior schedule listed $230,219. Current totals follow the revised PDF. Whether that installment was paid and its funding source remain unresolved.',
        'Broad support includes services, financing, in-kind support and a $95,000 opportunity-cost valuation. It is not a cash-transfer total or the numerator for district operating spending per pupil.'
    ]
}
data['sources']['mill-history-20261022']['detail'] += ' Superseded for the current historical support ledger by the PDF received October 31, 2026; retained as the source of unchanged cent-precision amounts and original formula references.' if 'Superseded for the current historical support ledger' not in data['sources']['mill-history-20261022']['detail'] else ''
data['sources']['mill-history-final']['detail'] = 'Earlier City-supplied PDF retained for comparison. Superseded for the current City support ledger by the revised PDF received October 31, 2026. Its FY2017 drainage and FY2018 settlement entries differ; see the current reconciliation notes.'
data['sources']['asr2025-51-extract'] = {
    'title': 'Millington FY2025 operating spending · saved calculation extract',
    'url': 'https://www.tn.gov/education/districts/federal-programs-and-oversight/data/department-reports/2025-annual-statistical-report.html',
    'local': 'sources/millington-operating-spending-fy2025.json', 'accessed': '2026-10-31',
    'detail': 'Saved inputs from the previously reviewed TDOE Table 51, Millington row 125. This JSON is an extract, not the original state workbook. The official report page and ZIP link were located again October 31, but the archive could not be downloaded for a fresh workbook review.'
}
data['cityHistoryUpdated'] = '2026-10-31'
data['updated'] = '2026-10-31'
data['version'] = 4
path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({k: data[k] for k in ['citySupportTotal', 'cityReportedSupportTotal']}, indent=2))
