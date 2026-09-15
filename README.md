# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## 文档搜索

右上角的搜索框支持中文和英文全文搜索，覆盖 `docs/` 下的使用帮助及 CLI 文档。可使用 `Ctrl+K`（macOS 为 `⌘K`）聚焦搜索框，并用方向键和回车选择结果。

搜索索引在构建时自动生成，新增或修改文档后重新构建即可更新，无需外部搜索服务。`npm start` 开发模式不生成搜索索引；请运行 `npm run build && npm run serve` 验证搜索功能。

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
