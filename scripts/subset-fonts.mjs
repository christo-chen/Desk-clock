import { readFile,writeFile,mkdir,readdir } from 'node:fs/promises';
import { join } from 'node:path';
import subsetFont from 'subset-font';
const fonts=['bebas-neue','big-shoulders-display','orbitron','share-tech-mono','vt323','press-start-2p','major-mono-display','monoton','chakra-petch','jost','dm-serif-display'];
await mkdir('src/assets/fonts',{recursive:true});await mkdir('public/licenses',{recursive:true});
async function find(dir,predicate) {for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory()){const nested=await find(path,predicate);if(nested)return nested;}else if(predicate(entry.name))return path;}}
for (const id of ['dseg',...fonts]) {
 const dir=id==='dseg'?'node_modules/dseg':`node_modules/@fontsource/${id}`;
 const path=await find(dir,name=>id==='dseg'?/DSEG7Classic-Regular\.woff2$/i.test(name):name===`${id}-latin-400-normal.woff2`);
 if(!path)throw new Error(`Font file not found: ${id}`);
 const license=await find(dir,name=>/^(?:.*[-_])?LICENSE(?:\.txt|\.md)?$/i.test(name)||/^OFL\.txt$/i.test(name));
 if(!license)throw new Error(`Font license not found: ${id}`);
 // Validate both inputs before writing this font's outputs. dseg uses DSEG-LICENSE.txt.
 const font = await subsetFont(await readFile(path),'0123456789:. AMP',{targetFormat:'woff2'});
 await writeFile(`src/assets/fonts/${id}.woff2`,font);
 await writeFile(`public/licenses/${id}.txt`,await readFile(license));
}
console.log('裁剪完成：12 款字体，仅保留 0–9、:、.、空格、A/M/P。');
