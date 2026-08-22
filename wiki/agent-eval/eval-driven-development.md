# Eval 驱动开发

<!--
source_raw_files:
  - raw/Eval-driven development.md
domain: agent-eval
created: 2026-08-21
updated: 2026-08-21
tags: eval, eval-driven-development, agent-skills, firebase, llm-as-judge, 基线, hill-climb, mcp
related:
  - wiki/claude-code/agent-loops.md
  - wiki/code-migration/code-migration-methodology.md
-->

## 摘要

Firebase 团队提出 eval-driven development：先定义 eval（自动化评测），再写 agent skill，用"基线→加 skill→跑分→迭代"循环量化改进。三类 eval 覆盖单 skill 功能、激活准确性、端到端多 skill 协作。实测 skill 使通过率从 31.7% → 78%，input tokens 降 40%。

---

## 要点

- Agent 三件套：CLI（执行）、MCP server（工具定义）、Skill（编排指挥），三者协同才有效。
- Skill ≠ 文档：文档是全面参考，skill 是高聚焦、outcome-driven 的 cheat sheet，填补模型训练截止日期的知识盲区。
- 三类 eval 设计：
  1. **单 skill eval**：给 agent 一个 skill，5-10 case 验证核心 CUJ。
  2. **Skill 激活 eval**：正/负样本验证 skill 是否在该触发时被正确加载、不该触发时不误激活。
  3. **E2E 多 skill eval**：全部 skill 装载，要求 agent 完成一个真实多产品应用（含部署），连接真实 Firebase 项目。
- 迭代循环（hill climb）：
  1. 先写 eval 定义期望结果。
  2. 无 skill 跑基线。
  3. 写 skill 补齐 agent 失败点。
  4. 重跑 eval，分数涨就保留，循环直到稳定通过。
- 量化结果：

| 模式 | 通过率 | Avg Input Tokens | Avg Output Tokens | Avg Duration |
|------|--------|------------------|-------------------|--------------|
| 无 Skill | 31.7% | 285.1k | 9.5k | 144.3s |
| 有 Skill | 78.0% | 169.5k | 5.8k | 101.2s |

- Eval 反过来改进工具本身：agent 反复失败 = 底层 CLI/MCP 交互太复杂或有 bug，推动 help text 改进、非交互登录、消除阻塞 prompt。

---

## 详细内容

### Skill 在生态中的位置

```
Agent Skill（编排/指挥）
    ├── 调用 Firebase CLI（执行动作）
    ├── 调用 MCP Server（结构化工具定义）
    └── 调用 Knowledge MCP（读最新文档）
```

Skill 不替代文档，而是把"agent 容易踩坑的步骤"提炼为 procedural 指令，含 mandatory flags 和 gotcha 警告。

### Eval YAML 格式示例

```yaml
# 单 skill eval
prompt: "What command to check Firebase CLI version?"
expectations:
  - "Agent mentions `npx -y firebase-tools@latest --version`."
  - "Agent did not use `firebase --version`."

# 激活 eval
prompt: "How do I log in to my Firebase account using the CLI?"
expected_skills:
  - "firebase_basics"
```

### 关键洞察

input tokens 下降 40% 说明：好的 skill 让 agent 少走弯路（少搜索、少重试），而非只是"回答更准"。Eval 量化的不只是正确性，也是效率。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Eval-driven development\|Eval-driven development]] | raw/ | Firebase Blog 2026-08-11, Chag |
