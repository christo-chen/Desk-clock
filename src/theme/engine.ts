import { themes, nightVision, type Colors } from './themes';
import type { Settings,Mode } from '../core/settings';
export function colorsFor(s:Settings,mode:Mode,red=false):Colors {
 const theme=themes.find(t=>t.id===s.theme)||themes[0];
 return red ? nightVision : {...theme[mode],...s.custom[mode]};
}
export function applyTheme(s:Settings,mode:Mode,red=false) {
 const root=document.documentElement,colors=colorsFor(s,mode,red),theme=themes.find(t=>t.id===s.theme)||themes[0];
 for (const [key,color] of Object.entries(colors)) root.style.setProperty(`--${key}`,color);
 root.style.background=''; root.dataset.mode=mode; root.dataset.effect=red?'none':(theme.effect==='paper'||mode==='night'?theme.effect:'none');
 root.style.colorScheme=mode==='night'?'dark':'light';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',colors.bg);
}
