import {test,expect} from '@playwright/test';
const pageErrors=new WeakMap();
test.beforeEach(async({page})=>{const errors=[];pageErrors.set(page,errors);page.on('pageerror',error=>errors.push(error.message));});
test.afterEach(async({page})=>{expect(pageErrors.get(page)).toEqual([]);});
async function start(page,age=7) {
  await page.goto('/');await page.getByRole('button',{name:age===7?'Math explorer Ages 7+':'Little explorer Ages 3+'}).click();
  await page.getByRole('button',{name:'Let’s play'}).click();
  await expect(page.locator('#game-screen')).toBeVisible();
}
async function power(page) {
  await page.evaluate(async()=>{const {game}=await import('/src/main.js');game.phase='playing';const p=game.maze.powers[0];Object.assign(game.player,p,{to:null});game.eat();});
  await expect(page.getByRole('dialog')).toBeVisible();
}
test('select arithmetic and difficulty, move with keys, pause and resume',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Division',exact:true}).click();
  await page.getByRole('button',{name:'Hard',exact:true}).click();await page.getByRole('button',{name:'Let’s play'}).click();
  await expect(page.locator('#mode-label')).toContainText('Division');
  await page.waitForTimeout(3300);
  const before=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.score;});
  await page.keyboard.press('ArrowLeft');await page.waitForTimeout(600);
  const after=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.score;});
  expect(after).toBeGreaterThan(before);
  await page.getByRole('button',{name:'Pause game'}).click();await expect(page.getByRole('heading',{name:'Take a little break'})).toBeVisible();
  await page.getByRole('button',{name:'Resume game'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();expect(errors).toEqual([]);
});
test('math question, wrong feedback, timer, and new game',async({page})=>{
  await start(page);await power(page);
  const wrong=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.question.choices.find(c=>c.id!==game.question.answer).label;});
  await page.locator('#answers').getByRole('button',{name:wrong,exact:true}).click();
  await expect(page.locator('#feedback')).toContainText('5 seconds');
  await page.getByRole('button',{name:'Chase the ghosts'}).click();await expect(page.locator('#power-label')).toContainText('5s');
  await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Choose a new game'}).click();
  await expect(page.locator('#setup-screen')).toBeVisible();
});
test('preschool wrong answers retry; corrected answer resumes with bonus',async({page})=>{
  await start(page,3);await power(page);
  const wrong=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.question.choices.find(c=>c.id!==game.question.answer).id;});
  await page.locator(`#answers [data-answer="${wrong}"]`).click();await expect(page.locator('#feedback')).toContainText('Try again');
  const right=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.question.answer;});
  await page.locator(`#answers [data-answer="${right}"]`).click();await expect(page.locator('#feedback')).toContainText('12 seconds');
  await page.getByRole('button',{name:'Chase the ghosts'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('corrupt or null saved preferences cannot prevent starting a game',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('pac-learn-preferences','null'));
  await start(page);await expect(page.locator('#score')).toHaveText('0');
});
test('losing focus pauses an answered question and preserves its feedback',async({page})=>{
  await start(page);await power(page);
  const right=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.question.answer;});
  await page.locator(`#answers [data-answer="${right}"]`).click();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading',{name:'Take a little break'})).toBeVisible();
  await page.getByRole('button',{name:'Resume game'}).click();
  await expect(page.locator('#feedback')).toContainText('12 seconds');
  await page.getByRole('button',{name:'Chase the ghosts'}).click();
  await page.keyboard.press('p');await expect(page.getByRole('heading',{name:'Take a little break'})).toBeVisible();
});
for(const size of [{width:390,height:844},{width:375,height:667},{width:768,height:1024},{width:844,height:390}]) {
  test(`touch layout ${size.width}x${size.height} has usable controls without overflow`,async({page})=>{
    await page.setViewportSize(size);await start(page,3);
    const joystick=page.locator('#joystick');await expect(joystick).toBeVisible();
    const b=await joystick.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width*.85,b.y+b.height/2);await page.mouse.up();
    const wanted=await page.evaluate(async()=>{const {game}=await import('/src/main.js');return game.wanted;});expect(wanted).toBe('right');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await power(page);const answer=page.locator('#answers button').first();await expect(answer).toBeVisible();expect((await answer.boundingBox()).height).toBeGreaterThanOrEqual(48);
  });
}
