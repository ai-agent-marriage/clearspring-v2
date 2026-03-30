# 📖 执行者管理 API 查询指南

**版本**: v2.0  
**最后更新**: 2026-03-30  
**基础 URL**: `http://101.96.192.63:3000`

---

## 🔐 认证说明

### Token 获取

```bash
curl -X POST "http://101.96.192.63:3000/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**响应**:
```json
{
  "code": "SUCCESS",
  "data": {
    "token": "admin_admin_1774869127316",
    "username": "admin",
    "role": "super_admin",
    "permissions": ["*"],
    "lastLoginAt": "2026-03-30T11:10:08.672Z"
  },
  "message": "登录成功"
}
```

### Token 使用

所有管理 API 需要在 Header 中携带 Token：

```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 API 接口

### 1. 获取执行者列表

**接口**: `GET /api/admin/executors`

**权限**: `admin` 或 `super_admin`

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| status | string | 否 | - | 状态筛选 (active/inactive/banned) |
| keyword | string | 否 | - | 关键词搜索 (昵称/手机号) |
| serviceType | string | 否 | - | 服务类型筛选 |

**请求示例**:
```bash
curl -X GET "http://101.96.192.63:3000/api/admin/executors?page=1&pageSize=10&status=active" \
  -H "Authorization: Bearer admin_admin_1774869127316"
```

**成功响应**:
```json
{
  "code": "SUCCESS",
  "data": {
    "executors": [
      {
        "executorId": "507f1f77bcf86cd799439011",
        "openId": "oXXXXXX",
        "nickName": "张三",
        "avatarUrl": "https://...",
        "phone": "138****1234",
        "gender": "male",
        "city": "上海市",
        "province": "上海市",
        "status": "active",
        "rating": 4.8,
        "serviceTypes": ["cleaning", "cooking"],
        "serviceAreas": ["浦东新区", "黄浦区"],
        "bio": "专业家政服务 5 年经验",
        "totalOrders": 120,
        "completedOrders": 115,
        "cancelledOrders": 5,
        "completionRate": "95.83",
        "createdAt": "2026-01-15T08:00:00.000Z",
        "lastLoginAt": "2026-03-30T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "message": "获取成功"
}
```

**错误响应**:

| 错误码 | 说明 | HTTP 状态 |
|--------|------|----------|
| UNAUTHORIZED | 未提供认证令牌 | 200 |
| INVALID_TOKEN | 无效的认证令牌 | 200 |
| FORBIDDEN | 权限不足 | 200 |
| INTERNAL_ERROR | 服务器内部错误 | 200 |

---

### 2. 更新执行者状态

**接口**: `PUT /api/admin/executor/:id/status`

**权限**: `admin` 或 `super_admin`

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 执行者 ID (executorId) |

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 新状态 (active/inactive/banned) |
| remark | string | 否 | 备注说明 |

**请求示例**:
```bash
curl -X PUT "http://101.96.192.63:3000/api/admin/executor/507f1f77bcf86cd799439011/status" \
  -H "Authorization: Bearer admin_admin_1774869127316" \
  -H "Content-Type: application/json" \
  -d '{"status":"banned","remark":"违反平台规定"}'
```

**成功响应**:
```json
{
  "code": "SUCCESS",
  "data": {
    "executorId": "507f1f77bcf86cd799439011",
    "status": "banned",
    "updatedAt": "2026-03-30T11:00:00.000Z"
  },
  "message": "执行者状态已更新"
}
```

**错误响应**:

| 错误码 | 说明 | HTTP 状态 |
|--------|------|----------|
| UNAUTHORIZED | 未提供认证令牌 | 200 |
| INVALID_TOKEN | 无效的认证令牌 | 200 |
| FORBIDDEN | 权限不足 | 200 |
| INVALID_STATUS | 无效的状态 | 200 |
| EXECUTOR_NOT_FOUND | 执行者不存在 | 200 |
| INTERNAL_ERROR | 服务器内部错误 | 200 |

---

## 🔍 查询示例

### 示例 1: 获取所有活跃执行者

```bash
curl -X GET "http://101.96.192.63:3000/api/admin/executors?status=active&pageSize=50" \
  -H "Authorization: Bearer admin_admin_1774869127316"
```

### 示例 2: 搜索特定执行者

```bash
curl -X GET "http://101.96.192.63:3000/api/admin/executors?keyword=张三" \
  -H "Authorization: Bearer admin_admin_1774869127316"
```

### 示例 3: 按服务类型筛选

```bash
curl -X GET "http://101.96.192.63:3000/api/admin/executors?serviceType=cleaning" \
  -H "Authorization: Bearer admin_admin_1774869127316"
```

### 示例 4: 获取第 2 页数据

```bash
curl -X GET "http://101.96.192.63:3000/api/admin/executors?page=2&pageSize=20" \
  -H "Authorization: Bearer admin_admin_1774869127316"
```

---

## 📊 数据字段说明

### 执行者对象字段

| 字段 | 类型 | 说明 |
|------|------|------|
| executorId | string | 执行者唯一标识 |
| openId | string | 微信 OpenID |
| nickName | string | 昵称 |
| avatarUrl | string | 头像 URL |
| phone | string | 手机号 (脱敏) |
| gender | string | 性别 (male/female) |
| city | string | 城市 |
| province | string | 省份 |
| status | string | 状态 (active/inactive/banned) |
| rating | number | 平均评分 (0-5) |
| serviceTypes | array | 服务类型列表 |
| serviceAreas | array | 服务区域列表 |
| bio | string | 个人简介 |
| totalOrders | number | 总订单数 |
| completedOrders | number | 完成订单数 |
| cancelledOrders | number | 取消订单数 |
| completionRate | string | 完成率 (百分比) |
| createdAt | date | 创建时间 |
| lastLoginAt | date | 最后登录时间 |

### 分页对象字段

| 字段 | 类型 | 说明 |
|------|------|------|
| page | number | 当前页码 |
| pageSize | number | 每页数量 |
| total | number | 总记录数 |
| totalPages | number | 总页数 |

---

## 🛠️ 常见问题

### Q1: 返回 403 FORBIDDEN

**原因**: Token 无效或权限不足

**解决**:
1. 检查 Token 是否正确
2. 确认账号具有 `admin` 或 `super_admin` 角色

### Q2: 返回空列表

**原因**: 数据库中没有执行者数据

**解决**: 
- 这是正常现象，表示暂无执行者注册
- 可以通过执行者端小程序注册用户

### Q3: 关键词搜索不生效

**原因**: 关键词匹配昵称或手机号

**解决**:
- 确保关键词与昵称或手机号部分匹配
- 搜索支持模糊匹配（不区分大小写）

---

## 📝 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-30 | v2.0 | 修复认证中间件，支持简单 Token 格式 |
| 2026-03-30 | v2.0 | 扩展角色权限检查，支持 super_admin |
| 2026-03-30 | v2.0 | 初始版本发布 |

---

*文档生成时间: 2026-03-30 19:15 GMT+8*
