import {wa} from './types';
import {mixColor} from '../theme/gradient';
export const emberColor=(c:string)=>mixColor(c,'#9E1B08',.45);
export function glowFrames(c:string,active:boolean,reduced=false) {
 const off='0 0 0 transparent, 0 0 0 transparent';
 const alpha=(a:number)=>`rgb(${c.slice(1).match(/../g)!.map(v=>parseInt(v,16)).join(' ')} / ${a})`;
 const rest=active?`0 0 .08em ${c}, 0 0 .25em ${c}`:off;
 const bloom=active?`0 0 .12em ${c}, 0 0 .45em ${c}`:`0 0 .05em ${alpha(.55)}, 0 0 .2em ${alpha(.35)}`;
 const flare=active?`0 0 .16em ${c}, 0 0 .62em ${c}`:`0 0 .08em ${alpha(.7)}, 0 0 .3em ${alpha(.45)}`;
 const emberShadow=active?`0 0 .04em ${alpha(.5)}, 0 0 .1em ${alpha(.25)}`:off;
 const frame=(offset:number,opacity:number,color:string,textShadow:string,brightness:number):Keyframe=>{
  const halo=textShadow===off?[0,0,0,0]:textShadow===rest?[.08,1,.25,1]:textShadow===emberShadow?[.04,.5,.1,.25]:textShadow===bloom?(active?[.12,1,.45,1]:[.05,.55,.2,.35]):active?[.16,1,.62,1]:[.08,.7,.3,.45];
  return {offset,opacity,color,textShadow,filter:`brightness(${brightness})`,'--halo-blur':`${halo[0]}em`,'--halo-alpha':halo[1],'--halo-far':`${halo[2]}em`,'--halo-far-alpha':halo[3]};
 };
 const ember=emberColor(c);
 const old=reduced?[
  frame(0,1,c,rest,1),frame(.3,.22,ember,emberShadow,.8),frame(1,0,ember,off,.6)
 ]:[frame(0,1,c,rest,1),frame(.12,.5,ember,emberShadow,.9),frame(.3,.28,ember,emberShadow,.8),frame(1,0,ember,off,.6)];
 const next=reduced?[
  frame(0,0,c,off,.9),frame(.4,1,c,bloom,1.12),frame(1,1,c,rest,1)
 ]:[frame(0,0,c,off,.9),frame(.18,1,c,flare,1.35),frame(.26,.62,c,flare,1.15),frame(.36,1,c,bloom,1.25),frame(1,1,c,rest,1)];
 return {old,next};
}
function hexColor(value:string) {
 if(/^#[\da-f]{6}$/i.test(value))return value;
 const rgb=value.match(/[\d.]+/g);return rgb&&rgb.length>=3?'#'+rgb.slice(0,3).map(v=>Math.round(Number(v)).toString(16).padStart(2,'0')).join(''):'#FFFFFF';
}
export function glow(cell:HTMLElement,old:HTMLElement,next:HTMLElement,delay:number,reduced:boolean,quick=false) {
 if(quick)return [wa(old,[{opacity:1},{opacity:.2,offset:.4},{opacity:0}],70,delay,'ease-out'),wa(next,[{opacity:0,filter:'brightness(1.1)'},{opacity:1,filter:'brightness(1)'}],45,delay,'ease-out')];
 const root=document.documentElement,css=getComputedStyle(cell),c=hexColor(css.getPropertyValue('--digit').trim()||css.color);
 const frames=glowFrames(c,(root.dataset.effect||'').split(' ').includes('glow'),reduced);
 if(root.dataset.gradient==='true')for(const end of ['top','bottom']){const color=hexColor(css.getPropertyValue(`--digit-${end}`).trim());old.style.setProperty(`--halo-${end}`,color);for(const frame of frames.old)frame[`--digit-${end}`]=frame.offset===0?color:emberColor(color);}
 const animations=[wa(old,frames.old,reduced?200:380,delay,'ease-out'),wa(next,frames.next,reduced?150:340,delay+(reduced?15:10),reduced?'ease-out':'linear')];
 if(!reduced){const spill=document.createElement('div');spill.className='glow-spill';spill.style.background=`radial-gradient(closest-side,${c},transparent)`;cell.prepend(spill);animations.push(wa(spill,[{opacity:0},{opacity:root.dataset.mode==='night'?.45:.22,offset:.2},{opacity:0}],420,delay+10,'ease-out'));}
 return animations;
}
