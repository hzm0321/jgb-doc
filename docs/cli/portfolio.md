---
sidebar_position: 4
title: 持仓、自选与流水查询
sidebar_label: 4. 持仓与流水 (portfolio)
---

# 持仓、自选与流水查询

本章收录所有与个人账户相关的状态查询指令，涵盖自选关注池、实时账户持仓资产、自定义分组体系、交易买卖流水、待确认申赎队列、定投执行记录及每日盈亏追踪。所有本章内的命令均严格遵照只读安全原则，能够帮助开发者便捷地将账户投资组合实时对账状态接入个人财务仪表盘或智能分析平台。

---

## 4.1 `jgb portfolio list` —— 查询账户持仓与资产概览

### 语法 (Synopsis)
```bash
jgb portfolio list [options]
# 别名: jgb holding list
```

### 描述 (Description)
获取当前配置或云端账户下已录入的全部公募基金持仓列表。系统会自动结合当时最新的实时盘中估值（或官方净值），动态计算各基金的当前持仓资产总值、持有盈亏（浮动盈亏）与盈亏比例，并在汇总行展示账户总持仓与总盈亏。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--group <name>` | string | 否 | 按自定义分组名称筛选（如 `--group "长线精选"`） |
| `--sort <field>` | string | 否 | 排序指标：`value`（持仓市值[默认]）、`profitPercent`（盈亏率）、`todayChange`（今日估盈）|
| `--order <dir>`  | string | 否 | 排序方向：`desc`（从高到低[默认]）、`asc`（从低到高） |
| `--format <type>`| string | 否 | 支持 `table`（默认）、`json`、`text`、`csv` |

### 使用示例 (Examples)
```bash
# 查询全部持仓资产清单
jgb portfolio list

# 仅查看“养老定投”分组内的持仓，并输出 JSON 数据
jgb portfolio list --group "养老定投" --format json
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb portfolio list

账户持仓概览 (当前估算总值: ¥158,450.00 | 浮动盈亏: +¥12,450.00 [+8.53%])
代码     基金名称               持有份额    成本净值   最新估值   持仓市值      浮动盈亏 (率)
──────────────────────────────────────────────────────────────────────────────────────────
005827   易方达蓝筹精选混合     10000.00    1.1500     1.2400     ¥12,400.00    +¥900.00 (+7.83%)
012345   半导体先锋股票 A       50000.00    1.5000     1.8560     ¥92,800.00    +¥17,800.00 (+23.73%)
054321   人工智能精选混合 C     25000.00    2.3500     2.1020     ¥52,550.00    -¥6,200.00 (-10.55%)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "portfolio list",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": {
    "summary": {
      "totalValue": 158450.00,
      "totalCost": 146000.00,
      "totalProfit": 12450.00,
      "totalProfitPercent": 8.53
    },
    "holdings": [
      {
        "code": "005827",
        "name": "易方达蓝筹精选混合",
        "shares": 10000.00,
        "costNav": 1.1500,
        "currentNav": 1.2400,
        "marketValue": 12400.00,
        "profit": 900.00,
        "profitPercent": 7.83
      }
    ]
  }
}
```

---

## 4.2 `jgb watchlist list` —— 查询自选关注池

### 语法 (Synopsis)
```bash
jgb watchlist list [options]
```

### 描述 (Description)
获取账户中加入自选关注名单（不含持有份额或虚拟模拟观察）的基金名录及其当前实时的涨跌行情，帮助用户快速追踪潜在调仓备选标的的走势。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--group <name>` | string | 否 | 筛选属于特定自选分组的标的 |
| `--sort <field>` | string | 否 | 排序指标：`gszzl`（估算涨跌幅[默认]）、`code` |
| `--format <type>`| string | 否 | 支持 `table`（默认）、`json`、`text` |

