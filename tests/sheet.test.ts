import { afterEach,describe,expect,it,vi } from 'vitest';
import { Sheet } from '../src/ui/sheet';
import { defaults } from '../src/core/settings';
import type { Store } from '../src/core/store';
import type { WakeLock } from '../src/platform/wakelock';
class Node {
 className='';textContent='';hidden=false;dataset:Record<string,string>={};children:Node[]=[];parent?:Node;attributes=new Map<string,string>();events=new Map<string,(e:any)=>void>();
 style:Record<string,any>={setProperty:(k:string,v:string)=>this.style[k]=v};scrollTop=0;scrollLeft=0;offsetWidth=80;offsetLeft=0;clientHeight=400;value='';
 classList={add:(s:string)=>{this.className+=' '+s;},remove:(s:string)=>{this.className=this.className.split(' ').filter(c=>c!==s).join(' ');},contains:(s:string)=>this.className.split(' ').includes(s)};
 constructor(public tag:string){}
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
 vi.stubGlobal('document',{createElement:(tag:string)=>new Node(tag),createElementNS:(_ns:string,tag:string)=>new Node(tag),getElementById:()=>app,addEventListener:()=>{},activeElement:undefined});
 vi.stubGlobal('getComputedStyle',(node:Node)=>({height:String(node.offsetHeight),transform:'none',getPropertyValue:()=> '0px'}));
 vi.stubGlobal('matchMedia',()=>({matches:false}));
 const value=structuredClone(defaults),store={value,subscribe:()=>()=>{}} as unknown as Store;
 const wake={state:{status:'waiting'},subscribe:()=>()=>{}} as unknown as WakeLock;
 const sheet=new Sheet({store,wake,mode:()=> 'day',preview:()=>{},demo:()=>{},angle:()=>angle});
 const root=app.querySelector('.sheet')!,handle=app.querySelector('.sheet-handle')!;
 return {sheet,app,root,handle};
}
afterEach(()=>vi.unstubAllGlobals());
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
