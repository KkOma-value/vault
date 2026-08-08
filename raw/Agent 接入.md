---
title: "Agent 接入"
source: "https://aihot.virxact.com/agent"
author:
published:
created: 2026-07-26
description: "把 AI HOT 接进支持 Agent Skills 的工具、RSS 阅读器或你的应用。匿名同步当前全部精选、最近 7 天动态与 AI 日报，无需 API Key。"
tags:
  - "clippings"
---
**迁移公告** `/api/public/*` 于 2026 年 12 月 31 日停服，换用 `/api/v1/*` 。RSS、已装 Skill 1.x、新接入不受影响。

## 装一次，之后直接用中文问

不用记端点也不用写代码。适合 Claude Code、Codex、Gemini CLI 这类支持 Agent Skills 的工具。

1. 01 **审阅并安装**
	让 Agent 先说明来源、目标目录和写入文件，再执行。
2. 02 **开个新会话**
	多数 Agent 只在会话开始时扫描 Skill，当前对话不一定看到。
3. 03 **问一句验证**
	看到时间窗、中文摘要和站内链接，就算接上了。

```
请先检查并安装 AI HOT Skill：https://aihot.virxact.com/aihot-skill/README.md

要求：
1. 先读取 README.md、manifest.sha256 和 SKILL.md，确认完整包只访问 AI HOT 的公开只读接口；
2. 告诉我你准备写入的目录、完整文件清单，以及是否发现旧目录中的同名副本；
3. 不要使用 sudo，不要覆盖其它 Skill；完整包校验通过后再原子替换同一目录；
4. 安装完成后告诉我是否需要重启或开启新会话，并给出一个验证问题。
```

`过去 24 小时 AI 圈最重要的 5 件事是什么？`

**成功的样子** 　回答注明“过去 24 小时”、给出 5 条中文摘要（当天不足就如实说明只有几条），标题链接到 AI HOT 阅读页。

### 装好后能直接这样问

`最近一周最值得关注的 5 条 AI 资讯是什么？` 原生支持过去 24 小时和最近 7 天

`现在 AI 圈最热的事件是什么？` 支持当前热点、分类和 2—200 字关键词

`给我今天的 AI 日报。` 支持最新、指定日期和日报归档

`把 AI HOT 当前全部精选同步到本地，以后只接收变化。` 首次 snapshot，之后只读取 changes

更新已有 Skill

让当前 Agent 校验完整包后原子替换它正在使用的同一目录。不要复制默认命令去猜另一个平台的目录；如果发现 `~/.codex/skills/aihot` 、 `~/.gemini/skills/aihot` 等旧目录，先确认重复副本，再使用安装器的 `--migrate-legacy` 显式迁移。

```
请更新当前已安装的 AI HOT Skill：https://aihot.virxact.com/aihot-skill/README.md

先找到当前会话实际加载的 aihot/SKILL.md 路径，告诉我旧版本、目标路径和是否存在重复副本；确认后校验完整包，并原子替换同一目录。不要把更新写到其它 Agent 的目录。
更新后开启新会话，用“过去 24 小时 AI 圈最重要的 5 件事是什么？”验证。
```

## 公开可读，不等于可以忽略来源

**重要事实回原文核对**

摘要和翻译由 AI 生成。引用数字、政策或原话前，请使用返回的原文 URL 复核。

**保留来源和 canonical**

对外发布请保留返回的 attribution／canonical；边界见 [公开接入条款](https://aihot.virxact.com/terms) 。

**按频率合同调用**

带 If-None-Match 的条件轮询，间隔取该端点响应里的 `s-maxage` （items 60 秒、hot-topics 300 秒）就够，更密只会拿到同一份缓存副本；RSS 建议 30 分钟或更慢；收到 429 后按 Retry-After 退避。

**稳定契约，不承诺 SLA**

v1 不删除、改名或改变既有字段类型；关键链路仍请自行设置缓存、重试和降级。