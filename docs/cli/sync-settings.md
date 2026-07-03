---
sidebar_position: 7
title: 7. 系统设置与云同步
sidebar_label: 7. 设置与同步
---

# 7. 系统设置与云同步

## 十七、数据云同步

### 17.1 导出/导入配置（v1 仅查询 status）

**对应源码**: `app/hooks/useSyncManager.js`

**功能**: 将本地配置（基金列表、持仓、分组、标签、定投计划等所有 localStorage 数据）上传到 Supabase 云端，或从云端拉取合并。

**CLI 命令建议**:
```
fund sync push                          # 本地 → 云端
fund sync pull                          # 云端 → 本地
fund sync status                        # 查看同步状态和上次同步时间
```

**输出示例** (`sync status`, table):

```
$ fund sync status

同步状态
─────────────────────────────
认证状态:     已登录 (user-abc-123)
上次同步:     2026-06-16 09:00:00
本地版本:     168
云端版本:     168
数据一致性:   一致
```

**输出示例** (`sync push`, json):

```json
{
  "ok": true,
  "command": "fund sync push",
  "data": {
    "action": "push",
    "keysUpdated": ["funds", "holdings", "tags", "groups"],
    "localVersion": 169,
    "cloudVersion": 169,
    "syncedAt": "2026-06-16T10:30:00+08:00"
  }
}
```

---

### 17.2 导出数据为 JSON（v1 暂不开放）

**CLI 命令建议**:
```
fund export --output backup.json        # 导出所有本地数据
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund export",
  "data": {
    "outputPath": "./backup.json",
    "fileSize": "2.3MB",
    "exportedKeys": ["funds", "tags", "favorites", "groups", "holdings", "groupHoldings", "transactions", "dcaPlans", "customSettings"],
    "exportedAt": "2026-06-16T10:30:00+08:00"
  }
}
```

---

### 17.3 导入数据（v1 暂不开放）

**CLI 命令建议**:
```
fund import --file backup.json          # 导入数据
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund import",
  "data": {
    "filePath": "./backup.json",
    "importedKeys": ["funds", "tags", "favorites", "groups", "holdings"],
    "skippedKeys": ["customSettings"],
    "mergeStrategy": "overwrite",
    "importedAt": "2026-06-16T10:30:00+08:00"
  }
}
```

---


---

## 十八、用户认证

### 18.1 登录/登出（v1 认证辅助）

**对应源码**: `app/components/LoginModal.jsx`、Supabase Auth

**功能**: 通过 Supabase 邮箱验证码登录，支持设备间数据同步。

**CLI 命令建议**:
```
fund login --email user@example.com     # 发送验证码
fund login --email user@example.com --code 123456  # 完成登录
fund logout
fund whoami                             # 查看当前登录用户
```

**输出示例** (`login` 第一步, json):

```json
{
  "ok": true,
  "command": "fund login",
  "data": {
    "status": "code_sent",
    "email": "user@example.com",
    "message": "验证码已发送，请查看邮箱"
  }
}
```

**输出示例** (`whoami`, json):

```json
{
  "ok": true,
  "command": "fund whoami",
  "data": {
    "authenticated": true,
    "userId": "user-abc-123",
    "email": "user@example.com",
    "lastLoginAt": "2026-06-16T09:00:00+08:00"
  }
}
```

---


---

## 十九、设置管理

### 19.1 自动刷新间隔（v1 仅查询 get）

**功能**: 设置基金数据自动刷新频率（默认30秒，最低5秒）。

**CLI 命令建议**:
```
fund config get refresh-ms
fund config set refresh-ms 60000
```

**输出示例** (`config get`, json):

```json
{
  "ok": true,
  "command": "fund config get",
  "data": {
    "key": "refresh-ms",
    "value": 30000,
    "description": "自动刷新间隔(毫秒)",
    "range": "5000-300000",
    "default": 30000
  }
}
```

---

### 19.2 数据源切换（v1 仅查询当前数据源）

**对应源码**: `app/components/FundDataSourceSelector.jsx`

**功能**: 为单只基金切换估值数据源（天天基金/新浪2/新浪3）。

**CLI 命令建议**:
```
fund source <code>                      # 查看当前数据源
fund source <code> --set 2              # 切换到新浪数据源2
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund source",
  "data": {
    "fundCode": "005827",
    "currentSource": 1,
    "sourceName": "天天基金 (fundgz)",
    "availableSources": [
      { "id": 1, "name": "天天基金", "description": "fundgz JSONP" },
      { "id": 2, "name": "新浪估算2", "description": "sina growthrate" },
      { "id": 3, "name": "新浪估算3", "description": "sina growthrate2" }
    ]
  }
}
```

---


---

## 二十、版本检查

### 20.1 检查最新版本（v1）

**对应源码**: `app/api/fund.js` → `fetchLatestRelease()`

**CLI 命令建议**:
```
fund version                            # 当前版本
fund version --check                    # 检查是否有更新
```

**输出示例** (`version --check`, table):

```
$ fund version --check

当前版本:    2.2.1
最新版本:    2.3.0
状态:        有更新可用
发布日期:    2026-06-15
更新日志:    新增 QDII 估值支持、优化持仓收益计算...

请执行 fund self-update 进行更新
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund version",
  "data": {
    "current": "2.2.1",
    "latest": "2.3.0",
    "updateAvailable": true,
    "releaseDate": "2026-06-15",
    "releaseNotes": "新增 QDII 估值支持、优化持仓收益计算..."
  }
}
```

---


---

## 十二、OCR / 截图识别导入

### 12.1 截图识别基金（v1 暂不开放导入）

**对应源码**: `app/lib/ocr.js`、`app/hooks/useScanImport.js`、`app/api/fund.js` → `parseFundTextWithLLM()`

**功能**: 通过 OCR 识别截图中的基金代码，支持通过 LLM 解析文本提取基金信息。

**CLI 命令建议**:
```
fund scan import <image-path>           # 识别截图中的基金
fund scan import --text "基金文本内容"   # 从文本解析
```

**限制**: 有每日 OCR 用量限制（默认5次/天），通过 Supabase ocr_daily_usage 表跟踪。

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund scan import",
  "data": {
    "ocrRemaining": 3,
    "detectedFunds": [
      { "code": "005827", "name": "易方达蓝筹精选混合", "confidence": 0.95 },
      { "code": "000001", "name": "易方达价值成长混合", "confidence": 0.88 }
    ],
    "totalDetected": 2
  }
}
```

---


---

