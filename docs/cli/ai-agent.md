---
sidebar_position: 5
title: AI Agent 与脚本集成指南
sidebar_label: 5. AI Agent 集成
---

# AI Agent 与脚本集成指南

`@jigubao/cli` 在架构设计之初就将 **“机器可读性”** 与 **“AI Agent 友好性”** 提升至第一优先级的公民地位。为了让诸如 OpenClaw、AutoGPT、LangChain、以及各类自动化 Shell 管道能够以零幻觉、零猜测的高可靠性交互解析数据，CLI 提供了一整套标准化集成接口与输出协议。

---

## 一、全局输出控制规范

为了满足不同集成场景的需求，`@jigubao/cli` 支持通过全局通用选项（Global Flags）控制返回的数据结构与表现形式：

- **默认输出 (表格/常规文本)**：以对齐表格或易于人类阅读的格式展现，包含控制台颜色、特殊 UI 符号等。
- **结构化 JSON 输出 (`--json`)**：以结构化 JSON 格式输出结果，同时禁用所有交互式 UI 动画与引导文字，适用于 `jq`、脚本管道操作及程序化自动化处理，是 AI Agent 默认推荐使用的输出格式。
- **纯文本输出 (`--text`)**：以纯文本格式输出结果，去除控制台颜色和特殊 UI 符号，生成结构清晰的文字摘要。该模式专为大语言模型（LLM）的 Prompt 上下文进行优化，可显著降低 Token 消耗，并省去 LLM 的反序列化解析步骤，提示词注入成本最低。

```bash
jgb info 005827 --json          # 结构化 JSON 对象（AI Agent 默认推荐使用）
jgb search "易方达" --json        # 结构化 JSON 数组/对象
jgb info 005827 --text          # 纯文本键值摘要（专为 LLM Prompt 上下文优化）
```

### 选型指导与最佳实践

- **`--json`**：输出合法的单个完整 JSON 对象或数组，所有数值保持原始基本数据类型（浮点数与整型不转为字符串），布尔状态明确，适合各种编程语言或 AI Agent 的 JSON 解析器消费。
- **`--text`**：系统会过滤所有无意义的边界框线与 JSON 括号，仅以 `Field Name: Value` 的极简自然语言格式成段输出。

---

## 二、统一 JSON 响应信封结构 (Response Envelope Schema)

无论调用哪一条 CLI 命令，当 `--json` 被开启时，最外围 JSON 数据结构必须遵守全局统一的响应信封规约。通过固定响应契约，AI Agent 的工具调用解析层只需编写同一套逻辑即可解析任意返回信息。

### 2.1 成功响应格式 (Success Response)
```json
{
  "ok": true,
  "command": "info",
  "version": "2.2.1",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": {
    // 具体命令返回的业务数据
  }
}
```

