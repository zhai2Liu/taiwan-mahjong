import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {trainingQuestions,trainingSkills,trainingContentRevision} from '../dist/training-data.js';

test('試讀包只有九道已複核訓練題，保留候選與額外資料不進包',()=>{
 const all=['TRAINING-DRAFTS.json','TRAINING-REVIEW-CANDIDATES.json'].flatMap(f=>JSON.parse(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8')).cases);
 assert.equal(trainingQuestions.length,9);
 assert.deepEqual(trainingQuestions.map(q=>q.id),all.filter(q=>q.purpose==='training').map(q=>q.id));
 for(const q of trainingQuestions)assert.deepEqual(Object.keys(q).sort(),['accepted','board','choices','derivation','id','prompt','scope','skill']);
 assert.ok(all.filter(q=>q.purpose!=='training').every(q=>!JSON.stringify(trainingQuestions).includes(q.prompt)));
});

test('試讀控制與回饋：揭示界線、草稿保留、只匯出意見及下載失敗回退',async()=>{
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
 vm.runInNewContext(source,{exports:{},require:name=>name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},Blob,
  URL:{createObjectURL(value){if(downloadFailure)throw Error('blocked');blob=value;return 'blob:trial';},revokeObjectURL(){}},
  window:{addEventListener(type,fn){if(type==='pageshow')return;assert.equal(type,'beforeunload');leaveHandlers.add(fn);},removeEventListener(type,fn){assert.equal(type,'beforeunload');leaveHandlers.delete(fn);}},
  setTimeout:fn=>fn(),document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 assert.equal(leaveHandlers.size,0);
 click('下載全部試讀回饋');assert.equal(downloaded,undefined);
 assert.equal(find('h3'),undefined);submit();assert.equal(find('h3'),undefined);
 for(const input of all().filter(x=>x.tag==='input')){input.checked=true;input.listeners.change();}
 const reason=find('textarea');reason.value='<script>測試</script>';reason.listeners.input();
 assert.equal(leaveHandlers.size,1);
 click('匯出作答紀錄（含理由與回饋）');
 const draftReport=JSON.parse(await blob.text());assert.equal(draftReport.questions[0].status,'draft');
 assert.equal(draftReport.questions[1].status,'unanswered');assert.equal(find('h3'),undefined);
 const firstFeedback=root.querySelector('#trial-feedback');firstFeedback.value='第一題的措辭不清楚';firstFeedback.listeners.input();
 assert.match(root.querySelector('#draft-status').textContent,/作答紀錄.*新修改/);
 click('下一題');assert.equal(find('h3'),undefined);
 const secondFeedback=root.querySelector('#trial-feedback');secondFeedback.value='第二題按鈕太遠';secondFeedback.listeners.input();
 click('上一題');assert.equal(find('textarea').value,reason.value);assert.equal(root.querySelector('#trial-feedback').value,firstFeedback.value);
 submit();assert.equal(find('h3').textContent,'有選項需要再核對');assert.equal(focused.id,'answer');
 assert.ok(all().filter(x=>x.tag==='input').every(x=>x.disabled));assert.equal(find('textarea').readOnly,true);
 click('下一題');click('上一題');assert.equal(find('h3').textContent,'有選項需要再核對');
 click('下載全部試讀回饋');assert.equal(downloaded.download,'taiwan-mahjong-trial-feedback.txt');
 const report=await blob.text();assert.ok(report.includes('題號 E01\n第一題的措辭不清楚'));assert.ok(report.includes('題號 E02\n第二題按鈕太遠'));
 assert.ok(!report.includes(reason.value));assert.ok(!report.includes(trainingQuestions[0].derivation));
 assert.equal(root.querySelector('#feedback-export').value,report);
 downloadFailure=true;click('下載全部試讀回饋');assert.ok(all().some(x=>x.textContent.includes('瀏覽器無法下載')));
 assert.equal(root.querySelector('#trial-feedback').value,firstFeedback.value);
 downloadFailure=false;click('匯出作答紀錄（含理由與回饋）');
 assert.equal(downloaded.download,'taiwan-mahjong-trial-answers.json');
 const answers=JSON.parse(await blob.text());assert.equal(answers.schemaVersion,2);assert.equal(answers.questions.length,9);
 assert.equal(answers.reasonAssessment,'not-reviewed');assert.equal(answers.schemaVersion,2);assert.equal(answers.contentRevision,trainingContentRevision);
 assert.equal(answers.questions[0].status,'submitted-and-revealed');
 assert.deepEqual(answers.questions[0].selected,trainingQuestions[0].choices);
 assert.equal(answers.questions[0].reason,reason.value);assert.equal(answers.questions[1].feedback,secondFeedback.value);
 assert.equal(answers.questions[1].status,'unanswered');
 assert.equal(answers.questions[0].prompt,trainingQuestions[0].prompt);
 assert.ok(!JSON.stringify(answers).includes(trainingQuestions[0].derivation));
 assert.ok(answers.questions.every(q=>!('accepted' in q)&&!('score' in q)));
 assert.equal(leaveHandlers.size,1,'交由瀏覽器下載不能當成檔案已保存');
 const feedback=root.querySelector('#trial-feedback');feedback.value+='（修改）';feedback.listeners.input();
 assert.match(root.querySelector('#draft-status').textContent,/作答紀錄、試讀回饋.*新修改/);
 downloadFailure=true;click('匯出作答紀錄（含理由與回饋）');
 assert.match(root.querySelector('#draft-status').textContent,/作答紀錄、試讀回饋.*新修改/);
 assert.equal(leaveHandlers.size,1);
 downloadFailure=false;click('匯出作答紀錄（含理由與回饋）');
 assert.match(root.querySelector('#draft-status').textContent,/試讀回饋.*新修改/);
 assert.ok(!root.querySelector('#draft-status').textContent.includes('作答紀錄'));
 click('下載全部試讀回饋');assert.ok(!root.querySelector('#draft-status').textContent.includes('新修改'));
 click('下一題');const secondReason=find('textarea');secondReason.value='新理由';secondReason.listeners.input();
 assert.match(root.querySelector('#draft-status').textContent,/作答紀錄.*新修改/);
 assert.ok(!root.querySelector('#draft-status').textContent.includes('試讀回饋'));
 secondReason.value='';secondReason.listeners.input();
 assert.ok(!root.querySelector('#draft-status').textContent.includes('新修改'),'回復原內容不需再次匯出');
});

test('離頁防護：空白無提醒、只有回饋或理由也保護、取消與切題保留、清空解除',()=>{
 const made=[], handlers=new Set();let downloads=0;
 class Element {
  listeners={};constructor(tag){this.tag=tag;made.push(this);}
  append(){} replaceChildren(){made.length=0;} setAttribute(){} focus(){}
  addEventListener(type,fn){this.listeners[type]=fn;}
  querySelector(selector){return made.findLast(x=>'#'+x.id===selector);}
  click(){downloads++;}
 }
 const root=new Element('root');
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/training.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:{},require:name=>name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},Blob,
  URL:{createObjectURL(){return 'blob:trial';},revokeObjectURL(){}},setTimeout:fn=>fn(),
  window:{addEventListener(type,fn){if(type==='pageshow')return;assert.equal(type,'beforeunload');handlers.add(fn);},removeEventListener(type,fn){assert.equal(type,'beforeunload');handlers.delete(fn);}},
  document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 const field=id=>root.querySelector('#'+id);
 const input=(id,value)=>{field(id).value=value;field(id).listeners.input();};
 const click=text=>made.find(x=>x.tag==='button'&&x.textContent===text).listeners.click();
 assert.equal(handlers.size,0);
 click('匯出作答紀錄（含理由與回饋）');assert.equal(downloads,1);assert.equal(handlers.size,0);
 input('trial-feedback','只有回饋');input('trial-feedback','只有回饋！');assert.equal(handlers.size,1);
 const event={prevented:false,returnValue:undefined,preventDefault(){this.prevented=true;}};
 for(const fn of handlers)fn(event);
 assert.equal(event.prevented,true);assert.equal(event.returnValue,'true');assert.equal(field('trial-feedback').value,'只有回饋！');
 click('下一題');assert.equal(handlers.size,1);click('上一題');assert.equal(field('trial-feedback').value,'只有回饋！');
 input('trial-feedback','');assert.equal(handlers.size,0);
 input('reason','只有理由');assert.equal(handlers.size,1);input('reason','');assert.equal(handlers.size,0);
 const choice=made.find(x=>x.tag==='input');choice.checked=true;choice.listeners.change();assert.equal(handlers.size,1);
 choice.checked=false;choice.listeners.change();assert.equal(handlers.size,0);assert.equal(field('draft-status').hidden,true);
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
 vm.runInNewContext(source,{exports:{},require:name=>name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions,trainingSkills,trainingContentRevision},
  window:{addEventListener(type,fn){if(type==='pageshow')pageShow=fn;else handlers.add(fn);},removeEventListener(type,fn){handlers.delete(fn);},location:{assign(url){navigation=url;}}},
  setTimeout:fn=>fn(),document:{querySelector:selector=>selector==='#training'?root:link,createElement:tag=>new Element(tag),body:{append(){}}}});
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
