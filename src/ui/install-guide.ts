import type {Store} from '../core/store';import {tr} from '../i18n';import {el,button} from './dom';
export function installGuide(store:Store) {
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent),safari=/Safari/.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
 if(!ios||!safari||(navigator as Navigator&{standalone?:boolean}).standalone||matchMedia('(display-mode: standalone)').matches||store.value.installDismissed)return;
 const card=el('aside','install-guide');card.setAttribute('aria-live','polite');document.body.append(card);
 function render(){const t=(key:Parameters<typeof tr>[1])=>tr(store.value.lang,key);card.replaceChildren(el('h2','',t('installTitle')),el('p','',t('installBody')));const steps=el('div','install-steps');steps.append(el('span','','↑ '+t('share')),el('span','','→'),el('span','','⊞ '+t('addHome')));card.append(steps,button(t('dismiss'),()=>{card.remove();unsubscribe();store.change(s=>s.installDismissed=true);},'primary'));}
 const unsubscribe=store.subscribe(render);render();
}
