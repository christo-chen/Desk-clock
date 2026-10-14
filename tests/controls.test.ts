import { afterEach, describe, expect, it, vi } from 'vitest';
import { controls } from '../src/ui/controls';
import { defaults } from '../src/core/settings';
class Node {
  className = ''; innerHTML = ''; hidden = false; type = '';
  children: Node[] = []; attributes = new Map<string,string>(); classes = new Set<string>();
  events = new Map<string,()=>void>();
  classList = { add: (name:string)=>this.classes.add(name), remove: (name:string)=>this.classes.delete(name) };
  append(...nodes:Node[]) { this.children.push(...nodes); }
  setAttribute(key:string,value:string) { this.attributes.set(key,value); }
  getAttribute(key:string) { return this.attributes.get(key); }
  addEventListener(event:string,handler:()=>void) { this.events.set(event,handler); }
}
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals();});
describe('主界面按钮',()=>{
  it('仅日夜/设置/条件旋转按钮，无主题快捷入口；旋转按钮共用4秒隐藏和唤回',()=>{
    vi.useFakeTimers();const events=new Map<string,()=>void>();
    vi.stubGlobal('document',{createElement:()=>new Node(),querySelector:()=>null,addEventListener:(name:string,handler:()=>void)=>events.set(name,handler)});
    const s=structuredClone(defaults),rotate=vi.fn();let canRotate=true;
    const ui=controls(()=>s,()=>{},()=>{},rotate,()=>canRotate),root=ui.root as unknown as Node;
    expect(root.children.map(b=>b.getAttribute('aria-label'))).toEqual(['切换日 / 夜','设置','旋转']);
    expect(root.children[2].className).toContain('rotation-control'); expect(root.children[2].hidden).toBe(false);
    root.children[2].events.get('click')!();expect(rotate).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(4000);expect(root.classes.has('asleep')).toBe(true);events.get('pointerdown')!();expect(root.classes.has('asleep')).toBe(false);
    canRotate=false;ui.update();expect(root.children[2].hidden).toBe(true);
    s.lang='en';ui.update();expect(root.children[2].getAttribute('aria-label')).toBe('Rotate');
  });
});
