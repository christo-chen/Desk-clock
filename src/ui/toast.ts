let timer:ReturnType<typeof setTimeout>|undefined;
export function toast(text:string,action?:()=>void) {
 document.querySelector('.toast')?.remove();clearTimeout(timer);const el=document.createElement(action?'button':'div');el.className='toast';el.setAttribute('role','status');el.textContent=text;
 if(action)el.addEventListener('click',()=>{action();el.remove();});document.body.append(el);if(!action)timer=setTimeout(()=>el.remove(),6500);
}
