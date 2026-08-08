# Codex Security：Vibe Coding 安全扫描神器

<!--
source_raw_files:
  - raw/OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。.md
domain: ai-security
created: 2026-08-06
updated: 2026-08-06
tags: codex-security, openai, vibe-coding, 漏洞扫描, 安全审查, aardvark, openrouter
related:
  - wiki/claude-code/loops.md
-->

## 摘要

OpenAI 开源的 Codex Security（前身 Aardvark）是一个 Agentic Security Researcher，能自动阅读代码、寻找漏洞、验证风险并生成修复方案。开源后可在 Claude Code、Kimi Code 等任何 Agent 中使用，并支持通过 OpenRouter/Fireworks 接入第三方模型降低成本。

---

## 要点

- **演进路线**: Aardvark (2025-10) → Codex Security 研究预览版 (2026-03-06) → 深度扫描+攻击路径追踪 (2026-06-22) → 开源+OpenRouter/Fireworks 支持 (2026-08)
- **核心能力**: 深度扫描、攻击路径追踪、威胁模型构建、漏洞验证、补丁生成
- **不是银弹**: 只扫代码仓库内的问题，CDN/WAF/DDoS/后端基础设施不在扫描范围
- **结果有波动**: 基于模型推理的探索路径每次不同，中低风险漏洞单次可能遗漏，建议双模型交叉扫描

---

## 详细内容

### 安装与认证

GitHub: https://github.com/openai/codex-security

三种认证方式：
1. Codex 账号登录（用 Codex 额度）
2. OpenAI API Key
3. OpenRouter 接入（可调用第三方模型）

### 模型选择策略

| 场景 | 推荐模型 | 特点 |
|------|----------|------|
| 深度审查（大版本上线前） | gpt-5.6-sol (xhigh) | 最强但最贵，~$55/次 |
| 高质量扫描 | Kimi K3 / Qwen3.8-Max | 效果好，成本适中 |
| 高频日常扫描 | GPT-5.6 Luna / DeepSeek V4 Flash | 便宜，能挑出大问题 |

### 实战案例发现的典型漏洞类型

- **高风险**: 权限逻辑短路（查询了授权但未使用结果，SSO 通过即放行）
- **中风险**: CSV 注入（导出内容被 Excel 识别为公式）、API 频率限制缺失（可烧掉额度）
- **低风险**: 报错信息泄露内部路径、文件上传检查顺序不当

### 最佳实践

1. 定期扫描 + 大版本上线前深度扫描
2. 双模型交叉验证（大漏洞稳定复现，中低风险需交叉覆盖）
3. 扫描完让工具直接修复，再重新扫描验证
4. 代码安全 ≠ 系统安全，DDoS/CDN/WAF 需额外处理
5. OpenRouter BYOK 可用自己的 API Key 直连模型厂商，超 100 万次请求/月后收 5% 平台费

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。.md|OpenAI Codex Security]] | raw/ | @Khazix0918 实测分享，含完整安装+使用+模型选择流程 |
