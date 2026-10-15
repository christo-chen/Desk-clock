import { readdir,readFile,writeFile } from 'node:fs/promises';import { join } from 'node:path';import { gzipSync } from 'node:zlib';
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else out.push(p);}return out;}
const list=await files('dist'),sizes={js:0,css:0,fonts:0,cache:0};
for(const file of list){const data=await readFile(file);sizes.cache+=data.length;if(file.endsWith('.js'))sizes.js+=gzipSync(data).length;if(file.endsWith('.css'))sizes.css+=gzipSync(data).length;if(file.endsWith('.woff2'))sizes.fonts+=data.length;}
const labels={js:'JavaScript (gzip)',css:'CSS (gzip)',fonts:'字体合计',cache:'离线缓存总量（整个 dist，含 SW / 许可证）'},limits={js:50*1024,css:15*1024,fonts:150*1024,cache:400*1024};
for(const key of Object.keys(sizes)){console.log(`${labels[key]}: ${(sizes[key]/1024).toFixed(2)} KB / ${limits[key]/1024} KB`);if(sizes[key]>limits[key])throw new Error(`Budget exceeded: ${key}`);}
const fonts=list.filter(x=>x.endsWith('.woff2'));if(fonts.length!==15)throw Error(`Expected 15 subset fonts; got ${fonts.length}`);
await writeFile('artifacts-budget.json',JSON.stringify(sizes,null,2)+'\n');
