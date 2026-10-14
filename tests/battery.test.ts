import { afterEach, describe, expect, it, vi } from 'vitest';
import { BatteryDisplay, type BatteryNavigator, type BatteryState } from '../src/ui/battery';
import { defaults, migrateSettings } from '../src/core/settings';

// Minimal DOM boundary for unit tests; no browser, jsdom, or runtime dependency.
class Node {
  children: Node[] = [];
  parent?: Node;
  attributes = new Map<string, string>();
  className = '';
  textContent = '';
  constructor(readonly tag: string) {}
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  getAttribute(key: string) { return this.attributes.get(key); }
  append(...nodes: Node[]) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); this.parent = undefined; }
  all(): Node[] { return [this, ...this.children.flatMap(n => n.all())]; }
}
class Manager implements BatteryState {
  listeners = new Map<string, Set<() => void>>();
  constructor(public level: number, public charging = false) {}
  addEventListener(type: string, callback: () => void) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type)!.add(callback); }
  removeEventListener(type: string, callback: () => void) { this.listeners.get(type)?.delete(callback); }
  fire(type: string) { this.listeners.get(type)?.forEach(callback => callback()); }
}
function fixture(source: BatteryNavigator) {
  const create = vi.fn((tag: string) => new Node(tag));
  vi.stubGlobal('document', { createElement: create, createElementNS: (_ns: string, tag: string) => create(tag) });
  const parent = new Node('div'), preferences = structuredClone(defaults);
  const component = new BatteryDisplay(parent as unknown as HTMLElement, () => preferences, source);
  const fill = () => parent.all().find(n => n.getAttribute('class') === 'battery-fill')!;
  const lightning = () => parent.all().find(n => n.getAttribute('class') === 'battery-lightning')!;
  return { component, parent, preferences, create, fill, lightning };
}
afterEach(() => vi.unstubAllGlobals());

describe('电量组件', () => {
  it('接口不支持时无组件、无SVG或占位', async () => {
    const f = fixture({}); await f.component.start(); f.component.sync();
    expect(f.component.visible).toBe(false); expect(f.parent.children).toHaveLength(0); expect(f.create).not.toHaveBeenCalled();
  });
  it('接口不可调用或读取失败时安静降级', async () => {
    for (const source of [{ getBattery: undefined }, { getBattery: () => Promise.reject(Error('denied')) }, { getBattery: () => { throw Error('unavailable'); } }]) {
      const f = fixture(source); await expect(f.component.start()).resolves.toBeUndefined(); expect(f.parent.children).toHaveLength(0); expect(f.create).not.toHaveBeenCalled();
    }
  });
  it.each([[.15, 2.7, '#FF453A'], [.5, 9, 'currentColor'], [1, 18, 'currentColor']])('电量%s的SVG填充比例和颜色正确', async (level, width, color) => {
    const f = fixture({ getBattery: async () => new Manager(Number(level)) }); await f.component.start();
    expect(f.fill().getAttribute('width')).toBe(String(width)); expect(f.fill().getAttribute('fill')).toBe(color);
    expect(f.lightning().getAttribute('visibility')).toBe('hidden');
    expect(f.parent.all().some(n => n.className === 'battery-percent')).toBe(false);
  });
  it('充电时保持当前电量填充、显示闪电且低电量不变红', async () => {
    const f = fixture({ getBattery: async () => new Manager(.15, true) }); await f.component.start();
    expect(f.fill().getAttribute('width')).toBe('2.7'); expect(f.fill().getAttribute('fill')).toBe('currentColor'); expect(f.lightning().getAttribute('visibility')).toBe('visible');
  });
  it('20%边界未充电不变红', async () => {
    const f = fixture({ getBattery: async () => new Manager(.2) }); await f.component.start(); expect(f.fill().getAttribute('fill')).toBe('currentColor');
  });
  it('levelchange / chargingchange实时更新并复用SVG', async () => {
    const manager = new Manager(.5), f = fixture({ getBattery: async () => manager }); await f.component.start();
    const svg = f.parent.all().find(n => n.tag === 'svg'); manager.level = .15; manager.fire('levelchange');
    expect(f.fill().getAttribute('width')).toBe('2.7'); expect(f.fill().getAttribute('fill')).toBe('#FF453A');
    manager.charging = true; manager.fire('chargingchange'); expect(f.lightning().getAttribute('visibility')).toBe('visible'); expect(f.fill().getAttribute('fill')).toBe('currentColor'); expect(f.parent.all().find(n => n.tag === 'svg')).toBe(svg);
    await f.component.start(); expect(manager.listeners.get('levelchange')?.size).toBe(1);
  });
  it('显示开关移除组件，百分比开关与语言设置立即生效', async () => {
    const f = fixture({ getBattery: async () => new Manager(.5) }); await f.component.start();
    f.preferences.show.batteryPercent = true; f.component.sync(); expect(f.parent.all().find(n => n.className === 'battery-percent')?.textContent).toBe('50%');
    f.preferences.lang = 'en'; f.component.sync(); expect(f.parent.all().find(n => n.tag === 'svg')?.getAttribute('aria-label')).toBe('Battery 50%, Not charging');
    f.preferences.show.battery = false; f.component.sync(); expect(f.parent.children).toHaveLength(0);
    f.preferences.show.battery = true; f.preferences.show.batteryPercent = false; f.component.sync(); expect(f.component.visible).toBe(true); expect(f.parent.all().some(n => n.className === 'battery-percent')).toBe(false);
  });
  it('默认关闭显示时即使API可用也不创建DOM', async () => {
    const f = fixture({ getBattery: async () => new Manager(.5) }); f.preferences.show.battery = false; await f.component.start(); expect(f.create).not.toHaveBeenCalled();
  });
  it('组件销毁后移除监听；异步读取结束不再挂载', async () => {
    const manager = new Manager(.5), f = fixture({ getBattery: async () => manager }); await f.component.start(); f.component.destroy();
    expect(f.parent.children).toHaveLength(0); expect(manager.listeners.get('levelchange')?.size).toBe(0); expect(manager.listeners.get('chargingchange')?.size).toBe(0);
    let resolve!: (manager: BatteryState) => void; const pending = fixture({ getBattery: () => new Promise(r => resolve = r) }); const starting = pending.component.start(); await Promise.resolve(); pending.component.destroy(); resolve(manager); await starting; expect(pending.create).not.toHaveBeenCalled();
  });
  it('旧版v1设置合并电量默认值，并保留用户的false', () => {
    expect(migrateSettings({ v: 1, show: { seconds: false } }).show).toMatchObject({ seconds: false, battery: true, batteryPercent: false });
    expect(migrateSettings({ v: 1, show: { battery: false, batteryPercent: true } }).show).toMatchObject({ battery: false, batteryPercent: true });
  });
});
