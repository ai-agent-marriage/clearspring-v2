# ClearSpring V2 API 响应格式规范

## 概述

本文档定义了清如 ClearSpring V2.0 所有 API 接口的统一响应格式标准。

## 响应格式标准

### 成功响应

```json
{
  "code": "SUCCESS",
  "data": {
    // 业务数据内容
  },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "code": "ERROR_CODE",
  "data": null,
  "message": "错误描述信息"
}
```

## 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | string | 响应状态码，`SUCCESS` 表示成功，其他值表示具体错误类型 |
| `data` | object/null | 业务数据，成功时包含返回数据，错误时为 `null` |
| `message` | string | 响应消息，成功时为操作成功提示，错误时为错误描述 |

## 字段顺序

**重要**：所有 API 响应必须严格按照以下顺序返回字段：

1. `code` - 第一字段
2. `data` - 第二字段
3. `message` - 第三字段

## 常见状态码

### 成功状态码

| 状态码 | 说明 |
|--------|------|
| `SUCCESS` | 操作成功 |

### 认证相关错误码

| 状态码 | 说明 |
|--------|------|
| `UNAUTHORIZED` | 未授权访问 |
| `INVALID_TOKEN` | Token 格式错误 |
| `AUTH_FAILED` | 认证失败（账号或密码错误） |
| `FORBIDDEN` | 权限不足 |

### 参数相关错误码

| 状态码 | 说明 |
|--------|------|
| `INVALID_PARAMS` | 参数无效或缺失 |
| `MISSING_CREDENTIALS` | 缺少凭证信息 |
| `PASSWORD_TOO_SHORT` | 密码长度不足 |

### 资源相关错误码

| 状态码 | 说明 |
|--------|------|
| `NOT_FOUND` | 资源不存在 |
| `ORDER_NOT_FOUND` | 订单不存在 |
| `USER_NOT_FOUND` | 用户不存在 |
| `EXECUTOR_NOT_FOUND` | 执行者不存在 |
| `CERTIFICATE_NOT_FOUND` | 资质记录不存在 |
| `ADMIN_NOT_FOUND` | 管理员不存在 |
| `SETTING_NOT_FOUND` | 设置不存在 |
| `LOG_NOT_FOUND` | 日志不存在 |

### 业务相关错误码

| 状态码 | 说明 |
|--------|------|
| `INVALID_STATUS` | 无效的状态值 |
| `ORDER_CANNOT_DELETE` | 订单无法删除（非取消状态） |
| `CERTIFICATE_ALREADY_AUDITED` | 资质已审核 |
| `MISSING_REJECT_REASON` | 缺少驳回原因 |
| `APPEAL_ALREADY_PROCESSED` | 申诉已处理 |
| `CANNOT_MODIFY_SELF` | 不能修改自己的信息 |
| `CANNOT_DELETE_SELF` | 不能删除自己的账号 |
| `CANNOT_RESET_SELF` | 不能重置自己的密码 |
| `USERNAME_EXISTS` | 用户名已存在 |

### 配置相关错误码

| 状态码 | 说明 |
|--------|------|
| `INVALID_PLATFORM_RATE` | 平台抽成比例无效 |
| `INVALID_EXECUTOR_MIN_RATE` | 执行者最低比例无效 |
| `INVALID_EXECUTOR_MAX_RATE` | 执行者最高比例无效 |
| `INVALID_RATE_SUM` | 比例总和无效 |

### 系统错误码

| 状态码 | 说明 |
|--------|------|
| `INTERNAL_ERROR` | 服务器内部错误 |

## 实现示例

### 成功响应示例

```javascript
// 管理员登录成功
res.json({
  code: 'SUCCESS',
  data: {
    token: 'admin_admin_1234567890',
    username: 'admin',
    role: 'admin',
    permissions: ['all'],
    lastLoginAt: '2026-03-30T10:00:00.000Z'
  },
  message: '登录成功'
});

// 获取列表成功
res.json({
  code: 'SUCCESS',
  data: {
    orders: [...],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 100,
      totalPages: 5
    }
  },
  message: '获取成功'
});
```

### 错误响应示例

```javascript
// 参数验证失败
throw new AppError('账号和密码不能为空', 'INVALID_PARAMS', 400);

// 资源不存在
throw new AppError('订单不存在', 'ORDER_NOT_FOUND', 404);

// 权限不足
throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
```

## 错误处理中间件

所有未捕获的错误都会通过 `errorHandler` 中间件统一处理：

```javascript
// api/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let code = err.code || 'INTERNAL_ERROR';
  
  // 生产环境不暴露详细错误
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = '服务器内部错误';
    code = 'INTERNAL_ERROR';
  }
  
  res.status(200).json({
    code,
    data: null,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## HTTP 状态码说明

所有业务响应（包括错误）都使用 HTTP 200 状态码，通过 `code` 字段区分成功/失败。

这样设计的原因：
1. 简化前端错误处理逻辑
2. 统一错误处理入口
3. 避免 CORS 预检请求复杂化

## 测试验证

运行以下命令验证响应格式：

```bash
cd /root/.openclaw/workspace/projects/clearspring-v2/tests
npm test -- --testNamePattern="响应格式"
```

## 相关文件

- `api/middleware/errorHandler.js` - 错误处理中间件
- `api/routes/admin/*.js` - 管理员路由文件
- `tests/jest-api.test.js` - API 测试文件

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 2.0.0 | 2026-03-30 | 统一响应格式为 `{ code, data, message }` 顺序 |

---

**文档维护**：ClearSpring 开发团队  
**最后更新**：2026-03-30
