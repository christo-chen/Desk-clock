import { nextTickDelay } from './time';
export class Ticker {
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private now: () => number, private speed: number, private seconds: () => boolean, private update: (now:number, animate:boolean) => void) {}
  start(animate = false) { this.stop(); if (document.hidden) return; const now=this.now(); this.update(now,animate); this.timer=setTimeout(()=>this.start(true),nextTickDelay(this.now(),this.seconds(),this.speed)); }
  stop() { clearTimeout(this.timer); }
}
