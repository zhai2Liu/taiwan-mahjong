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
 for(const q of trainingQuestions)assert.deepEqual(Object.keys(q).sort(),['accepted','choices','derivation','id','prompt']);
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
 vm.runInNewContext(source,{exports:{},require:()=>({trainingQuestions}),Blob,
  URL:{createObjectURL(value){if(downloadFailure)throw Error('blocked');blob=value;return 'blob:trial';},revokeObjectURL(){}},
  setTimeout:fn=>fn(),document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 click('下載全部試讀回饋');assert.equal(downloaded,undefined);
 assert.equal(find('h3'),undefined);submit();assert.equal(find('h3'),undefined);
 for(const input of all().filter(x=>x.tag==='input')){input.checked=true;input.listeners.change();}
 const reason=find('textarea');reason.value='<script>測試</script>';reason.listeners.input();
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
});
