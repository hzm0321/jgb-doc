---
sidebar_position: 2
title: 基金数据与行情查询
sidebar_label: 2. 基金查询 (fund)
---

# 基金数据与行情查询

本章收录所有面向单只或多只公募基金的基本面查询、实时估值监控、历史区间净值、重仓股与分红明细指令。所有指令均遵循双重输出标准，既可通过表格（Table）或自然语言（Text）在终端阅读，亦可切换为标准结构化 `JSON` 供脚本或 AI Agent 自动解析。

---

## 2.1 `jgb search` —— 搜索基金

### 语法 (Synopsis)
```bash
jgb search <keyword> [options]
```

### 描述 (Description)
根据输入的关键词（支持基金代码模糊匹配、名称拼音或汉字关键词），从天天基金全网公募基金名录中全文检索匹配的基金列表。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<keyword>` | string | 是 | 基金代码或名称模糊匹配关键词（如 `005827`、`易方达`、`蓝筹`） |
| `--limit <num>` | number | 否 | 返回搜索结果条目的最大数量上限，默认值 `10` |
| `--format <type>`| string | 否 | 输出格式支持 `table`（默认）、`json`、`text`、`csv` |

### 使用示例 (Examples)
```bash
# 按基金名称关键词搜索
jgb search "易方达蓝筹"

# 精准或前缀匹配代码搜索，限制返回 3 条
jgb search 0058 --limit 3

# AI Agent 自动化集成查询 JSON
jgb search "沪深300" --format json
```

### 输出格式 (Output)
**表格/常规文本输出 (`--format table`)**：
```
🔍 正在搜索 "易方达蓝筹"...
✔ [005827] 易方达蓝筹精选混合 (混合型-偏股)
✔ [009342] 易方达优质精选三年持有期 (混合型-偏股)
✔ [110010] 易方达价值成长混合 (混合型-偏股)
共找到 3 个结果。
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "search",
  "timestamp": "2026-07-03T14:00:00+08:00",
  "data": [
    { "code": "005827", "name": "易方达蓝筹精选混合", "category": "混合型-偏股" },
    { "code": "009342", "name": "易方达优质精选三年持有期", "category": "混合型-偏股" },
    { "code": "110010", "name": "易方达价值成长混合", "category": "混合型-偏股" }
  ],
  "meta": { "total": 3 }
}
```

---

## 2.2 `jgb info` —— 查询单基金实时估值与基本面综述

### 语法 (Synopsis)
```bash
jgb info <code> [options]
```

### 描述 (Description)
获取指定单只基金的综合数据综述，包括最新官方单位净值、净值确认日期、昨日涨跌幅、日内实时估算净值与估算涨跌幅、估算更新时间，以及底层数据源引用。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位有效公募基金代码（如 `005827`） |
| `--source <type>` | number | 否 | 强制指定估值数据源（`1`=天天基金[默认]，`2`=新浪估算，`3`=新浪估算2） |
| `--format <type>` | string | 否 | 输出格式支持 `table`（默认）、`json`、`text` |

### 使用示例 (Examples)
```bash
# 查询基金实时估值与净值信息
jgb info 005827

# 切换至新浪估算接口查询并输出纯文本摘要（适合大模型读取）
jgb info 005827 --source 2 --format text
```

### 输出格式 (Output)
**纯文本摘要输出 (`--format text`)**：
```
基金名称: 易方达蓝筹精选混合
基金代码: 005827
最新净值: 1.2345
净值日期: 2026-07-02
昨日涨跌幅: +0.52%
实时估算净值: 1.2400
实时估算涨跌幅: +0.45%
估算时间: 2026-07-03 14:30
数据来源: 天天基金(1)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "info",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": {
    "code": "005827",
    "name": "易方达蓝筹精选混合",
    "dwjz": 1.2345,
    "jzrq": "2026-07-02",
    "zzl": 0.52,
    "gsz": 1.2400,
    "gszzl": 0.45,
    "gztime": "2026-07-03 14:30:00",
    "source": "ttjj"
  }
}
```

---

## 2.3 `jgb price` —— 极简净值报价

### 语法 (Synopsis)
```bash
jgb price <code> [options]
```

### 描述 (Description)
专为 Shell 脚本与管道自动化设计的极简指令，默认仅输出单基金当前的实时估值（或最新净值）数字，无额外表头和装饰字符，便于对环境变量赋值或用于状态监控条件判断。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--type <field>`  | string | 否 | 提取字段（`gsz` 估算净值[默认]、`dwjz` 官方单位净值、`zzl` 涨跌幅百分比） |

