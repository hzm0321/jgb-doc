---
sidebar_position: 5
title: 交易与账户写操作
sidebar_label: 5. 交易与账户写操作
---

# 交易与账户写操作

本章收录加仓、减仓、转换、持仓校准、定投计划、分红方式、待确认记录、历史流水、自选及分组的修改命令。查询持仓与流水的用法参见[持仓、自选与流水管理](./portfolio)。

这些操作用于**基估宝账户记账，不会向银行、券商或基金销售平台下单或扣款**。实际交易请先在销售平台完成，再按实际金额和日期录入。

---

## 5.1 通用选项与使用约定

每次修改都会先同步最新云端数据，再计算变更、展示预览并确认保存。无法同步时停止修改，不支持离线记账后等待上传。CLI 作为独立设备使用，登录和查询不接管其他设备；设备接管和数据冲突的处理参见[设备同步与冲突处理](./sync)。

### 参数与选项 (Arguments & Options)

以下确认和输出选项适用于本章所有写命令，各命令的参数表只补充业务选项。

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 分组 ID 或唯一名称；不传时修改默认账本，不是全部分组汇总。`transaction copy` 必填；`watchlist`、`group` 写命令不接受此选项 |
| `--dry-run` | boolean | 否 | `false` | 同步最新数据并展示草稿；可视化交互终端可选择确认执行或取消。`--json`、`--text` 和非交互环境仅预览、不提交 |
| `--yes` | boolean | 条件必填 | `false` | 确认写入，不授权设备接管。使用 `--json`、`--text` 或非交互终端时必填，`--dry-run` 除外 |
| `--takeover` | boolean | 否 | `false` | 明确允许 CLI 接管其他设备；仍检查预览期间的数据变化。脚本接管须同时指定 `--yes` |
| `--request-id <id>` | string | 否 | 自动生成唯一操作编号 | 自定义稳定操作编号，最多 200 字符；省略时自动生成。买卖、转换、补录流水及计划保存可据此识别重复操作，不要复用于不同操作 |
| `--json` | boolean | 否 | `false` | 输出标准 JSON 结果，不显示交互提示 |
| `--text` | boolean | 否 | `false` | 输出纯文本结果，不显示交互提示；本章写命令的文本内容为格式化 JSON 摘要 |

基金代码须为六位数字。日期使用上海时区，格式为 `YYYY-MM-DD`；金额单位为元，份额单位为份，持仓份额保留六位小数。费率按百分数填写，例如 `--fee-rate 0.15` 表示 **0.15%**。

### 使用示例 (Examples)

```bash
# 同步并预览，不提交
jgb trade buy 110022 --amount 100 --fee-rate 0.15 --dry-run --json

# 核对后提交；仅 --yes 不会接管其他设备
jgb trade buy 110022 --amount 100 --fee-rate 0.15 --yes --json

# 已明确决定接管时，在最新数据基础上提交
jgb trade buy 110022 --amount 100 --fee-rate 0.15 --takeover --yes --json
```

### 输出格式 (Output)

**默认可视化输出**：使用中文状态提示、表格和汇总展示本次操作。买卖与持仓设置展示修改前后对比，定投展示计划变化，清除与删除展示关联数据的清理数量，待确认处理逐项列出等待和失败记录。预览明确标记“尚未保存”，提交成功后显示“已保存到云端”；取消、无变更和重复操作不会显示为保存成功。

交互模式先展示可视化预览，再询问是否保存。使用 `--dry-run` 时，草稿下方提供“确认执行 / 取消”，默认选择取消：确认后直接保存当前草稿，取消或按 `Ctrl+C` 则不修改。草稿确认期间若云端数据变化，本次保存被拒绝，需要重新同步、计算和确认；普通确认不授权设备接管。

常规写入传入 `--yes` 可跳过确认，但可视化 `--dry-run` 即使同时传入 `--yes` 也仍需选择。脚本缺少 `--yes` 时直接报错，不等待输入。需要纯预览时使用 `--dry-run --json` 或 `--dry-run --text`。例如：

```bash
# 默认表格预览，无需 --json 或 --text
jgb holding set 110022 --share 200 --dry-run
```

以下为已有 100 份、成本未知时的示例（编号及基金名称以实际输出为准）：

```text
🔎 修改预览 · 尚未保存
校准持仓
────────────────────────────────────────────────────────────────
作用范围：默认账本
基金：110022 易方达消费行业股票

持仓    份额        单位成本  首次买入日期
────────────────────────────────────────
修改前  100.000000  未知      —
修改后  200.000000  未知      —
────────────────────────────────────────
直接校准持仓，不生成买卖流水。

操作编号：example-001

仅预览，尚未保存任何业务修改。

◆ 是否执行上述草稿并同步至云端？
│ ○ 确认执行 / ● 取消
```

**常规文本输出 (`--text`)**：保持格式化 JSON 摘要，不显示表格和交互提示。

**JSON 结构化输出 (`--json`)**：在摘要外包含 `ok`、`command`、`version`、`timestamp` 和 `data`。下面是已有基金加入自选后的完整示例，编号、时间及版本以实际结果为准。

