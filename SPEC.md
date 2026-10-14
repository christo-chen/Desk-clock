# 桌面时钟 Desk Clock：最终方案与实现规格 v1.2

> 本文件是实现规格。实现者（Codex）应完整阅读后一次性实现全部功能。遇到本文未写明的细节，按“简单、免费、美观、省资源”的原则自行决定，不要停下来提问。

## 0. 本版相对上一版的改动

- 移除主界面主题快捷按钮；设置每次默认打开「主题皮肤」。新增默认向左横放的「强制横屏」及条件显示的旋转按钮，适配 iPhone 旋转锁定。
- 增加日期行右侧的电量图标与可选百分比；使用 Battery Status API 事件更新，不支持该接口的设备（包括 iPhone Safari）完全不渲染电量组件。
- 以 iPhone 为唯一主要目标；Android 只做“能用就行”的顺带兼容，不做专门测试，不出安装包。
- 默认主题改为最朴素的黑白配「纯粹」，其他主题由用户自己去主题皮肤里换。
- 主题从 12 套改为 16 套，分 8 种风格；复古、科技、赛博朋克各保留 2 套，新增极简、自然、柔和、东方、文艺 4 种风格。
- 每套主题都有日间和夜间两种配色，并新增外观模式自动切换、颜色平滑过渡、睡眠模式、按日夜分别保存自定义配色。
- 时钟种类从 4 种增加到 6 种：新增辉光管和极简指针。
- 字体从 10 款增加到 12 款，新增几何无衬线 Jost 和衬线体 DM Serif Display，用于极简、东方和文艺主题。
- 语录改为以欧洲文学和哲学为主：欧洲 30 条，中国古代 6 条，全部中英双语。
- 界面中英双语，可切换，默认中文。
- 取消分阶段开发，改为一次性交付；增加内存与存储预算、Codex 自测要求和你在 iPhone 上的验收清单。

## 1. 目标与原则

做一个放在桌上的全屏时钟。手机横放，屏幕常亮，中间是大号时间，上方是日期，下方是一句语录。整体参考你截图里的翻页时钟 App，但动画更顺滑，配色更讲究。

**四条原则**：简单（零运行时依赖，不用前端框架）、免费（只用免费开源的字体、工具和托管）、美观（预设配色经过对比度校验，动画只用 GPU 友好的属性）、易部署（推送到 GitHub 后自动上线，手机上「添加到主屏幕」即可使用）。

**交付方式**：一次性交付完整可用的版本，不分阶段。全部代码、图标、字体处理都由 Codex 用代码和脚本生成，不需要人工设计素材。你只负责最后在 iPhone 上验收。

## 2. 平台与交付

### 2.1 形式：PWA（添加到主屏幕的网页应用）

应用是一个静态网页，带安装清单和离线缓存。iPhone 用 Safari 打开网址，点「分享 → 添加到主屏幕」后，就会出现一个图标，点开即全屏运行，没有地址栏，断网也能用。不需要应用商店，不需要开发者账号，不需要任何费用。

### 2.2 iOS 版本要求

| iOS 版本 | 支持情况 |
|---|---|
| 18.4 及以上（含 iOS 26） | 完整支持，推荐。主屏幕应用里的屏幕常亮接口在 18.4 才被苹果修复。 |
| 16.4 至 18.3 | 可以运行。屏幕常亮可能失效，首次打开时提示用户把「设置 > 显示与亮度 > 自动锁定」设为「永不」。 |
| 低于 16.4 | 不支持，显示一句提示。 |

其他依赖的浏览器能力都做特性检测并提供降级：CSS linear() 缓动（Safari 17.2 起支持，不支持时用 cubic-bezier 代替）、@property 颜色过渡（16.4 起）、oklch 颜色（15.4 起）。

### 2.3 Android

同一套代码在 Android 的 Chrome 里也能「安装应用」并运行，不做额外适配和测试。遇到只在 Android 出现的问题，不修。不做 apk 安装包。

### 2.4 托管

使用 GitHub Pages，免费、自带 HTTPS。代码推送到 main 分支后，由 GitHub Actions 自动构建并发布。网址形如 https://christo-chen.github.io/desk-clock/（仓库名可改）。

## 3. 功能总览

| 功能 | 必选/可选 | 默认 | 说明 |
|---|---|---|---|
| 时、分 | 必选 | 显示 | 不可关闭 |
| 秒 | 可选 | 显示 | 关闭后只显示两组数字，数字更大 |
| 12/24 小时制 | 可选 | 24 小时 | 12 小时制在小时卡片左上角显示 AM/PM |
| 年、月、日 | 可选 | 显示 | 三项分别开关 |
| 星期 | 可选 | 显示 | 跟随界面语言 |
| 电量 | 可选 | 显示 | 仅 Battery Status API 可用且读取成功时显示；不支持时无组件、无占位 |
| 电量百分比 | 可选 | 关闭 | 在电池图标旁显示百分比，需电量开关开启 |
| 底部语录 | 可选 | 显示 | 预设 36 条 + 用户自定义 |
| 时钟种类 | — | 翻页卡片 | 6 种，见第 5 节 |
| 动画 | — | 翻页 | 6 种（含无动画），见第 6 节 |
| 主题皮肤 | — | 纯粹（黑白） | 16 套，每套含日间和夜间配色，见第 7 节 |
| 外观模式 | — | 跟随系统 | 跟随系统 / 定时 / 始终日间 / 始终夜间，见第 8 节 |
| 强制横屏 | — | 向左横放 | 关闭 / 向左横放 / 向右横放；仅竖屏视口时旋转整个应用，见 4.6 |
| 睡眠模式 | 可选 | 关 | 定时调暗、红色夜视，见第 8 节 |
| 背景、字体颜色、蒙版 | — | 跟随主题 | 自定义色板与自由取色，日夜分别保存，见第 9 节 |
| 字体 | — | 跟随主题 | 12 款免费字体，见第 10 节 |
| 界面语言 | — | 中文 | 中文 / English |
| 时区 | — | 跟随系统 | 可手动指定 |
| 屏幕常亮 | 可选 | 开 | 见 2.2 |
| 防烧屏微移 | 可选 | 开 | 每分钟整体平移几个像素 |

## 4. 界面设计

### 4.1 主界面布局

