# 桌面时钟 · Desk Clock

面向 iPhone 的全屏离线桌面时钟。TypeScript + Vite、原生 DOM 与手写 CSS，无前端框架、零运行时依赖。包含 6 种时钟、6 种独立动画、16 套日夜主题、12 款裁剪字体、36 条中英双语语录、10 个即时预览设置标签。默认中文、纯粹主题、翻页卡片、翻页动画、24 小时制、显示秒、跟随系统外观。支持 Battery Status API 的浏览器还会在日期右侧显示电量图标。

**本次自测：正式构建通过，80 项 Vitest 测试通过，4 项资源预算通过。** 电量组件、字体和设置合并单元测试已通过。用户提供的审计报告中 3 个漏洞节点均属于 Vitest 测试工具链，生产模块检查确认不进入 dist；开发工具风险仍保留，详见文末实现说明。按要求未使用浏览器，也未执行 Git 提交。详细记录见 [自测记录](docs/self-test.md)。

## 本地运行

需要 Node.js 22.12+（或 24+）和可访问 npm 的网络。

```sh
npm install
npm run assets
npm run dev
```

用浏览器打开终端显示的地址。开发模式不安装 Service Worker；离线与更新流程应在生产预览或 HTTPS 部署站点检查。

```sh
npm test
npm run build
npm run preview
```

`npm run build` 依次裁剪字体、生成图标、执行 TypeScript 检查、构建 PWA，并打印和硬性检查 JS gzip ≤ 50 KB、CSS gzip ≤ 15 KB、字体合计 ≤ 150 KB、整个 dist ≤ 400 KB。预算按 1 KB = 1024 字节计算，整个 dist 的检查比仅统计预缓存更加保守；输出 `artifacts-budget.json`。字体、图标和许可证由脚本从免费 npm 包生成，不需要设计素材或联网字体 CDN。

WebKit 自测（安装浏览器需网络）：

```sh
npx playwright install webkit
npm run build
npm run test:browser
```

脚本输出 6 × 16 × 2 × 2 = 384 张时钟/主题/日夜/横竖屏截图至 `artifacts/screenshots/`，检查页面宽度、时钟边界、主界面节点数量，并检查语言切换、显示开关、主题/颜色/字体、语录添加编辑删除、设置持久化、30 种数字时钟/动画组合及离线重载。截图需要人工复核。可用 `TEST_URL=https://你的站点/ npm run test:browser` 测试部署网站。

## 部署到 GitHub Pages

1. 在 GitHub 新建空仓库（例如 `desk-clock`）。
2. 将本目录初始化为 Git 仓库，添加 GitHub 远程，并推送 `main`。本项目已由用户完成首次提交；后续修改可在项目终端提交，下面的初始化命令仅供新项目部署参考。
3. 在仓库 Settings → Pages，将 Source 设为 **GitHub Actions**。
4. Actions 安装依赖、运行 Vitest、构建并检查预算，然后发布静态站点。
5. 等待成功后打开 `https://用户名.github.io/仓库名/`。

```sh
# 若已有常规 Git 仓库，只需配置远程并推送。
git init -b main
git add .
git commit -m "Implement Desk Clock PWA"
git remote add origin https://github.com/你的用户名/desk-clock.git
git push -u origin main
```

工作流按仓库名自动设置 `BASE_PATH`；`用户名.github.io` 仓库使用 `/`，其他仓库使用 `/仓库名/`。本地默认相对路径 `./`。部署到其他子目录可用 `BASE_PATH=/clock/ npm run build`。备选：将 dist 上传到 Cloudflare Pages，免费 HTTPS 即可使用。

已采用本项目现有 `package-lock.json`，CI 使用 `npm ci` 固定依赖版本，随后测试、构建并检查预算。

## iPhone 安装与使用

推荐 iOS 18.4+（含 iOS 26）。iOS 16.4–18.3 可运行，屏幕常亮可能失效；应用会提示把「设置 → 显示与亮度 → 自动锁定」设为「永不」。低于 iOS 16.4 显示不支持提示。

1. 用 Safari 打开部署的 HTTPS 网址。
2. 点「分享 → 添加到主屏幕 → 添加」。
3. 从主屏幕图标打开，手机横放。竖屏时数字分组上下排列。

