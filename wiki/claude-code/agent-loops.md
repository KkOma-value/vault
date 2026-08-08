# Claude Code 的循环（loops）入门：四类循环与何时使用

<!--
内容元数据:
source_raw_files:
  - raw/Getting started with loops.md
domain: claude-code
created: 2026-07-14
updated: 2026-07-14
tags: claude-code, loops, agent, /goal, /loop, /schedule, dynamic-workflows, skills, token
related:
  - wiki/claude-code/_index.md
  - wiki/claude-code/model-vs-effort.md
-->

## 摘要

Claude Code 团队把“循环”定义为**代理重复执行工作周期，直到满足某个停止条件**。循环按四个维度区分：如何被触发、如何被停止、用哪个 Claude Code 原语、适合什么类型的任务。文章给出四类循环——turn-based（回合制）、goal-based（目标驱动 `/goal`）、time-based（时间驱动 `/loop` 与 `/schedule`）、proactive（主动式，无人实时参与）——并强调不是所有任务都需要复杂循环：从最简单的方案起步，按需选用。循环产出的质量取决于其周围的系统（干净的代码库、可自我验证的手段、可达的文档、独立的审查代理），token 消耗则靠清晰的边界（选对原语与模型、明确停止条件、先小规模试跑）来管理。

---

## 要点

- 循环 = 代理重复工作周期直到满足停止条件；每种循环由“触发方式 + 停止条件 + 使用的原语 + 适用任务”共同刻画。
- 不是所有任务都需要复杂循环，先用最简单的方案，循环模式要**选择性**使用。
- **Turn-based（回合制）**：由用户 prompt 触发，Claude 自判完成或需要更多上下文时停止；适合不属于常规流程/排程的短任务。你交出去的是“检查”这一步——用 SKILL.md 把手动验证步骤编码进去，让 Claude 端到端自查；检查越量化，自我验证越容易。
- **Goal-based（`/goal`）**：实时手动触发，达成目标或到达最大回合数时停止；适合有可验证退出标准的任务。你交出去的是“停止条件”——由评估模型逐次检查是否达标，避免 Claude 过早自认“够好了”就收工。确定性标准（通过测试数、达到某分数阈值）最有效。
- **Time-based（`/loop` 与 `/schedule`）**：按指定时间间隔触发，你取消或工作完成（PR 合并、队列清空）时停止；适合重复性工作或与外部系统对接。`/loop` 在本机运行、关机即停；`/schedule` 把循环搬到云端做成 routine。你交出去的是“触发时机”。
- **Proactive（主动式）**：由事件或排程触发、无人实时参与；每个任务达成目标即退出，routine 本身持续运行直到你关闭。适合定义明确的重复工作流（bug 报告、issue 分诊、迁移、依赖升级）。可把 `/schedule` + `/goal` + skills + 动态工作流（dynamic workflows）+ auto mode 组合起来做长时任务。
- **维持代码质量**：保持代码库本身干净（Claude 会沿用已有模式与约定）；用 skills 编码“好”的标准让 Claude 自查；让框架/库文档易于获取；用**第二个代理**做代码审查（新鲜上下文、更少偏见，可用内置 `/code-review`）。单次结果不达标时，不要只修个例，要把它固化进系统以改善后续所有迭代。
- **管理 token 消耗**：为任务选对原语与模型（小任务不必上多代理/循环，部分任务可用更便宜更快的模型）；定义清晰的成功与停止标准；大规模跑之前先小切片试跑（动态工作流可能生成上百个代理）；确定性工作用脚本（跑脚本比逐步推理便宜）；routine 不要跑得比需要更频繁；用 `/usage`、`/goal`（无参）、`/workflows` 复查用量。

---

## 详细内容

### 循环的定义与分类维度

“设计循环”而非“逐条 prompt”是当前的热门话题，但对“循环到底是什么”众说纷纭。Claude Code 团队的定义是：**代理重复执行工作周期，直到满足停止条件**。区分循环类型看四点——如何触发、如何停止、用哪个 Claude Code 原语、最适合哪类任务。关键心态：不是所有任务都需要复杂循环，从最简单的方案起步、选择性地使用这些模式。

### Turn-based：回合制循环（你交出“检查”）

- **触发**：一个用户 prompt。
- **停止**：Claude 判断任务已完成，或需要更多上下文。
- **适用**：不属于常规流程/排程的较短任务。
- **控用量**：写具体的 prompt，用 skills 改进验证以减少回合数。

你发出的每个 prompt 都启动一个由你逐回合引导的手动循环。Claude 收集上下文、采取行动、检查工作、必要时重复、然后回复——这被称为**代理循环（agentic loop）**。例如让 Claude 做一个点赞按钮：它读你的代码、做修改、跑测试，交回一个它认为可用的结果；随后由你手动检查并写下一个 prompt。

改进“验证”这一步的办法：把你的手动步骤编码成 `SKILL.md`，让 Claude 能端到端地自查更多工作。这应包含工具或连接器，让 Claude 能看见、测量或与结果交互；检查越量化，Claude 越容易自我验证。文章给出的例子是一个 `verify-frontend-change` skill：绝不能仅凭“编辑成功”就报告 UI 变更完成，而要像人类审查者那样——启动 dev server 打开被改页面、直接与变更交互（点击新控件、确认状态变化、前后截图）、检查浏览器 console 零新增报错、用 Chrome DevTools MCP 跑性能 trace 并审计 Core Web Vitals；任一步失败就修复并从第 1 步重跑，不交回“部分验证”的工作。

### Goal-based：目标驱动循环 `/goal`（你交出“停止条件”）

