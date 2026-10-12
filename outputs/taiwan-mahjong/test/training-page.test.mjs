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

test('試讀實際控制流程：提交前无答案，空答不揭示，多選混入錯項不算符合，切題保留理由',()=>{
 let focused;
 class Element {
  children=[]; listeners={}; textContent='';
  constructor(tag){this.tag=tag;}
  append(...items){this.children.push(...items);}
  replaceChildren(){this.children=[];}
  setAttribute(){}
  addEventListener(type,fn){this.listeners[type]=fn;}
  focus(){focused=this;}
  querySelector(selector){return all(this).find(x=>'#'+x.id===selector);}
 }
 const root=new Element('root');
 const all=(node=root)=>[node,...node.children.flatMap(x=>all(x))];
 const find=(tag,text)=>all().find(x=>x.tag===tag&&(text===undefined||x.textContent===text));
 const click=text=>find('button',text).listeners.click();
 const submit=()=>find('form').listeners.submit({preventDefault(){}});
 const source=ts.transpileModule(fs.readFileSync(new URL('../src/training.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:{},require:()=>({trainingQuestions}),document:{querySelector:()=>root,createElement:tag=>new Element(tag)}});
 assert.equal(find('h3'),undefined);submit();assert.equal(find('h3'),undefined);
 for(const input of all().filter(x=>x.tag==='input')){input.checked=true;input.listeners.change();}
 const reason=find('textarea');reason.value='<script>測試</script>';reason.listeners.input();
 click('下一題');assert.equal(find('h3'),undefined);click('上一題');assert.equal(find('textarea').value,reason.value);
 submit();assert.equal(find('h3').textContent,'有選項需要再核對');assert.equal(focused.id,'answer');
 assert.ok(all().filter(x=>x.tag==='input').every(x=>x.disabled));assert.equal(find('textarea').readOnly,true);
 click('下一題');click('上一題');assert.equal(find('h3').textContent,'有選項需要再核對');
});
