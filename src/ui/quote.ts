import type { Settings } from '../core/settings';
import type { Quote } from '../core/quotes';
import { el } from './dom';
export function quoteMetrics(short: number, size: Settings['quote']['size'], portrait = false) {
  const clamp = (min:number,n:number,max:number)=>Math.max(min,Math.min(n,max));
  const small=clamp(11,short*.027,16),medium=portrait?clamp(12,short*.034,18):clamp(12,short*.035,19);
  const font=size==='s'?small:size==='l'?clamp(14,short*.043,24):medium;
  const source=size==='l'?medium:size==='m'?small:clamp(10,short*.024,14);
  return { font, source, height: 2*font*1.65 + source*1.5 + 4 };
}
export class QuoteDisplay {
  readonly root=el('div','quote');
  private lines=el('div','quote-lines');
  private text=el('div','quote-text');
  private source=el('div','quote-source');
  private key='';
  private visible=false;
  private sequence=0;
  constructor() {
    this.lines.append(this.text);this.root.append(this.lines,this.source);
    this.root.setAttribute('aria-live','off');this.root.setAttribute('aria-hidden','true');this.root.classList.add('quote-invisible');
  }
  update(q:Quote|undefined,s:Settings,show:boolean,animate:boolean,short:number,portrait:boolean) {
    const metrics=quoteMetrics(short,s.quote.size,portrait),key=JSON.stringify(q||null),visible=Boolean(show&&q?.text);
    this.root.style.fontSize=`${metrics.font}px`;this.root.style.height=`${metrics.height}px`;
    this.root.style.setProperty('--quote-source-size',`${metrics.source}px`);
    this.root.dataset.size=s.quote.size;
    this.text.classList.toggle('long',Array.from(q?.text||'').length>(s.quote.lang==='zh'?40:95));
    const changed=key!==this.key;
    const write=()=>{this.text.textContent=q?.text||'';this.source.textContent=q?.source||'';};
    if(changed) {
      this.key=key;const seq=++this.sequence;
      this.root.getAnimations().forEach(a=>a.cancel());
      if(animate&&this.visible&&visible) {
        const out=this.root.animate([{opacity:1},{opacity:0}],{duration:150,fill:'forwards'});
        out.finished.then(()=>{if(seq!==this.sequence)return;write();out.cancel();this.root.animate([{opacity:0},{opacity:1}],{duration:150});}).catch(()=>{});
      } else write();
    }
    if(this.visible!==visible) {this.sequence++;this.root.getAnimations().forEach(a=>a.cancel());write();}
    this.visible=visible;this.root.setAttribute('aria-hidden',String(!visible));this.root.classList.toggle('quote-invisible',!visible);
  }
}
