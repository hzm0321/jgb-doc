---
sidebar_position: 3
title: 大盘指数与市场行情
sidebar_label: 3. 大盘行情 (market)
---

# 大盘指数与市场行情

本章详细介绍如何通过 CLI 获取全球宏观大盘指数实时报价、大盘与单个基金的盘中估值分时趋势曲线、A 股法定交易日历状态判断，以及单个基金关联概念板块及其资金流向。此类宏观与行业维度数据非常适合用于大模型智能体进行市场情绪研判和宏观背景归因分析。

---

## 3.1 `jgb market` —— 批量获取全球大盘指数实时行情

### 语法 (Synopsis)
```bash
jgb market [options]
```

### 描述 (Description)
批量获取全球主要金融市场核心股票指数的实时行情，默认覆盖 A 股（上证指数、深证成指、创业板指、沪深300、科创50等）、美股（纳斯达克、标普500、道琼斯）、港股（恒生指数、恒生科技）、欧洲核心国家及亚太主要指数。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--filter <market>` | string | 否 | 按市场筛选：`a-share`（仅 A 股）、`us`（美股）、`hk`（港股）、`global`（全海外） |
| `--sort <field>`    | string | 否 | 排序指标：`changePercent`（涨跌幅[默认]）、`price`（最新点位） |
| `--order <dir>`     | string | 否 | 排序方向：`desc`（领涨在前[默认]）、`asc`（领跌在前） |
| `--format <type>`   | string | 否 | 输出格式支持 `table`（默认）、`json`、`text`、`csv` |

### 使用示例 (Examples)
```bash
# 查询全球全部大盘指数行情
jgb market

# 仅筛选查看 A 股核心指数，并按涨跌幅排位
jgb market --filter a-share --sort changePercent

# 在 Shell 脚本或自动化应用中获取 JSON 格式结果
jgb market --filter us --format json
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb market --filter a-share

指数              最新点位      涨跌额      涨跌幅
────────────────────────────────────────────────────────────
上证指数            4090.48        -17.60    -0.43%
上证50              2928.75         -5.72    -0.19%
深证成指           16030.70       +149.75    +0.94%
沪深300             4941.60        +10.21    +0.21%
创业板指            4252.39        +85.34    +2.05%
科创50              1911.51        +70.69    +3.84%
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "market",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": [
    { "name": "上证指数", "code": "sh000001", "price": 4090.48, "change": -17.60, "changePercent": -0.43 },
    { "name": "深证成指", "code": "sz399001", "price": 16030.70, "change": 149.75, "changePercent": 0.94 },
    { "name": "创业板指", "code": "sz399006", "price": 4252.39, "change": 85.34, "changePercent": 2.05 }
  ],
  "meta": { "total": 6, "filter": "a-share" }
}
```

---

## 3.2 `jgb valuation-trend` —— 估值分时与阶段趋势

### 语法 (Synopsis)
```bash
jgb valuation-trend <code> [options]
```

### 描述 (Description)
获取指定基金或大盘指数在较长跨度（如近 3 个月、近半年、近 1 年）下的盘中实时估值采样趋势与最终净值偏离度对比曲线数据，适合用于构建走势可视化或趋势量化模型。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码或系统内置大盘指数代码（如 `sh000001`） |
| `--range <span >`| string | 否 | 时间跨度：`1m`（近 1 个月）、`3m`（近 3 个月[默认]）、`6m`、`1y` |
| `--step <interval>`| string| 否 | 采样时间间隔步长：`day`（按日[默认]）、`week`（按周） |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
# 获取近 3 个月的估值趋势数据
jgb valuation-trend 005827 --range 3m --format json
```

### 输出格式 (Output)
**常规概览输出**：
```
标的: 易方达蓝筹精选混合 (005827)
时间跨度: 3m (2026-04-03 至 2026-07-03)
数据点数: 60 个交易日
估值均方根误差 (RMSE): 0.12%
趋势判定: 长期稳健上升通道 (+12.4%)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "valuation-trend",
  "data": {
    "code": "005827",
    "range": "3m",
    "points": [
      { "date": "2026-05-03", "estimateNav": 1.1800, "actualNav": 1.1810, "estimateChangePercent": 0.25 },
      { "date": "2026-06-03", "estimateNav": 1.2100, "actualNav": 1.2095, "estimateChangePercent": 0.33 },
      { "date": "2026-07-03", "estimateNav": 1.2345, "actualNav": null, "estimateChangePercent": 0.45 }
    ]
  }
}
```

