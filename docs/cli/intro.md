---
sidebar_position: 1
title: CLI 快速上手与概览
sidebar_label: 1. 快速上手与概览
---

# CLI 快速上手与概览

欢迎使用 **基估宝命令行工具 (`@jigubao/cli`)**。这是一个专为广大开发者、终端爱好者以及 AI Agent 自主调用设计的高效命令行接口，能够帮助你在无需打开浏览器的情况下，实时查询全网基金净值、大盘指数、个人持仓估值以及交易流水，轻松将其集成到 Shell 脚本、自动化工作流或 AI 大模型驱动的投资分析系统中。

---

## 一、安装与配置

### 1.1 安装方式

推荐使用 Node.js 官方包管理器进行全局安装（需 Node.js >= 18.0.0）：

```bash
# 使用 npm 安装
npm install -g @jigubao/cli

# 使用 pnpm 安装
pnpm add -g @jigubao/cli

# 使用 yarn 安装
yarn global add @jigubao/cli
```

如果你临时不想安装包，也可直接通过 `npx` 体验：

```bash
npx @jigubao/cli search "易方达蓝筹"
```

### 1.2 环境配置与数据存储

CLI 运行时会在用户主目录下创建 `~/.jgb/` 目录，用于持久化本地配置缓存与用户偏好（替代 Web 端的 LocalStorage/IndexedDB 机制）：
- `~/.jgb/config.json`: 全局用户偏好配置（数据源选项、超时设置等）。

---

## 二、全局语法与通用选项

`@jigubao/cli` 命令结构采用标准的双层或多层命名空间体系：

```bash
jgb <command> [subcommand] [arguments] [options]
```

### 全局通用选项 (Global Flags)

无论调用哪个具体功能命令，以下通用参数选项均可在任意指令中挂载支持（注：login 与 logout 指令不支持结构化输出模式）：

| 选项 (Flag) | 参数类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | boolean | `false` | 以结构化 JSON 格式输出结果，同时禁用所有交互式 UI 动画与引导文字，适用于 jq、管道操作及程序化自动化处理 |
| `--text` | boolean | `false` | 以纯文本格式输出结果，去除控制台颜色和特殊 UI 符号，生成结构清晰的文字摘要，专为 LLM / AI Agent 优化消费 |
| `-h, --help` | boolean | `false` | 显示当前 CLI 工具或指定具体子命令的详细帮助手册与参数用法 |
| `-v, --version` | boolean | `false` | 显示当前 jgb 命令行工具的版本号（直接打印纯数字版本，不包含额外装饰字符） |

---

## 三、功能边界与路线图 (Roadmap)

为了让开发者、运维人员以及 AI Agent 在调用时获得绝对稳定、无破坏性的体验，`@jigubao/cli` **v1 版本**的核心定位为 **“高频只读查询能力与自动化集成基座”**。当前全量开放的所有命令均保证零副作用（Side-effect Free），绝不会对用户的账户数据、自选列表或云端存储造成不可逆修改。

针对部分进阶的“修改账户数据（写操作）”与“双向交互能力”，团队已经完成了底层核心算法的封装，并统一规划于后继版本中陆续开放。以下为 **CLI 路线图 (Roadmap)**：

| 命令命名空间 | 规划中命令 (Planned Command) | 目标版本 | 功能预期与使用描述 |
| :--- | :--- | :--- | :--- |
| **持仓管理** | `jgb holding update <code> <value> [cost]` | v2.0 | 向个人账户录入或更新基金持仓份额与成本净值 |
| **持仓管理** | `jgb holding clear <code>` | v2.0 | 清除指定基金持仓及相关交易记录 |
| **交易流水** | `jgb trade buy <code> --amount <amt>` | v2.0 | 快捷记录即时买入流水，自动重新加权计算平均成本 |
| **交易流水** | `jgb trade sell <code> --share <num>` | v2.0 | 快捷记录卖出流水，实现收益结转与剩余份额更新 |
| **交易流水** | `jgb trade remove <txn-id>` | v2.0 | 撤销或删除指定的历史申赎交易记录 |
| **定投管理** | `jgb dca plan create/toggle` | v2.1 | 从终端创建智能定投计划，或一键暂停/启用指定定投任务 |
| **自选与分组** | `jgb watchlist add/remove <code>` | v2.1 | 将基金快捷关注至自选池或移出一键观察 |
| **自选与分组** | `jgb group create/edit/delete <name>` | v2.1 | 自定义创建持仓与自选的分组体系，调整排布逻辑 |
| **数据同步** | `jgb sync push` / `jgb sync pull` | v2.2 | 手动触发本地数据库与 Supabase 云端的全量双向同步覆盖 |
