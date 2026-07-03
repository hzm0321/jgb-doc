---
sidebar_position: 2
title: 2. 基金行情与数据查询
sidebar_label: 2. 基金行情与数据
---

# 2. 基金行情与数据查询

## 一、基金数据查询

### 1.1 搜索基金（v1）

**对应源码**: `src/api.ts` → `searchFundsCLI()`

**功能**: 根据关键词（基金代码或名称模糊搜索）从天天基金搜索接口获取基金列表。

**CLI 命令**:
```bash
jgb search <keyword> [--json]
jgb search 000001
jgb search "易方达"
```

**参数**:
- `keyword`（必填）：基金代码或名称关键词
- `--json`（可选）：以 JSON 格式输出结果

**输出示例** (table):

```
$ jgb search "易方达蓝筹"

🔍 正在搜索 "易方达蓝筹"...
✔ [005827] 易方达蓝筹精选混合 (混合型-偏股)
✔ [009342] 易方达优质精选三年持有期 (混合型-偏股)
✔ [110010] 易方达价值成长混合 (混合型-偏股)
共找到 3 个结果。
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "search",
  "timestamp": "2026-06-16T10:30:00+08:00",
  "data": [
    { "code": "005827", "name": "易方达蓝筹精选混合", "category": "混合型-偏股" },
    { "code": "009342", "name": "易方达优质精选三年持有期", "category": "混合型-偏股" },
    { "code": "110010", "name": "易方达价值成长混合", "category": "混合型-偏股" }
  ],
  "meta": {
    "total": 3
  }
}
```

**输出示例** (text):

```
基金代码: 005827
基金名称: 易方达蓝筹精选混合
基金类别: 混合型-偏股

基金代码: 009342
基金名称: 易方达优质精选三年持有期
基金类别: 混合型-偏股

基金代码: 110010
基金名称: 易方达价值成长混合
基金类别: 混合型-偏股
```

---

### 1.2 查询基金实时数据（估值 + 净值）（v1）

**对应源码**: `src/api.ts` → `fetchFundInfoCLI()`

**功能**: 获取单只基金的综合数据，包括最新单位净值（dwjz）、净值日期（jzrq）、最新涨幅（zzl）、估算净值（gsz）、估算涨幅（gszzl）、估算时间（gztime），以及基金名称。

**CLI 命令**:
```bash
jgb info <code> [--source <type>] [--json] [--text]
jgb info 000001
jgb info 000001 --source 1    # 使用天天基金数据源（默认）
jgb info 000001 --source 2    # 使用新浪估算数据源
jgb info 000001 --source 3    # 使用新浪估算2数据源
jgb info 000001 --json        # JSON 格式输出
jgb info 000001 --text        # 纯文本格式输出
```

**参数**:
- `code`（必填）：基金代码
- `--source <type>`（可选）：数据源（1=天天基金[默认]，2=新浪估算，3=新浪估算2）
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb info 005827

