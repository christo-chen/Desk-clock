import { afterEach,describe,expect,it,vi } from 'vitest';
import { Sheet } from '../src/ui/sheet';
import { defaults } from '../src/core/settings';
import {themes} from '../src/theme/themes';
import {finishAll} from '../src/anim/types';
import type { Store } from '../src/core/store';
import type { WakeLock } from '../src/platform/wakelock';
class Node {
 className='';textContent='';title='';hidden=false;dataset:Record<string,string>={};children:Node[]=[];parent?:Node;attributes=new Map<string,string>();events=new Map<string,(e:any)=>void>();
 style:Record<string,any>={setProperty:(k:string,v:string)=>this.style[k]=v};scrollTop=0;scrollLeft=0;offsetWidth=80;offsetLeft=0;clientHeight=400;value='';
 classList={add:(s:string)=>{this.className+=' '+s;},remove:(s:string)=>{this.className=this.className.split(' ').filter(c=>c!==s).join(' ');},contains:(s:string)=>this.className.split(' ').includes(s)};
 constructor(public tag:string){}
 get lastElementChild(){return this.children.at(-1);}
 get offsetHeight(){return parseFloat(this.style.height)||180;}
 append(...nodes:Node[]){for(const n of nodes){n.parent=this;this.children.push(n);}}
 prepend(...nodes:Node[]){for(const n of nodes)n.parent=this;this.children.unshift(...nodes);}
 replaceChildren(...nodes:Node[]){this.children=[];this.append(...nodes);}
 setAttribute(k:string,v:string){this.attributes.set(k,v);} getAttribute(k:string){return this.attributes.get(k);}hasAttribute(k:string){return this.attributes.has(k);}
 addEventListener(k:string,fn:(e:any)=>void){this.events.set(k,fn);} focus(){}setPointerCapture(){}
 all():Node[]{return [this,...this.children.flatMap(n=>n.all())];}
 querySelector(selector:string):Node|undefined{return this.querySelectorAll(selector)[0];}
 querySelectorAll(selector:string):Node[]{return this.all().slice(1).filter(n=>selector.startsWith('.')?n.className.split(' ').includes(selector.slice(1)):selector==='[aria-selected="true"]'?n.getAttribute('aria-selected')==='true':n.tag===selector);}
 getAnimations(){return [];}
 animate(){return {finished:Promise.resolve(),cancel:()=>{}};}
}
function fixture(angle=0){
 const app=new Node('main');app.dataset.layout='landscape';
 const html=new Node('html');html.dataset.effect='none';html.dataset.mode='day';
 vi.stubGlobal('document',{documentElement:html,createElement:(tag:string)=>new Node(tag),createElementNS:(_ns:string,tag:string)=>new Node(tag),getElementById:()=>app,addEventListener:()=>{},activeElement:undefined});
 vi.stubGlobal('getComputedStyle',(node:Node)=>({height:String(node.offsetHeight),transform:'none',getPropertyValue:()=> '0px'}));
 vi.stubGlobal('matchMedia',()=>({matches:false}));
 const value=structuredClone(defaults),store={value,subscribe:()=>()=>{},change:(fn:(s:typeof value)=>void)=>{fn(value);return true;}} as unknown as Store;
 const wake={state:{status:'waiting'},subscribe:()=>()=>{}} as unknown as WakeLock;
 let mode:'day'|'night'='day';const sheet=new Sheet({store,wake,mode:()=>mode,preview:v=>{mode=v;},demo:()=>{},angle:()=>angle});
 const root=app.querySelector('.sheet')!,handle=app.querySelector('.sheet-handle')!;
 return {sheet,app,root,handle,store};
}
afterEach(()=>{finishAll();vi.unstubAllGlobals();});
const settled=async()=>{await Promise.resolve();await Promise.resolve();};
describe('面板档位生命周期',()=>{
 it('轻点横条切换两档，同次打开切标签保留档位，重开恢复默认',async()=>{
  const f=fixture();f.sheet.open();await settled();expect(f.root.style.height).toBe('180px');
  f.handle.events.get('click')!({detail:0});await settled();expect(f.root.style.height).toBe('360px');expect(f.handle.getAttribute('aria-expanded')).toBe('true');
  f.root.all().find(n=>n.getAttribute('role')==='tab'&&n.textContent==='通用')!.events.get('click')!({});expect(f.root.style.height).toBe('360px');expect(f.root.querySelector('.wake-status')?.textContent).toBe('等待轻点屏幕');
  f.sheet.close();await settled();f.sheet.open();await settled();expect(f.root.style.height).toBe('180px');expect(f.root.querySelector('[aria-selected="true"]')?.textContent).toBe('主题皮肤');
 });
 it.each([90,-90])('旋转%s度时上拉展开、下拉回默认、默认继续下拉关闭',async(angle)=>{
  const f=fixture(angle);f.sheet.open();await settled();const sign=angle===90?1:-1;
  const drag=async(delta:number)=>{f.handle.events.get('pointerdown')!({clientX:0,clientY:0,timeStamp:0,pointerId:1});f.handle.events.get('pointermove')!({clientX:-delta*sign,clientY:0,timeStamp:200});f.handle.events.get('pointerup')!({timeStamp:210});await settled();};
  await drag(-120);expect(f.root.style.height).toBe('360px');await drag(130);expect(f.root.style.height).toBe('180px');await drag(130);expect(f.root.hidden).toBe(true);
 });
});
describe('v1.4设置界面',()=>{
 const tab=(f:ReturnType<typeof fixture>,name:string)=>f.root.all().find(n=>n.getAttribute('role')==='tab'&&n.textContent===name)!.events.get('click')!({});
 const choice=(f:ReturnType<typeof fixture>,name:string)=>f.root.all().find(n=>n.classList.contains('choice-label')&&n.textContent===name)!.parent!.events.get('click')!({});
 it('筛选顺序与节日两主题',()=>{const f=fixture();f.sheet.open();expect(f.root.querySelector('.filters')!.querySelectorAll('.choice-label').map(n=>n.textContent)).toEqual(['全部','极简','复古','科技','赛博朋克','自然','柔和','文艺','节日']);choice(f,'节日');expect(f.root.querySelector('.theme-cards')!.querySelectorAll('.choice-label').map(n=>n.textContent)).toEqual(['万圣节','圣诞']);});
 it('动画列表glow在none之前，开关仅在glow时出现，手选清autoGlow',()=>{const f=fixture();f.sheet.open();tab(f,'动画');expect(f.root.querySelectorAll('.choice-label').map(n=>n.textContent).slice(-2)).toEqual(['辉光','无动画']);expect(f.root.all().some(n=>n.textContent==='整点轮转')).toBe(false);f.store.value.autoGlow=true;choice(f,'辉光');expect(f.store.value.anim).toBe('glow');expect(f.store.value.autoGlow).toBe(false);const label=f.root.all().find(n=>n.tag==='label'&&n.children[0]?.textContent==='整点轮转')!,toggle=label.querySelector('input')!;(toggle as any).checked=false;toggle.events.get('change')!({});expect(f.store.value.hourCycle).toBe(false);choice(f,'无动画');expect(f.root.all().some(n=>n.textContent==='整点轮转')).toBe(false);});
 it('主题选择自动动画行为已接入',()=>{const f=fixture();f.sheet.open();choice(f,'辉光管');expect(f.store.value).toMatchObject({theme:'nixie',anim:'glow',autoGlow:true});choice(f,'纯粹');expect(f.store.value).toMatchObject({theme:'pure',anim:'flip',autoGlow:false});});
 it('渐变9圆块、自定义两端HEX/色板，修改不污染主题，选纯色删渐变',()=>{const f=fixture();f.store.value.theme='rose';const original=[...themes.find(t=>t.id==='rose')!.night.digitGradient!];f.sheet.open();tab(f,'字体颜色');const mode=f.root.querySelector('.color-heading')!.querySelector('select')!;mode.value='night';mode.events.get('change')!({});expect(f.root.querySelector('.gradient-swatches')!.children).toHaveLength(9);f.root.all().find(n=>n.getAttribute('aria-label')==='自定义渐变')!.events.get('click')!({});const top=f.root.all().find(n=>n.getAttribute('aria-label')==='顶部')!;top.value='#123456';top.events.get('change')!({});expect(f.store.value.custom.night.digitGradient).toBe('#123456,#C4A7E7');expect(themes.find(t=>t.id==='rose')!.night.digitGradient).toEqual(original);const bottom=f.root.all().find(n=>n.getAttribute('aria-label')==='底部 · 色板')!;bottom.value='#FFFFFF';bottom.events.get('change')!({});expect(f.store.value.custom.night.digitGradient).toBe('#123456,#FFFFFF');f.root.all().find(n=>n.classList.contains('swatch')&&!n.classList.contains('gradient-swatch')&&n.title==='#FFFFFF')!.events.get('click')!({});expect(f.store.value.custom.night).toMatchObject({digit:'#FFFFFF'});expect(f.store.value.custom.night.digitGradient).toBeUndefined();});
 it('任意一端低对比度提示，无卡片时比较背景',()=>{const f=fixture();f.store.value.custom.day={digitGradient:'#FFFFFF,#FFFFFF',bg:'#000000',card:'#FFFFFF'};f.sheet.open();tab(f,'字体颜色');expect(f.root.querySelector('.contrast-status')?.classList.contains('warning')).toBe(true);f.store.value.clock='minimal';tab(f,'字体颜色');expect(f.root.querySelector('.contrast-status')?.classList.contains('warning')).toBe(false);});
});
