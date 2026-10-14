export function el<K extends keyof HTMLElementTagNameMap>(tag:K,cls='',text='') {const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;}
export function button(text:string,click:()=>void,cls='') {const b=el('button',cls,text);b.type='button';b.addEventListener('click',click);return b;}
export function select(value:string,options:([string,string])[],change:(v:string)=>void) {const s=el('select');for(const [v,label] of options){const o=el('option','',label);o.value=v;s.append(o);}s.value=value;s.addEventListener('change',()=>change(s.value));return s;}
export function row(text:string,control:HTMLElement) {const label=el('label','setting-row');label.append(el('span','',text),control);return label;}
export function toggle(value:boolean,change:(v:boolean)=>void) {const input=el('input');input.type='checkbox';input.setAttribute('switch','');input.checked=value;input.addEventListener('change',()=>change(input.checked));return input;}