- **触发**：实时手动 prompt。
- **停止**：目标达成，或到达你设定的最大回合数。
- **适用**：具有可验证退出标准的任务。
- **控用量**：设定明确的完成标准与显式回合上限，例如“试 5 次后停止”。

复杂任务单个回合往往不够，代理在能够迭代时表现更好。用 `/goal` 定义“完成”的样子，就能延长 Claude 迭代的时长。定义了成功标准后，Claude 不必自己判断“够好了没”而提前结束循环；每次 Claude 试图停止时，评估模型都会检查你的条件，并把它送回去继续工作，直到达标或到达你设定的回合数。这也是确定性标准（通过的测试数、越过某个分数阈值）如此有效的原因。例如：

```bash
/goal get the homepage Lighthouse score to 90 or above, stop after 5 tries.
```

### Time-based：时间驱动循环 `/loop` 与 `/schedule`（你交出“触发时机”）

- **触发**：指定的时间间隔。
- **停止**：你取消它，或工作完成（PR 合并、队列清空）。
- **适用**：重复性工作，或与外部环境/系统对接。
- **控用量**：设更长的间隔，或基于事件而非时间来反应。

部分代理工作是重复性的：任务不变、只有输入在变（例如每天早上汇总 Slack 消息）。另一些工作依赖外部系统，一种简单的对接方式就是按间隔去检查并对变化做出反应（例如一个可能收到 code review 或 CI 失败的 PR）。用 `/loop` 按间隔重跑一个 prompt：

```bash
/loop 5m check my PR, address review comments, and fix failing CI
```

`/loop` 在你的电脑上运行——关机即停。用 `/schedule` 创建一个 routine，可把循环搬到云端。

### Proactive：主动式循环（你交出“prompt”本身）

- **触发**：事件或排程，无人实时参与。
- **停止**：每个任务在其目标达成时退出；routine 本身持续运行直到你关闭它。
- **适用**：定义明确的重复工作流——bug 报告、issue 分诊、迁移、依赖升级等。
- **控用量**：把 routine 路由到更小更快的模型，判断性决策才用最强模型。

上述原语可与 auto mode、动态工作流（dynamic workflows，research preview）等特性组合成长时循环。例如处理进来的反馈：用 `/schedule`（research preview）跑一个检查新报告的 routine → 用 `/goal` 定义“完成”的样子并用 skills 记录如何验证 → 用动态工作流编排代理去分诊、修复、审查每条报告 → 用 auto mode 让 routine 不停下来征求许可地运行。组合后的 prompt 形如：

```bash
/schedule every hour: check the project-feedback channel for bug reports. /goal: don't stop until every report found this run is triaged, actioned, and responded to. When fixing a bug, use a workflow to explore three solutions in parallel worktrees and have a judge adversarially review them.
```

### 维持代码质量

循环产出的质量取决于其周围的系统。设计系统时：

- **保持代码库本身干净**：Claude 会沿用代码库里已存在的模式与约定。
- **给 Claude 自我验证的手段**：用 skills 把“好”的标准编码下来。
- **让文档易于获取**：框架与库的文档承载最新最佳实践。
- **用第二个代理做代码审查**：新鲜上下文的审查者偏见更少，不受主代理推理影响；可用内置 `/code-review` skill 或 GitHub 上的 Code Review。

当某次结果不达标时，不要止步于修复这个个例，尝试把它固化下来，以改善未来所有迭代的系统。

### 管理 token 消耗

循环应有清晰的边界：

- **为任务选对原语与模型**：小任务不需要多代理或循环，部分任务可用更便宜更快的模型。
- **定义清晰的成功与停止标准**：说清“完成”的样子，让 Claude 更早（但不要太早）抵达解。
- **大规模跑之前先试跑**：动态工作流可能生成上百个代理，先在一小切片上评估用量。
- **确定性工作用脚本**：跑脚本比逐步推理便宜（例如 PDF skill 附带一个填表脚本供 Claude 每次运行，而非每次重新推导代码）。
- **routine 不要跑得比需要更频繁**：把间隔匹配到被监视对象的实际变化频率。
- **复查用量**：`/usage` 按 skills、subagents、MCP 拆分近期用量；`/goal`（无参）显示已用回合数与 token；`/workflows` 显示每个代理的 token 用量且可随时停止某个代理。

### 上手一览表

| 循环              | 你交出           | 何时使用          | 使用原语                |
| --------------- | ------------- | ------------- | ------------------- |
| Turn-based 回合制  | 检查（the check） | 你在探索或做决定      | 自定义验证 skills        |
| Goal-based 目标驱动 | 停止条件          | 你知道“完成”是什么样   | `/goal`             |
| Time-based 时间驱动 | 触发时机          | 工作在项目之外、按排程发生 | `/loop`、`/schedule` |
| Proactive 主动式   | prompt 本身     | 工作重复且定义明确     | 以上全部 + 动态工作流        |

上手方法：审视你已经在做的工作，挑一个你成为瓶颈的任务，问哪一块可以交出去——你能写出验证检查吗？目标足够清晰吗？工作是按排程到达的吗？有想法后就跑起来，观察它在哪里停滞或越界，并不断迭代。

> 与 [[claude-code/model-vs-effort|模型与努力]] 的关系：循环决定 Claude **重复做多少轮工作**并把“检查/停止/触发/prompt”哪一环交给系统；模型与努力则决定每一轮里 Claude **知道多少**、**做多彻底**。Proactive 循环“把 routine 路由到更小的模型、判断决策才用最强模型”正是模型选择策略在长时循环中的落地。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/Getting started with loops\|Getting started with loops]] | raw/ | 原文由 Claude Code 团队 [@delba_oliveira](https://x.com/@delba_oliveira) 撰写，英文剪藏，来源 x.com/ClaudeDevs（2026-07-07 发布） |
