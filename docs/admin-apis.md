# 清如 ClearSpring V2 - 管理端 API 文档

本文档包含 5 个核心管理端 API 接口的详细说明。

---

## 1. Dashboard Stats API - 统计数据接口

### 接口信息
- **路径**: `GET /api/admin/dashboard/stats`
- **文件**: `api/routes/admin/dashboard.js`
- **权限**: 管理员
- **认证**: 需要 Bearer Token

### 请求示例
```bash
curl -X GET "http://localhost:3000/api/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 响应示例
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

### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| totalOrders | Number | 总订单数 |
| pendingOrders | Number | 待处理订单数 |
| activeExecutors | Number | 活跃执行者数 |
| pendingQualifications | Number | 待审核资质数 |

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | UNAUTHORIZED | 未提供 Token 或 Token 无效 |
| 403 | FORBIDDEN | 权限不足，需要管理员权限 |

---

## 2. Orders Export API - 订单导出接口

### 接口信息
- **路径**: `GET /api/admin/orders/export`
- **文件**: `api/routes/admin/export.js`
- **权限**: 管理员
- **认证**: 需要 Bearer Token
- **响应类型**: Excel/CSV 文件流

### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | String | 否 | 开始日期 (ISO 8601) |
| endDate | String | 否 | 结束日期 (ISO 8601) |
| status | String | 否 | 订单状态筛选 |
| serviceType | String | 否 | 服务类型筛选 |
| format | String | 否 | 导出格式，默认 xlsx，可选 csv |

### 请求示例
```bash
# 导出 Excel
curl -X GET "http://localhost:3000/api/admin/orders/export?format=xlsx" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o orders.xlsx

# 导出 CSV
curl -X GET "http://localhost:3000/api/admin/orders/export?format=csv" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o orders.csv

# 按状态筛选导出
curl -X GET "http://localhost:3000/api/admin/orders/export?status=completed&format=xlsx" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o completed_orders.xlsx
```

### 响应头
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="orders_2026-03-30T10-30-00-000Z.xlsx"
```

或 CSV 格式:
```
Content-Type: text/csv;charset=utf-8
Content-Disposition: attachment; filename="orders_2026-03-30T10-30-00-000Z.csv"
```

### 导出字段说明
订单导出文件包含以下字段:
- orderNo: 订单号
- serviceType: 服务类型
- serviceName: 服务名称
- serviceDate: 服务日期
- location: 服务地点
- price: 单价
- quantity: 数量
- totalPrice: 总金额
- status: 订单状态
- paymentStatus: 支付状态
- userNickName: 用户昵称
- userPhone: 用户电话
- executorNickName: 执行者昵称
- executorPhone: 执行者电话
- grabTime: 接单时间
- paidAt: 支付时间
- completedAt: 完成时间
- cancelledAt: 取消时间
- createdAt: 创建时间
- remark: 备注

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | UNAUTHORIZED | 未提供 Token 或 Token 无效 |
| 403 | FORBIDDEN | 权限不足，需要管理员权限 |

---

## 3. Profit Sharing Update API - 分账配置更新接口

### 接口信息
- **路径**: `PUT /api/admin/profit-sharing`
- **文件**: `api/routes/admin/profit-sharing.js`
- **权限**: 管理员
- **认证**: 需要 Bearer Token

### 请求参数 (Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platformRate | Number | 是 | 平台抽成比例 (0-1) |
| executorRate | Number | 是 | 执行者比例 (0-1) |
| minAmount | Number | 否 | 最低订单金额 |
| maxAmount | Number | 否 | 最高订单金额 |

### 请求示例
```bash
curl -X PUT "http://localhost:3000/api/admin/profit-sharing" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platformRate": 0.15,
    "executorRate": 0.85,
    "minAmount": 1,
    "maxAmount": 100
  }'
```

### 响应示例
```json
{
  "code": "SUCCESS",
  "message": "分账配置已更新",
  "data": {
    "profitSharing": {
      "platformRate": 0.15,
      "executorRate": 0.85,
      "minAmount": 1,
      "maxAmount": 100
    },
    "updatedAt": "2026-03-30T10:30:00.000Z",
    "updatedBy": "ou_xxxxxxxxxxxxxxxx"
  }
}
```

