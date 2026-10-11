import {Game} from './game.js';
import {drawGame} from './render.js';
import {joystickDirection} from './input.js';
import {Audio} from './audio.js';
const $=id=>document.getElementById(id);
const label=value=>value.charAt(0).toUpperCase()+value.slice(1);
const storage={get(){try{return JSON.parse(localStorage.getItem('pac-learn-preferences')||'{}');}catch{return {}; }},set(data){try{localStorage.setItem('pac-learn-preferences',JSON.stringify(data));}catch{}}};
const saved=storage.get()||{};
const settings={age:saved.age===3?3:7,operation:['addition','subtraction','multiplication','division'].includes(saved.operation)?saved.operation:'addition',difficulty:['easy','medium','hard'].includes(saved.difficulty)?saved.difficulty:'easy',category:['mixed','counting','numbers','shapes','patterns'].includes(saved.category)?saved.category:'mixed'};
const audio=new Audio(saved.sound!==false);
export let game=null;
let lastTime=0,dialogSignature='',lastSpokenQuestion=null,activePointer=null;
function save(){storage.set({...settings,sound:audio.enabled});}
function text(id,value){if($(id).textContent!==String(value))$(id).textContent=value;}
function updateSetup() {
  for(const key of ['age','operation','difficulty','category'])document.querySelectorAll(`[data-${key}]`).forEach(button=>{const selected=button.dataset[key]===String(settings[key]);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  $('math-settings').hidden=settings.age===3;$('little-settings').hidden=settings.age!==3;
  text('rules-note',settings.age===3?'Picture questions, gentle ghosts. Get 3 right in a row for an extra life.':'Answer to chase blue ghosts. Get 10 right in a row for an extra life.');
  text('difficulty-note',{easy:'Little numbers. A lovely place to start.',medium:'A little more thinking. A little more adventure.',hard:'Bigger numbers for a bigger challenge.'}[settings.difficulty]);
}
for(const key of ['age','operation','difficulty','category'])document.querySelectorAll(`[data-${key}]`).forEach(button=>button.addEventListener('click',()=>{settings[key]=key==='age'?Number(button.dataset[key]):button.dataset[key];save();updateSetup();}));
function updateSound(){text('sound-text',audio.enabled?'Sound on':'Sound off');$('sound-toggle').setAttribute('aria-label',audio.enabled?'Turn sound off':'Turn sound on');$('sound-toggle').setAttribute('aria-pressed',String(!audio.enabled));}
$('sound-toggle').addEventListener('click',()=>{audio.toggle();updateSound();save();});
function start() {
  audio.unlock();audio.cancelSpeech();game=new Game(settings);lastTime=performance.now();lastSpokenQuestion=null;dialogSignature='';
  $('setup-screen').hidden=true;$('game-screen').hidden=false;document.body.classList.add('playing');
  if($('game-dialog').open)$('game-dialog').close();
  text('mode-label',settings.age===7?`Math explorer · ${label(settings.operation)} · ${label(settings.difficulty)}`:`Little explorer · ${{mixed:'A little of everything',counting:'Counting objects',numbers:'Number names',shapes:'Shapes & colors',patterns:'Repeating patterns'}[settings.category]}`);
  $('pause-button').focus({preventScroll:true});window.scrollTo({top:0});sync();
}
$('start-button').addEventListener('click',start);$('replay-button').addEventListener('click',start);
function newGame(){audio.cancelSpeech();game=null;resetJoystick();$('game-dialog').close();$('game-screen').hidden=true;$('setup-screen').hidden=false;document.body.classList.remove('playing');$('start-button').focus({preventScroll:true});window.scrollTo({top:0});}
document.querySelectorAll('.new-game-button').forEach(button=>button.addEventListener('click',newGame));
function pause(){if(!game)return;game.pause();resetJoystick();audio.cancelSpeech();sync();}
$('pause-button').addEventListener('click',pause);
$('resume-button').addEventListener('click',()=>{audio.unlock();game.resume();lastTime=performance.now();dialogSignature='';sync();});
$('continue-button').addEventListener('click',()=>{audio.cancelSpeech();game.continue();lastTime=performance.now();sync();});
$('speak-button').addEventListener('click',()=>{if(!audio.enabled){audio.toggle();updateSound();save();}audio.speak(game.question.prompt);});
$('game-dialog').addEventListener('cancel',event=>{event.preventDefault();if(game?.phase==='paused')return;pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game)pause();});
window.addEventListener('blur',()=>{if(game)pause();});
window.addEventListener('keydown',event=>{
  if(!game)return;
  const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
  if(directions[event.key]&&(game.phase==='playing'||game.phase==='ready')){event.preventDefault();game.requestDirection(directions[event.key]);}
  if((event.key==='p'||event.key==='P')&&!event.repeat){event.preventDefault();if(game.phase==='paused'){$('resume-button').click();}else pause();}
});
const joystick=$('joystick');
function steer(event){const r=joystick.getBoundingClientRect(),dx=event.clientX-(r.left+r.width/2),dy=event.clientY-(r.top+r.height/2),length=Math.hypot(dx,dy),limit=r.width*.25;const scale=length>limit?limit/length:1;$('joystick-knob').style.transform=`translate(${dx*scale}px,${dy*scale}px)`;const direction=joystickDirection(dx,dy);if(direction&&game&&(game.phase==='playing'||game.phase==='ready'))game.requestDirection(direction);}
function resetJoystick(){if(activePointer!==null){try{joystick.releasePointerCapture(activePointer);}catch{}}activePointer=null;$('joystick-knob').style.transform='';}
joystick.addEventListener('pointerdown',event=>{if(activePointer!==null)return;activePointer=event.pointerId;joystick.setPointerCapture(event.pointerId);steer(event);});
joystick.addEventListener('pointermove',event=>{if(event.pointerId===activePointer)steer(event);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,resetJoystick);
const colorMap={red:'#ff748a',blue:'#8099ff',yellow:'#ffe261',green:'#8ce2af'};
function shapeElement(item){const span=document.createElement('span');span.className=`shape ${item.shape}`;span.style.setProperty('--object-color',colorMap[item.color]);span.setAttribute('aria-hidden','true');return span;}
function buildQuestion() {
  const q=game.question,r=game.result;
  text('dialog-title',q.prompt);text('question-expression',q.expression||'');
  $('speak-button').hidden=game.settings.age!==3;
  $('speak-button').disabled=!audio.speechAvailable;
  if(!audio.speechAvailable)text('speak-button','Read the question together');
  const visual=$('question-visual');visual.replaceChildren(...q.visual.map(shapeElement));
  visual.setAttribute('aria-label',q.visual.map(v=>`${v.color} ${v.shape}`).join(', '));
  if(q.pattern){const unknown=document.createElement('span');unknown.className='pattern-unknown';unknown.textContent='?';visual.append(unknown);}
  const answers=$('answers');answers.replaceChildren();
  for(const choice of q.choices) {
    const button=document.createElement('button');button.className='answer-button';button.dataset.answer=choice.id;button.setAttribute('aria-label',choice.label);
    if(choice.visual){button.classList.add('has-visual');const group=document.createElement('span');group.className='answer-visual';group.append(...choice.visual.map(shapeElement));button.append(group);}
    const caption=document.createElement('span');caption.textContent=choice.label;button.append(caption);
    if(r&&!r.retry){button.disabled=true;button.classList.toggle('correct',choice.id===q.answer);button.classList.toggle('incorrect',choice.id===r.id&&!r.correct);}
    button.addEventListener('click',()=>{audio.unlock();game.answer(choice.id);sync();});answers.append(button);
  }
  $('continue-button').hidden=!r||r.retry;
  text('feedback',!r?'':r.retry?'Try again. You can do it!':r.correct?`${r.extraLife?'An extra life! ':''}Great thinking! 12 seconds to chase.`:`The answer is ${q.answer}. You have 5 seconds to chase.`);
  $('feedback').className=`feedback ${r?.retry?'retry':r?.correct?'success':''}`;
  if(q!==lastSpokenQuestion&&game.settings.age===3){audio.speak(q.prompt);lastSpokenQuestion=q;}
}
function sync() {
  if(!game)return;
  text('score',game.score.toLocaleString());text('level',String(game.level).padStart(2,'0'));text('map-name',game.maze.name);
  text('lives',game.lives<=7?'♥ '.repeat(game.lives).trim():`♥ × ${game.lives}`);$('lives').setAttribute('aria-label',`${game.lives} lives`);
  text('streak',`${game.streak} / ${game.goal}`);text('game-notice',game.notice);
  text('power-label',game.frightened>0?`Blue ghosts · ${Math.ceil(game.frightened)}s`:'Find a power pellet');
  text('power-hint',game.frightened>0?'Go get them!':'Then it’s your turn to chase.');$('power-progress').value=game.frightened;
  $('ready-overlay').hidden=game.phase!=='ready';text('countdown',Math.max(1,Math.ceil(game.countdown)));
  const modal=['question','paused','over'].includes(game.phase),dialog=$('game-dialog');
  if(!modal){if(dialog.open)dialog.close();dialogSignature='';}
  else {
    const signature=`${game.phase}|${game.question?.key}|${JSON.stringify(game.result)}`;
    if(signature!==dialogSignature) {
      dialogSignature=signature;
      $('question-panel').hidden=game.phase!=='question';$('pause-panel').hidden=game.phase!=='paused';$('over-panel').hidden=game.phase!=='over';
      if(game.phase==='question')buildQuestion();
      if(game.phase==='over'){text('final-score',game.score.toLocaleString());text('over-summary',`You reached level ${game.level} and solved ${game.stats.correct} of ${game.stats.questions} questions on the first try.`);audio.cancelSpeech();}
      const heading=game.phase==='question'?$('dialog-title'):$(game.phase==='paused'?'pause-panel':'over-panel').querySelector('h2');heading.id=game.phase==='question'?'dialog-title':`${game.phase}-title`;dialog.setAttribute('aria-labelledby',heading.id);
      if(!dialog.open)dialog.showModal();
      const focus=game.phase==='question'?(game.result&&!game.result.retry?$('continue-button'):$('answers').querySelector('button')):game.phase==='paused'?$('resume-button'):$('replay-button');focus?.focus({preventScroll:true});
    }
  }
  for(const event of game.events.splice(0))audio.play(event);
}
function frame(now) {
  if(game){game.step(Math.min((now-lastTime)/1000,.05));sync();drawGame($('board'),game,now/1000);}
  lastTime=now;requestAnimationFrame(frame);
}
updateSetup();updateSound();
const preview=new Game({age:7,operation:'addition',difficulty:'easy'});preview.player.x=9;preview.player.y=15;preview.player.dir='right';preview.ghosts[0].x=5;preview.ghosts[0].y=5;preview.ghosts[1].x=15;preview.ghosts[1].y=7;drawGame($('preview'),preview);
requestAnimationFrame(frame);
