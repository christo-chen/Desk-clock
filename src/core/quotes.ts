import {quotes} from '../data/quotes';import type {Settings} from './settings';
export interface Quote { text: string; source: string }
export function quotePool(s:Settings): Quote[] {
 const lang=s.quote.lang;
 const preset=quotes.map(q=>({text:q[lang],source:lang==='en'?`— ${q.sourceEn}`:`——${q.source}`}));
 const custom=s.quote.custom.map(q=>({text:q.text,source:q.author?(lang==='en'?`— ${q.author}`:`——${q.author}`):''}));
 return s.quote.source==='preset'?preset:s.quote.source==='custom'?custom:[...preset,...custom];
}
const dateFormats=new Map<string,Intl.DateTimeFormat>();
export function quoteIndex(s:Settings,now:number,length:number) {
 if(!length)return 0;
 if(s.quote.mode==='fixed')return (s.quote.fixed||0)%length;
 if(s.quote.mode==='rotate')return Math.floor(now/(s.quote.every*60000))%length;
 const tz=s.tz||'system';if(!dateFormats.has(tz)){if(dateFormats.size>16)dateFormats.clear();dateFormats.set(tz,new Intl.DateTimeFormat('en-CA',{...(s.tz?{timeZone:s.tz}:{}),year:'numeric',month:'2-digit',day:'2-digit'}));}
 const parts=dateFormats.get(tz)!.formatToParts(now);const get=(type:string)=>Number(parts.find(p=>p.type===type)!.value);return Math.floor(Date.UTC(get('year'),get('month')-1,get('day'))/86400000)%length;
}
