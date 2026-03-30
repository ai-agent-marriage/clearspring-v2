# 清如 ClearSpring API 错误码字典

> **版本**: 2.0.0  
> **更新时间**: 2026-03-31  
> **命名规范**: `MODULE_ERROR_TYPE`

---

## 使用说明

### 1. 错误码结构

每个错误码包含三个字段：
- `code`: 错误码标识（英文大写）
- `message`: 错误消息（中文）
- `statusCode`: HTTP 状态码

### 2. 使用方式

```javascript
const { AppError, sendError, sendSuccess, asyncHandler } = require('./middleware/errorHandler');
const errorCodes = require('./utils/errorCodes');

// 方式 1: 抛出错误
throw new AppError('USER_NOT_FOUND');

// 方式 2: 直接响应错误
sendError(res, 'ORDER_CREATE_FAILED');

// 方式 3: 自定义错误消息
throw new AppError('VALIDATION_ERROR', '手机号格式不正确');

// 方式 4: 成功响应
sendSuccess(res, { userId: 123 }, '创建成功');

// 方式 5: 包装 async 函数
router.post('/login', asyncHandler(async (req, res) => {
  // 业务逻辑
}));
```

### 3. 错误码分类

| 分类 | 错误码范围 | 说明 |
|------|-----------|------|
| 通用错误 | 1xxx | 参数错误、重复请求等 |
| 用户相关 | 2xxx | 登录、权限、Token 等 |
| 订单相关 | 3xxx | 订单 CRUD、抢单等 |
| 内容相关 | 4xxx | 内容管理、Wiki、冥想等 |
| 管理相关 | 5xxx | 管理员、审核、导出等 |
| 执行者相关 | 6xxx | 执行者资质、证据、摄像头等 |
| 系统相关 | 7xxx | 数据库、Redis、文件等 |
| 验证相关 | 8xxx | 邮箱、手机、密码验证等 |

---

## 错误码列表

### 通用错误 (1xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `SUCCESS` | 操作成功 | 200 | 成功响应 |
| `COMMON_INVALID_PARAM` | 参数错误 | 400 | 请求参数格式错误 |
| `COMMON_MISSING_PARAM` | 缺少必要参数 | 400 | 缺少必填参数 |
| `COMMON_DUPLICATE_REQUEST` | 重复请求 | 400 | 短时间内重复提交 |

### 用户相关错误 (2xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `USER_NOT_FOUND` | 用户不存在 | 404 | 用户 ID 不存在 |
| `USER_LOGIN_FAILED` | 登录失败 | 401 | 账号或密码错误 |
| `USER_TOKEN_INVALID` | Token 无效 | 401 | JWT Token 验证失败 |
| `USER_TOKEN_EXPIRED` | Token 已过期 | 401 | JWT Token 过期 |
| `USER_PERMISSION_DENIED` | 权限不足 | 403 | 用户无权限访问 |
| `USER_ALREADY_EXISTS` | 用户已存在 | 409 | 用户重复创建 |

### 订单相关错误 (3xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `ORDER_NOT_FOUND` | 订单不存在 | 404 | 订单 ID 不存在 |
| `ORDER_CREATE_FAILED` | 创建订单失败 | 500 | 订单创建失败 |
| `ORDER_UPDATE_FAILED` | 更新订单失败 | 500 | 订单更新失败 |
| `ORDER_DELETE_FAILED` | 删除订单失败 | 500 | 订单删除失败 |
| `ORDER_GRAB_FAILED` | 抢单失败 | 400 | 抢单操作失败 |
| `ORDER_STATUS_INVALID` | 订单状态无效 | 400 | 订单状态不合法 |
| `ORDER_ALREADY_GRABBED` | 订单已被抢占 | 409 | 订单已被其他执行者抢占 |

### 内容相关错误 (4xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `CONTENT_NOT_FOUND` | 内容不存在 | 404 | 内容 ID 不存在 |
| `CONTENT_CREATE_FAILED` | 创建内容失败 | 500 | 内容创建失败 |
| `CONTENT_UPDATE_FAILED` | 更新内容失败 | 500 | 内容更新失败 |
| `CONTENT_DELETE_FAILED` | 删除内容失败 | 500 | 内容删除失败 |
| `WIKI_NOT_FOUND` | Wiki 内容不存在 | 404 | Wiki 条目不存在 |
| `MEDITATION_NOT_FOUND` | 冥想课程不存在 | 404 | 冥想课程不存在 |
| `RITUAL_NOT_FOUND` | 仪式内容不存在 | 404 | 仪式内容不存在 |

