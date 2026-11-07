import { themes, nightVision, type Colors } from './themes';
import type { Settings,Mode } from '../core/settings';
import { effectTokens } from './effects';
import {parseGradient,mixColor} from './gradient';
export function colorsFor(s:Settings,mode:Mode,red=false):Colors {
 const theme=themes.find(t=>t.id===s.theme)||themes[0];
 if(red)return nightVision;
 const custom=s.custom[mode],base=theme[mode];
 const digitGradient=parseGradient(custom.digitGradient)||(custom.digit?undefined:base.digitGradient);
 return {...base,...custom,digitGradient,digit:digitGradient?mixColor(...digitGradient):custom.digit||base.digit};
}
export function applyTheme(s:Settings,mode:Mode,red=false) {
 const root=document.documentElement,colors=colorsFor(s,mode,red),theme=themes.find(t=>t.id===s.theme)||themes[0];
 for (const key of ['bg','card','digit','muted','accent'] as const) root.style.setProperty(`--${key}`,colors[key]);
 root.dataset.gradient=String(!!colors.digitGradient);
 root.style.setProperty('--digit-top',colors.digitGradient?.[0]||colors.digit);
 root.style.setProperty('--digit-bottom',colors.digitGradient?.[1]||colors.digit);
 root.style.background=''; root.dataset.mode=mode; root.dataset.effect=effectTokens(theme.effect,mode==='night',red);
 root.style.colorScheme=mode==='night'?'dark':'light';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',colors.bg);
}
