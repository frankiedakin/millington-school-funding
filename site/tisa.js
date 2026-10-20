// Targets: MMSD FY2026 TISA report, pp. 2, 4, 6, 8.
// Outcomes: MMSD FY2027 revised TISA report, pp. 2, 5, 7, 9.
// These are district-reported figures, not the site's separate grades 3–8 series.
export const TISA_SOURCES = {
  current: 'https://files.smartsites.parentsquare.com/4664/tisa_accountability_report_2026_revised.pdf',
  prior: 'https://files.smartsites.parentsquare.com/4664/tisa_accountability_report_24-25.pdf',
  district: 'https://millingtonschools.org/tisa-accountability'
};

export const TISA_GOALS = [
  {id: 2, name: 'ELA: grades 4–8 and English I & II', previous: 32.49, target: 37, actual: 31.36, status: 'Target missed', tone: 'concern', priorPage: 4, currentPage: 5},
  {id: 1, name: 'Third-grade ELA', previous: 36.7, target: 44.2, actual: 48.3, status: 'Target exceeded', tone: 'met', priorPage: 2, currentPage: 2},
  {id: 3, name: 'Math: grades 3–8, Algebra I & II, Geometry', previous: 28.49, target: 29, actual: 30.42, status: 'Target exceeded', tone: 'met', priorPage: 6, currentPage: 7},
  {id: 4, name: 'Ready Graduates', previous: 73.7, target: 60.8, actual: null, status: 'Not yet reported', tone: 'pending', priorPage: 8, currentPage: 9}
];

const number = value => new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(value);
const percent = value => value === null ? 'Not available' : number(value) + '%';
const docLink = (kind, page, label) => `<a href="${TISA_SOURCES[kind]}#page=${page}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only">, opens source report page ${page}</span></a>`;

export function tisaSection() {
  const ela = TISA_GOALS[0];
  const shortfall = number(ela.target - ela.actual);
  const decline = number(ela.previous - ela.actual);
  return `<section class="tisa-section" id="tisa-goals" aria-labelledby="tisa-title">
    <div class="tisa-heading"><p class="eyebrow">TISA GOALS & RESULTS · 2025–26</p><span class="tisa-date">District report revised October 6, 2026</span></div>
    <h2 id="tisa-title">ELA missed its annual target and moved backward.</h2>
    <p class="tisa-lead">For grades 4–8 and English I & II, proficiency fell from <strong>32.49% to 31.36%</strong>. The district's published target was <strong>37%</strong>. That shortfall deserves clear answers about what will change.</p>
    <dl class="tisa-scorecard">
      <div><dt>2025–26 result</dt><dd>31.36<span>%</span></dd></div>
      <div><dt>2025–26 target</dt><dd>37<span>%</span></dd></div>
      <div class="tisa-shortfall"><dt>Below the annual target</dt><dd>${shortfall}<span> percentage points</span></dd></div>
    </dl>
    <p class="tisa-trend">Down ${decline} percentage points from 2024–25. The longer-term goal is 41% by 2027–28, leaving a ${number(41 - ela.actual)}-point gap. That future deadline has not yet passed.</p>
    <div class="tisa-source-links">${docLink('prior',4,'Verify the 37% target ↗')}${docLink('current',5,'Verify the 31.36% result ↗')}</div>
    <h3>All four goals, not just the shortfall</h3>
    <p class="tisa-context">Two annual targets were exceeded, one was missed, and one result was unavailable in the revised report.</p>
    <div class="tisa-table-wrap" role="region" aria-label="TISA annual targets and outcomes" tabindex="0">
      <table class="tisa-table"><caption>Millington's published annual targets compared with its reported results</caption><thead><tr><th scope="col">Measure</th><th scope="col">2024–25 result</th><th scope="col">2025–26 target</th><th scope="col">2025–26 result</th><th scope="col">Annual status</th></tr></thead><tbody>
      ${TISA_GOALS.map(goal => `<tr class="tisa-row-${goal.tone}"><th scope="row">${goal.name}</th><td>${percent(goal.previous)}</td><td>${docLink('prior',goal.priorPage,percent(goal.target))}</td><td>${docLink('current',goal.currentPage,percent(goal.actual))}</td><td><span class="tisa-status tisa-status-${goal.tone}">${goal.status}</span></td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="tisa-notes"><p><strong>Third-grade reading:</strong> 48.3% exceeded the 44.2% annual target by 4.1 percentage points. The separate 70% goal is due in 2032, not 2026.</p><p><strong>Ready Graduates:</strong> 73.7% is the 2024–25 result. It is not a 2025–26 result and cannot establish whether the latest annual target was met.</p></div>
    <details class="tisa-details"><summary>District response, next milestones and source notes</summary>
      <p>The district says it will retain its overall ELA action plan while increasing instructional monitoring, collaboration and targeted support. It identifies grade 4, grade 6 and English I as areas without growth in 2025–26. ${docLink('current',5,'Read the district’s full response ↗')}</p>
      <p>The prior report lists ELA milestones of 39% for 2026–27 and 41% for 2027–28. The accountability question is what measurable changes will close the gap, and how progress will be reported. ${docLink('prior',4,'Read the published milestones ↗')}</p>
      <p><strong>Different measures:</strong> This TISA ELA measure combines grades 4–8 with English I and II. TISA math combines grades 3–8 with Algebra I, Algebra II and Geometry. Neither is interchangeable with the separate grades 3–8 comparison tool below.</p>
      <p><strong>Method:</strong> Annual targets come from the district's posted FY2026 TISA report. Actual outcomes and status come from its revised FY2027 report dated October 6, 2026. Percentage-point differences are subtraction, not percent changes. No unavailable result is treated as zero. Annual cohorts can differ. These figures alone do not establish a causal relationship between funding and achievement.</p>
      <p><a href="${TISA_SOURCES.district}" target="_blank" rel="noopener noreferrer">District TISA page and current publication status ↗</a></p>
    </details>
  </section>`;
}
