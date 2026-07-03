---
sidebar_position: 6
title: 6. 每日收益与排序统计
sidebar_label: 6. 收益与统计
---

# 6. 每日收益与排序统计

## 八、每日收益追踪

### 8.1 查看基金每日收益明细（v1）

**对应源码**: `app/components/FundDailyEarnings.jsx`、`app/lib/dailyEarnings.js`

**功能**: 记录并展示每只基金的每日收益（金额和收益率），按日期追踪。

**CLI 命令建议**:
```
fund earnings <code>                    # 查看某基金每日收益
fund earnings <code> --days 30          # 最近30天
fund portfolio earnings                 # 组合总每日收益
```

**输出示例** (table):

```
$ fund earnings 005827 --days 5

基金: 易方达蓝筹精选混合 (005827)
日期         收益(元)    收益率    本金快照
2026-06-10   +23.45      +0.19%    12345.00
2026-06-11   -15.20      -0.12%    12345.00
2026-06-12   +8.10       +0.07%    12345.00
2026-06-13   +45.67      +0.37%    12345.00
2026-06-16   +56.80      +0.46%    12345.00
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund earnings",
  "data": {
    "fundCode": "005827",
    "fundName": "易方达蓝筹精选混合",
    "earnings": [
      { "date": "2026-06-10", "earnings": 23.45, "rate": 0.19, "baseCostAmount": 12345.00 },
      { "date": "2026-06-11", "earnings": -15.20, "rate": -0.12, "baseCostAmount": 12345.00 },
      { "date": "2026-06-13", "earnings": 45.67, "rate": 0.37, "baseCostAmount": 12345.00 }
    ]
  }
}
```

---

### 8.2 收益日历（v1）

**对应源码**: `app/components/MyEarningsCalendarPage.jsx`

**功能**: 以日历形式展示每日收益情况。

**CLI 命令建议**:
```
fund earnings calendar                  # 当月收益日历
fund earnings calendar --month 2026-06
```

**输出示例** (table):

```
$ fund earnings calendar --month 2026-06

2026年6月 收益日历
──────────────────────────────────────
日     一     二     三     四     五     六
                  1      2      3      4      5      6      7
               +12.30  +8.50  -5.20  +15.80  --     --     --
8      9      10     11     12     13     14
+22.10 +18.50 +23.45 -15.20 +8.10  +45.67 --

月累计收益: +132.12  交易日: 9天  盈利日: 7天  亏损日: 2天
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund earnings calendar",
  "data": {
    "month": "2026-06",
    "days": [
      { "date": "2026-06-02", "earnings": 12.30, "isTradingDay": true },
      { "date": "2026-06-03", "earnings": 8.50, "isTradingDay": true },
      { "date": "2026-06-07", "earnings": null, "isTradingDay": false }
    ],
    "summary": {
      "totalEarnings": 132.12,
      "tradingDays": 9,
      "profitDays": 7,
      "lossDays": 2
    }
  }
}
```

---


---

## 九、排序与筛选

### 9.1 基金列表排序（v1）

**对应源码**: `app/page.jsx` → 排序逻辑、`app/constants/index.js` → `DEFAULT_SORT_RULES`

**功能**: 支持多维度排序，默认/估算涨幅/最新涨幅/持仓金额/持仓占比/当日收益/昨日收益/持有天数/持有收益/估算收益/持仓成本/近1周/近1月/近3月/近6月/近1年/自添加来/连涨跌天数/基金标签/基金名称。

**CLI 命令建议**:
```
fund list --sort yield                  # 按估算涨幅排序
fund list --sort holding                # 按持有收益排序
fund list --sort last1Week --order asc  # 近1周涨幅升序
fund list --group <groupId> --sort yesterdayProfit
```

**排序键**:
- `default`（默认/添加顺序）、`yield`、`yesterdayIncrease`、`holdingAmount`、`holdingRatio`、`todayProfit`、`yesterdayProfit`、`holdingDays`、`holding`、`estimateProfit`、`holdingCost`、`last1Week`、`last1Month`、`last3Months`、`last6Months`、`last1Year`、`sinceAddedChangePercent`、`consecutiveTrend`、`tags`、`name`

**输出示例** (table):

```
$ fund list --sort yield --limit 5

代码       名称                    估算涨跌    最新净值    估算净值
012345    某科技混合A             +5.23%      1.8700      1.9678
007890    某新能源ETF联接A        +4.88%      1.5600      1.6362
003456    某半导体芯片ETF联接A    +4.56%      2.1500      2.2480
005827    易方达蓝筹精选混合      +0.45%      1.2345      1.2400
000001    易方达价值成长混合      +0.12%      1.1500      1.1514
```

---


---

## 二十三、收益汇总视图

### 23.1 分组收益汇总（v1）

**对应源码**: `app/components/GroupSummary.jsx`、`app/hooks/useSummaryCalculations.js`

**功能**: 汇总所有有持仓的分组，展示整体持仓和收益情况。

**CLI 命令建议**:
```
fund summary                            # 全局收益汇总
fund summary --group <groupId>          # 分组收益汇总
```

**输出**:
- 总持仓金额、总收益金额、总收益率
- 各分组明细（持仓金额、收益、占比）

**输出示例** (table):

```
$ fund summary

投资组合收益汇总
══════════════════════════════════════════
总持仓金额:    ¥168,940.00
总收益金额:    ¥6,890.00
总收益率:      +4.25%

分组明细:
名称          基金数    持仓金额      收益        收益率    占比
全局持仓       3        ¥32,510.00   ¥410.00     +1.28%   19.2%
我的A组        5        ¥52,340.00   ¥1,240.00   +2.43%   31.0%
稳健组合       3        ¥31,200.00   ¥2,850.00   +10.04%  18.5%
进取组合       8        ¥52,890.00   ¥2,390.00   +4.73%   31.3%
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund summary",
  "data": {
    "totalAmount": 168940.00,
    "totalProfit": 6890.00,
    "profitRate": 4.25,
    "groups": [
      { "name": "全局持仓", "groupId": null, "fundCount": 3, "amount": 32510.00, "profit": 410.00, "profitRate": 1.28, "ratio": 19.2 },
      { "name": "我的A组", "groupId": "grp-a1b2c3d4", "fundCount": 5, "amount": 52340.00, "profit": 1240.00, "profitRate": 2.43, "ratio": 31.0 }
    ]
  }
}
```

---


---

## 二十四、批量操作

### 24.1 批量添加基金（v1 暂不开放）

**CLI 命令建议**:
```
fund add 000001 000002 000003
fund add --file codes.txt
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund add",
  "data": {
    "added": [
      { "code": "000001", "name": "易方达价值成长混合", "status": "added" },
      { "code": "000002", "name": "某成长混合A", "status": "added" },
      { "code": "000003", "name": null, "status": "not_found" }
    ],
    "totalRequested": 3,
    "totalAdded": 2,
    "totalSkipped": 1
  }
}
```

---

### 24.2 批量删除基金（v1 暂不开放）

**CLI 命令建议**:
```
fund remove 000001 000002
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund remove",
  "data": {
    "removed": ["000001", "000002"],
    "totalRemoved": 2,
    "alsoCleared": {
      "holdings": 1,
      "transactions": 3,
      "dcaPlans": 1
    }
  }
}
```

---


---

