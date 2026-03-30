# 清如 ClearSpring V2 - 管理端 API 文档

## 概述

管理端 API 提供了 8 个核心接口，用于平台管理员对订单、资质、执行者和分账配置进行全面管理。

**基础信息：**
- 基础 URL: `http://101.96.192.63:3000` (生产环境) 或 `http://localhost:3000` (开发环境)
- 认证方式：JWT Bearer Token
- 权限要求：所有接口需要 `admin` 角色

---

## 认证说明

所有管理端接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <admin_token>
```

Token 获取方式：通过 `/api/user/login` 接口登录，确保用户角色为 `admin`。

---

## 接口清单

### 1. 订单管理 (3 个接口)

#### 1.1 GET /api/admin/orders - 订单列表

**功能：** 获取订单列表，支持分页和多条件筛选

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| status | string | 否 | 订单状态：pending/paid/grabbed/completed/cancelled |
| paymentStatus | string | 否 | 支付状态：unpaid/paid/refunded |
| serviceType | string | 否 | 服务类型 |
| startDate | string | 否 | 开始日期 (ISO 8601) |
| endDate | string | 否 | 结束日期 (ISO 8601) |
| keyword | string | 否 | 关键词（订单号/服务名称/地点） |

**请求示例：**
```bash
curl -X GET "http://localhost:3000/api/admin/orders?page=1&pageSize=20&status=paid" \
  -H "Authorization: Bearer <token>"
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "orders": [
      {
        "orderId": "507f1f77bcf86cd799439011",
        "orderNo": "ORD1711776000000ABC123",
        "serviceType": "cleaning",
        "serviceName": "家庭保洁",
        "serviceDate": "2026-04-01T10:00:00.000Z",
        "location": "北京市朝阳区",
        "price": 100,
        "quantity": 2,
        "totalPrice": 200,
        "status": "paid",
        "paymentStatus": "paid",
        "user": {
          "userId": "507f1f77bcf86cd799439012",
          "nickName": "张三",
          "phone": "138****1234"
        },
        "executor": {
          "executorId": "507f1f77bcf86cd799439013",
          "nickName": "李四",
          "phone": "139****5678"
        },
        "grabTime": "2026-03-30T08:00:00.000Z",
        "paidAt": "2026-03-30T07:00:00.000Z",
        "createdAt": "2026-03-30T06:00:00.000Z"
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

---

#### 1.2 PUT /api/admin/order/:id/status - 订单状态更新

**功能：** 管理员手动更新订单状态

**路径参数：**
- id: 订单 ID

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 新状态：pending/paid/grabbed/completed/cancelled |
| remark | string | 否 | 备注说明 |

**请求示例：**
```bash
curl -X PUT "http://localhost:3000/api/admin/order/507f1f77bcf86cd799439011/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","remark":"管理员手动完成"}'
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "订单状态已更新",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "completed",
    "updatedAt": "2026-03-30T10:00:00.000Z"
  }
}
```

---

#### 1.3 DELETE /api/admin/order/:id - 订单删除

**功能：** 删除订单（仅限已取消的订单）

**路径参数：**
- id: 订单 ID

**请求示例：**
```bash
curl -X DELETE "http://localhost:3000/api/admin/order/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "订单已删除",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "orderNo": "ORD1711776000000ABC123",
    "deletedAt": "2026-03-30T10:00:00.000Z"
  }
}
```

**错误响应：**
```json
{
  "code": "ORDER_CANNOT_DELETE",
  "message": "只能删除已取消的订单"
}
```

---

### 2. 资质审核 (2 个接口)

#### 2.1 GET /api/admin/qualifications - 资质审核列表

**功能：** 获取资质审核列表

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| status | string | 否 | 审核状态：pending/approved/rejected |
| type | string | 否 | 资质类型 |
| userId | string | 否 | 用户 ID |

**请求示例：**
```bash
curl -X GET "http://localhost:3000/api/admin/qualifications?status=pending&page=1" \
  -H "Authorization: Bearer <token>"
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "qualifications": [
      {
        "qualificationId": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "user": {
          "userId": "507f1f77bcf86cd799439012",
          "nickName": "王五",
          "phone": "138****1234",
          "avatarUrl": "https://..."
        },
        "type": "health_certificate",
        "certificateNo": "HC20260001",
        "certificateName": "健康证",
        "issueDate": "2026-01-01",
        "expiryDate": "2027-01-01",
        "images": ["https://..."],
        "status": "pending",
        "createdAt": "2026-03-30T06:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

#### 2.2 PUT /api/admin/qualification/:id - 审核通过/驳回

**功能：** 审核资质证书

**路径参数：**
- id: 资质 ID

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | approved（通过）或 rejected（驳回） |
| rejectReason | string | 条件必填 | 驳回原因（status=rejected 时必填） |
| auditRemark | string | 否 | 审核备注 |

**请求示例（通过）：**
```bash
curl -X PUT "http://localhost:3000/api/admin/qualification/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","auditRemark":"资质有效，审核通过"}'
```

**请求示例（驳回）：**
```bash
curl -X PUT "http://localhost:3000/api/admin/qualification/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected","rejectReason":"图片不清晰，无法辨认"}'
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "审核通过",
  "data": {
    "qualificationId": "507f1f77bcf86cd799439011",
    "status": "approved",
    "auditTime": "2026-03-30T10:00:00.000Z"
  }
}
```

**错误响应：**
```json
{
  "code": "MISSING_REJECT_REASON",
  "message": "驳回时必须填写原因"
}
```

---

### 3. 执行者管理 (2 个接口)

#### 3.1 GET /api/admin/executors - 执行者列表

**功能：** 获取执行者列表，支持筛选和统计

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态：active/inactive/banned |
| keyword | string | 否 | 关键词（昵称/手机号） |
| serviceType | string | 否 | 服务类型 |

**请求示例：**
```bash
curl -X GET "http://localhost:3000/api/admin/executors?status=active&page=1" \
  -H "Authorization: Bearer <token>"
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "executors": [
      {
        "executorId": "507f1f77bcf86cd799439011",
        "openId": "oXXXX",
        "nickName": "赵六",
        "avatarUrl": "https://...",
        "phone": "138****1234",
        "gender": 1,
        "city": "北京",
        "province": "北京",
        "status": "active",
        "rating": 4.8,
        "serviceTypes": ["cleaning", "maintenance"],
        "serviceAreas": ["朝阳区", "海淀区"],
        "bio": "5 年家政服务经验",
        "totalOrders": 150,
        "completedOrders": 145,
        "cancelledOrders": 5,
        "completionRate": "96.67",
        "createdAt": "2026-01-01T00:00:00.000Z",
        "lastLoginAt": "2026-03-30T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 80,
      "totalPages": 4
    }
  }
}
```

---

#### 3.2 PUT /api/admin/executor/:id/status - 执行者状态更新

**功能：** 更新执行者状态（激活/停用/禁用）

**路径参数：**
- id: 执行者 ID

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | active/inactive/banned |
| remark | string | 否 | 备注说明 |

**请求示例：**
```bash
curl -X PUT "http://localhost:3000/api/admin/executor/507f1f77bcf86cd799439011/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"banned","remark":"违规操作，永久禁用"}'
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "执行者状态已更新",
  "data": {
    "executorId": "507f1f77bcf86cd799439011",
    "status": "banned",
    "updatedAt": "2026-03-30T10:00:00.000Z"
  }
}
```

---

### 4. 分账配置 (2 个接口)

#### 4.1 GET /api/admin/profit-sharing - 分账配置

**功能：** 获取平台分账配置

**请求示例：**
```bash
curl -X GET "http://localhost:3000/api/admin/profit-sharing" \
  -H "Authorization: Bearer <token>"
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "profitSharing": {
      "platformRate": 0.10,
      "executorMinRate": 0.70,
      "executorMaxRate": 0.90,
      "defaultExecutorRate": 0.80,
      "minOrderAmount": 10,
      "maxOrderAmount": 10000,
      "serviceTypeRates": {
        "cleaning": {
          "platformRate": 0.10,
          "executorRate": 0.85
        },
        "maintenance": {
          "platformRate": 0.12,
          "executorRate": 0.82
        }
      },
      "tieredRates": [
        {"minOrders": 0, "maxOrders": 10, "executorRateBonus": 0},
        {"minOrders": 11, "maxOrders": 30, "executorRateBonus": 0.02},
        {"minOrders": 31, "maxOrders": 50, "executorRateBonus": 0.03},
        {"minOrders": 51, "maxOrders": null, "executorRateBonus": 0.05}
      ],
      "withdrawMinAmount": 100,
      "withdrawFee": 0,
      "withdrawTaxRate": 0
    },
    "lastUpdated": "2026-03-30T10:00:00.000Z",
    "updatedBy": "507f1f77bcf86cd799439011"
  }
}
```

---

#### 4.2 PUT /api/admin/profit-sharing - 分账配置更新

**功能：** 更新平台分账配置

**请求体：** 完整的分账配置对象

**请求示例：**
```bash
curl -X PUT "http://localhost:3000/api/admin/profit-sharing" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "platformRate": 0.12,
    "executorMinRate": 0.68,
    "executorMaxRate": 0.88,
    "defaultExecutorRate": 0.78,
    "minOrderAmount": 10,
    "maxOrderAmount": 10000,
    "withdrawMinAmount": 100
  }'
