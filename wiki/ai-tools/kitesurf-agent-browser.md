# Kitesurf：为 AI Agent 设计的无状态浏览器

<!--
内容元数据:
source_raw_files:
  - raw/Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md
domain: ai-tools
created: 2026-08-07
updated: 2026-08-07
tags: kitesurf, cloudflare, agent-browser, browser-run, cdp, puppeteer, playwright, mcp, v8, wasm, stateless
related:
  - wiki/ai-automation/_index.md
-->

## 摘要

Kitesurf 是 Cloudflare 专为 AI Agent 构建的浏览器，完全运行在 Workers（V8 isolates）之上。相比 Chromium，CPU/内存开销低 3–7×，无状态、按需启动、会话隔离，适合 Agent 突发式网页抓取、截图、HTML 提取等任务。兼容 CDP 协议，Puppeteer/Playwright/MCP 客户端可直接接入。

---

## 要点

- **定位**：Agent-first 浏览器，砍掉人类不需要的功能（标签页、扩展、同步），专注 token 效率、上下文窗口、可扩展性和成本。
- **架构**：三大组件——Engine（CDP 入口 + 会话状态）、PageScript（Dynamic Workers 隔离运行 JS/DOM）、PageRenderer（Rust/Wasm 光栅化）。组件间通过 Workers RPC 通信。
- **性能对比 Chromium**：截图 CPU 3.1× 少、内存 4.7× 少；HTML 提取 CPU 3.8× 少、内存 7× 少。Wall time 约 1.7× 慢（无 JIT 热缓存）。
- **隔离模型**：每次页面加载视为不信任输入，每个会话从零开始；网络访问统一经 SandboxOutbound 代理。
- **兼容性**：已通过 215,000+ WPT 测试；CSS/DOM/HTML/SVG/XHR 覆盖良好；不支持 WebGL、视频播放、TLS 指纹协商。
- **接入方式**：Browser Run API 加 `browser=kitesurf` 参数；支持 Quick Actions（截图/PDF/内容提取）和 CDP WebSocket 长连接。
- **Beta 免费**，有 per-account 限制；计划开源。

---

## 详细内容

### 为什么要造新浏览器

Chromium 为人类设计，单实例占 270+ MiB 内存，给每个 Agent 分配一个实例成本过高。Agent 只需要结构化内容提取和截图，不需要 60fps 滚动和像素完美渲染。威胁模型也不同——prompt injection 和 tool safety 优先于传统 web 安全。

### 核心架构
| 组件 | 职责 | 状态 | 技术栈 |
|------|------|------|--------|
| Engine | CDP/REST 入口、会话管理 | 有状态（Durable Objects） | Workers |
| PageScript | HTML 解析 + JS 执行 + DOM | 无状态（Dynamic Workers） | Blitz/Stylo (Rust→Wasm) + V8 |
| PageRenderer | 光栅化为 PNG/JPEG/PDF | 无状态 | blitz-paint + Parley (Rust→Wasm) |
| SandboxOutbound | 唯一网络出口、CORS/Cookie 隔离 | 无状态 | Workers |

eval() 通过嵌入 Boa JS（Rust ECMAScript 引擎编译为 Wasm）实现，待 Workers 原生 eval 支持后迁移。

### Agent 接入配置

MCP 客户端（如 Opencode）配置示例：

```json
{
  "mcp": {
    "kitesurf": {
      "type": "local",
      "command": [
        "npx", "-y", "chrome-devtools-mcp@latest",
        "--wsEndpoint=wss://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/browser-run/devtools/browser?browser=kitesurf",
        "--wsHeaders={\"Authorization\":\"Bearer <API_TOKEN>\"}"
      ]
    }
  }
}
```

Quick Action 截图：

```bash
curl -X POST 'https://api.cloudflare.com/client/v4/accounts/<accountId>/browser-run/screenshot?browser=kitesurf' \
  -H 'Authorization: Bearer <apiToken>' \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com"}' \
  --output "screenshot.png"
```

### 适用场景 vs 不适用

| 适用 | 不适用 |
|------|--------|
| 网页截图/PDF 生成 | 视频播放 |
| HTML/结构化内容提取 | WebGL |
| 一次性 Agent 浏览任务 | 需要 TLS 指纹的反 bot 页面 |
| 大规模并发短生命周期会话 | 长时间有状态认证会话 |

### 设计原则

1. **无状态优先**：组件崩溃只需重启重放，无需重建状态。
2. **隔离即安全**：每个页面 = 独立 isolate，网络由单一出口代理。
3. **Rust + Wasm**：直接编译到 wasm-bindgen，避免 Emscripten 臃肿。
4. **优雅降级**：任何故障降级为空白帧或缺失元素，不会终止会话。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md\|Introducing Kitesurf]] | raw/ | Cloudflare 官方博客 2026-08-06 发布 |
