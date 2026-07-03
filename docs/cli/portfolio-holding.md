---
sidebar_position: 4
title: 4. 持仓、分组与自选管理
sidebar_label: 4. 持仓与分组
---

# 4. 持仓、分组与自选管理

## 三、持仓管理

### 3.1 添加/编辑持仓（v1 暂不开放）

**对应源码**: `src/portfolio.ts` → `updateHolding()`

**功能**: 设置某只基金的持仓份额和成本价（单位净值）。支持分组持仓和按金额录入。

**CLI 命令**:
```bash
jgb holding update <code> <value> [cost] [--group <group>] [--amount] [--json] [--text]
jgb holding update 005827 1000 1.2345                    # 按份额更新全局持仓
jgb holding update 005827 1000 1.2345 --amount           # 按金额更新（自动计算份额）
jgb holding update 005827 1000 1.2345 --group 哈哈哈      # 更新分组持仓
jgb holding update 005827 1000 1.2345 --group <groupId>  # 按分组 ID 更新
jgb holding update 005827 1000 1.2345 --json
jgb holding update 005827 1000 1.2345 --text
```

**参数**:
- `code`（必填）：基金代码
- `value`（必填）：持有份额或金额
- `cost`（可选）：成本净值
- `--group <group>`（可选）：分组 ID 或分组名称
  - 支持分组 ID 和分组名称
  - 如果分组名称存在多个相同名称，会报错提示使用分组 ID
- `--amount`（可选）：按金额录入，自动计算份额
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (json):

```json
{
  "ok": true,
  "command": "holding update",
  "data": {
    "code": "005827",
    "share": 810.04,
    "cost": 1.2345,
    "group": "全部"
  }
}
```

**输出示例** (text):

```
已更新基金 005827 的持仓: 份额 810.04 成本价 1.2345 分组: 全部
```

---

### 3.2 查看持仓列表（v1）

**对应源码**: `src/portfolio.ts` → `getHoldingsList()`

**功能**: 列出当前所有持仓基金及其份额、成本、持仓金额。支持分组持仓查询。

**CLI 命令**:
```bash
jgb holding list [--group <group>] [--json] [--text]
jgb holding list                    # 查看全部持仓
jgb holding list --group 哈哈哈      # 按分组名称查看
jgb holding list --group <groupId>  # 按分组 ID 查看
jgb holding list --json
jgb holding list --text
```

**参数**:
- `--group <group>`（可选）：分组 ID 或分组名称，查看指定分组的持仓
  - 支持分组 ID 和分组名称
  - 如果分组名称存在多个相同名称，会报错提示使用分组 ID
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (table):

```
$ jgb holding list

代码       名称                 份额        成本净值    持仓金额     持有收益     收益率     分组
────────────────────────────────────────────────────────────────────────────────────────────────────
110022    易方达消费行业股票    1000.00     1.5000      ¥2680.00     +1180.00     +78.67%   全部
502056    广发中证医疗ETF联接A  148.21      0.6745      ¥87.21       -12.76       -12.77%   全部
001325    鹏华弘和混合A         30.31       1.6498      ¥62.41       +12.41       +24.82%   全部
002849    金信智能中国2025混合A  41.68       2.3993      ¥100.00      +0.00        +0.00%    哈哈哈

合计: 持仓金额 ¥4,091.38  总收益 +1,211.34  收益率 +42.06%
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "holding list",
  "data": {
    "holdings": [
      {
        "code": "110022",
        "name": "易方达消费行业股票",
        "share": 1000.00,
        "cost": 1.5000,
        "amount": 2680.00,
        "profit": 1180.00,
        "profitRate": 78.67,
        "group": "全部"
      },
      {
        "code": "002849",
        "name": "金信智能中国2025混合A",
        "share": 41.68,
        "cost": 2.3993,
        "amount": 100.00,
        "profit": 0.00,
        "profitRate": 0.00,
        "group": "哈哈哈"
      }
    ],
    "summary": {
      "totalAmount": 4091.38,
      "totalProfit": 1211.34,
      "profitRate": 42.06
    }
  }
}
```

