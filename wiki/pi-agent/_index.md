# Pi 代理框架

最后更新: 2026-07-09

---
<!--
领域元数据:
domain: pi-agent
created: 2026-07-09
updated: 2026-07-09
tags: pi, agent-framework, 扩展系统, sdk, coding-agent
summary: Pi 编码代理框架的原理、扩展系统与 SDK 用法。
-->

## 概览

Pi 是一个高度精简、可扩展的编码代理（coding agent）框架，是 OpenClaw 的最初引擎。默认只带 bash / read / write / edit 四个工具，其余能力全部通过 TypeScript 扩展添加；除 CLI 外还提供一组可构建真实 AI 应用的 SDK 包。

---

## 内容

| 文件 | 标题 | 标签 | 更新日期 | 摘要 |
|------|------|------|----------|------|
| [[pi-extensions-and-sdk\|扩展系统与 SDK]] | Pi 代理框架：扩展系统与 SDK | pi, 扩展系统, sdk, typescript | 2026-07-09 | Pi 默认极简，靠扩展添加一切能力；三个对象暴露挂钩点，SDK 可把代理坍缩成一次函数调用。 |

---

## 来源文件

| 原始文件 | SHA-256 | 对应知识文件 | 处理日期 | 备注 |
|----------|---------|-------------|----------|------|
| [[raw/Pi 代理 101 - 如何扩展和构建自己的线束\|Pi 代理 101]] | 6d678283e3e0 | [[pi-extensions-and-sdk]] | 2026-07-09 | x.com 剪藏，作者 @jasonzhou1993 |

---

## 相关领域

| 领域 | 关系 | 相关度 |
|------|------|--------|
| [[claude-code/_index\|Claude Code]] | 同为编码代理/框架，扩展与 SDK 概念可对照 | 中 |
