export class WakeLock {
 private lock: WakeLockSentinel|null=null; private pending=false; private warned=false;
 constructor(private enabled:()=>boolean,private hint:()=>void) {}
 async request() {
  if (!this.enabled()||document.hidden||this.lock||this.pending) return;
  this.pending=true;
  try { if (!('wakeLock' in navigator)) throw Error(); this.lock=await navigator.wakeLock.request('screen');this.lock.addEventListener('release',()=>{this.lock=null;}); }
  catch {if(!this.warned){this.warned=true;this.hint();}} finally {this.pending=false;}
 }
 release() {void this.lock?.release();this.lock=null;}
 warn() {if(!this.warned){this.warned=true;this.hint();}}
}
