import {glyphs} from '../data/dotmatrix-glyphs';
const ns='http://www.w3.org/2000/svg';
let serial=0;
export function digitInk(value:string){const span=document.createElement('span');span.className='digit-ink';span.textContent=value;span.dataset.value=value;return span;}
export function dots(value:string,bits?:boolean[]) {
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','-.6 -.6 5.2 7.2');svg.classList.add('matrix');
 const defs=document.createElementNS(ns,'defs'),id=`digits-${serial++}`;
 for(const halo of [false,true]){const gradient=document.createElementNS(ns,'linearGradient');gradient.id=id+(halo?'-halo':'');gradient.setAttribute('x1','0');gradient.setAttribute('x2','0');gradient.setAttribute('gradientUnits','userSpaceOnUse');gradient.setAttribute('y1','-1.09');gradient.setAttribute('y2','7.09');
  for(const [offset,name] of [['0','top'],['1','bottom']]){const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',offset);const color=`var(--digit-${name},var(--digit))`;stop.setAttribute('stop-color',halo?`var(--halo-${name},${color})`:color);gradient.append(stop);}defs.append(gradient);
 }svg.append(defs);svg.style.setProperty('--matrix-fill',`url(#${id})`);svg.style.setProperty('--matrix-halo-fill',`url(#${id}-halo)`);
 const values=bits||glyphs[value].join('').split('').map(b=>b==='1');
 for(const on of [false,true]) {const p=document.createElementNS(ns,'path');let path='';values.forEach((lit,i)=>{if(lit===on){const x=i%5,y=Math.floor(i/5),r=.34;path+=`M${x-r},${y}a${r},${r} 0 1,0 ${r*2},0a${r},${r} 0 1,0 -${r*2},0`;}});p.setAttribute('d',path);p.setAttribute('class',on?'lit':'unlit');if(on)for(const name of ['matrix-halo','matrix-halo matrix-far']){const halo=document.createElementNS(ns,'path');halo.setAttribute('d',path);halo.setAttribute('class',name);svg.append(halo);}svg.append(p);}return svg;
}
export function digitShape(kind:string,value:string) {
 const el=document.createElement('div');el.className='digit-value';
 if(kind==='dotmatrix')el.append(dots(value));else el.append(digitInk(value));return el;
}