```json
{
  "ok": true,
  "command": "watchlist add",
  "version": "2.0.0",
  "timestamp": "2026-11-02T08:00:00.000Z",
  "data": {
    "operationId": "watch-110022-001",
    "command": "watchlist add",
    "groupId": null,
    "code": "110022",
    "changedFields": ["favorites"],
    "expectedUpdatedAt": "2026-11-02T07:59:00.000Z",
    "submitted": true,
    "updatedAt": "2026-11-02T08:00:00.000Z"
  }
}
```

| 公共字段 | 说明 |
| :--- | :--- |
| `operationId` | 本次操作编号，用于核对结果 |
| `command` | 执行的命令与动作 |
| `groupId` | 目标账本 ID；默认账本为 `null`。分组命令还会返回 `group` 对象 |
| `changedFields` | 本次涉及的数据类别；识别为重复操作时可能不返回 |
| `expectedUpdatedAt` | 本次预览所依据的云端数据更新时间；账户尚无数据时为 `null` |
| `submitted` | 是否实际提交了修改。预览、取消、无变化或重复操作均可能为 `false` |
| `updatedAt` | 成功保存后的云端更新时间；仅提交成功时返回 |
| `duplicate` | 为 `true` 时表示已识别到相同操作，无需重复录入 |
| `cacheWarning` | 云端已保存但本地缓存更新失败时的提示；不要因此重复记账 |

JSON、文本或非交互模式下，`--dry-run` 的 `status` 为 `preview`，`submitted` 为 `false`。可视化交互草稿确认执行后会显示保存结果；取消则不提交。没有变化或已识别重复操作时无需确认，也不会提交。`ok: true` 不代表一定新增了记录，应同时查看 `submitted` 和业务摘要。下文 JSON 示例均为 **`data` 中的业务字段节选**，省略公共字段。

---

## 5.2 `jgb trade` —— 加仓、减仓与转换

### 5.2.1 `jgb trade buy` —— 记录加仓

#### 语法 (Synopsis)

```bash
jgb trade buy <code> --amount <amount> [--fee-rate <rate>] [--date <date>] [--after-3pm] [--group <group>]
```

#### 描述 (Description)

按含手续费的实际买入金额录入。净申购金额为 `金额 / (1 + 费率 / 100)`，含费金额计入持仓成本。取得官方净值后更新持仓并生成流水；尚无对应官方净值时加入待确认队列，实时估值不能用于成交确认。

交易日期默认今天。15 点后提交的交易应指定 `--after-3pm`，按之后的净值日期处理；非交易日按后续可用的官方净值确认。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 基金代码 |
| `--amount <amount>` | number | 是 | —（必填） | 含费买入金额，须大于 0 |
| `--fee-rate <rate>` | number | 否 | `0`（0%） | 手续费率，0～100，默认 0；买入不支持固定手续费 |
| `--date <date>` | string | 否 | 命令执行当天（北京时间） | 实际交易日期，默认今天，不能晚于今天 |
| `--after-3pm` | boolean | 否 | `false` | 标记在北京时间 15:00 后提交 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 目标账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 按实际金额和费率录入，交互确认
jgb trade buy 110022 --amount 1000 --fee-rate 0.15 --date 2026-10-30

# 预览分组内 15 点后的买入
jgb trade buy 110022 --amount 100 --after-3pm --group "长期持有" --dry-run --json
```

#### 输出格式 (Output)

返回 `code`、修改前后持仓 `before` / `after`、交易信息 `trade`、官方净值 `nav` 和已确认流水 `record`。`status` 为 `recorded` 表示已确认，为 `pending` 表示等待官方净值。

```json
{
  "status": "pending",
  "code": "110022",
  "nav": null,
  "record": null
}
```

---

### 5.2.2 `jgb trade sell` —— 记录减仓

#### 语法 (Synopsis)

```bash
jgb trade sell <code> --share <share> [--fee-rate <rate> | --fee-amount <amount>] [--date <date>] [--after-3pm] [--group <group>]
```

#### 描述 (Description)

按卖出份额录入，支持手续费率或固定手续费，二者互斥。确认规则与加仓一致；没有官方净值时进入待确认队列。

可卖份额会扣除同账本内已待卖的份额。存在份额尚未确定的转换转出记录时，须先确认或取消该记录；卖出份额超过可卖份额时停止操作。确认待卖记录时还会检查当前持仓是否足够。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 基金代码 |
| `--share <share>` | number | 是 | —（必填） | 卖出份额，须大于 0 且不超过可卖份额 |
| `--fee-rate <rate>` | number | 否 | 未传固定手续费时为 `0`（0%）；固定手续费模式不使用 | 手续费率，0～100；不能与固定手续费同时指定 |
| `--fee-amount <amount>` | number | 否 | 不启用固定手续费；采用费率模式 | 固定手续费，须大于或等于 0，不能与费率同时使用 |
| `--date <date>` | string | 否 | 命令执行当天（北京时间） | 实际交易日期，默认今天，不能晚于今天 |
| `--after-3pm` | boolean | 否 | `false` | 标记在北京时间 15:00 后提交 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 目标账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 按费率记录分组减仓
jgb trade sell 110022 --share 100 --fee-rate 0.5 --group "长期持有"

# 按固定手续费提交，并输出 JSON
jgb trade sell 110022 --share 100 --fee-amount 1.5 --yes --json
```

