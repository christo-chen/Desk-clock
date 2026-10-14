import { themes } from '../theme/themes';
import { fonts } from '../data/fonts';
export type ClockKind = 'flip' | 'segment' | 'dotmatrix' | 'minimal' | 'nixie' | 'analog';
export type AnimKind = 'flip' | 'pixel' | 'drop' | 'scale' | 'evaporate' | 'none';
export type Mode = 'day' | 'night';
export interface Settings {
  v: number; lang: 'zh' | 'en'; theme: string; clock: ClockKind; anim: AnimKind;
  analogMotion: 'sweep' | 'tick'; font: string | null;
  custom: Record<Mode, Partial<Record<'bg' | 'card' | 'digit', string>>>;
  show: { seconds: boolean; h12: boolean; year: boolean; month: boolean; day: boolean; weekday: boolean; quote: boolean; battery: boolean; batteryPercent: boolean };
  tz: string | null;
  appearance: { mode: 'system' | 'schedule' | Mode; dayAt: string; nightAt: string };
  sleep: { on: boolean; from: string; to: string; dim: number; red: boolean };
  quote: { mode: 'fixed' | 'rotate' | 'daily'; every: number; source: 'preset' | 'custom' | 'mixed'; size: 's' | 'm' | 'l'; custom: string[]; fixed?: number };
  wakeLock: boolean; burnIn: boolean; installDismissed?: boolean;
}
export const defaults: Settings = {
  v: 1, lang: 'zh', theme: 'pure', clock: 'flip', anim: 'flip', analogMotion: 'sweep', font: null,
  custom: { day: {}, night: {} }, show: { seconds: true, h12: false, year: true, month: true, day: true, weekday: true, quote: true, battery: true, batteryPercent: false },
  tz: null, appearance: { mode: 'system', dayAt: '07:00', nightAt: '19:00' }, sleep: { on: false, from: '23:00', to: '07:00', dim: 0.7, red: false },
  quote: { mode: 'rotate', every: 30, source: 'preset', size: 'm', custom: [] }, wakeLock: true, burnIn: true
};
export const settingsBytes = (s: Settings) => new TextEncoder().encode(JSON.stringify(s)).length;
function merge(base: unknown, raw: unknown): any {
  if (Array.isArray(base)) return Array.isArray(raw) ? raw : base;
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, value] of Object.entries(base)) out[k] = merge(value, raw && typeof raw === 'object' ? (raw as Record<string, unknown>)[k] : undefined);
    return out;
  }
  if (base === null) return typeof raw === 'string' ? raw : null;
  return typeof raw === typeof base ? raw : base;
}
export function migrateSettings(raw: unknown): Settings {
  // Version 0 used the same nested layout without a version. Future versions are safely reset.
  const r = raw && typeof raw === 'object' ? raw as Record<string, any> : {};
  if (typeof r.v === 'number' && r.v > 1) return structuredClone(defaults);
  const s = merge(defaults, r) as Settings;
  s.v = 1;
  if (!themes.some(t => t.id === s.theme)) s.theme = defaults.theme;
  if (!fonts.some(([id]) => id === s.font)) s.font = null;
  const valid = (v: string, values: string[], fallback: string) => values.includes(v) ? v : fallback;
  s.lang = valid(s.lang, ['zh','en'], 'zh') as Settings['lang'];
  s.clock = valid(s.clock, ['flip','segment','dotmatrix','minimal','nixie','analog'], 'flip') as ClockKind;
  s.anim = valid(s.anim, ['flip','pixel','drop','scale','evaporate','none'], 'flip') as AnimKind;
  s.analogMotion = s.analogMotion === 'tick' ? 'tick' : 'sweep';
  s.appearance.mode = valid(s.appearance.mode, ['system','schedule','day','night'], 'system') as Settings['appearance']['mode'];
  s.quote.mode = valid(s.quote.mode, ['fixed','rotate','daily'], 'rotate') as Settings['quote']['mode'];
  s.quote.source = valid(s.quote.source, ['preset','custom','mixed'], 'preset') as Settings['quote']['source'];
  s.quote.size = valid(s.quote.size, ['s','m','l'], 'm') as Settings['quote']['size'];
  if (![5,15,30,60].includes(s.quote.every)) s.quote.every = 30;
  s.sleep.dim = Number.isFinite(s.sleep.dim) ? Math.max(0, Math.min(.85, s.sleep.dim)) : .7;
  for (const [obj, key, fallback] of [[s.appearance,'dayAt','07:00'],[s.appearance,'nightAt','19:00'],[s.sleep,'from','23:00'],[s.sleep,'to','07:00']] as const) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test((obj as any)[key])) (obj as any)[key] = fallback;
  }
  for (const mode of ['day','night'] as const) for (const key of ['bg','card','digit'] as const) {
    const color = r.custom?.[mode]?.[key];
    if (typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)) s.custom[mode][key] = color.toUpperCase();
  }
  if (s.tz) try { new Intl.DateTimeFormat('en', {timeZone: s.tz}); } catch { s.tz = null; }
  s.quote.custom = s.quote.custom.filter(x => typeof x === 'string' && x.trim()).map(x => Array.from(x.trim()).slice(0,120).join('')).slice(0,40);
  if (Number.isInteger(r.quote?.fixed) && r.quote.fixed >= 0) s.quote.fixed = r.quote.fixed;
  if (r.installDismissed === true) s.installDismissed = true;
  while (settingsBytes(s) > 8192) s.quote.custom.pop();
  return s;
}
