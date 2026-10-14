import type {ClockRenderer,RenderContext} from './types';import type {ClockKind} from '../core/settings';import type {TimeParts} from '../core/time';
import {staticCard,flipCard} from '../anim/flip';import {transition} from '../anim';import {finishAll,finishCell,track,wa} from '../anim/types';import {dotPixels} from '../anim/pixel';import {digitShape,dots} from './digits';
export class DigitalClock implements ClockRenderer {
 private root!:HTMLElement;private ctx!:RenderContext;private groups:HTMLElement[]=[];private cells:HTMLElement[][]=[];private values=['','',''];private period!:HTMLElement;private last?:TimeParts;
 constructor(private kind:Exclude<ClockKind,'analog'>){}
 mount(root:HTMLElement,ctx:RenderContext){this.root=root;this.ctx=ctx;root.className=`clock ${this.kind}`;const count=ctx.settings().show.seconds?3:2;root.dataset.groups=String(count);
  for(let g=0;g<count;g++){const group=document.createElement('div');group.className='clock-group';
   const faces=document.createElement('div');faces.className=this.kind==='flip'?'flip-face':'digit-pair';group.append(faces);
   if(this.kind==='flip')this.cells.push([faces]);else {const row:HTMLElement[]=[];for(let i=0;i<2;i++){const cell=document.createElement('div');cell.className='digit-cell';
    if(this.kind==='segment'){const ghost=document.createElement('span');ghost.className='ghost';ghost.textContent='8';cell.append(ghost);}
    if(this.kind==='nixie'){const cathodes=document.createElement('div');cathodes.className='cathodes';for(let n=0;n<10;n++){const e=document.createElement('span');e.textContent=String(n);cathodes.append(e);}cell.append(cathodes);}
    const slot=document.createElement('div');slot.className='digit-slot';cell.append(slot);faces.append(cell);row.push(slot);
   }this.cells.push(row);}
   this.groups.push(faces);root.append(group);
  }
  this.period=document.createElement('span');this.period.className='day-period';root.firstElementChild?.append(this.period);
 }
 update(t:TimeParts,animate:boolean){this.last=t;this.period.textContent=t.dayPeriod;this.root.setAttribute('aria-label',`${t.hour}:${t.minute}${this.groups.length===3?':'+t.second:''} ${t.dayPeriod}`);
  const next=[t.hour,t.minute,t.second];const changed=next.map((v,i)=>i<this.groups.length&&v!==this.values[i]);let wave=0;
  for(let g=this.groups.length-1;g>=0;g--){if(!changed[g])continue;const delay=animate?wave++*60:0;this.paintGroup(g,this.values[g],next[g],animate,delay);this.values[g]=next[g];}
 }
 private paintGroup(g:number,from:string,to:string,animate:boolean,delay:number){const s=this.ctx.settings(),reduced=this.ctx.reduced();
  if(this.kind==='flip'&&s.anim==='flip'&&!reduced){const cell=this.cells[g][0];if(animate&&from)flipCard(cell,from,to,delay);else{finishCell(cell);staticCard(cell,to);}return;}
  if(this.kind==='flip'){
   const face=this.cells[g][0];
   if(!face.querySelector('.flip-digit')){finishCell(face);face.replaceChildren();for(let i=0;i<2;i++){const slot=document.createElement('div');slot.className='digit-slot flip-digit';face.append(slot);}}
   for(let i=0;i<2;i++){const slot=face.children[i] as HTMLElement;if(from&&from[i]===to[i]&&slot.childElementCount)continue;if(animate&&from&&from[i]!==to[i])transition(s.anim,slot,from[i],to[i],{delay,reduced,shape:v=>digitShape('minimal',v)});else{finishCell(slot);slot.replaceChildren(digitShape('minimal',to[i]));}}
   return;
  }
  for(let i=0;i<2;i++){const cell=this.cells[g][i];if(from&&from[i]===to[i])continue;
   if(!animate||!from){finishCell(cell);cell.replaceChildren(digitShape(this.kind,to[i]));}
   else if(this.kind==='dotmatrix'&&s.anim==='pixel'&&!reduced){finishCell(cell);const release=dotPixels(cell,from[i],to[i],delay,(v,bits)=>{const shape=document.createElement('div');shape.className='digit-value';shape.append(dots(v,bits));cell.replaceChildren(shape);});track(cell,[wa(cell,[{opacity:1},{opacity:1}],450,delay)],()=>{release();cell.style.willChange='';});}
   else transition(s.anim,cell,from[i],to[i],{delay,reduced,shape:v=>digitShape(this.kind,v)});
  }
 }
 demo(){if(!this.last)return;const g=this.groups.length-1,to=this.values[g],from=String((Number(to)+59)%60).padStart(2,'0');this.paintGroup(g,from,to,true,0);}
 resize(){}
 destroy(){finishAll();this.root.replaceChildren();}
}