- 横屏：上方居中是日期和星期；中间是时钟（秒开启时三组，关闭时两组）；下方居中是语录。与截图布局一致。
- 竖屏：关闭强制横屏时，时钟的几组数字上下排列，日期在最上，语录在最下；开启时内部按横屏布局渲染。
- 电量图标位于日期行右侧，用内联 SVG 绘制，内部填充长度按 0–100% 电量比例变化；充电时图标内部显示闪电。电量严格低于 20% 且未充电时，填充改为红色 `#FF453A`，其余状态跟随辅助文字色。默认不显示具体百分比。
- 竖屏顶部内容内边距不小于 `env(safe-area-inset-top) + 16px`（并保留最少 65px 顶部空间），内容不进入 iPhone 系统状态栏安全区。Safari 不支持 Battery Status API 时仅使用系统状态栏本身的电池显示。
- 所有尺寸按屏幕短边等比例计算，适配从 iPhone SE 到 Pro Max 的各种尺寸。内容避开刘海和灵动岛（使用 safe-area 安全区）。
- 圆形按钮：左上角「日/夜」快速切换，右上角「设置」。设置面板每次打开默认选中「主题皮肤」。右下角仅在强制横屏生效时显示「旋转」弯曲箭头按钮，用于切换左右方向。按钮为半透明圆形，配色随主题变化；没有主题快捷按钮。
- 无操作 4 秒后，按钮淡出隐藏，只留时钟；轻点屏幕任意位置重新显示。

### 4.2 设置面板

从底部滑出的半透明面板，背景是毛玻璃模糊，能透过面板实时看到时钟的变化。日间用浅色面板，夜间用深色面板。面板高度约为屏幕的 45%（横屏）或 55%（竖屏）。

顶部是可横向滑动的标签栏，选中项下方有一条会滑动的下划线。共 10 个标签：

| 标签 | 内容 |
|---|---|
| 主题皮肤 | 风格筛选（全部 / 极简 / 复古 / 科技 / 赛博朋克 / 自然 / 柔和 / 东方 / 文艺）+ 主题卡片横向列表。每张卡片用纯 CSS 画出“12:34”的迷你预览，左上半是日间配色、右下半是夜间配色。点一下立即应用。 |
| 时钟 | 6 种时钟种类卡片，带静态迷你预览。指针时钟下方额外显示「平滑扫秒 / 跳秒」选项。 |
| 动画 | 6 个选项。点选后，时钟当前的秒数立即演示一次该动画，不用等下一秒。 |
| 字体 | 12 款字体，每款以“12:34”预览。当前时钟种类不使用字体时（数码管、点阵、指针），显示一行说明。 |
| 背景 | 色板 + 推荐色 + 自由取色，见第 9 节。 |
| 字体颜色 | 同上。 |
| 蒙版 | 同上（蒙版即数字背后的卡片颜色）。 |
| 显示 | 开关：秒、12 小时制、年、月、日、星期、语录、显示电量（默认开）、显示电量百分比（默认关）；时区选择。 |
| 语录 | 显示方式、轮换间隔、来源、自定义语录编辑，见第 12 节。 |
| 通用 | 语言、强制横屏（关闭 / 向左横放 / 向右横放，默认向左横放）、外观模式、睡眠模式、屏幕常亮、防烧屏、恢复默认、关于（版本号、字体与配色致谢）。 |

### 4.3 动效与手感

- 面板打开和关闭用弹簧曲线（CSS linear() 模拟），约 420 毫秒；可以用手指按住顶部的小横条往下拖，面板跟手移动，松手时按速度决定关闭或回弹。
- 色块、卡片按下时缩小到 0.94 倍，松开弹回；选中项外圈显示一个随主题色变化的圆环。
- 切换主题、切换日夜时，所有颜色在 1.2 秒内平滑过渡，不是瞬间跳变。
- 开关使用 iOS 原生样式的开关控件（input type="checkbox" switch），Safari 在 iPhone 上会给出系统级的触感反馈。
- 所有界面动效只改变 transform 和 opacity，保证 60Hz 和 120Hz 屏幕都不掉帧。系统开启「减弱动态效果」时，全部改为短暂的淡入淡出。

### 4.4 双语

所有界面文字都有中文和英文两套。默认中文，在「通用」里切换，切换后立即生效。日期格式随语言变化：中文为“2026年10月14日 星期三”，英文为“Wednesday, 14 October 2026”。界面文字使用系统字体（苹方 / SF Pro），不额外下载中文字体，以节省空间。

### 4.5 首次打开

如果检测到是在 Safari 里直接打开（不是从主屏幕图标打开），显示一张半透明引导卡片，用图示说明「分享 → 添加到主屏幕」，可以关闭且不再提示。

### 4.6 强制横屏与旋转锁定

- 通用设置提供「关闭 / 向左横放 / 向右横放」，默认「向左横放」，保存在 `forceLandscape`（`off | left | right`）中。
- 仅当视口高大于宽且设置不为关闭时，把整个 `#app` 根容器宽高互换并居中铺满视口：向左横放为 `rotate(90deg)`，向右横放为 `rotate(-90deg)`。视口已是横屏或为正方形时不旋转。此功能不调用或依赖系统屏幕方向锁定 API。
- 时钟、日期、语录、按钮、设置面板、提示及安装引导都位于同一根容器。CSS 根据应用的逻辑宽高选择布局、字体尺寸和面板高度，不以未旋转视口的 orientation 媒体查询选择布局。横屏数字按可用宽度缩放，防止小屏溢出。
- 安全区随方向映射：+90° 时物理顶部成为应用左侧，-90° 时物理顶部成为应用右侧；其余三个边也同步映射。内容和按钮避开映射后的状态栏、刘海、灵动岛与底部安全区。
- 右下角「旋转」按钮仅在上述强制旋转生效时显示；点击切换 left / right 并保存，整个界面仅用 transform 在 400ms 内平滑旋转180°。4秒无操作自动隐藏，轻点屏幕恢复；减弱动态效果时改为150ms淡入。
- 设置面板拖动将 PointerEvent 的屏幕 X/Y 位移按根容器当前旋转矩阵转换为应用坐标。在 +90° 时屏幕向左拖动为应用向下，在 -90° 时屏幕向右拖动为应用向下；距离与松手速度均在该坐标系计算，取消拖动回弹。

## 5. 时钟种类（6 种）

| 种类 | 外观 | 是否使用字体 |
|---|---|---|
| 翻页卡片（默认，重点） | 每两位数字一张圆角卡片，中间一道细缝把卡片分成上下两半，与截图一致。卡片有极轻微的上亮下暗渐变，日间主题带柔和投影。 | 是 |
| 数码管 | 七段数码管。每一位背后用同一字体画出半透明的“8”，作为未点亮的段落（鬼影），像真实的 LED/LCD 屏。 | 固定 DSEG7 |
| 点阵 | 每位数字由 5×7 个圆点组成，亮点为数字颜色，暗点为数字颜色的 8% 透明度，像车站的点阵显示屏。字形数据直接写在代码里。 | 否 |
| 极简大字 | 没有卡片，只有大号数字，适合展示艺术字体。蒙版颜色在这种样式下不显示。 | 是 |
| 辉光管 | 每位数字装在一个圆角玻璃管里：管身是淡淡的玻璃渐变和高光；0 到 9 十个数字以极低透明度叠在管内（模拟真实的阴极）；点亮的数字带分层光晕；管前覆盖一层蜂窝状金属网纹。 | 是 |
| 极简指针 | 包豪斯风格的指针表盘：12 个刻度、不标数字，细长的时针和分针用数字颜色，秒针用强调色并带配重。可选「平滑扫秒」或「跳秒」（跳秒带极轻微的回弹）。 | 否 |

