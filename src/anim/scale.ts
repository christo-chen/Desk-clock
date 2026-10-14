import { wa,spring } from './types';
export function scale(old:HTMLElement,next:HTMLElement,delay:number) {
 return [wa(old,[{transform:'scale(1)',filter:'blur(0px)',opacity:1},{transform:'scale(1.3)',filter:'blur(8px)',opacity:0}],420,delay),wa(next,[{transform:'scale(.6)',opacity:0},{transform:'scale(1.06)',opacity:1,offset:.8},{transform:'scale(1)',opacity:1}],420,delay,spring)];
}
