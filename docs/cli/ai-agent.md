---
sidebar_position: 8
title: 8. 面向 AI Agent 输出规范
sidebar_label: 8. AI Agent 规范
---

# 8. 面向 AI Agent 输出规范

## 附录 A：面向 AI Agent 的输出规范

为了让 OpenClaw 等 AI Agent 工具能可靠地解析和决策，CLI 在设计层面需要额外关注以下几个维度。

### A.1 全局 `--format` 输出格式参数

所有读取类命令必须支持 `--format` 参数，AI Agent 应始终使用 `--format json` 调用。

```
fund info 000001 --format json          # 结构化 JSON（AI Agent 默认使用）
fund info 000001 --format jsonl         # 流式 JSON Lines（适用于 watch/stream 场景）
fund info 000001 --format csv           # CSV，便于管道组合
fund info 000001 --format table         # 人类可读的对齐表格（默认）
fund info 000001 --format text          # 纯文本摘要，适合 LLM 直接消费
```

**设计要点**:

- `json`：输出为单个完整 JSON 对象，所有数值保持原始类型（不转字符串）
- `jsonl`：列表命令每行一个 JSON 对象，无外层包裹，适合流式处理
- `csv`：带表头的标准 CSV
- `table`：人类可读的对齐表格，含表头
- `text`：一段自然语言摘要，每个字段用 `key: value` 格式，末尾无多余标点。这是为 LLM 上下文优化的格式，省去解析 JSON 的步骤

```
# text 格式输出示例
基金名称: 易方达蓝筹精选混合
代码: 005827
最新净值: 1.2345
净值日期: 2026-06-13
昨日涨跌幅: +0.52%
估算净值: 1.2400
估算涨跌幅: +0.45%
估算时间: 2026-06-16 15:00
数据来源: fundgz
```

---

### A.2 统一的 JSON 输出信封

所有命令的 JSON 输出遵循统一信封格式，使 AI Agent 可以用同一段代码解析任意命令的结果。

**成功响应**:
```json
{
  "ok": true,
  "command": "fund info",
  "version": "2.2.1",
  "timestamp": "2026-06-16T10:30:00+08:00",
  "data": { ... }
}
```

