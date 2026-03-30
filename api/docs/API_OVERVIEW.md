# 清如 ClearSpring API 文档概览

> **版本**: 2.0.0  
> **基础 URL**: `http://localhost:3000/api`  
> **Swagger 文档**: `http://localhost:3000/api-docs`

---

## 快速开始

### 1. 访问 Swagger UI

启动服务器后，访问：
```
http://localhost:3000/api-docs
```

### 2. 认证方式

大部分接口需要 JWT Token 认证：

```http
Authorization: Bearer <your_jwt_token>
```

### 3. 响应格式

所有接口统一返回格式：

```json
{
  "code": "SUCCESS",
  "data": { ... },
  "message": "操作成功"
}
```

错误响应：

```json
{
  "code": "ERROR_CODE",
  "data": null,
  "message": "错误消息"
}
```

---

## API 分类

### 🔐 认证接口

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/user/login` | POST | 微信登录 | ❌ |
| `/api/user/profile` | GET | 获取用户信息 | ✅ |
| `/api/user/profile` | PUT | 更新用户信息 | ✅ |

### 📦 订单接口

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/order/create` | POST | 创建订单 | ✅ |
| `/api/order/list` | GET | 订单列表 | ✅ |
| `/api/order/detail/:id` | GET | 订单详情 | ✅ |
| `/api/order/cancel` | POST | 取消订单 | ✅ |
| `/api/order/grab` | POST | 抢单 | ✅ |

### 👤 执行者接口

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/executor/list` | GET | 执行者列表 | ✅ |
| `/api/executor/detail/:id` | GET | 执行者详情 | ✅ |
| `/api/executor/qualification` | POST | 提交资质 | ✅ |
| `/api/executor/status` | PUT | 更新状态 | ✅ |

### 📚 内容接口

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/content/wiki` | GET | Wiki 内容 | ❌ |
| `/api/content/meditation` | GET | 冥想课程 | ❌ |
| `/api/content/ritual` | GET | 仪式内容 | ❌ |

### 🔧 管理接口

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/admin/orders` | GET | 订单管理 | ✅(Admin) |
| `/api/admin/users` | GET | 用户管理 | ✅(Admin) |
| `/api/admin/executors` | GET | 执行者管理 | ✅(Admin) |
| `/api/admin/audit` | POST | 审核操作 | ✅(Admin) |
| `/api/admin/export` | POST | 数据导出 | ✅(Admin) |
| `/api/admin/dashboard` | GET | 仪表板数据 | ✅(Admin) |

---

## 错误码

详见：[ERROR_CODES.md](./ERROR_CODES.md)

### 常见错误码

| 错误码 | 说明 | HTTP 状态码 |
|--------|------|------------|
| `SUCCESS` | 操作成功 | 200 |
| `USER_NOT_FOUND` | 用户不存在 | 404 |
| `USER_TOKEN_INVALID` | Token 无效 | 401 |
| `ORDER_NOT_FOUND` | 订单不存在 | 404 |
| `VALIDATION_ERROR` | 验证失败 | 400 |
| `INTERNAL_ERROR` | 服务器错误 | 500 |

---

## 使用示例

### 1. 用户登录

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "wechat_auth_code"
  }'
```

响应：
```json
{
  "code": "SUCCESS",
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "nickName": "张三",
      "role": "user"
    }
  }
}
```

### 2. 创建订单

```bash
curl -X POST http://localhost:3000/api/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "serviceType": "cleaning",
    "serviceName": "家庭保洁",
    "serviceDate": "2026-04-01T10:00:00Z",
    "price": 200,
    "quantity": 1
  }'
```

### 3. 获取订单列表

```bash
curl -X GET "http://localhost:3000/api/order/list?page=1&limit=20" \
  -H "Authorization: Bearer <your_token>"
```

---

## 数据模型

### User (用户)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "openId": "openid_xxx",
  "nickName": "张三",
  "avatarUrl": "https://...",
  "phone": "13800138000",
  "role": "user",
  "createdAt": "2026-03-31T00:00:00Z",
  "updatedAt": "2026-03-31T00:00:00Z"
}
```

### Order (订单)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "orderNo": "ORD20260331000001",
  "userId": "507f1f77bcf86cd799439011",
  "serviceType": "cleaning",
  "serviceName": "家庭保洁",
  "serviceDate": "2026-04-01T10:00:00Z",
  "price": 200,
  "quantity": 1,
  "totalPrice": 200,
  "status": "pending",
  "executorId": null,
  "createdAt": "2026-03-31T00:00:00Z",
  "updatedAt": "2026-03-31T00:00:00Z"
}
```

### Executor (执行者)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "qualificationStatus": "approved",
  "status": "available",
  "completedOrders": 128,
  "rating": 4.8,
  "createdAt": "2026-03-31T00:00:00Z"
}
```

---

## 开发环境

### 启动服务器

```bash
cd api
npm run dev
```

### 查看日志

```bash
tail -f logs/app.log
```

### 运行测试

```bash
npm test
npm run test:coverage
```

---

## 生产环境

### 部署地址

- **API**: http://101.96.192.63:3000/api
- **Swagger**: http://101.96.192.63:3000/api-docs
- **管理后台**: http://101.96.192.63:8080

### 环境变量

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clearspring_v2
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
WECHAT_APPID=wxa914ecc15836bda6
WECHAT_SECRET=your_wechat_secret
```

---

## 更新日志

### v2.0.0 (2026-03-31)

- ✅ 统一错误码规范
- ✅ 添加 Swagger API 文档
- ✅ 配置 ESLint + Prettier
- ✅ 完善代码规范文档

### v1.0.0 (2026-03-01)

- 初始版本发布

---

**维护者**: 清如开发团队  
**文档更新时间**: 2026-03-31
