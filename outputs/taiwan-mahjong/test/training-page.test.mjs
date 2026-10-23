import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {trainingQuestions,trainingSkills,trainingContentRevision} from '../dist/training-data.js';
import * as trainingDraft from '../dist/training-draft.js';

test('試讀包只有九道已複核訓練題，保留候選與額外資料不進包',()=>{
 const all=['TRAINING-DRAFTS.json','TRAINING-REVIEW-CANDIDATES.json'].flatMap(f=>JSON.parse(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8')).cases);
 assert.equal(trainingQuestions.length,9);
 assert.deepEqual(trainingQuestions.map(q=>q.id),all.filter(q=>q.purpose==='training').map(q=>q.id));
 for(const q of trainingQuestions)assert.deepEqual(Object.keys(q).sort(),['accepted','board','choices','derivation','id','prompt','scope','skill']);
 assert.ok(all.filter(q=>q.purpose!=='training').every(q=>!JSON.stringify(trainingQuestions).includes(q.prompt)));
});

test('試讀控制：揭示界線、草稿保留、本機作答備份及下載失敗回退，沒有回饋收集出口',async()=>{
 let focused, downloaded, blob, downloadFailure=false;
 const leaveHandlers=new Set();
 class Element {
  children=[]; listeners={}; textContent='';
  constructor(tag){this.tag=tag;}
  append(...items){this.children.push(...items);}
  replaceChildren(){this.children=[];}
  setAttribute(){}
  addEventListener(type,fn){this.listeners[type]=fn;}
  focus(){focused=this;}
  click(){downloaded=this;}
  querySelector(selector){return all(this).find(x=>'#'+x.id===selector);}
 }
 const root=new Element('root');
 const all=(node=root)=>[node,...node.children.flatMap(x=>all(x))];
 const find=(tag,text)=>all().find(x=>x.tag===tag&&(text===undefined||x.textContent===text));
 const click=text=>find('button',text).listeners.click();
 const submit=()=>find('form').listeners.submit({preventDefault(){}});
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/training.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:{},require:name=>name==='./training-draft.js'?trainingDraft:name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},Blob,
  URL:{createObjectURL(value){if(downloadFailure)throw Error('blocked');blob=value;return 'blob:trial';},revokeObjectURL(){}},
  window:{addEventListener(type,fn){if(type==='pageshow'||type==='storage')return;assert.equal(type,'beforeunload');leaveHandlers.add(fn);},removeEventListener(type,fn){assert.equal(type,'beforeunload');leaveHandlers.delete(fn);}},
  setTimeout:fn=>fn(),clearTimeout(){},document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 assert.equal(leaveHandlers.size,0);
 const texts=()=>all().map(x=>x.textContent).join('\n');
 assert.equal(root.querySelector('#trial-feedback'),undefined);assert.equal(root.querySelector('#prior-exposure'),undefined);
 assert.doesNotMatch(texts(),/回饋|交回|回報問題|看過本題/);
 assert.equal(find('button','提交並看推導'),undefined);assert.ok(find('button','看答案與推導'));
 assert.equal(find('h3'),undefined);submit();assert.equal(find('h3'),undefined);
 assert.ok(all().some(x=>x.textContent==='請先選擇至少一項，再看答案。'));
 for(const input of all().filter(x=>x.tag==='input')){input.checked=true;input.listeners.change();}
 const reason=find('textarea');reason.value='<script>測試</script>';reason.listeners.input();
 assert.equal(leaveHandlers.size,1);
 click('下載本頁作答備份');
 const draftReport=JSON.parse(await blob.text());assert.equal(draftReport.questions[0].status,'draft');
 assert.equal(draftReport.questions[1].status,'unanswered');assert.equal(find('h3'),undefined);
 reason.value+='（補充）';reason.listeners.input();
 assert.match(root.querySelector('#draft-status').textContent,/下載備份後有新修改/);
 click('下一題');assert.equal(find('h3'),undefined);
 click('上一題');assert.equal(find('textarea').value,reason.value);
 submit();assert.equal(find('h3').textContent,'還有選項要確認');assert.equal(focused.id,'answer');
 assert.ok(all().filter(x=>x.tag==='input').every(x=>x.disabled));assert.equal(find('textarea').readOnly,true);
 click('下一題');click('上一題');assert.equal(find('h3').textContent,'還有選項要確認');
 downloadFailure=true;click('下載本頁作答備份');assert.ok(all().some(x=>x.textContent.includes('瀏覽器無法下載')));
 assert.equal(JSON.parse(root.querySelector('#backup-preview').value).questions[0].reason,reason.value);
 assert.match(root.querySelector('#draft-status').textContent,/下載備份後有新修改/);
 downloadFailure=false;click('下載本頁作答備份');
 assert.equal(downloaded.download,'taiwan-mahjong-trial-answers.json');
 const answers=JSON.parse(await blob.text());assert.equal(answers.schemaVersion,3);assert.equal(answers.questions.length,9);
 assert.equal(answers.reasonAssessment,'not-reviewed');assert.equal(answers.schemaVersion,3);assert.equal(answers.contentRevision,trainingContentRevision);
 assert.equal(answers.questions[0].status,'submitted-and-revealed');
 assert.deepEqual(answers.questions[0].selected,trainingQuestions[0].choices);
 assert.equal(answers.questions[0].reason,reason.value);
 assert.ok(answers.questions.every(q=>q.feedback===''&&q.exposure==='unknown'),'新作答沿用空回饋與unknown');
 assert.equal(answers.questions[1].status,'unanswered');
 assert.equal(answers.questions[0].prompt,trainingQuestions[0].prompt);
 assert.ok(!JSON.stringify(answers).includes(trainingQuestions[0].derivation));
 assert.ok(answers.questions.every(q=>!('accepted' in q)&&!('score' in q)));
 assert.equal(leaveHandlers.size,1,'交由瀏覽器下載不能當成檔案已保存');
 assert.ok(!root.querySelector('#draft-status').textContent.includes('新修改'));
 click('下一題');const secondReason=find('textarea');secondReason.value='新理由';secondReason.listeners.input();
 assert.match(root.querySelector('#draft-status').textContent,/下載備份後有新修改/);
 secondReason.value='';secondReason.listeners.input();
 assert.ok(!root.querySelector('#draft-status').textContent.includes('新修改'),'回復原內容不需再次下載備份');
});

// Minimal page double: timers only run when a test calls runTimers(), storage is an in-memory Map, and the lock can be held, busy or released on demand.
const markers={'tw16:TW16-CLASSIC-v1:save':'game-marker','tw16:practice:v1':'practice-marker','tw16:learn:v1':'learning-marker'};
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
function trialPage({seed,search=''}={}){
 const made=[], handlers=new Set(), timers=new Map(), values=new Map(Object.entries(markers));let timerId=0,downloads=0,pageShow;
 const state={confirm:true,hold:false,busy:false,noLock:false,failWrites:false,failReads:false,release:undefined,writeAttempts:0,writes:0,confirms:[],focused:undefined};
 if(seed)values.set(trainingDraft.TRIAL_KEY,seed);
 class Element {
  listeners={};textContent='';constructor(tag){this.tag=tag;made.push(this);}
  append(){} replaceChildren(){made.length=0;} setAttribute(){} focus(){state.focused=this;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  querySelector(selector){return made.findLast(x=>'#'+x.id===selector);}
  click(){downloads++;}
 }
 const root=new Element('root');
 const localStorage={getItem(key){if(state.failReads&&key===trainingDraft.TRIAL_KEY)throw Error('read');return values.has(key)?values.get(key):null;},
  setItem(key,value){state.writeAttempts++;if(state.failWrites)throw Error('quota');state.writes++;values.set(key,value);},removeItem:key=>values.delete(key)};
 const locks={request:async(key,options,action)=>{assert.deepEqual(options,{mode:'exclusive',ifAvailable:true});if(state.hold)await new Promise(resolve=>state.release=resolve);return action(state.busy?null:{});}};
 const draftModule={...trainingDraft,saveTrialDraft:(s,e,d)=>trainingDraft.saveTrialDraft(s,e,d,state.noLock?null:locks),clearTrialDraft:(s,e)=>trainingDraft.clearTrialDraft(s,e,state.noLock?null:locks)};
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/training.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:{},require:name=>name==='./training-draft.js'?draftModule:name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},Blob,localStorage,HTMLButtonElement:class{},URLSearchParams,
  // Share the Error realm with dist/training-draft.js so named save errors are recognised as in the browser.
  Error,
  URL:{createObjectURL(){return 'blob:trial';},revokeObjectURL(){}},
  setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),
  window:{location:{search},confirm:message=>{state.confirms.push(message);return state.confirm;},addEventListener(type,fn){if(type==='pageshow')pageShow=fn;else if(type!=='storage'){assert.equal(type,'beforeunload');handlers.add(fn);}},removeEventListener(type,fn){assert.equal(type,'beforeunload');handlers.delete(fn);}},
  document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 const field=id=>root.querySelector('#'+id);
 return {state,handlers,timers,values,made,field,downloads:()=>downloads,
  runTimers(){const due=[...timers.values()];timers.clear();for(const t of due)t.fn();},
  pageShow:()=>pageShow(),
  input(id,value){field(id).value=value;field(id).listeners.input();},
  check(nth,checked){const box=made.filter(x=>x.tag==='input')[nth];box.checked=checked;box.listeners.change();},
  click(text){made.findLast(x=>x.tag==='button'&&x.textContent===text).listeners.click();},
  saved(){const raw=values.get(trainingDraft.TRIAL_KEY);return raw===undefined?undefined:trainingDraft.decodeTrialDraft(raw);},
  status:()=>field('storage-status').textContent};
}
const seededTrial=(change=()=>{})=>{
 const draft={schemaVersion:1,questionId:'E01',skill:'all',report:{schemaVersion:3,contentRevision:trainingContentRevision,rulesVersion:'TW16-CLASSIC-v1',mode:'L3-B0-content-trial',reasonAssessment:'not-reviewed',guidanceMode:'topic-guided',
  questions:trainingQuestions.map(q=>({id:q.id,prompt:q.prompt,status:'unanswered',selected:[],reason:'',feedback:'',exposure:'unknown'}))}};
 change(draft);return trainingDraft.encodeTrialDraft(draft);
};

