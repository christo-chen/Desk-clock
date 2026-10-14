import { wa,spring } from './types';
export function drop(old:HTMLElement,next:HTMLElement,delay:number) {
 return [wa(old,[{transform:'translateY(0)',opacity:1},{transform:'translateY(115%)',opacity:0}],430,delay,'cubic-bezier(.55,.05,.9,.6)'),wa(next,[{transform:'translateY(-110%)',opacity:0},{transform:'translateY(5%)',opacity:1,offset:.75},{transform:'translateY(0)',opacity:1}],430,delay+120,spring)];
}
