import type { Mode,Settings } from '../core/settings'; import { inWindow } from '../core/time';
export function automaticMode(s:Settings,now:number,systemDark:boolean):Mode {
 if(s.appearance.mode==='day'||s.appearance.mode==='night') return s.appearance.mode;
 if(s.appearance.mode==='system') return systemDark?'night':'day';
 const d=new Date(now);return inWindow(d.getHours()*60+d.getMinutes(),s.appearance.dayAt,s.appearance.nightAt)?'day':'night';
}
export class Appearance {
 override:Mode|null=null; private last:Mode|null=null;
 resolve(s:Settings,now:number,dark:boolean) { const next=automaticMode(s,now,dark); if(this.last!==null&&next!==this.last) this.override=null;this.last=next;return this.override||next; }
 toggle(current:Mode) { this.override=current==='day'?'night':'day'; }
}