test('離頁防護：空白無提醒、只有理由也保護、取消與切題保留；刪到全空或只切題，存好前仍保護',async()=>{
 const p=trialPage();
 assert.equal(p.handlers.size,0);assert.equal(p.timers.size,0,'初次載入不排程保存');
 p.click('下載本頁作答備份');assert.equal(p.downloads(),1);assert.equal(p.handlers.size,0);
 p.input('reason','只有理由');p.input('reason','只有理由！');assert.equal(p.handlers.size,1);
 const event={prevented:false,returnValue:undefined,preventDefault(){this.prevented=true;}};
 for(const fn of p.handlers)fn(event);
 assert.equal(event.prevented,true);assert.equal(event.returnValue,'true');assert.equal(p.field('reason').value,'只有理由！');
 p.click('下一題');assert.equal(p.handlers.size,1);p.click('上一題');assert.equal(p.field('reason').value,'只有理由！');
 p.runTimers();await settle();assert.equal(p.handlers.size,0);assert.equal(p.saved().report.questions[0].reason,'只有理由！');
 p.input('reason','');assert.equal(p.handlers.size,1,'刪到全空仍與保存不同');assert.equal(p.field('draft-status').hidden,true);
 p.runTimers();await settle();assert.equal(p.handlers.size,0);assert.equal(p.saved().report.questions[0].status,'unanswered');
 p.click('下一題');assert.equal(p.handlers.size,1,'只切題也算未存位置');
 p.runTimers();await settle();assert.equal(p.handlers.size,0);assert.equal(p.saved().questionId,trainingQuestions[1].id);
 p.check(0,true);assert.equal(p.handlers.size,1);p.check(0,false);assert.equal(p.handlers.size,0,'回到已保存內容即解除');
 p.runTimers();await settle();assert.equal(p.handlers.size,0);assert.equal(p.field('draft-status').hidden,true);
});

