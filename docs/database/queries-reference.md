# 清如 ClearSpring V2 - 数据库查询文档

**文档版本**: 1.0  
**更新日期**: 2026-03-30  
**数据库**: MongoDB (clearspring_v2)

---

## 📚 集合概览

| 集合名称 | 说明 | 主要操作 |
|---------|------|---------|
| profit_settings | 分账配置 | 查询、更新 |
| audit_logs | 操作日志 | 查询、插入、删除 |
| orders | 订单 | 查询、聚合 |
| users | 用户 | 查询 |
| certificates | 资质证书 | 查询 |

---

## 🔍 profit_settings 集合

### 集合用途
存储平台分账配置信息，包括抽成比例、提现规则等。

### 文档结构
```javascript
{
  _id: ObjectId("..."),
  key: "profit_sharing",
  value: {
    platformRate: 0.10,              // 平台抽成比例 (0-1)
    executorMinRate: 0.70,           // 执行者最低比例
    executorMaxRate: 0.90,           // 执行者最高比例
    defaultExecutorRate: 0.80,       // 默认执行者比例
    minOrderAmount: 10,              // 最低订单金额 (元)
    maxOrderAmount: 10000,           // 最高订单金额 (元)
    serviceTypeRates: {              // 服务类型特殊抽成
      cleaning: { platformRate: 0.10, executorRate: 0.85 },
      maintenance: { platformRate: 0.12, executorRate: 0.82 },
      delivery: { platformRate: 0.08, executorRate: 0.88 }
    },
    tieredRates: [                   // 阶梯抽成
      { minOrders: 0, maxOrders: 10, executorRateBonus: 0 },
      { minOrders: 11, maxOrders: 30, executorRateBonus: 0.02 },
      { minOrders: 31, maxOrders: 50, executorRateBonus: 0.03 },
      { minOrders: 51, maxOrders: null, executorRateBonus: 0.05 }
    ],
    withdrawMinAmount: 100,          // 最低提现金额 (元)
    withdrawFee: 0,                  // 提现手续费 (元)
    withdrawTaxRate: 0,              // 提现税率 (0-1)
    updatedAt: ISODate("2026-03-30T10:00:00Z"),
    updatedBy: ObjectId("...")
  },
  updatedAt: ISODate("2026-03-30T10:00:00Z")
}
```

### 常用查询

#### 1. 获取分账配置
```javascript
db.profit_settings.findOne({ key: "profit_sharing" })
```

#### 2. 更新分账配置
```javascript
db.profit_settings.updateOne(
  { key: "profit_sharing" },
  {
    $set: {
      "value.platformRate": 0.12,
      "value.updatedAt": new Date(),
      "value.updatedBy": ObjectId("..."),
      "updatedAt": new Date()
    }
  }
)
```

#### 3. 插入默认配置
```javascript
db.profit_settings.insertOne({
  key: "profit_sharing",
  value: {
    platformRate: 0.10,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80,
    minOrderAmount: 10,
    maxOrderAmount: 10000,
    serviceTypeRates: { ... },
    tieredRates: [ ... ],
    withdrawMinAmount: 100,
    withdrawFee: 0,
    withdrawTaxRate: 0,
    updatedAt: new Date(),
    updatedBy: null
  },
  updatedAt: new Date()
})
```

### 索引建议
```javascript
// 为 key 字段创建唯一索引
db.profit_settings.createIndex({ key: 1 }, { unique: true })
```

---

## 📋 audit_logs 集合

### 集合用途
记录所有管理端操作日志，用于审计和追踪。

### 文档结构
```javascript
{
  _id: ObjectId("..."),
  type: "admin_profit_sharing_update",  // 日志类型
  userId: ObjectId("..."),              // 操作用户 ID
  username: "admin",                    // 操作用户名
  targetUserId: ObjectId("..."),        // 目标用户 ID (可选)
  targetAdminId: ObjectId("..."),       // 目标管理员 ID (可选)
  targetUsername: "user123",            // 目标用户名 (可选)
  orderId: ObjectId("..."),             // 订单 ID (可选)
  executorId: ObjectId("..."),          // 执行者 ID (可选)
  certificateId: ObjectId("..."),       // 资质证书 ID (可选)
  oldStatus: "pending",                 // 旧状态 (可选)
  newStatus: "approved",                // 新状态 (可选)
  oldConfig: { ... },                   // 旧配置 (可选)
  newConfig: { ... },                   // 新配置 (可选)
  changes: {                            // 变更内容 (可选)
    field: { old: "value1", new: "value2" }
  },
  remark: "审核通过",                   // 备注 (可选)
  ip: "192.168.1.1",                    // IP 地址
  userAgent: "Mozilla/5.0...",          // 用户代理
  timestamp: ISODate("2026-03-30T10:00:00Z")
}
```

