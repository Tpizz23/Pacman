import {makeMaze,neighbor,DIRECTIONS,opposite} from './mazes.js';
import {createQuestion} from './questions.js';
const actor=(p,dir='left')=>({...p,dir,to:null,progress:0});
export function position(a,width=21) {
  if(!a.to)return {x:a.x,y:a.y};
  let dx=a.to.x-a.x;
  if(Math.abs(dx)>1)dx=dx>0?-1:1;
  let x=a.x+dx*a.progress;
  if(x<-.5)x+=width;if(x>width-.5)x-=width;
  return {x,y:a.y+(a.to.y-a.y)*a.progress};
}
export class Game {
  constructor(settings) {
    this.settings={...settings};this.level=1;this.score=0;this.lives=5;this.streak=0;
    this.goal=settings.age===3?3:10;this.stats={questions:0,correct:0};this.events=[];this.time=0;
    this.loadLevel();
  }
  loadLevel() {
    this.maze=makeMaze(this.level);this.question=null;this.result=null;this.frightened=0;
    this.resetActors();this.notice=this.level===1?'Ready, little explorer?':`Level ${this.level}! A new maze awaits.`;
    this.events.push('level');
  }
  resetActors() {
    this.player=actor(this.maze.player);
    this.ghosts=this.maze.ghosts.map((p,i)=>({...actor(p,i%2?'right':'left'),home:{...p},returning:false,wait:1+i*1.5,color:['#ff647f','#ffb8e3','#69e1ef','#ffb467'][i]}));
    this.frightened=0;this.chain=0;this.grace=0;this.countdown=3;this.phase='ready';
  }
  requestDirection(dir){if(DIRECTIONS[dir])this.wanted=dir;}
  pause(){if(this.phase!=='paused'&&this.phase!=='over'){this.beforePause=this.phase;this.phase='paused';}}
  resume(){if(this.phase==='paused'){this.phase=this.beforePause||'playing';}}
  step(seconds) {
    if(!Number.isFinite(seconds)||seconds<=0)return;
    // Fixed small steps prevent actors crossing each other between collision checks.
    for(let remaining=seconds;remaining>1e-8;remaining-=1/60) {
      const dt=Math.min(remaining,1/60);
      if(this.phase==='ready') {this.countdown-=dt;if(this.countdown<=0){this.phase='playing';this.grace=2;}continue;}
      if(this.phase!=='playing')return;
      this.time+=dt;this.grace=Math.max(0,this.grace-dt);this.frightened=Math.max(0,this.frightened-dt);
      if(!this.player.to)this.eat();if(this.phase!=='playing')return;
      this.move(this.player,(this.settings.age===3?4.2:5.2),dt,()=>this.playerDirection());
      if(this.phase!=='playing')return;
      this.ghosts.forEach((g,i)=>{
        if(g.wait>0){g.wait-=dt;return;}
        const speed=g.returning?8:this.frightened>0?2.2:Math.min((this.settings.age===3?2.2:3.15)+(this.level-1)*.12,this.settings.age===3?3.15:4.6);
        this.move(g,speed,dt,()=>this.ghostDirection(g,i));
        if(g.returning&&!g.to&&g.x===g.home.x&&g.y===g.home.y){g.returning=false;g.wait=2;}
      });
      this.collisions();
    }
  }
  playerDirection() {
    if(this.wanted&&neighbor(this.maze,this.player.x,this.player.y,this.wanted))return this.wanted;
    return neighbor(this.maze,this.player.x,this.player.y,this.player.dir)?this.player.dir:null;
  }
  move(a,speed,dt,choose) {
    if(!a.to){const dir=choose();if(!dir)return;a.dir=dir;a.to=neighbor(this.maze,a.x,a.y,dir);if(!a.to)return;a.progress=0;}
    a.progress+=speed*dt;
    if(a.progress>=1){a.x=a.to.x;a.y=a.to.y;a.to=null;a.progress=0;if(a===this.player)this.eat();}
  }
  ghostDirection(g,i) {
    let options=Object.keys(DIRECTIONS).filter(d=>neighbor(this.maze,g.x,g.y,d));
    if(options.length>1&&!g.returning)options=options.filter(d=>d!==opposite(g.dir));
    if(this.frightened>0&&!g.returning)return options[Math.floor(Math.random()*options.length)];
    let target=g.returning?g.home:this.player;
    const scatter=Math.floor(this.time/7)%4===0;
    if(!g.returning) {
      if(scatter)target=[{x:19,y:1},{x:1,y:1},{x:19,y:21},{x:1,y:21}][i];
      else if(i===1){const d=DIRECTIONS[this.player.dir];const ahead={x:this.player.x+d.x*3,y:this.player.y+d.y*3};if(neighbor(this.maze,ahead.x,ahead.y,'left'))target=ahead;}
      else if(i===2&&Math.floor(this.time/10)%2===0)target={x:19,y:21};
      else if(i===3&&Math.hypot(g.x-this.player.x,g.y-this.player.y)<5)target={x:1,y:21};
    }
    // Breadth-first distances handle walls instead of trapping ghosts on local minima.
    const distances=new Map([[`${target.x},${target.y}`,0]]),queue=[target];
    for(let j=0;j<queue.length;j++){const p=queue[j],distance=distances.get(`${p.x},${p.y}`);for(const d of Object.keys(DIRECTIONS)){const n=neighbor(this.maze,p.x,p.y,d);if(n&&!distances.has(`${n.x},${n.y}`)){distances.set(`${n.x},${n.y}`,distance+1);queue.push(n);}}}
    return options.sort((a,b)=>{const pa=neighbor(this.maze,g.x,g.y,a),pb=neighbor(this.maze,g.x,g.y,b);return (distances.get(`${pa.x},${pa.y}`)??999)-(distances.get(`${pb.x},${pb.y}`)??999);})[0];
  }
  eat() {
    const {x,y}=this.player,tile=this.maze.tiles[y][x];
    if(tile!=='.'&&tile!=='o')return;
    this.maze.tiles[y][x]=' ';this.score+=tile==='o'?50:10;this.events.push(tile==='o'?'power':'pellet');
    const cleared=!this.maze.tiles.some(row=>row.some(t=>t==='.'||t==='o'));
    if(tile==='o') {
      this.question=createQuestion(this.settings,this.level,this.previousQuestion);this.previousQuestion=this.question.key;
      this.result=null;this.failed=false;this.pendingLevel=cleared;this.phase='question';this.stats.questions++;
    }else if(cleared){this.level++;this.loadLevel();}
  }
  answer(id) {
    if(this.phase!=='question'||(this.result&&!this.result.retry)||!this.question.choices.some(c=>c.id===id))return;
    const correct=id===this.question.answer;
    if(!correct){this.streak=0;this.failed=true;this.events.push('wrong');}
    if(this.settings.age===3&&!correct){this.result={correct:false,retry:true,id};return;}
    let extraLife=false;
    if(correct&&!this.failed) {
      this.stats.correct++;this.score+=100;this.streak++;
      if(this.streak>=this.goal){this.streak=0;this.lives++;extraLife=true;this.events.push('life');}
    }
    this.result={correct,retry:false,id,extraLife,seconds:correct?12:5};
    this.events.push(correct?'correct':'answered');
  }
  continue() {
    if(this.phase!=='question'||!this.result||this.result.retry)return;
    if(this.pendingLevel){this.pendingLevel=false;this.level++;this.loadLevel();return;}
    this.frightened=this.result.seconds;this.chain=0;this.phase='playing';this.question=null;this.result=null;
    this.notice='Chase the blue ghosts!';
  }
  collisions() {
    if(this.phase!=='playing')return;
    const p=position(this.player);
    for(const g of this.ghosts) {
      if(g.returning||g.wait>0)continue;
      const q=position(g),dx=Math.min(Math.abs(p.x-q.x),this.maze.width-Math.abs(p.x-q.x));
      if(Math.hypot(dx,p.y-q.y)>.65)continue;
      if(this.frightened>0){this.score+=200*2**Math.min(this.chain++,3);g.returning=true;this.events.push('ghost');}
      else if(this.grace<=0){this.lives--;this.events.push('lost');if(this.lives<=0)this.phase='over';else{this.resetActors();this.wanted=null;this.notice='You’ve got this. Try again!';}break;}
    }
  }
}
