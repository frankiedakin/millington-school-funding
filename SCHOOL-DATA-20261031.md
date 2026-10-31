# October 31 school funding source and calculation update

The City supplied `School Funding_Historicals_ac-2(2).pdf` on October 31, 2026. It is published unchanged as `site/sources/school-funding-historicals-2026-10-31.pdf`, SHA-256 `d4d227e785c4dad70d1eaacc561897b71ed83603a29cff888b790c7541735b13` (281,176 bytes). Receipt date is not presented as the document's publication date.

## Historical support

- FY2016 adds $347,033 in Wilkinsville/schools drainage expenditure to the separate $1,000,000 High School Annex entry. The FY2016 financial report, printed page 80 / PDF page 90, shows $347,033 in the Actual Amounts column: https://www.millingtontn.gov/DocumentCenter/View/2215#page=90.
- FY2017 retains $695,371.53 from the prior workbook, displayed as $695,372 in the PDF. The two-year drainage sum is approximately $1,042,405. Do not substitute the earlier $1,045,000 narrative for the documented sum.
- Broad FY2015–FY2026 support is $13,315,716.83, displayed in the PDF as $13,315,717. Capital totals $2,642,404.53, displayed as $2,642,405. Unchanged cents are retained from the preserved October 22 workbook; the added FY2016 amount is only supported to whole-dollar precision.
- The PDF's $11,900,381 direct-transfer footer still matches the original workbook's $11,900,380.52 formula result, which double-counted FY2015 mixed-drink tax. Deduplicating $24,562.22 gives $11,875,818.30 under the original selected-category definition. The new drainage amount is excluded from this subtotal. The revised PDF does not expose formulas. This calculation is not an independent audit of cash-transfer classifications.
- FY2018 settlement/OPEB remains unlisted. The prior schedule and City response included $230,219. A blank does not prove that no payment occurred. No amount is restored without supporting reconciliation.
- Existing noncash, financing, statutory-distribution and reverse-direction IT-service qualifications remain. FY2027 is still a separate budget. Recurring operating support, all state-record observations, rankings and school-performance comparisons are unchanged.

The original October 22 workbook and earlier PDF remain available. `python scripts/update-city-history-20261031.py` reapplies the reviewed revision after the existing October 22 import, validates the final PDF hash and annual rounding, and produces the updated ledger idempotently. The original importer alone represents the October 22 snapshot.

## Per-pupil calculation

The displayed FY2025 figure remains $14,197: $34,939,339.27 in all-source operating expenditures divided by 2,461 students (October 1, 2024 enrollment). Capital and other non-operating categories are excluded under the state definition. City support history is a separate measure, not this numerator.

- Official report page: https://www.tn.gov/education/districts/federal-programs-and-oversight/data/department-reports/2025-annual-statistical-report.html
- Original Excel archive: https://www.tn.gov/content/dam/tn/education/documents/asr/2024-25_ASR_Excel.zip
- Original file reference: `Excel/TABLE 51 24-25.xlsx`, Table 51, Millington row 125.
- Saved reviewed inputs: `site/sources/millington-operating-spending-fy2025.json`. This is an extract, not a copy of the state workbook.

The official report page and archive link were relocated October 31. The archive could not be downloaded for a fresh workbook review. The saved values were checked against the existing reviewed dataset and their arithmetic recomputed. This limitation is disclosed next to the extract.

## Validation

Run `npm run check` for source assets, the existing TISA checks, annual/category totals, exclusion of drainage from direct transfers, the unchanged PDF hash and the per-pupil disclosure. Review the diff to confirm the state-record time series and overview statistics are unchanged. Production deployment remains subject to the owner's PR review and merge.

Completed: `npm run check` passed; the updater produced identical data on a second run; all state-record observations and overview statistics matched the base revision. Browser review confirmed the calculation disclosure opens and the revised schedule link and support total render. No styling changes were made.