易方达蓝筹精选混合 (005827)
────────────────────────────────────────
最新净值:    1.5258    (2026-06-18)
最新涨幅:    -0.60%
估算净值:    1.5046
估算涨幅:    -1.98%    (2026-06-18 15:00)
数据来源:    fundgz
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "info",
  "timestamp": "2026-06-21T07:23:55.904Z",
  "data": {
    "code": "005827",
    "name": "易方达蓝筹精选混合",
    "dwjz": 1.5258,
    "jzrq": "2026-06-18",
    "zzl": -0.6,
    "gsz": 1.5046,
    "gszzl": -1.98,
    "gztime": "2026-06-18 15:00",
    "noValuation": false,
    "valuationSource": "fundgz"
  }
}
```

**输出示例** (text):

```
基金名称: 易方达蓝筹精选混合
基金代码: 005827
最新净值: 1.5258
净值日期: 2026-06-18
最新涨幅: -0.60%
估算净值: 1.5046
估算涨幅: -1.98%
估算时间: 2026-06-18 15:00
数据来源: fundgz
```

**数据来源说明**:
- `fundgz`：天天基金数据源
- `sina_ds2`：新浪估算数据源（使用 `pre_nav` 和 `growthrate` 字段）
- `sina_ds3`：新浪估算2数据源（使用 `pre_nav2` 和 `growthrate2` 字段）

---

### 1.3 查询历史净值（v1）

**对应源码**: `src/api.ts` → `fetchFundHistoryCLI()`

**功能**: 按日期区间批量拉取历史净值数据，支持分页。

**CLI 命令**:
```bash
jgb history <code> --from <date> [--to <date>] [--json] [--text]
jgb history 005827 --from 2026-06-10 --to 2026-06-13
jgb history 000001 --from 2026-06-01
```

**参数**:
- `code`（必填）：基金代码
- `--from <date>`（必填）：开始日期 YYYY-MM-DD
- `--to <date>`（可选）：结束日期，默认今天
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb history 005827 --from 2026-06-10 --to 2026-06-13

日期         单位净值    累计净值    涨跌幅
──────────────────────────────────────────────────
2026-06-10   1.5558     1.5558     +0.08%
2026-06-11   1.5514     1.5514     -0.28%
2026-06-12   1.5575     1.5575     +0.39%

共 3 条记录
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "history",
  "timestamp": "2026-06-21T07:44:24.350Z",
  "data": [
    { "date": "2026-06-10", "nav": 1.5558, "accNav": 1.5558, "growth": 0.08 },
    { "date": "2026-06-11", "nav": 1.5514, "accNav": 1.5514, "growth": -0.28 },
    { "date": "2026-06-12", "nav": 1.5575, "accNav": 1.5575, "growth": 0.39 }
  ],
  "meta": { "total": 3 }
}
```

**输出示例** (text):

```
日期: 2026-06-10  单位净值: 1.5558  累计净值: 1.5558  涨跌幅: +0.08%
日期: 2026-06-11  单位净值: 1.5514  累计净值: 1.5514  涨跌幅: -0.28%
日期: 2026-06-12  单位净值: 1.5575  累计净值: 1.5575  涨跌幅: +0.39%
```

---

### 1.4 查询基金阶段涨跌幅（v1）

**对应源码**: `src/api.ts` → `fetchFundReturnsCLI()`

**功能**: 获取基金近 1 周/1 月/3 月/6 月/1 年的阶段涨跌幅，以及连涨连跌天数。

**CLI 命令**:
```bash
jgb returns <code> [--json] [--text]
jgb returns 005827
jgb returns 005827 --json
jgb returns 005827 --text
```

**参数**:
- `code`（必填）：基金代码
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb returns 005827