#### 输出格式 (Output)

与加仓相同，返回持仓前后对比、交易、净值及流水。等待确认时 `record` 为 `null`；已确认时可用流水 ID 查询结果。

```json
{
  "status": "recorded",
  "code": "110022",
  "before": { "share": 1000, "cost": 1.5 },
  "after": { "share": 900, "cost": 1.5 }
}
```

---

### 5.2.3 `jgb trade convert` —— 记录基金转换

#### 语法 (Synopsis)

```bash
jgb trade convert <outCode> <inCode> --out-amount <amount> --in-amount <amount> [--date <date>] [--out-confirm-days <days>] [--in-confirm-days <days>] [--group <group>]
```

#### 描述 (Description)

按销售平台实际转出金额、转入金额和确认日期录入转换，两只基金不能相同。一次创建两条关联的待确认记录，随后通过 `pending process` **分别确认**，可能暂时只有一侧完成。

净值日期从确认日期按自然日向前回溯，默认采用对应基金的确认天数配置，没有配置时为 1 天；回溯日期没有官方净值时继续向前查找。取消一侧不会撤销另一侧，也不会回滚已确认的持仓。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<outCode>` | string | 是 | —（必填） | 转出基金代码，当前账本须有可转出持仓 |
| `<inCode>` | string | 是 | —（必填） | 转入基金代码 |
| `--out-amount <amount>` | number | 是 | —（必填） | 实际转出金额，须大于 0 |
| `--in-amount <amount>` | number | 是 | —（必填） | 实际转入金额，须大于 0 |
| `--date <date>` | string | 否 | 命令执行当天（北京时间） | 转换确认日期，默认今天，不能晚于今天 |
| `--out-confirm-days <days>` | integer | 否 | 对应基金的确认天数；未配置时为 `1` | 转出侧净值回溯天数，1～30 个自然日 |
| `--in-confirm-days <days>` | integer | 否 | 对应基金的确认天数；未配置时为 `1` | 转入侧净值回溯天数，1～30 个自然日 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 两侧共用的目标账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 预览转换的两条待确认记录
jgb trade convert 110022 000001 --out-amount 500 --in-amount 498 --date 2026-10-30 --dry-run --json

# 指定两侧回溯天数并提交
jgb trade convert 110022 000001 --out-amount 500 --in-amount 498 --date 2026-10-30 --out-confirm-days 1 --in-confirm-days 2 --request-id convert-001 --yes --json
```

#### 输出格式 (Output)

`operationId` 为本次转换编号，`ids` 为两侧队列 ID，`confirmation: independent` 表示独立确认。

```json
{
  "operationId": "convert-001",
  "status": "pending",
  "ids": ["convert-001:out", "convert-001:in"],
  "confirmation": "independent"
}
```

---

## 5.3 `jgb holding` —— 设置与清除持仓

### 5.3.1 `jgb holding set` —— 校准持仓

#### 语法 (Synopsis)

```bash
jgb holding set <code> --share <share> [--cost <cost>] [--first-date <date> | --holding-days <days>] [--group <group>]
jgb holding set <code> --amount <amount> [--profit <profit>] [--first-date <date> | --holding-days <days>] [--group <group>]
```

#### 描述 (Description)

直接校准当前持仓，不生成买卖流水。可选择“份额＋单位成本”或“持仓金额＋持有收益”，两种模式不能混用。

份额模式省略成本时保留已有成本；没有已知成本的正份额持仓保持未知，不按零成本计算。金额模式按最新官方净值换算份额，再根据持仓金额和持有收益计算单位成本；未指定收益时按 0 计算。首次买入日期与持有天数互斥，均省略时保留原日期。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 基金代码 |
| `--share <share>` | number | 二选一 | 无；须选择一种范围或模式 | 持仓份额，须大于或等于 0；与 `--amount` 互斥 |
| `--cost <cost>` | number | 否 | 保留已有成本；无已知成本时，正份额为未知，零份额为 `0` | 单位持仓成本，仅用于份额模式 |
| `--amount <amount>` | number | 二选一 | 无；须选择一种范围或模式 | 当前持仓金额，须大于或等于 0；不能同时传份额或单位成本 |
| `--profit <profit>` | number | 否 | `0` 元 | 持有收益，可为负数，仅用于金额模式，默认 0 |
| `--first-date <date>` | string | 否 | 若传持有天数则推算；否则保留原日期，无原日期则不设置 | 首次买入日期，不能晚于今天 |
| `--holding-days <days>` | integer | 否 | 不按天数推算；采用首次买入日期或保留原日期 | 持有自然日数，0～36500；按今天向前推算首次买入日期 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 目标账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 用份额和单位成本校准
jgb holding set 110022 --share 1000.123456 --cost 1.5 --first-date 2026-01-05