test('自動保存：選項／揭示立即排程、理由停輸入400ms並取消前一排程；位置與完整封套一起存，其他鍵不動',async()=>{
 const p=trialPage();
 p.pageShow();p.runTimers();await settle();assert.equal(p.state.writeAttempts,0,'pageshow與重畫不寫入');
 p.input('reason','第一');p.input('reason','第一句');
 assert.deepEqual([...p.timers.values()].map(t=>t.ms),[400],'新輸入取代舊排程');assert.equal(p.saved(),undefined);
 assert.equal(p.status(),'有修改，稍後自動保存…');
 const reasonField=p.field('reason');p.runTimers();await settle();
 assert.equal(p.field('reason'),reasonField,'保存不重畫題目');assert.equal(p.state.writes,1);
 assert.match(p.status(),/已保存作答/);assert.equal(p.saved().report.questions[0].reason,'第一句');
 p.input('reason','第一句再補');p.check(0,true);
 assert.deepEqual([...p.timers.values()].map(t=>t.ms),[0],'選項立即保存並帶上理由');
 p.runTimers();await settle();assert.equal(p.state.writes,2);
 assert.deepEqual(p.saved().report.questions[0].selected.map(c=>c.id),[trainingQuestions[0].choices[0].id]);assert.equal(p.saved().report.questions[0].reason,'第一句再補');
 p.made.find(x=>x.tag==='form').listeners.submit({preventDefault(){}});
 p.runTimers();await settle();assert.equal(p.saved().report.questions[0].status,'submitted-and-revealed');
 const picker=p.field('skill-picker');picker.value='claim-cost';picker.listeners.change();p.runTimers();await settle();
 assert.deepEqual([p.saved().questionId,p.saved().skill],['C01','claim-cost']);
 p.click('下一題');p.runTimers();await settle();assert.equal(p.saved().questionId,'C02');assert.equal(p.handlers.size,0);
 for(const [key,value] of Object.entries(markers))assert.equal(p.values.get(key),value);
});

test('保存忙碌時合併最新快照，舊快照成功不解除提醒；配額／鎖忙失敗不自我重試，無法核對則停寫',async()=>{
 const p=trialPage();p.state.hold=true;
 p.input('reason','第一版');p.runTimers();await settle();
 assert.equal(typeof p.state.release,'function');assert.equal(p.status(),'保存中…');assert.equal(p.field('save-local').disabled,true);
 p.input('reason','第二版');p.runTimers();await settle();assert.equal(p.state.writes,0);
 const first=p.state.release;p.state.release=undefined;first();await settle();
 assert.equal(p.state.writes,1);assert.equal(p.saved().report.questions[0].reason,'第一版');
 assert.equal(typeof p.state.release,'function','合併後的保存接著寫入最新快照');assert.equal(p.handlers.size,1,'舊快照成功不解除新修改提醒');
 p.state.hold=false;p.state.release();await settle();
 assert.equal(p.state.writes,2);assert.equal(p.saved().report.questions[0].reason,'第二版');assert.equal(p.handlers.size,0);
 p.state.failWrites=true;p.input('reason','配額失敗');p.runTimers();await settle();
 assert.match(p.status(),/保存未成功/);assert.equal(p.state.writeAttempts,3);assert.equal(p.timers.size,0,'失敗不排程重試');
 assert.equal(p.handlers.size,1);assert.equal(p.field('save-local').disabled,false);
 p.state.hold=true;p.input('reason','忙碌時失敗');p.runTimers();await settle();p.input('reason','合併在後');p.runTimers();await settle();
 const pending=p.state.release;p.state.release=undefined;p.state.hold=false;pending();await settle();
 assert.equal(p.state.writeAttempts,4,'失敗時一併放棄合併重試');assert.equal(p.timers.size,0);assert.match(p.status(),/保存未成功/);
 p.state.failWrites=false;p.click('保存作答到此瀏覽器');await settle();
 assert.equal(p.saved().report.questions[0].reason,'合併在後');assert.equal(p.handlers.size,0);
 p.state.busy=true;p.input('reason','鎖忙');p.runTimers();await settle();assert.match(p.status(),/保存未成功/);assert.equal(p.saved().report.questions[0].reason,'合併在後');
 p.state.busy=false;p.input('reason','鎖可用');p.runTimers();await settle();assert.equal(p.saved().report.questions[0].reason,'鎖可用');
 const before=p.values.get(trainingDraft.TRIAL_KEY);p.state.failReads=true;p.input('reason','無法核對');p.runTimers();await settle();
 assert.match(p.status(),/無法核對本機保存，停止覆寫/);assert.equal(p.field('save-local').disabled,true);assert.equal(p.handlers.size,1);
 p.input('reason','無法核對後再改');p.runTimers();await settle();assert.equal(p.values.get(trainingDraft.TRIAL_KEY),before);
});

