import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const result=spawnSync('node_modules/.bin/pwa-assets-generator',['--preset','minimal-2023','public/logo.svg'],{stdio:'inherit'});
if(result.status!==0)throw new Error('PWA 图标生成失败，请先 npm install。');
for(const file of ['apple-touch-icon-180x180.png','pwa-192x192.png','pwa-512x512.png','maskable-icon-512x512.png'])if(!existsSync(`public/${file}`))throw new Error(`Missing icon ${file}`);