---

## 3.3 `jgb trading-day` —— A 股法定交易日历判断

### 语法 (Synopsis)
```bash
jgb trading-day [date] [options]
```

### 描述 (Description)
判断今天或指定的具体日期是否为 A 股法定有效交易日（自动排除周六日及中国法定节假日）。支持传入月份参数以生成完整的月度交易日历明细，便于脚本自动化调度申购、定投或定时任务（如只在交易日 14:50 触发估值提醒脚本）。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `[date]` | string | 否 | 指定待检查的具体日期，格式 `YYYY-MM-DD`。默认检查当天 |
| `--month <YYYY-MM>`| string| 否 | 输出指定月份全月的日历状态表（例如 `2026-07`） |
| `--next` | flag | 否 | 寻找指定日期之后的下一个紧邻有效交易日 |
| `--prev` | flag | 否 | 寻找指定日期之前的一个紧邻有效交易日 |

### 使用示例 (Examples)
```bash
# 检查今天是否为交易日
jgb trading-day

# 检查 2026 年国庆期间某天是否交易日
jgb trading-day 2026-10-01

# 获取 2026 年 7 月完整日历并以 JSON 输出
jgb trading-day --month 2026-07 --format json

# 在 bash 中作为条件分支判断
if jgb trading-day | grep -q "是"; then
  echo "今天是交易日，执行盘尾策略监控脚本..."
fi
```

### 输出格式 (Output)
**单日查询表格/纯文本输出**：
```
日期:     2026-07-03 (星期五)
交易日:   是
当前状态: 盘中交易 (14:30:00)
```

**月度查询 (`--month`) 表格输出**：
```
$ jgb trading-day --month 2026-07

2026年7月 A股交易日历
日期         星期    是否交易日   休市原因
─────────────────────────────────────────────────
2026-07-01   周三    是          --
2026-07-02   周四    是          --
2026-07-03   周五    是          --
2026-07-04   周六    否          周末休市
2026-07-05   周日    否          周末休市
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "trading-day",
  "data": {
    "date": "2026-07-03",
    "dayOfWeek": "Friday",
    "isTradingDay": true,
    "marketStatus": "open",
    "reason": null
  }
}
```

---

## 3.4 `jgb sectors` —— 基金关联板块与资金流向

### 语法 (Synopsis)
```bash
jgb sectors <code> [options]
```

### 描述 (Description)
查询指定基金在底层投资体系中所关联的概念板块、行业主题分类，以及这些板块当日的实时涨跌幅排行和主力资金净流入情况。可以帮助投资者快速判断该基金盘中净值异动的驱动板块来源。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--quotes` | flag | 否 | 同步拉取并附带显示各关联板块当前的实时行情与资金流向 |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
# 查询某基金关联的所有概念行业与实时行情
jgb sectors 005827 --quotes
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb sectors 005827 --quotes

基金: 易方达蓝筹精选混合 (005827)
关联概念/行业板块明细:
板块名称      板块代码 (secid)   当日涨跌   主力资金净流入 (万元)
──────────────────────────────────────────────────────────
白酒概念      s_sh000031         +1.52%     +125,400.00
消费50        1.BK0577           +0.88%     +45,210.50
食品饮料      s_sh000807         +0.76%     +88,900.00
港股互联网    s_hk000001         -0.45%     -32,100.00
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "sectors",
  "data": {
    "fundCode": "005827",
    "sectors": [
      { "name": "白酒概念", "secid": "s_sh000031", "changePercent": 1.52, "mainNetInflow": 125400.00 },
      { "name": "消费50", "secid": "1.BK0577", "changePercent": 0.88, "mainNetInflow": 45210.50 },
      { "name": "食品饮料", "secid": "s_sh000807", "changePercent": 0.76, "mainNetInflow": 88900.00 }
    ]
  }
}
```
