import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { defaults,migrateSettings } from '../src/core/settings';
import { quotePool } from '../src/core/quotes';
import { quotes } from '../src/data/quotes';
import { QuoteDisplay,quoteMetrics } from '../src/ui/quote';
class Node {
 className='';textContent='';hidden=false;dataset:Record<string,string>={};children:Node[]=[];attrs=new Map<string,string>();classes=new Set<string>();
 style:Record<string,any>={setProperty:(k:string,v:string)=>this.style[k]=v};
 classList={add:(s:string)=>this.classes.add(s),toggle:(s:string,on:boolean)=>on?this.classes.add(s):this.classes.delete(s)};
 append(...nodes:Node[]){this.children.push(...nodes);}
 setAttribute(k:string,v:string){this.attrs.set(k,v);}
 getAnimations(){return [];}
}
afterEach(()=>vi.unstubAllGlobals());
describe('语录语言、署名与迁移',()=>{
 it('语录语言默认English，与界面和系统语言独立',()=>{const s=structuredClone(defaults);expect(s.quote.lang).toBe('en');expect(quotePool(s)[0].text).toBe(quotes[0].en);s.lang='en';expect(quotePool(s)[0].text).toBe(quotes[0].en);s.quote.lang='zh';expect(quotePool(s)[0].text).toBe(quotes[0].zh);expect(s.lang).toBe('en');});
 it('36条双语署名完整，苏格拉底出处纠正，格式正确',()=>{expect(quotes).toHaveLength(36);expect(quotes.every(q=>q.source&&q.sourceEn)).toBe(true);const s=structuredClone(defaults);expect(quotePool(s)[0].source).toBe('— Marcus Aurelius, Meditations');expect(quotePool(s)[7].source).toBe("— Socrates, in Plato's Apology");expect(quotePool(s)[35].source).toBe('— Qu Yuan, Li Sao');s.quote.lang='zh';expect(quotePool(s)[7].source).toBe('——苏格拉底，柏拉图《申辩篇》');});
 it('迁移旧字符串，自定义作者可选，不翻译原文',()=>{const s=migrateSettings({lang:'zh',quote:{source:'custom',custom:['旧语录',{text:'Hello 世界',author:'Author'},{text:'无作者'}]}});expect(s.quote.lang).toBe('en');expect(s.quote.custom[0]).toEqual({text:'旧语录',author:''});expect(quotePool(s)).toEqual([{text:'旧语录',source:''},{text:'Hello 世界',source:'— Author'},{text:'无作者',source:''}]);s.quote.lang='zh';expect(quotePool(s)[1]).toEqual({text:'Hello 世界',source:'——Author'});});
 it('新字段默认合并，文本和作者按Unicode字符限制120/40',()=>{const s=migrateSettings({quote:{lang:'bad',custom:[{text:'字'.repeat(200),author:'🙂'.repeat(60)}]}});expect(s.quote.lang).toBe('en');expect(Array.from(s.quote.custom[0].text)).toHaveLength(120);expect(Array.from(s.quote.custom[0].author)).toHaveLength(40);expect(s.themeMotion).toBe(true);expect(migrateSettings({themeMotion:false}).themeMotion).toBe(false);});
});
describe('语录占位与时钟固定布局契约',()=>{
 const css=postcss.parse(readFileSync('src/styles/base.css','utf8'));
 it('时钟使用显式第2轨道，顶部/底部固定为相等的零最小值fr轨道',()=>{
  const declarations=(selector:string)=>{const found=new Map<string,string>();css.walkRules(selector,rule=>rule.walkDecls(d=>{found.set(d.prop,d.value);}));return found;};
  const content=declarations('.clock-content');expect(content.get('display')).toBe('grid');expect(content.get('grid-template-rows')).toBe('minmax(0,1fr) auto minmax(0,1fr)');
  expect(declarations('.clock-content>.clock').get('grid-row')).toBe('2');
  const hidden=declarations('.quote.quote-invisible');
  expect(hidden.get('opacity')).toBe('0');expect(hidden.get('visibility')).toBe('hidden');
  expect(hidden.get('transition')).toContain('visibility 0s 150ms');expect(hidden.has('display')).toBe(false);
  // The two minmax(0,1fr) tracks split the remaining height equally; quote intrinsic height cannot resize them.
 });
 it.each([['portrait',375,true],['landscape',375,false],['forced-landscape',390,false]] as const)('%s语录开关、移除、1/2行、字号变化保持占位且不修改时钟',(_name,short,portrait)=>{
  vi.stubGlobal('document',{createElement:()=>new Node()});
  const view=new QuoteDisplay(),parent=new Node(),clock=new Node();clock.style.gridRow='2';parent.append(clock,view.root as unknown as Node);
  const s=structuredClone(defaults),root=view.root as unknown as Node,clockStyle={...clock.style};
  for(const size of ['s','m','l'] as const)for(const show of [true,false])for(const q of [{text:'One line',source:'— Author'},{text:'Two lines of longer text '.repeat(6),source:'— Author, Work'},undefined]) {
    s.quote.size=size;view.update(q,s,show,false,short,portrait);
    expect(parent.children).toHaveLength(2);expect(parent.children[0]).toBe(clock);expect(clock.style).toEqual(clockStyle);
    expect(root.hidden).toBe(false);expect(root.style.display).not.toBe('none');expect(root.style.height).toBe(`${quoteMetrics(short,size,portrait).height}px`);
    expect(root.classes.has('quote-invisible')).toBe(!show||!q);expect(root.children[1].textContent).toBe(q?.source||'');
  }
 });
 it('每档高度为正文两行加署名一行，署名更小；同档不受句子长短影响',()=>{for(const size of ['s','m','l'] as const){const m=quoteMetrics(390,size);expect(m.source).toBeLessThan(m.font);expect(m.height).toBeCloseTo(m.font*3.3+m.source*1.5+4);}});
});