左上角临时切换日/夜，右上角打开设置，右下角直接打开主题页。按钮无操作 4 秒隐藏，轻点屏幕唤回。设置底部面板支持拖动顶部横条关闭、Escape 关闭及键盘 Tab / 左右键导航。更换主题会清除日夜自定义颜色并采用推荐字体，保留时钟类型和动画。

「显示」页有「显示电量」（默认开）与「显示电量百分比」（默认关）。支持 `navigator.getBattery()` 的浏览器在日期右侧显示小电池，填充跟随电量，充电显示闪电，低于 20% 且未充电时填充为红色。iPhone Safari 不支持此接口，整个组件不出现且不占位，系统状态栏照常显示自己的电量。开关仍可保存供支持该接口的设备使用。

睡眠模式默认关闭；开启后默认 23:00–07:00、3 秒调暗至 70%，可选夜视红，隐藏秒和语录并使用淡入淡出。睡眠时轻点可恢复正常显示 10 秒。日间/夜间自定义颜色各自保存。

全部设置和自定义语录只保存在本机 `deskclock:v1`，300 ms 防抖写入，容量不超过 8 KB。恢复默认会重置此应用设置。没有账号、统计脚本、网络校时、服务器数据存储或付费功能。首次在线加载完成后字体和代码会离线缓存；出现新版本时点提示更新。

## 调试参数

| 参数 | 功能 |
| --- | --- |
| `?speed=60` | 按 60 倍速度走时；范围 1–3600 |
| `?t=23:59:50` | 从本机日期的指定本地时间开始，用于跨午夜测试 |
| `?fps=1` | 左下角实时 FPS；仅调试时使用逐帧采样 |
| `?reset=1` | 恢复应用默认设置 |

可组合：`?speed=60&t=23:59:50&fps=1`。除调试起始时间/速度外，时间完全来自系统 Date.now()。手动时区使用 Intl 格式化，城市显示在日期末尾；系统时区变化在下一次刷新生效。

## 自测与 iPhone 验收

新增电量测试覆盖接口不支持时零渲染、读取失败降级、15%／50%／100% 的 SVG 填充、充电闪电、20% 阈值、事件更新、开关、双语标签和旧设置合并。Vitest 同时覆盖整秒/整分钟对齐、完整中英文日期、Europe/Dublin 2026-10-25 夏令时回拨、12/24 小时制、跨午夜、32 套配色两项对比度、默认值深度合并与 v0→v1 迁移、异常数据、存储上限、36 条双语语录、OKLCH 生成色域、外观覆盖与睡眠窗口。

本次只使用本项目 `node_modules`：`npm run build` 完整通过（包含 TypeScript 检查、字体/图标生成、PWA 构建、预算检查）；`npm test` 的 3 个测试文件、80 项测试全部通过。字体测试还验证 12 款 WOFF2 能解码、具备 0–9 字形、仅保留规定字符，并核对 DSEG 许可证原文一致。没有运行项目外的工具、联网命令或浏览器。

最终体积见下表；具体字节数保存在 `artifacts-budget.json`。

| 项目 | 实测 | 预算 |
| --- | --- | --- |
| JavaScript（gzip，含 Service Worker） | 35.60 KB | 50 KB |
| CSS（gzip） | 4.99 KB | 15 KB |
| 12 款字体合计 | 33.04 KB | 150 KB |
| 全部 dist（含许可证、图标、SW） | 205.63 KB | 400 KB |

本轮用户明确要求不使用浏览器，所以跳过 SPEC 16.1 的 WebKit 截图与浏览器检查；不能声称页面布局、离线重载或真机交互已经实测通过。堆内存约 10 MB、空闲 CPU 和真实 iPhone 的 60/120 Hz 流畅度仍需设备验证。

交付后在 iPhone 按 SPEC.md 第 16.2 节逐项验收：