# 预览按持仓金额与收益换算后的持仓
jgb holding set 110022 --amount 2000 --profit 150 --holding-days 30 --dry-run --json
```

#### 输出格式 (Output)

返回基金代码以及修改前后的持仓。未知成本在 JSON 中为 `null`。

```json
{
  "code": "110022",
  "before": { "share": 100, "cost": null },
  "after": { "share": 200, "cost": null }
}
```

---

### 5.3.2 `jgb holding clear` —— 清除基金记账数据

#### 语法 (Synopsis)

```bash
jgb holding clear <code> [--group <group>]
```

#### 描述 (Description)

清除指定账本内该基金的持仓、历史流水、待确认记录、定投计划和每日收益。保留基金列表、自选及其他账本的数据。此操作是清理记账数据，不是卖出；建议先用 `--dry-run` 核对影响范围。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 要清除记账数据的基金代码 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 清理范围，默认仅默认账本 |

#### 使用示例 (Examples)

```bash
# 先查看影响范围
jgb holding clear 110022 --group "长期持有" --dry-run --json

# 确认后清理指定账本
jgb holding clear 110022 --group "长期持有" --yes --json
```

#### 输出格式 (Output)

返回 `code`、原持仓 `before`、被清除的流水数量 `clearedTransactions` 和影响统计 `impact`。`earningsFunds` 是受影响的每日收益基金数，不是收益记录条数。

```json
{
  "code": "110022",
  "clearedTransactions": 3,
  "impact": {
    "codes": ["110022"],
    "holdings": 1,
    "transactions": 3,
    "pending": 1,
    "plans": 1,
    "earningsFunds": 1
  }
}
```

---

## 5.4 `jgb dca` —— 定投计划管理

定投计划用于生成基估宝记账记录，不会自动从银行卡扣款。需要主动运行 `dca run` 生成到期队列，再通过 `pending process` 确认；本版本不提供常驻后台或云端定时扣款。计划查询使用 `jgb dca list`，详见[持仓、自选与流水管理](./portfolio)。

### 5.4.1 `jgb dca create/update` —— 创建或修改计划

#### 语法 (Synopsis)

```bash
jgb dca create <code> --amount <amount> [--fee-rate <rate>] [--cycle <cycle>] [--weekly-day <day>] [--monthly-day <day>] [--first-date <date>] [--effective-date <date>] [--group <group>]
jgb dca update <code> [--amount <amount>] [--fee-rate <rate>] [--cycle <cycle>] [--weekly-day <day>] [--monthly-day <day>] [--first-date <date>] [--effective-date <date>] [--group <group>]
```

#### 描述 (Description)

为当前账本的一只基金创建或修改计划。已有计划不能再次创建，没有计划不能修改。修改时未指定的计划参数沿用原值，可指定未来生效日期。

新计划首扣日期不能早于生效日期，且须匹配扣款星期或月内日期。修改周期时也要核对首扣日期是否匹配。已有待生效配置到期时，先执行 `dca run`，再修改计划。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 基金代码 |
| `--amount <amount>` | number | 创建时必填 | 创建无默认值；修改保留原金额 | 每期含费金额，须大于 0；修改时省略则保留 |
| `--fee-rate <rate>` | number | 否 | 新建 `0`；修改保留原费率（缺失时为 `0`） | 手续费率，0～100，新建默认 0 |
| `--cycle <cycle>` | string | 否 | 新建 `monthly`；修改保留原周期（缺失时为 `monthly`） | `daily`（交易日）、`weekly`（每周）、`biweekly`（双周）、`monthly`（每月），新建默认 `monthly` |
| `--weekly-day <day>` | integer | 否 | 周投/双周投：新建 `1`（周一）；修改保留原值，无原值时为 `1`；其他周期不使用 | 周投或双周投的扣款星期，1～5 代表周一至周五，新建默认 1 |
| `--monthly-day <day>` | integer | 否 | 月投：新建 `1`；修改保留原值，无原值时为 `1`；其他周期不使用 | 月投扣款日，1～28，新建默认 1 |
| `--first-date <date>` | string | 否 | 新建按生效日期及周期计算首扣日；修改保留原首扣日，无原日期时重新计算 | 首扣日期；新建省略时选取生效日期起匹配周期的首个日期，修改省略时保留原值 |
| `--effective-date <date>` | string | 否 | 命令执行当天（北京时间），不沿用原生效日期 | 本次配置生效日期，默认今天，不能早于今天 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 计划所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

以下日期为示例，使用时请替换为今天或未来的有效日期。

```bash
# 创建每周一的计划
jgb dca create 110022 --amount 100 --cycle weekly --weekly-day 1 --first-date 2026-11-09 --effective-date 2026-11-09

