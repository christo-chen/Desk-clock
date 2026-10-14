import type { AnimKind } from '../core/settings';
import {finishCell,track,wa,type TransitionOptions} from './types';import {drop} from './drop';import {scale} from './scale';import {pixel} from './pixel';import {evaporate} from './evaporate';import {none} from './none';
export const durations = {flip:600,pixel:450,drop:550,scale:420,evaporate:700,none:0};
export function transition(kind:AnimKind,cell:HTMLElement,from:string,to:string,opts:TransitionOptions):Animation[]|void {
 finishCell(cell);const old=opts.shape(from),next=opts.shape(to);
 if(kind==='none'&&!opts.reduced){none(cell,next);return;}
 cell.replaceChildren(old,next);old.classList.add('transition-old');next.classList.add('transition-new');
 let animations:Animation[]=[],cleanup=()=>{};
 if(opts.reduced) animations=[wa(old,[{opacity:1},{opacity:0}],150,opts.delay),wa(next,[{opacity:0},{opacity:1}],150,opts.delay)];
 else if(kind==='drop') animations=drop(old,next,opts.delay);
 else if(kind==='scale') animations=scale(old,next,opts.delay);
 else if(kind==='evaporate') {const result=evaporate(cell,old,next,from,opts.delay);animations=result.animations;cleanup=result.cleanup;}
 else if(kind==='pixel') {cleanup=pixel(cell,from,to,opts.delay);animations=[wa(old,[{opacity:1},{opacity:0,offset:.1},{opacity:0}],450,opts.delay),wa(next,[{opacity:0},{opacity:0,offset:.9},{opacity:1}],450,opts.delay)];}
 else animations=[wa(old,[{transform:'rotateX(0deg)',opacity:1},{transform:'rotateX(-90deg)',opacity:0}],300,opts.delay,'ease-in'),wa(next,[{transform:'rotateX(90deg)',opacity:0},{transform:'rotateX(-4deg)',opacity:1,offset:.9},{transform:'rotateX(0deg)',opacity:1}],300,opts.delay+300,'ease-out')];
 return track(cell,animations,()=>{cleanup();none(cell,opts.shape(to));});
}