### 验证规则
1. `platformRate` 必须在 0-1 之间
2. `executorRate` 必须在 0-1 之间
3. `platformRate + executorRate` 不能大于 1

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PLATFORM_RATE | 平台抽成比例无效 |
| 400 | INVALID_EXECUTOR_RATE | 执行者比例无效 |
| 400 | INVALID_RATE_SUM | 比例总和超限 |
| 401 | UNAUTHORIZED | 未提供 Token 或 Token 无效 |
| 403 | FORBIDDEN | 权限不足，需要管理员权限 |

---

## 4. Export History API - 导出历史接口

### 接口信息
- **路径**: `GET /api/admin/export/history`
- **文件**: `api/routes/admin/export.js`
- **权限**: 管理员
- **认证**: 需要 Bearer Token

### 请求参数 (Query)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Number | 否 | 页码，默认 1 |
| pageSize | Number | 否 | 每页数量，默认 20 |
| dataType | String | 否 | 数据类型筛选 (orders/executors/users/qualifications) |

### 请求示例
```bash
# 获取导出历史
curl -X GET "http://localhost:3000/api/admin/export/history?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 按数据类型筛选
curl -X GET "http://localhost:3000/api/admin/export/history?dataType=orders" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 响应示例
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "history": [
      {
        "exportId": "xxxxxxxxxxxxxxxxxxxxxxx",
        "dataType": "orders",
        "recordCount": 1234,
        "format": "xlsx",
        "operatorName": "管理员 A",
        "timestamp": "2026-03-30 10:30:00"
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

### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| exportId | String | 导出记录 ID |
| dataType | String | 数据类型 |
| recordCount | Number | 记录数量 |
| format | String | 导出格式 |
| operatorName | String | 操作人姓名 |
| timestamp | String | 导出时间 |

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | UNAUTHORIZED | 未提供 Token 或 Token 无效 |
| 403 | FORBIDDEN | 权限不足，需要管理员权限 |

---

## 5. Settings Update API - 系统设置更新接口

### 接口信息
- **路径**: `POST /api/admin/settings`
- **文件**: `api/routes/admin/settings.js`
- **权限**: 管理员
- **认证**: 需要 Bearer Token

### 请求参数 (Body)
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | String | 是 | 设置键名 (只能包含字母、数字和下划线) |
| value | Any | 是 | 设置值 |

### 请求示例
```bash
# 更新单个设置
curl -X POST "http://localhost:3000/api/admin/settings" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "site_name",
    "value": "清如家政服务平台"
  }'

# 批量更新设置
curl -X PUT "http://localhost:3000/api/admin/settings" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_description": "专业家政服务平台",
    "contact_email": "support@clearspring.com"
  }'
```

### 响应示例
```json
{
  "code": "SUCCESS",
  "message": "系统设置已更新",
  "data": {
    "key": "site_name",
    "value": "清如家政服务平台",
    "updatedAt": "2026-03-30T10:30:00.000Z",
    "updatedBy": "ou_xxxxxxxxxxxxxxxx"
  }
}
```

### 相关接口
- `GET /api/admin/settings` - 获取系统设置
- `PUT /api/admin/settings` - 批量更新系统设置
- `DELETE /api/admin/settings/:key` - 删除系统设置

### 错误响应
| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数无效 (键名为空、包含非法字符等) |
| 401 | UNAUTHORIZED | 未提供 Token 或 Token 无效 |
| 403 | FORBIDDEN | 权限不足，需要管理员权限 |

---

## 通用说明

### 认证方式
所有接口均使用 Bearer Token 认证:
```
Authorization: Bearer YOUR_TOKEN
```

### 统一响应格式
```json
{
  "code": "SUCCESS",
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应格式
```json
{
  "code": "ERROR_CODE",
  "message": "错误描述",
  "data": null
}
```

### 测试命令
运行测试脚本验证所有接口:
```bash
export ADMIN_TOKEN="your_admin_token_here"
node tests/missing-api.test.js
```

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-30 | v1.0 | 初始版本，包含 5 个核心管理端 API |