**列表响应**（附带分页元数据）:
```json
{
  "ok": true,
  "command": "fund list",
  "version": "2.2.1",
  "timestamp": "2026-06-16T10:30:00+08:00",
  "data": [ ... ],
  "meta": {
    "total": 128,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

**错误响应**:
```json
{
  "ok": false,
  "command": "fund info",
  "error": {
    "code": "FUND_NOT_FOUND",
    "message": "基金代码 999999 不存在",
    "details": null
  }
}
```

**关键约定**:
- `ok` 字段始终存在，AI Agent 可直接用 `ok` 判断命令是否成功
- `error.code` 使用大写蛇形常量，便于 switch/case 匹配
- `error.message` 是面向人类的中文描述
- `data` 类型与命令语义一致：查询单个实体为 object，列表为 array
- `meta.total` 让 AI Agent 知道是否有更多数据，无需猜测

---

### A.3 全局退出码规范

AI Agent 通过进程退出码快速判断结果，无需解析 stdout/stderr。

| 退出码 | 含义 | AI Agent 处理方式 |
|--------|------|-------------------|
| 0 | 成功 | 继续解析 JSON data |
| 1 | 一般错误（网络超时、数据源异常等） | 读取 error.code 决定是否重试 |
| 2 | 参数错误（缺必填参数、格式不合法） | 不重试，修正参数后重新调用 |
| 3 | 认证失败（token 过期、未登录） | 触发重新认证流程 |
| 4 | 资源不存在（基金代码无效、分组ID不存在） | 不重试 |
| 5 | 限流（每日 OCR 上限等） | 等待后重试或放弃 |

---

### A.4 `--fields` 字段投影与 `--compact` 精简输出

AI Agent 经常只需要部分字段。全局支持字段投影可以显著减少 token 消耗。

```
fund info 000001 --format json --fields code,name,dwjz,gszzl
```

输出:
```json
{
  "ok": true,
  "data": {
    "code": "000001",
    "name": "易方达蓝筹精选混合",
    "dwjz": 1.2345,
    "gszzl": 0.45
  }
}
```

**`--compact` 模式**: 去掉 JSON 中的 null 字段和空数组，进一步压缩输出。

```
fund list --format json --compact --fields code,name,dwjz,gszzl
```

---

### A.5 字段类型一致性与枚举约定

AI Agent 需要对字段类型有稳定预期。所有命令输出的同名字段必须保持一致的类型和格式。

**字段命名与类型公约**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `code` | `string` | 基金代码，始终为字符串（不要转成数字） | `"005827"` |
| `name` | `string` | 基金/指数名称 | `"易方达蓝筹精选混合"` |
| `dwjz` | `number\|null` | 最新单位净值 | `1.2345` |
| `jzrq` | `string\|null` | 净值日期 YYYY-MM-DD | `"2026-06-13"` |
| `gsz` | `number\|null` | 估算净值 | `1.2400` |
| `gszzl` | `number\|null` | 估算涨跌幅（百分比值，1.23 = +1.23%） | `0.45` |
| `zzl` | `number\|null` | 昨日涨跌幅（百分比值） | `-0.32` |
| `amount` | `number\|null` | 持仓金额（人民币） | `12345.67` |
| `share` | `number\|null` | 持有份额 | `10000.00` |
| `cost` | `number\|null` | 成本净值 | `1.2000` |
| `date` | `string` | 日期字段，统一 YYYY-MM-DD | `"2026-06-16"` |
| `timestamp` | `number` | Unix 毫秒时间戳 | `1718505600000` |
| `groupId` | `string\|null` | 分组 ID | `"abc-123"` |
| `tagId` | `string` | 标签 ID（UUID） | `"550e8400-..."` |

**核心约定**:
- 所有金额字段统一保留 2 位小数，净值字段保留 4 位小数
- 百分比字段存储原始百分比数值（0.45 表示 +0.45%），不存储 0.0045 这样的小数
- 涨跌方向用正负数表示，不再额外加 `+` 或 `%` 符号（格式化由展示层处理）
- 布尔字段以 `true/false` 输出，不使用 `0/1` 或 `"是"/"否"`

---

### A.6 列表命令的分页与限制

所有返回列表的命令必须支持分页，避免 AI Agent 一次性拿到海量数据。

```
fund list --page 1 --limit 20
fund history 005827 --from 2026-01-01 --to 2026-06-16 --limit 100
fund ranking --page 2 --limit 50
```

JSON 输出的 `meta` 中包含分页信息：

```json
{
  "meta": {
    "total": 128,
    "page": 2,
    "limit": 50,
    "hasMore": true,
    "nextPage": 3
  }
}
```

`--limit 0` 或 `--no-limit` 表示返回全部（AI Agent 应谨慎使用，大数据集可能超 token 限制）。

---

### A.7 `--filter` 通用过滤参数

AI Agent 需要在不写额外管道的情况下筛选数据。

```
fund list --filter "gszzl > 1.0"                     # 估算涨幅 > 1%
fund list --filter "amount > 10000"                   # 持仓金额 > 1万
fund holdings 005827 --filter "weight > 5%"           # 重仓股占比 > 5%
fund transactions list --filter "type == buy"         # 仅买入记录
fund transactions list --filter "date >= 2026-06-01"  # 6月以来
```

**过滤语法**:
- 字段名 + 比较运算符 + 值：`field op value`
- 支持 `==`, `!=`, `>`, `>=`, `<`, `<=`, `contains`, `startswith`
- 多个条件用 `&&`（且）和 `||`（或）组合
- 字符串值用引号包裹，数值直接写

---

### A.8 `fund describe` 自描述元数据命令

AI Agent 在未知环境中应该能通过一个命令获取 CLI 的完整能力描述。

```
fund describe                              # 输出完整命令树和所有参数
fund describe --command "fund info"        # 输出单个命令的详细参数文档
fund describe --schema                     # 输出所有命令的输入输出 JSON Schema
fund describe --schema --command "fund info"
```

**`fund describe` 输出示例**:
```json
{
  "ok": true,
  "data": {
    "name": "fund-cli",
    "version": "2.2.1",
    "commands": [
      {
        "name": "info",
        "description": "查询基金实时数据（估值 + 净值）",
        "args": [
          { "name": "code", "type": "string", "required": true, "description": "基金代码" }
        ],
        "options": [
          { "name": "--source", "type": "number", "default": 1, "description": "数据源 (1=天天基金, 2/3=新浪)" },
          { "name": "--format", "type": "string", "default": "table", "enum": ["json","jsonl","csv","table","text"] }
        ],
        "outputSchema": {
          "type": "object",
          "properties": {
            "code": { "type": "string" },
            "name": { "type": "string" },
            "dwjz": { "type": ["number","null"], "description": "最新单位净值" },
            "gszzl": { "type": ["number","null"], "description": "估算涨跌幅(%)" }
          }
        }
      }
    ]
  }
}
```

这让 AI Agent 可以在首次调用时学习全部命令签名，后续调用无需猜测参数。

---

### A.9 错误信息中包含恢复建议

AI Agent 依赖错误信息决定下一步行动。错误对象应包含 `suggestion` 字段。

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_EXPIRED",
    "message": "登录已过期",
    "suggestion": "请执行 fund login --email <your-email> 重新登录"
  }
}
```