# 从指定日期起调整每期金额
jgb dca update 110022 --amount 200 --effective-date 2026-11-09 --yes --json
```

#### 输出格式 (Output)

返回 `code`、原计划 `before`（新建时可能省略）和保存后的计划 `after`。未来生效的修改在 `after.pendingConfig` 中显示，当前计划参数在生效前继续保留。

```json
{
  "code": "110022",
  "after": {
    "amount": 100,
    "feeRate": 0,
    "cycle": "weekly",
    "weeklyDay": 1,
    "monthlyDay": null,
    "firstDate": "2026-11-09",
    "effectiveDate": "2026-11-09",
    "enabled": true,
    "operationIds": ["dca-110022-001"]
  }
}
```

---

### 5.4.2 `jgb dca pause/resume` —— 暂停或恢复计划

#### 语法 (Synopsis)

```bash
jgb dca pause <code> [--effective-date <date>] [--group <group>]
jgb dca resume <code> [--effective-date <date>] [--group <group>]
```

#### 描述 (Description)

暂停或恢复已有计划，可立即生效或指定未来日期。操作保留原首扣日期和周期安排，暂停期间不补扣，也不删除已生成的待确认记录。已有待生效配置到期时，须先运行 `dca run`。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 已有定投计划的基金代码 |
| `--effective-date <date>` | string | 否 | 命令执行当天（北京时间），不沿用原生效日期 | 暂停或恢复的生效日期，默认今天，不能早于今天 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 计划所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 暂停默认账本的计划
jgb dca pause 110022 --yes --json

# 预览恢复分组内的计划
jgb dca resume 110022 --group "长期持有" --dry-run --json
```

#### 输出格式 (Output)

返回 `code`、`before` 和 `after`。立即生效时查看 `after.enabled`；未来生效时查看 `after.pendingConfig.enabled`。以下为立即暂停后的字段节选。

```json
{
  "code": "110022",
  "after": { "enabled": false }
}
```

---

### 5.4.3 `jgb dca delete` —— 删除计划

#### 语法 (Synopsis)

```bash
jgb dca delete <code> [--group <group>]
```

#### 描述 (Description)

删除当前账本内该基金的定投计划。不删除已经生成的待确认记录、历史流水和持仓；如需取消未确认期次，另用 `pending cancel`。已有待生效配置到期时，须先运行 `dca run`。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 要删除计划的基金代码 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 计划所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
jgb dca delete 110022 --dry-run --json
jgb dca delete 110022 --yes --json
```

#### 输出格式 (Output)

返回原计划 `before`，删除后的 `after` 为 `null`。

```json
{
  "code": "110022",
  "after": null
}
```

---

### 5.4.4 `jgb dca run` —— 生成到期记录

#### 语法 (Synopsis)

```bash
jgb dca run [code] [--group <group>]
```

#### 描述 (Description)

根据计划生成截至今天应执行的待确认记录，并更新计划进度。默认只处理默认账本，指定 `--group` 后只处理该分组；可进一步限定一只基金。

相同期次不会重复生成，网页和 CLI 共用期次编号。生成队列不代表已经确认成交，后续仍须取得官方净值。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `[code]` | string | 否 | 当前账本全部定投计划 | 限定基金，省略则处理当前账本所有计划 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 计划所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 核对本次将生成的队列
jgb dca run --dry-run --json

# 生成后，确认已有官方净值的记录
jgb dca run --yes --json
jgb pending process --yes --json

# 只处理指定分组中的一只基金
jgb dca run 110022 --group "长期持有" --yes --json
```

#### 输出格式 (Output)

`generated` 为新生成的记录数量，`ids` 为对应队列 ID。没有到期期次时可能为 0。

```json
{
  "generated": 0,
  "ids": []
}
```

---

## 5.5 `jgb dividend-method` —— 分红方式

### 5.5.1 `jgb dividend-method get` —— 查询分红方式

#### 语法 (Synopsis)

```bash
jgb dividend-method get [code] [--group <group>] [--json] [--text]
```

#### 描述 (Description)

查询当前账本内指定基金的分红方式；省略代码时列出该账本的持仓条目。未设置时按 `reinvest`（红利再投资）返回。本命令是查询，不需要 `--yes`，不会接管设备。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `[code]` | string | 否 | 当前账本全部持仓条目 | 指定基金代码 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 查询账本，支持分组 ID 或唯一名称 |
| `--json` | boolean | 否 | `false` | 输出标准 JSON 结果 |
| `--text` | boolean | 否 | `false` | 输出格式化 JSON 数组，无交互 |

#### 使用示例 (Examples)

```bash
jgb dividend-method get 110022 --json
jgb dividend-method get --group "长期持有" --json
```

#### 输出格式 (Output)

默认输出展示基金代码、基金名称和中文分红方式的表格，并汇总基金数量；没有持仓条目时提示暂无记录。`--json` 的 `data` 是数组，包含基金代码、账本 ID 和方式；`--text` 直接输出该数组。

**默认表格输出**：

```text
📋 基金分红方式
账本：默认账本

基金代码  基金名称              分红方式
──────────────────────────────────────
110022    易方达消费行业股票    红利再投资
──────────────────────────────────────
共 1 只基金
```

**JSON 数据部分 (`--json`)**：

```json
[
  { "code": "110022", "groupId": null, "method": "reinvest" }
]
```

---

### 5.5.2 `jgb dividend-method set` —— 设置单只或批量分红方式

#### 语法 (Synopsis)

```bash
jgb dividend-method set <code> --method <method> [--group <group>]
jgb dividend-method set --all --method <method> [--group <group>]
```

#### 描述 (Description)

设置单只基金或当前账本内所有正份额持仓的分红方式。基金代码与 `--all` 互斥，必须选择一种范围；批量设置不会跨全部账本。

