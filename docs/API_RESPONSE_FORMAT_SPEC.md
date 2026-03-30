# API 响应格式规范

## 概述

本文档定义了清如 ClearSpring V2.0 所有 API 的统一响应格式标准。

## 标准响应格式

### 成功响应

```json
{
  "code": "SUCCESS",
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": "ERROR_CODE",
  "message": "错误描述",
  "data": null
}
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | string | ✅ | 响应状态码，`SUCCESS` 表示成功，其他值表示错误 |
| `message` | string | ✅ | 响应消息，描述操作结果或错误原因 |
| `data` | object/null | ✅ | 响应数据，成功时包含业务数据，错误时为 `null` |

## HTTP 状态码

**所有业务响应统一使用 HTTP 200 状态码**，业务成功/失败通过 `code` 字段区分：

- `code: "SUCCESS"` - 业务成功
- 其他 `code` 值 - 业务失败（如 `INVALID_PARAMS`, `UNAUTHORIZED`, `NOT_FOUND` 等）

## 常见错误码

| 错误码 | 说明 | HTTP 状态 |
|--------|------|----------|
| `SUCCESS` | 操作成功 | 200 |
| `INVALID_PARAMS` | 参数无效 | 200 |
| `UNAUTHORIZED` | 未授权访问 | 200 |
| `INVALID_TOKEN` | Token 无效 | 200 |
| `TOKEN_EXPIRED` | Token 已过期 | 200 |
| `FORBIDDEN` | 权限不足 | 200 |
| `NOT_FOUND` | 资源不存在 | 200 |
| `INTERNAL_ERROR` | 服务器内部错误 | 200 |

## 示例

### 登录成功

```json
{
  "code": "SUCCESS",
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "role": "admin",
    "permissions": ["all"],
    "lastLoginAt": "2026-03-30T09:00:00.000Z"
  }
}
```

### 参数验证失败

```json
{
  "code": "INVALID_PARAMS",
  "message": "账号和密码不能为空",
  "data": null
}
```

### 认证失败

```json
{
  "code": "AUTH_FAILED",
  "message": "账号或密码错误",
  "data": null
}
```

### 资源不存在

```json
{
  "code": "ORDER_NOT_FOUND",
  "message": "订单不存在",
  "data": null
}
```

## 实现细节

### 错误处理中间件

所有错误通过 `errorHandler` 中间件统一处理：

```javascript
// api/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let code = err.code || 'INTERNAL_ERROR';
  
  // 所有业务错误都返回 200，通过 code 字段区分成功/失败
  res.status(200).json({
    code,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### 成功响应

所有成功响应必须包含三个字段：

```javascript
res.json({
  code: 'SUCCESS',
  message: '操作成功',
  data: { ... }
});
```

## 修改历史

| 日期 | 修改内容 | 修改人 |
|------|----------|--------|
| 2026-03-30 | 统一所有 API 响应格式为 `{ code, message, data }` | AI Assistant |
| 2026-03-30 | 错误处理中间件修改为返回 HTTP 200 | AI Assistant |

## 相关文件

- `api/middleware/errorHandler.js` - 错误处理中间件
- `api/routes/admin/auth.js` - 认证接口
- `api/routes/admin/orders.js` - 订单管理接口
- `api/routes/admin/qualifications.js` - 资质审核接口
- `api/routes/admin/executors.js` - 执行者管理接口
- `api/routes/admin/profit-sharing.js` - 分账配置接口
- `api/routes/admin/export.js` - 数据导出接口
- `api/routes/admin/dashboard.js` - 数据统计接口
- `api/routes/admin/admins.js` - 管理员管理接口
- `api/routes/admin/audit-logs.js` - 操作日志接口
- `api/routes/admin/index.js` - 管理端路由入口