### 使用示例 (Examples)
```bash
jgb watchlist list --sort gszzl
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb watchlist list

自选关注池 (共 4 只)
代码     基金名称               最新净值   实时估值   今日涨幅    分红类型
──────────────────────────────────────────────────────────────────
016665   纳斯达克100 ETF 联接   1.5820     1.6040     +1.39%      QDII
000001   华夏成长混合           1.1200     1.1150     -0.45%      混合型
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "watchlist list",
  "data": [
    { "code": "016665", "name": "纳斯达克100 ETF 联接", "currentNav": 1.5820, "estimateNav": 1.6040, "estimateChangePercent": 1.39 }
  ]
}
```

---

## 4.3 `jgb group list` —— 查询分组体系与成员

### 语法 (Synopsis)
```bash
jgb group list [options]
```

### 描述 (Description)
列出当前账户定义的所有自定义分类分组（如“长期持有”、“宽基指数”、“短线网格”等），并汇总各分组下包含的标的数量以及各个分组在持仓资产中的占比结构。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--type <type>`  | string | 否 | 过滤分组归属：`holding`（持仓分组）、`watchlist`（自选分组）、`all`（默认） |
| `--with-members` | flag   | 否 | 同时在输出中展开列示各分组所包含的详细基金代码与名称 |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
# 查看所有分组结构并展开成员
jgb group list --with-members
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb group list --with-members

分组名称     类型       包含基金数   持仓市值       资产占比   成员明细
──────────────────────────────────────────────────────────────────────────
长期持有     持仓分组   2            ¥105,200.00    66.39%     005827, 012345
科技前沿     持仓分组   1            ¥53,250.00     33.61%     054321
观察自选     自选分组   4            --             --         016665, 000001等
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "group list",
  "data": [
    {
      "groupId": "grp-01",
      "name": "长期持有",
      "type": "holding",
      "fundCount": 2,
      "totalValue": 105200.00,
      "weight": 66.39,
      "members": [
        { "code": "005827", "name": "易方达蓝筹精选混合" },
        { "code": "012345", "name": "半导体先锋股票 A" }
      ]
    }
  ]
}
```

---

## 4.4 `jgb tag list` 与 `jgb tag filter` —— 标签查询与筛选

### 语法 (Synopsis)
```bash
# 查询已定义的标签列表
jgb tag list [options]

# 按指定标签筛选符合条件的基金
jgb tag filter <tagName> [options]
```

### 描述 (Description)
极度灵活的多维标签系统支持。`jgb tag list` 用于查看账户中所有自定义标签（如 `#重仓茅台`、`#经理离职`、`#T+1确认`）及其挂载标的数；`jgb tag filter` 则可迅速反查绑定了某标签的资产组合名录。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<tagName>` | string | 是 | 标签名字串（仅对 `tag filter` 必填，如 `价值成长`） |
| `--format <type>`| string | 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
# 列出系统内全部自定义标签
jgb tag list

# 查找被打上了“高波动”标签的所有基金
jgb tag filter "高波动" --format json
```

### 输出格式 (Output)
**常规表格输出 (`jgb tag list`)**：
```
标签 ID   标签名称      挂载基金数   创建时间
────────────────────────────────────────────────
t-001     高波动        3            2026-01-15
t-002     固收打底      2            2026-02-10
t-003     经理明星      5            2026-03-01
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "tag filter",
  "data": {
    "tagName": "高波动",
    "matchedCount": 2,
    "funds": [
      { "code": "012345", "name": "半导体先锋股票A", "tagAddedAt": "2026-04-10" },
      { "code": "054321", "name": "人工智能精选混合C", "tagAddedAt": "2026-05-12" }
    ]
  }
}
```

---

## 4.5 `jgb transactions` —— 交易买卖流水

### 语法 (Synopsis)
```bash
jgb transactions [code] [options]
```

