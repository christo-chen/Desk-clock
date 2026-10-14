import { webkit } from '@playwright/test';import { mkdir,writeFile } from 'node:fs/promises';import { spawn } from 'node:child_process';import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:4173/';let server;
if(!process.env.TEST_URL){server=spawn('node_modules/.bin/vite',['preview','--host','127.0.0.1','--port','4173'],{stdio:'ignore'});for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}}
let browser;
try{browser=await webkit.launch();}catch(error){server?.kill();console.error('WebKit 不可用。运行 npx playwright install webkit 后重试。');throw error;}
const errors=[],report=[];await mkdir('artifacts/screenshots',{recursive:true});
const themes=['pure','bauhaus','nixie','split-flap','polar','phosphor','synthwave','neon-city','forest','solar','latte','morandi','ink','ukiyo-e','eink','rose'];
const clocks=['flip','segment','dotmatrix','minimal','nixie','analog'];
async function open(settings,viewport,params=''){
 const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 Version/18.4 Mobile/15E148 Safari/604.1'});
 await context.addInitScript(value=>localStorage.setItem('deskclock:v1',JSON.stringify(value)),{v:1,installDismissed:true,wakeLock:false,burnIn:false,forceLandscape:'off',...settings});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+params);await page.waitForSelector('.clock-group,.dial');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1250);return {context,page};
}
try {
 // Full 6 × 16 × 2 × 2 matrix: 384 screenshots, including SE-size landscape.
 for(const [orientation,viewport] of Object.entries({landscape:{width:667,height:375},portrait:{width:375,height:667}}))for(const clock of clocks)for(const theme of themes)for(const mode of ['day','night']){
  const {context,page}=await open({clock,theme,appearance:{mode}},viewport,'?t=12:34:56');
  const metrics=await page.evaluate(()=>{const clock=document.querySelector('.clock'),groups=[...document.querySelectorAll('.clock-group,.dial')];return {nodes:document.querySelectorAll('#app *').length,width:document.documentElement.scrollWidth,rects:groups.map(g=>{const r=g.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}),viewport:{w:innerWidth,h:innerHeight},time:clock.getAttribute('aria-label')};});
  assert.ok(metrics.nodes<300,`${clock}: ${metrics.nodes} DOM nodes`);assert.ok(metrics.width<=viewport.width);for(const r of metrics.rects){assert.ok(r.left>=0&&r.right<=viewport.width,`${clock} ${orientation}: horizontal overflow`);assert.ok(r.top>=0&&r.bottom<=viewport.height,`${clock} ${orientation}: vertical overflow`);}
  const file=`${orientation}-${clock}-${theme}-${mode}.png`;await page.screenshot({path:`artifacts/screenshots/${file}`});report.push({file,...metrics});await context.close();
 }
 const {context,page}=await open({}, {width:667,height:375},'?speed=60&t=23:59:50');
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('tab',{name:'通用',exact:true}).click();await page.getByLabel('语言',{exact:true}).selectOption('en');await page.getByRole('tab',{name:'Display',exact:true}).click();await page.getByLabel('Seconds',{exact:true}).uncheck();assert.equal(await page.locator('.clock-group').count(),2);
 await page.getByRole('tab',{name:'Quotes',exact:true}).click();await page.getByRole('textbox',{name:'Enter a quote, up to 120 characters'}).fill('A custom quote');await page.getByRole('button',{name:'Add quote',exact:true}).click();await page.getByRole('button',{name:'Edit',exact:true}).click();await page.getByRole('textbox',{name:'Enter a quote, up to 120 characters'}).fill('An edited quote');await page.getByRole('button',{name:'Save',exact:true}).click();assert.ok((await page.locator('.custom-quotes').innerText()).includes('An edited quote'));await page.getByRole('button',{name:'Delete',exact:true}).click();
 await page.getByRole('tab',{name:'Themes',exact:true}).click();await page.getByRole('button',{name:'Bauhaus',exact:true}).click();await page.getByRole('tab',{name:'Background',exact:true}).click();await page.locator('.swatch').first().click();await page.getByRole('tab',{name:'Fonts',exact:true}).click();assert.equal(await page.locator('.font-preview').count(),12);assert.equal(await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').length),12);
 await page.keyboard.press('Escape');await page.waitForTimeout(500);await page.waitForTimeout(350);const saved=await page.evaluate(()=>localStorage.getItem('deskclock:v1'));assert.ok(saved.includes('bauhaus'));await page.reload();await page.waitForSelector('.clock-group');assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');
 // Exercise all independent renderer/animation pairs under accelerated time.
 for(const clock of clocks.slice(0,5))for(const anim of ['flip','pixel','drop','scale','evaporate','none']){const c=await open({clock,anim},{width:667,height:375},'?speed=60&t=09:59:59');await c.page.waitForTimeout(1500);await c.context.close();}
 // Offline replay after SW activation. WebKit support is feature-detected by the test runner.
 await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;await new Promise(resolve=>{if(r.active)resolve();else r.addEventListener('statechange',resolve,{once:true});});});await page.reload();await page.waitForSelector('.clock-group');await context.setOffline(true);await page.reload();await page.waitForSelector('.clock-group');await context.setOffline(false);await context.close();
 assert.deepEqual(errors,[]);await writeFile('artifacts/browser-report.json',JSON.stringify({screenshots:report.length,errors,report},null,2));console.log(`WebKit: ${report.length} screenshots, UI, animation and offline checks passed.`);
} finally {await browser.close();server?.kill();}
