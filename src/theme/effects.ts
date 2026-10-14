export function paperTexture() {
 const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!;
 const pixels=ctx.createImageData(64,64);let seed=193;
 for(let i=0;i<pixels.data.length;i+=4) {seed=(seed*1664525+1013904223)>>>0;const v=seed>>>24;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);document.documentElement.style.setProperty('--paper',`url(${c.toDataURL()})`);c.width=c.height=0;
}
