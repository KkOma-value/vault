# 用 Claude Code 做大规模代码迁移

<!--
内容元数据:
source_raw_files:
  - raw/How Anthropic runs large-scale code migrations with Claude Code.md
domain: code-migration
created: 2026-07-24
updated: 2026-07-24
tags: code-migration, claude-code, 多agent, 对抗式审查, judge, loop, dynamic-workflows
related:
  - wiki/graph-engineering/graph-engineering-overview.md
  - wiki/claude-code/agent-loops.md
-->

## 摘要

代码迁移（把生产代码库移植到新语言）过去是多年工程。Anthropic 内部在一个月内用 Claude Fable 5、Opus 4.8 和 Dynamic Workflows 迁移了 10 个几万到几十万行的代码包。核心洞见是：**你不修代码，你修产出代码的流程（loop）**。方法论围绕一个可信的 judge（测试判据）展开，用"实现—审查—修复"多 agent 循环，让对抗式审查负责判断、机械化脚本负责验证。经济账也变了——最坏情况只是删掉分支重来，迁移不再需要"存亡级"理由。

---

## 要点

- **成本重构**：百万行迁移过去要 4 年、$3~4M；现在 Bun（Zig→Rust）两周产出百万行，消耗 59 亿非缓存输入 token + 6.9 亿输出 token，约 $16.5 万。最坏情况从"两套代码库并行数年"变成"删分支重来"。
- **为什么 AI 适合迁移**：工作天然并行（文件/crate 相互独立）；旧代码就是完整 spec；测试套件是内建裁判；编译/测试失败自动变成下一个队列项；规则违反变队列项而非静默偏差。
- **前置条件——先建 judge**：没有可信判据就没有退出条件。给测试分类（可外部调用 vs 依赖内部实现）、把外部测试改写成能同时跑原版和移植版的断言、用对抗 agent 确认改写没削弱断言、再用"故意改坏的代码"验证 judge 会失败。
- **两种迁移形态**：结构保持型（Jarred/Bun，rulebook 是类型/惯用法查找表）vs 重新设计型（Mike/Python→TS，rulebook 是设计文档）。
- **六步流程**：① 建规则手册+依赖图+缺口清单 → ② 压测规则 → ③ 全量翻译 → ④⑤⑥ 编译、运行、行为对齐。
- **模型分层**：大模型做审查者和"写规则给别的 agent 遵守"的角色；小模型（如 Sonnet）承担高并发的实现 fan-out。
- **五条最佳实践**：别盲从指南（先和 Claude 规划）；别盯单个失败（盯模式）；审查要对抗、验证要机械；别所有环节都用最大模型；把人的时间前置到规则手册和压测。

---

## 详细内容

### 核心哲学：修流程，不修代码

当审查者反复抓到同一类错误，修法不是逐文件手改，而是**给 rulebook 加一句话，然后重新生成受影响的那批文件**。代码永远不被"手工打补丁对齐规则"——rulebook 在翻译阶段持续生长，代码跟着 rulebook 重生成。

### 前置：构建并验证 judge

1. **给测试分类**：用 Claude 区分哪些测试可表达为外部调用、哪些依赖不会移植的内部实现。
2. **改写为可移植**：把外部测试转成能同时对原版和移植版运行的断言；用对抗 agent 验证改写没有弱化断言。
3. **验证 judge 本身**：先对原始代码跑一遍确认通过，再对**故意改坏的代码**跑一遍确认失败——抓不到 breakage 的 judge 不是 judge。

Mike 的做法略有不同：他把整个迁移端到端跑完，根据结果修订规则和工作流，再跑一遍，**每次丢弃产出，直到第三次才保留**。

### 六步流程

| 步骤 | 内容 | 关键决策 |
|------|------|----------|
| 1 规则手册+依赖图+缺口清单 | 顺序很重要：rulebook 先于 gap inventory，因为缺口正是 rulebook 默认值覆盖不到的部分 | 新代码是否沿用旧结构（决定 rulebook 是查找表还是设计文档） |
| 2 压测规则 | 一个 agent 按 rulebook 翻译 3 个文件，一个"像资深工程师"翻译同样 3 个，第三个用 diff 产出新规则；提前抓出会在全量 1448 文件放大的问题 | 只适用结构保持型；重设计型改为用对抗审查直接攻击设计文档 |
| 3 全量翻译 | 沿用"实现—审查—修复"多 agent 循环；工作队列机械化（脚本按磁盘上文件是否存在判断完成度，因此天然可断点续跑）；无法自信翻译的地方打 `// TODO(port): <reason>` | **编译器放哪**：Mike 每个循环内跑 TS 编译器（秒级）；Jarred 把编译器逐出循环、推迟到下一步（cargo 分钟级） |
| 4/5/6 编译、运行、行为对齐 | 共享同一循环架构，逐步减少人工判断。机械化真值来源：编译器错误列表、冒烟测试崩溃、双代码库行为 diff | 关键错误列表要人工过一遍抓系统性问题（如 Zig 惰性编译容忍的循环导入在 Rust 里炸出上千模块错误） |

### 对抗式审查与机械化验证

- 两个对抗审查者用**独立上下文**评估实现者的工作，分歧交第三个 agent 裁决。
- **build daemon** 是唯一被允许重建二进制的进程：fixer 写补丁，daemon 批量重建一次、重跑受影响测试、反馈结果——把最昂贵的操作串行化，而不是让多个 agent 各自触发。

### 没有测试套件怎么办

Mike 让 Claude 写小脚本对新旧代码库跑 7 个真实场景并 diff 结果，每个失败场景配一个 fix agent，循环到 7 个全过。然后再进一步：Claude 自己设计端到端测试套件、连跑四晚自主修复，抓出任何场景清单都预测不到的细节 bug。**缺测试套件不阻塞迁移——继承不到裁判就让 Claude 造一个，原始代码库始终是 ground truth。**

### 结果看 loop，不看代码

Bun 的 Rust 移植已上生产：约 4% 代码在 `unsafe` 块内（多是 C/C++ 边界的单行指针操作）；但 2000 次重复构建的内存从 6745 MB 降到 609 MB，二进制体积小 19%，HTTP 服务和真实负载快 2~5%。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/How Anthropic runs large-scale code migrations with Claude Code\|How Anthropic runs large-scale code migrations]] | raw/ | @ClaudeDevs 2026-07-22；案例：Jarred Sumner（Bun，Zig→Rust）、Mike Krieger（Python→16.5 万行 TS）；配套开源 code-migration-kit-with-claude-code |