为防止数字切换时左右晃动，每一位数字都放在固定宽度的格子里居中显示，不依赖字体本身是否等宽。数字使用 font-variant-numeric: tabular-nums。

## 6. 动画（6 种）

动画只作用于变化的那一部分。翻页动画以“组”为单位：一组两位数字中任意一位变化，整张卡片翻动（与 Fliqlo 等经典翻页时钟一致）。其余动画以“位”为单位，只有变化的那一位数字播放。多组同时变化时（例如 09:59:59 到 10:00:00），从右往左依次延迟 60 毫秒启动，形成连贯的波浪。

在非卡片样式（数码管、点阵、极简大字、辉光管）上选择“翻页”时，改为单个数字沿水平轴翻转。指针时钟不使用这 6 种动画，改用自己的扫秒或跳秒。

| 动画 | 效果 | 实现要点 | 时长 |
|---|---|---|---|
| 翻页（默认，重点） | 旧数字的上半片向下翻折，露出新数字的上半；随后新数字的下半片落下盖住旧数字的下半，落定时轻微回弹。翻动中，被遮住的半片逐渐变暗，翻起的半片先亮后暗，模拟纸牌的光影。 | 见下方 6.1 | 600 ms |
| 像素转换 | 旧数字先变成粗颗粒马赛克，再按随机顺序一格一格熄灭；新数字的格子随机点亮，最后由马赛克还原成清晰的数字。 | Canvas 覆盖在该位数字上方；把旧数字和新数字画到低分辨率离屏画布上，关闭平滑缩放后放大绘制。点阵样式直接随机切换圆点，不需要 Canvas。 | 450 ms |
| 数字掉落 | 旧数字像受重力一样加速下落并淡出；新数字从上方掉下来，落地后弹一下再停稳。 | Web Animations API；旧数字用加速曲线，新数字用弹簧曲线，延迟 120 ms 开始。格子裁切超出部分。 | 550 ms |
| 缩放 | 旧数字放大、变模糊、淡出；新数字从 0.6 倍放大，稍微超过一点再回到原大小。 | transform: scale + filter: blur，模糊不超过 8px。 | 420 ms |
| 向上蒸发 | 旧数字向上飘起，从顶部开始逐渐模糊消散，同时有十几个细小的光点从数字笔画上升起；新数字从下方淡入并变清晰。 | 旧数字：位移 + 模糊 + 渐变遮罩；光点：从旧数字的像素中取样，用一个小 Canvas 绘制，结束后立即释放。 | 700 ms |
| 无动画 | 直接切换。 | — | 0 |

### 6.1 翻页动画实现规格

1. 每张卡片由四层组成：静态上半（显示新数字的上半）、静态下半（先显示旧数字的下半）、翻动上半（旧数字的上半，以底边为轴）、翻动下半（新数字的下半，以顶边为轴）。
1. 每一层是一个高度 50%、裁切溢出的容器，里面放完整高度的数字，用位移只露出对应的一半。四层各自带圆角，不对整张卡片做 3D 变换，以避开 Safari 中“3D 变换 + 圆角 + 裁切”导致闪烁的已知问题。
1. 前 300 ms：翻动上半从 0° 转到 -90°，缓入曲线；同时静态上半上的暗色遮罩从 35% 淡到 0。
1. 后 300 ms：翻动下半从 90° 转到 0°，使用带约 4° 回弹的弹簧曲线；同时静态下半上的暗色遮罩从 0 加深到 35%。
1. 结束后，把静态下半更新为新数字，移除两个翻动层上的动画，清除 will-change。
1. 卡片容器设置 perspective（约为卡片高度的 3 倍），两个翻动层设置 backface-visibility: hidden（带 -webkit- 前缀）。
1. 如果上一次动画还没结束又来了新的变化（例如调试加速时），先调用 finish() 立即完成上一次，再开始下一次。

### 6.2 流畅度要求

- 除像素转换和向上蒸发的光点外，所有动画只改变 transform、opacity 和 filter，由 GPU 合成，不触发重排。
- 动画开始前给相关元素加 will-change，结束后立即移除，避免长期占用显存。
- Canvas 只在动画期间创建，结束后把宽高设为 0 并移除；像素密度最多按 2 倍计算。
- 页面切到后台时不排任何动画；回到前台时直接显示当前时间，不补播错过的动画。
- 开启「减弱动态效果」时，所有动画改为 150 ms 的淡入淡出。

## 7. 主题皮肤（16 套，每套含日间 + 夜间）

主题皮肤是搭配好的整套方案。应用一个主题会同时设置：日间配色、夜间配色、推荐字体、特效。时钟种类和动画不受主题影响，由用户单独选择。应用主题会清除之前的自定义颜色。

**默认主题是「纯粹」**：夜间为深灰背景、黑色卡片、白色数字（与截图一致），日间为浅灰背景、白色卡片、近黑数字。其余主题需要用户自己去主题皮肤里换。

每套配色有 5 个颜色：背景、蒙版（卡片）、数字、辅助文字（日期和语录）、强调色（指针秒针、选中状态等）。数码管鬼影、点阵暗点等由数字颜色按透明度自动派生。

**配色校验**：所有 32 套配色都满足“数字对卡片”和“辅助文字对背景”的对比度不低于 3:1（WCAG 大号文字标准），由单元测试自动检查。

### 7.1 主题列表

| 风格 | 主题 | 推荐字体 | 特效 | 配色来源 |
|---|---|---|---|---|
| 极简 | 纯粹（默认） / Pure (default) | DSEG7 Classic | 无 | iOS 系统灰阶 |
| 极简 | 包豪斯 / Bauhaus | Jost | 无 | 包豪斯 / 瑞士平面设计：米白、黑、红 |
| 复古 | 辉光管 / Nixie | Big Shoulders Display | 辉光（仅夜间） | 真实辉光管的橙色氖光 |
| 复古 | 机场翻牌 / Split-flap | Bebas Neue | 无 | 机场/车站机械翻牌显示屏 |
| 科技 | 极地 / Polar | Orbitron | 无 | Nord 配色（MIT） |
| 科技 | 终端绿 / Phosphor | VT323 | 扫描线（仅夜间） | 老式单色 CRT 终端的磷光绿 |
| 赛博朋克 | 合成波 / Synthwave | Monoton | 辉光（仅夜间） | SynthWave '84 配色（Robb Owen，MIT） |
| 赛博朋克 | 霓虹夜城 / Neon City | Chakra Petch | 辉光（仅夜间） | 赛博朋克常见的青 + 洋红霓虹 |
| 自然 | 森林 / Forest | Jost | 无 | Everforest 配色（MIT） |
| 自然 | 日光 / Solar | Share Tech Mono | 无 | Solarized 配色（Ethan Schoonover，MIT） |
| 柔和 | 拿铁与摩卡 / Latte & Mocha | Jost | 无 | Catppuccin 配色 Latte / Mocha（MIT） |
| 柔和 | 莫兰迪 / Morandi | Bebas Neue | 纸纹 | 莫兰迪灰调色系 |
| 东方 | 水墨 / Ink Wash | DM Serif Display | 纸纹 | 中国传统色：玄青、月白、象牙白、墨色、胭脂 |
| 东方 | 浮世绘 / Ukiyo-e | Big Shoulders Display | 无 | Kanagawa 配色 Wave / Lotus（MIT），灵感来自北斋《神奈川冲浪里》 |
| 文艺 | 墨水屏 / E-ink | DM Serif Display | 纸纹 | 电子书阅读器的米黄纸色 |
| 文艺 | 晨曦玫瑰 / Rosé | DM Serif Display | 无 | Rosé Pine 配色 Main / Dawn（MIT） |

