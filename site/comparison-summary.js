// AI-authored narrative patterns, filled from the reviewed snapshot in the browser.
// No live model call, hidden estimates, or unsupported historical turning points.
const valid = o => o && Number.isFinite(o.value);
const median = values => { const a=[...values].sort((a,b)=>a-b), i=Math.floor(a.length/2); return a.length%2?a[i]:(a[i-1]+a[i])/2; };
const number = (v,d=0) => new Intl.NumberFormat('en-US',{maximumFractionDigits:d,minimumFractionDigits:d}).format(v);
const year = y => `FY${y}`;
const close = (a,b) => Math.abs(a-b)<0.005;
const compatible = (a,b) => valid(a)&&valid(b)&&(!a.entityBasis||!b.entityBasis||a.entityBasis===b.entityBasis)&&(!a.definitionBasis||!b.definitionBasis||a.definitionBasis===b.definitionBasis);

export function summarizeComparison({metric,leftYear,rightYear,peers,observation}) {
 const first=Math.min(leftYear,rightYear),last=Math.max(leftYear,rightYear);
 const a=observation('798',first,metric), b=observation('798',last,metric);
 const percent=(metric.startsWith('graduation')||metric.startsWith('tcap')), money=!['enrollment','growth'].includes(metric)&&!percent;
 const value=v=>percent?`${number(v,1)}%`:metric==='growth'?`level ${number(v)}`:`${money?'$':''}${number(v)}`;
 const result={title:'',body:'',context:'',peerIds:[],evidence:[{district:'798',year:first},{district:'798',year:last}]};
 const periods=`${year(first)} to ${year(last)}`;
 if(!valid(a)||!valid(b)){
  result.title=first<2015?'Millington was not yet a separate district for the full comparison.':'The evidence is incomplete for Millington in these years.';
  result.body=[...new Set([first,last])].map(y=>{const o=observation('798',y,metric);return `${year(y)}: ${valid(o)?value(o.value):o.status.toLowerCase()}.`;}).join(' ');
  result.context=first<2015?'Millington Municipal Schools began operating in FY2015. Earlier predecessor records are shown separately. Missing figures are never treated as zero.':metric==='salary10'||metric==='salary200'?'Verified contract terms are required here. An annual salary may be available under “Starting salary · annual base.”':'Without verified values for both years, this view cannot establish a rise, a decline, or when Millington began to fall behind.';
  return result;
 }
 if(!compatible(a,b)){
  result.title='This comparison cannot establish whether Millington fell behind.';
  result.body=`The records show ${value(a.value)} in ${year(first)} and ${value(b.value)} in ${year(last)}, but the state’s operating-spending definition changed in FY2019. A like-for-like change cannot be calculated across that break.`;
  result.context='Compare two years before FY2019 or two years from FY2019 onward. Total reported spending is a separate, broader measure that includes capital and other non-operating outlays.';
  return result;
 }
 if(first===last){result.title='Both columns show the same year.';result.body=`Millington’s recorded figure is ${value(a.value)} in ${year(first)}. Choose a different year in either column to see what changed.`;return result;}
 const diff=b.value-a.value, flat=close(a.value,b.value), verb=flat?'stayed flat':diff>0?'rose':'fell';
 const change=percent?`${number(Math.abs(diff),1)} percentage points`:metric==='growth'?`${number(Math.abs(diff))} reported level${Math.abs(diff)===1?'':'s'}`:`${value(Math.abs(diff))}${a.value>0?` (${number(Math.abs(diff/a.value)*100,1)}%)`:''}`;
 const labels={operating_pp:'operating spending per pupil',total_pp:'total reported spending per pupil',municipal:'recurring city operating support',municipal_pp:'city operating support per pupil',enrollment:'enrollment',fund_balance:'reported fund balance',fund_pp:'reported fund balance per pupil',salary:'published annual starting salary',salary10:'verified 10-month starting salary',salary200:'starting salary on a 200-day basis',graduation:'federal graduation rate',graduation_state:'state/cohort graduation rate',growth:'reported TVAAS growth level',admin_spending:'administrative spending',central_spending:'central administrative spending',school_admin_spending:'school administrative spending',admin_pp:'administrative spending per pupil',central_pp:'central administrative spending per pupil',admin_payroll:'combined administrative payroll',central_payroll:'central administrative payroll',school_admin_payroll:'school administrative payroll',teacher_payroll:'teacher payroll',tcap_ela:'grades 3–8 ELA proficiency rate',tcap_math:'grades 3–8 math proficiency rate'};
 result.title=`Millington’s ${labels[metric]} ${verb}.`;
 result.body=`From ${periods}, Millington’s figure ${flat?`remained at ${value(a.value)}`:`${diff>0?'increased':'decreased'} from ${value(a.value)} to ${value(b.value)}, a change of ${change}`}.`;
 if(metric==='enrollment'){
  result.title=flat?'Millington’s enrollment was unchanged.':`Millington had ${number(Math.abs(diff))} ${diff>0?'more':'fewer'} students.`;
  result.context='These are October 1 counts. Enrollment changes can affect per-pupil figures even when the funding amount is unchanged.';
 } else if(metric==='growth'){
  result.context='TVAAS levels are ordered categories, not equal-sized learning gains. Level 3 meets the growth standard. This comparison does not identify a funding effect.';
 } else if(metric.startsWith('fund')){
  if(first===2024||last===2024)result.title='The reported balance changed, but FY2024 needs reconciliation.';
  result.context=(first===2024||last===2024?'Millington’s FY2024 source row has reconciliation inconsistencies. ':'')+'The ASR fund-balance column excludes separately reported reserves. It does not establish available cash, recurring funding, or raise capacity.';
 } else if(metric==='salary'){
  const termsKnown=Number.isFinite(a.months)&&a.months===b.months;
  result.context=termsKnown?'These are published base salaries before benefits or supplements. Paid days and daily hours can still differ.':'Contract terms are not verified consistently across these records. A change in published annual pay does not establish a change on a comparable contract basis.';
 } else if(metric.startsWith('municipal')){
  result.context=`The records are labelled ${a.basis||'reported'} in ${year(first)} and ${b.basis||'reported'} in ${year(last)}. Capital and other city support are separate. County systems have no comparable municipal contribution in this measure.`;
  if(metric==='municipal_pp'&&Number.isFinite(a.numerator)&&Number.isFinite(b.numerator)&&close(a.numerator,b.numerator)&&a.denominator!==b.denominator){
   result.title=`Millington’s support per pupil ${verb} as enrollment ${b.denominator>a.denominator?'grew':'fell'}.`;
   result.body+=` The operating contribution stayed at $${number(a.numerator)}; the denominator changed from ${number(a.denominator)} to ${number(b.denominator)} students.`;
  }
  if(first<=2026&&last>=2026)result.context+=' FY2026 also includes the additional $250,000 deferred-maintenance contribution, shown separately in City support.';
 } else if(metric==='total_pp')result.context='Capital, debt and other non-operating outlays can drive this measure. Higher total spending alone does not establish stronger recurring school funding.';
 else if(metric.includes('payroll'))result.context='These are nominal salary expenditures, excluding benefits. Changes can reflect staff numbers, job mix and accounting classifications as well as pay. Central administration covers board, superintendent, fiscal and HR functions and is included in overall administration. Teacher payroll covers teacher salary and career-payment categories in regular, alternative, special and career/technical instruction. These are not individual raise percentages.';
 else if(metric.startsWith('tcap'))result.context='These are standard grades 3–8 tests, All Students. Grade composition, standards and participation vary. FY2020 assessments were waived and FY2021 participation was affected by the pandemic. The figures do not establish that spending caused an outcome.';
 else if(percent)result.context='Different cohorts, student populations and graduation rules limit interpretation. This comparison does not show that funding caused the change.';
 else result.context='These are nominal dollars, without an inflation adjustment. Spending is not a direct measure of school quality or a funding cause of student outcomes.';

 // Use one fixed set of peers across both years. Do not compare budgets with
 // actuals, unknown contracts, reserve classifications, or ordinal growth levels.
 const eligible=['operating_pp','total_pp','salary10','salary200','graduation','graduation_state','tcap_ela','tcap_math','admin_pp','central_pp'].includes(metric);
 const matched=eligible?peers.filter(d=>d.id!=='798'&&!d.historical).filter(d=>{
  const p=observation(d.id,first,metric),q=observation(d.id,last,metric);
  return compatible(p,q)&&compatible(a,p)&&compatible(b,q);
 }):[];
 if(matched.length){
  result.peerIds=matched.map(d=>d.id);
  const early=median(matched.map(d=>observation(d.id,first,metric).value)),late=median(matched.map(d=>observation(d.id,last,metric).value));
  const before=a.value-early,after=b.value-late, gap=after-before;
  const benchmark=matched.length===1?matched[0].name:`the median of ${matched.length} selected peers`;
  result.body+=` Against ${benchmark}, Millington was ${close(before,0)?'level':`${value(Math.abs(before))}${percent?' percentage-point gap':''} ${before>0?'above':'below'}`} in ${year(first)} and ${close(after,0)?'level':`${value(Math.abs(after))}${percent?' percentage-point gap':''} ${after>0?'above':'below'}`} in ${year(last)}.`;
  // Percentage-point differences must not be written as percent rates.
  if(percent)result.body=result.body.replace(/([\d,.]+)% percentage-point gap/g,'$1 percentage points');
  if(['operating_pp','salary10','salary200'].includes(metric)&&matched.length>=2){
   const subject=metric==='operating_pp'?'spending per pupil':'starting pay';
   if(before>=0&&after<0)result.title=`Millington’s ${subject} moved below the selected peer median.`;
   else if(before<0&&after>=0)result.title=`Millington’s ${subject} reached or moved above the selected peer median.`;
   else if(before<0&&after<0&&!close(gap,0))result.title=`Millington’s ${subject} ${gap<0?'fell further behind':'narrowed the gap with'} the selected peer median.`;
   else if(before>0&&after>0&&!close(gap,0))result.title=`Millington’s ${subject} remained above the selected peer median, with a ${gap>0?'wider':'narrower'} gap.`;
  }
  result.context+=` The same ${matched.length} peer district${matched.length===1?' is':'s are'} used in both years: ${matched.map(d=>d.name).join(', ')}. Other selected peers with missing or incompatible records are excluded from this summary.`;
  for(const d of matched)for(const y of [first,last])result.evidence.push({district:d.id,year:y});
 } else if(eligible)result.context+=' No selected peer has compatible figures for both years, so no relative-position conclusion is made.';
 return result;
}