### 日志类型
| 类型 | 说明 | 触发场景 |
|------|------|---------|
| admin_login | 管理员登录 | 管理员成功登录 |
| admin_logout | 管理员登出 | 管理员退出登录 |
| admin_password_change | 修改密码 | 管理员修改自己的密码 |
| admin_create | 创建管理员 | 创建新的管理员账户 |
| admin_update | 更新管理员 | 更新管理员信息 |
| admin_delete | 删除管理员 | 删除管理员账户 |
| admin_password_reset | 重置密码 | 重置用户密码 |
| admin_order_status_update | 订单状态更新 | 管理员更新订单状态 |
| admin_order_delete | 订单删除 | 管理员删除订单 |
| admin_qualification_audit | 资质审核 | 审核资质证书 |
| admin_executor_status_update | 执行者状态更新 | 更新执行者状态 |
| admin_profit_sharing_update | 分账配置更新 | 更新分账配置 |
| admin_data_export | 数据导出 | 导出数据文件 |

### 常用查询

#### 1. 获取日志列表（分页）
```javascript
const page = 1;
const pageSize = 20;
const skip = (page - 1) * pageSize;

db.audit_logs.find()
  .sort({ timestamp: -1 })
  .skip(skip)
  .limit(pageSize)
```

#### 2. 按类型筛选
```javascript
db.audit_logs.find({ type: "admin_profit_sharing_update" })
```

#### 3. 按用户筛选
```javascript
db.audit_logs.find({ userId: ObjectId("...") })
```

#### 4. 按时间范围筛选
```javascript
db.audit_logs.find({
  timestamp: {
    $gte: new Date("2026-03-01"),
    $lte: new Date("2026-03-31")
  }
})
```

#### 5. 关键词搜索
```javascript
const keyword = "admin";
db.audit_logs.find({
  $or: [
    { username: new RegExp(keyword, "i") },
    { targetUsername: new RegExp(keyword, "i") }
  ]
})
```

#### 6. 组合查询（$and）
```javascript
db.audit_logs.find({
  $and: [
    { type: "admin_order_status_update" },
    { timestamp: { $gte: new Date("2026-03-01") } },
    { $or: [
        { username: /admin/i },
        { targetUsername: /admin/i }
      ]
    }
  ]
})
```

#### 7. 统计总数
```javascript
db.audit_logs.countDocuments({ type: "admin_data_export" })
```

#### 8. 按类型聚合统计
```javascript
db.audit_logs.aggregate([
  { $match: { timestamp: { $gte: new Date("2026-03-01") } } },
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
])
```

