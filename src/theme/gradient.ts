export type Gradient = [string,string];
export function parseGradient(value:unknown):Gradient|undefined {
 if(typeof value==='string'&&/^#[\da-f]{6},#[\da-f]{6}$/i.test(value))return value.toUpperCase().split(',') as Gradient;
}
export function mixColor(a:string,b:string,p=.5) {
 const channels=(s:string)=>s.slice(1).match(/../g)!.map(v=>parseInt(v,16));
 const y=channels(b);return '#'+channels(a).map((v,i)=>Math.round(v+(y[i]-v)*p).toString(16).padStart(2,'0')).join('').toUpperCase();
}
export const gradientCSS=(g:Gradient,direction='to bottom')=>`linear-gradient(${direction},${g[0]},${g[1]})`;
// Canvas uses the same full-height, sRGB interpolation as CSS and SVG.
export function canvasColor(ctx:CanvasRenderingContext2D,cell:HTMLElement,height:number) {
 const css=getComputedStyle(cell),a=css.getPropertyValue('--digit-top').trim(),b=css.getPropertyValue('--digit-bottom').trim();
 if(!a||!b)return css.color;
 const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,a);gradient.addColorStop(1,b);return gradient;
}
