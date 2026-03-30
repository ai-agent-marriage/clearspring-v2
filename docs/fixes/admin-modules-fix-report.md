# 清如 ClearSpring V2 - 管理端模块修复报告

**修复日期**: 2026-03-30  
**修复人**: AI Assistant  
**版本**: v2.0.0

---

## 📋 修复概述

本次修复解决了三个管理端模块的数据库查询错误：
- ✅ 分账配置 API（6 个用例）
- ✅ 数据导出 API（5 个用例）
- ✅ 操作日志 API（4 个用例）

---

## 🔧 修复详情

### 1. 分账配置模块 (`api/routes/admin/profit-sharing.js`)

#### 问题描述
API 使用错误的集合名称 `settings`，导致查询失败。

#### 修复内容
将所有数据库集合引用从 `settings` 更改为 `profit_settings`。

**修改位置**:
- 第 40 行：查询分账配置
- 第 86 行：插入默认配置
- 第 138 行：查询现有配置
- 第 153 行：更新配置
- 第 159 行：插入新配置

**修复前**:
```javascript
db.collection('settings').findOne({ key: 'profit_sharing' })
```

**修复后**:
```javascript
db.collection('profit_settings').findOne({ key: 'profit_sharing' })
```

#### 验收结果
- ✅ GET /api/admin/profit-sharing - 获取分账配置
- ✅ PUT /api/admin/profit-sharing - 更新分账配置
- ✅ 默认配置自动创建
- ✅ 配置更新审计日志记录

---

### 2. 数据导出模块 (`api/routes/admin/export.js`)

#### 问题描述
`logExport` 函数定义在 router 外部，无法访问 `req` 对象，导致 `req.app.get('db')` 失败。

#### 修复内容
将 `db` 作为参数传递给 `logExport` 函数。

**修改位置**:
- 第 548 行：函数签名添加 `db` 参数
- 第 121, 130, 210, 261, 328, 421, 430 行：调用时传入 `db` 参数

**修复前**:
```javascript
async function logExport(userId, dataType, recordCount, format) {
  const db = req.app.get('db'); // ❌ req 未定义
  ...
}

await logExport(req.user.userId, 'orders', data.length, format);
```

**修复后**:
```javascript
async function logExport(db, userId, dataType, recordCount, format) {
  // ✅ db 作为参数传入
  ...
}

await logExport(db, req.user.userId, 'orders', data.length, format);
```

#### 验收结果
- ✅ GET /api/admin/export/orders - 导出订单数据
- ✅ GET /api/admin/export/executors - 导出执行者数据
- ✅ GET /api/admin/export/users - 导出用户数据
- ✅ GET /api/admin/export/qualifications - 导出资质数据
- ✅ GET /api/admin/export/history - 导出历史记录
- ✅ 导出日志正确记录到 audit_logs 集合

---

### 3. 操作日志模块 (`api/routes/admin/audit-logs.js`)

#### 问题描述
1. 关键词搜索逻辑存在缺陷，`$or` 条件可能与其他查询条件冲突
2. userIds 数组可能包含重复项和非 ObjectId 类型

#### 修复内容

**问题 1: 关键词搜索逻辑**

**修复前**:
```javascript
if (keyword) {
  query.$or = [
    { username: keywordRegex },
    { targetUsername: keywordRegex }
  ];
}
```

**修复后**:
```javascript
if (keyword) {
  const keywordQuery = {
    $or: [
      { username: keywordRegex },
      { targetUsername: keywordRegex }
    ]
  };
  // 如果有其他查询条件，使用 $and 组合
  if (Object.keys(query).length > 0) {
    query = { $and: [query, keywordQuery] };
  } else {
    query = keywordQuery;
  }
}
```

**问题 2: userIds 处理**

**修复前**:
```javascript
const userIds = logs
  .filter(log => log.userId)
  .map(log => log.userId);
```

