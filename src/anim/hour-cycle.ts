import type {Settings} from '../core/settings';
export function canHourCycle(s:Settings,sleep:boolean,reduced:boolean,hidden:boolean) {return s.theme==='nixie'&&s.anim==='glow'&&s.hourCycle&&!sleep&&!reduced&&!hidden;}
export function cycleSchedule(start:string) {
 return [...start].flatMap((digit,i)=>Array.from({length:10},(_,n)=>({i,step:n+1,at:i*45+(n+1)*75,value:String((Number(digit)+n+1)%10)}))).sort((a,b)=>a.at-b.at||a.i-b.i);
}
export class HourCycle {
 private timers:ReturnType<typeof setTimeout>[]=[];active=false;
 start(start:string,current:()=>string,paint:(i:number,from:string,to:string,standard:boolean)=>void,settle:()=>void) {
  this.cancel();this.active=true;const values=[...start];
  for(const {i,step,at,value} of cycleSchedule(start))this.timers.push(setTimeout(()=>{const to=step===10?current()[i]:value;paint(i,values[i],to,step===10);values[i]=to;},at));
  this.timers.push(setTimeout(()=>{this.active=false;this.timers=[];settle();},(start.length-1)*45+750+430));
 }
 cancel(){this.timers.forEach(clearTimeout);this.timers=[];this.active=false;}
}
