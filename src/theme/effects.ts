export function paperTexture() {
 const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!;
 const pixels=ctx.createImageData(64,64);let seed=193;
 for(let i=0;i<pixels.data.length;i+=4) {seed=(seed*1664525+1013904223)>>>0;const v=seed>>>24;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);document.documentElement.style.setProperty('--paper',`url(${c.toDataURL()})`);c.width=c.height=0;
}
export function rainTexture() {
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;
 const ctx=canvas.getContext('2d')!;let seed=2601;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<48;i++) {
  const x=random()*128,y=random()*256,length=12+random()*28;
  ctx.strokeStyle='#FFFFFF';ctx.lineWidth=.5+random()*.4;
  for(const dx of [-128,0,128])for(const dy of [-256,0,256]){ctx.beginPath();ctx.moveTo(x+dx,y+dy);ctx.lineTo(x+dx-length*.2,y+dy+length);ctx.stroke();}
 }
 document.documentElement.style.setProperty('--rain',`url(${canvas.toDataURL()})`);canvas.width=canvas.height=0;
}
export function effectTokens(effect:string,night:boolean,red=false) {
 if(red)return 'none';
 if(effect==='rain')return 'rain';
 if(effect==='halloween')return night?'vignette-deep paper':'paper';
 if(effect==='christmas')return 'snow';
 if(effect==='hellas')return night?'none':'paper';
 return effect==='paper'||night?effect:'none';
}
export function effectsMoving(enabled:boolean,sleep:boolean,reduced:boolean,hidden:boolean){return enabled&&!sleep&&!reduced&&!hidden;}
export function snowPoints(seed:number) {
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 return Array.from({length:36},()=>({x:random()*128,y:random()*256,r:.8+random()*1.4,alpha:.5+random()*.5}));
}
export function snowTexture() {
 for(const [layer,seed] of [2412,2512].entries()){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const ctx=canvas.getContext('2d')!;
  for(const {x,y,r,alpha} of snowPoints(seed)){ctx.fillStyle=`rgba(255,255,255,${alpha})`;for(const dx of [-128,0,128])for(const dy of [-256,0,256]){ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,Math.PI*2);ctx.fill();}}
  document.documentElement.style.setProperty(`--snow-${layer}`,`url(${canvas.toDataURL()})`);canvas.width=canvas.height=0;
 }
}
