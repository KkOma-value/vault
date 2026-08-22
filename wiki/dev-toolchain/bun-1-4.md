# Bun 1.4 发布

<!--
source_raw_files:
  - raw/Bun 1.4.md
domain: dev-toolchain
created: 2026-08-21
updated: 2026-08-21
tags: bun, runtime, rust-rewrite, node-compat, webview, image, cron, parallel
related:
  - wiki/ai-tools/kitesurf.md
-->

## 摘要

Bun 1.4 是自 1.0 以来最大更新：底层从 Zig 重写为 Rust，Node.js 兼容性新增 1517 项测试通过（总计 3743），新增多个内置 API（WebView、Image、markdown、cron、Terminal），支持并行测试/运行，全局虚拟存储使安装提速至 7 倍。

---

## 要点

- Zig → Rust 重写：提升可维护性与社区贡献门槛，性能收益体现为 idle CPU 降 5×、内存降 35%、Linux 启动快 50%。
- Node.js 26.3.0 兼容：node:http/fs/cluster/quic/stream 等模块 97-100% 通过率。
- `Bun.WebView`：内置无头浏览器自动化，无需 Puppeteer/Playwright 依赖。
- `Bun.Image`：原生图像处理（resize/crop/format）。
- `Bun.cron()`：声明式定时任务，进程内调度。
- `bun run --parallel` / `bun test --parallel`：多脚本/多测试文件并行执行。
- 全局虚拟存储（opt-in）：跨项目共享已下载包，最高 7× 安装加速。
- `bun audit fix` / `bun dedupe` / `bun prune`：包管理安全与清理工具。

---

## 详细内容

### 语言重写：Zig → Rust

Bun 团队将核心从 Zig 迁移到 Rust，目的是降低贡献门槛（Rust 社区和工具链更成熟）并获得更好的编译期安全保证。重写后实测性能改善：空闲 CPU 占用降低 5 倍，内存降低最多 35%，Linux 启动快 50%。

### 新 API 一览

| API | 用途 |
|-----|------|
| `Bun.WebView` | 内置浏览器自动化，替代 Puppeteer 场景 |
| `Bun.Image` | 服务端图像处理 |
| `Bun.markdown` | Markdown → HTML 编译 |
| `Bun.cron()` | 进程内 cron 定时器 |
| `Bun.Terminal` | 终端 UI 原语 |

### 并行执行

`bun run --parallel` 允许同时跑多个 npm scripts；`bun test --parallel` 跨测试文件并行化。适合 CI 场景缩短反馈时间。

### 全局虚拟存储

类似 pnpm 的 content-addressable store，opt-in 启用后跨项目共享包文件，避免重复下载与磁盘占用。官方测试最高 7× 安装提速。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Bun 1.4\|Bun 1.4]] | raw/ | 官方博客 2026-08-20 |
