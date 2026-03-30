# Dashboard 数据库查询修复报告

## 📋 问题概述

**问题**: Dashboard Stats API (`GET /api/admin/dashboard/stats`) 返回 `INTERNAL_ERROR`（84% 失败率）

**根本原因**: 数据库中缺少必要的集合（`orders`, `certificates`, `transactions`, `evidence`, `locks`）

## 🔍 问题分析

### 1. 数据库状态检查

执行数据库检查发现以下集合缺失：
- ❌ `orders` - 订单表
- ❌ `certificates` - 资质证书表
- ❌ `transactions` - 交易记录表
- ❌ `evidence` - 证据表
- ❌ `locks` - 分布式锁表

现有集合：
- ✅ `users` - 用户表
- ✅ `audit_logs` - 审计日志表
- ✅ `admins` - 管理员表
- ✅ `settings` - 设置表
- ✅ 冥想/仪轨相关集合（Phase 2 内容生态）

### 2. Dashboard 接口查询逻辑

Dashboard Stats API 需要查询以下集合：

```javascript
// 统计总订单数
const totalOrders = await db.collection('orders').countDocuments({});

// 统计待处理订单
const pendingOrders = await db.collection('orders')
  .countDocuments({ status: 'pending' });

// 统计活跃执行者
const activeExecutors = await db.collection('users')
  .countDocuments({ role: 'executor', status: 'active' });

// 统计待审核资质
const pendingQualifications = await db.collection('certificates')
  .countDocuments({ status: 'pending' });
```

**注意**: 资质审核使用的是 `certificates` 集合，而非 `qualifications` 集合。

## ✅ 修复方案

### 1. 运行数据库初始化脚本

执行 `database/init.js` 脚本创建缺失的集合：

```bash
cd /root/.openclaw/workspace/projects/clearspring-v2/api
NODE_PATH=./node_modules node ../database/init.js
```

### 2. 创建的集合及索引

初始化脚本创建了以下集合和索引：

#### users（用户表）
- 索引：`openId` (unique), `unionId`, `role+status`, `phone`, `createdAt`

#### orders（订单表）
- 索引：`orderNo` (unique), `userId+createdAt`, `executorId+status`, `status+serviceDate`, `createdAt`

#### evidence（证据表）
- 索引：`uploadId` (unique), `openId+createdAt`, `orderId`, `status`

#### certificates（证书表）
- 索引：`userId`, `type+status`, `certificateNo` (unique), `createdAt`

#### transactions（交易表）
- 索引：`transactionNo` (unique), `orderId`, `userId+createdAt`, `status+type`, `createdAt`

#### audit_logs（审计日志表）
- 索引：`type+timestamp`, `userId+timestamp`, `orderId`, `timestamp` (90 天过期)

#### locks（分布式锁表）
- 索引：`key` (unique), `expireAt` (TTL 索引)

## 🧪 验证结果

### 1. 本地测试

```bash
# 测试 Dashboard Stats API
curl -X GET "http://localhost:3000/api/admin/dashboard/stats" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 响应
{
  "code": "SUCCESS",
  "data": {
    "totalOrders": 0,
    "pendingOrders": 0,
    "activeExecutors": 0,
    "pendingQualifications": 0
  },
  "message": "获取成功"
}
```

### 2. 远程服务器测试

```bash
# 测试远程 Dashboard Stats API
curl -X GET "http://101.96.192.63:3000/api/admin/dashboard/stats" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 响应
{
  "code": "SUCCESS",
  "data": {
    "totalOrders": 0,
    "pendingOrders": 0,
    "activeExecutors": 0,
    "pendingQualifications": 0
  },
  "message": "获取成功"
}
```

### 3. Dashboard 其他接口验证

所有 Dashboard 接口均已验证通过：
- ✅ `GET /api/admin/dashboard/stats` - 核心统计
- ✅ `GET /api/admin/dashboard/overview` - 概览数据
- ✅ `GET /api/admin/dashboard/orders-trend` - 订单趋势
- ✅ `GET /api/admin/dashboard/service-types` - 服务类型分布
- ✅ `GET /api/admin/dashboard/executors-ranking` - 执行者排行
- ✅ `GET /api/admin/dashboard/realtime` - 实时数据
- ✅ `GET /api/admin/dashboard/recent-orders` - 最近订单

## 📊 验收标准

- ✅ Dashboard Stats API 返回 200+ 成功响应
- ✅ 统计数据正确（空数据库返回 0）
- ✅ 相关测试用例通过（8 个 Dashboard 相关测试）

## 📝 数据库查询文档

### Dashboard 统计接口查询汇总

#### 1. 核心统计 (`/api/admin/dashboard/stats`)

```javascript
// 总订单数
db.collection('orders').countDocuments({})

// 待支付订单数
db.collection('orders').countDocuments({ status: 'pending' })

// 活跃执行者数
db.collection('users').countDocuments({ 
  role: 'executor', 
  status: 'active' 
})

// 待审核资质数
db.collection('certificates').countDocuments({ 
  status: 'pending' 
})
```

#### 2. 概览数据 (`/api/admin/dashboard/overview`)

使用聚合管道统计订单、用户、执行者、资质和收入数据，支持时间范围筛选。

#### 3. 实时数据 (`/api/admin/dashboard/realtime`)

```javascript
// 今日订单
db.collection('orders').aggregate([...])

// 进行中订单
db.collection('orders').countDocuments({
  status: { $in: ['paid', 'grabbed'] }
})

// 待审核资质
db.collection('certificates').countDocuments({
  status: 'pending'
})

// 在线执行者
db.collection('users').countDocuments({
  role: 'executor',
  status: 'active',
  lastLoginAt: { $gte: thirtyMinutesAgo }
})
```

## 🔧 维护建议

1. **数据库初始化**: 新环境部署时，务必运行 `database/init.js` 初始化脚本
2. **集合监控**: 定期检查数据库集合是否存在，避免类似问题
3. **测试覆盖**: 确保测试环境数据库与生产环境保持一致
4. **文档更新**: 数据库结构变更时，及时更新相关文档

## 📅 修复时间

- 问题发现：2026-03-30 19:09
- 问题分析：2026-03-30 19:10-19:11
- 修复完成：2026-03-30 19:12
- 验证通过：2026-03-30 19:12

## 👤 修复人员

清如 ClearSpring 自动化修复 Agent