特效说明：辉光是在数字周围叠两层同色的静态阴影；扫描线是一层 2 像素间隔、6% 透明度的横线；纸纹是一张 64×64 像素、由代码生成的噪点纹理，以 4% 透明度平铺。辉光和扫描线在日间配色下自动关闭，因为它们在浅色背景上会显得脏。

### 7.2 配色表

| 主题 | 模式 | 背景 | 蒙版 | 数字 | 辅助文字 | 强调 |
|---|---|---|---|---|---|---|
| 纯粹（默认） | 日间 | `#F2F2F7` | `#FFFFFF` | `#1C1C1E` | `#6C6C70` | `#1C1C1E` |
|  | 夜间 | `#1C1C1E` | `#000000` | `#FFFFFF` | `#8E8E93` | `#FFFFFF` |
| 包豪斯 | 日间 | `#F1EDE4` | `#FAF8F3` | `#1A1A1A` | `#6B6660` | `#D7332A` |
|  | 夜间 | `#141414` | `#1F1F1F` | `#F1EDE4` | `#8A857E` | `#E0473C` |
| 辉光管 | 日间 | `#EDE3D6` | `#2A211C` | `#FF7A3D` | `#7A5C48` | `#C24A17` |
|  | 夜间 | `#0B0806` | `#000000` | `#FF6A2B` | `#9A6A4C` | `#FF6A2B` |
| 机场翻牌 | 日间 | `#E9E4DA` | `#1C1C1C` | `#F2F0EA` | `#5E5A54` | `#C99A00` |
|  | 夜间 | `#0F0F0F` | `#1C1C1C` | `#EDEAE3` | `#77736C` | `#E8B90F` |
| 极地 | 日间 | `#ECEFF4` | `#E5E9F0` | `#5E81AC` | `#4C566A` | `#BF616A` |
|  | 夜间 | `#2E3440` | `#3B4252` | `#88C0D0` | `#A3ADBF` | `#EBCB8B` |
| 终端绿 | 日间 | `#E4ECE4` | `#F2F6F1` | `#1F6B3A` | `#4F6B57` | `#1F6B3A` |
|  | 夜间 | `#050A06` | `#000000` | `#7EE29A` | `#4F8A60` | `#7EE29A` |
| 合成波 | 日间 | `#F3E9F5` | `#FFFFFF` | `#C42A8E` | `#6B5E8A` | `#0A8790` |
|  | 夜间 | `#262335` | `#1A1726` | `#FF7EDB` | `#848BBD` | `#36F9F6` |
| 霓虹夜城 | 日间 | `#EDF3F7` | `#FFFFFF` | `#0A7799` | `#5A6A80` | `#D6166F` |
|  | 夜间 | `#0D0B1A` | `#17122B` | `#00F0FF` | `#8A7FB0` | `#FF2E97` |
| 森林 | 日间 | `#FDF6E3` | `#F4F0D9` | `#5A7A1E` | `#6F7E6E` | `#B07D00` |
|  | 夜间 | `#2D353B` | `#232A2E` | `#A7C080` | `#859289` | `#DBBC7F` |
| 日光 | 日间 | `#FDF6E3` | `#EEE8D5` | `#1F74B0` | `#657B83` | `#CB4B16` |
|  | 夜间 | `#002B36` | `#073642` | `#2AA198` | `#839496` | `#B58900` |
| 拿铁与摩卡 | 日间 | `#EFF1F5` | `#E6E9EF` | `#8839EF` | `#6C6F85` | `#EA76CB` |
|  | 夜间 | `#1E1E2E` | `#181825` | `#CBA6F7` | `#A6ADC8` | `#F5C2E7` |
| 莫兰迪 | 日间 | `#E3DDD5` | `#EEE9E3` | `#5E5257` | `#776C66` | `#A88F84` |
|  | 夜间 | `#2B2829` | `#343031` | `#C9B8B0` | `#8F8480` | `#9FB0A6` |
| 水墨 | 日间 | `#EFE9DC` | `#FFFBF0` | `#3D3B4F` | `#50616D` | `#9D2933` |
|  | 夜间 | `#16161A` | `#1E1E24` | `#D6ECF0` | `#758A99` | `#C8505A` |
| 浮世绘 | 日间 | `#F2ECBC` | `#E5DDB0` | `#43436C` | `#6A695F` | `#C84053` |
|  | 夜间 | `#1F1F28` | `#16161D` | `#DCD7BA` | `#7E7D74` | `#7E9CD8` |
| 墨水屏 | 日间 | `#F4ECD8` | `#FBF6EA` | `#3B3226` | `#76695A` | `#3B3226` |
|  | 夜间 | `#1A1814` | `#221F1A` | `#CFC3AA` | `#8A7F6C` | `#CFC3AA` |
| 晨曦玫瑰 | 日间 | `#FAF4ED` | `#FFFAF3` | `#B4637A` | `#797593` | `#907AA9` |
|  | 夜间 | `#191724` | `#1F1D2E` | `#EBBCBA` | `#908CAA` | `#C4A7E7` |

**关于名称与授权**：标注 MIT 的配色来自对应的开源主题项目，App 内使用自己的中英文名称，并在「关于」页面致谢原项目。中国传统色取自开源数据集 chinese-colors 中的玄青、月白、象牙白、墨色、胭脂等，为保证屏幕对比度做了少量调整。

## 8. 日间与夜间

### 8.1 外观模式

| 模式 | 行为 |
|---|---|
| 跟随系统（默认） | 跟随 iPhone 的浅色/深色外观，系统切换时 App 同步切换。 |
| 定时 | 在设定时间切换，默认 07:00 进入日间、19:00 进入夜间，可修改。 |
| 始终日间 | 固定使用日间配色。 |
| 始终夜间 | 固定使用夜间配色。 |

