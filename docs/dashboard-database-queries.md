# Dashboard 数据库查询文档

## 📚 概述

本文档详细记录清如 ClearSpring V2.0 Dashboard 统计接口的所有数据库查询逻辑。

## 🗄️ 数据库集合

### 核心业务集合

| 集合名 | 说明 | 主要用途 |
|--------|------|----------|
| `users` | 用户表 | 存储用户、执行者、管理员信息 |
| `orders` | 订单表 | 存储服务订单信息 |
| `certificates` | 资质证书表 | 存储执行者资质认证信息 |
| `transactions` | 交易表 | 存储支付交易记录 |
| `evidence` | 证据表 | 存储订单服务证据（照片等） |
| `audit_logs` | 审计日志表 | 存储系统操作日志 |

### 内容生态集合

| 集合名 | 说明 |
|--------|------|
| `wiki_contents` | 百科内容 |
| `meditation_courses` | 冥想课程 |
| `meditation_records` | 冥想记录 |
| `ritual_contents` | 仪轨内容 |
| `ritual_progress` | 学习进度 |

## 📊 Dashboard 接口查询详解

### 1. GET /api/admin/dashboard/stats

**用途**: 获取核心统计指标（简化版概览）

**查询逻辑**:

```javascript
// 1. 统计总订单数
const totalOrders = await db.collection('orders').countDocuments({});

// 2. 统计待支付订单数
const pendingOrders = await db.collection('orders').countDocuments({
  status: 'pending'
});

// 3. 统计活跃执行者数
const activeExecutors = await db.collection('users').countDocuments({
  role: 'executor',
  status: 'active'
});

// 4. 统计待审核资质数
const pendingQualifications = await db.collection('certificates').countDocuments({
  status: 'pending'
});
```

**返回数据**:

```json
{
  "code": "SUCCESS",
  "data": {
    "totalOrders": 100,
    "pendingOrders": 5,
    "activeExecutors": 20,
    "pendingQualifications": 3
  },
  "message": "获取成功"
}
```

---

### 2. GET /api/admin/dashboard/overview

**用途**: 获取概览数据（支持时间范围筛选）

**查询参数**:
- `startDate`: 开始时间（可选，默认最近 7 天）
- `endDate`: 结束时间（可选，默认当前时间）

**查询逻辑**:

#### 2.1 订单统计（聚合管道）

```javascript
const orderStats = await db.collection('orders').aggregate([
  { $match: { createdAt: timeRange } },
  {
    $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalAmount: { $sum: '$totalPrice' },
      completedOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      cancelledOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
      },
      pendingOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
      },
      paidOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
      },
      grabbedOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'grabbed'] }, 1, 0] }
      }
    }
  }
]).toArray();
```

#### 2.2 用户统计

```javascript
const userStats = await db.collection('users').aggregate([
  {
    $match: {
      role: 'user',
      createdAt: { $lte: now }
    }
  },
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      newUsers: {
        $sum: { $cond: [{ $gte: ['$createdAt', timeRange.$gte] }, 1, 0] }
      }
    }
  }
]).toArray();
```

#### 2.3 执行者统计

```javascript
const executorStats = await db.collection('users').aggregate([
  {
    $match: { role: 'executor' }
  },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]).toArray();

// 结果处理
const executorMap = {};
executorStats.forEach(stat => {
  executorMap[stat._id] = stat.count;
});

// executorMap['active'] - 活跃执行者
// executorMap['inactive'] - 非活跃执行者
// executorMap['banned'] - 被封禁执行者
```

#### 2.4 资质审核统计

```javascript
const qualificationStats = await db.collection('certificates').aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]).toArray();

// 结果处理
const qualificationMap = {};
qualificationStats.forEach(stat => {
  qualificationMap[stat._id] = stat.count;
});

// qualificationMap['pending'] - 待审核
// qualificationMap['approved'] - 已通过
// qualificationMap['rejected'] - 已驳回
```

#### 2.5 收入统计

```javascript
const revenueStats = await db.collection('orders').aggregate([
  { 
    $match: { 
      status: 'completed',
      completedAt: timeRange
    } 
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: '$totalPrice' },
      platformRevenue: { 
        $sum: { $multiply: ['$totalPrice', 0.1] } // 平台抽成 10%
      }
    }
  }
]).toArray();
```

---

### 3. GET /api/admin/dashboard/orders-trend

**用途**: 获取订单趋势（按天/周/月分组）

**查询参数**:
- `startDate`: 开始时间
- `endDate`: 结束时间
- `groupBy`: 分组方式（day/week/month，默认 day）

**查询逻辑**:

```javascript
// 日期格式化
let dateFormat;
if (groupBy === 'week') {
  dateFormat = '%Y-W%V';
} else if (groupBy === 'month') {
  dateFormat = '%Y-%m';
} else {
  dateFormat = '%Y-%m-%d';
}

// 按时间分组统计
const trend = await db.collection('orders').aggregate([
  { $match: { createdAt: timeRange } },
  {
    $group: {
      _id: {
        $dateToString: { format: dateFormat, date: '$createdAt' }
      },
      totalOrders: { $sum: 1 },
      totalAmount: { $sum: '$totalPrice' },
      completedOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      cancelledOrders: {
        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
      }
    }
  },
  { $sort: { _id: 1 } }
]).toArray();
```

