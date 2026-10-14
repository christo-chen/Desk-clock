import type { Settings } from '../core/settings'; import type { TimeParts } from '../core/time';
export interface RenderContext { settings:()=>Settings; reduced:()=>boolean; speed:number }
export interface ClockRenderer {
 mount(root:HTMLElement,ctx:RenderContext):void;
 update(t:TimeParts,animate:boolean):void;
 resize():void;
 destroy():void;
 demo?():void;
}
