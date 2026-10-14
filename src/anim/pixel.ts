import {glyphs} from '../data/dotmatrix-glyphs';
export function raster(cell:HTMLElement,value:string) {
 const c=document.createElement('canvas');c.width=24;c.height=36;const ctx=c.getContext('2d',{willReadFrequently:true})!;
 const css=getComputedStyle(cell);ctx.fillStyle=css.color;ctx.font=`28px ${css.fontFamily}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,12,20,23);return c;
}
export function pixel(cell:HTMLElement,from:string,to:string,delay:number) {
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;canvas.className='animation-canvas';
 const old=raster(cell,from),next=raster(cell,to);canvas.width=24;canvas.height=36;ctx.imageSmoothingEnabled=false;cell.append(canvas);
 const order=Array.from({length:96},()=>Math.random());let frame=0,start=performance.now()+delay;
 function draw(now:number){const p=Math.max(0,Math.min(1,(now-start)/450));ctx.clearRect(0,0,24,36);for(let y=0;y<12;y++)for(let x=0;x<8;x++){const threshold=order[y*8+x];if(p<.5 && threshold>p*2)ctx.drawImage(old,x*3,y*3,3,3,x*3,y*3,3,3);if(p>=.5&&threshold<(p-.5)*2)ctx.drawImage(next,x*3,y*3,3,3,x*3,y*3,3,3);}if(p<1)frame=requestAnimationFrame(draw);}
 frame=requestAnimationFrame(draw);
 return ()=>{cancelAnimationFrame(frame);canvas.width=canvas.height=old.width=old.height=next.width=next.height=0;canvas.remove();};
}
export function dotPixels(cell:HTMLElement,from:string,to:string,delay:number,render:(d:string,bits?:boolean[])=>void) {
 const a=glyphs[from].join(''),b=glyphs[to].join(''),order=Array.from({length:35},()=>Math.random());let frame=0;const start=performance.now()+delay;
 function draw(now:number){const p=Math.max(0,Math.min(1,(now-start)/450));render(to,order.map((r,i)=>p<.5?a[i]==='1'&&r>p*2:b[i]==='1'&&r<(p-.5)*2));if(p<1)frame=requestAnimationFrame(draw);}
 frame=requestAnimationFrame(draw);return ()=>{cancelAnimationFrame(frame);render(to);};
}
