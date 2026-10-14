import { inWindow } from '../core/time'; import type { Settings } from '../core/settings';
export function sleeping(s:Settings,now:number,restoreUntil:number) {const d=new Date(now); return s.sleep.on&&Date.now()>=restoreUntil&&inWindow(d.getHours()*60+d.getMinutes(),s.sleep.from,s.sleep.to);}