单只设置可建立零份额持仓条目。修改方式不会立即产生分红或增加份额，也不会修改销售平台上的实际分红设置。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 二选一 | 无；须选择一种范围或模式 | 单只基金代码，与 `--all` 互斥 |
| `--all` | boolean | 二选一 | `false` | 当前账本所有份额大于 0 的持仓 |
| `--method <method>` | string | 是 | —（必填） | `cash`（现金分红）或 `reinvest`（红利再投资） |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 目标账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
jgb dividend-method set 110022 --method cash
jgb dividend-method set --all --method reinvest --group "长期持有" --dry-run --json
```

#### 输出格式 (Output)

返回本次选择的基金代码 `codes` 和目标方式 `method`。

```json
{
  "codes": ["110022", "000001"],
  "method": "reinvest"
}
```

---

## 5.6 `jgb pending` —— 待确认记录维护

队列查询使用 `jgb pending list`，详见[持仓、自选与流水管理](./portfolio)。查询可能包含多个账本；处理与取消默认仅作用于默认账本，分组记录须指定 `--group`。

### 5.6.1 `jgb pending process` —— 确认交易记录

#### 语法 (Synopsis)

```bash
jgb pending process [id] [--group <group>]
```

#### 描述 (Description)

逐条检查待确认记录，只使用官方净值确认成交。成功后更新对应账本持仓与流水，并移出待确认队列；净值尚未公布时继续等待。份额不足或手续费异常等记录保留在队列中，并返回错误详情。

批量处理可能部分成功，不能仅凭命令成功就认为所有记录均已确认。转换的两侧也独立处理。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `[id]` | string | 否 | 当前账本全部待确认记录 | 指定待确认记录 ID，省略则处理当前账本全部队列 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 队列所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
jgb pending process --dry-run --json
jgb pending process --yes --json
jgb pending process <id> --group "长期持有" --yes --json
```

#### 输出格式 (Output)

| 业务字段 | 说明 |
| :--- | :--- |
| `processed` | 已处理并移出队列的 ID，包括已有对应流水的记录 |
| `recorded` | 本次新确认生成流水的 ID |
| `remaining` | 因官方净值未取得而继续等待的 ID |
| `errors` | 失败记录的 ID 与原因；这些记录同样留在队列中 |
| `status` | `completed`：处理完成；`waiting`：仍有等待记录；`partial`：有记录处理失败 |

```json
{
  "processed": ["trade-001"],
  "recorded": ["trade-001"],
  "remaining": ["trade-002"],
  "errors": [],
  "status": "waiting"
}
```

---

### 5.6.2 `jgb pending cancel` —— 取消待确认记录

#### 语法 (Synopsis)

```bash
jgb pending cancel <id> [--group <group>]
```

#### 描述 (Description)

移除指定账本的一条待确认记录，不撤销已经确认的流水或持仓。取消转换的一侧，不会自动取消另一侧。此操作仅取消基估宝记账队列，不会撤销销售平台的交易申请。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<id>` | string | 是 | —（必填） | 待确认记录 ID，可通过 `pending list` 查看 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 队列所在账本；分组记录必须指定 |

#### 使用示例 (Examples)

```bash
jgb pending cancel <id> --dry-run --json
jgb pending cancel <id> --group "长期持有" --yes --json
```

#### 输出格式 (Output)

`cancelled` 返回被取消的记录，`independent` 表示它是否属于独立处理的转换记录。

```json
{
  "cancelled": { "id": "convert-001:out", "conversionId": "convert-001" },
  "independent": true
}
```

---

## 5.7 `jgb transaction` —— 历史流水维护

查询使用复数命令 `jgb transactions <code>`，维护使用单数命令 `jgb transaction`。增改删历史流水均**不自动调整当前持仓**；如需校准持仓，请另用 `holding set`。查询参数参见[持仓、自选与流水管理](./portfolio)。

### 5.7.1 `jgb transaction add` —— 补录历史流水

#### 语法 (Synopsis)

```bash
jgb transaction add <code> --type <type> --share <share> --price <price> --amount <amount> [--date <date>] [--is-dca] [--group <group>]
```

#### 描述 (Description)

按实际成交信息补录一条历史买入或卖出记录，标记为历史流水。份额、金额和净值需要分别提供；命令不会根据补录内容重算当前持仓。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 基金代码 |
| `--type <type>` | string | 是 | —（必填） | `buy`（买入）或 `sell`（卖出） |
| `--share <share>` | number | 是 | —（必填） | 实际成交份额，须大于 0 |
| `--price <price>` | number | 是 | —（必填） | 实际成交净值，须大于 0 |
| `--amount <amount>` | number | 是 | —（必填） | 实际成交金额，须大于 0 |
| `--date <date>` | string | 否 | 命令执行当天（北京时间） | 交易日期，默认今天，不能晚于今天 |
| `--is-dca` | boolean | 否 | `false` | 将补录买入标记为定投；卖出不标记为定投 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 流水所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
jgb transaction add 110022 --type buy --share 100 --price 1.5 --amount 150 --date 2026-10-30
jgb transaction add 110022 --type buy --share 100 --price 1.5 --amount 150 --is-dca --request-id history-001 --yes --json
```

#### 输出格式 (Output)