test('清除與重讀：取消保留排程；確認清除後舊排程／切題／分類／pageshow不重建，新作答或手動保存才恢復；舊回饋逐字保留',async()=>{
 const legacy={feedback:'舊版合成回饋 <b>原樣</b>',exposure:'unseen-self-report'};
 const seed=seededTrial(d=>Object.assign(d.report.questions[0],legacy));
 const p=trialPage({seed});assert.match(p.status(),/已載入/);assert.equal(p.handlers.size,0);
 p.input('reason','清除前');p.state.confirm=false;p.click('清除本機保存（保留本頁）');await settle();
 assert.equal(p.timers.size,1,'取消清除不丟排程');assert.equal(p.values.get(trainingDraft.TRIAL_KEY),seed);
 p.state.confirm=true;p.click('清除本機保存（保留本頁）');await settle();
 assert.equal(p.values.has(trainingDraft.TRIAL_KEY),false);assert.equal(p.timers.size,0);assert.match(p.status(),/已清除/);assert.equal(p.handlers.size,1,'本頁內容保留仍提醒');
 p.click('下一題');const picker=p.field('skill-picker');picker.value='claim-cost';picker.listeners.change();
 p.pageShow();p.runTimers();await settle();assert.equal(p.values.has(trainingDraft.TRIAL_KEY),false,'切題／分類／pageshow不重建保存');
 p.check(0,true);p.runTimers();await settle();
 assert.deepEqual([p.saved().questionId,p.saved().skill],['C01','claim-cost']);assert.deepEqual({...p.saved().report.questions[0]},{...p.saved().report.questions[0],...legacy,reason:'清除前'});
 p.click('清除本機保存（保留本頁）');await settle();assert.equal(p.values.has(trainingDraft.TRIAL_KEY),false);
 p.click('保存作答到此瀏覽器');await settle();const latest=p.values.get(trainingDraft.TRIAL_KEY);assert.ok(latest);
 p.input('reason','重讀前未存');p.state.confirm=false;p.click('重新讀取保存');assert.equal(p.timers.size,1,'取消重讀不丟排程');assert.equal(p.field('reason').value,'重讀前未存');
 p.state.confirm=true;p.click('重新讀取保存');assert.equal(p.timers.size,0);assert.equal(p.field('reason').value,'');assert.equal(p.handlers.size,0);
 assert.equal(p.saved().report.questions[0].reason,'清除前');
 p.runTimers();await settle();assert.equal(p.values.get(trainingDraft.TRIAL_KEY),latest);
 const kept=p.saved().report.questions;assert.deepEqual(kept.map(q=>[q.feedback,q.exposure]),trainingQuestions.map((q,i)=>i?['','unknown']:[legacy.feedback,legacy.exposure]));
 for(const [key,value] of Object.entries(markers))assert.equal(p.values.get(key),value);
});

