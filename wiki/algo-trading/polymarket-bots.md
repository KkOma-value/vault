# Polymarket 预测市场机器人盈利机制

<!--
内容元数据:
source_raw_files:
  - raw/我分析了 100 多个每月收入 5 万美元的 Polymarket 机器人。以下是它们如何从 500 万1500 万加密货币市场中获利。.md
domain: algo-trading
created: 2026-07-26
updated: 2026-07-26
tags: algo-trading, polymarket, prediction-market, market-making, 量化交易, 套利, 风险管理, 做市
related:
  - wiki/ai-automation/wechat-daily-pdf.md
-->

## 摘要

分析 100+ 个在 Polymarket 短期加密货币市场（BTC 5 分钟涨跌）月盈利超 5 万美元的机器人。核心不是"猜涨跌"，而是持续重新定价、识别陈旧订单、计算可执行优势、管理库存与风险。文章拆解了完整的六层架构（数据→信号→定价→仓位→执行→研究）和五种盈利模式。

---

## 要点

- 机器人优势不在预测方向，而在识别 CLOB 上尚未反映最新市场状态的陈旧价格。
- 决策链：市场数据 → 信号 → 公允价值 → 可执行优势 → 仓位结构 → 执行 → 风险。
- 贝叶斯模型实时更新 Up/Down 公允价值；多信号可能同源，需判断增量信息量。
- 理论优势 ≠ 可执行利润：必须扣除手续费、滑点、部分成交风险、模型不确定性。
- 5m 与 15m 市场因开盘价/剩余时间/流动性不同，重新定价速度不一致 → 跨市场 z-score 检测异常价差。
- 五种仓位模式：时间套利、对冲方向性头寸、库存做市、临近结算捕获、动态轮换。
- 执行层：库存调整的保留价格（reservation price）+ 多种订单类型（GTC/GTD/FOK/FAK/Post-only）。
- 风控：Fractional Kelly（通常 25%）+ 硬限额（单市场/单资产/未对冲库存/日亏损/相关头寸/kill switch）。
- 回测必须包含真实手续费、滑点、部分成交、延迟、取消订单——只在 best ask 成交的策略不可用于生产。

---

## 详细内容

### 六层生产架构

| 层 | 职责 | 关键组件 |
|----|------|----------|
| 1 - Data | 外部价格、结算 feed、CLOB 订单簿、成交、自身订单状态 | WebSocket / REST |
| 2 - Signals | 动量、波动率、订单簿失衡、交易流、跨市场偏差 | 特征工程 |
| 3 - Pricing | 基于开盘价+剩余时间独立计算 Up/Down 公允价值 | 贝叶斯更新 |
| 4 - Position | 选择仓位结构（五种模式之一或组合） | 策略选择器 |
| 5 - Execution & Risk | 限价单管理、不完整成交处理、仓位规模、敞口限制、kill switch | 执行引擎 + 风控 |
| 6 - Research | 回测、纸盘、交易周期重建、亏损分析 | AI 可辅助此层 |

### 五种盈利模式

1. **Temporal Arbitrage（时间套利）** — 在不同时刻分别买入 Up 和 Down，组合成本 < $1。风险：第二腿可能永远买不到便宜价。
2. **Hedged Directional（对冲方向性）** — 大部分 matched + 小部分方向性敞口。风险：matched 成本 > $1 时方向性部分须先覆盖亏损。
3. **Inventory Market Making（库存做市）** — 跨多个市场管理资金，监控 matched shares / 方向性多余 / 可用抵押品。风险：中性库存仍可亏（综合成本 > $1）。
4. **Near-Resolution Capture（临近结算捕获）** — 结果几乎确定时以 98-99¢ 买入。风险：1 次错误 > 数十次 1¢ 盈利。
5. **Dynamic Position Rotation（动态轮换）** — 随信号变化在 Up/Down 间切换。风险：噪声市场中频繁切换累积滑点。

### 关键公式

- **贝叶斯公允价值更新**：posterior_up = P(signal|up) × prior_up / [P(signal|up) × prior_up + P(signal|down) × (1-prior_up)]
- **净优势**：net_edge = fair_value - fill_price - fee - slippage - safety_buffer
- **跨市场 z-score**：z = (current_spread - avg_spread) / std_spread
- **库存调整保留价格**：reservation = fair_value - inventory_imbalance × risk_aversion × σ² × time_remaining
- **Fractional Kelly**：size = kelly_fraction × [(net_odds × win_prob - loss_prob) / net_odds]

### 为什么人工交易员难以复制

延迟进场、情绪化仓位、疲劳、亏损后非理性加仓——自动化消除这些但不能修复错误模型。

---

## 来源备注

| 原始文件 | 位置 | 备注 |
|----------|------|------|
| [[raw/我分析了 100 多个每月收入 5 万美元的 Polymarket 机器人。以下是它们如何从 500 万1500 万加密货币市场中获利。\|Polymarket 机器人分析]] | raw/ | @Dan1ro0, 2026-07-13, Twitter thread |
