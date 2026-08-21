---
sidebar_position: 6
title: 更新日志
sidebar_label: 6. 更新日志 (changelog)
---

# 更新日志

本页面记录 `@jigubao/cli` 的版本变更历史，包括新功能特性、问题修复、体验优化与破坏性变更说明。建议开发者定期关注本页面，以便及时适配最新版本。

---

## v1.0.3（2026-08-21）

### ✨ 新功能

- **账号密码登录**：新增 `jgb login password` 子命令，支持 `--email` 与 `--password` 参数非交互式直接登录，适合自动化场景。
- **基金波段信号指令**：新增 `jgb signal <code>` 指令，基于历史分位数、Z-Score、布林带 %B、乖离率 BIAS、RSI 五项指标加权计算综合评分，给出区域判定与操作建议，支持 `--date`、`--range` 参数及策略回测小结。
- **数据源 5**：`jgb info --source 5` 新增 PRO 会员专享估值数据源，通过 Cloudflare Worker 代理获取实时估值数据，与 Web 端保持一致。同步更新 `jgb best-source` 对比结果。

### ⚡ 体验优化

- **登录指令合并**：`jgb login` 与 `jgb login password` 合并为统一的 `jgb login [mode]` 命令，简化命令注册逻辑。

---

## v1.0.2（2026-08-05）

### ⚡ 体验优化

- **鉴权逻辑重构**：会员状态查询从 Supabase RPC 调用改为基于 JWT `access_token` 本地解码 `app_metadata`，零 RPC 方案，响应更快且消除网络异常风险。

---

## v1.0.1（2026-08-05）

### ✨ 新功能

- **基金实时估值数据源升级**：`jgb info` 估值数据源从 `fundgz` JSONP 接口迁移至 `FundValuationLast` 接口，与 Web 端保持一致，新增年份校验防止返回过期数据。
- **东证指数行情获取方案更新**：`jgb market` 东证指数改用独立 API 获取，并发请求提升拉取效率。

### 🐛 问题修复

- **热门板块数据获取方式调整**：`jgb market concept` 从直接查询 `fund_topic` 表改为调用 RPC `get_hot_sectors`，修复数据返回异常。
- **登录网络异常处理增强**：`jgb login` 验证码发送与校验环节新增异常捕获，网络异常时提示运行 `jgb doctor` 诊断。

---

## v1.0.0（2026-07-07）

### 🎉 首次正式发布

`@jigubao/cli` v1.0.0 正式发布！这是一款专为基估宝 Pro 会员用户设计的命令行工具，核心定位为"高频只读查询能力与自动化集成基座"。

### ✨ 核心功能

- **认证管理**：
  - `jgb login`：交互式邮箱验证码登录。
  - `jgb logout`：清除本地凭证。
  - `jgb status`：查看登录状态与会员信息。
- **基金查询**：
  - `jgb search <keyword>`：基金搜索。
  - `jgb info <code>`：基金详情与实时估值。
  - `jgb nav <code>`：历史净值查询。
  - `jgb holdings <code>`：重仓股查询。
  - `jgb dividend <code>`：分红明细查询。
- **大盘行情**：
  - `jgb market index`：大盘指数实时报价。
  - `jgb market calendar`：A 股交易日历状态。
  - `jgb market concept`：概念板块资金流向。
- **持仓与流水**：
  - `jgb holding list`：持仓资产概览。
  - `jgb watchlist`：自选基金池。
  - `jgb trade list`：交易流水查询。
  - `jgb dca list`：定投执行记录。
- **全局通用选项**：
  - `--json`：结构化 JSON 输出。
  - `--text`：纯文本输出，专为 LLM/AI Agent 优化。
  - `-h, --help`：帮助手册。
  - `-v, --version`：版本号查询。

---

:::tip 

保持更新
推荐定期执行 `npm update -g @jigubao/cli` 以获取最新功能与修复。如需查看当前安装版本，可随时执行 `jgb -v`。如遇升级问题，请参阅 [微信交流群](./intro#四微信交流群与社区反馈) 获取社区支持。

:::
