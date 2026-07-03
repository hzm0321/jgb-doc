---
sidebar_position: 1
title: 1. CLI 概述与架构
sidebar_label: 1. 概述与架构
---

# 1. CLI 概述与架构



---

## 项目背景

`real-time-fund` 是一个基于 Next.js + React 的基金实时跟踪 Web 应用，版本 2.2.1。主要面向 A 股基金投资者，提供实时净值监控、持仓管理、收益计算、分组管理、定投计划、数据云同步等功能。后端依托 Supabase（认证 + Edge Functions + 数据库），数据源主要来自天天基金（东方财富）和新浪财经。

本文档梳理出所有适合 CLI 化的功能模块，按模块分类，逐一说明 CLI 命令建议、输入参数与预期输出。

---


---

## v1 版本范围

v1 版本优先实现查询类指令，面向基金数据、行情、持仓状态、交易记录等只读查询场景。后续章节标题中标注“（v1）”或“（v1 仅查询 ...）”的查询类命令，均属于 v1 优先实现范围。

暂不实现对用户数据有修改效果的指令；已经存在底层实现代码的，先保留代码，只注释或关闭 CLI 指令入口，避免 v1 暴露写操作。

**当前已开放的 v1 查询类入口**:
- `status`
- `search`
- `price`
- `info`
- `history`
- `returns`
- `trend`
- `holdings`
- `dividends`
- `ranking`
- `qdii`
- `best-source`
- `market`
- `portfolio list`
- `portfolio status`
- `holding list`
- `transactions`
- `pending list`

---


---

## 技术架构建议

| 层级 | 建议方案 |
|------|---------|
| 语言 | TypeScript (Node.js) |
| CLI 框架 | Commander.js 或 yargs |
| 数据获取 | 直接 HTTP 请求（node-fetch），JSONP 部分改为直接 HTTP 调用（需配合代理或后端中转） |
| 存储 | 本地 SQLite 或 JSON 文件（替代 localStorage） |
| 云同步 | 复用现有 Supabase 配置，通过 @supabase/supabase-js SDK |
| 表格输出 | cli-table3 或 table 库 |
| 进度展示 | ora (spinner) |
| 认证 | Supabase Auth 邮箱验证码流程 |

**关键约束**:

1. **JSONP 适配**: 现有代码大量依赖浏览器 JSONP（动态 script 标签注入），CLI 需改为直接 HTTP 请求或搭建 Express 中转服务
2. **数据源限制**: 天天基金和新浪的接口有 CORS 限制，CLI 端可直接调用（无 CORS 问题），但需处理反爬机制
3. **数据兼容**: CLI 存储格式需与 Web 端 localStorage 格式保持兼容，便于数据互通
4. **东方财富 pingzhongdata**: 该接口通过全局变量注入数据，CLI 需改为 HTTP 直接获取 JS 内容后解析（可用 vm 模块或正则提取）

---


---

## 优先级建议

| 优先级 | 功能模块 | 理由 |
|--------|---------|------|
| v1 P0 | 基金查询(1.1-1.10)、大盘指数(2.1)、持仓查询(3.2)、交易记录查询(4.2)、待处理队列查询(4.4 list) | v1 优先只读查询能力，覆盖命令行和 AI Agent 高频读取场景 |
| P0 | `--format json` 全局输出规范 (A.1-A.5)、统一信封 (A.2)、退出码 (A.3) | AI Agent 可用性的基础设施，必须首批实现 |
| 暂缓 | 持仓写操作(3.1/3.3)、交易写操作(4.1/4.3/4.4 process/remove)、自选管理(10.1) | v1 暂不开放会修改用户数据的指令；保留底层代码，后续版本再开启入口 |
| P1 | 排序筛选(9.1) | 日常投资管理必需 |
| P1 | 收益追踪(8.1)、收益汇总(23.1)、定投计划(5.1-5.3) | 投资决策关键数据 |
| P1 | `fund describe` 自描述 (A.8)、字段投影 `--fields` (A.4)、分页 (A.6) | AI Agent 自主发现和高效调用的基础 |
| P2 | 分组管理(6.1-6.4)、标签系统(7.1-7.3)、交易日历(13.1) | 体验增强 |
| P2 | 数据同步(17.1-17.3)、认证(18.1)、设置(19.1-19.2) | 多端同步支撑 |
| P2 | `--dry-run` (A.10)、`--watch` (A.11)、`--filter` (A.7)、`fund doctor` (A.15) | AI Agent 安全调用与实时监控 |
| P3 | 重仓股(1.6)、分红(1.7)、板块(14.1)、OCR(12.1)、转换(22.1) | 高级功能 |
| P3 | `--explain` 模式 (A.13)、`--no-header` 管道模式 (A.12) | 锦上添花的 AI 交互优化 |

---

