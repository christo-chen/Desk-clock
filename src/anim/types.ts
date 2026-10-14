export interface DigitTransition {run(cell:HTMLElement,from:string,to:string,opts:{delay:number}):Animation[]|void}
export interface TransitionOptions {delay:number; reduced:boolean; shape:(value:string)=>HTMLElement}
const active = new Map<HTMLElement,()=>void>();
export function finishCell(cell:HTMLElement) {active.get(cell)?.();}
export function finishAll() {for(const finish of [...active.values()]) finish();}
export function track(cell:HTMLElement,animations:Animation[],cleanup:()=>void) {
 let done=false;
 const finish=()=>{if(done)return;done=true;for(const a of animations){try{a.finish();}catch{}a.cancel();}cleanup();active.delete(cell);};
 active.set(cell,finish);
 Promise.allSettled(animations.map(a=>a.finished)).then(finish);
 return animations;
}
export function wa(el:HTMLElement|SVGElement,frames:Keyframe[],duration:number,delay=0,easing='ease',fill:FillMode='both') {
 el.style.willChange='transform, opacity, filter';
 return el.animate(frames,{duration,delay,easing,fill});
}
export const spring = typeof CSS !== 'undefined' && CSS.supports('animation-timing-function','linear(0, 1.04, 1)') ? 'linear(0, .35 20%, .8 45%, 1.04 75%, 1)' : 'cubic-bezier(.2,.9,.3,1.1)';