- 左上角的日/夜按钮可以临时切换，持续到下一次自动切换为止。
- 切换时所有颜色 1.2 秒平滑过渡（用 @property 注册颜色变量，再对变量做 transition）。
- 同时更新页面的 theme-color，让 iPhone 状态栏颜色与背景一致。

### 8.2 睡眠模式

专为床头或夜里放在桌上设计，独立于外观模式，默认关闭。

- 定时生效，默认 23:00 到次日 07:00。
- 进入时用 3 秒逐渐调暗。网页无法直接调节 iPhone 的屏幕亮度，所以用一层黑色半透明遮罩降低画面亮度，默认 70%，可在 0% 到 85% 之间调节。在 OLED 屏幕上，这能同时降低发光量和耗电。
- 可选「红色夜视」：改用黑底暗红字的专用配色，对夜间视觉干扰最小。
- 睡眠期间自动隐藏秒和语录，动画改为淡入淡出，减少画面变化。
- 轻点屏幕可临时恢复正常亮度 10 秒，然后自动回到睡眠状态。
| 红色夜视配色 | 背景 | 蒙版 | 数字 | 辅助文字 | 强调 |
|---|---|---|---|---|---|
| 夜视红 | `#000000` | `#050000` | `#8B1A1A` | `#4A1010` | `#8B1A1A` |

夜视红故意做成低对比度，不参与对比度测试。

### 8.3 自定义配色按日夜分别保存

用户在背景、字体颜色、蒙版里改的颜色，只作用于当前正在显示的模式。这三个标签页顶部有一个「正在编辑：日间 / 夜间」切换，切过去时时钟也会预览对应模式。这样白天和晚上可以各有一套自己喜欢的搭配。

## 9. 自定义配色

### 9.1 色板

- **中性色 9 个**：#000000、#0B0B0C、#1C1C1E、#2C2C2E、#48484A、#8E8E93、#E5E5EA、#F2F2F7、#FFFFFF。
- **彩色 50 个**：10 个色相（红 25°、橙 55°、琥珀 75°、黄 95°、绿 145°、青 185°、蓝 250°、靛 275°、紫 305°、粉 350°），每个色相 5 档亮度。用 OKLCH 色彩空间生成：亮度分别为 0.22、0.35、0.55、0.72、0.88，彩度分别为 0.05、0.08、0.14、0.13、0.07，超出屏幕色域时自动降低彩度。生成后转为十六进制，写死在代码里。
- **排列方式**：背景和蒙版的色板把深色排在前面；字体颜色的色板把亮色排在前面。
- **自由取色**：色板末尾有一个「+」按钮，打开色相、饱和度、亮度三个滑块和一个十六进制输入框。

### 9.2 帮助用户配出好看颜色

- **推荐色**：每个色板最前面有一行“推荐”。根据当前数字颜色的色相，自动生成同色系的深色背景和蒙版（夜间：亮度 0.16 / 0.12，日间：亮度 0.95 / 0.98，彩度很低）。
- **对比度提示**：色板下方实时显示“数字对蒙版”的对比度。低于 3:1 时显示黄色提示“数字可能看不清”。
- **当前选中**：选中的色块显示对勾，下方显示颜色的十六进制值。

## 10. 字体（12 款）

全部为 SIL Open Font License 1.1 授权，可免费使用和随应用分发。字体从 npm 包获取（Fontsource 和 dseg），构建时用脚本只保留时钟用到的字符（0-9、冒号、句点、空格、A、M、P），每款压缩到几 KB。

| # | 字体 | npm 包 | 风格 | 用于 |
|---|---|---|---|---|
| 1 | DSEG7 Classic | dseg | 七段数码管 | 纯粹（默认）、数码管时钟 |
| 2 | Bebas Neue | @fontsource/bebas-neue | 高窄粗体 | 机场翻牌、莫兰迪 |
| 3 | Big Shoulders Display | @fontsource/big-shoulders-display | 海报感窄体 | 辉光管、浮世绘 |
| 4 | Orbitron | @fontsource/orbitron | 几何科技感 | 极地 |
| 5 | Share Tech Mono | @fontsource/share-tech-mono | 等宽终端 | 日光 |
| 6 | VT323 | @fontsource/vt323 | CRT 终端点阵 | 终端绿 |
| 7 | Press Start 2P | @fontsource/press-start-2p | 8-bit 像素 | 搭配像素转换动画 |
| 8 | Major Mono Display | @fontsource/major-mono-display | 几何艺术等宽 | 自选 |
| 9 | Monoton | @fontsource/monoton | 霓虹灯管线条 | 合成波 |
| 10 | Chakra Petch | @fontsource/chakra-petch | 切角未来感 | 霓虹夜城 |
| 11 | Jost | @fontsource/jost | 几何无衬线（包豪斯） | 包豪斯、森林、拿铁与摩卡 |
| 12 | DM Serif Display | @fontsource/dm-serif-display | 高对比衬线 | 水墨、墨水屏、晨曦玫瑰 |

只有当前使用的字体在启动时加载；字体标签页打开时再加载其余字体用于预览。全部字体会被离线缓存。

## 11. 时间与日期

- **电量**：先检测 `typeof navigator.getBattery === "function"`，调用成功后读取 `level` 和 `charging`；监听 `levelchange` / `chargingchange` 实时更新，不设置轮询计时器。接口不支持、读取被拒绝或失败时，不渲染电量 DOM、不占位、不报错。显示电量开关关闭时移除组件；百分比开关独立保存，电量关闭时不显示百分比。
- **电量颜色与睡眠**：图标轮廓、正常填充及百分比继承主题辅助文字色，日夜切换同样在 1.2 秒内过渡；低电量未充电的填充使用上述红色。组件位于主内容内，睡眠模式与其他元素一起被遮罩调暗，不额外隐藏电量。
- **时间来源**：iPhone 系统时钟（Date.now()）。系统已与网络校时，精度足够，不另外联网校时。
- **时区**：默认读取系统时区；「显示」页可从完整的时区列表中手动指定（Intl.supportedValuesOf("timeZone")，支持搜索）。手动指定时，日期行末尾显示城市名。
- **格式化**：用 Intl.DateTimeFormat 的 formatToParts 取出年月日、星期、时分秒，hourCycle 设为 h23 或 h12。格式化器对象缓存复用，不在每秒新建。
- **刷新**：不用固定的 1000 ms 定时器。每次刷新后计算到下一个整秒还差多少毫秒，再加 8 ms 余量，用 setTimeout 精确对齐。秒关闭时改为对齐到整分钟。
- **回到前台**：监听 visibilitychange 和 pageshow，回到前台时立即重新读取时间并刷新显示（不播放动画），再重新对齐计时器。
- **边界情况**：跨午夜时日期、星期同步更新；夏令时切换（例如爱尔兰 2026 年 10 月 25 日凌晨 2 点回拨到 1 点）因为每次都直接读系统时间而自动正确；用户手动改系统时间后，下一秒即同步。

