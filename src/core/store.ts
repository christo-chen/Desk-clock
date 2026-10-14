import { defaults, migrateSettings, settingsBytes, type Settings } from './settings';
export const storageKey = 'deskclock:v1';
export class Store {
  value: Settings;
  private timer?: ReturnType<typeof setTimeout>;
  private listeners = new Set<() => void>();
  constructor() {
    try { this.value = migrateSettings(JSON.parse(localStorage.getItem(storageKey) || 'null')); }
    catch { this.value = structuredClone(defaults); }
  }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  change(fn: (s: Settings) => void): boolean {
    const next = structuredClone(this.value); fn(next);
    if (settingsBytes(next) > 8192) return false;
    this.value = next; clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(),300);
    this.listeners.forEach(f => f()); return true;
  }
  reset() { this.value = structuredClone(defaults); this.flush(); this.listeners.forEach(f => f()); }
  flush() { clearTimeout(this.timer); try { localStorage.setItem(storageKey, JSON.stringify(this.value)); } catch { /* private browsing: retain in memory */ } }
}
