---
sidebar_position: 5
title: 5. 交易管理与定投计划
sidebar_label: 5. 交易与定投
---

# 5. 交易管理与定投计划

## 四、交易管理

### 4.1 买入/卖出（即时交易）（v1 暂不开放）

**对应源码**: `src/portfolio.ts` → `trade()`

**功能**: 记录买入或卖出操作，自动计算加权平均成本和新份额。

**CLI 命令**:
```bash
jgb trade buy <code> --amount <amount> [--fee-rate <rate>] [--date <date>] [--after-3pm] [--group <group>] [--json] [--text]
jgb trade sell <code> --share <share> [--fee-rate <rate>] [--date <date>] [--after-3pm] [--group <group>] [--json] [--text]
jgb trade buy 005827 --amount 10000 --fee-rate 0.15 --date 2026-06-16
jgb trade sell 005827 --share 500 --date 2026-06-16
jgb trade buy 005827 --amount 10000 --after-3pm  # 15点后提交，自动顺延确认日
```

**参数**:
- `type`（必填）：buy / sell
- `code`（必填）：基金代码
- `--amount <amount>`（买入时必填）：买入金额
- `--share <share>`（卖出时必填）：卖出份额
- `--fee-rate <rate>`（可选）：手续费率（百分比）
- `--date <date>`（可选）：交易日期 YYYY-MM-DD
- `--after-3pm`（可选）：15:00 后提交（自动顺延确认日）
- `--group <group>`（可选）：分组 ID 或分组名称
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb trade buy 005827 --amount 10000 --fee-rate 0.15 --date 2026-06-16

交易成功
基金:        易方达蓝筹精选混合 (005827)
类型:        买入
金额:        ¥10000.00
手续费率:    0.15%
成交净值:    1.5258
成交日期:    2026-06-18
确认份额:    6544.10
新持仓份额:  14644.50
新成本净值:  1.3647
确认日期:    2026-06-22
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "trade buy",
  "data": {
    "action": "trade_buy",
    "fundCode": "005827",
    "fundName": "易方达蓝筹精选混合",
    "amount": 10000,
    "feeRate": 0.15,
    "nav": 1.5258,
    "navDate": "2026-06-18",
    "confirmDate": "2026-06-22",
    "tradeShare": 6544.10,
    "newShare": 14644.50,
    "newCost": 1.3647,
    "pending": false,
    "transactionId": "tx-a1b2c3d4"
  }
}
```

**输出示例** (text):

```
交易成功
基金: 易方达蓝筹精选混合 (005827)
类型: 买入
金额: 10000
手续费率: 0.15%
成交净值: 1.5258
成交日期: 2026-06-18
确认份额: 6544.10
新持仓份额: 14644.50
新成本净值: 1.3647
确认日期: 2026-06-22
```

---

### 4.2 查看交易记录（v1）

**对应源码**: `src/portfolio.ts` → `listTransactions()`

**功能**: 列出指定基金的历史交易记录。

**CLI 命令**:
```bash
jgb transactions <code> [--group <group>] [--json] [--text]
jgb transactions 005827
jgb transactions 005827 --group 长期持有
jgb transactions 005827 --json
jgb transactions 005827 --text
```

**参数**:
- `code`（必填）：基金代码
- `--group`（可选）：按分组 ID 或唯一分组名称筛选交易记录
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb transactions 005827

📋 基金 005827 的交易记录:
----------------------------------------------------------------------
ID      | 类型 | 金额 (元)  | 份额     | 价格    | 日期       | 时间戳
----------------------------------------------------------------------
abc123  | 买入 | 10000      | 6544.10  | 1.5258  | 2026-06-18 | 1718505000000
def456  | 卖出 | 152.58     | 100.00   | 1.5258  | 2026-06-18 | 1718505000000
----------------------------------------------------------------------
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "transactions",
  "data": [
    {
      "id": "abc123",
      "type": "buy",
      "amount": 10000,
      "share": 6544.10,
      "price": 1.5258,
      "date": "2026-06-18",
      "timestamp": 1718505000000
    }
  ],
  "meta": { "total": 2 }
}
```

**输出示例** (text):

```
2026-06-18 买入 金额:10000 份额:6544.10 价格:1.5258
2026-06-18 卖出 金额:152.58 份额:100.00 价格:1.5258
```

---

### 4.3 删除交易记录（v1 暂不开放）

**对应源码**: `src/portfolio.ts` → `removeTransaction()`

**功能**: 删除指定的交易记录。

**CLI 命令**:
```bash
jgb transaction-remove <transactionId> [--json] [--text]
jgb transaction-remove abc123
jgb transaction-remove abc123 --json
jgb transaction-remove abc123 --text
```

**参数**:
- `transactionId`（必填）：交易记录 ID
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (text):

```
已成功删除交易记录 abc123
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund transactions delete",
  "data": {
    "fundCode": "005827",
    "transactionId": "tx-a1b2c3d4",
    "deleted": true
  }
}
```

---

### 4.4 待处理交易队列（v1 仅查询 list）

**对应源码**: `app/page.jsx` → `processPendingQueue()`