## 12. 底部语录

- **预设 36 条**：欧洲文学与哲学 30 条，中国古代 6 条。每条都有中文和英文，按界面语言显示。
- **版权**：只收录早已进入公有领域的作者和作品。中文译文为本项目自译；英文为流传已久的公有领域译法或本项目的简短自译。
- **显示方式**：固定一条 / 每隔 N 分钟轮换（5、15、30、60，默认 30）/ 每天一条。轮换时淡出旧句、淡入新句。
- **来源**：仅预设 / 仅自定义 / 两者混合（默认仅预设，添加自定义语录后自动变为混合）。
- **自定义**：可以添加、编辑、删除，单条最长 120 个字符，不区分语言，任何语言下都显示原文。
- **样式**：字号小、中、大三档，颜色使用主题的辅助文字色。过长时自动缩小字号，最多显示两行。

### 12.1 预设语录

| # | 中文 | English | 出处 |
|---|---|---|---|
| 1 | 不必再争论好人该是什么样，去做一个就是了。 | Waste no more time arguing what a good man should be. Be one. | 马可·奥勒留《沉思录》 |
| 2 | 宇宙即变化，人生即看法。 | The universe is change; our life is what our thoughts make it. | 马可·奥勒留《沉思录》 |
| 3 | 我们一再拖延，生命却在飞逝。 | While we are postponing, life speeds by. | 塞涅卡《道德书简》 |
| 4 | 我们在想象中受的苦，多于在现实中。 | We suffer more often in imagination than in reality. | 塞涅卡《道德书简》 |
| 5 | 先告诉自己你想成为什么样的人，然后去做你该做的事。 | First say to yourself what you would be; and then do what you have to do. | 爱比克泰德《语录》 |
| 6 | 不能主宰自己的人，就不是自由的人。 | No man is free who is not master of himself. | 爱比克泰德 |
| 7 | 人不能两次踏进同一条河流。 | No man ever steps in the same river twice. | 赫拉克利特 |
| 8 | 未经审视的人生不值得过。 | The unexamined life is not worth living. | 柏拉图《申辩篇》 |
| 9 | 一只燕子造不成春天，一天也不能。 | One swallow does not make a summer, nor does one day. | 亚里士多德《尼各马可伦理学》 |
| 10 | 抓住今天，尽量少相信明天。 | Seize the day, and put as little trust as possible in tomorrow. | 贺拉斯《颂歌》 |
| 11 | 时光飞逝，一去不返。 | Time flies, never to be regained. | 维吉尔《农事诗》 |
| 12 | 滴水穿石。 | Dripping water hollows out stone. | 奥维德《黑海书简》 |
| 13 | 你们生来不是为了像野兽一样活着，而是为了追求美德和知识。 | You were not made to live like brutes, but to follow virtue and knowledge. | 但丁《神曲·地狱篇》 |
| 14 | 生命的价值不在于长短，而在于如何使用。 | The value of life lies not in the length of days, but in the use we make of them. | 蒙田《随笔集》 |
| 15 | 读得多、走得多的人，见得多，也知道得多。 | He who reads much and walks much, sees much and knows much. | 塞万提斯《堂吉诃德》 |
| 16 | 我们知道自己是什么，却不知道自己可能成为什么。 | We know what we are, but know not what we may be. | 莎士比亚《哈姆雷特》 |
| 17 | 疑虑是叛徒，让我们因不敢尝试，而失去本可以得到的美好。 | Our doubts are traitors, and make us lose the good we oft might win by fearing to attempt. | 莎士比亚《一报还一报》 |
| 18 | 有好的头脑还不够，重要的是好好运用它。 | It is not enough to have a good mind; the main thing is to use it well. | 笛卡尔《谈谈方法》 |
| 19 | 人类的一切不幸都源于一件事：不懂得安静地待在房间里。 | All of humanity's problems stem from man's inability to sit quietly in a room alone. | 帕斯卡《思想录》 |
| 20 | 一切美好的事物，既难得又稀少。 | All things excellent are as difficult as they are rare. | 斯宾诺莎《伦理学》 |
| 21 | 我们得耕种自己的园地。 | We must cultivate our garden. | 伏尔泰《老实人》 |
| 22 | 要有勇气运用你自己的理智。 | Have courage to use your own understanding. | 康德《什么是启蒙》 |
| 23 | 知道还不够，必须应用；愿意还不够，必须行动。 | Knowing is not enough; we must apply. Willing is not enough; we must do. | 歌德《威廉·迈斯特的漫游时代》 |
| 24 | 人生只能向后理解，但必须向前生活。 | Life can only be understood backwards; but it must be lived forwards. | 克尔凯郭尔《日记》 |
| 25 | 知道为什么而活的人，几乎能忍受任何一种生活。 | He who has a why to live can bear almost any how. | 尼采《偶像的黄昏》 |
| 26 | 最强大的两位战士，是耐心和时间。 | The strongest of all warriors are these two: time and patience. | 托尔斯泰《战争与和平》 |
| 27 | 最重要的是，不要对自己撒谎。 | Above all, don't lie to yourself. | 陀思妥耶夫斯基《卡拉马佐夫兄弟》 |
| 28 | 我们都身处阴沟，但仍有人在仰望星空。 | We are all in the gutter, but some of us are looking at the stars. | 王尔德《温德米尔夫人的扇子》 |
| 29 | 对心中尚未解开的一切，要有耐心。 | Be patient toward all that is unsolved in your heart. | 里尔克《给青年诗人的信》 |
| 30 | 真正的发现之旅，不在于寻找新的风景，而在于拥有新的眼光。 | The real voyage of discovery consists not in seeking new landscapes, but in having new eyes. | 普鲁斯特《追忆似水年华》 |
| 31 | 千里之行，始于足下。 | A journey of a thousand miles begins with a single step. | 《老子》 |
| 32 | 不积跬步，无以至千里。 | Without small steps, there is no journey of a thousand miles. | 《荀子·劝学》 |
| 33 | 逝者如斯夫，不舍昼夜。 | Time flows on like this river, never ceasing day or night. | 《论语·子罕》 |
| 34 | 盛年不重来，一日难再晨。 | The prime of life never comes twice; a day has but one morning. | 陶渊明《杂诗》 |
| 35 | 吾生也有涯，而知也无涯。 | My life has a limit, but knowledge has none. | 《庄子·养生主》 |
| 36 | 路漫漫其修远兮，吾将上下而求索。 | The road ahead is long and far; I will search high and low. | 屈原《离骚》 |

## 13. 性能与资源预算

目标是装得小、跑得轻、不费电。以下数值作为硬性指标，Codex 在构建后自动检查前三项。