```

**响应示例：**
```json
{
  "code": "SUCCESS",
  "message": "分账配置已更新",
  "data": {
    "profitSharing": {
      "platformRate": 0.12,
      "executorMinRate": 0.68,
      "executorMaxRate": 0.88,
      "defaultExecutorRate": 0.78,
      "minOrderAmount": 10,
      "maxOrderAmount": 10000,
      "withdrawMinAmount": 100
    },
    "updatedAt": "2026-03-30T10:00:00.000Z",
    "updatedBy": "507f1f77bcf86cd799439011"
  }
}
```

**错误响应：**
```json
{
  "code": "INVALID_PLATFORM_RATE",
  "message": "平台抽成比例必须在 0-1 之间"
}
```

---

## 错误码说明

| 错误码 | HTTP 状态码 | 说明 |
|--------|-----------|------|
| SUCCESS | 200 | 成功 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| MISSING_PARAMS | 400 | 缺少必填参数 |
| INVALID_STATUS | 400 | 无效的状态 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| ORDER_CANNOT_DELETE | 400 | 订单无法删除 |
| CERTIFICATE_NOT_FOUND | 404 | 资质不存在 |
| CERTIFICATE_ALREADY_AUDITED | 400 | 资质已审核 |
| MISSING_REJECT_REASON | 400 | 缺少驳回原因 |
| EXECUTOR_NOT_FOUND | 404 | 执行者不存在 |
| INVALID_PLATFORM_RATE | 400 | 无效的平台抽成比例 |
| INVALID_RATE_SUM | 400 | 比例总和无
