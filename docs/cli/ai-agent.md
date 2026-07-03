---
sidebar_position: 5
title: AI Agent 与脚本集成指南
sidebar_label: 5. AI Agent 集成
---

# AI Agent 与脚本集成指南

`jgb-cli` 在架构设计之初就将 **“机器可读性”** 与 **“AI Agent 友好性”** 提升至第一优先级的公民地位。为了让诸如 OpenClaw、AutoGPT、LangChain、以及各类自动化 Shell 管道能够以零幻觉、零猜测的高可靠性交互解析数据，CLI 提供了一整套标准化集成接口与输出协议。

---

## 一、全局 `--format` 输出控制规范

所有读取类命令均支持通过 `--format` 参数显式声明预期返回的数据结构结构与表现形式：

```bash
jgb info 005827 --format json          # 结构化 JSON 对象（AI Agent 默认推荐使用）
jgb search "易方达" --format jsonl       # 流式 JSON Lines（多条目流式处理场景）
jgb holdings 005827 --format csv       # 标准 CSV 格式（便于导入 Excel/Python Pandas）
jgb portfolio list --format table      # 对齐表格（终端人类开发者常规阅读默认形式）
jgb info 005827 --format text          # 纯文本键值摘要（专为 LLM Prompt 上下文优化）
```

### 格式选型指导与最佳实践

- **`json`**：输出合法的单个完整 JSON 对象，所有数值保持原始基本数据类型（浮点数与整型不转为字符串），布尔状态明确，适合各种语言编程或 Agent 的 JSON Parser 消费。
- **`jsonl`**：列表查询命令中每行输出独立的一个合乎规范的 JSON 文本对象，外层不使用方括号 `[]` 包裹。此模式最适合在管道中结合 `jq`、`grep`、`sed` 逐行流式解析，避免大列表对内存的瞬间峰值消耗。
- **`text`**：为了优化大语言模型（LLM）的 Token 占用，系统会过滤所有无意义的边界框线与 JSON 括号，仅以 `Field Name: Value` 的极简自然语言格式成段输出，省去 LLM 反序列化解析步骤，提示词注入成本最低。

---

## 二、统一 JSON 响应信封结构 (Response Envelope Schema)

无论调用哪一条 CLI 命令，当 `--format json` 被开启时，最外围 JSON 数据结构必须遵守全局统一的响应信封规约。通过固定响应契约，AI Agent 的工具调用解析层只需编写同一套逻辑即可解析任意返回信息。

### 2.1 成功响应格式 (Success Response)
```json
{
  "ok": true,
  "command": "jgb info",
  "version": "2.2.1",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": {
    "code": "005827",
    "name": "易方达蓝筹精选混合",
    "dwjz": 1.2345
  }
}
```

### 2.2 列表分页响应格式 (Paginated List Response)
当返回结果为列表集合时，`data` 字段恒定为 `Array` 类型，同时外层附带 `meta` 分页元数据信息：
```json
{
  "ok": true,
  "command": "jgb search",
  "version": "2.2.1",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": [
    { "code": "005827", "name": "易方达蓝筹精选混合" },
    { "code": "009342", "name": "易方达优质精选三年持有期" }
  ],
  "meta": {
    "total": 128,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 2.3 异常错误格式 (Error Response)
当命令发生非预期终止或参数校验失败时，`ok` 为 `false`，并提供大写下划线分割的标准机器码 `code`，便于进行编程判断或智能体自动重试分支决策：
```json
{
  "ok": false,
  "command": "jgb info",
  "error": {
    "code": "FUND_NOT_FOUND",
    "message": "基金代码 999999 不存在于天天基金或新浪数据池中",
    "details": null,
    "suggestion": "请先通过 jgb search <keyword> 搜索确认并校验该基金代码的有效性。"
  }
}
```

---

## 三、全局退出码规范 (Exit Codes)

为了契合 Linux 传统脚本脚本环境以及现代 CI/CD 自动化检测流，`jgb-cli` 严格划分并映射了命令执行的终态退出码（Exit Code）：

| 退出码 (Code) | 状态定义 | 典型出现场景与排查建议 |
| :---: | :--- | :--- |
| **`0`** | `SUCCESS` | 指令成功执行并输出合规结果。 |
| **`1`** | `GENERAL_ERROR` | 未捕获的内部通用业务异常。 |
| **`2`** | `INVALID_ARGUMENT`| CLI 传入的参数数量不匹配或选项拼写错误（如非法的 `--format xml`）。 |
| **`3`** | `AUTH_REQUIRED` | 需要用户凭据的指令（如操作需要会话 Token），但当前尚未登录或 Token 过期。 |
| **`4`** | `RESOURCE_NOT_FOUND` | 指定的查询标的（如错误的基金代码 `999999`）在底层数据库或第三方服务中未匹配。 |
| **`5`** | `NETWORK_TIMEOUT`| 连接天天基金、新浪财经或 Supabase 接口时遇到 DNS 解析失败、网络超时。 |
| **`6`** | `PARSE_ERROR` | 远端数据源响应格式异常（如 HTML 反爬验证拦截或脚本解析器失败）。 |

> [!TIP]
> 在编写自动化运维监控 Shell 脚本时，可利用 `$?` 检查退出码。如果返回值是 `5`（网络超时），你的脚本或 AI Agent 可选择自动重试；如果返回值是 `4`（标的不存在），则可以直接放弃而无须无效重试。

---

## 四、高级进阶筛选与管道流式操作

### 4.1 `--fields` 字段投影与 `--compact` 精简处理
当只需要结果集中特定的一两个指标属性时，可以开启字段投影优化，降低网络传输及 JSON 序列化的数据体积开销：
```bash
# 仅查询指定基金代码数组中的当前净值、日增长率两个字段
jgb info 005827 --fields code,dwjz,zzl --format json

