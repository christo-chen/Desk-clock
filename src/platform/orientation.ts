import type { ForceLandscape } from '../core/settings';
export interface Layout {
  width: number; height: number; angle: 0 | 90 | -90;
  layout: 'portrait' | 'landscape'; rotated: boolean; rotateButton: boolean;
}
export function resolveLayout(width: number, height: number, mode: ForceLandscape): Layout {
  const rotated = height > width && mode !== 'off';
  return {
    width: rotated ? height : width, height: rotated ? width : height,
    angle: rotated ? (mode === 'left' ? 90 : -90) : 0,
    layout: rotated || width >= height ? 'landscape' : 'portrait',
    rotated, rotateButton: rotated
  };
}
export function toggleDirection(mode: ForceLandscape): ForceLandscape {
  return mode === 'off' ? 'off' : mode === 'left' ? 'right' : 'left';
}
type Edge = 'top' | 'right' | 'bottom' | 'left';
export function safeAreaMapping(angle: Layout['angle']): Record<Edge, Edge> {
  if (angle === 90) return { top: 'right', right: 'bottom', bottom: 'left', left: 'top' };
  if (angle === -90) return { top: 'left', right: 'top', bottom: 'right', left: 'bottom' };
  return { top: 'top', right: 'right', bottom: 'bottom', left: 'left' };
}
// Inverse rotation. Browser pointer coordinates must be projected into app axes.
export function localDelta(x: number, y: number, angle: number) {
  const r = angle * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return { x: c * x + s * y, y: -s * x + c * y };
}
export class ForcedLandscape {
  private current?: Layout;
  private fade?: Animation;
  constructor(private root: HTMLElement, private reduced: () => boolean) {}
  get layout() { return this.current!; }
  apply(mode: ForceLandscape, width: number, height: number, animate = false) {
    const next = resolveLayout(width, height, mode), old = this.current;
    if (old && old.width === next.width && old.height === next.height && old.angle === next.angle) return;
    const flip = Boolean(animate && old?.rotated && next.rotated && old.angle !== next.angle);
    this.fade?.cancel();
    this.root.style.transition = flip && !this.reduced() ? 'transform 400ms ease-in-out' : 'none';
    this.root.style.setProperty('--app-width', `${next.width}px`);
    this.root.style.setProperty('--app-height', `${next.height}px`);
    this.root.style.setProperty('--app-short', `${Math.min(next.width, next.height)}px`);
    this.root.style.left = `${width / 2}px`;
    this.root.style.top = `${height / 2}px`;
    for (const [edge, physical] of Object.entries(safeAreaMapping(next.angle))) {
      this.root.style.setProperty(`--safe-${edge}`, `env(safe-area-inset-${physical}, 0px)`);
    }
    this.root.dataset.layout = next.layout;
    this.root.dataset.rotation = next.angle === 90 ? 'left' : next.angle === -90 ? 'right' : 'none';
    this.root.style.transform = `translate(-50%, -50%) rotate(${next.angle}deg)`;
    if (flip && this.reduced()) {
      const fade = this.root.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 150 });
      this.fade = fade;
      fade.finished.then(() => { if (this.fade === fade) this.fade = undefined; }).catch(() => {});
    }
    this.current = next;
  }
  // Read the instantaneous angle so a gesture started during the 400ms flip also follows the visible axes.
  angle() {
    const transform = getComputedStyle(this.root).transform;
    if (typeof DOMMatrixReadOnly !== 'undefined' && transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    }
    return this.current?.angle || 0;
  }
}
