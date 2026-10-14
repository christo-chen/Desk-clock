import type { Settings } from './settings';
export interface TimeParts { hour: string; minute: string; second: string; dayPeriod: string; year: string; month: string; day: string; weekday: string; date: string; ms: number }
const cache = new Map<string, Intl.DateTimeFormat>();
function formatter(lang: string, tz: string | null, h12: boolean) {
  const key = `${lang}|${tz}|${h12}`;
  if (!cache.has(key)) {
    if (cache.size >= 16) cache.delete(cache.keys().next().value!);
    cache.set(key, new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
      ...(tz ? { timeZone: tz } : {}), year: 'numeric', month: lang === 'zh' ? 'numeric' : 'long', day: 'numeric', weekday: 'long',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: h12 ? 'h12' : 'h23'
    }));
  }
  return cache.get(key)!;
}
export function timeParts(now: number, s: Pick<Settings, 'lang'|'tz'|'show'>): TimeParts {
  const p: Record<string,string> = {};
  for (const part of formatter(s.lang,s.tz,s.show.h12).formatToParts(now)) p[part.type] = part.value;
  const h = p.hour.padStart(2,'0');
  const dateBits = s.lang === 'zh' ? [s.show.year ? `${p.year}年` : '',s.show.month ? `${p.month}月` : '',s.show.day ? `${p.day}日` : ''].join('')
    : [s.show.day ? p.day : '',s.show.month ? p.month : '',s.show.year ? p.year : ''].filter(Boolean).join(' ');
  const date = s.lang === 'zh' ? [dateBits,s.show.weekday ? p.weekday : ''].filter(Boolean).join(' ')
    : [s.show.weekday ? p.weekday : '',dateBits].filter(Boolean).join(', ');
  const city = s.tz?.split('/').pop()?.replaceAll('_',' ');
  return {hour:h,minute:p.minute,second:p.second,dayPeriod:s.show.h12 ? (Number(h) === 12 ? p.dayPeriod : p.dayPeriod)?.toUpperCase().replace('上午','AM').replace('下午','PM') || '' : '',year:p.year,month:p.month,day:p.day,weekday:p.weekday,date:date+(city?` · ${city}`:''),ms:((now%1000)+1000)%1000};
}
export function nextTickDelay(now: number, seconds = true, speed = 1) {
  const unit = seconds ? 1000 : 60000;
  return (unit - ((now % unit) + unit) % unit) / speed + 8;
}
export function inWindow(minute: number, from: string, to: string) {
  const parse = (t:string) => Number(t.slice(0,2))*60+Number(t.slice(3));
  const a=parse(from),b=parse(to);
  return a===b || (a<b ? minute>=a && minute<b : minute>=a || minute<b);
}
