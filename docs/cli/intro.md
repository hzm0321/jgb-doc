---
sidebar_position: 1
title: CLI 快速上手与概览
sidebar_label: 1. 快速上手与概览
---

# CLI 快速上手与概览

欢迎使用 **基估宝命令行工具 (`@jigubao/cli`)**。这是一个专为`基估宝 Pro 会员用户`设计的高效命令行接口。能够帮助你在无需打开浏览器的情况下，实时查询全网基金净值、大盘指数、个人持仓估值以及交易流水，轻松将其集成到 Shell 脚本、自动化工作流或 AI 大模型驱动的投资分析系统中。

---

## 一、安装登录与配置

### 1.1 安装方式

推荐使用 Node.js 官方包管理器进行全局安装（需 Node.js >= 20.9.0）：

```bash
# 使用 npm 安装
npm install -g @jigubao/cli

# 使用 pnpm 安装
pnpm add -g @jigubao/cli

# 使用 yarn 安装
yarn global add @jigubao/cli
```

安装完成后，可通过以下命令验证是否安装成功：

```bash
jgb -v
# 输出示例: 1.0.0
```

若终端正确打印出版本号，说明 CLI 已全局安装成功，可以开始使用。如果提示找不到命令，请检查 Node.js 环境变量与全局 `bin` 路径是否已正确配置。

### 1.2 登录认证与会话管理

`@jigubao/cli` 采用基于 Supabase Auth 的云端身份认证体系。安装完成后，你需要先完成登录以绑定基估宝 Pro 会员账号，从而解锁持仓查询、交易流水、定投记录等个人账户相关功能。公开的基金行情查询指令（如 `search`、`info`、`market`）无需登录即可直接使用。

CLI 提供以下认证管理指令：

| 指令 | 说明 |
| :--- | :--- |
| `jgb login` | 启动交互式邮箱验证码登录流程，通过邮箱接收 6 位 OTP 验证码完成 Supabase 身份认证，认证成功后将 Token 持久化保存至本地 `~/.jgb-cli/` 目录 |
| `jgb login password` | 账号密码登录，通过邮箱和密码直接登录 Supabase 账号，无需验证码。支持 `--email` 和 `--password` 参数实现非交互式直接登录 |
| `jgb logout` | 清除本地保存的登录凭证与会话 Token，退出当前账号登录状态 |
| `jgb status` | 查看当前登录状态，显示已登录账号的邮箱、会员等级及到期时间；若未登录则提示需要先执行 `jgb login` |

#### 使用示例

```bash
# 方式一：邮箱验证码登录（交互式）
jgb login

# 方式二：账号密码登录（交互式，逐步提示输入邮箱和密码）
jgb login password

# 方式三：账号密码直接登录（非交互式，适合脚本自动化）
jgb login password --email user@example.com --password mypassword123

# 方式四：仅传入邮箱，交互式输入密码
jgb login password --email user@example.com

# 查看当前登录状态与会员信息
jgb status

# 退出登录，清除本地凭证
jgb logout
```

:::note
`login` 与 `login password` 及 `logout` 指令为交互式操作，不支持 `--json` / `--text` 结构化输出模式。`status` 指令支持结构化输出，可通过 `jgb status --json` 获取机器可读的会话信息，便于在自动化脚本或 AI Agent 流程中进行登录态前置检查。
:::

:::tip 账号密码登录参数
`jgb login password` 支持以下选项参数，实现非交互式直接登录，便于在 CI/CD 流水线或 Shell 脚本中自动化使用：

| 选项 | 参数类型 | 默认值 / 省略时行为 | 说明 |
| :--- | :--- | :--- | :--- |
| `--email <email>` | string | 无默认邮箱；交互询问邮箱 | 指定登录邮箱地址，跳过交互式邮箱输入提示 |
| `--password <password>` | string | 无默认密码；交互询问密码 | 指定登录密码，跳过交互式密码输入提示 |

当两个参数同时提供时，完全不触发交互式提示，直接调用 Supabase Auth 完成登录；仅提供一个参数时，另一个仍通过交互式提示输入。
:::

---

### 1.3 环境配置与数据存储

CLI 运行时会在用户主目录下创建 `~/.jgb-cli/` 目录，用于持久化本地配置缓存与用户偏好（替代 Web 端的 LocalStorage/IndexedDB 机制）：
- `~/.jgb-cli/config.json`: 全局用户偏好配置（数据源选项、超时设置等）。

---

## 二、全局语法与通用选项

各命令的参数表通过“是否必填”和“默认值 / 省略时行为”分别说明参数要求与省略后的行为。可选参数不一定默认为 `0` 或空值：有些会保留原值、处理全部记录，或根据其他参数计算。布尔开关默认为 `false`，表示未启用；必填参数没有默认值。

`@jigubao/cli` 命令结构采用标准的双层或多层命名空间体系：

```bash
jgb <command> [subcommand] [arguments] [options]
```

### 全局通用选项 (Global Flags)

无论调用哪个具体功能命令，以下通用参数选项均可在任意指令中挂载支持（注：`login`、`login password` 与 `logout` 指令不支持结构化输出模式）：

| 选项 (Flag) | 参数类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `--json` | boolean | `false` | 以结构化 JSON 格式输出结果，同时禁用所有交互式 UI 动画与引导文字，适用于 jq、管道操作及程序化自动化处理 |
| `--text` | boolean | `false` | 以纯文本格式输出结果，去除控制台颜色和特殊 UI 符号，生成结构清晰的文字摘要，专为 LLM / AI Agent 优化消费 |
| `-h, --help` | boolean | `false` | 显示当前 CLI 工具或指定具体子命令的详细帮助手册与参数用法 |
| `-v, --version` | boolean | `false` | 显示当前 jgb 命令行工具的版本号（直接打印纯数字版本，不包含额外装饰字符） |

---

## 三、功能边界与路线图 (Roadmap)

CLI v2 在保留查询命令的基础上支持修改账户数据。CLI 会作为独立设备，每次修改前自动同步最新云端数据；如果确认期间其他设备更新了数据，本次修改会停止，请重新运行并核对预览。

完整指令参见[交易与账户写操作](./operations)，跨端使用前请阅读[设备同步与冲突处理](./sync)。脚本提交使用 `--yes`，接管其他设备另需 `--takeover`；可视化终端的 `--dry-run` 草稿可确认执行或取消，`--dry-run --json` / `--dry-run --text` 及非交互环境仅预览。

---

## 四、微信交流群与社区反馈

`@jigubao/cli` 的持续演进离不开每一位开发者的真实反馈与实战经验分享。为此，我们建立了「基估宝 CLI 用户支持群」，这是一个专为 Pro 会员、CLI 开发者及自动化投资爱好者打造的专属技术社群。在这里，你可以：

- 📣 **第一时间获取版本动态**：CLI 版本更新公告、新功能预告与破坏性变更说明均会在群内同步首发。
- 🤝 **交流实战经验**：与同行探讨 Shell 脚本自动化流水线搭建、AI Agent 集成模式、定投策略回测等进阶玩法。
- 🐛 **加速问题反馈**：在使用中遇到的 Bug、数据源异常或功能建议，可直接在群内 @官方成员，获得更快的响应与跟进。
- 💡 **参与产品共建**：优质的功能建议与场景需求有机会被纳入正式 Roadmap，你的声音将直接影响 CLI 的演进方向。

扫描下方二维码，即可直接加入「基估宝 CLI 用户支持群」：

<div align="center">
    <img src={require('./assets/WeChat.jpg').default} alt="CLI 群" width="40%" />
</div>