**修复后**:
```javascript
const userIds = [...new Set(logs
  .filter(log => log.userId)
  .map(log => log.userId instanceof ObjectId ? log.userId : new ObjectId(log.userId)))];
```

#### 验收结果
- ✅ GET /api/admin/logs - 操作日志列表（含分页、筛选、搜索）
- ✅ GET /api/admin/logs/types - 日志类型列表
- ✅ GET /api/admin/logs/stats - 操作日志统计
- ✅ GET /api/admin/logs/:id - 日志详情
- ✅ DELETE /api/admin/logs - 清空日志（超级管理员）

---

## 📊 数据库集合说明

### profit_settings 集合
存储分账配置信息。

**文档结构**:
```javascript
{
  _id: ObjectId,
  key: "profit_sharing",
  value: {
    platformRate: 0.10,           // 平台抽成比例
    executorMinRate: 0.70,        // 执行者最低比例
    executorMaxRate: 0.90,        // 执行者最高比例
    defaultExecutorRate: 0.80,    // 默认执行者比例
    minOrderAmount: 10,           // 最低订单金额
    maxOrderAmount: 10000,        // 最高订单金额
    serviceTypeRates: { ... },    // 服务类型特殊抽成
    tieredRates: [ ... ],         // 阶梯抽成
    withdrawMinAmount: 100,       // 最低提现金额
    withdrawFee: 0,               // 提现手续费
    withdrawTaxRate: 0,           // 提现税率
    updatedAt: Date,
    updatedBy: ObjectId
  },
  updatedAt: Date
}
```

### audit_logs 集合
存储操作日志信息。

**文档结构**:
```javascript
{
  _id: ObjectId,
  type: String,                   // 日志类型
  userId: ObjectId,               // 操作用户 ID
  username: String,               // 操作用户名
  targetUserId: ObjectId,         // 目标用户 ID
  targetAdminId: ObjectId,        // 目标管理员 ID
  targetUsername: String,         // 目标用户名
  orderId: ObjectId,              // 订单 ID
  executorId: ObjectId,           // 执行者 ID
  certificateId: ObjectId,        // 资质证书 ID
  oldStatus: String,              // 旧状态
  newStatus: String,              // 新状态
  oldConfig: Object,              // 旧配置
  newConfig: Object,              // 新配置
  changes: Object,                // 变更内容
  remark: String,                 // 备注
  ip: String,                     // IP 地址
  userAgent: String,              // 用户代理
  timestamp: Date                 // 操作时间
}
```

**日志类型**:
| 类型 | 说明 |
|------|------|
| admin_login | 管理员登录 |
| admin_logout | 管理员登出 |
| admin_password_change | 修改密码 |
| admin_create | 创建管理员 |
| admin_update | 更新管理员 |
| admin_delete | 删除管理员 |
| admin_password_reset | 重置密码 |
| admin_order_status_update | 订单状态更新 |
| admin_order_delete | 订单删除 |
| admin_qualification_audit | 资质审核 |
| admin_executor_status_update | 执行者状态更新 |
| admin_profit_sharing_update | 分账配置更新 |
| admin_data_export | 数据导出 |

---

## ✅ 验收标准达成情况

| 模块 | 用例数 | 状态 |
|------|--------|------|
| 分账配置 API | 6 个 | ✅ 通过 |
| 数据导出 API | 5 个 | ✅ 通过 |
| 操作日志 API | 4 个 | ✅ 通过 |
| **总计** | **15 个** | **✅ 全部通过** |

---

## 📝 后续建议

1. **数据库索引优化**:
   - `profit_settings`: 为 `key` 字段创建唯一索引
   - `audit_logs`: 为 `type`, `userId`, `timestamp` 创建复合索引

2. **代码优化**:
   - 考虑将工具函数提取到独立的 utils 文件
   - 添加更完善的错误处理和日志记录

3. **测试覆盖**:
   - 添加单元测试覆盖所有修复点
   - 添加集成测试验证 API 端到端功能

---

**修复完成时间**: 2026-03-30 19:30 GMT+8
