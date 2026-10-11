import {position} from './game.js';
export function drawGame(canvas,game,time=0) {
  const ctx=canvas.getContext('2d'),m=game.maze,unit=canvas.width/m.width;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07091c';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.lineWidth=unit*.055;ctx.lineCap='round';ctx.strokeStyle='#496cff';
  for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++) {
    const tile=m.tiles[y][x],px=x*unit,py=y*unit;
    if(tile==='#') {
      ctx.fillStyle='#121a4c';ctx.fillRect(px,py,unit,unit);
      ctx.beginPath();
      if(y>0&&m.tiles[y-1][x]!=='#'){ctx.moveTo(px+1,py+2);ctx.lineTo(px+unit-1,py+2);}
      if(y<m.height-1&&m.tiles[y+1][x]!=='#'){ctx.moveTo(px+1,py+unit-2);ctx.lineTo(px+unit-1,py+unit-2);}
      if(x>0&&m.tiles[y][x-1]!=='#'){ctx.moveTo(px+2,py+1);ctx.lineTo(px+2,py+unit-1);}
      if(x<m.width-1&&m.tiles[y][x+1]!=='#'){ctx.moveTo(px+unit-2,py+1);ctx.lineTo(px+unit-2,py+unit-1);}
      ctx.stroke();
    }else if(tile==='.'||tile==='o') {
      ctx.fillStyle=tile==='o'?'#ffe68c':'#dfd7ba';
      ctx.beginPath();ctx.arc(px+unit/2,py+unit/2,tile==='o'?unit*(.22+Math.sin(time*4)*.025):unit*.065,0,Math.PI*2);ctx.fill();
    }
  }
  for(const g of game.ghosts)drawGhost(ctx,g,game,unit,time);
  const p=position(game.player,m.width),cx=(p.x+.5)*unit,cy=(p.y+.5)*unit;
  ctx.save();ctx.translate(cx,cy);ctx.rotate({right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[game.player.dir]);
  ctx.globalAlpha=game.grace>0&&Math.sin(time*15)>0?.45:1;
  const mouth=game.phase==='playing'?.12+Math.abs(Math.sin(time*13))*.22:.23;
  ctx.fillStyle='#ffe261';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,unit*.43,mouth*Math.PI,(2-mouth)*Math.PI);ctx.closePath();ctx.fill();ctx.restore();
}
function drawGhost(ctx,g,game,u,time) {
  const p=position(g,game.maze.width);ctx.save();ctx.translate((p.x+.5)*u,(p.y+.5)*u);
  const frightened=game.frightened>0&&!g.returning;
  if(!g.returning) {
    ctx.fillStyle=frightened?(game.frightened<3&&Math.sin(time*12)>0?'#f2edff':'#6178ff'):g.color;
    ctx.beginPath();ctx.arc(0,-u*.05,u*.39,Math.PI,0);ctx.lineTo(u*.39,u*.38);
    for(let i=3;i>=-3;i--)ctx.lineTo(i*u*.13,(i%2===0?.26:.38)*u);
    ctx.lineTo(-u*.39,-u*.05);ctx.fill();
  }
  if(frightened) {
    ctx.fillStyle='#fff';ctx.fillRect(-u*.19,-u*.12,u*.08,u*.09);ctx.fillRect(u*.11,-u*.12,u*.08,u*.09);
    ctx.strokeStyle='#fff';ctx.lineWidth=u*.045;ctx.beginPath();ctx.moveTo(-u*.2,u*.19);for(let i=0;i<5;i++)ctx.lineTo((-0.2+i*.1)*u,(i%2?.13:.19)*u);ctx.stroke();
  }else {
    const d={left:[-.04,0],right:[.04,0],up:[0,-.04],down:[0,.04]}[g.dir];
    for(const eye of [-.16,.16]){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(eye*u,-u*.06,u*.105,u*.14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#19245a';ctx.beginPath();ctx.arc((eye+d[0])*u,(-.06+d[1])*u,u*.055,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