test('清除等待鎖時只切題／分類不重建；等待中真的作答才保存最新內容；清除失敗不執行等待中的舊任務',async()=>{
 const p=trialPage({seed:seededTrial()});const key=trainingDraft.TRIAL_KEY;
 const clearHeld=async()=>{p.state.hold=true;p.click('清除本機保存（保留本頁）');await settle();assert.equal(typeof p.state.release,'function');};
 const release=async(fail=false)=>{const r=p.state.release;p.state.release=undefined;p.state.hold=false;p.state.busy=fail;r();await settle();p.state.busy=false;};
 await clearHeld();
 p.click('下一題');const picker=p.field('skill-picker');picker.value='claim-cost';picker.listeners.change();p.runTimers();await settle();
 await release();assert.equal(p.values.has(key),false);assert.match(p.status(),/已清除/);
 p.runTimers();await settle();p.click('下一題');p.runTimers();await settle();
 assert.equal(p.values.has(key),false,'等待中與完成後的純位置都不復活保存');assert.equal(p.state.writeAttempts,0);
 p.check(0,true);p.runTimers();await settle();assert.equal(p.saved().questionId,'C02');
 await clearHeld();p.input('reason','清除時已排入');p.runTimers();await settle();p.input('reason','清除時最新');
 await release();assert.equal(p.saved().report.questions.find(q=>q.id==='C02').reason,'清除時最新','等待中作答在清除後保存最新內容');
 assert.equal(p.timers.size,0);assert.equal(p.handlers.size,0);
 await clearHeld();p.check(1,true);p.runTimers();await settle();
 const attempts=p.state.writeAttempts;await release(true);assert.match(p.status(),/清除未成功/);
 assert.equal(p.timers.size,0);p.runTimers();await settle();assert.equal(p.state.writeAttempts,attempts,'清除失敗不自動執行等待中的保存');
 assert.equal(p.saved().report.questions.find(q=>q.id==='C02').selected.length,1);assert.equal(p.handlers.size,1,'未存內容仍保護');
 p.click('保存作答到此瀏覽器');await settle();assert.equal(p.saved().report.questions.find(q=>q.id==='C02').selected.length,2);
});

test('清除時鎖內無法讀取或原檔已變：停止覆寫，之後改理由／切題或按保存都不寫，確認重讀才恢復',async()=>{
 const seed=seededTrial(d=>{d.report.questions[0].reason='原檔理由';d.report.questions[0].status='draft';});
 const p=trialPage({seed});const key=trainingDraft.TRIAL_KEY;
 p.state.failReads=true;p.click('清除本機保存（保留本頁）');await settle();p.state.failReads=false;
 assert.match(p.status(),/停止覆寫/);assert.equal(p.values.get(key),seed);
 p.input('reason','清除失敗後新理由');p.click('下一題');p.runTimers();await settle();
 p.click('保存作答到此瀏覽器');await settle();
 assert.equal(p.state.writeAttempts,0,'恢復讀取後的修改與保存按鈕都不寫');assert.equal(p.values.get(key),seed);
 assert.equal(p.field('save-local').disabled,true);assert.equal(p.handlers.size,1);
 p.click('上一題');assert.equal(p.field('reason').value,'清除失敗後新理由');
 p.state.confirm=false;p.click('重新讀取保存');assert.equal(p.field('reason').value,'清除失敗後新理由','取消重讀保留本頁');
 p.state.confirm=true;p.click('重新讀取保存');assert.equal(p.field('reason').value,'原檔理由');
 assert.equal(p.handlers.size,0);assert.equal(p.field('save-local').disabled,false);
 p.input('reason','重讀後修改');p.runTimers();await settle();assert.equal(p.saved().report.questions[0].reason,'重讀後修改');
 const attempts=p.state.writeAttempts,foreign=seededTrial(d=>{d.report.questions[1].reason='他頁理由';d.report.questions[1].status='draft';});
 p.values.set(key,foreign);p.click('清除本機保存（保留本頁）');await settle();
 assert.match(p.status(),/停止覆寫/);assert.equal(p.values.get(key),foreign);
 p.input('reason','衝突後新理由');p.click('下一題');p.runTimers();await settle();p.click('保存作答到此瀏覽器');await settle();
 assert.equal(p.state.writeAttempts,attempts);assert.equal(p.values.get(key),foreign);assert.equal(p.field('save-local').disabled,true);assert.equal(p.handlers.size,1);
 p.click('重新讀取保存');assert.equal(p.saved().report.questions[1].reason,'他頁理由');assert.equal(p.field('save-local').disabled,false);
});

test('保存失敗同時取消尚未到期的理由排程：無新操作不再嘗試，新輸入或手動保存才恢復',async()=>{
 const p=trialPage();p.state.hold=true;
 p.input('reason','第一次');p.runTimers();await settle();assert.equal(typeof p.state.release,'function');
 p.input('reason','排程中');assert.deepEqual([...p.timers.values()].map(t=>t.ms),[400]);
 p.state.failWrites=true;const r=p.state.release;p.state.release=undefined;p.state.hold=false;r();await settle();
 assert.match(p.status(),/保存未成功/);assert.equal(p.state.writeAttempts,1);assert.equal(p.timers.size,0,'失敗取消未到期排程');
 p.runTimers();await settle();assert.equal(p.state.writeAttempts,1);assert.equal(p.handlers.size,1);assert.equal(p.field('reason').value,'排程中');
 p.state.failWrites=false;p.input('reason','失敗後新輸入');p.runTimers();await settle();
 assert.equal(p.saved().report.questions[0].reason,'失敗後新輸入');assert.equal(p.handlers.size,0);
 p.state.failReads=true;p.state.hold=true;p.input('reason','核對失敗前');p.runTimers();await settle();p.input('reason','核對失敗時排程');
 const held=p.state.release;p.state.release=undefined;p.state.hold=false;held();await settle();
 assert.match(p.status(),/無法核對/);assert.equal(p.timers.size,0);assert.equal(p.field('save-local').disabled,true);
 assert.equal(p.handlers.size,1);assert.equal(p.field('read-local').disabled,false,'保留重讀復原入口');
});

