import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TISA_GOALS, TISA_SOURCES, tisaSection} from '../site/tisa.js';
import {setupOverview} from '../site/overview.js';

assert.equal(TISA_GOALS.length,4);
assert.equal(TISA_GOALS.filter(g=>g.status==='Target exceeded').length,2);
assert.equal(TISA_GOALS.filter(g=>g.status==='Target missed').length,1);
assert.equal(TISA_GOALS.filter(g=>g.actual===null).length,1);
assert.equal(Number((TISA_GOALS[0].target-TISA_GOALS[0].actual).toFixed(2)),5.64);
assert.equal(Number((TISA_GOALS[0].previous-TISA_GOALS[0].actual).toFixed(2)),1.13);
const tisa=tisaSection();
for(const expected of ['31.36','37','5.64','1.13','44.2','48.3','30.42','60.8','73.7','Not available','2027–28','2032']) assert.ok(tisa.includes(expected),expected);
assert.equal((tisa.match(/<tr class="tisa-row-/g)||[]).length,4);
assert.ok(!tisa.includes('undefined'));
for (const goal of TISA_GOALS) {
  assert.ok(tisa.includes(`${TISA_SOURCES.prior}#page=${goal.priorPage}`));
  assert.ok(tisa.includes(`${TISA_SOURCES.current}#page=${goal.currentPage}`));
}

const data=JSON.parse(await readFile(new URL('../site/data.json',import.meta.url),'utf8'));
const recordMap=new Map(data.records.map(r=>[`${r.district}-${r.year}`,r]));
const observation=(d,y,k)=>recordMap.get(`${d}-${y}`)?.metrics[k]||{value:null,sources:[]};
const root={innerHTML:'',addEventListener(type,callback){assert.equal(type,'click');this.click=callback;}};
globalThis.document={querySelector(selector){assert.equal(selector,'#research-overview');return root;}};
let dialog='';
setupOverview({data,observation,sourceHtml:id=>id,openDialog:html=>{dialog=html;},explore:()=>{}});
assert.ok(root.innerHTML.includes('id="tisa-goals"'));
assert.ok(root.innerHTML.indexOf('id="tisa-goals"')<root.innerHTML.indexOf('class="findings-grid"'));
assert.ok(!root.innerHTML.includes('payroll-history'));
assert.ok(!root.innerHTML.includes('Central administrative payroll grew faster'));
assert.equal((root.innerHTML.match(/class="finding-card"/g)||[]).length,3);
for(const finding of ['spending','tests','enrollment']){
  root.click({target:{closest:selector=>selector==='[data-finding]'?{dataset:{finding}}:null}});
  assert.ok(dialog.includes('<h2>'),finding);
}
const index=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
assert.ok(index.includes('href="#tisa-goals"'));
assert.ok(index.includes('app.js?v=tisa-20261018'));
console.log('PASS: TISA arithmetic, four goal statuses, source-linked rendering, overview replacement, existing evidence views, and navigation.');