阶段         涨跌幅
─────────────────────────
近1周        -1.65%
近1月        -7.03%
近3月        -18.10%
近6月        -19.60%
近1年        -13.27%
连跌天数     3 天
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "returns",
  "timestamp": "2026-06-21T08:07:01.106Z",
  "data": {
    "code": "005827",
    "week": -1.65,
    "month": -7.03,
    "month3": -18.10,
    "month6": -19.60,
    "year1": -13.27,
    "consecutiveTrend": { "type": "down", "days": 3 }
  }
}
```

**输出示例** (text):

```
基金代码: 005827
近1周: -1.65%
近1月: -7.03%
近3月: -18.10%
近6月: -19.60%
近1年: -13.27%
连跌天数: 3 天
```

---

### 1.5 查询基金走势图数据（v1）

**对应源码**: `src/api.ts` → `fetchFundTrendCLI()`

**功能**: 获取基金业绩走势（净值曲线），支持 1m/3m/6m/1y/3y/all 时间范围，含对比基准曲线（沪深300等）。

**CLI 命令**:
```bash
jgb trend <code> [--range <range>] [--json] [--text]
jgb trend 005827 --range 1m
jgb trend 005827 --range 1y
jgb trend 005827 --range 1m --json
jgb trend 005827 --range 1m --text
```

**参数**:
- `code`（必填）：基金代码
- `--range <range>`（可选）：1m / 3m / 6m / 1y / 3y / all，默认 1m
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb trend 005827 --range 1m

基金代码: 005827
时间范围: 1m
────────────────────────────────────────────────────────────
日期         净值      涨跌幅
───────────────────────────────────
2026-05-24   1.6210   +0.16%
2026-05-25   1.6074   -0.84%
2026-05-26   1.6052   -0.14%
...
2026-06-17   1.5258   -0.60%

共 19 个交易日
累计涨幅: -5.87%
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "trend",
  "timestamp": "2026-06-21T08:21:15.488Z",
  "data": {
    "code": "005827",
    "range": "1m",
    "points": [
      { "date": "2026-05-24", "value": 1.6210, "equityReturn": 0.16 },
      { "date": "2026-05-25", "value": 1.6074, "equityReturn": -0.84 },
      { "date": "2026-06-17", "value": 1.5258, "equityReturn": -0.60 }
    ],
    "benchmark": [
      { "name": "沪深300", "points": [
        { "date": "2026-05-24", "value": 3850.00 },
        { "date": "2026-05-25", "value": 3863.48 }
      ]}
    ],
    "totalReturn": -5.87
  }
}
```

**输出示例** (text):

```
基金代码: 005827
时间范围: 1m
数据点数: 19
累计涨幅: -5.87%
起始日期: 2026-05-24
结束日期: 2026-06-17
起始净值: 1.6210
结束净值: 1.5258
```

---

### 1.6 查询基金重仓股（v1）

**对应源码**: `src/api.ts` → `fetchFundHoldingsCLI()`

**功能**: 获取基金最新季报披露的前 10 大重仓股（股票代码、名称、占比），含实时行情涨跌幅；同时获取资产配置比例。

**CLI 命令**:
```bash
jgb holdings <code> [--json] [--text]
jgb holdings 005827
jgb holdings 005827 --json
jgb holdings 005827 --text
```

**参数**:
- `code`（必填）：基金代码
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb holdings 005827

基金代码: 005827
报告日期: 2026-03-31
────────────────────────────────────────────────────────────
重仓股 (前10):
序号  代码      名称        占净值比    当日涨跌
──────────────────────────────────────────────────
1     600519   贵州茅台   9.91    % -2.02%
2     000858   五粮液     9.90    % -2.12%
3     000568   泸州老窖   9.87    % -2.42%
4     00700    腾讯控股   9.60    % -1.17%
5     09987    百胜中国   9.56    % -0.24%
6     00883    中国海洋石油 9.28    % -2.01%
7     600809   山西汾酒   9.27    % -3.76%
8     09988    阿里巴巴-W 9.22    % -1.87%
9     06618    京东健康   4.39    % -0.90%
10    002027   分众传媒   3.96    % -1.95%
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "holdings",
  "timestamp": "2026-06-21T08:54:52.677Z",
  "data": {
    "code": "005827",
    "reportDate": "2026-03-31",
    "isLatestQuarter": true,
    "topHoldings": [
      { "rank": 1, "stockCode": "600519", "stockName": "贵州茅台", "weight": 9.91, "change": -2.02 },
      { "rank": 2, "stockCode": "000858", "stockName": "五粮液", "weight": 9.90, "change": -2.12 },
      { "rank": 3, "stockCode": "000568", "stockName": "泸州老窖", "weight": 9.87, "change": -2.42 }
    ],
    "assetAllocation": []
  }
}
```

**输出示例** (text):

```
基金代码: 005827
报告日期: 2026-03-31
是否最新季度: 是