### 使用示例 (Examples)
```bash
# 直接在脚本中提取估算净值
NAV=$(jgb price 005827)
echo "当前估值: $NAV"

# 提取当前涨跌幅百分比
CHANGE=$(jgb price 005827 --type zzl)
```

### 输出格式 (Output)
**极简纯文本输出**：
```
1.2400
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "price",
  "data": {
    "code": "005827",
    "value": 1.2400,
    "type": "gsz"
  }
}
```

---

## 2.4 `jgb history` —— 历史区间净值查询

### 语法 (Synopsis)
```bash
jgb history <code> [options]
```

### 描述 (Description)
获取指定基金在某一历史时间区间内的每日官方净值（单位净值、累计净值、日增长率）明细记录。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--from <date>` | string | 是 | 查询起始日期，格式 `YYYY-MM-DD`（如 `2026-06-01`） |
| `--to <date>` | string | 否 | 查询结束日期，默认值为今天 |
| `--page <num>` | number | 否 | 分页页码，默认 `1` |
| `--page-size <n>` | number| 否 | 每页数据条数，默认 `20` |

### 使用示例 (Examples)
```bash
# 查询 2026 年 6 月全月净值流水
jgb history 005827 --from 2026-06-01 --to 2026-06-30
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
基金: 易方达蓝筹精选混合 (005827) [区间: 2026-06-01 至 2026-06-30]
净值日期     单位净值    累计净值    日增长率
─────────────────────────────────────────────────
2026-06-30   1.2345      1.4567     +0.52%
2026-06-29   1.2281      1.4503     -0.18%
2026-06-26   1.2303      1.4525     +1.12%
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "history",
  "data": [
    { "date": "2026-06-30", "dwjz": 1.2345, "ljjz": 1.4567, "zzl": 0.52 },
    { "date": "2026-06-29", "dwjz": 1.2281, "ljjz": 1.4503, "zzl": -0.18 }
  ],
  "meta": { "total": 20, "page": 1, "pageSize": 20 }
}
```

---

## 2.5 `jgb nav` —— 智能向前/向后净值查找

### 语法 (Synopsis)
```bash
jgb nav <code> --date <date> [options]
```

### 描述 (Description)
当用户输入的日期恰逢周末或法定休市假日前后无净值公布时，该指令提供智能日期探测：从指定目标日期开始自动向后（默认）或向前搜索最近的一个有效交易日，并返回对应确认的官方净值。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--date <date>` | string | 是 | 目标查询日期，格式 `YYYY-MM-DD` |
| `--backward` | flag | 否 | 改为自目标日期起向前（往早于目标日期的方向）回溯查找，默认向后搜索 |

### 使用示例 (Examples)
```bash
# 查询指定日期的净值，若遇周末自动向后寻找下一交易日
jgb nav 005827 --date 2026-06-14

# 遇非交易日向前回溯最近一天的有效净值
jgb nav 005827 --date 2026-06-14 --backward
```

### 输出格式 (Output)
**表格/常规输出**：
```
查询目标日: 2026-06-14 (非交易日)
搜索方向:   向前回溯 (backward)
匹配交易日: 2026-06-12 (回溯 2 天)
确认净值:   1.2303
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "nav",
  "data": {
    "code": "005827",
    "requestedDate": "2026-06-14",
    "foundDate": "2026-06-12",
    "direction": "backward",
    "nav": 1.2303,
    "offsetDays": 2
  }
}
```

---

## 2.6 `jgb returns` —— 阶段涨跌幅统计

### 语法 (Synopsis)
```bash
jgb returns <code> [options]
```