---

### 4. GET /api/admin/dashboard/service-types

**用途**: 获取服务类型分布

**查询逻辑**:

```javascript
const serviceTypes = await db.collection('orders').aggregate([
  { $match: query },
  {
    $group: {
      _id: '$serviceType',
      count: { $sum: 1 },
      totalAmount: { $sum: '$totalPrice' },
      avgAmount: { $avg: '$totalPrice' }
    }
  },
  { $sort: { count: -1 } }
]).toArray();
```

---

### 5. GET /api/admin/dashboard/executors-ranking

**用途**: 获取执行者排行

**查询参数**:
- `startDate`: 开始时间
- `endDate`: 结束时间
- `limit`: 返回数量（默认 10）

**查询逻辑**:

```javascript
// 按执行者统计订单
const ranking = await db.collection('orders').aggregate([
  { 
    $match: { 
      executorId: { $exists: true },
      status: 'completed',
      completedAt: timeRange
    } 
  },
  {
    $group: {
      _id: '$executorId',
      completedOrders: { $sum: 1 },
      totalAmount: { $sum: '$totalPrice' },
      avgRating: { $avg: '$rating' }
    }
  },
  { $sort: { completedOrders: -1 } },
  { $limit: parseInt(limit) }
]).toArray();

// 获取执行者信息
const executorIds = ranking.map(item => new ObjectId(item._id));
const executors = await db.collection('users')
  .find({ _id: { $in: executorIds } })
  .project({ _id: 1, nickName: 1, avatarUrl: 1, phone: 1, rating: 1 })
  .toArray();
```

---

### 6. GET /api/admin/dashboard/realtime

**用途**: 获取实时数据

**查询逻辑**:

```javascript
// 今日统计
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// 今日订单
const todayOrders = await db.collection('orders').aggregate([
  { $match: { createdAt: { $gte: todayStart } } },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      amount: { $sum: '$totalPrice' },
      completed: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      }
    }
  }
]).toArray();

// 当前进行中订单
const activeOrders = await db.collection('orders').countDocuments({
  status: { $in: ['paid', 'grabbed'] }
});

// 待审核资质
const pendingQualifications = await db.collection('certificates').countDocuments({
  status: 'pending'
});

// 在线执行者（最近 30 分钟有活动）
const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
const onlineExecutors = await db.collection('users').countDocuments({
  role: 'executor',
  status: 'active',
  lastLoginAt: { $gte: thirtyMinutesAgo }
});
```

---

### 7. GET /api/admin/dashboard/recent-orders

**用途**: 获取最近订单列表

**查询参数**:
- `limit`: 返回数量（默认 5）

**查询逻辑**:

```javascript
// 查询最近订单
const orders = await db.collection('orders')
  .find({})
  .sort({ createdAt: -1 })
  .limit(limit)
  .toArray();

// 获取用户信息
const userIds = orders.filter(o => o.userId).map(o => o.userId);
const users = await db.collection('users')
  .find({ _id: { $in: userIds } })
  .project({ _id: 1, nickName: 1, phone: 1 })
  .toArray();
```

---

## 🔍 常用查询模式

### 计数查询

```javascript
// 简单计数
db.collection('orders').countDocuments({})

// 条件计数
db.collection('orders').countDocuments({ 
  status: 'pending',
  userId: 'xxx'
})

// 多条件计数
db.collection('users').countDocuments({ 
  role: 'executor',
  status: 'active'
})
```

### 聚合查询

```javascript
// 分组统计
db.collection('orders').aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: '$serviceType',
      count: { $sum: 1 },
      total: { $sum: '$totalPrice' },
      avg: { $avg: '$totalPrice' }
    }
  },
  { $sort: { count: -1 } }
])
```

### 时间范围查询

```javascript
// 日期范围
const timeRange = {
  $gte: new Date('2026-03-01'),
  $lte: new Date('2026-03-31')
};

db.collection('orders').find({
  createdAt: timeRange
})
```

### 关联查询

```javascript
// 批量获取关联数据
const ids = orders.map(o => o.userId);
const users = await db.collection('users')
  .find({ _id: { $in: ids } })
  .toArray();

// 构建映射
const userMap = {};
users.forEach(user => {
  userMap[user._id.toString()] = user;
});
```

---

## 📈 性能优化建议

### 1. 索引优化

确保以下字段已建立索引：
- `orders.status`
- `orders.createdAt`
- `orders.executorId`
- `users.role`
- `users.status`
- `certificates.status`
- `certificates.userId`

### 2. 查询优化

- 使用投影减少返回字段
- 使用聚合管道代替多次查询
- 批量查询代替循环查询
- 合理使用时间范围限制数据量

### 3. 缓存策略

- 实时数据可考虑 Redis 缓存
- 统计数据可定时预计算
- 热点数据设置合理 TTL

---

## 📅 文档版本

- 版本：1.0
- 创建时间：2026-03-30
- 最后更新：2026-03-30
