export type WakeReason='unsupported'|'denied'|'other';
export interface WakeState {status:'active'|'waiting'|'unavailable'|'off';reason?:WakeReason}
export class WakeLock {
 private lock:WakeLockSentinel|null=null;
 private pending=false;private token=0;private reported=false;
 private current:WakeState;
 private listeners=new Set<()=>void>();
 constructor(private enabled:()=>boolean,private onFailure:(reason:WakeReason)=>void=()=>{}) {this.current={status:enabled()?'waiting':'off'};}
 get state(){return this.current;}
 subscribe(fn:()=>void){this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
 private set(state:WakeState){if(state.status===this.current.status&&state.reason===this.current.reason)return;this.current=state;this.listeners.forEach(fn=>fn());}
 private failed(reason:WakeReason){this.set({status:'unavailable',reason});if(!this.reported){this.reported=true;this.onFailure(reason);}}
 // No asynchronous hop before request(): Safari must see the original trusted click activation.
 request(fromGesture=false):Promise<void> {
  if(!fromGesture||!this.enabled()||document.hidden||this.lock||this.pending)return Promise.resolve();
  if(typeof navigator.wakeLock?.request!=='function'){this.failed('unsupported');return Promise.resolve();}
  const token=++this.token;this.pending=true;
  let request:Promise<WakeLockSentinel>;
  try {request=navigator.wakeLock.request('screen');}
  catch(error){this.pending=false;this.handleError(error);return Promise.resolve();}
  return request.then(lock=>{
    if(token!==this.token||!this.enabled()||document.hidden){void lock.release().catch(()=>{});return;}
    this.lock=lock;this.set({status:'active'});
    lock.addEventListener('release',()=>{if(this.lock===lock){this.lock=null;this.set({status:this.enabled()?'waiting':'off'});}});
  }).catch(error=>{if(token===this.token&&this.enabled()&&!document.hidden)this.handleError(error);}).finally(()=>{if(token===this.token)this.pending=false;});
 }
 private handleError(error:unknown){const name=(error as {name?:string})?.name;this.failed(name==='NotSupportedError'?'unsupported':name==='NotAllowedError'||name==='SecurityError'?'denied':'other');}
 syncEnabled(){if(!this.enabled())this.release();else if(this.current.status==='off')this.set({status:'waiting'});}
 release(){++this.token;this.pending=false;const lock=this.lock;this.lock=null;if(lock)void lock.release().catch(()=>{});this.set({status:this.enabled()?'waiting':'off'});}
}