### 2.2 列表分页响应格式 (Paginated List Response)
当返回结果为列表集合时，`data` 字段恒定为 `Array` 类型，同时外层附带 `meta` 分页元数据信息：
```json
{
  "ok": true,
  "command": "search",
  "version": "2.2.1",
  "timestamp": "2026-07-03T14:30:00+08:00",
  "data": [
    // 具体命令返回的业务数据
  ],
  "meta": {
    "total": 128,
    "page": 1,
    "limit": 20,
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

为了契合 Linux 传统脚本环境以及现代 CI/CD 自动化检测流，`@jigubao/cli` 严格划分并映射了命令执行的终态退出码（Exit Code）。每个退出码都对应明确的 AI Agent 处理策略，便于智能体进行精准的分支决策与自动恢复：

| 退出码 | 含义 | AI Agent 处理方式 |
|--------|------|-------------------|
| `0` | 成功 | 继续解析 JSON `data` |
| `1` | 一般错误（网络超时、数据源异常等） | 读取 `error.code` 决定是否重试 |
| `2` | 参数错误（缺必填参数、格式不合法） | 不重试，修正参数后重新调用 |
| `3` | 认证失败（token 过期、未登录） | 触发重新认证流程 |
| `4` | 资源不存在（基金代码无效、分组ID不存在） | 不重试 |
| `5` | 限流（每日 OCR 上限等） | 等待后重试或放弃 |

:::tip

在编写自动化运维监控 Shell 脚本时，可利用 `$?` 检查退出码。如果返回值是 `1`（一般错误），你的脚本或 AI Agent 应读取 `error.code` 决定是否重试；如果返回值是 `4`（资源不存在），则可以直接放弃而无须无效重试；遇到 `5`（限流）时应等待一段时间后再重试。

:::

---

## 四、高级进阶筛选与管道流式操作

### 4.1 `--pipe` 与命令行管道的深度串联
利用JSON 过滤，能够轻易将基估宝与其他工具（如 `jq`、`awk`、`xargs`、`curl`、`bc`、微信通知机器人）串联打造自动化投资监控流水线：

```bash
# 案例：查询个人持仓列表中今日估盈大于 1000 元的标的，并通过管道发送 Webhook 消息
jgb holding list --json | jq -r '.data.holdings[] | select(.profit > 1000) | "\(.name): 今日盈利 \(.profit)元"' | while read msg; do
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
└── jgb holding list          # 账户持仓查询与对账
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
执行一键式的全方位自动化健康排查。系统将按顺序验证 Node.js 运行时兼容性、配置目录读写权限、本地缓存 SQLite 数据库完整性、当前账号的会员身份与到期状态、以及与天天基金、新浪财经、Supabase 云端 API 等外部依赖服务的连通延迟。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | flag | 否 | 以 JSON 结构化报告形式返回自检结果，适合 CI/CD 流程检查 |
| `--fix`  | flag | 否 | 尝试自动修复发现的非致命性本地问题（如重建损坏的轻量数据库索引） |

#### 使用示例 (Examples)
```bash
# 执行日常自检
jgb doctor
```

#### 输出格式 (Output)
**表格/终端彩色报告输出**：
```
基估宝 CLI 环境诊断结果
─────────────────────────────────────────────────────────────
✔ [运行环境]   Node.js 运行时版本 v20.11.0 满足要求 (>=18.0.0)
✔ [文件权限]   目录 ~/.jgb 读写权限正常
✔ [本地数据库] 本地轻量缓存库 cache.db 表结构校验完好
✔ [行情连通性] 天天基金 (ttjj) HTTP 接口连通正常 [延迟: 45ms]
✔ [行情连通性] 新浪财经 (sina) HTTP 接口连通正常 [延迟: 38ms]
✔ [云端认证]   Supabase Auth 认证服务连通且 Token 有效
✔ [会员身份]   当前为 Pro 会员，到期时间：2027-03-15 23:59:59
─────────────────────────────────────────────────────────────
🎉 恭喜！当前所有系统与网络依赖状态健康，CLI 可以完美运行！
```

**JSON 结构化输出 (`--json`)**：
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
      { "name": "api_sina", "status": "ok", "latencyMs": 38 },
      {
        "name": "membership",
        "status": "ok",
        "message": "Pro 会员有效",
        "plan": "pro",
        "expireAt": "2027-03-15T23:59:59+08:00",
        "daysRemaining": 620
      }
    ]
  }
}
```

:::info 会员状态判定说明

`membership` 检查项的 `status` 字段会根据当前账号会员状态返回不同取值，便于 AI Agent 或脚本据此执行差异化策略：

| `status` | 含义 | 终端报告示例 |
| :--- | :--- | :--- |
| `ok` | 已登录且为有效 Pro 会员 | `✔ [会员身份] 当前为 Pro 会员，到期时间：2027-03-15 23:59:59` |
| `warn` | 会员即将到期（剩余天数 ≤ 7 天） | `⚠ [会员身份] Pro 会员将于 3 天后到期，请及时续费` |
| `expired` | 会员已过期，当前为免费版 | `✖ [会员身份] Pro 会员已于 2026-06-30 过期，部分功能受限` |
| `unauthenticated` | 未登录或 Token 失效，无法获取会员信息 | `✖ [会员身份] 未检测到登录态，请先执行 jgb login` |

:::