| 项目 | 上限 | 做法 |
|---|---|---|
| JavaScript（gzip 后） | 50 KB | 不使用任何前端框架和运行时依赖；设置面板在第一次打开时才创建。 |
| CSS（gzip 后） | 15 KB | 手写 CSS，用 CSS 变量驱动主题。 |
| 字体合计 | 150 KB | 构建时裁剪字符，只保留时钟用到的约 15 个字形。 |
| 离线缓存总量 | 400 KB | 无图片素材；图标、纹理都由代码生成。 |
| 本地设置数据 | 8 KB | 一个 localStorage 键，带版本号。主屏幕应用不受 Safari 7 天清除网站数据规则的影响。 |
| 运行内存（JS 堆） | 约 10 MB | 计时器对象和格式化器复用；动画结束即释放 Canvas 和动画对象。 |
| 空闲时 CPU | 接近 0 | 两次刷新之间没有任何循环；不使用 requestAnimationFrame 常驻循环。 |
| 主界面 DOM 节点 | 300 个以内 | 只更新变化的数字，不整体重绘。 |

## 14. 技术实现

### 14.1 技术选型

| 层面 | 选择 |
|---|---|
| 语言 / 构建 | TypeScript + Vite |
| 界面 | 原生 DOM + 手写 CSS，零运行时依赖 |
| 动画 | CSS 3D 变换 + Web Animations API + Canvas 2D |
| PWA | vite-plugin-pwa（generateSW 模式，registerType: prompt） |
| 字体 | Fontsource 与 dseg 的 npm 包，构建脚本用 subset-font 裁剪为 woff2 |
| 图标 | Codex 手写 SVG，用 @vite-pwa/assets-generator 生成各尺寸 PNG（含 180×180 的 apple-touch-icon） |
| 测试 | Vitest（单元测试）；环境允许时用 Playwright 的 WebKit 截图自检 |
| 部署 | GitHub Actions + GitHub Pages |

### 14.2 目录结构

```
desk-clock/
  index.html                 # 内联首屏背景色，避免启动白闪
  vite.config.ts             # base 取自环境变量 BASE_PATH
  SPEC.md  README.md
  scripts/subset-fonts.mjs   # 裁剪字体到 src/assets/fonts/
  scripts/gen-icons.mjs      # 由 SVG 生成图标
  src/
    main.ts
    core/      time.ts  ticker.ts  settings.ts  store.ts  debug.ts
    clocks/    types.ts  flip.ts  segment.ts  dotmatrix.ts  minimal.ts  nixie.ts  analog.ts
    anim/      types.ts  flip.ts  pixel.ts  drop.ts  scale.ts  evaporate.ts  none.ts
    theme/     themes.ts  palette.ts(OKLCH)  contrast.ts  engine.ts  effects.ts
    data/      quotes.ts  fonts.ts  dotmatrix-glyphs.ts
    i18n/      index.ts  zh.ts  en.ts
    ui/        app.ts  controls.ts  sheet.ts  tabs/*.ts  toast.ts  install-guide.ts
    platform/  wakelock.ts  appearance.ts  sleep.ts  burnin.ts
    styles/    base.css  clock.css  sheet.css
  tests/       *.test.ts
  .github/workflows/deploy.yml
```

### 14.3 两个核心接口

时钟种类和动画是两个独立维度，任何数字类时钟都能搭配任何动画。新增一种只需实现接口，不改动其他代码。

```
interface ClockRenderer {
  mount(root: HTMLElement, ctx: RenderContext): void;
  update(t: TimeParts, animate: boolean): void;   // 只处理变化的部分
  resize(): void;
  destroy(): void;
}
interface DigitTransition {
  run(cell: HTMLElement, from: string, to: string, opts: { delay: number }): Animation[] | void;
}
```

### 14.4 设置数据结构

```
{
  "v": 1,
  "lang": "zh",                       // "zh" | "en"
  "theme": "pure",
  "clock": "flip",                    // flip|segment|dotmatrix|minimal|nixie|analog
  "anim": "flip",                     // flip|pixel|drop|scale|evaporate|none
  "analogMotion": "sweep",            // sweep|tick
  "font": null,                       // null 表示跟随主题
  "custom": { "day": {}, "night": {} }, // 只保存被改过的 bg/card/digit
  "show": { "seconds": true, "h12": false, "year": true, "month": true,
            "day": true, "weekday": true, "quote": true,
            "battery": true, "batteryPercent": false },
  "tz": null,                         // null 表示跟随系统
  "appearance": { "mode": "system", "dayAt": "07:00", "nightAt": "19:00" },
  "sleep": { "on": false, "from": "23:00", "to": "07:00", "dim": 0.7, "red": false },
  "quote": { "mode": "rotate", "every": 30, "source": "preset", "size": "m", "custom": [] },
  "wakeLock": true,
  "burnIn": true,
  "forceLandscape": "left"            // off | left | right
}
```

保存在 localStorage 的 deskclock:v1 键下，修改后 300 ms 防抖写入。读取时与默认值深度合并，并按版本号迁移。
新增电量项沿用版本 1；旧设置缺少 `show.battery` / `show.batteryPercent` 时分别合并为 `true` / `false`，用户已经保存的布尔值保持不变。
强制横屏同样沿用版本1；旧设置缺少 `forceLandscape` 时合并为 `left`，已有的 `off` / `left` / `right` 保持不变，非法值回退为默认向左横放。

### 14.5 iPhone 专项注意事项

- head 中设置 viewport-fit=cover、apple-mobile-web-app-capable、apple-mobile-web-app-status-bar-style 为 black-translucent、apple-touch-icon；manifest 中 display 为 standalone，start_url 和 scope 为相对路径。
- 页面禁止缩放、长按菜单和文字选择：touch-action: manipulation、-webkit-touch-callout: none、user-select: none；html 和 body 设置 overscroll-behavior: none，防止橡皮筋回弹。
- 尺寸使用 dvh / svh 单位和 env(safe-area-inset-*)，横屏时避开灵动岛。
- 竖屏为系统状态栏留出顶部安全区和额外 16px 间距；Battery Status API 不支持时电量组件不渲染，不仿造系统电量。
- iPhone 不允许网页真正锁定屏幕方向，使用4.6的整页CSS旋转处理旋转锁定；关闭该功能后横竖屏仍有完整布局。
- 屏幕常亮：启动时、回到前台时、第一次轻点屏幕时各请求一次 Wake Lock；失败时只提示一次设置自动锁定的方法。
- 3D 翻转元素都加 -webkit-backface-visibility: hidden；不在同一元素上同时使用 3D 变换、圆角和 overflow: hidden。
- 启动时先用 document.fonts.load 加载当前字体再显示时钟，避免字体闪烁。
- 新版本发布后，显示一个“有新版本，轻点更新”的小提示，点击后刷新。

### 14.6 调试参数（方便你测试）