#### 9. 按用户聚合统计（Top 10）
```javascript
db.audit_logs.aggregate([
  { $match: { timestamp: { $gte: new Date("2026-03-01") } } },
  {
    $group: {
      _id: "$userId",
      count: { $sum: 1 },
      username: { $first: "$username" }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

#### 10. 按时间分组统计（按天）
```javascript
db.audit_logs.aggregate([
  { $match: { timestamp: { $gte: new Date("2026-03-01") } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])
```

#### 11. 获取日志详情
```javascript
db.audit_logs.findOne({ _id: ObjectId("...") })
```

#### 12. 删除日志（按时间）
```javascript
db.audit_logs.deleteMany({
  timestamp: { $lt: new Date("2026-01-01") }
})
```

#### 13. 插入操作日志
```javascript
db.audit_logs.insertOne({
  type: "admin_profit_sharing_update",
  userId: ObjectId("..."),
  oldConfig: { ... },
  newConfig: { ... },
  timestamp: new Date()
})
```

### 索引建议
```javascript
// 常用查询字段索引
db.audit_logs.createIndex({ type: 1 })
db.audit_logs.createIndex({ userId: 1 })
db.audit_logs.createIndex({ timestamp: -1 })

// 复合索引（优化组合查询）
db.audit_logs.createIndex({ type: 1, timestamp: -1 })
db.audit_logs.createIndex({ userId: 1, timestamp: -1 })

// 文本搜索索引（可选，用于全文搜索）
db.audit_logs.createIndex({ username: "text", targetUsername: "text" })
```

---

## 📤 数据导出相关查询

### 订单数据导出
```javascript
// 查询订单（带筛选）
db.orders.find({
  status: "completed",
  serviceType: "cleaning",
  createdAt: {
    $gte: new Date("2026-03-01"),
    $lte: new Date("2026-03-31")
  }
})
  .sort({ createdAt: -1 })
  .limit(10000)

// 关联查询用户信息
const userIds = [...orderIds]; // 订单中的用户 ID 列表
db.users.find({
  _id: { $in: userIds }
}).project({ _id: 1, nickName: 1, phone: 1 })
```

### 执行者数据导出
```javascript
// 查询执行者
db.users.find({ role: "executor" })
  .sort({ createdAt: -1 })

// 聚合订单统计
db.orders.aggregate([
  { $match: { executorId: { $in: executorIds } } },
  {
    $group: {
      _id: "$executorId",
      totalOrders: { $sum: 1 },
      completedOrders: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
      },
      totalAmount: { $sum: "$totalPrice" }
    }
  }
])
```

### 资质证书导出
```javascript
// 查询资质证书
db.certificates.find({ status: "pending" })
  .sort({ createdAt: -1 })
  .limit(10000)

// 关联查询用户信息
const userIds = [...certificateUserIds];
db.users.find({
  _id: { $in: userIds }
}).project({ _id: 1, nickName: 1, phone: 1 })
```

---

## 🔧 常见问题排查

### 问题 1: 查询返回空结果
**可能原因**:
- 集合名称错误（如 `settings` vs `profit_settings`）
- 字段类型不匹配（如 String vs ObjectId）
- 查询条件过于严格

**解决方案**:
```javascript
// 检查集合是否存在
db.getCollectionNames()

// 检查文档结构
db.profit_settings.findOne()

// 检查字段类型
db.profit_settings.findOne({}, { key: 1, _id: 0 })
```

### 问题 2: ObjectId 转换错误
**场景**: 查询条件中使用字符串 ID，但字段存储为 ObjectId

**解决方案**:
```javascript
// 正确方式
const { ObjectId } = require('mongodb');
db.audit_logs.find({ userId: new ObjectId("507f1f77bcf86cd799439011") })

// 错误方式（不会匹配）
db.audit_logs.find({ userId: "507f1f77bcf86cd799439011" })
```

### 问题 3: 分页查询性能问题
**优化方案**:
```javascript
// 确保有适当的索引
db.audit_logs.createIndex({ timestamp: -1 })

// 使用投影减少返回字段
db.audit_logs.find({}, { type: 1, timestamp: 1, userId: 1 })
  .sort({ timestamp: -1 })
  .skip(0)
  .limit(20)
```

### 问题 4: 聚合管道错误
**常见错误**: 字段路径错误、阶段顺序错误

**调试方法**:
```javascript
// 逐步测试聚合管道
db.audit_logs.aggregate([
  { $match: { type: "admin_data_export" } }
])

db.audit_logs.aggregate([
  { $match: { type: "admin_data_export" } },
  { $group: { _id: "$userId", count: { $sum: 1 } } }
])
```

---

## 📊 性能优化建议

### 1. 索引优化
- 为常用查询字段创建索引
- 为组合查询创建复合索引
- 定期分析索引使用情况

### 2. 查询优化
- 使用投影限制返回字段
- 避免全集合扫描
- 合理使用 limit 限制结果数量

### 3. 聚合优化
- 将 $match 放在管道前面
- 使用 $project 减少字段
- 避免不必要的 $lookup

### 4. 连接管理
- 使用连接池
- 及时关闭游标
- 监控连接数

---

**文档维护**: 请在修改数据库结构或查询逻辑时更新此文档
