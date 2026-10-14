import {glyphs} from '../data/dotmatrix-glyphs';
const ns='http://www.w3.org/2000/svg';
export function dots(value:string,bits?:boolean[]) {
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','-.6 -.6 5.2 7.2');svg.classList.add('matrix');
 const values=bits||glyphs[value].join('').split('').map(b=>b==='1');
 for(const on of [false,true]) {const p=document.createElementNS(ns,'path');let path='';values.forEach((lit,i)=>{if(lit===on){const x=i%5,y=Math.floor(i/5),r=.34;path+=`M${x-r},${y}a${r},${r} 0 1,0 ${r*2},0a${r},${r} 0 1,0 -${r*2},0`;}});p.setAttribute('d',path);p.setAttribute('class',on?'lit':'unlit');svg.append(p);}return svg;
}
export function digitShape(kind:string,value:string) {
 const el=document.createElement('div');el.className='digit-value';
 if(kind==='dotmatrix')el.append(dots(value));else {const span=document.createElement('span');span.textContent=value;el.append(span);}return el;
}