# 开启 --compact 精简输出模式，自动压缩 JSON 空白缩进，减少 LLM Token 数量
jgb portfolio list --compact --format json
```

### 4.2 `--filter` 条件表达式筛查
全线列表类命令均内置了表达式过滤计算引擎，允许直接通过类似 SQL 表达式的方式对远端或本地数据集执行精细过滤：
```bash
# 查询大盘行情中仅涨幅大于 1.5% 的指数
jgb market --filter "changePercent > 1.5"

# 在持仓中筛选成本净值高于最新净值的“被套牢”亏损资产
jgb portfolio list --filter "currentNav < costNav" --format json
```

### 4.3 `--pipe` 与命令行管道的深度串联
利用极简输出模式或 JSON 过滤，能够轻易将基估宝与其他工具（如 `jq`、`awk`、`xargs`、`curl`、`bc`、微信通知机器人）串联打造自动化投资监控流水线：

```bash
# 案例：查询个人持仓列表中今日估盈大于 1000 元的标的，并通过管道发送 Webhook 消息
jgb portfolio list --format json | jq -r '.data.holdings[] | select(.profit > 1000) | "\(.name): 今日盈利 \(.profit)元"' | while read msg; do
  curl -s -X POST -H "Content-Type: application/json" -d "{\"text\": \"$msg\"}" https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx
done
```

---

## 五、环境自检与元数据发现指令

为了让智能体能够进行“能力发现 (Capability Discovery)”与“自我恢复 (Self-Healing)”，CLI 专门设立了两个基础诊断指令：`jgb describe` 与 `jgb doctor`。

### 5.1 `jgb describe` —— CLI 接口自描述与元数据树查询

#### 语法 (Synopsis)
```bash
jgb describe [options]
```

#### 描述 (Description)
让当前运行的 CLI 生成关于自身所有命令树格式、参数定义、以及输入输出 JSON Schema 的完整元数据清单。大模型通过先读取该命令的输出，即可动态掌握全套最新的 CLI API 协议并实现准确无误的参数组装。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--command <cmd>` | string | 否 | 仅输出某个特定指令（如 `jgb info`）的参数描述文档与使用细则 |
| `--schema` | flag | 否 | 将描述内容转换为符合标准的 OpenAPI / JSON Schema 定义格式 |

#### 使用示例 (Examples)
```bash
# 输出当前 CLI 版本支持的全量指令导航结构
jgb describe

# 针对智能体，专门提取 info 指令对应的合法 JSON Schema 定义
jgb describe --command "jgb info" --schema
```

#### 输出格式 (Output)
**常规文本输出**：
```
基估宝 CLI 命令结构自描述图表 (v2.2.1):
├── jgb search <keyword>      # 基金搜索指令
├── jgb info <code>           # 单基金实时估值与概览
├── jgb market                # 大盘指数与全球行情
└── jgb portfolio list        # 账户持仓查询与对账
```

**JSON Schema 输出 (`--schema`)**：
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "JgbCliCommands",
  "commands": {
    "jgb info": {
      "description": "查询基金实时估值与净值信息",
      "arguments": [{ "name": "code", "type": "string", "required": true }],
      "options": [{ "name": "--source", "type": "number", "default": 1 }]
    }
  }
}
```

---

### 5.2 `jgb doctor` —— 运行环境与网络依赖自检诊断

#### 语法 (Synopsis)
```bash
jgb doctor [options]
```

#### 描述 (Description)
执行一键式的全方位自动化健康排查。系统将按顺序验证 Node.js 运行时兼容性、配置目录读写权限、本地缓存 SQLite 数据库完整性、以及与天天基金、新浪财经、Supabase 云端 API 等外部依赖服务的连通延迟。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | flag | 否 | 以 JSON 结构化报告形式返回自检结果，适合 CI/CD 流程检查 |
| `--fix`  | flag | 否 | 尝试自动修复发现的非致命性本地问题（如重建损坏的轻量数据库索引） |

#### 使用示例 (Examples)
```bash
# 执行日常自检
jgb doctor

# 在脚本中判断环境是否健康
if ! jgb doctor --json | jq -e '.data.healthy'; then
  echo "环境自检未通过，请检查网络与鉴权配置！"
fi
```

#### 输出格式 (Output)
**表格/终端彩色报告输出**：
```
基估宝 CLI 环境诊断结果
─────────────────────────────────────────────────────────────
✔ [运行环境] Node.js 运行时版本 v20.11.0 满足要求 (>=18.0.0)
✔ [文件权限] 目录 ~/.jgb 读写权限正常
✔ [本地数据库] 本地轻量缓存库 cache.db 表结构校验完好
✔ [行情连通性] 天天基金 (ttjj) HTTP 接口连通正常 [延迟: 45ms]
✔ [行情连通性] 新浪财经 (sina) HTTP 接口连通正常 [延迟: 38ms]
✔ [云端认证]   Supabase Auth 认证服务连通且 Token 有效
─────────────────────────────────────────────────────────────
🎉 恭喜！当前所有系统与网络依赖状态健康，CLI 可以完美运行！
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "doctor",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": {
    "healthy": true,
    "checks": [
      { "name": "node_runtime", "status": "ok", "message": "v20.11.0" },
      { "name": "fs_permission", "status": "ok", "message": "read/write OK" },
      { "name": "api_ttjj", "status": "ok", "latencyMs": 45 },
      { "name": "api_sina", "status": "ok", "latencyMs": 38 }
    ]
  }
}
```