`record` 返回新流水，`isHistoryOnly: true` 表示仅作为历史记录保存。

```json
{
  "record": {
    "id": "history-001",
    "type": "buy",
    "share": 100,
    "price": 1.5,
    "amount": 150,
    "isDca": true,
    "isHistoryOnly": true
  }
}
```

---

### 5.7.2 `jgb transaction update/remove` —— 修改或删除流水

#### 语法 (Synopsis)

```bash
jgb transaction update <id> [--type <type>] [--share <share>] [--price <price>] [--amount <amount>] [--date <date>] [--group <group>]
jgb transaction remove <id> [--group <group>]
```

#### 描述 (Description)

按流水 ID 修改或删除当前账本的一条流水。修改时仅更新已指定的字段，删除时仅删除该条记录；两者都不回滚或重新计算持仓。分组流水必须通过 `--group` 指定所在账本。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<id>` | string | 是 | —（必填） | 当前账本内唯一的流水 ID，可通过 `transactions` 查询 |
| `--type <type>` | string | 否 | 保留该流水原值 | 仅 `update` 支持，改为 `buy` 或 `sell` |
| `--share <share>` | number | 否 | 保留该流水原值 | 仅 `update` 支持，成交份额，须大于 0 |
| `--price <price>` | number | 否 | 保留该流水原值 | 仅 `update` 支持，成交净值，须大于 0 |
| `--amount <amount>` | number | 否 | 保留该流水原值 | 仅 `update` 支持，成交金额，须大于 0 |
| `--date <date>` | string | 否 | 保留该流水原交易日期 | 仅 `update` 支持，交易日期，不能晚于今天 |
| `--group <group>` | string | 否 | 无；作用于默认账本 | 流水所在账本，支持分组 ID 或唯一名称 |

#### 使用示例 (Examples)

```bash
# 先查询流水 ID
jgb transactions 110022 --group "长期持有" --json

# 修正指定流水
jgb transaction update <id> --price 1.51 --amount 151 --group "长期持有" --yes --json

# 删除前预览
jgb transaction remove <id> --group "长期持有" --dry-run --json
```

#### 输出格式 (Output)

返回基金代码 `code`、修改后或被删除的流水 `record`，以及 `holdingUnchanged: true`。

```json
{
  "code": "110022",
  "record": { "id": "history-001", "price": 1.51, "amount": 151 },
  "holdingUnchanged": true
}
```

---

### 5.7.3 `jgb transaction copy` —— 跨账本复制流水

#### 语法 (Synopsis)

```bash
jgb transaction copy <code> --group <group> [--include-pending]
```

#### 描述 (Description)

将其他账本中该基金的流水复制到指定目标分组，包括默认账本和其他分组中的记录，不迁移持仓。按来源记录去重，重复复制会跳过已复制的记录。

默认只复制已确认流水。显式指定 `--include-pending` 时还会复制待确认记录；这些记录后续在目标账本确认时会影响目标持仓，请先预览并核对范围。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 要复制流水的基金代码 |
| `--group <group>` | string | 是 | —（必填） | 目标分组 ID 或唯一名称，不用于选择来源账本 |
| `--include-pending` | boolean | 否 | `false` | 同时复制其他账本的待确认记录，默认不包含 |

#### 使用示例 (Examples)

```bash
jgb transaction copy 110022 --group "长期持有" --dry-run --json
jgb transaction copy 110022 --group "长期持有" --include-pending --dry-run --json
jgb transaction copy 110022 --group "长期持有" --yes --json
```

#### 输出格式 (Output)

`copied` 为本次复制的总条数，包含显式选择的待确认记录；`holdingUnchanged` 表示本次复制没有修改持仓，不代表后续队列确认也不影响持仓。

```json
{
  "code": "110022",
  "copied": 3,
  "holdingUnchanged": true
}
```

---

## 5.8 `jgb watchlist add/remove` —— 添加或取消自选

#### 语法 (Synopsis)

```bash
jgb watchlist add <code>
jgb watchlist remove <code>
```

#### 描述 (Description)

添加基金到自选，或取消对该基金的关注。取消自选不删除基金、持仓及流水；重复添加不会产生重复自选。自选属于整个账户，本组写命令不接受 `--group`。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<code>` | string | 是 | —（必填） | 要添加或取消关注的基金代码 |

确认、预览与输出使用本章通用选项。

#### 使用示例 (Examples)

```bash
jgb watchlist add 110022 --yes --json
jgb watchlist remove 110022 --dry-run --json
jgb watchlist remove 110022 --yes --json
```

#### 输出格式 (Output)

业务摘要返回基金代码。查看公共字段 `submitted` 判断本次是否产生提交。

```json
{
  "code": "110022"
}
```

---

## 5.9 `jgb group` —— 分组与成员管理

分组使用位置参数指定，不接受 `--group` 选项。可用分组 ID 或唯一名称；存在同名分组时须使用 ID。预置分组不能作为普通持仓账本修改或删除。

### 5.9.1 `jgb group create/rename` —— 创建或重命名分组

#### 语法 (Synopsis)

```bash
jgb group create <name>
jgb group rename <group> <name>
```

