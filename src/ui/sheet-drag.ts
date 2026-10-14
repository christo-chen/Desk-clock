import { localDelta } from '../platform/orientation';
export class SheetDrag {
  active = false;
  offset = 0;
  private velocity = 0;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  begin(x: number, y: number, time: number) {
    this.active = true; this.offset = this.velocity = 0;
    this.startX = this.lastX = x; this.startY = this.lastY = y; this.lastTime = time;
  }
  move(x: number, y: number, time: number, angle: number) {
    if (!this.active) return this.offset;
    this.offset = Math.max(0, localDelta(x - this.startX, y - this.startY, angle).y);
    this.velocity = localDelta(x - this.lastX, y - this.lastY, angle).y / Math.max(1, time - this.lastTime);
    this.lastX = x; this.lastY = y; this.lastTime = time;
    return this.offset;
  }
  end(height: number, time: number) {
    // A pause before releasing must not retain a stale flick velocity.
    const close = this.active && (this.offset > height * .3 || (time - this.lastTime < 120 && this.velocity > .6));
    this.active = false; return close;
  }
  cancel() { this.active = false; this.offset = this.velocity = 0; }
}
