import { localDelta } from '../platform/orientation';
export class SheetDrag {
  active = false;
  offset = 0;
  signedOffset = 0;
  travel = 0;
  private velocity = 0;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  begin(x: number, y: number, time: number) {
    this.active = true; this.offset = this.signedOffset = this.travel = this.velocity = 0;
    this.startX = this.lastX = x; this.startY = this.lastY = y; this.lastTime = time;
  }
  move(x: number, y: number, time: number, angle: number) {
    if (!this.active) return this.offset;
    this.signedOffset = localDelta(x - this.startX, y - this.startY, angle).y;
    this.offset = Math.max(0, this.signedOffset);
    this.travel = Math.max(this.travel, Math.hypot(x-this.startX,y-this.startY));
    this.velocity = localDelta(x - this.lastX, y - this.lastY, angle).y / Math.max(1, time - this.lastTime);
    this.lastX = x; this.lastY = y; this.lastTime = time;
    return this.offset;
  }
  end(height: number, time: number) {
    // A pause before releasing must not retain a stale flick velocity.
    const close = this.active && (this.offset > height * .3 || (time - this.lastTime < 120 && this.velocity > .6));
    this.active = false; return close;
  }
  releaseVelocity(time:number) { return time-this.lastTime<120?this.velocity:0; }
  cancel() { this.active = false; this.offset = this.signedOffset = this.travel = this.velocity = 0; }
}
export type SheetTier='default'|'expanded'|'closed';
export interface SheetHeights {default:number;expanded:number}
export function sheetHeights(height:number,portrait:boolean,safeTop=0):SheetHeights {
 const available=Math.max(0,height-safeTop);
 const normal=Math.min(available,Math.max(180,height*(portrait?.55:.45)));
 return {default:normal,expanded:Math.max(normal,available*.9)};
}
export function snapSheet(tier:Exclude<SheetTier,'closed'>,visible:number,velocity:number,heights:SheetHeights):SheetTier {
 const projected=visible-velocity*160;
 const choices:SheetTier[]=tier==='expanded'?['default','expanded']:['closed','default','expanded'];
 const height=(state:SheetTier)=>state==='closed'?0:heights[state];
 return choices.reduce((best,item)=>Math.abs(height(item)-projected)<Math.abs(height(best)-projected)?item:best,choices[0]);
}