```json
{
  "ok": false,
  "error": {
    "code": "FUND_NOT_FOUND",
    "message": "基金代码 999999 不存在",
    "suggestion": "请先执行 fund search 999999 确认基金代码是否正确"
  }
}
```

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "今日 OCR 识别次数已达上限 (5/5)",
    "suggestion": "请明日再试，或直接使用 fund add <code> 手动添加基金代码"
  }
}
```

---

### A.10 写操作命令的确认与幂等性

**写操作（mutating commands）的 JSON 输出应返回操作结果摘要**:

```json
{
  "ok": true,
  "data": {
    "action": "trade_buy",
    "fundCode": "005827",
    "amount": 10000,
    "newShare": 8123.45,
    "newCost": 1.2310,
    "pending": false,
    "transactionId": "tx-abc-123"
  }
}
```

**`--dry-run` 模式**: 写操作支持 dry-run，AI Agent 可先验证再执行。

```
fund trade buy 005827 --amount 10000 --dry-run
```

```json
{
  "ok": true,
  "data": {
    "dryRun": true,
    "preview": {
      "currentShare": 7500.00,
      "estimatedNewShare": 8123.45,
      "estimatedNewCost": 1.2310,
      "estimatedAmount": 10000.00
    }
  }
}
```

**`--idempotency-key` 幂等键**: 对于交易等敏感写操作，支持幂等键防止重复提交。

```
fund trade buy 005827 --amount 10000 --idempotency-key "buy-20260616-001"
```

---

### A.11 `--watch` 实时监听模式

AI Agent 可能需要持续监控基金净值变化。`--watch` 模式以 JSONL 流式输出增量数据。

```
fund info 005827 --watch --interval 60 --format jsonl
```

每 60 秒输出一行 JSON：

```jsonl
{"timestamp":"2026-06-16T09:31:00+08:00","code":"005827","dwjz":1.2345,"gsz":1.2400,"gszzl":0.45,"changed":true}
{"timestamp":"2026-06-16T09:32:00+08:00","code":"005827","dwjz":1.2345,"gsz":1.2410,"gszzl":0.53,"changed":true}
{"timestamp":"2026-06-16T09:33:00+08:00","code":"005827","dwjz":1.2345,"gsz":1.2410,"gszzl":0.53,"changed":false}
```

`changed: false` 让 AI Agent 知道数据未变化，可跳过处理。

---

### A.12 `--pipe` 管道友好设计

CLI 输出支持与其他命令管道组合，AI Agent 可以构建复合查询。

```bash
# 获取所有持仓基金的实时信息
fund holding list --format json | jq -r '.data[].code' | while read code; do
  fund info "$code" --format json --fields code,name,gszzl,amount
done