| 网址参数 | 作用 |
|---|---|
| ?speed=60 | 时间加速 60 倍，用来快速观察分钟、小时的翻页。可填 1 到 3600。 |
| ?t=23:59:50 | 从指定时间开始走，用来测试跨小时、跨午夜。 |
| ?fps=1 | 左下角显示实时帧率。 |
| ?reset=1 | 清除所有设置，恢复默认。 |

## 15. 部署与安装

### 15.1 部署（一次性，约 5 分钟）

1. 在 GitHub 新建一个空仓库，例如 desk-clock。
1. 让 Codex 把代码推送到这个仓库的 main 分支（或你手动推送）。
1. 在仓库的 Settings → Pages 中，把 Source 设为 GitHub Actions。
1. 等待 Actions 运行完成（约 1 分钟），网址为 https://christo-chen.github.io/desk-clock/。
1. 以后每次推送代码都会自动更新，已安装的 App 下次打开时会提示更新。

工作流里的 BASE_PATH 由仓库名自动生成，改仓库名不需要改代码。备选方案：把构建出的 dist 文件夹拖到 Cloudflare Pages 的网页上传，同样免费。

### 15.2 在 iPhone 上安装

1. 用 Safari 打开上面的网址。
1. 点底部的「分享」按钮，选择「添加到主屏幕」，再点「添加」。
1. 从主屏幕的图标打开，手机横放即可。

## 16. 测试与验收

### 16.1 Codex 交付前必须自测通过

- npm run build 成功，并打印 JS、CSS、字体和缓存总量，均不超过第 13 节的预算。
- npm test 全部通过，至少包含：整秒对齐计算；中英文日期格式；Europe/Dublin 2026-10-25 夏令时回拨；12/24 小时制；32 套配色的对比度不低于 3:1；设置的默认值合并与版本迁移；36 条语录中英文都不为空；OKLCH 色板生成的颜色都在屏幕色域内。
- 电量单元测试包含：接口不支持时不渲染组件；15% / 50% / 100% 及充电状态的 SVG 填充；严格低于 20% 的未充电红色；两个事件即时更新；显示与百分比开关、中英文文案、旧设置默认合并。
- 强制横屏单元测试包含：竖屏互换宽高和横屏布局；横屏不旋转；左右切换；关闭不旋转且无按钮；安全区映射；拖动距离/速度坐标换算；设置默认合并；按钮4秒隐藏及轻点唤回。
- 如果环境能安装 Playwright 的 WebKit：对 6 种时钟、16 个主题的日夜配色、横竖屏各截一张图，人工检查无错位、无溢出；不能安装则跳过，并在 README 中说明。
- 写好 README.md（中文）：项目说明、本地运行、部署步骤、iPhone 安装步骤、调试参数、字体与配色致谢。

### 16.2 你在 iPhone 上的验收清单

1. 从主屏幕打开是全屏，没有地址栏；默认是「纯粹」黑白 + 翻页卡片 + 翻页动画，并显示秒。
1. 时间与 time.is 网站一致，误差不到 0.5 秒；日期和星期正确。
1. 放着不动 10 分钟，屏幕不熄灭。
1. 横竖屏切换布局都正常，灵动岛不遮挡内容。
1. 开启iPhone旋转锁定后，默认向左横放按横屏显示；旋转按钮切换左右并平滑翻转180°。通用页选择关闭后恢复正常竖屏；真正横屏时不额外旋转也不显示旋转按钮。打开设置默认是主题皮肤，旋转后的点击和面板拖动正确。
1. 竖屏日期行避开系统状态栏；iPhone Safari 不出现应用内电量或空占位。支持 Battery Status API 的浏览器显示电池比例和充电闪电，显示页两个开关即时生效，默认不显示百分比；睡眠时随其他内容调暗。
1. 打开 ?speed=60，逐一切换 6 种时钟和 6 种动画，动作流畅，没有闪烁。
1. 16 个主题逐一点开，日夜切换时颜色平滑过渡。
1. 自定义背景、字体颜色、蒙版；日间和夜间分别保存；对比度提示和推荐色正常。
1. 12 款字体都能正常显示。
1. 显示页的所有开关都生效；手动选一个其他时区，时间正确。
1. 语录按设置轮换；能添加和删除自定义语录。
1. 中英文切换后，界面、日期、语录都变成对应语言。
1. 睡眠模式（可临时把时间段改到当前时间测试）：逐渐调暗、红色夜视、轻点临时恢复都正常。
1. 开飞行模式后重新打开 App，仍能正常使用。
1. 完全关闭 App 再打开，所有设置都还在。
1. 设置面板拖动关闭跟手，没有卡顿。

## 17. 交给 Codex 的执行指令

把本文件以 SPEC.md 的名字放进一个空文件夹（或新仓库）的根目录，然后把下面这段话发给 Codex：

```
请完整阅读仓库根目录的 SPEC.md，并一次性实现其中描述的全部功能，不要分阶段，也不要中途向我提问。
要求：
1. 严格遵守 SPEC.md 的技术选型：TypeScript + Vite，零运行时依赖，不使用任何前端框架。
2. SPEC.md 中给出的配色、字体、语录、默认值、动画时长等数据，原样使用。
3. 未写明的细节，按“简单、免费、美观、省资源”的原则自行决定，并在 README.md 末尾的“实现说明”中列出你做的决定。
4. 完成后运行 npm run build 和 npm test，直到全部通过，且体积不超过第 13 节的预算。
5. 如果某个 npm 包名不存在或无法安装，换用同一字体或同等功能的免费替代品，并在实现说明中写明。
6. 按第 16.1 节完成自测，写好 README.md。
7. 用 git 提交全部代码；如果已经配置了 GitHub 远程仓库，就推送到 main 分支。
```

## 18. 参考资料

- PWA 中 Screen Wake Lock 的支持情况（iOS 18.4 修复）：https://progressier.com/pwa-capabilities/screen-wake-lock
- WebKit 缺陷 254545（主屏幕应用中 Wake Lock 失效）：https://bugs.webkit.org/show_bug.cgi?id=254545
- 主屏幕应用不受 Safari 7 天存储上限影响：https://www.osnews.com/?p=131566
- CSS linear() 缓动的浏览器支持（Safari 17.2）：https://developer.chrome.com/docs/css-ui/css-linear-easing-function
- iOS Safari 中 switch 开关的触感反馈：https://azukiazusa.dev/en/blog/ios-safari-web-haptics
- DSEG 字体与许可证：https://github.com/keshikan/DSEG
- Everforest 配色：https://github.com/sainnhe/everforest
- Kanagawa 配色：https://github.com/rebelot/kanagawa.nvim
- Catppuccin 配色：https://github.com/catppuccin/catppuccin
- Rosé Pine 配色：https://rosepinetheme.com
- SynthWave '84 配色：https://robbowen.digital/wrote-about/synthwave-84/
- 中国传统色数据集：https://github.com/zerosoul/chinese-colors