重仓股 (前10):
1. 600519 贵州茅台 9.91% -2.02%
2. 000858 五粮液 9.90% -2.12%
3. 000568 泸州老窖 9.87% -2.42%
4. 00700 腾讯控股 9.60% -1.17%
5. 09987 百胜中国 9.56% -0.24%
6. 00883 中国海洋石油 9.28% -2.01%
7. 600809 山西汾酒 9.27% -3.76% -
8. 09988 阿里巴巴-W 9.22% -1.87%
9. 06618 京东健康 4.39% -0.90%
10. 002027 分众传媒 3.96% -1.95%
```

---

### 1.7 查询基金分红记录（v1）

**对应源码**: `src/api.ts` → `fetchFundDividendsCLI()`

**功能**: 获取基金历史分红数据。

**CLI 命令**:
```bash
jgb dividends <code> [--since <date>] [--json] [--text]
jgb dividends 021248
jgb dividends 021248 --since 2024-01-01
jgb dividends 021248 --json
jgb dividends 021248 --text
```

**参数**:
- `code`（必填）：基金代码
- `--since <date>`（可选）：开始日期 YYYY-MM-DD，默认最近 3 年
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb dividends 021248

日期         每份分红    当日净值
───────────────────────────────────
2026-06-18   0.1063     1.0188

共 1 条记录
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "dividends",
  "timestamp": "2026-06-21T09:26:10.759Z",
  "data": [
    { "date": "2026-06-18", "dividend": 0.1063, "nav": 1.0188 }
  ],
  "meta": { "total": 1 }
}
```

**输出示例** (text):

```
日期: 2026-06-18  每份分红: 0.1063  当日净值: 1.0188
```

---

### 1.8 查询基金估值排行（v1）

**对应源码**: `src/api.ts` → `fetchFundValuationRankingCLI()`

**功能**: 获取全市场基金估值排行。

**CLI 命令**:
```bash
jgb ranking [--sort <type>] [--order <order>] [--page <page>] [--size <size>] [--json] [--text]
jgb ranking --sort 3 --size 5
jgb ranking --sort 4 --order desc --page 2 --size 50
```

**参数**:
- `--sort <type>`（可选）：3=估值涨幅(默认), 4=成交热度, 5=实际涨幅
- `--order <order>`（可选）：desc(默认) / asc
- `--page <page>`（可选）：页码，默认 1
- `--size <size>`（可选）：每页条数，默认 20
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb ranking --size 5

排名  代码      名称                    估算涨幅
────────────────────────────────────────────────────────────
1     006281   万家人工智能混合A    +6.21%
2     014162   万家人工智能混合C    +6.21%
3     005300   万家成长优选混合C    +5.77%
4     005299   万家成长优选混合A    +5.77%
5     006270   汇安核心成长混合A    +5.34%

共 23533 条记录，当前第 1 页
还有更多数据，使用 --page 2 查看下一页
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "ranking",
  "timestamp": "2026-06-21T09:44:29.373Z",
  "data": [
    { "rank": 1, "code": "006281", "name": "万家人工智能混合A", "estimateChange": 6.21, "heat": null },
    { "rank": 2, "code": "014162", "name": "万家人工智能混合C", "estimateChange": 6.21, "heat": null }
  ],
  "meta": { "total": 23533, "page": 1, "limit": 3, "hasMore": true }
}
```

**输出示例** (text):

```
1. 006281 万家人工智能混合A +6.21%
2. 014162 万家人工智能混合C +6.21%
3. 005300 万家成长优选混合C +5.77%
```

---

### 1.9 QDII 基金估值查询（v1）

**对应源码**: `src/api.ts` → `fetchQdiiValuationCLI()`

**功能**: 从 Supabase gs_qdii 表获取 QDII 基金的估值数据（作为天天基金数据源的补充）。

**CLI 命令**:
```bash
jgb qdii <code> [--json] [--text]
jgb qdii 016665
jgb qdii 016665 --json
jgb qdii 016665 --text
```

**参数**:
- `code`（必填）：基金代码
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb qdii 016665

基金代码: 016665
────────────────────────────────────────
估算涨跌:    +0.35%
估算时间:    2026-06-16 08:30
数据来源:    supabase_qdii
估值状态:    1
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "qdii",
  "timestamp": "2026-06-21T09:50:00.000Z",
  "data": {
    "code": "016665",
    "gztime": "2026-06-16 08:30",
    "gszzl": 0.35,
    "valuationSource": "supabase_qdii",
    "gzstatus": "1"
  }
}
```

