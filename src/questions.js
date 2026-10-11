const integer=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
const pick=items=>items[integer(0,items.length-1)];
const shuffle=items=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=integer(0,i);[result[i],result[j]]=[result[j],result[i]];}return result;};
const names=['zero','one','two','three','four','five','six','seven','eight'];
const shapes=['circle','square','triangle','star','rectangle'];
const colors=['red','blue','yellow','green'];
const object=(shape='star',color='yellow')=>({shape,color});
const group=(count,shape='star',color='yellow')=>Array.from({length:count},()=>object(shape,color));
function numbers(correct,max=99) {
  const values=new Set([correct]);
  while(values.size<3) values.add(Math.max(0,correct+pick([-3,-2,-1,1,2,3])));
  return shuffle([...values]).map(n=>({id:String(n),label:String(n)}));
}
function math(settings,level) {
  const stage=Math.min(Math.max(level-1,0),9);
  const difficulty=settings.difficulty||'easy';
  const operation=settings.operation||'addition';
  let max={easy:5+stage,medium:12+stage*2,hard:25+stage*5}[difficulty];
  let a,b,result;
  if(operation==='multiplication'||operation==='division') {
    max={easy:Math.min(5,2+stage),medium:Math.min(10,5+stage),hard:Math.min(12,8+stage)}[difficulty];
    a=integer(1,max);b=integer(1,max);
    if(operation==='division'){result=a;a*=b;}else result=a*b;
  } else {
    a=integer(0,max);b=integer(0,max);
    if(operation==='subtraction'){[a,b]=[Math.max(a,b),Math.min(a,b)];result=a-b;}else result=a+b;
  }
  const symbol={addition:'+',subtraction:'−',multiplication:'×',division:'÷'}[operation];
  return {key:`${operation}:${a}:${b}`,a,b,prompt:'What is the answer?',expression:`${a} ${symbol} ${b} = ?`,answer:String(result),choices:numbers(result),visual:[]};
}
function preschool(settings,level,previous) {
  const categories=['counting','numbers','shapes','patterns'];
  const lastCategory=previous?.split(':')[0];
  const category=settings.category==='mixed'||!settings.category?categories[(categories.indexOf(lastCategory)+1)%4]:settings.category;
  const max=level<=2?3:level<=4?5:8;
  const count=integer(1,max);
  const shape=pick(level<=2?shapes.slice(0,3):shapes);
  const color=pick(colors);
  const base={category,visual:[]};
  if(category==='counting') return {...base,key:`counting:${count}:${shape}:${color}`,prompt:`How many ${shape==='circle'?'circles':shape+'s'} can you count?`,visual:group(count,shape,color),answer:String(count),choices:numbers(count)};
  if(category==='numbers') {
    const options=new Set([count]);while(options.size<3)options.add(integer(1,Math.max(3,max)));
    return {...base,key:`numbers:${count}:${shape}`,prompt:`Which group has ${names[count]}?`,expression:`${names[count]} · ${count}`,answer:String(count),choices:shuffle([...options]).map(n=>({id:String(n),label:`${n} ${shape==='circle'?'circles':shape+'s'}`,visual:group(n,shape,color)}))};
  }
  if(category==='shapes') {
    const colorQuestion=integer(0,1)===0;
    const correct=colorQuestion?color:shape;
    const choices=shuffle((colorQuestion?colors:(level<=2?shapes.slice(0,3):shapes)).filter(v=>v!==correct)).slice(0,2);
    return {...base,key:`shapes:${correct}:${colorQuestion}`,prompt:`Can you find the ${correct}${colorQuestion?' shape':''}?`,answer:correct,choices:shuffle([correct,...choices]).map(v=>({id:v,label:v,visual:[object(colorQuestion?'circle':v,colorQuestion?v:color)]}))};
  }
  const pattern=level<=2?[0,1]:level<=4?[0,0,1]:[0,1,2];
  const items=shuffle([object('circle','red'),object('square','blue'),object('triangle','yellow')]);
  const length=pattern.length*2;
  const visual=Array.from({length},(_,i)=>items[pattern[i%pattern.length]]);
  const answer=String(pattern[length%pattern.length]);
  return {...base,key:`patterns:${pattern.join('')}:${items.map(item=>item.shape).join('-')}`,prompt:'What comes next in the pattern?',visual,pattern:true,answer,choices:shuffle(items.map((item,i)=>({id:String(i),label:`${item.color} ${item.shape}`,visual:[item]})))};
}
export function createQuestion(settings,level=1,previousKey) {
  let result;
  for(let attempt=0;attempt<30;attempt++) {
    result=settings.age===3?preschool(settings,level,previousKey):math(settings,level);
    if(result.key!==previousKey)break;
  }
  return result;
}
