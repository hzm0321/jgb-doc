---
sidebar_position: 1
title: CLI 快速上手与概览
sidebar_label: 1. 快速上手与概览
---

# CLI 快速上手与概览

欢迎使用 **基估宝命令行工具 (`jgb-cli`)**！这是一个专为广大开发者、终端爱好者以及 AI Agent 自主调用设计的高效命令行接口，能够帮助你在无需打开浏览器的情况下，实时查询全网基金净值、大盘指数、个人持仓估值以及交易流水，轻松将其集成到 Shell 脚本、自动化工作流或 AI 大模型驱动的投资分析系统中。

---

## 一、安装与配置

### 1.1 安装方式

推荐使用 Node.js 官方包管理器进行全局安装（需 Node.js >= 18.0.0）：

```bash
# 使用 npm 安装
npm install -g @jgb/cli

# 使用 pnpm 安装
pnpm add -g @jgb/cli

# 使用 yarn 安装
yarn global add @jgb/cli
```

如果你临时不想安装包，也可直接通过 `npx` 体验：

```bash
npx @jgb/cli search "易方达蓝筹"
```

### 1.2 环境配置与数据存储

CLI 运行时会在用户主目录下创建 `~/.jgb/` 目录，用于持久化本地配置缓存与用户偏好（替代 Web 端的 LocalStorage/IndexedDB 机制）：
- `~/.jgb/config.json`: 全局用户偏好配置（数据源选项、超时设置等）。
- `~/.jgb/cache.db`: 本地轻量化 SQLite/JSON 数据缓存。

如果你需要跨多端同步数据，可配置以下环境变量（建议写入 `~/.bashrc` 或 `~/.zshrc`）：

```bash
export JGB_TOKEN="your_supabase_auth_token"
export JGB_DEFAULT_FORMAT="table" # 可选值: table, json, jsonl, csv, text
```

---

## 二、全局语法与通用选项

`jgb-cli` 命令结构采用标准的双层或多层命名空间体系：

```bash
jgb <command> [subcommand] [arguments] [options]
```

### 全局通用选项 (Global Flags)

无论调用哪个具体功能命令，以下通用参数选项均可在任意指令中挂载支持：

| 选项 (Flag) | 参数类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--format <type>` | string | `table` | 格式化输出，支持 `table`（人类可读表格）、`json`（结构化）、`jsonl`（流式行）、`csv`、`text`（自然语言摘要） |
| `--filter <expr>` | string | `null` | 通用条件过滤表达式，如 `--filter "gszzl > 1.0"` |
| `--page <num>` | number | `1` | 列表查询时的页码（仅对分页列表命令生效） |
| `--page-size <num>` | number | `20` | 每页返回的数据条目数上限 |
| `-h, --help` | boolean | `false` | 显示当前命令或子命令的详细帮助手册与参数树 |
| `-v, --version` | boolean | `false` | 显示当前 CLI 的版本号及内部内核信息 |

---

## 三、系统运维与环境管理指令

### 3.1 `jgb version` —— 查看版本号与内核信息

#### 语法 (Synopsis)
```bash
jgb version [options]
```

#### 描述 (Description)
输出当前安装的命令行客户端版本号、底层的基本面内核版本以及正在使用的 Node.js 运行时环境信息。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | flag | 否 | 以标准 JSON 结构化格式输出版本详情 |
| `--short` | flag | 否 | 仅输出裸版本号字符串（如 `2.2.1`），方便脚本赋值 |

#### 使用示例 (Examples)
```bash
# 常规查看
jgb version

# 在 Shell 脚本中快速提取版本号
VER=$(jgb version --short)
echo "Current JGB CLI Version: $VER"
```

#### 输出格式 (Output)
**表格/常规文本输出**：
```
JGB CLI Client:   v2.2.1
Core Engine:      v2.2.0
Node.js Runtime:  v20.11.0 (darwin-arm64)
Config Path:      /Users/username/.jgb/config.json
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "version",
  "timestamp": "2026-07-03T14:00:00+08:00",
  "data": {
    "cliVersion": "2.2.1",
    "coreVersion": "2.2.0",
    "nodeVersion": "v20.11.0",
    "platform": "darwin-arm64",
    "configDir": "/Users/username/.jgb"
  }
}
```

---

### 3.2 `jgb auth status` —— 查看账户认证状态

#### 语法 (Synopsis)
```bash
jgb auth status [options]
```

#### 描述 (Description)
检查当前用户的会话令牌（Token）有效性及 Supabase 云端账户认证连接状态。若未登录，将明确返回未认证信息。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | flag | 否 | 以标准 JSON 格式输出认证状态数据 |

#### 使用示例 (Examples)
```bash
# 检查当前是否已登录
jgb auth status