**输出示例** (text):

```
基金代码: 016665
估算涨跌: +0.35%
估算时间: 2026-06-16 08:30
数据来源: supabase_qdii
估值状态: 1
```

**注意**: 此功能需要 Supabase 环境变量配置，且 gs_qdii 表中需要有对应基金的数据。

---

### 1.10 估值数据源精准度检测（v1）

**对应源码**: `src/api.ts` → `fetchBestValuationSourceCLI()`

**功能**: 通过 Edge Function 对比不同数据源在指定日期的估值准确度，返回最佳数据源编号。

**CLI 命令**:
```bash
jgb best-source <code> --jzrq <date> --actual-zzl <number> [--json] [--text]
jgb best-source 005827 --jzrq 2026-06-18 --actual-zzl=-0.60
jgb best-source 005827 --jzrq 2026-06-18 --actual-zzl=-0.60 --json
jgb best-source 005827 --jzrq 2026-06-18 --actual-zzl=-0.60 --text
```

**参数**:
- `code`（必填）：基金代码
- `--jzrq <date>`（必填）：净值日期 YYYY-MM-DD
- `--actual-zzl <number>`（必填）：实际涨跌幅
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb best-source 005827 --jzrq 2026-06-18 --actual-zzl=-0.60

基金代码: 005827
────────────────────────────────────────
最佳数据源:    2
昨日准确度:    是
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "best-source",
  "timestamp": "2026-06-21T10:16:02.039Z",
  "data": {
    "code": "005827",
    "bestSource": 2,
    "isYesterdayAccuracy": true,
    "comparison": [
      { "source": 1, "name": "天天基金", "deviation": 0.85 },
      { "source": 2, "name": "新浪估算2", "deviation": 0.12 },
      { "source": 3, "name": "新浪估算3", "deviation": 0.34 }
    ]
  }
}
```

**输出示例** (text):

```
基金代码: 005827
最佳数据源: 2
昨日准确度: 是
```

**注意**: 此功能需要 Supabase 环境变量配置，且需要部署 best-valuation-source Edge Function。

---


---

## 十五、智能净值确认

### 15.1 智能向前/向后查找净值（v1）

**对应源码**: `app/api/fund.js` → `fetchSmartFundNetValue()`、`fetchSmartFundNetValueBackward()`

**功能**: 从指定日期向前或向后搜索最近的有效净值日期（跳过非交易日），最多搜索30天。

**CLI 命令建议**:
```
fund nav <code> --date 2026-06-16            # 从该日起向后查找
fund nav <code> --date 2026-06-16 --backward  # 从该日起向前查找
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund nav",
  "data": {
    "fundCode": "005827",
    "requestedDate": "2026-06-16",
    "direction": "forward",
    "foundDate": "2026-06-16",
    "nav": 1.2345,
    "searchedDays": 1
  }
}
```

---


---

## 十六、基金确认天数查询

### 16.1 查询申赎确认天数（v1）

**对应源码**: `app/api/fund.js` → `fetchFundConfirmDays()`

**功能**: 查询基金的申购赎回确认天数（T+1 或 T+2），通过天天基金移动端 API 获取。

**CLI 命令建议**:
```
fund confirm-days <code>
```

**输出**: 确认天数（1=T+1, 2=T+2）

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund confirm-days",
  "data": {
    "fundCode": "005827",
    "confirmDays": 1,
    "description": "T+1 确认"
  }
}
```

---


---

