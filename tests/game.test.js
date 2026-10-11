import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {joystickDirection} from '../src/input.js';
const settings={age:7,operation:'addition',difficulty:'easy'};
function question(game){game.phase='playing';const p=game.maze.powers[0];game.player.x=p.x;game.player.y=p.y;game.player.to=null;game.maze.tiles[p.y][p.x]='o';game.eat();}
test('questions freeze actors and frightened time; right and wrong answers change duration',()=>{
  const g=new Game(settings);question(g);g.frightened=7;
  const x=g.player.x;g.step(20);assert.equal(g.player.x,x);assert.equal(g.frightened,7);
  g.answer(g.question.answer);g.answer('wrong');assert.equal(g.result.correct,true);
  g.continue();assert.equal(g.frightened,12);
  question(g);g.answer(g.question.choices.find(c=>c.id!==g.question.answer).id);g.continue();assert.equal(g.frightened,5);
});
test('ten correct math answers reward one life; wrong answer resets streak',()=>{
  const g=new Game(settings);
  for(let i=0;i<10;i++){question(g);g.answer(g.question.answer);g.continue();}
  assert.equal(g.lives,6);assert.equal(g.streak,0);
  question(g);g.answer(g.question.answer);g.continue();assert.equal(g.streak,1);
  question(g);g.answer(g.question.choices.find(c=>c.id!==g.question.answer).id);assert.equal(g.streak,0);
});
test('preschool retries cannot earn first-attempt streak credit',()=>{
  const g=new Game({age:3,category:'counting'});
  question(g);g.answer(g.question.answer);g.continue();assert.equal(g.streak,1);
  question(g);g.answer(g.question.choices.find(c=>c.id!==g.question.answer).id);
  assert.equal(g.phase,'question');assert.equal(g.result.retry,true);assert.equal(g.streak,0);
  const scoreBeforeCorrection=g.score;g.answer(g.question.answer);assert.equal(g.score,scoreBeforeCorrection+100);
  g.continue();assert.equal(g.streak,0);assert.equal(g.frightened,12);
  for(let i=0;i<3;i++){question(g);g.answer(g.question.answer);g.continue();}
  assert.equal(g.lives,6);
});
test('pause and visibility-style repeated pauses preserve question state and time',()=>{
  const g=new Game(settings);question(g);g.frightened=6;const q=g.question;
  g.pause();g.pause();g.step(100);assert.equal(g.frightened,6);
  g.resume();assert.equal(g.phase,'question');assert.equal(g.question,q);
});
test('last power pellet defers level transition until after feedback',()=>{
  const g=new Game(settings);for(const row of g.maze.tiles)for(let x=0;x<row.length;x++)if(row[x]==='.'||row[x]==='o')row[x]=' ';
  question(g);assert.equal(g.level,1);g.answer(g.question.answer);assert.equal(g.level,1);
  g.continue();assert.equal(g.level,2);assert.equal(g.phase,'ready');assert.equal(g.streak,1);
});
test('collisions preserve pellets and streak, respawn safely, and end at zero lives',()=>{
  const g=new Game(settings);g.phase='playing';g.streak=4;
  const p=g.player;g.maze.tiles[p.y][p.x]=' ';g.ghosts[0].x=p.x;g.ghosts[0].y=p.y;g.ghosts[0].wait=0;
  g.collisions();assert.equal(g.lives,4);assert.equal(g.phase,'ready');assert.equal(g.streak,4);
  g.lives=1;g.phase='playing';g.grace=0;g.ghosts[0].x=g.player.x;g.ghosts[0].y=g.player.y;g.ghosts[0].wait=0;
  g.collisions();assert.equal(g.lives,0);assert.equal(g.phase,'over');
});
test('frightened ghosts become harmless returning eyes',()=>{
  const g=new Game(settings);g.phase='playing';g.frightened=10;
  g.ghosts[0].x=g.player.x;g.ghosts[0].y=g.player.y;g.ghosts[0].wait=0;
  g.collisions();assert.equal(g.ghosts[0].returning,true);assert.equal(g.score,200);
  g.frightened=0;g.collisions();assert.equal(g.lives,5);
});
test('queued turns are taken only along open passages and movement eats pellets',()=>{
  const g=new Game(settings);g.phase='playing';g.grace=100;
  const start=g.score;g.requestDirection('up');g.step(.4);assert.ok(g.score>start);
  assert.notEqual(g.maze.tiles[g.player.y][g.player.x],'#');
});
test('joystick uses cardinal directions and a center dead zone',()=>{
  assert.equal(joystickDirection(2,2),null);assert.equal(joystickDirection(30,4),'right');
  assert.equal(joystickDirection(-30,4),'left');assert.equal(joystickDirection(4,-30),'up');assert.equal(joystickDirection(4,30),'down');
});