#### 描述 (Description)

创建一个空分组，或修改已有分组名称。重命名不会迁移或清理已有成员和记账数据。名称中包含空格时请使用引号。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<group>` | string | 重命名时必填 | —（必填） | 已有分组的 ID 或唯一名称 |
| `<name>` | string | 是 | —（必填） | 新分组名称或修改后的名称，不能为空 |

#### 使用示例 (Examples)

```bash
jgb group create "长期持有" --yes --json
jgb group rename "长期持有" "长期配置" --yes --json
```

#### 输出格式 (Output)

`group` 返回分组 ID、名称及成员代码。创建后可保存 `group.id`，用于后续操作。

```json
{
  "group": {
    "id": "group_example-001",
    "name": "长期持有",
    "codes": []
  }
}
```

---

### 5.9.2 `jgb group add/remove` —— 添加或移除成员

#### 语法 (Synopsis)

```bash
jgb group add <group> <codes...>
jgb group remove <group> <codes...>
```

#### 描述 (Description)

添加成员只增加分组基金列表，不迁移其他账本持仓；重复添加不会清除已有数据。

**移除成员会同时清除该基金在此分组内的持仓、流水、待确认记录、定投计划和每日收益**，保留默认账本及其他分组的数据。请先预览影响统计，不要将其当作仅隐藏列表成员的操作。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<group>` | string | 是 | —（必填） | 目标分组 ID 或唯一名称 |
| `<codes...>` | string[] | 是 | —（必填） | 一个或多个基金代码，支持空格或逗号分隔 |

#### 使用示例 (Examples)

```bash
jgb group add "长期配置" 110022 000001 --yes --json
jgb group add "长期配置" 110022,000001 --dry-run --json
jgb group remove "长期配置" 110022 --dry-run --json
```

#### 输出格式 (Output)

返回目标 `groupId` 和操作后的 `group`。移除时额外返回 `impact`，统计含义与 `holding clear` 相同。

```json
{
  "groupId": "group_example-001",
  "group": { "id": "group_example-001", "name": "长期配置", "codes": ["000001"] },
  "impact": {
    "codes": ["110022"],
    "holdings": 1,
    "transactions": 3,
    "pending": 1,
    "plans": 1,
    "earningsFunds": 1
  }
}
```

---

### 5.9.3 `jgb group delete` —— 删除分组及关联数据

#### 语法 (Synopsis)

```bash
jgb group delete <group>
```

#### 描述 (Description)

删除指定分组，以及该分组的持仓、历史流水、待确认记录、定投计划、每日收益和自定义设置。默认账本、自选及其他分组的数据保留。预置分组不能删除。

#### 参数与选项 (Arguments & Options)

| 参数/选项 | 类型 | 是否必填 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `<group>` | string | 是 | —（必填） | 待删除分组的 ID 或唯一名称；同名时必须用 ID |

#### 使用示例 (Examples)

```bash
# 先检查整个分组的清理范围
jgb group delete "长期配置" --dry-run --json

# 核对后删除
jgb group delete "长期配置" --yes --json
```

#### 输出格式 (Output)

返回被删除的 `group`、目标 `groupId`、清理统计 `impact`，以及是否移除分组自定义设置的 `removesGroupSettings`。结果中保留分组对象是为了核对，不表示该分组仍存在。

```json
{
  "groupId": "group_example-001",
  "removesGroupSettings": true,
  "impact": {
    "codes": ["110022", "000001"],
    "holdings": 2,
    "transactions": 5,
    "pending": 1,
    "plans": 1,
    "earningsFunds": 2
  }
}
```

---

## 5.10 写入错误与结果核对

JSON 模式下错误输出到标准错误流（stderr）。设备冲突与数据变化都不会提交旧的预览结果，处理方式有所不同。

| 错误码 | 退出码 | 含义与处理 |
| :--- | :--- | :--- |
| `DEVICE_CONFLICT` | 6 | 当前由其他设备同步。可放弃本次修改并使用云端数据，或明确接管后重新计算和确认；脚本须使用 `--takeover --yes` |
| `DATA_CONFLICT` | 6 | 预览后云端已有更新。重新运行并核对新预览；即使使用 `--takeover` 也不能跳过此检查 |
| `CLOUD_READ_FAILED` | 1 | 无法取得最新云端数据，本次未修改。恢复网络后重新运行 |
| `COMMIT_UNKNOWN` | 1 | 无法确认是否保存成功。先核对云端持仓、流水和队列，不要直接重复记账 |

```bash
# 提交结果不明时，先查询相同账本的持仓和流水
jgb holding list --group "长期持有" --json
jgb transactions 110022 --group "长期持有" --json

# 查询该基金的待确认记录，并核对记录所属账本
jgb pending list --code 110022 --json
```

核对时保留本次 `operationId` 或显式指定的 `--request-id`。使用相同编号与相同参数可避免重复录入仍保留的交易或队列；如果相关记录已被删除，不要依赖编号自动判断是否曾经执行。`--request-id` 不是所有命令通用的重试保证。

更多交互选择与恢复示例参见[设备同步与冲突处理](./sync)。标签管理、OCR 和基金全局删除不属于本章命令范围。
