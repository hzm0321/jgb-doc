---
sidebar_position: 3
title: 3. 大盘与板块行情
sidebar_label: 3. 大盘与板块
---

# 3. 大盘与板块行情

## 二、大盘指数行情

### 2.1 查询大盘指数（v1）

**对应源码**: `src/api.ts` → `fetchMarketIndicesCLI()`

**功能**: 批量获取全球主要股指实时行情，覆盖 A 股（上证、深证、创业板、科创50、北证50、中证系列）、美股（纳斯达克、标普500、道琼斯）、港股（恒生、恒生科技）、欧洲（富时100、CAC40、DAX）、日韩（日经225、东证、韩国综合、KOSDAQ）。

**CLI 命令**:
```bash
jgb market [--filter <type>] [--json] [--text]
jgb market                         # 全部指数
jgb market --filter a-share        # 仅 A 股
jgb market --filter us             # 仅美股
jgb market --filter hk             # 仅港股
jgb market --filter global         # 仅海外
```

**参数**:
- `--filter <type>`（可选）：筛选类型（a-share / us / hk / global）
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

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

**输出示例** (json):

```json
{
  "ok": true,
  "command": "market",
  "timestamp": "2026-06-21T11:55:10.881Z",
  "data": [
    { "name": "上证指数", "code": "sh000001", "price": 4090.48, "change": -17.60, "changePercent": -0.43 },
    { "name": "上证50", "code": "sh000016", "price": 2928.75, "change": -5.72, "changePercent": -0.19 },
    { "name": "深证成指", "code": "sz399001", "price": 16030.70, "change": 149.75, "changePercent": 0.94 }
  ],
  "meta": { "total": 17 }
}
```

**输出示例** (text):

```
上证指数: 4090.48 -17.60 -0.43%
上证50: 2928.75 -5.72 -0.19%
深证成指: 16030.70 +149.75 +0.94%
沪深300: 4941.60 +10.21 +0.21%
创业板指: 4252.39 +85.34 +2.05%
科创50: 1911.51 +70.69 +3.84%
```

---


---

## 十一、估值分时图数据

### 11.1 查询估值分时趋势（v1）

**对应源码**: `app/api/fund.js` → `fetchFundValuationTrend()`

**功能**: 通过 Supabase Edge Function 获取基金估值日内分时数据。

**CLI 命令建议**:
```
fund valuation-trend <code> --range 3m
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund valuation-trend",
  "data": {
    "code": "005827",
    "range": "3m",
    "points": [
      { "date": "2026-03-16", "estimateNav": 1.1800, "estimateChange": 0.25 },
      { "date": "2026-04-16", "estimateNav": 1.2100, "estimateChange": 0.33 },
      { "date": "2026-05-16", "estimateNav": 1.2280, "estimateChange": 0.15 }
    ]
  }
}
```

---


---

## 十三、交易日历

### 13.1 查询交易日状态（v1）

**对应源码**: `app/lib/tradingCalendar.js`

**功能**: 基于 chinese-days 节假日数据判断某日期是否为 A 股交易日（排除周末和法定节假日）。

**CLI 命令建议**:
```
fund trading-day                        # 今天是否交易日
fund trading-day 2026-06-15
fund trading-days --month 2026-06       # 某月所有交易日
```

**输出示例** (`trading-day`, table):

```
$ fund trading-day 2026-06-16

日期: 2026-06-16 (周二)
交易日: 是
```

**输出示例** (`trading-days`, table):

```
$ fund trading-days --month 2026-06

2026年6月 交易日历
日期         星期    交易日
2026-06-02   周一    是
2026-06-03   周二    是
2026-06-04   周三    是
2026-06-05   周四    是
2026-06-06   周五    是
2026-06-07   周六    否
2026-06-08   周日    否
2026-06-09   周一    是
...

交易日共 21 天
```

**输出示例** (`trading-day`, json):

```json
{
  "ok": true,
  "command": "fund trading-day",
  "data": {
    "date": "2026-06-16",
    "dayOfWeek": "周二",
    "isTradingDay": true
  }
}
```

---


---

## 十四、关联板块查询

### 14.1 查询基金关联板块（v1）

**对应源码**: `app/api/fund.js` → `fetchRelatedSectorsBatch()`

**功能**: 从 Supabase fund_related 表查询基金关联板块，再通过 fund_secid 获取板块行情。

**CLI 命令建议**:
```
fund sectors <code>
fund sectors <code> --quotes            # 同时获取板块实时行情
```

**输出示例** (table):

```
$ fund sectors 005827 --quotes

基金: 易方达蓝筹精选混合 (005827)
关联板块:
板块              secid         当日涨跌
白酒概念          s_sh000031    +1.52%
消费50            1.BK0577      +0.88%
食品饮料          s_sh000807    +0.76%
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund sectors",
  "data": {
    "fundCode": "005827",
    "sectors": [
      { "name": "白酒概念", "secid": "s_sh000031", "changePercent": 1.52 },
      { "name": "消费50", "secid": "1.BK0577", "changePercent": 0.88 },
      { "name": "食品饮料", "secid": "s_sh000807", "changePercent": 0.76 }
    ]
  }
}
```

---


---