### 描述 (Description)
查询指定单只基金或整个账户的历史买入申购、卖出赎回、红利转投、转换等全部流水记录。展示交易确认确认日期、交易类型、发生金额、成交确认净值、成交份数及服务费等。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `[code]` | string | 否 | 过滤单只特定基金的流水，不传则列出全账户流水 |
| `--type <txnType>`| string| 否 | 交易类型过滤：`buy`（申购买入）、`sell`（赎回卖出）、`dividend`（分红转投） |
| `--since <date>`  | string| 否 | 起始日期（如 `2026-01-01`） |
| `--page <num>`    | number| 否 | 分页页码，默认 `1` |
| `--page-size <n>` | number| 否 | 每页条目数，默认 `20` |

### 使用示例 (Examples)
```bash
# 查询某只基金自今年以来的所有买入操作记录
jgb transactions 005827 --type buy --since 2026-01-01
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb transactions 005827 --type buy

流水流水号      发生日期     类型     成交净值   成交金额 (元)   确认份额 (份)   手续费
─────────────────────────────────────────────────────────────────────────────────
txn-987654    2026-06-16   申购     1.2300     ¥10,000.00    8116.88       ¥15.00
txn-123456    2026-03-10   申购     1.1850     ¥5,000.00     4212.31       ¥7.50
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "transactions",
  "data": [
    {
      "transactionId": "txn-987654",
      "fundCode": "005827",
      "fundName": "易方达蓝筹精选混合",
      "type": "buy",
      "tradeDate": "2026-06-16",
      "nav": 1.2300,
      "amount": 10000.00,
      "shares": 8116.88,
      "fee": 15.00
    }
  ],
  "meta": { "total": 25, "page": 1, "pageSize": 20 }
}
```

---

## 4.6 `jgb pending list` —— 待确认交易队列

### 语法 (Synopsis)
```bash
jgb pending list [options]
```

### 描述 (Description)
针对中国公募基金 T+1/T+2 申赎机制，查询已在账户提交录入、但当前处于“途（在途待确认）”或“等候法定确认日交收”的在途交易流水队列。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--code <code>` | string | 否 | 仅查看指定基金的待确认流水 |
| `--format <type>`| string| 否 | 支持 `table`（默认）、`json`、`text` |

### 使用示例 (Examples)
```bash
jgb pending list
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb pending list

排队单号     基金代码   基金名称           申请类型   申请金额     申请提交日   预计确认日 (T+1)
───────────────────────────────────────────────────────────────────────────────────────
pnd-001    005827     易方达蓝筹精选     申购      ¥10,000.00   2026-07-02   2026-07-03 (今日晚间)
pnd-002    012345     半导体先锋股票 A   赎回      10000.00份   2026-07-03   2026-07-06 (周一)
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "pending list",
  "data": [
    {
      "pendingId": "pnd-001",
      "code": "005827",
      "name": "易方达蓝筹精选混合",
      "type": "buy",
      "amount": 10000.00,
      "submitDate": "2026-07-02",
      "expectedConfirmDate": "2026-07-03",
      "status": "waiting_nav"
    }
  ]
}
```

---

## 4.7 `jgb dca list` —— 智能定投计划查询

### 语法 (Synopsis)
```bash
jgb dca list [options]
```

### 描述 (Description)
查询当前账户所有已建立定投配置（Dollar-Cost Averaging, DCA）计划的概览状态，包括定投周期（按周/按双周/按月）、每次定额扣款金额、当前累计期数与累计投入本金、以及计划当前是否在运行状态。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--status <state>`| string| 否 | 过滤状态：`active`（运行中[默认]）、`paused`（已暂停）、`all` |
| `--format <type>` | string| 否 | 支持 `table`、`json`、`text` |

### 使用示例 (Examples)
```bash
jgb dca list --status active
```