**功能**: 当交易时净值未更新（非交易时段提交），交易自动进入待处理队列；净值更新后自动处理。

**CLI 命令建议**:
```
jgb pending list [--code <code>] [--json] [--text]  # v1：查看待处理交易
# jgb pending process                              # v1 暂不开放：会修改持仓和交易记录
# jgb pending remove <pendingId>                   # v1 暂不开放：会修改待处理队列
```

**输出示例** (`pending list`, table):

```
$ fund pending list

ID                    基金代码   名称                  类型    金额        日期          状态
tx-e5f6g7h8           005827    易方达蓝筹精选混合     买入    10000.00    2026-06-15    等待净值
tx-i9j0k1l2           000001    易方达价值成长混合     买入    5000.00     2026-06-14    等待净值

共 2 笔待处理交易
```

**后续版本输出示例** (`pending process`, json；v1 暂不开放):

```json
{
  "ok": true,
  "command": "fund pending process",
  "data": {
    "processed": 2,
    "skipped": 0,
    "details": [
      { "id": "tx-e5f6g7h8", "fundCode": "005827", "status": "executed", "nav": 1.2345, "navDate": "2026-06-16" },
      { "id": "tx-i9j0k1l2", "fundCode": "000001", "status": "executed", "nav": 1.1500, "navDate": "2026-06-16" }
    ]
  }
}
```

---


---

## 五、定投计划（DCA）

### 5.1 创建/编辑定投计划（v1 暂不开放）

**对应源码**: `app/page.jsx` → `handleAction('dca')`

**功能**: 为基金创建定期定额投资计划，支持设置定投周期和金额。定投计划存储在 dcaPlans 中，按作用域（全局/分组）隔离。

**CLI 命令建议**:
```
fund dca set <code> --amount 1000 --period weekly --day monday
fund dca set <code> --amount 2000 --period monthly --day 15
fund dca set <code> --amount 1000 --period weekly --group <groupId>
```

**参数**:
- `--amount`：定投金额
- `--period`：weekly / biweekly / monthly
- `--day`：每周几 / 每月几号
- `--group`：作用域（全局或分组）

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund dca set",
  "data": {
    "fundCode": "005827",
    "amount": 1000,
    "period": "weekly",
    "day": "monday",
    "enabled": true,
    "groupId": null
  }
}
```

---

### 5.2 查看定投计划（v1）

**CLI 命令建议**:
```
fund dca list
fund dca list --group <groupId>
```

**输出示例** (table):

```
$ fund dca list

代码       名称                 金额       周期       定投日     状态
005827    易方达蓝筹精选混合    1000.00    每周       周一       启用
110011    某消费混合A          2000.00    每月       15号       启用
000001    某成长混合           500.00     每两周     周三       停用
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund dca list",
  "data": [
    { "fundCode": "005827", "fundName": "易方达蓝筹精选混合", "amount": 1000, "period": "weekly", "day": "monday", "enabled": true, "groupId": null },
    { "fundCode": "110011", "fundName": "某消费混合A", "amount": 2000, "period": "monthly", "day": 15, "enabled": true, "groupId": null },
    { "fundCode": "000001", "fundName": "某成长混合", "amount": 500, "period": "biweekly", "day": "wednesday", "enabled": false, "groupId": null }
  ]
}
```

---

### 5.3 启用/停用定投计划（v1 暂不开放）

**CLI 命令建议**:
```
fund dca enable <code>
fund dca disable <code>
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund dca enable",
  "data": {
    "fundCode": "005827",
    "enabled": true,
    "nextRunDate": "2026-06-22"
  }
}
```

---


---

## 二十一、分红方式管理

### 21.1 设置分红方式（v1 仅查询当前分红方式）

**对应源码**: `app/components/DividendMethodModal.jsx`

**功能**: 设置基金分红处理方式（红利再投资/现金分红）。

**CLI 命令建议**:
```
fund dividend <code>                    # 查看当前分红方式
fund dividend <code> --method reinvest  # 设为红利再投资
fund dividend <code> --method cash      # 设为现金分红
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund dividend",
  "data": {
    "fundCode": "005827",
    "method": "reinvest",
    "methodLabel": "红利再投资",
    "availableMethods": ["reinvest", "cash"]
  }
}
```

---


---

## 二十二、基金转换

### 22.1 记录基金转换（v1 暂不开放）

**对应源码**: `app/components/FundConvertModal.jsx`

**功能**: 记录从一只基金转换到另一只基金的操作（卖出A基金 + 买入B基金）。

**CLI 命令建议**:
```
fund convert --from <codeA> --to <codeB> --share 500 --date 2026-06-16
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund convert",
  "data": {
    "from": {
      "fundCode": "005827",
      "fundName": "易方达蓝筹精选混合",
      "type": "sell",
      "share": 500,
      "nav": 1.2345,
      "amount": 617.25
    },
    "to": {
      "fundCode": "110011",
      "fundName": "某消费混合A",
      "type": "buy",
      "nav": 2.1000,
      "estimatedShare": 293.93
    },
    "date": "2026-06-16",
    "transactionIds": ["tx-conv-001", "tx-conv-002"]
  }
}
```

---


---