test('網址分類只移動續答位置：載入與pageshow不寫入也不提醒，實際操作後保存完整新位置',async()=>{
 const seed=seededTrial(d=>{d.report.questions[0].reason='原檔理由';d.report.questions[0].status='draft';});
 const p=trialPage({seed,search:'?skill=claim-cost'});
 assert.equal(p.field('skill-picker').value,'claim-cost');assert.equal(p.handlers.size,0);assert.equal(p.timers.size,0);
 p.pageShow();p.runTimers();await settle();assert.equal(p.state.writeAttempts,0);assert.equal(p.handlers.size,0);assert.equal(p.values.get(trainingDraft.TRIAL_KEY),seed);
 p.click('下一題');assert.equal(p.handlers.size,1);p.runTimers();await settle();
 assert.deepEqual([p.saved().questionId,p.saved().skill],['C02','claim-cost']);assert.equal(p.saved().report.questions[0].reason,'原檔理由');assert.equal(p.handlers.size,0);
});

// Nine mixed rows: E01 revealed correct, the next two revealed wrong, one draft, the rest unanswered; every row keeps a non-default legacy feedback and all three exposures appear.
const RETRY_CONFIRM='重練會清空本題的選項與理由，並收起答案；其他題保留。確定重練？';
const exposures=['seen','unseen-self-report','unknown'];
const wrongPick=q=>{const off=q.choices.filter(c=>!q.accepted.includes(c.id));return off.length?off.slice(0,1):q.choices.slice(0,1);};
const mixedTrial=()=>seededTrial(d=>d.report.questions.forEach((r,i)=>{
 const q=trainingQuestions[i];Object.assign(r,{feedback:`舊回饋${i} <i>原樣</i>`,exposure:exposures[i%3]});
 if(i===0)Object.assign(r,{status:'submitted-and-revealed',selected:q.choices.filter(c=>q.accepted.includes(c.id)),reason:'正解理由'});
 else if(i<3)Object.assign(r,{status:'submitted-and-revealed',selected:wrongPick(q),reason:`錯解理由${i}`});
 else if(i===3)Object.assign(r,{status:'draft',selected:q.choices.slice(0,1),reason:'草稿理由'});
}));
const submitForm=p=>p.made.find(x=>x.tag==='form').listeners.submit({preventDefault(){}});
const boxes=p=>p.made.filter(x=>x.tag==='input');

test('重練本題：正確與錯誤揭示題皆可重練；取消零修改零排程不重畫；確認只重置本題、回選項焦點，空選不能揭示，再選可再揭示',async()=>{
 const seed=mixedTrial(),p=trialPage({seed}),key=trainingDraft.TRIAL_KEY,original=trainingDraft.decodeTrialDraft(seed).report.questions;
 assert.equal(p.field('answer').textContent,'答對了');assert.equal(p.field('retry-question').type,'button');
 assert.ok(p.made.some(x=>x.tag==='p'&&x.textContent==='同題複習，不保留歷次作答。'));
 assert.ok(p.made.some(x=>x.textContent==='本頁目前保留的揭示進度：3 / 9 題；不是成績。'));
 const retry=p.field('retry-question');p.state.focused=retry;p.state.confirm=false;retry.listeners.click();
 assert.deepEqual(p.state.confirms,[RETRY_CONFIRM]);assert.equal(p.field('retry-question'),retry,'取消不重畫');assert.equal(p.state.focused,retry);
 assert.equal(p.timers.size,0);assert.equal(p.state.writeAttempts,0);assert.equal(p.values.get(key),seed);assert.equal(p.handlers.size,0);
 assert.ok(boxes(p).every(x=>x.disabled));assert.equal(p.field('reason').value,'正解理由');
 p.state.confirm=true;p.field('retry-question').listeners.click();
 assert.equal(p.field('answer'),undefined);assert.equal(p.field('retry-question'),undefined);
 assert.ok(boxes(p).every(x=>!x.disabled&&!x.checked));assert.equal(p.field('reason').value,'');assert.equal(p.field('reason').readOnly,false);
 assert.equal(p.state.focused,p.field('first-choice'));assert.equal(p.state.focused,boxes(p)[0]);assert.equal(p.state.focused.checked,false,'只聚焦不選取');
 assert.deepEqual([...p.timers.values()].map(t=>t.ms),[0]);assert.equal(p.handlers.size,1);
 p.runTimers();await settle();
 let rows=p.saved().report.questions;assert.deepEqual([p.saved().questionId,p.saved().skill],['E01','all']);
 assert.deepEqual(rows[0],{...original[0],status:'unanswered',selected:[],reason:''});assert.deepEqual(rows.slice(1),original.slice(1));
 for(const [k,v] of Object.entries(markers))assert.equal(p.values.get(k),v);assert.equal(p.handlers.size,0);
 submitForm(p);assert.equal(p.field('answer'),undefined);assert.ok(p.made.some(x=>x.textContent==='請先選擇至少一項，再看答案。'));
 p.check(0,true);submitForm(p);assert.ok(p.field('answer'));assert.ok(boxes(p).every(x=>x.disabled));assert.ok(p.field('retry-question'));
 p.runTimers();await settle();assert.equal(p.saved().report.questions[0].status,'submitted-and-revealed');
 p.click('下一題');assert.equal(p.field('answer').textContent,'還有選項要確認');
 p.field('retry-question').listeners.click();assert.equal(p.state.focused,p.field('first-choice'));assert.ok(boxes(p).every(x=>!x.disabled&&!x.checked));
 p.runTimers();await settle();rows=p.saved().report.questions;
 assert.deepEqual(rows[1],{...original[1],status:'unanswered',selected:[],reason:''});assert.deepEqual(rows.slice(2),original.slice(2));
 assert.deepEqual(rows.map(r=>[r.feedback,r.exposure]),original.map(r=>[r.feedback,r.exposure]),'舊回饋與三種曝光逐字保留');
 assert.deepEqual([p.saved().questionId,p.saved().skill],[trainingQuestions[1].id,'all']);
 const reload=trialPage({seed:p.values.get(key)});assert.match(reload.status(),/已載入/);assert.equal(reload.field('retry-question'),undefined);
 reload.click('上一題');assert.ok(reload.field('retry-question'));
});