# 结合 jq 断言是否已认证
jgb auth status --json | jq -r '.data.authenticated'
```

#### 输出格式 (Output)
**表格/常规文本输出**：
```
认证状态:   已登录
用户 ID:    user-abc-12345
邮箱地址:   developer@example.com
云端提供商: Supabase Auth
令牌到期:   2026-08-01 12:00:00
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "auth status",
  "timestamp": "2026-07-03T14:00:00+08:00",
  "data": {
    "authenticated": true,
    "userId": "user-abc-12345",
    "email": "developer@example.com",
    "provider": "supabase",
    "expiresAt": "2026-08-01T12:00:00Z"
  }
}
```

---

### 3.3 `jgb sync status` —— 查看数据云同步状态

#### 语法 (Synopsis)
```bash
jgb sync status [options]
```

#### 描述 (Description)
查询本地配置缓存与云端数据库（Supabase）之间的数据同步状态、上次成功同步的时间戳以及双方数据版本的一致性。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | flag | 否 | 以标准 JSON 格式输出同步元数据 |

#### 使用示例 (Examples)
```bash
# 检查数据是否存在未同步差异
jgb sync status
```

#### 输出格式 (Output)
**表格/常规文本输出**：
```
同步状态
─────────────────────────────
认证状态:     已登录 (user-abc-12345)
上次同步:     2026-07-03 09:30:00
本地版本:     168
云端版本:     168
数据一致性:   一致
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "sync status",
  "timestamp": "2026-07-03T14:00:00+08:00",
  "data": {
    "status": "in_sync",
    "lastSyncedAt": "2026-07-03T09:30:00+08:00",
    "localVersion": 168,
    "remoteVersion": 168,
    "isDirty": false
  }
}
```

---

### 3.4 `jgb config get` —— 查询系统默认参数配置

#### 语法 (Synopsis)
```bash
jgb config get <key> [options]
```

#### 描述 (Description)
读取本地配置文件中指定配置项（如默认数据源偏好、网络请求超时等）的值。若不指定具体 `key`，则列出全部配置参数。

#### 参数与选项 (Arguments & Options)
| 参数/选项 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `<key>` | string | 否 | 配置键名（可选：`defaultSource`、`timeout`、`refreshInterval`、`proxy`）。不传则展示全量配置 |
| `--json` | flag | 否 | 以 JSON 格式输出结果 |

#### 使用示例 (Examples)
```bash
# 查看所有当前配置项
jgb config get

# 单独提取默认数据源设置
jgb config get defaultSource
```

#### 输出格式 (Output)
**表格/常规文本输出**：
```
配置项            当前设置值         说明
──────────────────────────────────────────────────────────
defaultSource     1                 默认数据源：1=天天基金, 2=新浪估算
timeout           8000              HTTP 请求超时时间 (毫秒)
refreshInterval   60                实时监控模式默认刷新频率 (秒)
proxy             (空)              HTTP 代理服务器地址
```

**JSON 结构化输出 (`--format json`)**：
```json
{
  "ok": true,
  "command": "config get",
  "timestamp": "2026-07-03T14:00:00+08:00",
  "data": {
    "defaultSource": 1,
    "timeout": 8000,
    "refreshInterval": 60,
    "proxy": null
  }
}
```

---

## 四、功能边界与路线图 (Roadmap)

为了让开发者、运维人员以及 AI Agent 在调用时获得绝对稳定、无破坏性的体验，`jgb-cli` **v1 版本**的核心定位为 **“高频只读查询能力与自动化集成基座”**。当前全量开放的所有命令均保证零副作用（Side-effect Free），绝不会对用户的账户数据、自选列表或云端存储造成不可逆修改。

针对部分进阶的“修改账户数据（写操作）”与“双向交互能力”，团队已经完成了底层核心算法的封装，并统一规划于后继版本中陆续开放。以下为 **CLI 路线图 (Roadmap)**：

| 命令命名空间 | 规划中命令 (Planned Command) | 目标版本 | 功能预期与使用描述 |
| :--- | :--- | :--- | :--- |
| **持仓管理** | `jgb portfolio add <code> <share> <cost>` | v2.0 | 向个人账户录入新基金持仓份额与成本净值 |
| **持仓管理** | `jgb portfolio update <code> <value>` | v2.0 | 更新现有持仓份额、成本或调整所属分组成员 |
| **持仓管理** | `jgb portfolio clear [code]` | v2.0 | 清除指定基金持仓或一键清空全部虚拟仓位 |
| **交易流水** | `jgb trade buy <code> --amount <amt>` | v2.0 | 快捷记录即时买入流水，自动重新加权计算平均成本 |
| **交易流水** | `jgb trade sell <code> --share <num>` | v2.0 | 快捷记录卖出流水，实现收益结转与剩余份额更新 |
| **交易流水** | `jgb trade remove <txn-id>` | v2.0 | 撤销或删除指定的历史申赎交易记录 |
| **定投管理** | `jgb dca plan create/toggle` | v2.1 | 从终端创建智能定投计划，或一键暂停/启用指定定投任务 |
| **自选与分组** | `jgb watchlist add/remove <code>` | v2.1 | 将基金快捷关注至自选池或移出一键观察 |
| **自选与分组** | `jgb group create/edit/delete <name>` | v2.1 | 自定义创建持仓与自选的分组体系，调整排布逻辑 |
| **数据同步** | `jgb sync push` / `jgb sync pull` | v2.2 | 手动触发本地数据库与 Supabase 云端的全量双向同步覆盖 |
