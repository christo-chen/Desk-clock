import './styles/base.css';import './styles/clock.css';import './styles/sheet.css';
import {startApp} from './ui/app';import {registerSW} from 'virtual:pwa-register';import {toast} from './ui/toast';import {tr} from './i18n';import {storageKey} from './core/store';
const language=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
void startApp(document.querySelector<HTMLElement>('#app')!);
const update=registerSW({onNeedRefresh(){toast(tr(language(),'update'),()=>{try{const raw=localStorage.getItem(storageKey);if(raw)localStorage.setItem(storageKey,raw);}catch{}void update(true);});},onOfflineReady(){toast(tr(language(),'offlineReady'));}});
