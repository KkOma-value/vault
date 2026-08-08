# AI 工具集成 / AI Tools

最后更新: 2026-08-07

---
<!--
领域元数据:
domain: ai-tools
created: 2026-08-06
updated: 2026-08-06
tags: ai-tools, agent-skills, api, mcp, rss, 工具集成
summary: AI Agent 工具/插件/Skill 的接入方法与公开 API 集成指南。
-->

## 概览

各种 AI Agent 工具（Claude Code、Codex、Gemini CLI 等）支持通过 Skill/Plugin/MCP 扩展能力。本领域收录具体工具和服务的接入方法、API 用法和最佳实践。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[aihot-agent-skill\|AI HOT Agent 接入]] | AI HOT：Agent Skill 与 API 接入 | aihot, agent-skill, rss, api | 2026-08-06 | 把 AI HOT 中文 AI 资讯接进支持 Agent Skills 的工具 |
| [[kitesurf-agent-browser\|Kitesurf Agent 浏览器]] | Kitesurf：为 AI Agent 设计的无状态浏览器 | kitesurf, cloudflare, agent-browser, cdp, mcp, wasm | 2026-08-07 | Cloudflare 专为 Agent 构建的轻量浏览器，运行在 Workers 上，兼容 CDP/MCP |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/Agent 接入.md\|Agent 接入]] | fb88100b14f7 | [[aihot-agent-skill]] | 2026-08-06 | |
| [[raw/Introducing Kitesurf The agent-first browser that runs in V8 isolates on Cloudflare Workers.md\|Introducing Kitesurf]] | 9590a142fb4a | [[kitesurf-agent-browser]] | 2026-08-07 | Cloudflare 官方博客 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[claude-code/_index\|Claude Code]] | Agent Skill 主要运行环境 | 高 |
| [[ai-security/_index\|AI 安全工具]] | 安全插件也是 Agent 工具 | 中 |
