import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuestion} from '../src/questions.js';

for (const operation of ['addition','subtraction','multiplication','division']) {
  test(`${operation}: every difficulty and map produces valid unique choices`, () => {
    for (const difficulty of ['easy','medium','hard']) for (const level of [1,3,10,100]) {
      for (let n=0;n<40;n++) {
        const q=createQuestion({age:7,operation,difficulty},level);
        assert.equal(q.choices.length,3);
        assert.equal(new Set(q.choices.map(c=>c.id)).size,3);
        assert.ok(q.choices.some(c=>c.id===q.answer));
        const {a,b}=q;
        const expected={addition:a+b,subtraction:a-b,multiplication:a*b,division:a/b}[operation];
        assert.equal(Number(q.answer),expected);
        assert.ok(Number.isInteger(expected) && expected>=0);
        if(operation==='division') assert.notEqual(b,0);
        if(difficulty==='easy' && level===1 && operation==='addition') assert.ok(a<=5 && b<=5);
      }
    }
  });
}
test('question does not immediately repeat its predecessor',()=>{
  let previous;
  for(let i=0;i<100;i++) {
    const q=createQuestion({age:7,operation:'multiplication',difficulty:'easy'},1,previous);
    assert.notEqual(q.key,previous);previous=q.key;
  }
});
for(const category of ['counting','numbers','shapes','patterns']) {
  test(`preschool ${category} provides visible answers at every stage`,()=>{
    for(const level of [1,3,5,20]) for(let i=0;i<20;i++) {
      const q=createQuestion({age:3,category},level);
      assert.equal(q.category,category);
      assert.ok(q.prompt.length>0);
      assert.equal(new Set(q.choices.map(c=>c.id)).size,3);
      assert.ok(q.choices.some(c=>c.id===q.answer));
      if(category==='counting') assert.equal(q.visual.length,Number(q.answer));
      if(category==='numbers') assert.equal(q.choices.find(c=>c.id===q.answer).visual.length,Number(q.answer));
    }
  });
}
test('mixed preschool questions rotate all four categories',()=>{
  let previous;const categories=[];
  for(let i=0;i<4;i++) {const q=createQuestion({age:3,category:'mixed'},1,previous);categories.push(q.category);previous=q.key;}
  assert.equal(new Set(categories).size,4);
});
test('preschool patterns offer varied objects instead of repeating one question',()=>{
  let previous;
  for(let i=0;i<12;i++){const q=createQuestion({age:3,category:'patterns'},1,previous);assert.notEqual(q.key,previous);previous=q.key;}
});
