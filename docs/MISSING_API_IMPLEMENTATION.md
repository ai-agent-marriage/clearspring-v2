# 清如 ClearSpring V2 - 缺失 API 实现文档

**版本**: 2.0.0  
**实现时间**: 2026-03-30  
**状态**: ✅ 已完成

---

## 概述

本文档记录了为清如 ClearSpring V2 管理端补充实现的 5 个缺失 API 接口。

---

## 已实现 API 列表

### 1. GET /api/admin/dashboard/stats - 统计数据

**功能**: 获取平台核心统计指标

**路径**: `api/routes/admin/dashboard.js`

**请求**:
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**响应**:
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "totalOrders": 1234,
    "pendingOrders": 23,
    "activeExecutors": 156,
    "pendingQualifications": 8
  }
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| totalOrders | number | 总订单数 |
| pendingOrders | number | 待支付订单数 |
| activeExecutors | number | 活跃执行者数 |
| pendingQualifications | number | 待审核资质数 |

**权限**: 管理员

---

### 2. GET /api/admin/orders/export - 订单导出

**功能**: 导出订单数据为 Excel 或 CSV 格式

**路径**: `api/routes/admin/export.js`

**请求**:
```http
GET /api/admin/orders/export?format=xlsx&startDate=2026-03-01&endDate=2026-03-30&status=completed
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 否 | 导出格式：xlsx（默认）或 csv |
| startDate | string | 否 | 开始日期（ISO 8601） |
| endDate | string | 否 | 结束日期（ISO 8601） |
| status | string | 否 | 订单状态筛选 |
| serviceType | string | 否 | 服务类型筛选 |

**响应**: Excel/CSV 文件流

**响应头**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="orders_2026-03-30T12-34-56.xlsx"
```

**导出字段**:
- 订单号、服务类型、服务名称
- 服务日期、服务地点
- 价格、数量、总金额
- 订单状态、支付状态
- 用户信息（昵称、手机号）
- 执行者信息（昵称、手机号）
- 时间节点（抢单时间、支付时间、完成时间、取消时间、创建时间）
- 备注

**权限**: 管理员

---

### 3. PUT /api/admin/profit-sharing - 分账配置更新

**功能**: 更新平台分账配置

**路径**: `api/routes/admin/profit-sharing.js`

**请求**:
```http
PUT /api/admin/profit-sharing
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "platformRate": 0.20,
  "executorRate": 0.80,
  "minAmount": 1,
  "maxAmount": 100
}
```

**请求体字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platformRate | number | 是 | 平台抽成比例（0-1） |
| executorRate | number | 是 | 执行者比例（0-1） |
| minAmount | number | 否 | 最低订单金额 |
| maxAmount | number | 否 | 最高订单金额 |

**响应**:
```json
{
  "code": "SUCCESS",
  "message": "分账配置已更新",
  "data": {
    "profitSharing": {
      "platformRate": 0.20,
      "executorRate": 0.80,
      "minAmount": 1,
      "maxAmount": 100
    },
    "updatedAt": "2026-03-30T12:34:56.789Z",
    "updatedBy": "admin_xxx"
  }
}
```

**验证规则**:
- platformRate 必须在 0-1 之间
- executorRate 必须在 0-1 之间
- platformRate + executorRate 不能大于 1

**权限**: 管理员

---

### 4. GET /api/admin/export/history - 导出历史

**功能**: 查询数据导出历史记录

**路径**: `api/routes/admin/export.js`

**请求**:
```http
GET /api/admin/export/history?page=1&pageSize=20&dataType=orders
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 20） |
| dataType | string | 否 | 数据类型筛选（orders/executors/users/qualifications） |

**响应**:
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "history": [
      {
        "exportId": "65f1a2b3c4d5e6f7g8h9i0j1",
        "dataType": "orders",
        "recordCount": 1234,
        "format": "xlsx",
        "operatorName": "管理员",
        "timestamp": "2026-03-30 12:34:56"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**权限**: 管理员

---

### 5. POST /api/admin/settings - 系统设置更新

**功能**: 更新系统设置

**路径**: `api/routes/admin/settings.js`

**请求**:
```http
POST /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "key": "site_name",
  "value": "清如家政服务平台"
}
```

**请求体字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 设置键名（只能包含字母、数字和下划线） |
| value | any | 是 | 设置值（任意类型） |

**响应**:
```json
{
  "code": "SUCCESS",
  "message": "系统设置已更新",
  "data": {
    "key": "site_name",
    "value": "清如家政服务平台",
    "updatedAt": "2026-03-30T12:34:56.789Z",
    "updatedBy": "admin_xxx"
  }
}
```

**相关接口**:
- `GET /api/admin/settings` - 获取所有系统设置
- `PUT /api/admin/settings` - 批量更新系统设置
- `DELETE /api/admin/settings/:key` - 删除系统设置

**权限**: 管理员

---

## 路由注册

所有新 API 已在 `api/routes/admin/index.js` 中注册：

```javascript
// Dashboard 统计路由
router.use('/dashboard', dashboardRoutes);