**输出示例** (text):

```
110022 易方达消费行业股票 份额:1000.00 成本:1.5000 金额:2680.00 收益:+1180.00 收益率:+78.67% 分组:全部
502056 广发中证医疗ETF联接(LOF)A 份额:148.21 成本:0.6745 金额:87.21 收益:-12.76 收益率:-12.77% 分组:全部
001325 鹏华弘和混合A 份额:30.31 成本:1.6498 金额:62.41 收益:+12.41 收益率:+24.82% 分组:全部
002849 金信智能中国2025混合A 份额:41.68 成本:2.3993 金额:100.00 收益:+0.00 收益率:+0.00% 分组:哈哈哈
合计: 持仓金额 4091.38 总收益 +1211.34 收益率 +42.06%
```

---

### 3.3 清除持仓（v1 暂不开放）

**对应源码**: `src/portfolio.ts` → `clearHolding()`

**功能**: 清除某只基金的持仓数据，同时清除相关交易记录。支持分组持仓。

**CLI 命令**:
```bash
jgb holding clear <code> [--group <group>] [--json] [--text]
jgb holding clear 005827                    # 清除全局持仓
jgb holding clear 005827 --group 哈哈哈      # 清除分组持仓
jgb holding clear 005827 --group <groupId>  # 按分组 ID 清除
jgb holding clear 005827 --json
jgb holding clear 005827 --text
```

**参数**:
- `code`（必填）：基金代码
- `--group <group>`（可选）：分组 ID 或分组名称
  - 支持分组 ID 和分组名称
  - 如果分组名称存在多个相同名称，会报错提示使用分组 ID
- `--json`（可选）：以 JSON 格式输出结果
- `--text`（可选）：以纯文本格式输出结果

**输出示例** (json):

```json
{
  "ok": true,
  "command": "holding clear",
  "data": {
    "code": "005827",
    "clearedHoldings": true,
    "clearedTransactions": 2,
    "group": "全部"
  }
}
```

**输出示例** (text):

```
已清除基金 005827 在分组 全部 的持仓数据
同时清除了 2 条交易记录
```

---


---

## 六、基金分组管理

### 6.1 创建/编辑分组（v1 暂不开放）

**对应源码**: `app/hooks/useGroupActions.js`

**功能**: 创建自定义基金分组，每组包含一组基金代码。分组下可有独立持仓数据。

**CLI 命令建议**:
```
fund group create "我的A组"
fund group rename <groupId> "新名称"
fund group delete <groupId>
```

**输出示例** (`group create`, json):

```json
{
  "ok": true,
  "command": "fund group create",
  "data": {
    "id": "grp-a1b2c3d4",
    "name": "我的A组",
    "codes": [],
    "createdAt": "2026-06-16T10:30:00+08:00"
  }
}
```

---

### 6.2 管理分组成员（v1 仅查询 list/show）

**CLI 命令建议**:
```
fund group add <groupId> <code>
fund group remove <groupId> <code>
fund group list                        # 列出所有分组
fund group show <groupId>              # 展示分组内基金
```

**输出示例** (`group list`, table):

```
$ fund group list

ID                    名称         基金数    持仓金额
grp-a1b2c3d4          我的A组      5         ¥52,340.00
grp-e5f6g7h8          稳健组合     3         ¥31,200.00
grp-i9j0k1l2          进取组合     8         ¥85,600.00
```

**输出示例** (`group show`, json):

```json
{
  "ok": true,
  "command": "fund group show",
  "data": {
    "id": "grp-a1b2c3d4",
    "name": "我的A组",
    "codes": ["005827", "000001", "110011", "260108", "519736"],
    "holdings": {
      "005827": { "share": 10000, "cost": 1.20 },
      "000001": { "share": 8000, "cost": 1.15 }
    },
    "totalAmount": 52340.00,
    "totalProfit": 1240.00
  }
}
```

---

### 6.3 分组内基金排序（v1 暂不开放）

**功能**: 分组内支持自定义拖拽排序（默认排序模式按 group.codes 数组顺序）。