### 描述 (Description)
计算指定基金在近 1 周、近 1 月、近 3 月、近 6 月、今年来（YTD）、近 1 年及成立以来的各阶段区间表现百分比数据。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
jgb returns 005827
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
阶段名称       涨跌幅      同类排名      评价
─────────────────────────────────────────────
近 1 周       +1.25%      120/3500     优秀
近 1 月       -2.10%      850/3480     良好
今年来 (YTD)  +8.45%      65/3200      极佳
成立以来      +45.60%     --           --
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "returns",
  "data": {
    "code": "005827",
    "periods": [
      { "period": "1w", "name": "近1周", "returnPercent": 1.25, "rank": "120/3500" },
      { "period": "1ytd", "name": "今年来", "returnPercent": 8.45, "rank": "65/3200" }
    ]
  }
}
```

---

## 2.7 `jgb trend` —— 日内估值分时走势

### 语法 (Synopsis)
```bash
jgb trend <code> [options]
```

### 描述 (Description)
获取指定基金在当天交易时段（9:30-15:00）或近期多天的日内每分钟估值变动采样序列点。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--range <span >`| string | 否 | 走势跨度：`1d`（日内[默认]）、`5d`（五日线）、`1m`（月度走势） |

### 使用示例 (Examples)
```bash
# 获取今日日内估值采样曲线数据
jgb trend 005827 --range 1d --format json
```

### 输出格式 (Output)
**常规概览输出**：
```
走势跨度: 1d (今日日内)
采样点数: 240
最高估值: 1.2450 (+0.85%) [10:30]
最低估值: 1.2310 (-0.28%) [13:15]
当前收市: 1.2400 (+0.45%) [15:00]
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "trend",
  "data": {
    "code": "005827",
    "range": "1d",
    "points": [
      { "time": "09:30", "nav": 1.2345, "changePercent": 0.00 },
      { "time": "10:30", "nav": 1.2450, "changePercent": 0.85 }
    ]
  }
}
```

---

## 2.8 `jgb holdings` —— 基金重仓股明细

### 语法 (Synopsis)
```bash
jgb holdings <code> [options]
```

### 描述 (Description)
查询基金最新定期报告公布的前十大重仓股票列表、标的代码、占资产总值比例、持股数以及较上一报告期的增减变动。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
jgb holdings 005827
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
报告期: 2026年第1季度 (前十大重仓股)
序号   股票代码   股票名称      持仓占净比   较上期仓位变动
──────────────────────────────────────────────────────────
1      600519     贵州茅台       9.85%       +0.50% (增持)
2      000858     五粮液         8.20%       -0.30% (减持)
3      00700      腾讯控股       7.50%       0.00%  (不变)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "holdings",
  "data": {
    "code": "005827",
    "quarter": "2026-Q1",
    "list": [
      { "rank": 1, "stockCode": "600519", "stockName": "贵州茅台", "ratio": 9.85, "change": "+0.50%" }
    ]
  }
}
```

---

## 2.9 `jgb dividends` —— 历史分红记录

### 语法 (Synopsis)
```bash
jgb dividends <code> [options]
```

### 描述 (Description)
查询基金成立以来的所有分红派息记录，包括权益登记日、除息日、派息日及每份分红金额。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--since <date>` | string | 否 | 过滤某日期之后的分红记录 |

### 使用示例 (Examples)
```bash
jgb dividends 005827 --since 2024-01-01
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
权益登记日    除息日       派息现金     除息前净值
─────────────────────────────────────────────
2025-12-18    2025-12-18   每份派0.05元  1.3850
2024-06-20    2024-06-20   每份派0.08元  1.4200
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "dividends",
  "data": [
    { "recordDate": "2025-12-18", "exDate": "2025-12-18", "dividendPerShare": 0.05 }
  ]
}
```

---

## 2.10 `jgb ranking` —— 估值与收益排行榜

### 语法 (Synopsis)
```bash
jgb ranking [options]
```

### 描述 (Description)
按日内估值涨幅、某历史阶段涨跌幅等指标，获取全网公募基金或特定分类基金的榜单排行。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--sort <field>` | string | 否 | 排序字段：`gszzl`（日内估算涨幅[默认]）、`1w`（周榜）、`1m`（月榜）、`1y`（年榜） |
| `--order <dir>`  | string | 否 | 排序方向：`desc`（降序[默认]）、`asc`（升序领跌） |
| `--type <cat>`   | string | 否 | 基金类型过滤：`all`、`gp`（股票型）、`hh`（混合型）、`zq`（债券型）、`qdii` |
| `--limit <num>`  | number | 否 | 榜单条数，默认 `10` |

### 使用示例 (Examples)
```bash
# 查询今日全网估算涨幅前 5 名
jgb ranking --sort gszzl --limit 5

