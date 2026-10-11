import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMaze,validateMaze} from '../src/mazes.js';
test('every maze is connected with four reachable power pellets and safe spawns',()=>{
  const layouts=new Set();
  for(let level=1;level<=8;level++) {
    const m=makeMaze(level);assert.equal(validateMaze(m),true);
    assert.equal(m.powers.length,4);assert.equal(m.ghosts.length,4);
    assert.equal(m.tiles[m.player.y][m.player.x],'.');
    layouts.add(m.tiles.map(r=>r.join('')).join('\n'));
  }
  assert.equal(layouts.size,4);
});
test('validator rejects an isolated collectible',()=>{
  const m=makeMaze(1);m.tiles[0][0]='.';assert.equal(validateMaze(m),false);
});
