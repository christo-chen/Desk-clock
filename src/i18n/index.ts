import { zh } from './zh'; import { en } from './en';
export type Message = keyof typeof zh;
export function tr(lang: 'zh'|'en',key:Message) { return (lang==='zh'?zh:en)[key]; }
