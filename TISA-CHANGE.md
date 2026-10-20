# Replace the payroll-growth feature with TISA accountability

## Purpose

Give the district's missed ELA target prominence on the funding website, while showing all four goals accurately and retaining the existing financial comparisons and source records.

## Changes for review

- Replace the featured administrative payroll-growth card and historical chart with a prominent TISA section.
- Lead with grades 4–8 and English I/II proficiency: 31.36% against the published 37% target for 2025–26. The shortfall is 5.64 percentage points, and the result declined 1.13 points from 32.49% in 2024–25.
- Show the full results: two annual targets exceeded, one missed, and Ready Graduates not yet reported for 2025–26.
- Distinguish future goals from missed annual targets. The 41% ELA milestone is due in 2027–28, and third-grade reading's 70% goal is due in 2032.
- Link each target and outcome to the relevant PDF page, and include the district response and differences from the separate grades 3–8 TCAP comparison.
- Add a TISA navigation link and refresh asset versions.

The underlying financial dataset and all original source documents are unchanged.

## Evidence

- Annual targets: https://files.smartsites.parentsquare.com/4664/tisa_accountability_report_24-25.pdf (pages 2, 4, 6, 8).
- Reported outcomes: https://files.smartsites.parentsquare.com/4664/tisa_accountability_report_2026_revised.pdf (pages 2, 5, 7, 9).
- District publication page: https://millingtonschools.org/tisa-accountability.

## Verification

`npm run check` passed, including all 128 local source documents and the TISA arithmetic, goal statuses and retained evidence views. `npx wrangler deploy --dry-run` successfully read all 137 public assets. No live deployment occurred. Browser layout review and an actual connected Cloudflare build remain to be completed.

## Publishing

Open this branch as a pull request against `main`. Frankie reviews and merges. Once the existing `pfams` Worker is connected to this repository, merging to `main` triggers its normal Cloudflare build and deployment.