// 数据导出路由
router.use('/export', exportRoutes);

// 系统设置路由
router.use('/settings', settingsRoutes);
```

---

## 测试用例

### Dashboard Stats API
```javascript
// 测试：获取统计数据
GET /api/admin/dashboard/stats
预期：返回 code: "SUCCESS"，包含 totalOrders, pendingOrders, activeExecutors, pendingQualifications
```

### Orders Export API
```javascript
// 测试：导出订单 Excel
GET /api/admin/orders/export?format=xlsx
预期：返回 xlsx 文件，Content-Type 正确

// 测试：导出订单 CSV
GET /api/admin/orders/export?format=csv
预期：返回 csv 文件，Content-Type 正确
```

### Profit Sharing Update API
```javascript
// 测试：更新分账配置
PUT /api/admin/profit-sharing
Body: { platformRate: 0.2, executorRate: 0.8 }
预期：返回 code: "SUCCESS"，配置已更新

// 测试：无效比例（应失败）
PUT /api/admin/profit-sharing
Body: { platformRate: 1.5 }
预期：返回 code: "INVALID_PLATFORM_RATE"，状态码 400
```

### Export History API
```javascript
// 测试：获取导出历史
GET /api/admin/export/history
预期：返回 code: "SUCCESS"，包含导出历史列表和分页信息
```

### Settings Update API
```javascript
// 测试：更新系统设置
POST /api/admin/settings
Body: { key: "site_name", value: "清如家政" }
预期：返回 code: "SUCCESS"，设置已更新

// 测试：无效键名（应失败）
POST /api/admin/settings
Body: { key: "invalid-key!", value: "test" }
预期：返回 code: "INVALID_PARAMS"，状态码 400
```

---

## 审计日志

所有配置更新操作都会记录到 `audit_logs` 集合：

| 操作类型 | 日志 type | 记录内容 |
|---------|----------|----------|
| 分账配置更新 | admin_profit_sharing_update | 旧配置、新配置 |
| 系统设置更新 | admin_settings_update | 设置键、旧值、新值 |
| 系统设置批量更新 | admin_settings_batch_update | 所有更新的设置 |
| 系统设置删除 | admin_settings_delete | 删除的设置键和值 |
| 数据导出 | admin_data_export | 数据类型、记录数、格式 |

---

## 错误码

| 错误码 | 说明 | HTTP 状态码 |
|--------|------|------------|
| SUCCESS | 成功 | 200 |
| UNAUTHORIZED | 未授权 | 401 |
| FORBIDDEN | 权限不足 | 403 |
| INVALID_PARAMS | 参数错误 | 400 |
| INVALID_PLATFORM_RATE | 平台比例无效 | 400 |
| INVALID_EXECUTOR_MIN_RATE | 执行者比例无效 | 400 |
| INVALID_RATE_SUM | 比例总和超限 | 400 |
| SETTING_NOT_FOUND | 设置不存在 | 404 |

---

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `api/routes/admin/dashboard.js` | 修改 | 添加 GET /stats 接口 |
| `api/routes/admin/export.js` | 修改 | 添加 GET /orders/export 和 GET /history 接口 |
| `api/routes/admin/settings.js` | 新建 | 完整的系统设置 CRUD 接口 |
| `api/routes/admin/index.js` | 修改 | 更新路由注册和端点列表 |

---

## 验收状态

- ✅ 5 个 API 接口全部实现
- ✅ 响应格式统一（code/message/data）
- ✅ 权限验证（管理员中间件）
- ✅ 审计日志记录
- ✅ 错误处理完善
- ✅ API 文档更新

---

**实现者**: ClearSpring AI Assistant  
**审核状态**: 待测试  
**最后更新**: 2026-03-30
