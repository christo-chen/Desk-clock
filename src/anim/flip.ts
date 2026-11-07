import { finishCell,track,wa,spring } from './types';
import {digitInk} from '../clocks/digits';
function pair(value:string) {const p=document.createElement('div');p.className='pair';p.append(digitInk(value));return p;}
function half(value:string,bottom:boolean,moving=false) {
 const wrap=document.createElement('div');wrap.className=`half ${bottom?'bottom':'top'} ${moving?'moving':''}`;
 const clip=document.createElement('div');clip.className='half-clip';clip.append(pair(value));
 const shadow=document.createElement('div');shadow.className='half-shade';clip.append(shadow);wrap.append(clip);return wrap;
}
export function staticColumn(cell:HTMLElement,value:string) {cell.replaceChildren(half(value,false),half(value,true));}
export function cardColumns(cell:HTMLElement) {
 if(!cell.querySelector('.flip-col')){cell.replaceChildren();for(let i=0;i<2;i++){const col=document.createElement('div');col.className='flip-col';cell.append(col);}}
 return [...cell.children] as HTMLElement[];
}
export function staticCard(cell:HTMLElement,value:string) {cardColumns(cell).forEach((col,i)=>{finishCell(col);staticColumn(col,value[i]);});}
export function flipCard(cell:HTMLElement,from:string,to:string,delay:number) {
 return cardColumns(cell).flatMap((col,i)=>from[i]===to[i]?[]:flipColumn(col,from[i],to[i],delay));
}
function flipColumn(cell:HTMLElement,from:string,to:string,delay:number) {
 finishCell(cell);
 const top=half(to,false),bottom=half(from,true),up=half(from,false,true),down=half(to,true,true);
 cell.replaceChildren(top,bottom,up,down);
 const anims=[
  wa(up,[{transform:'rotateX(0deg)'},{transform:'rotateX(-90deg)'}],300,delay,'ease-in'),
  wa(down,[{transform:'rotateX(90deg)'},{transform:'rotateX(-4deg)',offset:.87},{transform:'rotateX(0deg)'}],300,delay+300,spring),
  wa(top.querySelector('.half-shade') as HTMLElement,[{opacity:.35},{opacity:0}],300,delay),
  wa(bottom.querySelector('.half-shade') as HTMLElement,[{opacity:0},{opacity:.35}],300,delay+300),
  wa(up.querySelector('.half-shade') as HTMLElement,[{opacity:0},{opacity:.35}],300,delay),
  wa(down.querySelector('.half-shade') as HTMLElement,[{opacity:0},{opacity:.25},{opacity:0}],300,delay+300)
 ];
 return track(cell,anims,()=>staticColumn(cell,to));
}