### 管理相关错误 (5xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `ADMIN_NOT_FOUND` | 管理员不存在 | 404 | 管理员 ID 不存在 |
| `ADMIN_LOGIN_FAILED` | 管理员登录失败 | 401 | 管理员账号或密码错误 |
| `ADMIN_PERMISSION_DENIED` | 管理员权限不足 | 403 | 管理员无权限操作 |
| `AUDIT_FAILED` | 审核失败 | 400 | 审核操作失败 |
| `APPEAL_NOT_FOUND` | 申诉不存在 | 404 | 申诉 ID 不存在 |
| `EXPORT_FAILED` | 导出失败 | 500 | 数据导出失败 |
| `DASHBOARD_DATA_ERROR` | 仪表板数据错误 | 500 | 仪表板数据获取失败 |

### 执行者相关错误 (6xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `EXECUTOR_NOT_FOUND` | 执行者不存在 | 404 | 执行者 ID 不存在 |
| `EXECUTOR_QUALIFICATION_PENDING` | 执行者资质审核中 | 400 | 资质审核未完成 |
| `EXECUTOR_QUALIFICATION_REJECTED` | 执行者资质未通过 | 400 | 资质审核被拒绝 |
| `EXECUTOR_STATUS_INVALID` | 执行者状态无效 | 400 | 执行者状态不合法 |
| `EXECUTOR_INCOME_ERROR` | 执行者收益计算错误 | 500 | 收益计算失败 |
| `EVIDENCE_UPLOAD_FAILED` | 证据上传失败 | 500 | 证据文件上传失败 |
| `CAMERA_ACCESS_DENIED` | 摄像头访问被拒绝 | 403 | 无权限访问摄像头 |

### 系统相关错误 (7xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `INTERNAL_ERROR` | 服务器内部错误 | 500 | 未预期的服务器错误 |
| `DATABASE_ERROR` | 数据库错误 | 500 | MongoDB 操作失败 |
| `REDIS_ERROR` | Redis 错误 | 500 | Redis 操作失败 |
| `FILE_UPLOAD_FAILED` | 文件上传失败 | 500 | 文件上传失败 |
| `FILE_NOT_FOUND` | 文件不存在 | 404 | 文件不存在 |
| `NETWORK_ERROR` | 网络错误 | 503 | 网络连接失败 |
| `SERVICE_UNAVAILABLE` | 服务不可用 | 503 | 服务暂时不可用 |

### 验证相关错误 (8xxx)

| 错误码 | 消息 | HTTP 状态码 | 说明 |
|--------|------|------------|------|
| `VALIDATION_ERROR` | 验证失败 | 400 | 通用验证失败 |
| `VALIDATION_EMAIL_INVALID` | 邮箱格式错误 | 400 | 邮箱格式不正确 |
| `VALIDATION_PHONE_INVALID` | 手机号格式错误 | 400 | 手机号格式不正确 |
| `VALIDATION_PASSWORD_WEAK` | 密码强度不足 | 400 | 密码过于简单 |

---

## 最佳实践

### 1. 错误处理

```javascript
// ✅ 好的做法
try {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND');
  }
} catch (error) {
  next(error); // 交给错误处理中间件
}

// ❌ 不好的做法
try {
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ error: '出错了' });
}
```

### 2. 自定义错误消息

```javascript
// ✅ 提供有用的上下文
throw new AppError('VALIDATION_ERROR', `手机号 ${phone} 格式不正确`);

// ❌ 过于模糊
throw new AppError('VALIDATION_ERROR');
```

### 3. 异步处理

```javascript
// ✅ 使用 asyncHandler 包装
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id);
  sendSuccess(res, user);
}));

// ❌ 忘记捕获错误
router.get('/user/:id', async (req, res) => {
  const user = await getUser(req.params.id); // 错误未被捕获
  sendSuccess(res, user);
});
```

---

## 添加新错误码

如需添加新的错误码，请遵循以下步骤：

1. 在 `api/utils/errorCodes.js` 中添加错误码定义
2. 按照分类选择合适的错误码范围
3. 使用 `MODULE_ERROR_TYPE` 命名规范
4. 更新本文档

示例：
```javascript
// api/utils/errorCodes.js
PAYMENT_FAILED: { code: 'PAYMENT_FAILED', message: '支付失败', statusCode: 400 },
```

---

**维护者**: 清如开发团队  
**最后更新**: 2026-03-31
