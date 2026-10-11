export const DIRECTIONS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export const opposite=d=>({up:'down',down:'up',left:'right',right:'left'})[d];
export const mazeNames=['The first bite','Twists & turns','The zigzag club','The big adventure'];
function random(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export function makeMaze(level=1) {
  const width=21,height=23,rng=random([29,107,301,829][(level-1)%4]);
  const tiles=Array.from({length:height},()=>Array(width).fill('#'));
  for(let y=1;y<height-1;y+=2)for(let x=1;x<width-1;x+=2)tiles[y][x]='.';
  const visited=new Set(['1,1']);const stack=[{x:1,y:1}];
  while(stack.length) {
    const current=stack.at(-1);
    const neighbors=Object.values(DIRECTIONS).map(d=>({x:current.x+d.x*2,y:current.y+d.y*2})).filter(p=>p.x>0&&p.y>0&&p.x<width-1&&p.y<height-1&&!visited.has(`${p.x},${p.y}`));
    if(!neighbors.length){stack.pop();continue;}
    const next=neighbors[Math.floor(rng()*neighbors.length)];
    tiles[(current.y+next.y)/2][(current.x+next.x)/2]='.';
    visited.add(`${next.x},${next.y}`);stack.push(next);
  }
  // Add loops to a spanning maze: every collectible stays reachable.
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++) {
    if((x%2)!==(y%2)&&rng()<.48)tiles[y][x]='.';
  }
  // Clear a central ghost home and connect the side tunnels.
  for(let y=9;y<=11;y++)for(let x=7;x<=13;x++)tiles[y][x]=' ';
  for(let x=0;x<width;x++)tiles[11][x]=x>=7&&x<=13?' ':'.';
  const powers=[{x:1,y:1},{x:19,y:1},{x:1,y:21},{x:19,y:21}];
  powers.forEach(p=>tiles[p.y][p.x]='o');
  return {width,height,tiles,player:{x:9,y:19},ghosts:[{x:9,y:9},{x:11,y:9},{x:9,y:11},{x:11,y:11}],powers,name:mazeNames[(level-1)%4]};
}
export function isOpen(maze,x,y){return y>=0&&y<maze.height&&x>=0&&x<maze.width&&maze.tiles[y][x]!=='#';}
export function neighbor(maze,x,y,dir) {
  const d=DIRECTIONS[dir];let nx=x+d.x,ny=y+d.y;
  if(y===11){if(nx<0)nx=maze.width-1;if(nx>=maze.width)nx=0;}
  return isOpen(maze,nx,ny)?{x:nx,y:ny}:null;
}
export function validateMaze(maze) {
  const seen=new Set(),queue=[maze.player];
  while(queue.length){const p=queue.shift(),key=`${p.x},${p.y}`;if(seen.has(key))continue;seen.add(key);for(const dir of Object.keys(DIRECTIONS)){const n=neighbor(maze,p.x,p.y,dir);if(n&&!seen.has(`${n.x},${n.y}`))queue.push(n);}}
  for(let y=0;y<maze.height;y++)for(let x=0;x<maze.width;x++)if(maze.tiles[y][x]!=='#'&&!seen.has(`${x},${y}`))return false;
  return maze.ghosts.every(p=>seen.has(`${p.x},${p.y}`));
}
