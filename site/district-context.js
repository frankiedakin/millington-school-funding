export const DISTRICT_CONTEXT = {
  "reviewedAt": "2026-11-02",
  "attribution": "Millington Municipal Schools’ “Clarifying Context About Our Schools” graphic and accompanying Facebook statement, supplied for this review. Wording is reproduced as supplied. Paragraph layout and emphasis are adapted. The original publication date and post URL have not been independently confirmed.",
  "notes": [
    {
      "id": "funding",
      "number": 1,
      "title": "Funding and student needs",
      "district": [
        "Millington receives a higher rate of Title 1 funding per pupil because the percentage of students who qualify as economically disadvantaged (28%) is higher than any other municipality. Because of this, our overall student spending is higher.",
        "This funding is provided by the federal government."
      ],
      "note": "The FY2025 audit reports $932,163 in Title I spending, approximately $379 per pupil. Subtracting it would leave approximately $13,818 per pupil, still the highest among Shelby County’s six municipal districts. This calculation does not adjust for all differences in student needs.",
      "sources": [
        {
          "label": "FY2025 audit · Title I expenditures, printed page 75",
          "url": "https://files.smartsites.parentsquare.com/4664/2025-millington_municipal_schools_district_-_fs_single_audit_-_final_11626-1.pdf#page=80"
        },
        {
          "label": "Calculation and limits",
          "url": "school-context.html#funding-sources"
        }
      ]
    },
    {
      "id": "academic",
      "number": 2,
      "title": "Academic achievement",
      "district": [
        "Millington’s population needs are very different than other municipalities. Comparing their performance isn’t equitable and doesn’t consider the full context of factors that affect student performance.",
        "This being said, we have still improved dramatically. Third-grade reading proficiency has grown from 18.4% to 48%, while third-grade math proficiency has increased from 12.6% to 48% since 2020-21."
      ],
      "note": "Third grade was the strongest bright spot, but every grade from 3–8 improved in both subjects from 2021 to 2026. Millington’s gains for grades 3–8 combined exceeded all five municipal peers in both reading and math, although proficiency rates remained lower. These comparisons involve different students each year.",
      "sources": [
        {
          "label": "View full results by grade, year and municipal peer",
          "url": "school-results.html"
        },
        {
          "label": "Tennessee assessment dashboard",
          "url": "https://tdepublicschools.ondemand.sas.com/district/00798/assessment"
        }
      ]
    },
    {
      "id": "enrollment",
      "number": 3,
      "title": "Population and enrollment",
      "district": [
        "This does not account for how many new residents factored into this growth have children that are school age.",
        "In fact, according to recent projections made as part of our strategic plan, we are estimated to grow our student population by 4.6% by 2030."
      ],
      "note": "The district also serves the annexation reserve outside city limits, so city population and school enrollment cover different areas. Total growth does not establish school-age growth, and the district’s statement does not quantify those age changes. Its future forecast does not establish why past enrollment changed.",
      "sources": [
        {
          "label": "City Hall · district service area",
          "url": "https://www.millingtontn.gov/27/City-Hall"
        },
        {
          "label": "District strategic plan",
          "url": "https://files.smartsites.parentsquare.com/4664/five_year_strategic_plan_for_mmsd.pdf"
        },
        {
          "label": "Projection source note",
          "url": "school-context.html#enrollment-sources"
        }
      ]
    }
  ]
};

export function contextDisclosure(context, id, instance = 'context') {
  const n = context.notes.find(note => note.id === id);
  if (!n) return '';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<details class="district-context" id="${safe(instance)}-${n.id}"><summary>District context [${n.number}]<span class="sr-only">: ${safe(n.title)}</span></summary><div class="district-context-body"><p class="context-label">School district context · verbatim</p><blockquote>${n.district.map(p => `<p>${safe(p)}</p>`).join('')}</blockquote><div class="context-editor-note"><p class="context-label">Our note</p><p>${safe(n.note)}</p></div><div class="context-sources">${n.sources.map(s => `<a href="${safe(s.url)}">${safe(s.label)}</a>`).join(' · ')}</div><p class="context-attribution">From the district’s supplied factsheet. <a href="school-context.html#${n.id}">Statement, sources and link to this note</a>.</p></div></details>`;
}

export const districtContextDetails = (id, instance) => contextDisclosure(DISTRICT_CONTEXT, id, instance);
export function metricContext(metric) {
  const id = ({operating_pp:'funding',tcap_ela:'academic',tcap_math:'academic',enrollment:'enrollment'})[metric];
  return id ? districtContextDetails(id, 'comparison') : '';
}
