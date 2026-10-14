export const neutrals = ['#000000','#0B0B0C','#1C1C1E','#2C2C2E','#48484A','#8E8E93','#E5E5EA','#F2F2F7','#FFFFFF'];
export const hues=[25,55,75,95,145,185,250,275,305,350];
export const lights=[.22,.35,.55,.72,.88], chromas=[.05,.08,.14,.13,.07];
export function oklchRGB(l:number,c:number,h:number):number[] {
 const a=c*Math.cos(h*Math.PI/180),b=c*Math.sin(h*Math.PI/180);
 const x=(l+.3963377774*a+.2158037573*b)**3,y=(l-.1055613458*a-.0638541728*b)**3,z=(l-.0894841775*a-1.291485548*b)**3;
 return [4.0767416621*x-3.3077115913*y+.2309699292*z,-1.2684380046*x+2.6097574011*y-.3413193965*z,-.0041960863*x-.7034186147*y+1.707614701*z];
}
export function gamutColor(l:number,c:number,h:number) {
  let rgb=oklchRGB(l,c,h);
  while (rgb.some(v=>v<0 || v>1) && c>.00001) { c*=.96; rgb=oklchRGB(l,c,h); }
  return '#'+rgb.map(v=>Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055))).map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function hexHue(hex:string) {
 const [r,g,b]=hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255);const max=Math.max(r,g,b),d=max-Math.min(r,g,b);
 if (!d) return 0; return (((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60)%360+360)%360;
}
export function recommendations(digit:string,night:boolean,key:string) {
 const hue=hexHue(digit); return key==='digit' ? [gamutColor(night?.88:.28,.08,hue),night?'#FFFFFF':'#1C1C1E'] : [gamutColor(night?.16:.95,.015,hue),gamutColor(night?.12:.98,.012,hue)];
}
// Generated once using the exact SPEC OKLCH parameters; no runtime palette computation.
export const palette: string[] = ["#2E100E", "#5D2725", "#B54A46", "#EB827B", "#FEC8C3", "#2C1302", "#592D08", "#AB5805", "#E28D4F", "#FDCCAC", "#271700", "#513400", "#986606", "#D49838", "#F3D2A4", "#211A01", "#463A02", "#86700C", "#BEA333", "#E6D8A3", "#09200B", "#1B451E", "#308639", "#6DBA70", "#BBE4BC", "#01201D", "#03443F", "#128379", "#11BDAF", "#A3E7DD", "#061C31", "#143C62", "#1F74BF", "#60AAF3", "#BBDBFE", "#141831", "#2F3664", "#5B67C2", "#8D9DF5", "#CCD5FE", "#20142D", "#442E5C", "#8559B2", "#B88FE6", "#E2CCFD", "#2B101E", "#582740", "#AB4A7D", "#E181B0", "#FCC5DE"];