test('重練與保存忙碌：等待中重練再修改，舊快照完成不解除提醒，最後存最新完整快照；明確清除中禁用，清除後重練恢復自存',async()=>{
 const seed=mixedTrial(),p=trialPage({seed}),key=trainingDraft.TRIAL_KEY,original=trainingDraft.decodeTrialDraft(seed).report.questions;
 p.state.hold=true;p.click('下一題');p.runTimers();await settle();assert.equal(typeof p.state.release,'function');assert.equal(p.status(),'保存中…');
 p.click('上一題');assert.equal(p.field('retry-question').disabled,false,'一般保存忙碌時仍可重練');
 p.field('retry-question').listeners.click();p.runTimers();await settle();
 p.check(0,true);p.input('reason','重練新理由');p.runTimers();await settle();assert.equal(p.state.writes,0);
 const first=p.state.release;p.state.release=undefined;first();await settle();
 assert.equal(p.state.writes,1);assert.equal(p.saved().report.questions[0].status,'submitted-and-revealed','先完成的是舊快照');
 assert.equal(typeof p.state.release,'function');assert.equal(p.handlers.size,1,'舊快照完成不解除提醒');
 p.state.hold=false;p.state.release();await settle();assert.equal(p.state.writes,2);
 const rows=p.saved().report.questions;assert.equal(p.saved().questionId,'E01');
 assert.deepEqual(rows[0],{...original[0],status:'draft',selected:[trainingQuestions[0].choices[0]],reason:'重練新理由'});assert.deepEqual(rows.slice(1),original.slice(1));
 assert.equal(p.handlers.size,0);
 p.click('下一題');p.runTimers();await settle();
 p.state.hold=true;p.click('清除本機保存（保留本頁）');await settle();assert.equal(typeof p.state.release,'function');
 const retry=p.field('retry-question');assert.equal(retry.disabled,true,'清除執行中禁用重練');
 const attempts=p.state.writeAttempts;retry.listeners.click();assert.equal(p.field('retry-question'),retry);assert.equal(p.state.confirms.length,2,'禁用期間不詢問也不改');
 const r=p.state.release;p.state.release=undefined;p.state.hold=false;r();await settle();
 assert.equal(p.values.has(key),false);assert.match(p.status(),/已清除/);assert.equal(p.field('retry-question').disabled,false);
 p.runTimers();await settle();assert.equal(p.values.has(key),false);
 p.field('retry-question').listeners.click();p.runTimers();await settle();assert.equal(p.state.writeAttempts,attempts+1,'清除後重練屬新作答並自存');
 assert.equal(p.saved().report.questions[1].status,'unanswered');assert.equal(p.saved().report.questions[1].feedback,original[1].feedback);assert.equal(p.handlers.size,0);
});

test('重練遇配額、缺鎖、衝突、無法讀取或壞檔：本頁可重練，原檔不被覆寫、仍停寫並保護本頁',async()=>{
 const seed=mixedTrial(),key=trainingDraft.TRIAL_KEY,p=trialPage({seed});
 const retryHere=()=>{p.field('retry-question').listeners.click();p.runTimers();};
 p.state.failWrites=true;retryHere();await settle();
 assert.match(p.status(),/保存未成功/);assert.equal(p.values.get(key),seed);assert.equal(p.handlers.size,1);assert.equal(p.timers.size,0);
 assert.ok(boxes(p).every(x=>!x.disabled));p.state.failWrites=false;
 p.state.noLock=true;p.click('下一題');retryHere();await settle();
 assert.match(p.status(),/保存未成功/);assert.equal(p.values.get(key),seed);assert.equal(p.handlers.size,1);assert.ok(boxes(p).every(x=>!x.disabled));p.state.noLock=false;
 const foreign=seededTrial(d=>{d.report.questions[8].reason='他頁理由';d.report.questions[8].status='draft';});p.values.set(key,foreign);
 const attempts=p.state.writeAttempts;p.click('下一題');retryHere();await settle();
 assert.match(p.status(),/停止覆寫/);assert.equal(p.values.get(key),foreign);assert.equal(p.field('save-local').disabled,true);assert.equal(p.handlers.size,1);
 assert.ok(boxes(p).every(x=>!x.disabled));p.check(0,true);p.runTimers();await settle();p.click('保存作答到此瀏覽器');await settle();
 assert.equal(p.state.writeAttempts,attempts,'衝突後不繞過CAS');assert.equal(p.values.get(key),foreign);
 const unreadable=trialPage({seed});unreadable.state.failReads=true;unreadable.click('重新讀取保存');
 const broken=trialPage({seed:'{壞檔'});
 for(const [page,kept] of [[unreadable,seed],[broken,'{壞檔']]){
  assert.match(page.status(),/停止覆寫/);if(!page.field('answer')){page.check(0,true);submitForm(page);}assert.ok(page.field('answer'));
  page.field('retry-question').listeners.click();page.runTimers();await settle();page.click('保存作答到此瀏覽器');await settle();
  assert.equal(page.values.get(key),kept);assert.equal(page.state.writeAttempts,0);assert.equal(page.handlers.size,1);assert.match(page.status(),/停止覆寫/);
  assert.equal(page.field('save-local').disabled,true);assert.ok(boxes(page).every(x=>!x.disabled&&!x.checked));assert.equal(page.state.focused,page.field('first-choice'));
 }
});

