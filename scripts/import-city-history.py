"""Read the October 22 City workbook without modifying its original bytes."""
import json
from decimal import Decimal
from pathlib import Path
import shutil
import sys
import xml.etree.ElementTree as ET
import zipfile

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as archive:
    strings = [''.join(s.itertext()) for s in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    sheets = {}
    for index, name in enumerate(['Final', 'FY26 Misc', 'FY25Misc', 'FY24Misc'], 1):
        cells = {}
        for cell in ET.fromstring(archive.read(f'xl/worksheets/sheet{index}.xml')).findall('.//s:c', ns):
            value = cell.find('s:v', ns)
            if value is None:
                continue
            cells[cell.get('r')] = strings[int(value.text)] if cell.get('t') == 's' else Decimal(value.text)
        sheets[name] = cells

def amount(sheet, cell):
    return sheets[sheet].get(cell, Decimal(0))

def dollars(value):
    return float(value.quantize(Decimal('0.01')))

def same_money(actual, expected):
    assert abs(actual - expected) < Decimal('0.005'), (actual, expected)

data_path = root / 'site/data.json'
data = json.loads(data_path.read_text())
source_id = 'mill-history-20261022'
local = 'sources/school-funding-historicals-2026-10-22.xlsx'
shutil.copyfile(source, root / 'site' / local)
data['sources'][source_id] = {
    'title': 'City of Millington Funding to MMSD FY15–26 · October 22 workbook',
    'url': local, 'local': local, 'accessed': '2026-10-22',
    'detail': 'City-supplied School Funding_Historicals_ac(1).xlsx. Final rows 3–14 and the FY26 Misc, FY25Misc and FY24Misc tabs. Annual reported totals include mixed-drink tax and miscellaneous direct and indirect support. Blank component cells mean no amount listed, not proof that no payment occurred. Capital includes City-arranged financing with repayment responsibility varying by project. See the City records notes for formula reconciliation and the FY2018 settlement discrepancy.'
}
misc_tabs = {2026: ('FY26 Misc', 17), 2025: ('FY25Misc', 13), 2024: ('FY24Misc', 10)}
for row in range(3, 15):
    year = 2000 + int(amount('Final', f'A{row}'))
    entry = next(item for item in data['ledger'] if item['year'] == year)
    components = {'operating': 'C', 'settlement': 'D', 'mixedDrinkTax': 'E', 'miscellaneous': 'F', 'capital': 'G'}
    exact = {key: amount('Final', f'{column}{row}') for key, column in components.items()}
    exact['startup'] = Decimal(2100000) if year == 2015 else Decimal(0)
    subtotal = sum(exact[key] for key in ['operating', 'settlement', 'capital', 'startup'])
    total = sum(exact.values())
    same_money(total, amount('Final', f'B{row}'))
    entry.update({key: dollars(value) for key, value in exact.items()})
    entry.update(subtotal=dollars(subtotal), reportedTotal=dollars(total), basis='City reported', source=source_id)
    entry['sourceCells'] = {key: f'Final!{column}{row}' for key, column in components.items()}
    entry['sourceCells'].update(startup='Final!B14/H14' if year == 2015 else None, reportedTotal=f'Final!B{row}')
    entry['unlistedComponents'] = [key for key, column in components.items() if f'{column}{row}' not in sheets['Final']]
    descriptions = {2016: 'High School Annex', 2017: 'Wilkinsville/schools drainage improvements', 2024: 'General CIP support', 2026: 'Deferred maintenance: parking lots'}
    entry['capitalDescription'] = descriptions.get(year, 'No capital amount listed')
    entry['miscItems'] = []
    if year in misc_tabs:
        tab, total_row = misc_tabs[year]
        for detail_row in range(3, total_row):
            if f'A{detail_row}' in sheets[tab]:
                entry['miscItems'].append({'amount': dollars(amount(tab, f'A{detail_row}')), 'description': sheets[tab][f'B{detail_row}'].strip(), 'cell': f"'{tab}'!A{detail_row}"})
        detail_total = sum(Decimal(str(item['amount'])) for item in entry['miscItems'])
        same_money(detail_total, exact['miscellaneous'])
        same_money(detail_total, amount(tab, f'A{total_row}'))
    entry['note'] = f'FY{year}: Reported support includes mixed-drink tax and the listed miscellaneous items. Amounts are City-reported and may include services, in-kind support, opportunity costs and financing, not only cash transferred to MMSD.'
    if year == 2015:
        entry['note'] += ' The $2.1 million startup amount is counted once, separately from $24,562.22 in mixed-drink tax.'
    if year == 2017:
        entry['note'] += ' The updated drainage amount is $695,371.53.'
    if year == 2018:
        entry['note'] += ' The updated workbook leaves settlement/OPEB blank. The prior schedule listed $230,219. This view follows the updated workbook and does not establish whether that installment was paid or its funding source.'
    if year == 2024:
        entry['note'] += ' The miscellaneous tab separately lists $30,000 in IT services from MMSD to the City. This reverse-direction service is not added to City support or netted against it.'
    if year == 2025:
        entry['note'] += ' Miscellaneous support includes a $95,000 Sandusky building opportunity-cost valuation, not a cash transfer.'

historical = [item for item in data['ledger'] if 2015 <= item['year'] <= 2026]
data['citySupportTotal'] = dollars(sum(Decimal(str(item['subtotal'])) for item in historical))
data['cityReportedSupportTotal'] = dollars(sum(Decimal(str(item['reportedTotal'])) for item in historical))
same_money(Decimal(str(data['cityReportedSupportTotal'])), amount('Final', 'B15'))
capital_total = sum(Decimal(str(item['capital'])) for item in historical)
direct_reported = amount('Final', 'C19')
direct_reconciled = sum(amount('Final', cell) for cell in ['C15', 'D15', 'E15', 'G3', 'G5', 'G13']) + Decimal(2100000)
data['cityHistoryReconciliation'] = {
    'source': source_id,
    'capitalReported': dollars(amount('Final', 'G15')),
    'capitalRecalculated': dollars(capital_total),
    'directTransferReported': dollars(direct_reported),
    'directTransferRecalculated': dollars(direct_reconciled),
    'notes': [
        'Final!B15, the $12,968,683.83 broad support total, reconciles to the annual reported totals in B3:B14.',
        'Final!G15 sums G4:G13 and omits the $250,000 FY2026 capital entry in G3. Annual capital entries total $2,295,371.53, rather than $2,045,371.53. The annual and broad support totals already include FY2026 capital.',
        'Final!C19 reports $11,900,380.52 as direct transfers but adds both all mixed-drink tax in E15 and the FY2015 total in B14, which already includes $24,562.22 of mixed-drink tax. Removing that duplication gives $11,875,818.30 under the workbook’s selected-category definition. This arithmetic does not independently verify the cash-transfer classification.',
        'Final!D11 is blank for FY2018 settlement/OPEB, whereas the prior schedule included $230,219. Current totals follow the updated workbook. Payment and funding-source reconciliation remains unresolved.',
        'The worksheet’s .15 contribution comparisons in columns I and J rely on an external workbook and are not used to determine a legal spending requirement or an amount owed.'
    ]
}
for record in data['records']:
    if record['district'] != '798' or not 2015 <= record['year'] <= 2026:
        continue
    for key in ['municipal', 'municipal_pp']:
        metric = record['metrics'].get(key)
        if not metric:
            continue
        metric['sources'] = list(dict.fromkeys([source_id] + [s for s in metric['sources'] if s != 'mill-history']))
        if record['year'] == 2015:
            metric['note'] = 'The updated City workbook lists zero in the maintenance-of-effort column and separately identifies $2.1 million in startup support. Startup funding is not reclassified as recurring operating support. The recurring comparison remains unverified.'
        if record['year'] == 2026:
            metric['basis'] = 'City reported'
            metric['note'] = 'Final!C3 in the October 22 City workbook reports $500,000 in maintenance of effort. Excludes capital, settlement/OPEB, startup, mixed-drink tax and miscellaneous services. City-reported history replaces the earlier budget forecast. It is not an independently audited payment total.'
data['sources']['mill-history-final']['title'] = 'City of Millington Funding to MMSD FY15–26 · prior historical schedule'
data['sources']['mill-history-final']['detail'] = 'Prior City-supplied PDF retained for comparison. Superseded for current City support figures by the October 22, 2026 workbook. It lists $662,348 for FY2017 drainage and $230,219 for FY2018 settlement/OPEB, which differ from the updated workbook.'
data['cityHistoryUpdated'] = '2026-10-22'
data['updated'] = '2026-10-22'
data['version'] = 3
data_path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({key: data[key] for key in ['citySupportTotal', 'cityReportedSupportTotal', 'cityHistoryReconciliation']}, indent=2))
