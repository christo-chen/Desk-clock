import widths from '../assets/font-widths.json';
export const fontScale = (id:string) => Math.min(.76,.56/((widths as Record<string,number>)[id] || 1));
export const fonts = [
 ['dseg','DSEG7 Classic'],['bebas-neue','Bebas Neue'],['big-shoulders-display','Big Shoulders Display'],['orbitron','Orbitron'],['share-tech-mono','Share Tech Mono'],['vt323','VT323'],['press-start-2p','Press Start 2P'],['major-mono-display','Major Mono Display'],['monoton','Monoton'],['chakra-petch','Chakra Petch'],['jost','Jost'],['dm-serif-display','DM Serif Display'],['michroma','Michroma'],['cinzel','Cinzel'],['marcellus','Marcellus']
] as const;
const urls = import.meta.glob('../assets/fonts/*.woff2', { query: '?url', import: 'default', eager: true }) as Record<string,string>;
const loaded = new Map<string,Promise<void>>();
export function loadFont(id:string) {
 if (!fonts.some(f=>f[0]===id)) id='dseg';
 if (!loaded.has(id)) {
  const face = new FontFace(`clock-${id}`, `url(${urls[`../assets/fonts/${id}.woff2`]})`);
  document.fonts.add(face);
  loaded.set(id, face.load().then(()=>document.fonts.load(`16px "clock-${id}"`, '12:34')).then(()=>undefined).catch(()=>undefined));
 }
 return loaded.get(id)!;
}
export function loadPreviews() { return Promise.all(fonts.map(([id])=>loadFont(id))); }