# 查询今年来混合型基金表现后 10 名（领跌榜）
jgb ranking --sort 1ytd --type hh --order asc --limit 10
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
排名   代码     基金名称               最新估值   今日涨幅    基金类型
──────────────────────────────────────────────────────────────────
1      012345   半导体先锋股票 A       1.8560     +6.85%      股票型
2      054321   人工智能精选混合 C     2.1020     +5.92%      混合型
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "ranking",
  "data": [
    { "rank": 1, "code": "012345", "name": "半导体先锋股票A", "gsz": 1.8560, "gszzl": 6.85 }
  ]
}
```

---

## 2.11 `jgb qdii` —— QDII/海外基金专区查询

### 语法 (Synopsis)
```bash
jgb qdii <code> [options]
```

### 描述 (Description)
针对投资美股、纳指、日经等海外市场的 QDII 基金，提供包含对标海外标的涨跌、实时汇率溢价换算、估值时滞补偿算法在内的深度专项行情。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | QDII 基金代码（如 `016665`、`050025`） |

### 使用示例 (Examples)
```bash
jgb qdii 016665
```

### 输出格式 (Output)
**表格/文本输出**：
```
基金名称: 纳斯达克100 ETF 联接 (016665)
跟踪标的: NASDAQ 100 Index (NDX)
隔夜外盘: +1.28%
实时汇率: USD/CNY = 7.2850 (+0.12%)
综合估算: +1.40% (含汇率补偿)
溢价状态: 正常溢价 (0.35%)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "qdii",
  "data": {
    "code": "016665",
    "underlyingIndex": "NDX",
    "overnightChange": 1.28,
    "currencyRate": 7.2850,
    "adjustedChange": 1.40,
    "premiumRate": 0.35
  }
}
```

---

## 2.12 `jgb best-source` —— 估值数据源精准度检测

### 语法 (Synopsis)
```bash
jgb best-source <code> --jzrq <date> --actual-zzl <val> [options]
```

### 描述 (Description)
通过回溯历史盘中实时估算与收盘后官方公布的真实涨跌幅之间的均方差，智能评估各大数据源（天天基金、新浪、第三方模型）在该基金上的估值精准度并推荐最优数据源。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |
| `--jzrq <date>` | string | 是 | 回测对比的净值确认日，如 `2026-06-18` |
| `--actual-zzl <val>`| number| 是 | 当天官方最终公布的实际涨跌幅（如 `-0.60`） |

### 使用示例 (Examples)
```bash
jgb best-source 005827 --jzrq 2026-06-18 --actual-zzl=-0.60
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
数据源         盘中终态估算     实际公布值     偏差 (误差比)   精准评级
──────────────────────────────────────────────────────────────────
1: 天天基金     -0.58%         -0.60%       +0.02%        ★★★★★ (最准)
2: 新浪估算     -0.45%         -0.60%       +0.15%        ★★★☆☆
3: 新浪估算2    -0.50%         -0.60%       +0.10%        ★★★★☆
👉 系统推荐建议：该基金后续优先绑定使用 数据源 1
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "best-source",
  "data": {
    "code": "005827",
    "recommendedSource": 1,
    "comparisons": [
      { "sourceId": 1, "sourceName": "天天基金", "estimate": -0.58, "actual": -0.60, "diff": 0.02 }
    ]
  }
}
```

---

## 2.13 `jgb confirm-days` —— 申赎确认周期查询

### 语法 (Synopsis)
```bash
jgb confirm-days <code> [options]
```

### 描述 (Description)
查询公募基金在平台进行申购与赎回时的标准确认日历天数规则（如 T+1 确认、T+2 确认等），协助开发者精确计算交易资金交收与份额划转时间点。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |

### 使用示例 (Examples)
```bash
jgb confirm-days 005827
```

### 输出格式 (Output)
**纯文本摘要输出**：
```
基金代码: 005827
确认规则: T+1 确认
买入确认: T 日 15:00 前申购，T+1 交易日确认份额并计算收益
卖出到账: T 日 15:00 前赎回，T+1 交易日确认，款项 T+2~3 交易日到账
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "confirm-days",
  "data": {
    "code": "005827",
    "confirmDays": 1,
    "ruleText": "T+1 确认",
    "redemptionArriveDays": "T+2~3"
  }
}
```
