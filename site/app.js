import { summarizeComparison } from './comparison-summary.js';
import { setupOverview } from './overview.js?v=tisa-20261018';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n, digits=0) => new Intl.NumberFormat('en-US',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
const fy = y => `FY${String(y).slice(-2)}`;
const yearText = y => `${fy(y)} · ${y-1}–${String(y).slice(-2)}`;
const META = {
 operating_pp:{title:'Operating spending per pupil',unit:'per enrolled pupil',type:'money',description:'All-source operating expenditures divided by same-year October 1 enrollment. Includes state, county, municipal and federal resources. Excludes capital and other non-operating categories in the state’s definition.'},
 municipal_pp:{title:'Municipal operating support per pupil',unit:'per enrolled pupil',type:'money',description:'Baseline municipal operating support divided by same-year enrollment. Capital, settlement/OPEB, debt service, tax pass-throughs and in-kind services are excluded. Inspect the basis: some primary records are budgets, others are actuals.'},
 municipal:{title:'Municipal operating support',unit:'annual baseline contribution',type:'money',description:'The municipality’s baseline operating support before capital, settlement/OPEB, debt service, mixed-drink tax and shared services. This is not all local funding. Tipton County is not a municipal district.'},
 total_pp:{title:'Total reported spending per pupil',unit:'per enrolled pupil',type:'money',description:'TDOE Table 49 grand total of all expenditures divided by same-year Table 51 enrollment. This broad measure includes capital and other non-operating outlays, which can create large year-to-year changes.'},
 enrollment:{title:'Enrollment',unit:'students · October 1 count',type:'number',description:'The October 1 district enrollment used in the state’s per-pupil expenditure table. This is not city population, funded average daily membership, or an end-of-year student count.'},
 fund_balance:{title:'Fund balance · ASR reported column',unit:'general purpose fund · reported column',type:'money',description:'The General Purpose “Fund Balance” column from TDOE Table 52, with separately reported reserves excluded. This exact state-reported measure is not total fund equity or unrestricted cash.'},
 fund_pp:{title:'Fund balance per pupil · ASR column',unit:'reported balance per enrolled pupil',type:'money',description:'The General Purpose “Fund Balance” column from TDOE Table 52 divided by same-year enrollment. Separately reported reserves are excluded. This is not unrestricted cash per pupil.'},
 salary:{title:'Starting salary · annual base',unit:'BA · zero experience · annual base',type:'money',description:'Regular teacher starting salary for a bachelor’s degree and zero experience. Excludes supplements and benefits. Annual schedules are shown with their known contract terms; unknown terms are not assumed to be 10 months.'},
 salary10:{title:'Starting salary · verified 10-month',unit:'BA · zero experience · 10-month contract',type:'money',description:'Only base salaries with verified 10-month contract evidence. These are already 10-month amounts, not annual pay multiplied by 10/12. Districts without verified terms remain unavailable.'},
 salary200:{title:'Starting salary · 200-day equivalent',unit:'BA · zero experience · 200 paid days',type:'money',description:'Annual base salary ÷ documented paid contract days × 200. Paid days may include holidays. Only schedules with verified days are included; this is an analytical equivalent, not an offered salary.'},
 graduation:{title:'Federal graduation rate',unit:'of the graduating cohort',type:'percent',description:'TDOE’s federal four-year graduation rate for All Students in the selected graduating cohort. State-defined graduation rates are not substituted. Suppressed values remain unavailable.'},
 growth:{title:'Academic growth · TVAAS',unit:'overall composite · scale of 1–5',type:'level',description:'One-year district overall TVAAS composite. Level 3 meets the growth standard. Levels are ordinal, not equal-sized learning gains. Growth is different from achievement or proficiency.'}
};
META.graduation_state={title:'Graduation rate · state/cohort series',unit:'of the graduating cohort',type:'percent',description:'The state’s published All Students cohort graduation rate. FY15–FY22 use the single rate in historical files. FY23 onward use the explicitly labelled state rate. This series is separate from the federal rate; requirements and pandemic waivers changed over time.'};
META.operating_pp.description='All-source operating expenditures divided by same-year October 1 enrollment. FY13–FY18 are recalculated from the older ASR operating totals and separately sourced K–12 enrollment. The operating-total definition changes in FY19, so changes across that boundary are not calculated.';
META.total_pp.description='The ASR Grand Total of All Expenditures divided by October 1 enrollment. Broad outlays include capital, debt and other non-operating categories. Historical school-level enrollment is aggregated for K–12, without using ADA as enrollment.';
META.enrollment.description='October 1 enrollment. FY13–FY18 sum unique K–12 school/grade rows in TDOE membership files, excluding pre-K. FY19 onward use the enrollment in the state expenditure table. This is not ADA, funded ADM, or city population.';
META.fund_balance.description='The exact General Purpose Fund Balance column in the ASR financial summary, excluding separately reported reserves. Table numbers and classifications change over time. Unresolved FY16 data are withheld. This is not audited unrestricted cash.';
META.fund_pp.description='The ASR General Purpose Fund Balance column divided by same-year October 1 enrollment. Separately reported reserves are excluded. Unresolved FY16 data are withheld.';
const ADMIN_SCOPE='Central administration covers board, superintendent, fiscal and human-resources functions. School administration covers principal offices. Central is part of the overall administration total, not additional. Instructional supervision and technology are separate functions.';
Object.assign(META,{
 admin_spending:{title:'Administration · total spending',unit:'central and school administrative functions',type:'money',description:'The ASR Support Services – Administration total. Includes salary, benefits, services and other costs. '+ADMIN_SCOPE},
 central_spending:{title:'Central administration · total spending',unit:'board · superintendent · finance · HR',type:'money',description:'Total expenditures assigned to four central administrative functions. This is a functional-account definition, not every employee or service housed in a central-office building. '+ADMIN_SCOPE},
 school_admin_spending:{title:'School administration · total spending',unit:'principal offices · all expenditure categories',type:'money',description:'Total expenditures for school administration, Office of the Principal. Includes principal/assistant principal salaries, other office staff, benefits and non-payroll costs. Central administrative functions are excluded.'},
 admin_pp:{title:'Administration · spending per pupil',unit:'central and school administration per pupil',type:'money',description:'The ASR administration expenditure total divided by same-year October 1 enrollment. '+ADMIN_SCOPE},
 central_pp:{title:'Central administration · spending per pupil',unit:'defined central functions per enrolled pupil',type:'money',description:'Board, superintendent, finance and HR expenditure totals divided by same-year October 1 enrollment. These functions exclude principal offices, instructional supervision and technology.'},
 admin_payroll:{title:'Administration · total payroll',unit:'central and school administrative salaries',type:'money',description:'Salary categories and career-program payments for central and school administration. Excludes benefits and other fixed charges. '+ADMIN_SCOPE},
 central_payroll:{title:'Central administration · payroll',unit:'board · superintendent · finance · HR salaries',type:'money',description:'Salary categories and career-program payments in four central administrative functions. Excludes benefits, principal offices, instructional supervision and technology. This is not a count of all staff located in the central office.'},
 school_admin_payroll:{title:'School administration · payroll',unit:'principal offices · salary categories',type:'money',description:'Principal/assistant principal salaries, career-program payments and other salaries in school administrative offices. Excludes benefits and central administration.'},
 teacher_payroll:{title:'Teachers · total payroll',unit:'teacher salaries and career-program payments',type:'money',description:'Teacher salaries and career-program payments in regular, alternative, special and career/technical instruction. Excludes other salaries, benefits, adult education and early childhood. Changes reflect both staffing and pay; they are not individual raise percentages.'},
 tcap_ela:{title:'TCAP ELA proficiency · grades 3–8',unit:'met or exceeded expectations · All Students',type:'percent',description:'Published combined proficiency percentage in standard grades 3–8 ELA tests (TNReady/ACH), All Students. EOC and alternate assessments are excluded. Earlier files say on-track/mastered. Grade mix, standards and pandemic participation affect historical interpretation. No spring FY2020 value is filled.'},
 tcap_math:{title:'TCAP math proficiency · grades 3–8',unit:'met or exceeded expectations · All Students',type:'percent',description:'Published combined proficiency percentage in standard grades 3–8 math tests (TNReady/ACH), All Students. EOC and alternate assessments are excluded. Earlier files say on-track/mastered. This is a proficiency measure, separate from TVAAS growth.'}
});
const colors=['#123e38','#3262a0','#8d6b43','#728994','#9b9270','#687e55','#989cae','#b78772','#9a5960','#665a91'];
let data, records, selected, state={metric:'operating_pp',year:2025,baseline:2024,view:'districts',ledger:2026,start:2013,end:2027};
let lastFocus, currentSummary;
const numeric = o => o && typeof o.value==='number' && Number.isFinite(o.value);
const currentDistricts=()=>data.districts.filter(d=>!d.historical);
const trendYears=()=>data.years.filter(y=>y>=state.start&&y<=state.end);
function visibleDistricts(){
 const ds=currentDistricts().filter(d=>selected.has(d.id));
 if(selected.has('792')&&(state.year===2013||state.baseline===2013||(state.view==='trend'&&state.start===2013)))ds.push(...data.districts.filter(d=>d.historical));
 return ds;
}
const districtName=(d,y=state.year)=>d.id==='792'&&y===2014?'Shelby · unified':d.name;
function comparable(a,b){return numeric(a)&&numeric(b)&&(!a.entityBasis||!b.entityBasis||a.entityBasis===b.entityBasis)&&(!a.definitionBasis||!b.definitionBasis||a.definitionBasis===b.definitionBasis);}
function observation(d,y,k=state.metric){
 const found=records.get(`${d}-${y}`)?.metrics[k];
 if(found)return found;
 let note='No verified observation in this snapshot for this district, year and measure.';
 if(y>=2026 && !k.startsWith('salary') && !k.startsWith('municipal') && !k.startsWith('tcap'))note='This snapshot includes state finance and outcome files through FY25. No later-year observation is substituted.';
 if(k==='municipal_pp' && y>=2026)note='A same-year October 1 enrollment denominator is not verified. The City contribution itself is shown under Municipal operating support and in the City support detail.';
 if(k==='salary10')note='The annual schedule or 10-month employment term has not been verified for this year. See annual base salary for any available published amount.';
 if(k==='salary200')note='Paid contract days have not been verified for this district and year. No day count is assumed.';
 if(k.startsWith('tcap'))note=y===2020?'Spring FY2020 assessments were waived. No proficiency value is imputed.':'This snapshot incorporates standard grades 3–8 TCAP proficiency for FY2019 and FY2021–FY2026 only.';
 if(k.startsWith('fund') && y===2023)note='A comparable Table 52 fund-balance record is not included in the FY23 source package used here.';
 return {value:null,status:'Unavailable',sources:[],note};
}
function display(n,k=state.metric,full=false){
 if(n===null||n===undefined||!Number.isFinite(n))return '—';
 const m=META[k];
 if(m.type==='percent')return `${fmt(n,1)}%`;
 if(m.type==='level')return `${fmt(n)} / 5`;
 return `${m.type==='money'?'$':''}${fmt(n,full&&m.type==='money'?2:0)}`;
}
function tick(n,k=state.metric){
 const type=META[k].type;
 if(type==='percent')return `${fmt(n)}%`;
 if(type==='level')return fmt(n);
 let v=n>=1e6?`${fmt(n/1e6,n%1e6?1:0)}M`:n>=1000?`${fmt(n/1000,n%1000?1:0)}k`:fmt(n);
 return `${type==='money'?'$':''}${v}`;
}
function delta(a,b,k=state.metric){
 if(!numeric(a)||!numeric(b))return '—';
 if(!comparable(a,b))return 'Not comparable';
 const diff=a.value-b.value,sign=diff>0?'+':diff<0?'−':'';
 if(META[k].type==='level')return diff===0?'No change':`${sign}${fmt(Math.abs(diff))} level${Math.abs(diff)!==1?'s':''}`;
 if(META[k].type==='percent')return `${sign}${fmt(Math.abs(diff),1)} pp`;
 return `${sign}${display(Math.abs(diff),k)}${b.value===0?'':` (${sign}${fmt(Math.abs(diff/b.value*100),1)}%)`}`;
}
function badge(o){return `<span class="badge ${o.status==='Sourced'?'sourced':o.status==='Calculated'?'calculated':o.status==='Estimate'?'estimate':'unverified'}">${esc(o.status)}</span>`;}
function basis(o){return o.basis||o.contract|| (o.status==='Suppressed'?'Suppressed by source':numeric(o)?'Reported actual':'');}
function saveState(){
 const q=new URLSearchParams({metric:state.metric,year:state.year,base:state.baseline||'none',districts:[...selected].join(','),view:state.view,from:state.start,to:state.end});
 history.replaceState(null,'',`${location.pathname}?${q}${location.hash}`);
}
function render(){
 const m=META[state.metric],ds=visibleDistricts(),tableDs=ds.filter(d=>!d.historical||state.year===2013||state.baseline===2013);
 $('#metric').value=state.metric;$('#year').value=state.year;$('#baseline').value=state.baseline;
 $('#left-year-heading').textContent=yearText(state.baseline);$('#right-year-heading').textContent=yearText(state.year);
 $('#trend-start').value=state.start;$('#trend-end').value=state.end;
 $('#year-label').textContent=`${yearText(state.baseline)} compared with ${yearText(state.year)}`;
 $('#metric-title').textContent=m.title;$('#definition').textContent=m.description;
 $('#history-note').hidden=!(state.year<=2015||state.baseline<=2015);
 document.querySelectorAll('[data-district]').forEach(b=>b.setAttribute('aria-pressed',selected.has(b.dataset.district)));
 $('#selected-count').textContent=`${selected.size-1} selected`;
 const notice=$('#special-notice');let msg='';
 if(state.metric.startsWith('fund'))msg='Reserves are separate and classifications differ. FY16 figures are withheld and FY23 records are unavailable. Millington FY24 needs reconciliation. These balances are not unrestricted cash.';
 else if(state.metric.startsWith('municipal'))msg='Recurring city operating support only. Budget, forecast and actual bases are shown. Memphis–Shelby and Tipton are county benchmarks, so this measure is not applicable. Millington’s additional FY26 $250,000 deferred-maintenance contribution is separate in City support.';
 else if(state.metric.includes('payroll'))msg='Salary expenditures only, excluding benefits. Central administration is included in overall administration. Changes can reflect headcount, job mix or coding as well as pay. Open figure details for every function and source cell.';
 else if(state.metric.startsWith('tcap'))msg='Standard grades 3–8 tests only. Proficiency and TVAAS growth are different measures. FY2020 is unavailable, and pandemic participation limits comparisons. These data do not isolate a funding effect.';
 else if(state.metric==='salary')msg='Contract lengths are not verified for every schedule. Choose “Starting salary · verified 10-month” for a stricter comparison.';
 notice.hidden=!msg;notice.textContent=msg;
 $('#comparison-rows').innerHTML=tableDs.map(d=>comparisonRow(d)).join('');
 const counts=[state.baseline,state.year].map(y=>`${fy(y)}: ${tableDs.filter(d=>numeric(observation(d.id,y))).length} of ${tableDs.length} displayed districts have a verified figure`);
 $('#comparison-coverage').textContent=counts.join(' · ')+'. Missing values are not zero. Dollars are nominal.';
 currentSummary=summarizeComparison({metric:state.metric,leftYear:state.baseline,rightYear:state.year,peers:currentDistricts().filter(d=>selected.has(d.id)),observation});
 $('#summary-title').textContent=currentSummary.title;$('#summary-body').textContent=currentSummary.body;
 $('#summary-context').textContent=currentSummary.context;
 $('#summary-period').textContent=`FY${Math.min(state.baseline,state.year)} to FY${Math.max(state.baseline,state.year)}`;
 renderSourceColumns(tableDs);
 if($('#history-panel').open)trend(ds);
 saveState();
}
function comparisonRow(d){
 const old=observation(d.id,state.baseline),now=observation(d.id,state.year);
 const changed=state.baseline===state.year?'Same year':delta(now,old);
 return `<section class="comparison-row ${d.id==='798'?'millington-row':''}" data-row="${d.id}" aria-label="${esc(d.name)}"><div class="row-heading"><h3>${esc(districtName(d))}${d.id==='798'?'<span class="focus-label">FOCUS</span>':''}</h3><span class="row-change">${changed==='—'?'Change unavailable':esc(changed)}${changed!=='—'&&changed!=='Not comparable'&&changed!=='Same year'?' · right vs left':''}</span></div>${[state.baseline,state.year].map((y,i)=>{
  const o=observation(d.id,y),first=(o.sources||[]).find(id=>data.sources[id]);
  return `<div class="comparison-cell ${i?'right-cell':'left-cell'}"><span class="sr-only">${yearText(y)} · </span><strong class="cell-value ${numeric(o)?'':'missing'}">${numeric(o)?display(o.value):esc(o.status)}</strong><div class="cell-meta">${numeric(o)?badge(o):''}<span>${esc(basis(o))}</span></div><div class="cell-links"><button class="evidence-link" data-evidence="${d.id}" data-year="${y}">Figure details ↗</button>${first?`<a class="document-link" href="${esc(data.sources[first].local||data.sources[first].url)}" target="_blank" rel="noopener noreferrer">Source document ↗</a>`:''}</div></div>`;
 }).join('')}</section>`;
}
function sourceLinks(s){
 const file=s.local||s.url,ext=/\.(pdf|xlsx?|csv|zip|txt)(?:[?#]|$)/i.exec(file)?.[1].toUpperCase();
 return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Open primary ${/\.zip(?:[?#]|$)/i.test(s.url)?'archive · ZIP':'source'} ↗</a>${s.local&&s.local!==s.url?`<a href="${esc(s.local)}" target="_blank" rel="noopener noreferrer">Open saved ${ext||'copy'} ↗</a>`:''}`;
}
function renderSourceColumns(ds){
 let total=0;
 $('#source-columns').innerHTML=[state.baseline,state.year].map(y=>{
  const entries=new Map();
  for(const d of ds)for(const id of new Set(observation(d.id,y).sources||[])){
   if(!data.sources[id])continue;
   if(!entries.has(id))entries.set(id,[]);entries.get(id).push(d.name);
  }
  total+=entries.size;
  return `<div class="source-year"><h3>${yearText(y)}</h3>${entries.size?[...entries].map(([id,names])=>{
   const s=data.sources[id];return `<article class="document-card"><p class="document-districts">${esc(names.join(' · '))}</p><h4>${esc(s.title)}</h4><p>${esc(s.detail||'Primary district or state record.')}</p><div class="document-actions">${sourceLinks(s)}</div></article>`;
  }).join(''):'<p class="source-help">No primary document is incorporated for these selected figures. Open “Figure details” to see the missing evidence.</p>'}</div>`;
 }).join('');
 $('#source-jump').textContent=`Source documents (${total}) ↓`;
}
function showSummaryEvidence(){
 const ids=new Set();
 const rows=[...new Set(currentSummary.evidence.map(e=>e.district))].map(id=>{
  const d=data.districts.find(d=>d.id===id);
  for(const y of [state.baseline,state.year])for(const sid of observation(id,y).sources||[])ids.add(sid);
  return comparisonRow(d);
 }).join('');
 openDialog(`<h2>Figures behind the summary</h2><p>${esc(currentSummary.context)}</p><div class="comparison-board"><div class="evidence-years"><strong>${yearText(state.baseline)}</strong><strong>${yearText(state.year)}</strong></div>${rows}</div><h3 class="evidence-documents">Primary documents</h3>${[...ids].map(sourceHtml).join('')}`);
}
function showSourceRegister(){
 openDialog('<h2>Find a source document</h2><p>Search district names, years, table numbers or document titles. ZIP archives contain the Excel tables named in each entry.</p><label for="source-search">Search the source register</label><input id="source-search" type="search" placeholder="Example: Millington 2025 or Table 51"><p id="source-results-count" role="status"></p><div id="source-results"></div>');
 const search=()=>{
  const words=$('#source-search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const ids=Object.keys(data.sources).filter(id=>{
   const doc=data.sources[id];let haystack=[id,doc.title,doc.detail].join(' ');
   for(const r of data.records)if(Object.values(r.metrics).some(o=>o.sources?.includes(id)))haystack+=' '+data.districts.find(d=>d.id===r.district)?.full+' '+r.year;
   return words.every(w=>haystack.toLowerCase().includes(w));
  });
  $('#source-results-count').textContent=`${ids.length} documents`;
  $('#source-results').innerHTML=ids.length?ids.map(sourceHtml).join(''):'<p>No matching document in this snapshot. Try a district name or year.</p>';
 };
 $('#source-search').addEventListener('input',search);search();$('#source-search').focus();
}
function chartDomain(values){
 const type=META[state.metric].type;
 if(type==='percent')return [0,100];if(type==='level')return [0,5];
 return [Math.min(0,...values)*1.08,Math.max(1,...values)*1.08];
}
function trend(ds){
 const years=trendYears(),all=ds.flatMap(d=>years.map(y=>observation(d.id,y))).filter(numeric);
 if(!all.length){$('#chart').innerHTML='<p class="empty">No verified values for the selected measure, years and districts.</p>';return;}
 const W=820,H=300,L=68,R=26,T=20,B=38,[min,max]=chartDomain(all.map(a=>a.value));
 const x=y=>years.length===1?(W+L-R)/2:L+(y-years[0])/(years.at(-1)-years[0])*(W-L-R),v=n=>H-B-(n-min)/(max-min)*(H-T-B);
 let svg=`<svg class="trend-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(META[state.metric].title)} from ${fy(state.start)} to ${fy(state.end)}">`;
 const ticks=META[state.metric].type==='level'?[0,1,2,3,4,5]:[0,1,2,3,4].map(i=>min+(max-min)*i/4);
 for(const n of ticks)svg+=`<line x1="${L}" x2="${W-R}" y1="${v(n)}" y2="${v(n)}" stroke="#e5ebe0"/><text x="${L-10}" y="${v(n)+4}" text-anchor="end" font-size="12" fill="#68776f">${tick(n)}</text>`;
 for(const y of years)svg+=`<text x="${x(y)}" y="${H-10}" text-anchor="middle" font-size="12" fill="#68776f">${fy(y)}</text>`;
 ds.forEach(d=>{
  const color=colors[data.districts.findIndex(a=>a.id===d.id)];let path='',prev=null;
  for(const y of years){const a=observation(d.id,y);if(!numeric(a)){prev=null;continue;}path+=`${prev&&comparable(a,prev)?'L':'M'}${x(y)},${v(a.value)} `;prev=a;}
  svg+=`<path data-series="${d.id}" d="${path}" fill="none" stroke="${color}" stroke-width="${d.id==='798'?3:1.8}"/>`;
  for(const y of years){const a=observation(d.id,y);if(!numeric(a))continue;svg+=`<circle class="trend-point" role="button" tabindex="0" aria-label="${esc(districtName(d,y))} ${fy(y)} ${esc(display(a.value))}, inspect evidence" data-evidence="${d.id}" data-year="${y}" cx="${x(y)}" cy="${v(a.value)}" r="${d.id==='798'?5:4}" fill="${color}" stroke="white" stroke-width="1.5"><title>${esc(districtName(d,y))} · ${fy(y)}: ${esc(display(a.value))}</title></circle>`;}
 });svg+='</svg>';
 $('#chart').innerHTML=`<div class="trend-scroll">${svg}</div><div class="trend-legend">${ds.map(d=>`<span><i style="background:${colors[data.districts.findIndex(a=>a.id===d.id)]}"></i>${esc(d.name)}</span>`).join('')}</div>`;
}
function sourceHtml(id){
 const s=data.sources[id];if(!s)return '';
 return `<div class="source-item"><h3>${esc(s.title)}</h3><p>${esc(s.detail||'Primary district or state data file.')}<br>Reviewed ${esc(s.accessed)}.</p>${sourceLinks(s)}</div>`;
}
function openDialog(html){lastFocus=document.activeElement;$('#evidence-content').innerHTML=html;if(!$('#evidence').open)$('#evidence').showModal();$('#close-dialog').focus();}
function showEvidence(d,y,k=state.metric){
 const district=data.districts.find(a=>a.id===d),a=observation(d,y,k),m=META[k];
 let formula='';
 if(a.components?.length)formula+=`<details open class="component-details"><summary>Source cells included in this figure</summary><div class="evidence-table-wrap"><table class="evidence-table"><thead><tr><th>Function and category</th><th>Cell</th><th>Amount</th></tr></thead><tbody>${a.components.map(c=>`<tr><td>${esc(c.function)} · ${esc(c.column)}</td><td>${esc(c.cell)}</td><td>$${fmt(c.value,2)}</td></tr>`).join('')}</tbody></table></div><p>Primary workbooks are linked below. ${a.numerator!==undefined?'These components form the numerator before dividing by enrollment.':'The included salary or spending cells sum to the displayed total.'}</p></details>`;
 if(a.numerator!==undefined)formula+=`<div class="formula"><strong>Calculation</strong><br>${display(a.numerator,k,true)} ÷ ${fmt(a.denominator)}${k==='salary200'?' × 200':''} = ${display(a.value,k,true)}</div>`;
 if(a.reserves!==undefined)formula+=`<div class="formula">Separately reported general-purpose reserves: <strong>$${fmt(a.reserves,2)}</strong>. These are excluded from this displayed fund-balance column. No claim about spendable or recurring resources is made.</div>`;
 openDialog(`<h2>${esc(districtName(district,y))}</h2><p>${yearText(y)} · ${esc(m.title)}</p><div class="big-value">${display(a.value,k,true)}</div>${badge(a)} ${a.basis?`<span class="badge estimate">${esc(a.basis)}</span>`:''}<p>${esc(a.note)}</p>${formula}${(a.sources||[]).map(sourceHtml).join('')}${!a.sources?.length?'<p>No primary source has been incorporated for this observation. This gap is intentional.</p>':''}`);
}
function renderLedger(){
 const l=data.ledger.find(x=>x.year===state.ledger);$('#ledger-year').value=state.ledger;
 const money=n=>n==null?'—':`$${fmt(n)}`;
 const items=[['MAINTENANCE OF EFFORT',l.operating,l.year===2015?'No MOE amount listed':'Baseline operating support'],['SETTLEMENT / OPEB',l.settlement,l.settlement==null?'Not established for this period':'Municipal schools settlement'],['CAPITAL SUPPORT',l.capital,l.capitalDescription],['STARTUP SUPPORT',l.startup,l.year===2015?'FY15 startup footnote':l.startup==null?'Not established for this period':'No startup amount listed']];
 $('#ledger-equation').innerHTML=items.map(([label,value,note])=>`<div class="ledger-box"><span class="label">${label}</span><strong>${money(value)}</strong><small>${esc(note)}</small></div>`).join('')+`<div class="ledger-box total"><span class="label">${l.year===2027?'OPERATING + CAPITAL BUDGET':'INCLUDED SUPPORT SUBTOTAL'}</span><strong>${money(l.subtotal)}</strong><small>${fy(l.year)} · ${esc(l.basis)}</small></div>`;
 $('#ledger-note').textContent=l.note;
 $('#city-support-total').textContent=`FY2015–FY2026 included support: ${money(data.citySupportTotal)}. Calculated from the annual components, excluding mixed drink tax and miscellaneous items.`;
}
function exportCsv(history=false){
 const ds=visibleDistricts().filter(d=>history||!d.historical||state.year===2013||state.baseline===2013),years=history?trendYears():[state.year];
 const header=['district','fiscal_year','school_year','metric','value','evidence_status','financial_or_contract_basis','entity_basis','definition_basis','comparison_fiscal_year','comparison_value','comparison_status','comparison_basis','comparison_allowed','absolute_change','numerator','denominator','separate_asr_reserves','definition_and_limitations','primary_sources','comparison_sources','snapshot_date'];
 const lines=[header];
 for(const y of years)for(const d of ds){
  const a=observation(d.id,y),b=observation(d.id,state.baseline),urls=o=>(o.sources||[]).map(id=>new URL(data.sources[id].url,location.href).href).join(' | ');
  lines.push([d.full,y,`${y-1}-${String(y).slice(-2)}`,META[state.metric].title,a.value??'',a.status,basis(a),a.entityBasis||'',a.definitionBasis||'',state.baseline||'',state.baseline?(b.value??''):'',state.baseline?b.status:'',state.baseline?basis(b):'',state.baseline&&comparable(a,b)?'yes':'no',state.baseline&&comparable(a,b)?a.value-b.value:'',a.numerator??'',a.denominator??'',a.reserves??'',META[state.metric].description+' '+a.note,urls(a),state.baseline?urls(b):'',data.updated]);
 }
 const csv='\ufeff'+lines.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`millington-${state.metric}-${history?fy(state.start)+'-'+fy(state.end):fy(state.baseline)+'-'+fy(state.year)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Comparison exported with sources and definitions.');
}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3000);}
async function init(){
 try{
  const r=await fetch('data.json');if(!r.ok)throw new Error('Research data could not be loaded.');data=await r.json();records=new Map(data.records.map(r=>[`${r.district}-${r.year}`,r]));selected=new Set(currentDistricts().map(d=>d.id));
  const q=new URLSearchParams(location.search);if(META[q.get('metric')])state.metric=q.get('metric');
  if(data.years.includes(Number(q.get('year'))))state.year=Number(q.get('year'));
  if(data.years.includes(Number(q.get('base'))))state.baseline=Number(q.get('base'));
  if(q.get('view')==='trend')state.view='trend';
  if(data.years.includes(Number(q.get('from'))))state.start=Number(q.get('from'));if(data.years.includes(Number(q.get('to'))))state.end=Number(q.get('to'));if(state.end<state.start)state.end=state.start;
  if(q.has('districts'))selected=new Set(q.get('districts').split(',').filter(id=>currentDistricts().some(d=>d.id===id)));
  const options=data.years.map(y=>`<option value="${y}">${yearText(y)}</option>`).join('');const comparisonOptions=data.years.map(y=>`<option value="${y}">FY${y}</option>`).join('');$('#year').innerHTML=comparisonOptions;$('#baseline').innerHTML=comparisonOptions;$('#ledger-year').innerHTML=options;$('#trend-start').innerHTML=options;$('#trend-end').innerHTML=options;
  selected.add('798');
  $('#districts').innerHTML=currentDistricts().map(d=>`<button class="chip" ${d.id==='798'?'disabled':''} data-district="${d.id}" aria-pressed="true" title="${esc(d.full)}">${esc(d.name)}</button>`).join('');
  $('#coverage-note').textContent=data.coverageNote;
  $('#metric').addEventListener('change',e=>{state.metric=e.target.value;render();});
  $('#year').addEventListener('change',e=>{state.year=Number(e.target.value);render();});
  $('#baseline').addEventListener('change',e=>{state.baseline=Number(e.target.value);render();});
  $('#districts').addEventListener('click',e=>{const b=e.target.closest('[data-district]');if(!b)return;selected.has(b.dataset.district)?selected.delete(b.dataset.district):selected.add(b.dataset.district);render();});
  $('#history-panel').open=state.view==='trend';
  $('#history-panel').addEventListener('toggle',()=>{state.view=$('#history-panel').open?'trend':'districts';render();});
  $('#reset').addEventListener('click',()=>{state={...state,metric:'operating_pp',year:2025,baseline:2024,view:'districts',start:2013,end:2027};selected=new Set(currentDistricts().map(d=>d.id));$('#history-panel').open=false;render();});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-evidence]');if(b)showEvidence(b.dataset.evidence,Number(b.dataset.year),b.dataset.metric||state.metric);});
  document.addEventListener('keydown',e=>{if(e.target.matches('.trend-point')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showEvidence(e.target.dataset.evidence,Number(e.target.dataset.year),e.target.dataset.metric||state.metric);}});
  $('#summary-evidence').addEventListener('click',showSummaryEvidence);
  $('#close-dialog').addEventListener('click',()=>$('#evidence').close());$('#evidence').addEventListener('close',()=>lastFocus?.focus());
  $('#evidence').addEventListener('click',e=>{if(e.target===$('#evidence')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#ledger-year').addEventListener('change',e=>{state.ledger=Number(e.target.value);renderLedger();});
  $('#ledger-source').addEventListener('click',()=>openDialog(`<h2>Millington’s contributions</h2><p>FY2015–FY2026 includes maintenance of effort, municipal schools settlement (OPEB), capital funds and the FY2015 startup contribution. Mixed drink tax and miscellaneous items are excluded.</p>${sourceHtml('mill-history-final')}<p>Totals are recalculated from annual entries. The printed total row in the supplied schedule does not reconcile with those entries. Capital financing is included as reported; the source states that repayment responsibility is assigned to the schools or the City depending on the project. These figures are not a measure of the City’s net debt burden.</p><p>FY2027 remains a separate operating-and-capital budget subtotal from the adopted budget, outside the historical schedule. Do not add City contributions to district spending, which already reflects use of district resources.</p>${sourceHtml('mill-city')}`));
  $('#all-sources').addEventListener('click',showSourceRegister);
  $('#trend-start').addEventListener('change',e=>{state.start=Number(e.target.value);if(state.end<state.start)state.end=state.start;render();});
  $('#trend-end').addEventListener('change',e=>{state.end=Number(e.target.value);if(state.start>state.end)state.start=state.end;render();});
  $('#history-source').addEventListener('click',()=>openDialog('<h2>District history</h2><p>'+esc(data.history.note)+'</p>'+sourceHtml('district-history')+sourceHtml('merger-fy13')));
  setupOverview({data,observation,sourceHtml,openDialog,explore:(metric,baseline,year)=>{state.metric=metric;state.baseline=baseline;state.year=year;state.start=Math.min(baseline,year);state.end=Math.max(baseline,year);selected=new Set(currentDistricts().map(d=>d.id));render();$('#comparison-tool').scrollIntoView({behavior:'smooth'});}});
  $('#export').disabled=false;$('#export').addEventListener('click',()=>exportCsv(false));$('#export-history').addEventListener('click',()=>exportCsv(true));render();renderLedger();
 }catch(e){$('#load-error').hidden=false;$('#load-error').textContent='The research snapshot could not load. Please reload this page. '+e.message;console.error(e);}
}
init();
