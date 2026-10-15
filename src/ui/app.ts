import {Store} from '../core/store';import type {Settings,Mode} from '../core/settings';import {timeParts} from '../core/time';import {debugClock} from '../core/debug';import {Ticker} from '../core/ticker';
import {DigitalClock} from '../clocks/digital';import {AnalogClock} from '../clocks/analog';import type {ClockRenderer} from '../clocks/types';import {finishAll} from '../anim/types';
import {themes} from '../theme/themes';import {fonts,loadFont,fontScale} from '../data/fonts';import {applyTheme} from '../theme/engine';import {paperTexture,rainTexture,effectsMoving} from '../theme/effects';import {Appearance} from '../platform/appearance';import {sleeping} from '../platform/sleep';import {burnin} from '../platform/burnin';import {WakeLock} from '../platform/wakelock';import {tr} from '../i18n';import {quotePool,quoteIndex} from '../core/quotes';import {el} from './dom';import {controls} from './controls';import {installGuide} from './install-guide';import type {Sheet} from './sheet';
import { BatteryDisplay, type BatteryNavigator } from './battery';
import { ForcedLandscape, toggleDirection } from '../platform/orientation';
import { QuoteDisplay } from './quote';
export async function startApp(root:HTMLElement) {
 const store=new Store(),debug=debugClock(location.search);if(debug.reset)store.reset();
 const version=/OS (\d+)[_\.](\d+)/.exec(navigator.userAgent);if(version&&(Number(version[1])<16||Number(version[1])===16&&Number(version[2])<4)){root.append(el('p','unsupported',tr(store.value.lang,'unsupported')));return;}
 if(!themes.some(t=>t.id===store.value.theme))store.change(s=>s.theme='pure');if(store.value.font&&!fonts.some(f=>f[0]===store.value.font))store.change(s=>s.font=null);
 const content=el('div','clock-content'),dateRow=el('div','date-row'),date=el('div','date'),clock=el('div','clock'),quoteView=new QuoteDisplay(),quote=quoteView.root,sleepOverlay=el('div','sleep-overlay');date.setAttribute('aria-live','off');clock.setAttribute('role','img');quote.setAttribute('aria-live','off');dateRow.append(date);content.append(dateRow,clock,quote);content.style.visibility='hidden';root.append(el('div','theme-effects'),content,sleepOverlay);
 const updateDateRow=()=>{dateRow.hidden=!date.textContent&&!battery.visible;};
 const battery=new BatteryDisplay(dateRow,()=>store.value,navigator as Navigator & BatteryNavigator,updateDateRow);
 void battery.start();
 const appearance=new Appearance(),dark=matchMedia('(prefers-color-scheme: dark)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let mode:Mode='day',asleep=false,restoreUntil=0,restoreTimer:ReturnType<typeof setTimeout>|undefined;
 const orientation=new ForcedLandscape(root,()=>reduced.matches);
 orientation.apply(store.value.forceLandscape,window.innerWidth,window.innerHeight);
 let renderer:ClockRenderer|null=null,key='',sheet:Sheet|undefined,sheetPending:Promise<void>|undefined,fontCurrent='',fontRequest=0,effective=store.value,appearanceMode=store.value.appearance.mode;
 const wake=new WakeLock(()=>store.value.wakeLock);
 document.addEventListener('click',()=>{void wake.request(true);},{capture:true});
 const openSheet=()=>{if(sheet){sheet.open();return;}if(sheetPending)return;sheetPending=import('./sheet').then(({Sheet})=>{sheet=new Sheet({store,mode:()=>mode,preview:m=>{appearance.override=m;refresh(false);},demo:()=>renderer?.demo?.(),angle:()=>orientation.angle(),wake});sheet.open();}).finally(()=>{sheetPending=undefined;});};
 const ui=controls(()=>store.value,()=>{appearance.toggle(mode);refresh(false);},openSheet,()=>store.change(s=>s.forceLandscape=toggleDirection(s.forceLandscape)),()=>orientation.layout.rotateButton);root.append(ui.root);
 const ticker=new Ticker(debug.now,debug.speed,()=>effective.show.seconds,refresh);
 function fontFor(s:Settings){return s.clock==='segment'?'dseg':s.font||(themes.find(t=>t.id===s.theme)||themes[0]).font;}
 async function changeFont(id:string){if(id===fontCurrent)return loadFont(id);fontCurrent=id;const request=++fontRequest;await loadFont(id);if(request===fontRequest){clock.style.fontFamily=`"clock-${id}", monospace`;clock.style.setProperty('--font-scale',String(fontScale(id)));}}
 function refresh(nowOrAnimate:number|boolean,animateArgument=false){const now=typeof nowOrAnimate==='number'?nowOrAnimate:debug.now(),animate=typeof nowOrAnimate==='boolean'?nowOrAnimate:animateArgument,s=store.value;
  mode=appearance.resolve(s,now,dark.matches);const previousSleep=asleep;asleep=sleeping(s,now,restoreUntil);effective=asleep?{...s,show:{...s.show,seconds:false,quote:false}}:s;
  document.documentElement.lang=s.lang==='zh'?'zh-CN':'en';applyTheme(s,mode,asleep&&s.sleep.red);sleepOverlay.style.opacity=String(asleep?s.sleep.dim:0);document.documentElement.dataset.sleep=String(asleep);
  const nextKey=`${s.clock}|${effective.show.seconds}`;if(nextKey!==key){renderer?.destroy();renderer=s.clock==='analog'?new AnalogClock():new DigitalClock(s.clock);renderer.mount(clock,{settings:()=>effective,reduced:()=>reduced.matches||asleep,speed:debug.speed});key=nextKey;}
  void changeFont(fontFor(s));const time=timeParts(now,effective);if(date.textContent!==time.date)date.textContent=time.date;date.hidden=!time.date;battery.sync();updateDateRow();renderer!.update(time,animate&&previousSleep===asleep&&!document.hidden);
  const pool=quotePool(s);quoteView.update(pool[quoteIndex(s,now,pool.length)],s,effective.show.quote,animate&&!document.hidden,Math.min(orientation.layout.width,orientation.layout.height),orientation.layout.layout==='portrait');
  document.documentElement.dataset.motion=effectsMoving(s.themeMotion,asleep,reduced.matches,document.hidden)?'active':'paused';
  burnin(content,now,s.burnIn);
 }
 refresh(false);await changeFont(fontFor(store.value));content.style.visibility='';getComputedStyle(document.documentElement).backgroundColor;document.documentElement.classList.remove('booting');paperTexture();rainTexture();ticker.start();installGuide(store);

 store.subscribe(()=>{orientation.apply(store.value.forceLandscape,window.innerWidth,window.innerHeight,true);ui.update();if(store.value.appearance.mode!==appearanceMode){appearance.override=null;appearanceMode=store.value.appearance.mode;}ticker.start();wake.syncEnabled();});
 const foreground=()=>{if(document.hidden){document.documentElement.dataset.motion='paused';ticker.stop();finishAll();renderer?.destroy();renderer=null;key='';wake.release();}else{ticker.start();}};
 document.addEventListener('visibilitychange',foreground);window.addEventListener('pageshow',foreground);window.addEventListener('pagehide',()=>{document.documentElement.dataset.motion='paused';ticker.stop();finishAll();store.flush();wake.release();});
 const resize=()=>{orientation.apply(store.value.forceLandscape,window.innerWidth,window.innerHeight);ui.update();sheet?.resize();renderer?.resize();ticker.start();};
 dark.addEventListener('change',()=>{appearance.override=null;ticker.start();});reduced.addEventListener('change',()=>{finishAll();ticker.start();});window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
 document.addEventListener('pointerdown',()=>{if(asleep){restoreUntil=Date.now()+10000;clearTimeout(restoreTimer);ticker.start();restoreTimer=setTimeout(()=>ticker.start(),10000);}});
 if(debug.fps){const fps=el('output','fps');root.append(fps);let frame=0,frames=0,started=performance.now();const measure=(now:number)=>{frames++;if(now-started>=1000){fps.textContent=`${Math.round(frames*1000/(now-started))} FPS`;frames=0;started=now;}frame=requestAnimationFrame(measure);};const resume=()=>{cancelAnimationFrame(frame);if(!document.hidden){frames=0;started=performance.now();frame=requestAnimationFrame(measure);}};document.addEventListener('visibilitychange',resume);resume();}
 return {store,refresh,ticker};
}
