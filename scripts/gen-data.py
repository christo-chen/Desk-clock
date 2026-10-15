import json,re,pathlib
spec=pathlib.Path('SPEC.md').read_text()
meta=[('pure','纯粹','Pure','minimal','dseg','none'),('bauhaus','包豪斯','Bauhaus','minimal','jost','none'),('nixie','辉光管','Nixie','retro','big-shoulders-display','glow'),('split-flap','机场翻牌','Split-flap','retro','bebas-neue','none'),('polar','极地','Polar','tech','orbitron','none'),('phosphor','终端绿','Phosphor','tech','vt323','scan'),('synthwave','合成波','Synthwave','cyber','monoton','glow'),('neon-city','霓虹夜城','Neon City','cyber','chakra-petch','glow'),('forest','森林','Forest','nature','jost','none'),('solar','日光','Solar','nature','share-tech-mono','none'),('latte','拿铁与摩卡','Latte & Mocha','soft','jost','none'),('morandi','莫兰迪','Morandi','soft','bebas-neue','paper'),('ink','水墨','Ink Wash','eastern','dm-serif-display','paper'),('ukiyo-e','浮世绘','Ukiyo-e','eastern','big-shoulders-display','none'),('eink','墨水屏','E-ink','art','dm-serif-display','paper'),('rose','晨曦玫瑰','Rosé','art','dm-serif-display','none')]
meta += [('chrono', '时序局', 'Chrono Bureau', 'retro', 'michroma', 'chrono'), ('rainfall', '雨幕', 'Rainfall', 'art', 'bebas-neue', 'rain'), ('realm', '王国', 'Realm', 'epic', 'cinzel', 'realm'), ('hellas', '古希腊', 'Hellas', 'epic', 'marcellus', 'hellas')]
rows=[re.findall(r'#[0-9A-Fa-f]{6}',line) for line in spec.split('### 7.2 配色表')[1].split('## 8.')[0].splitlines() if '日间' in line or '夜间' in line]
themes=[]
for i,(id,zh,en,style,font,effect) in enumerate(meta):
 themes.append(dict(id=id,zh=zh,en=en,style=style,font=font,effect=effect,day=dict(zip(['bg','card','digit','muted','accent'],rows[2*i])),night=dict(zip(['bg','card','digit','muted','accent'],rows[2*i+1]))))
pathlib.Path('src/theme/themes.ts').write_text('export interface Colors { bg: string; card: string; digit: string; muted: string; accent: string }\nexport interface Theme { id: string; zh: string; en: string; style: string; font: string; effect: string; day: Colors; night: Colors }\nexport const themes: Theme[] = '+json.dumps(themes,ensure_ascii=False,indent=2)+';\nexport const nightVision: Colors = {bg:"#000000",card:"#050000",digit:"#8B1A1A",muted:"#4A1010",accent:"#8B1A1A"};\n')
quotes=[]
for line in spec.split('### 12.1 预设语录')[1].split('## 13.')[0].splitlines():
 cells=[s.strip() for s in line.split('|')]
 if len(cells)>6 and cells[1].isdigit(): quotes.append(dict(zh=cells[2],en=cells[3],source=cells[4],sourceEn=cells[5]))
assert len(quotes)==36 and len(rows)==40
pathlib.Path('src/data/quotes.ts').write_text('export const quotes = '+json.dumps(quotes,ensure_ascii=False,indent=2)+';\n')