**CLI 命令建议**:
```
fund group reorder <groupId> <code1,code2,code3>
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund group reorder",
  "data": {
    "groupId": "grp-a1b2c3d4",
    "codes": ["005827", "110011", "000001", "260108", "519736"],
    "previousOrder": ["000001", "005827", "110011", "260108", "519736"]
  }
}
```

---

### 6.4 跨分组移动基金（v1 暂不开放）

**对应源码**: `app/components/MoveGroupModal.jsx`

**CLI 命令建议**:
```
fund group move <code> --from <groupId1> --to <groupId2>
```

**输出示例** (json):

```json
{
  "ok": true,
  "command": "fund group move",
  "data": {
    "fundCode": "005827",
    "fromGroupId": "grp-a1b2c3d4",
    "toGroupId": "grp-e5f6g7h8",
    "moved": true
  }
}
```

---


---

## 七、基金标签系统

### 7.1 创建/编辑标签（v1 仅查询 list）

**对应源码**: `app/lib/fundHelpers.js` → `sanitizeTagRowForStorage()`

**功能**: 创建标签（含名称和颜色主题），用于对基金进行自定义分类。标签存储在独立的 `tags` localStorage 键中。

**CLI 命令建议**:
```
fund tag create "科技" --theme blue
fund tag rename <tagId> "新能源"
fund tag delete <tagId>
fund tag list                           # 列出所有标签
```

**输出示例** (`tag list`, table):

```
$ fund tag list

ID                    名称      主题      关联基金数
tag-a1b2c3d4          科技      蓝色      5
tag-e5f6g7h8          消费      绿色      3
tag-i9j0k1l2          医药      红色      4
```

**输出示例** (`tag create`, json):

```json
{
  "ok": true,
  "command": "fund tag create",
  "data": {
    "id": "tag-m3n4o5p6",
    "name": "科技",
    "theme": "blue",
    "fundCodes": []
  }
}
```

---

### 7.2 为基金打标签（v1 仅查询 show）

**CLI 命令建议**:
```
fund tag attach <tagId> <code>
fund tag detach <tagId> <code>
fund tag show <code>                    # 查看某基金的所有标签
```

**输出示例** (`tag show`, table):

```
$ fund tag show 005827

基金: 易方达蓝筹精选混合 (005827)
标签:
  [蓝色] 科技
  [绿色] 消费
  [默认] 核心持仓
```

**输出示例** (`tag show`, json):

```json
{
  "ok": true,
  "command": "fund tag show",
  "data": {
    "fundCode": "005827",
    "tags": [
      { "id": "tag-a1b2c3d4", "name": "科技", "theme": "blue" },
      { "id": "tag-e5f6g7h8", "name": "消费", "theme": "green" },
      { "id": "tag-q7r8s9t0", "name": "核心持仓", "theme": "default" }
    ]
  }
}
```

---

### 7.3 按标签筛选基金（v1）

**CLI 命令建议**:
```
fund tag filter <tagId>                 # 列出该标签下的所有基金
```

**输出示例** (table):

```
$ fund tag filter tag-a1b2c3d4

标签: 科技 [蓝色]
代码       名称                    最新净值    估算涨跌
005827    易方达蓝筹精选混合      1.2345      +0.45%
260108    某半导体混合A          2.1500      +1.23%
012345    某人工智能ETF联接A     1.8700      +0.88%

共 3 只基金
```

---


---

## 十、自选基金管理

### 10.1 添加/移除自选（v1 仅查询 list）

**功能**: 将基金加入收藏（自选），支持只看自选基金的视图。

**CLI 命令建议**:
```
fund fav add <code>
fund fav remove <code>
fund fav list                           # 列出所有自选基金
```

**输出示例** (`fav list`, table):

```
$ fund fav list

代码       名称                    最新净值    估算涨跌    自选时间
005827    易方达蓝筹精选混合      1.2345      +0.45%      2026-01-15
110011    某消费混合A            2.1000      +0.88%      2026-03-20
000001    某成长混合             1.1500      +0.12%      2026-05-01

共 3 只自选基金
```

---


---

