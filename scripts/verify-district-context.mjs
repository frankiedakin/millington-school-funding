import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DISTRICT_CONTEXT, districtContextDetails, metricContext} from '../site/district-context.js';

const data = JSON.parse(readFileSync('site/data.json','utf8'));
const results = JSON.parse(readFileSync('site/school-results-data.json','utf8'));
const get = (district,year,metric) => data.records.find(r=>r.district===district&&r.year===year).metrics[metric];
const spending = get('798',2025,'operating_pp');
const titleI = 932163; // FY2025 audit, printed page 75, Assistance Listing 84.010.
assert.equal(Math.round(titleI/spending.denominator),379);
const adjusted = (spending.numerator-titleI)/spending.denominator;
assert.equal(Math.round(adjusted),13818);
for (const district of ['793','794','795','796','797']) assert.ok(adjusted>get(district,2025,'operating_pp').value);

for (const [subject,metric] of [['ELA','tcap_ela'],['Math','tcap_math']]) {
  const values = (district,year) => results.municipalPeers.find(r=>r.district_code===district&&r.subject===subject+' - All Grades'&&Number(r.year)===year).proficient_pct;
  const gain = district => values(district,2026)-values(district,2021);
  for (const district of ['00793','00794','00795','00796','00797','00798']) {
    for (const year of [2021,2026]) assert.equal(values(district,year),get(String(Number(district)),year,metric).value);
    if (district!=='00798') {
      assert.ok(gain('00798')>gain(district),'Millington has the largest municipal gain');
      assert.ok(values('00798',2026)<values(district,2026),'Peer proficiency remains higher');
    }
  }
  let strongest = {grade:null,gain:-Infinity};
  for (let grade=3;grade<=8;grade++) {
    const rows=results.millington.filter(r=>r.subject===`${subject} - Grade ${grade}`);
    assert.deepEqual(rows.map(r=>Number(r.year)),[2021,2022,2023,2024,2025,2026]);
    const growth=parseFloat(rows.at(-1).display)-parseFloat(rows[0].display);
    assert.ok(growth>0,'Each grade improved over the full period');
    if(growth>strongest.gain)strongest={grade,gain:growth};
  }
  assert.equal(strongest.grade,3);
}

for(const note of DISTRICT_CONTEXT.notes){
  const rendered=districtContextDetails(note.id,'test');
  assert.doesNotMatch(rendered,/<details[^>]*\sopen(?:[\s=>])/);
  assert.ok(rendered.indexOf('School district context')<rendered.indexOf('Our note'));
}
for(const metric of ['municipal','municipal_pp','total_pp','growth','salary'])assert.equal(metricContext(metric),'','No unrelated or different-measure disclosures');
for(const metric of ['operating_pp','tcap_ela','tcap_math','enrollment'])assert.match(metricContext(metric),/District context/);
console.log('PASS: Title I subtraction, peer/grade gains against existing data, closed disclosures and measure scope.');
