import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {trainingQuestions} from '../dist/training-data.js';

test('試讀包只有九道已複核訓練題，保留候選與額外資料不進包',()=>{
 const all=['TRAINING-DRAFTS.json','TRAINING-REVIEW-CANDIDATES.json'].flatMap(f=>JSON.parse(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8')).cases);
 assert.equal(trainingQuestions.length,9);
 assert.deepEqual(trainingQuestions.map(q=>q.id),all.filter(q=>q.purpose==='training').map(q=>q.id));
 for(const q of trainingQuestions)assert.deepEqual(Object.keys(q).sort(),['accepted','board','choices','derivation','id','prompt']);
 assert.ok(all.filter(q=>q.purpose!=='training').every(q=>!JSON.stringify(trainingQuestions).includes(q.prompt)));
});

test('試讀控制與回饋：揭示界線、草稿保留、只匯出意見及下載失敗回退',async()=>{
 let focused, downloaded, blob, downloadFailure=false;
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
 vm.runInNewContext(source,{exports:{},require:name=>name==='./tile-face.js'?{tileFace:()=>new Element('svg')}:{trainingQuestions},Blob,
  URL:{createObjectURL(value){if(downloadFailure)throw Error('blocked');blob=value;return 'blob:trial';},revokeObjectURL(){}},
  setTimeout:fn=>fn(),document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 click('下載全部試讀回饋');assert.equal(downloaded,undefined);
 assert.equal(find('h3'),undefined);submit();assert.equal(find('h3'),undefined);
 for(const input of all().filter(x=>x.tag==='input')){input.checked=true;input.listeners.change();}
 const reason=find('textarea');reason.value='<script>測試</script>';reason.listeners.input();
 click('匯出作答紀錄（含理由與回饋）');
 const draftReport=JSON.parse(await blob.text());assert.equal(draftReport.questions[0].status,'draft');
 assert.equal(draftReport.questions[1].status,'unanswered');assert.equal(find('h3'),undefined);
 const firstFeedback=root.querySelector('#trial-feedback');firstFeedback.value='第一題的措辭不清楚';firstFeedback.listeners.input();
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
 const answers=JSON.parse(await blob.text());assert.equal(answers.schemaVersion,1);assert.equal(answers.questions.length,9);
 assert.equal(answers.reasonAssessment,'not-reviewed');
 assert.equal(answers.questions[0].status,'submitted-and-revealed');
 assert.deepEqual(answers.questions[0].selected,trainingQuestions[0].choices);
 assert.equal(answers.questions[0].reason,reason.value);assert.equal(answers.questions[1].feedback,secondFeedback.value);
 assert.equal(answers.questions[1].status,'unanswered');
 assert.equal(answers.questions[0].prompt,trainingQuestions[0].prompt);
 assert.ok(!JSON.stringify(answers).includes(trainingQuestions[0].derivation));
 assert.ok(answers.questions.every(q=>!('accepted' in q)&&!('score' in q)));
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
 assert.match(trainingQuestions.find(q=>q.id==='C03').board[0].label,/尚未副露/);
});