- 主屏幕打开全屏，默认纯粹 + 翻页卡片 + 翻页动画 + 秒；日期星期正确，与 time.is 误差 < 0.5 秒。
- 放置 10 分钟不熄屏；横竖屏与安全区正常。
- `?speed=60` 检查所有 6 种时钟、6 种动画，无闪烁。
- 16 个主题、日夜 1.2 秒颜色过渡、分模式自定义颜色、对比度和推荐色正常。
- 12 款字体正常；显示开关、12 小时制、手动时区正确。支持电量接口时，电池填充、充电闪电、低电量红色与百分比开关正常；Safari 无应用电量占位，竖屏顶部避开系统状态栏。
- 语录轮换、添加、编辑、删除及中英文切换正常。
- 睡眠模式调暗、红色夜视、轻点 10 秒恢复正常。
- 飞行模式重开仍可用；完全关闭重开设置仍在。
- 面板拖动跟手，速度/距离决定关闭或回弹；新版本提示可刷新更新。

## 字体与配色致谢

12 款字体均依 SPEC 使用 SIL Open Font License 1.1：DSEG7 Classic、Bebas Neue、Big Shoulders Display、Orbitron、Share Tech Mono、VT323、Press Start 2P、Major Mono Display、Monoton、Chakra Petch、Jost、DM Serif Display。字体来自 [DSEG](https://github.com/keshikan/DSEG) npm 包与 [Fontsource](https://fontsource.org/)，构建脚本保留许可证到 `public/licenses/`，部署时同样缓存。

配色原样取自 SPEC.md：iOS 系统灰阶、包豪斯/瑞士设计、辉光管氖光、机械机场翻牌、[Nord](https://www.nordtheme.com/)、CRT 磷光绿、[SynthWave ’84](https://github.com/robb0wen/synthwave-vscode)、青/洋红霓虹、[Everforest](https://github.com/sainnhe/everforest)、[Solarized](https://ethanschoonover.com/solarized/)、[Catppuccin](https://github.com/catppuccin/catppuccin)、莫兰迪、[中国传统色](https://github.com/zerosoul/chinese-colors)、[Kanagawa](https://github.com/rebelot/kanagawa.nvim)、电子阅读器纸色、[Rosé Pine](https://rosepinetheme.com/)。开源配色按原项目 MIT 授权使用。应用「关于」中保留致谢链接。

36 条预设语录及出处原样取自 SPEC.md；作者/原作已进入公有领域，译文按规格为项目自译或公有领域简短译法。

PWA 的 prompt 更新和资产生成依据 [Vite PWA 官方文档](https://vite-pwa-org.netlify.app/guide/register-service-worker) 与 [图标生成 CLI 文档](https://vite-pwa-org.netlify.app/assets-generator/cli)。

## 实现说明

未明确之处按简单、免费、美观、省资源决定如下：

- 时间、定时外观和睡眠以系统本地时间驱动；显示时区只影响时间/日期和每日语录。调试参数模拟整个时间源，不联网校时。
- 临时日夜切换不写入持久设置；系统外观变化或定时日/夜边界会清除临时覆盖。颜色页「正在编辑」选择同样属于临时预览。
- 跨午夜定时采用含开始、不含结束的区间；开始和结束相同视为全天。0 秒被关闭或睡眠隐藏后使用整分钟刷新；指针扫秒由 Web Animations 驱动，不用生产环境常驻 requestAnimationFrame。
- 轮换语录按系统时间的 N 分钟区块确定，每日语录按选定时区的日期确定；固定语录增加 `quote.fixed` 索引。空的「仅自定义」来源显示空白。更换语言不改变自定义文本。
- 预设语录只显示原句，不额外显示出处，以保留两行上限；出处仍随数据交付。轮换采用 150 ms 淡出 + 150 ms 淡入。
- 单条自定义语录按 Unicode 字符计数限制 120；最多 40 条且总设置不超过 8 KB，超限时显示提示。旧设置读取时清理异常值、截断文本并限制存储体积。
- 安装引导的关闭状态增加 `installDismissed` 字段，仍使用唯一的设置键；无网络/存储不可用时保留内存设置。未知的未来设置版本恢复默认，版本 0 或无版本的同结构数据迁移到版本 1。
- 只有数码管固定 DSEG7；点阵采用写死的 5×7 字形和两条 SVG 路径，避免 210 个圆点节点的额外开销。辉光管使用 10 个低透明度阴极、CSS 玻璃和代码 SVG 蜂窝网纹。
- 翻页动画仅变换包裹半片的外层，圆角裁切在其子元素；动画结束释放 will-change。像素/粒子只在动画期间逐帧绘制，Canvas 动画结束置零并移除。后台停止计时和动画，前台直接同步当前时间。
- 纸纹用固定种子的 64×64 Canvas 一次生成，4% 平铺，随后释放 Canvas；图标为手写 SVG，通过规定的 assets-generator 生成 PNG。
- 秒关闭后数字放大；竖屏按屏幕短边和 svh 限制卡片高度，以容纳 SE 屏幕。主界面 DOM 预算不包含首次打开后才创建的设置面板；面板模块也延迟导入。
- 缓动使用 CSS linear() 特性检测与 cubic-bezier 降级；色板在构建前按规定 OKLCH 数值生成并写死十六进制，屏幕显示不依赖 oklch() 支持。
- 不在后台补播动画；Wake Lock 请求有并发保护，启动、前台、轻点时重试，失败提示只显示一次。无接口时降级提示设置自动锁定。
- 设置面板采用非模态 dialog，支持顶部指针拖动、回弹及键盘焦点导航；主界面不显示额外的产品说明，只有安装、版本更新、必要的降级提示。
- `fps=1` 明确开启调试逐帧采样，隐藏页面时停止；普通模式两次刷新之间没有 JS 循环。
- 本轮使用用户已经安装在本项目的依赖，没有替换任何规定字体或 npm 包。dseg 的实际许可证是 `node_modules/dseg/DSEG-LICENSE.txt`；脚本支持带包名前缀的许可证文件名，并在写出字体前校验字体与许可证输入。
- 首次 Git 提交已由用户完成。本轮遵照要求只修改文件，不执行 Git 提交或推送，不使用项目外的仓库、文件或工具。

- 修复固定日间/夜间模式下颜色页临时预览被普通设置变更清除的问题：只有修改外观模式或下一次自动切换才清除预览。读取设置时校验主题和字体标识，避免超长异常值使容量清理无法结束。
- 漏洞审计（用户提供的 `audit-report.json`）：`@vitest/mocker@3.2.7` 为 moderate（[GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9)，路径穿越 / 任意文件读取）；`tinypool@1.1.1` 为 critical（[GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3)、[GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)，原型污染可导致执行代码）；`vitest@3.2.7` 的 critical 为测试依赖风险传播。三者仅用于 Node/Vitest 测试，不进入客户端或离线 dist。构建插件从 Rollup 实际模块清单核对排除这三个包，输出 `artifacts/bundle-modules.json`；本次清单唯一的 npm 浏览器辅助包为 `workbox-window`，Service Worker 由 Workbox 生成，不引用测试工具链。
- 上述漏洞仍影响开发 / 测试环境，不能写成“已修复”。报告提供的修复是升级 `vitest` 到 5.0.4，标记为 `isSemVerMajor: true`，没有提供当前 3.x 主版本内的修复方案。本轮按用户允许的“仅开发工具、未进入 dist”处理，保留锁定版本并记录风险；不跨主版本强行覆盖 `@vitest/mocker` / `tinypool`，未使用 `npm audit fix --force`，也未联网安装。若以后决定升级测试工具，应由用户联网安装，再验证 Node版本、测试API、全部测试和构建兼容性。
- 电量使用内联 SVG（28×14），内部有效填充宽度 18 个 SVG 单位；15% / 50% / 100% 对应 2.7 / 9 / 18。严格低于 20% 且未充电时填充为 `#FF453A`；充电时保持实际填充比例、显示闪电并使用主题辅助文字色。
- 电量读取成功前不创建组件；接口不存在、不可调用或拒绝/抛错时安静省略。只监听 `levelchange` / `chargingchange`，不轮询；同一状态不重复写DOM。默认开启显示电量、关闭百分比；新增字段在版本1旧设置中深度合并，不覆盖已有开关值。电量关闭时移除图标和百分比；关闭所有日期项时，支持接口且电量开启的设备保留仅电量的一行。
- 竖屏顶部使用 `max(65px, env(safe-area-inset-top) + 16px)`，避开系统状态栏。Safari不支持电量API时完全不显示应用电量组件，保留系统状态栏的正常显示。电量位于主内容和睡眠遮罩下，颜色继承平滑过渡的辅助文字变量。
