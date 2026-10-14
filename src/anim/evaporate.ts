import {wa} from './types';import {raster} from './pixel';
export function evaporate(cell:HTMLElement,old:HTMLElement,next:HTMLElement,from:string,delay:number) {
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!,sample=raster(cell,from),pixels=sample.getContext('2d')!.getImageData(0,0,24,36).data;
 const positions:number[][]=[];for(let y=0;y<36;y++)for(let x=0;x<24;x++)if(pixels[(y*24+x)*4+3]>100)positions.push([x/24,y/36]);
 const points=Array.from({length:16},()=>positions[Math.floor(Math.random()*positions.length)]||[.5,.5]);
 const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.ceil(cell.clientWidth*dpr);canvas.height=Math.ceil(cell.clientHeight*dpr);canvas.className='animation-canvas';cell.append(canvas);
 const color=getComputedStyle(cell).color;let frame=0;const start=performance.now()+delay;
 function draw(now:number){const p=Math.max(0,Math.min(1,(now-start)/700));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=color;ctx.globalAlpha=1-p;points.forEach(([x,y],i)=>{ctx.beginPath();ctx.arc((x+Math.sin(i+p*5)*p*.07)*canvas.width,(y-p*.65)*canvas.height,Math.max(1,dpr*(1-p)*1.2),0,Math.PI*2);ctx.fill();});if(p<1)frame=requestAnimationFrame(draw);}
 frame=requestAnimationFrame(draw);old.style.maskImage='linear-gradient(to bottom, transparent, black 25%)';
 return {animations:[wa(old,[{transform:'translateY(0)',filter:'blur(0px)',opacity:1},{transform:'translateY(-35%)',filter:'blur(8px)',opacity:0}],700,delay),wa(next,[{transform:'translateY(20%)',filter:'blur(6px)',opacity:0},{transform:'translateY(0)',filter:'blur(0px)',opacity:1}],700,delay)],cleanup:()=>{cancelAnimationFrame(frame);canvas.width=canvas.height=sample.width=sample.height=0;canvas.remove();}};
}