# 查找今日涨幅 > 2% 的持仓基金
fund list --format json --filter "gszzl > 2.0" --fields code,name,gszzl
```

为此需要支持：
- `--no-header`：列表输出不包含 JSON 信封（直接输出 data 数组），便于管道下游 `jq` 处理
- `--quiet` / `-q`：禁止 stderr 的进度提示和日志输出
- 退出码与 JSON 输出的 `ok` 字段始终一致

---

### A.13 补充的命令级设计规范

以下规范应贯穿到前面各功能模块的具体命令设计中：

**1) 每个查询命令都返回 `updatedAt` 时间戳**:

AI Agent 需要知道数据的新鲜度，避免基于过时数据做决策。

```json
{
  "data": {
    "code": "005827",
    "dwjz": 1.2345,
    "updatedAt": "2026-06-16T09:30:00+08:00",
    "dataSource": "fundgz",
    "stale": false
  }
}
```

`stale: true` 表示数据来自缓存且可能过期。

**2) 金额输出始终使用数字，格式化交给展示层**:

JSON 中 `"amount": 12345.67` 而非 `"amount": "¥12,345.67"`。表格模式中才使用 `¥12,345.67` 格式。

**3) 列表命令返回 `summary` 聚合行**:

```json
{
  "data": [ ... ],
  "summary": {
    "totalAmount": 123456.78,
    "totalProfit": 5678.90,
    "profitRate": 4.83,
    "count": 15
  }
}
```

AI Agent 无需遍历全部数据即可获得概览。

**4) `fund help` 子命令与 `--explain` 模式**:

```
fund help info          # 等价于 fund describe --command "fund info"
fund info 000001 --explain  # 输出结果后附加一段说明，解释每个字段的含义
```

`--explain` 模式在 JSON 中追加 `_explain` 字段：

```json
{
  "data": { "dwjz": 1.2345, "gszzl": 0.45 },
  "_explain": {
    "dwjz": "最新单位净值，即基金每份的净资产价值，通常在每晚更新",
    "gszzl": "盘中估算涨跌幅(%)，正值代表估算上涨，负值代表估算下跌"
  }
}
```

---

### A.14 现有各模块命令需补充的 AI 友好参数汇总

在实现各功能模块时，以下参数应作为每个读取类命令的公共参数注入：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--format` | `string` | `table` | 输出格式: json/jsonl/csv/table/text |
| `--fields` | `string` | 全部字段 | 逗号分隔的字段投影列表 |
| `--compact` | `boolean` | `false` | 去掉 null 和空值字段 |
| `--page` | `number` | `1` | 页码（列表命令） |
| `--limit` | `number` | `20` | 每页条数（列表命令） |
| `--filter` | `string` | 无 | 过滤表达式 |
| `--sort` | `string` | 取决于命令 | 排序字段 |
| `--order` | `string` | `desc` | 排序方向: asc/desc |
| `--explain` | `boolean` | `false` | 在 JSON 输出中追加字段解释 |
| `--no-header` | `boolean` | `false` | 直接输出 data（去掉信封），便于管道 |
| `--quiet` | `boolean` | `false` | 静默模式，禁止 stderr 输出 |

每个写操作命令的公共参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--dry-run` | `boolean` | `false` | 仅预览不执行 |
| `--idempotency-key` | `string` | 自动生成 | 幂等键，防止重复提交 |
| `--yes` / `-y` | `boolean` | `false` | 跳过交互确认（AI Agent 必须使用） |
| `--format` | `string` | `table` | 输出格式 |

---

### A.15 `fund doctor` 诊断命令

AI Agent 在连接失败时需要一个快速诊断入口。

```
fund doctor
```

输出：
```json
{
  "ok": true,
  "data": {
    "cliVersion": "2.2.1",
    "nodeVersion": "v20.9.0",
    "configExists": true,
    "configValid": true,
    "authenticated": true,
    "userId": "user-abc-123",
    "supabaseReachable": true,
    "eastmoneyReachable": true,
    "sinaReachable": true,
    "storagePath": "~/.fund-cli/data.json",
    "storageSize": "2.3MB",
    "lastSyncTime": "2026-06-16T09:00:00+08:00",
    "issues": []
  }
}
```

当存在异常时 `issues` 数组列出具体问题和建议修复操作：

```json
{
  "issues": [
    {
      "severity": "error",
      "code": "AUTH_EXPIRED",
      "message": "Supabase 登录 token 已过期",
      "fix": "fund login --email <your-email>"
    },
    {
      "severity": "warn",
      "code": "SYNC_STALE",
      "message": "上次云同步超过 7 天",
      "fix": "fund sync pull"
    }
  ]
}
```

---


---

