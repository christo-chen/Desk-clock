# 交付自测记录

执行日期：2026-10-14。本轮只使用项目内依赖与文件，无联网、无浏览器、无项目外工具。

| 检查 | 实际结果 |
| --- | --- |
| 中断后文件完整性 | src / scripts / tests / docs / .github 无空文件；4 个 JavaScript 脚本语法通过；上次残留的单个 dseg 字体已被完整构建刷新为12款 |
| DSEG 许可证修复 | 实际位置为 node_modules/dseg/DSEG-LICENSE.txt；脚本已支持带前缀的许可证名，并先校验输入再写字体产物 |
| npm run build | 通过：12款字体裁剪、图标生成、TypeScript检查、Vite构建、generateSW及资源预算检查全部完成 |
| npm test | 通过：2个测试文件、68项测试、0失败 |
| 16.1规定的核心单测 | 整秒对齐、中英文日期、Dublin夏令时回拨、12/24小时、32套配色两项3:1对比度、设置默认合并/迁移、36条双语语录、OKLCH色域全部通过 |
| 字体有效性和授权 | 12款 WOFF2 可解码、包含全部数字且仅保留规定字符；每款许可证有效；DSEG许可证与包内原文逐字节一致 |
| 设置容量与异常值 | 8 KB容量、120字符语录、异常超长主题/字体清理均通过单测 |
| WebKit截图 / 浏览器UI / 离线重载 | 按本轮用户明确要求不使用浏览器而跳过；384张截图与交互验证脚本保留供以后运行，未声称通过 |
| 堆内存 / CPU / 真机流畅度 | 未实测，需要iPhone按README清单验收 |
| npm audit | 仅运行offline审计；项目内新缓存无公告，0项输出不可信。用户所述3项漏洞待联网报告，不声称已修复或仅影响开发工具 |
| git init -b main | 仍失败：根目录 .git: Operation not permitted；未修改项目外Git仓库，未提交 |
| GitHub远程 / 推送 | 原目录没有Git仓库和已配置远程；禁止联网，未推送 |

## 最终构建体积

预算按1 KB=1024字节，JS含所有构建JS和Service Worker的gzip合计。离线预算用整个dist文件夹的原始体积检查，比仅预缓存更保守。

| 项目 | 实测字节 | 实测KB | 上限KB |
| --- | --- | --- | --- |
| JS gzip | 35336 | 34.51 | 50 |
| CSS gzip | 5004 | 4.89 | 15 |
| 字体 | 33828 | 33.04 | 150 |
| 整个dist | 206140 | 201.31 | 400 |

具体构建体积同根目录 `artifacts-budget.json`。54项核心测试加14项字体产物测试共68项。生成的字体、PNG图标和许可证均在项目内，不需额外设计素材或字体替代。

## 本轮修复

- 许可证识别不再遗漏 DSEG-LICENSE.txt；缺少许可证时不会先写出该字体。
- 修复固定外观模式下，普通设置修改会错误清除日夜颜色预览的问题。
- 设置迁移先校验主题/字体标识，防止超长异常值导致容量清理死循环；新增回归用例。
- 使用用户已有package-lock.json；GitHub Actions安装方式改为npm ci。
- README删去上一轮“正式构建未验证”的过期说明，记录实际结果与未执行项。

## 本地依赖版本

- typescript: 5.9.3
- vite: 7.3.7
- vitest: 3.2.7
- vite-plugin-pwa: 1.3.0
- subset-font: 2.9.0
- @vite-pwa/assets-generator: 1.0.4

## 尚需用户操作

准确的npm审计必须联网，而本轮禁止联网。请在本项目终端运行：

```sh
npm audit --json > audit-report.json
```

发现漏洞时npm可能返回非零退出码，JSON文件仍会产生。获得包名、公告、依赖路径及修复版本后，才能判断是否进入最终产物和选择兼容升级；未使用 `npm audit fix --force`。

Git元数据写入目前被环境拒绝。请在允许写入本项目.git的终端完成源码提交：

```sh
git init -b main
git add .
git commit -m "Implement Desk Clock PWA and verify resource budgets"
```

npm审计日志/缓存、审计报告、node_modules及dist已排除在Git跟踪之外；源码、package-lock、生成字体/图标/许可证和预算记录应一并提交。没有生成或读取项目外的临时仓库或bundle。