test('返回牌室：空白與另開分頁不阻擋，取消保留內容，確認才解除防護並離開',()=>{
 const made=[], handlers=new Set();let focused,navigation,pageShow;
 class Element {
  children=[];listeners={};textContent='';
  constructor(tag){this.tag=tag;made.push(this);}
  append(...items){this.children.push(...items);} replaceChildren(){made.length=0;this.children=[];}
  setAttribute(){} addEventListener(type,fn){this.listeners[type]=fn;} focus(){focused=this;}
  querySelector(selector){return made.findLast(x=>'#'+x.id===selector);}
  showModal(){this.open=true;} close(){this.open=false;this.listeners.close();} remove(){this.removed=true;}
 }
 const root=new Element('root'), link=new Element('a');link.href='https://example.test/taiwan-mahjong/';
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/training.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:{},require:name=>name==='./training-draft.js'?trainingDraft:name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},
  window:{addEventListener(type,fn){if(type==='pageshow')pageShow=fn;else if(type!=='storage')handlers.add(fn);},removeEventListener(type,fn){handlers.delete(fn);},location:{assign(url){navigation=url;}}},
  setTimeout:fn=>fn(),clearTimeout(){},document:{querySelector:selector=>selector==='#training'?root:link,createElement:tag=>new Element(tag),body:{append(){}}}});
 const event=(extras={})=>({button:0,prevented:false,preventDefault(){this.prevented=true;},...extras});
 let click=event();link.listeners.click(click);assert.equal(click.prevented,false);assert.equal(made.filter(x=>x.tag==='dialog').length,0);
 root.querySelector('#reason').value='瀏覽器自行還原，但不屬於目前題目的草稿';
 made.find(x=>x.tag==='input').checked=true;
 pageShow();assert.equal(root.querySelector('#reason').value,'');assert.equal(made.find(x=>x.tag==='input').checked,false);assert.equal(handlers.size,0);
 const reason=root.querySelector('#reason');reason.value='尚未匯出的理由';reason.listeners.input();assert.equal(handlers.size,1);
 click=event({ctrlKey:true});link.listeners.click(click);assert.equal(click.prevented,false);assert.equal(made.filter(x=>x.tag==='dialog').length,0);
 click=event();link.listeners.click(click);assert.equal(click.prevented,true);
 const dialog=made.findLast(x=>x.tag==='dialog');assert.equal(dialog.open,true);assert.equal(focused.textContent,'留在本頁');
 made.findLast(x=>x.textContent==='留在本頁').listeners.click();
 assert.equal(dialog.removed,true);assert.equal(focused,link);assert.equal(reason.value,'尚未匯出的理由');assert.equal(handlers.size,1);assert.equal(navigation,undefined);
 link.listeners.click(event());made.findLast(x=>x.textContent==='確認離開').listeners.click();
 assert.equal(navigation,link.href);assert.equal(handlers.size,0);
 pageShow();assert.equal(handlers.size,1,'快取還原含草稿的頁面後重新防護');pageShow();assert.equal(handlers.size,1);
 assert.equal(root.querySelector('#reason').value,'尚未匯出的理由');
});

test('題面圖示只重現題幹已知牌：完整與局部標示、張數及四張容量',()=>{
 const expected={E01:'123456m123456p789s1211z',E02:'123456m123789p34s112z',S01:'1111z',S02:'3333m',C01:'1342m',C02:'342m',C03:'22s123456m123p11z3472s'};
 const parse=t=>(t.match(/[1-9]+[mpsz]/g)||[]).flatMap(s=>[...s.slice(0,-1)].map(n=>n+s.at(-1))).sort();
 for(const q of trainingQuestions){
  const actual=q.board.flatMap(r=>r.groups.flat());
  assert.deepEqual([...actual].sort(),expected[q.id]?parse(expected[q.id]):[],q.id);
  for(const k of actual){assert.match(k,/^([1-9][mps]|[1-7]z)$/);assert.ok(actual.filter(t=>t===k).length<=4);}
 }
 assert.match(trainingQuestions.find(q=>q.id==='C01').board[0].label,/不是完整手牌/);
 assert.match(trainingQuestions.find(q=>q.id==='C03').board[0].label,/尚未吃碰明槓/);
});
