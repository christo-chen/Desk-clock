import {vi} from 'vitest';
export class TestNode {
 className='';textContent='';hidden=false;dataset:Record<string,string>={};children:TestNode[]=[];parent?:TestNode;attributes=new Map<string,string>();events=new Map<string,(e:any)=>void>();
 style:Record<string,any>={setProperty:(k:string,v:string)=>this.style[k]=v};clientWidth=80;clientHeight=140;
 classList={add:(...s:string[])=>{this.className+=' '+s.join(' ');},contains:(s:string)=>this.className.split(' ').includes(s)};
 motions:{frames:Keyframe[];options:KeyframeAnimationOptions;animation:Animation}[]=[];
 constructor(public tag='div'){}
 get firstElementChild(){return this.children[0];}get lastElementChild(){return this.children.at(-1);}get childElementCount(){return this.children.length;}
 append(...nodes:TestNode[]){for(const n of nodes){n.parent=this;this.children.push(n);}}
 prepend(...nodes:TestNode[]){for(const n of nodes)n.parent=this;this.children.unshift(...nodes);}
 replaceChildren(...nodes:TestNode[]){this.children=[];this.append(...nodes);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(v=>v!==this);}
 setAttribute(k:string,v:string){this.attributes.set(k,v);if(k==='class')this.className=v;}getAttribute(k:string){return this.attributes.get(k);}
 addEventListener(k:string,fn:(e:any)=>void){this.events.set(k,fn);}
 all():TestNode[]{return [this,...this.children.flatMap(n=>n.all())];}
 querySelector(selector:string):TestNode|undefined{return this.querySelectorAll(selector)[0];}
 querySelectorAll(selector:string):TestNode[]{return this.all().slice(1).filter(n=>selector.startsWith('.')?n.classList.contains(selector.slice(1)):n.tag===selector);}
 animate(frames:Keyframe[],options:KeyframeAnimationOptions){let resolve!:()=>void;const finished=new Promise<void>(r=>resolve=r);const animation={finished,finish:vi.fn(resolve),cancel:vi.fn(),effect:{target:this,getKeyframes:()=>frames,getTiming:()=>options}} as unknown as Animation;this.motions.push({frames,options,animation});return animation;}
 getAnimations(){return this.motions.map(m=>m.animation);}
 asElement(){return this as unknown as HTMLElement;}
}
export function dom(){const html=new TestNode('html');html.dataset.mode='night';html.dataset.effect='glow';html.style['--digit']='#FF6A2B';html.style['--digit-top']='#FF6A2B';html.style['--digit-bottom']='#FF6A2B';
 vi.stubGlobal('document',{hidden:false,documentElement:html,createElement:(tag:string)=>new TestNode(tag),createElementNS:(_ns:string,tag:string)=>new TestNode(tag),querySelector:()=>null});
 vi.stubGlobal('getComputedStyle',(n:TestNode)=>({color:html.style['--digit'],fontFamily:'test',getPropertyValue:(key:string)=>n.style[key]||html.style[key]||''}));
 return html;
}
