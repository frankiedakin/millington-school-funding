# Millington School Funding Explorer

Millington municipal school funding explainer.

Public site: https://pfams.anonai.workers.dev/

This project preserves the existing static website and its complete collection of linked source documents. The intended workflow is a branch, a pull request, review by Frankie, then a merge into `main`. Cloudflare Workers Builds publishes `main` after the connection below is configured.

## First-time setup

1. In your Cloudflare dashboard, select the existing `pfams` Worker, then **Settings > Builds > Connect**. Connect `frankiedakin/millington-school-funding`. Use the existing Worker so the public address stays the same.
2. Set the production branch to `main`, root directory to `/`, build command to `npm run check`, and deploy command to `npx wrangler deploy`. Dependency installation uses the committed package files. The configuration's Worker name is `pfams` and must match the dashboard.
3. If you want preview links on pull requests, enable preview builds and use `npx wrangler preview` for the preview command. This is separate from production deployment.
4. Check the initial build and the current public website. Once the TISA pull request is reviewed, merge it. Cloudflare will run the checks and publish that commit.

The repository contains the deployment configuration. The owner must complete the one-time GitHub connection in Cloudflare before commits can deploy automatically.

## Future changes

Ask for a change here. Changes should be pushed to a feature branch and opened as a pull request. Frankie reviews the preview and merges. No automatic PR merge is configured. GitHub Actions validates files and source links, while Cloudflare handles deployment through its native integration. Deployment credentials do not need to be copied into chat or this repository.

`main` is the publishing branch once the connection is enabled. Avoid direct content changes to `main`. Branch protection, where available on the account's plan, can enforce pull requests and the Website checks result. The repository owner's own review workflow should not require an impossible second approval.

## Project structure

- `site/`: public HTML, CSS, JavaScript, data and source documents.
- `scripts/check.mjs`: validation of required assets, research records and local source documents.
- `.github/workflows/check.yml`: checks for pull requests and pushes to `main`.
- `wrangler.jsonc`: deployment settings for the existing `pfams` Worker.
- `package-lock.json`: pinned deployment tool dependencies.

Only `site/` is published. Repository documentation and configuration are outside the public asset directory.

## Local checks

Use Node 22 or later. Run `npm run check`. To check Cloudflare configuration without publishing, install dependencies with `npm ci`, then run `npx wrangler deploy --dry-run`.

## October 31 historical funding update

The current source is the unchanged City PDF received October 31: `site/sources/school-funding-historicals-2026-10-31.pdf`. The ledger includes FY2016 drainage alongside FY2017 and reconciles to $13,315,717 in broad support and $2,642,405 in capital after rounding. The source's direct-transfer footer and blank FY2018 settlement remain explicitly qualified. See [source and calculation notes](SCHOOL-DATA-20261031.md).

The FY2025 per-pupil value is unchanged. A collapsed calculation beside it shows operating expenditures divided by October 1 enrollment, with the official report/archive and a saved extract linked.

To reproduce the current history, run the original importer below, then `python scripts/update-city-history-20261031.py`. The latter validates the exact revised PDF and applies the documented FY2016 addition.

## October 22 historical funding import (retained)

The source workbook is preserved at `site/sources/school-funding-historicals-2026-10-22.xlsx`. The City support section includes all annual categories and expandable miscellaneous detail. The recurring municipal comparison continues to exclude capital, settlement, startup, tax distributions and miscellaneous support.

`python3 scripts/import-city-history.py /absolute/path/to/School_Funding_Historicals.xlsx` reproduces this import for the October 22 workbook layout. It checks annual and miscellaneous sums before saving the data. Review source reconciliation notes in the City records dialog, especially the FY2018 blank settlement entry, the omitted FY2026 capital amount in the worksheet capital total, and the duplicated FY2015 mixed-drink tax in the direct-transfer calculation. The FY2027 budget remains separate. `npm run check` validates the historical totals and those distinctions.

## References

- [Connect an existing Worker](https://developers.cloudflare.com/workers/ci-cd/builds/#connect-an-existing-worker)
- [Cloudflare GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)
- [Production and preview branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)

Prepared October 19, 2026. Automated checks are available, but a browser layout review and actual Cloudflare build must still be completed before calling deployment verified.
