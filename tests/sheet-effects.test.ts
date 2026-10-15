import { describe,expect,it } from 'vitest';
import { SheetDrag,sheetHeights,snapSheet } from '../src/ui/sheet-drag';
import { effectsMoving,effectTokens } from '../src/theme/effects';
describe('设置面板吸附档位',()=>{
 it('横屏/竖屏默认高度保持45%/55%，展开为可用高度90%',()=>{expect(sheetHeights(400,false)).toEqual({default:180,expanded:360});expect(sheetHeights(800,true,40)).toEqual({default:440.00000000000006,expanded:684});});
 it('默认档上拉展开、短拖回默认、继续下拉关闭',()=>{const h={default:180,expanded:360};expect(snapSheet('default',320,0,h)).toBe('expanded');expect(snapSheet('default',170,0,h)).toBe('default');expect(snapSheet('default',50,0,h)).toBe('closed');});
 it('展开档下拉仅回默认，不跨过默认直接关闭',()=>{const h={default:180,expanded:360};expect(snapSheet('expanded',240,0,h)).toBe('default');expect(snapSheet('expanded',10,2,h)).toBe('default');expect(snapSheet('expanded',350,0,h)).toBe('expanded');});
 it('松手速度参与预测，上甩展开、下甩关闭',()=>{const h={default:180,expanded:360};expect(snapSheet('default',190,-1,h)).toBe('expanded');expect(snapSheet('default',150,1,h)).toBe('closed');});
 it.each([[90,160,80],[-90,0,80],[0,80,0]])('旋转%s上拉投影为负位移，保持档位算法一致',(angle,x,y)=>{const d=new SheetDrag();d.begin(80,80,0);d.move(x,y,160,angle);expect(d.signedOffset).toBeCloseTo(-80);expect(d.releaseVelocity(170)).toBeCloseTo(-.5);expect(snapSheet('default',260,d.releaseVelocity(170),{default:180,expanded:360})).toBe('expanded');});
 it('点击横条的微移不当成拖动，取消后清空',()=>{const d=new SheetDrag();d.begin(10,10,0);d.move(12,11,10,0);expect(d.travel).toBeLessThan(6);d.cancel();expect(d.travel).toBe(0);expect(d.signedOffset).toBe(0);});
});
describe('主题特效',()=>{
 it('新增主题的日夜效果正确，夜视关闭特效',()=>{expect(effectTokens('chrono',false)).toBe('none');expect(effectTokens('chrono',true)).toBe('scan warm-glow');expect(effectTokens('realm',false)).toBe('paper');expect(effectTokens('realm',true)).toBe('vignette');expect(effectTokens('hellas',true)).toBe('none');expect(effectTokens('rain',true,true)).toBe('none');});
 it('睡眠/减弱动态效果/后台/开关关闭均停止运动而保留纹理',()=>{expect(effectsMoving(true,false,false,false)).toBe(true);expect(effectsMoving(false,false,false,false)).toBe(false);expect(effectsMoving(true,true,false,false)).toBe(false);expect(effectsMoving(true,false,true,false)).toBe(false);expect(effectsMoving(true,false,false,true)).toBe(false);expect(effectTokens('rain',false)).toBe('rain');});
});
