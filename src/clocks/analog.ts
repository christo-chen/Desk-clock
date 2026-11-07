import type {ClockRenderer,RenderContext} from './types';import type {TimeParts} from '../core/time';
export class AnalogClock implements ClockRenderer {
 private root!:HTMLElement;private ctx!:RenderContext;private hands:HTMLElement[]=[];private animations:Animation[]=[];private previous:number[]=[];
 mount(root:HTMLElement,ctx:RenderContext){this.root=root;this.ctx=ctx;root.className='clock analog';const dial=document.createElement('div');dial.className='dial';
  for(let i=0;i<12;i++){const tick=document.createElement('i');tick.className='dial-mark';tick.style.transform=`rotate(${i*30}deg)`;dial.append(tick);}
  for(const name of ['hour','minute','second']){const hand=document.createElement('div');hand.className=`hand ${name}-hand`;if(name!=='second'){const cut=document.createElement('div'),ink=document.createElement('div');cut.className='hand-cut';ink.className='hand-gradient';cut.append(ink);hand.append(cut);}dial.append(hand);this.hands.push(hand);}
  const pin=document.createElement('i');pin.className='dial-pin';dial.append(pin);root.append(dial);
 }
 update(t:TimeParts,animate:boolean){const s=this.ctx.settings(),fraction=t.ms/1000,seconds=Number(t.second)+fraction,minute=Number(t.minute)+seconds/60,hour=Number(t.hour)%12+minute/60;
  this.root.setAttribute('aria-label',`${t.hour}:${t.minute}:${t.second}`);this.hands[2].hidden=!s.show.seconds;
  const angles=[hour*30,minute*6,(s.analogMotion==='tick'?Number(t.second):seconds)*6];
  const period=s.show.seconds?1000:60000;const duration=Math.max(1,(period-t.ms)/this.ctx.speed);
  this.animations.forEach(a=>a.cancel());this.animations=[];
  for(let i=0;i<3;i++){let angle=angles[i];if(animate&&this.previous[i]!==undefined)while(angle<this.previous[i]-180)angle+=360;this.previous[i]=angle;const hand=this.hands[i];hand.style.transform=`rotate(${angle}deg)`;hand.style.willChange='';if(i===2&&!s.show.seconds)continue;
   if(this.ctx.reduced()){if(animate)this.animations.push(this.animateHand(hand,[{opacity:.5},{opacity:1}],{duration:150}));continue;}
   if(i===2&&s.analogMotion==='tick'){if(animate){hand.style.willChange='transform';const a=this.animateHand(hand,[{transform:`rotate(${angle-6}deg)`},{transform:`rotate(${angle+.4}deg)`,offset:.8},{transform:`rotate(${angle}deg)`}],{duration:Math.min(300,duration),easing:'ease-out'});a.finished.then(()=>hand.style.willChange='').catch(()=>{});this.animations.push(a);}continue;}
   const step=(period-t.ms)/1000*(i===0?1/120:i===1?.1:6);hand.style.willChange='transform';const a=this.animateHand(hand,[{transform:`rotate(${angle}deg)`},{transform:`rotate(${angle+step}deg)`}],{duration,easing:'linear',fill:'forwards'});this.animations.push(a);a.finished.then(()=>hand.style.willChange='').catch(()=>{});
  }
  // Counter-rotate a full-dial gradient behind each hand's narrow mask. The
  // gradient stays in dial coordinates, including during the native sweep.
  for(let i=0;i<2;i++){const ink=this.hands[i].querySelector<HTMLElement>('.hand-gradient')!;ink.style.transform=`rotate(${-this.previous[i]}deg)`;}
 }
 private animateHand(hand:HTMLElement,frames:Keyframe[],options:KeyframeAnimationOptions){
  const a=hand.animate(frames,options),ink=hand.querySelector<HTMLElement>('.hand-gradient');
  if(ink&&document.documentElement.dataset.gradient==='true'&&frames.some(frame=>frame.transform)){const inverse=frames.map(frame=>{const angle=/rotate\(([-\d.]+)deg\)/.exec(String(frame.transform));return angle?{...frame,transform:`rotate(${-Number(angle[1])}deg)`}:frame;});this.animations.push(ink.animate(inverse,options));}
  return a;
 }
 resize(){}
 destroy(){this.animations.forEach(a=>a.cancel());this.root.replaceChildren();}
}
