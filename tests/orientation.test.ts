import { afterEach, describe, expect, it, vi } from 'vitest';
import { ForcedLandscape, localDelta, resolveLayout, safeAreaMapping, toggleDirection } from '../src/platform/orientation';
import { SheetDrag } from '../src/ui/sheet-drag';
import { defaults, migrateSettings } from '../src/core/settings';

afterEach(() => vi.unstubAllGlobals());
describe('强制横屏布局', () => {
  it('竖屏向左横放互换宽高并按横屏渲染', () => {
    expect(resolveLayout(390, 844, 'left')).toEqual({ width: 844, height: 390, angle: 90, layout: 'landscape', rotated: true, rotateButton: true });
  });
  it('竖屏向右横放使用-90度', () => {
    expect(resolveLayout(390, 844, 'right')).toMatchObject({ width: 844, height: 390, angle: -90, layout: 'landscape', rotateButton: true });
  });
  it.each(['off', 'left', 'right'] as const)('视口已经横屏时%s不旋转、隐藏按钮', mode => {
    expect(resolveLayout(844, 390, mode)).toEqual({ width: 844, height: 390, angle: 0, layout: 'landscape', rotated: false, rotateButton: false });
  });
  it('关闭时保留竖屏布局和尺寸，不显示旋转按钮', () => {
    expect(resolveLayout(390, 844, 'off')).toEqual({ width: 390, height: 844, angle: 0, layout: 'portrait', rotated: false, rotateButton: false });
  });
  it('正方形视口不强制旋转', () => {
    expect(resolveLayout(500, 500, 'left')).toMatchObject({ angle: 0, rotateButton: false });
  });
  it('左右方向来回切换；关闭时不被快捷切换开启', () => {
    expect(toggleDirection('left')).toBe('right'); expect(toggleDirection('right')).toBe('left'); expect(toggleDirection('off')).toBe('off');
    expect(resolveLayout(390, 844, toggleDirection('left')).angle).toBe(-90);
  });
  it('默认向左横放，v1旧设置合并默认值且保留关闭/向右选择', () => {
    expect(defaults.forceLandscape).toBe('left'); expect(migrateSettings({ v: 1 }).forceLandscape).toBe('left');
    expect(migrateSettings({ forceLandscape: 'off' }).forceLandscape).toBe('off'); expect(migrateSettings({ forceLandscape: 'right' }).forceLandscape).toBe('right');
    expect(migrateSettings({ forceLandscape: 'bad' }).forceLandscape).toBe('left');
  });
  it('安全区随旋转重新对应，物理顶部变为逻辑左/右侧', () => {
    expect(safeAreaMapping(90)).toEqual({ top: 'right', right: 'bottom', bottom: 'left', left: 'top' });
    expect(safeAreaMapping(-90)).toEqual({ top: 'left', right: 'top', bottom: 'right', left: 'bottom' });
    expect(safeAreaMapping(0)).toEqual({ top: 'top', right: 'right', bottom: 'bottom', left: 'left' });
  });
  it('根容器使用逻辑尺寸、安全区和400ms方向切换，原生横屏立即复位', () => {
    const values = new Map<string, string>(), root = {
      style: { transition: '', transform: '', left: '', top: '', setProperty: (key: string, value: string) => values.set(key, value) }, dataset: {} as Record<string,string>
    };
    const app = new ForcedLandscape(root as unknown as HTMLElement, () => false);
    app.apply('left', 390, 844); expect(root.dataset.layout).toBe('landscape'); expect(values.get('--app-width')).toBe('844px'); expect(values.get('--safe-left')).toBe('env(safe-area-inset-top, 0px)');
    expect(root.style.left).toBe('195px'); expect(root.style.top).toBe('422px');
    expect(root.style.transition).toBe('none'); app.apply('right', 390, 844, true);
    expect(root.style.transform).toBe('translate(-50%, -50%) rotate(-90deg)'); expect(root.style.transition).toBe('transform 400ms ease-in-out');
    expect(values.get('--safe-right')).toBe('env(safe-area-inset-top, 0px)');
    app.apply('right', 844, 390); expect(root.style.transform).toBe('translate(-50%, -50%) rotate(0deg)'); expect(root.dataset.rotation).toBe('none');
  });
  it('减弱动态效果使用150ms淡入而不执行整屏旋转动画', () => {
    const animate = vi.fn(() => ({ finished: Promise.resolve(), cancel: () => {} }));
    const root = { style: { transition: '', transform: '', setProperty: () => {} }, dataset: {}, animate };
    const app = new ForcedLandscape(root as unknown as HTMLElement, () => true); app.apply('left', 390, 844); app.apply('right', 390, 844, true); expect(root.style.transition).toBe('none');
    expect(animate).toHaveBeenCalledWith([{ opacity: .3 }, { opacity: 1 }], { duration: 150 });
  });
});
describe('旋转后的面板拖动坐标', () => {
  it.each([[90, -80, 0], [-90, 80, 0], [0, 0, 80]])('旋转%s度时屏幕位移转换为应用向下80px', (angle, x, y) => {
    expect(localDelta(x, y, angle).y).toBeCloseTo(80); expect(localDelta(x, y, angle).x).toBeCloseTo(0);
    const drag = new SheetDrag(); drag.begin(100, 100, 0); expect(drag.move(100 + x, 100 + y, 200, angle)).toBeCloseTo(80); expect(drag.end(200, 250)).toBe(true);
  });
  it('旋转后屏幕原始向下对应应用水平方向，不应关闭', () => {
    const drag = new SheetDrag(); drag.begin(100, 100, 0); expect(drag.move(100, 180, 200, 90)).toBeCloseTo(0); expect(drag.end(200, 250)).toBe(false);
  });
  it('反向拖动不能产生负偏移，慢速短拖回弹', () => {
    const drag = new SheetDrag(); drag.begin(100, 100, 0); expect(drag.move(130, 100, 200, 90)).toBe(0); expect(drag.end(200, 250)).toBe(false);
    drag.begin(100, 100, 0); expect(drag.move(80, 100, 200, 90)).toBeCloseTo(20); expect(drag.end(200, 250)).toBe(false);
  });
  it('快速拖动按逻辑速度关闭；停顿后丢弃过期速度', () => {
    const drag = new SheetDrag(); drag.begin(100, 100, 0); drag.move(125, 100, 20, -90); expect(drag.end(200, 30)).toBe(true);
    drag.begin(100, 100, 0); drag.move(125, 100, 20, -90); expect(drag.end(200, 300)).toBe(false);
  });
  it('取消拖动清除偏移和状态', () => {
    const drag = new SheetDrag(); drag.begin(100, 100, 0); drag.move(50, 100, 20, 90); drag.cancel(); expect(drag.active).toBe(false); expect(drag.offset).toBe(0); expect(drag.end(200, 30)).toBe(false);
  });
});