### 输出格式 (Output)
**表格输出 (`--format table`)**：
```
$ jgb dca list

计划编号   基金代码   基金名称           扣款周期     每期定额     累计执行   累计本金     当前状态
──────────────────────────────────────────────────────────────────────────────────────────
dca-01    005827     易方达蓝筹精选     每周四       ¥1,000.00    36期       ¥36,000.00   运行中
dca-02    012345     半导体先锋股票 A   每月15日     ¥3,000.00    12期       ¥36,000.00   运行中
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "dca list",
  "data": [
    {
      "planId": "dca-01",
      "code": "005827",
      "name": "易方达蓝筹精选混合",
      "frequency": "weekly",
      "frequencyDay": "Thursday",
      "amountPerPeriod": 1000.00,
      "executedPeriods": 36,
      "totalInvested": 36000.00,
      "status": "active"
    }
  ]
}
```

---

## 4.8 `jgb earnings` —— 每日盈亏与账户收益统计

### 语法 (Synopsis)
```bash
jgb earnings [code] [options]
```

### 描述 (Description)
按日追踪指定基金或整个账户在历史具体日期范围内的浮动盈亏额记录（日盈亏金额、日盈亏百分比、当日持仓市值快照），可清晰查看特定日期市场波动对个人资金盘造成的绝对数额影响。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `[code]` | string | 否 | 传对应基金代码则查看单基金日盈亏；不传或传 `all` 则看全账户持仓汇总日盈亏 |
| `--days <num>`    | number| 否 | 查看最近的连续多少个交易日记录，默认值 `7` |
| `--from <date>`   | string| 否 | 明确指定起始追踪日期 |
| `--format <type>` | string| 否 | 支持 `table`（默认）、`json`、`text` |

### 使用示例 (Examples)
```bash
# 查看全账户最近 5 个交易日的总盈亏变化
jgb earnings --days 5

# 查看特定重仓基金在近 1 个月的日利变动，输出 JSON 供归因分析
jgb earnings 005827 --days 30 --format json
```

### 输出格式 (Output)
**全账户汇总表格 (`--format table`)**：
```
$ jgb earnings --days 5

账户每日盈亏追踪 (近 5 个交易日)
日期         账户总资产     当日发生盈亏额 (元)   当日总资产收益率   上证参考
──────────────────────────────────────────────────────────────────────────
2026-07-03   ¥158,450.00    +¥1,250.00           +0.80%           -0.43%
2026-07-02   ¥157,200.00    -¥820.00             -0.52%           -0.60%
2026-07-01   ¥158,020.00    +¥2,100.00           +1.35%           +0.88%
2026-06-30   ¥155,920.00    +¥450.00             +0.29%           +0.12%
2026-06-29   ¥155,470.00    -¥310.00             -0.20%           -0.18%
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "earnings",
  "data": {
    "scope": "account_total",
    "days": 5,
    "records": [
      {
        "date": "2026-07-03",
        "totalAssets": 158450.00,
        "dailyProfit": 1250.00,
        "dailyProfitPercent": 0.80,
        "benchmarkChange": -0.43
      }
    ]
  }
}
```

---

## 4.9 `jgb dividend-mode` —— 分红方式设置状态查询

### 语法 (Synopsis)
```bash
jgb dividend-mode <code> [options]
```

### 描述 (Description)
查询当前账户持有基金所设定的收益分红处理方式（现金分红与红利再投资转份额），协助计算复利增量数据。

### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | 6 位基金代码 |

### 使用示例 (Examples)
```bash
jgb dividend-mode 005827
```

### 输出格式 (Output)
**纯文本摘要输出**：
```
基金代码: 005827
基金名称: 易方达蓝筹精选混合
分红方式: 红利再投资 (Reinvest)
生效日期: 2025-06-15
说明:     派发分红金额将自动按除息日净值折算为新份额累加至持仓中，免收申购手续费。
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "dividend-mode",
  "data": {
    "code": "005827",
    "name": "易方达蓝筹精选混合",
    "mode": "reinvest",
    "modeText": "红利再投资",
    "effectiveDate": "2025-06-15"
  }
}
```
