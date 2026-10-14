import type { Settings } from '../core/settings';
import { tr } from '../i18n';

export interface BatteryState {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
}
export interface BatteryNavigator { getBattery?: () => Promise<BatteryState> }
type Preferences = Pick<Settings, 'lang' | 'show'>;
const svgNS = 'http://www.w3.org/2000/svg';
const fillWidth = 18;
const lowColor = '#FF453A';

// No DOM is allocated until the feature is available and the request succeeds.
export class BatteryDisplay {
  private manager?: BatteryState;
  private root?: HTMLSpanElement;
  private svg?: SVGSVGElement;
  private fill?: SVGRectElement;
  private lightning?: SVGPathElement;
  private percentage?: HTMLSpanElement;
  private starting?: Promise<void>;
  private destroyed = false;
  private rendered = '';
  private onBatteryChange = () => this.sync();

  constructor(
    private parent: HTMLElement,
    private preferences: () => Preferences,
    private source: BatteryNavigator,
    private onLayoutChange: () => void = () => {}
  ) {}

  get visible() { return Boolean(this.root); }

  start(): Promise<void> {
    if (this.destroyed || typeof this.source.getBattery !== 'function') return Promise.resolve();
    if (this.starting) return this.starting;
    this.starting = Promise.resolve().then(() => this.source.getBattery!()).then(manager => {
      if (this.destroyed || !manager || !Number.isFinite(manager.level) || typeof manager.charging !== 'boolean'
        || typeof manager.addEventListener !== 'function' || typeof manager.removeEventListener !== 'function') return;
      this.manager = manager;
      manager.addEventListener('levelchange', this.onBatteryChange);
      manager.addEventListener('chargingchange', this.onBatteryChange);
      this.sync();
    }).catch(() => { /* Permission rejection or platform failure: omit the component. */ });
    return this.starting;
  }

  sync() {
    if (!this.manager || this.destroyed) return;
    const { lang, show } = this.preferences();
    const level = Math.max(0, Math.min(1, this.manager.level));
    const charging = this.manager.charging;
    const key = `${lang}|${show.battery}|${show.batteryPercent}|${level}|${charging}`;
    if (key === this.rendered) return;
    this.rendered = key;
    if (!show.battery) {
      if (this.root) { this.root.remove(); this.root = undefined; this.percentage = undefined; this.onLayoutChange(); }
      return;
    }
    const isNew = !this.root;
    if (isNew) this.create();
    const percent = Math.round(level * 100);
    this.fill!.setAttribute('width', String(Math.round(fillWidth * level * 1000) / 1000));
    this.fill!.setAttribute('fill', level < .2 && !charging ? lowColor : 'currentColor');
    this.lightning!.setAttribute('visibility', charging ? 'visible' : 'hidden');
    this.svg!.setAttribute('aria-label', `${tr(lang, 'batteryLevel')} ${percent}%, ${tr(lang, charging ? 'charging' : 'notCharging')}`);
    if (show.batteryPercent) {
      if (!this.percentage) { this.percentage = document.createElement('span'); this.percentage.className = 'battery-percent'; this.percentage.setAttribute('aria-hidden', 'true'); this.root!.append(this.percentage); }
      this.percentage.textContent = `${percent}%`;
    } else if (this.percentage) { this.percentage.remove(); this.percentage = undefined; }
    if (isNew) this.onLayoutChange();
  }

  private create() {
    this.root = document.createElement('span');
    this.root.className = 'battery';
    this.svg = document.createElementNS(svgNS, 'svg');
    this.svg.setAttribute('viewBox', '0 0 28 14');
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('focusable', 'false');
    const outline = document.createElementNS(svgNS, 'rect');
    for (const [key, value] of Object.entries({ x: '1', y: '2', width: '22', height: '10', rx: '2', fill: 'none', stroke: 'currentColor', 'stroke-width': '1' })) outline.setAttribute(key, value);
    const terminal = document.createElementNS(svgNS, 'rect');
    for (const [key, value] of Object.entries({ x: '24', y: '5', width: '2', height: '4', rx: '.8', fill: 'currentColor' })) terminal.setAttribute(key, value);
    this.fill = document.createElementNS(svgNS, 'rect');
    this.fill.setAttribute('class', 'battery-fill');
    for (const [key, value] of Object.entries({ x: '3', y: '4', height: '6', rx: '.8' })) this.fill.setAttribute(key, value);
    this.lightning = document.createElementNS(svgNS, 'path');
    this.lightning.setAttribute('class', 'battery-lightning');
    this.lightning.setAttribute('d', 'M13 2.6 8.7 7.6h3L11 11.4l4.3-5h-3z');
    this.lightning.setAttribute('fill', 'var(--bg)');
    this.lightning.setAttribute('stroke', 'currentColor');
    this.lightning.setAttribute('stroke-width', '.5');
    this.lightning.setAttribute('stroke-linejoin', 'round');
    this.svg.append(outline, terminal, this.fill, this.lightning);
    this.root.append(this.svg);
    this.parent.append(this.root);
  }

  destroy() {
    this.destroyed = true;
    this.manager?.removeEventListener('levelchange', this.onBatteryChange);
    this.manager?.removeEventListener('chargingchange', this.onBatteryChange);
    this.root?.remove();
    this.root = undefined;
    this.manager = undefined;
    this.onLayoutChange();
  }
}
