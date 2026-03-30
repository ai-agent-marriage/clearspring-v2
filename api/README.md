# 清如 ClearSpring V2.0 - 后端 API

## 📋 接口清单

### 用户接口 (3 个)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/user/login` | 微信登录 | ❌ |
| GET | `/api/user/profile` | 获取用户信息 | ✅ |
| PUT | `/api/user/profile` | 更新用户信息 | ✅ |

### 订单接口 (4 个)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/order/create` | 创建订单 | ✅ |
| GET | `/api/order/list` | 订单列表 | ✅ |
| GET | `/api/order/detail/:id` | 订单详情 | ✅ |
| POST | `/api/order/cancel` | 取消订单 | ✅ |

### 执行者接口 (2 个)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/executor/list` | 执行者列表 | ❌ |
| GET | `/api/executor/detail/:id` | 执行者详情 | ❌ |

**总计：9 个接口**

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd api
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 3. 初始化数据库

```bash
node database/init.js
```

### 4. 启动服务

```bash
npm start
# 或开发模式
npm run dev
```

服务将启动在 `http://0.0.0.0:3000`

---

## 📝 接口示例

### 用户登录

```bash
POST http://101.96.192.63:3000/api/user/login
Content-Type: application/json

{
  "code": "微信登录 code"
}
```

响应:
```json
{
  "code": "SUCCESS",
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "userId": "...",
      "openId": "...",
      "nickName": "..."
    }
  }
}
```

### 获取用户信息

```bash
GET http://101.96.192.63:3000/api/user/profile
Authorization: Bearer {token}
```

### 创建订单

```bash
POST http://101.96.192.63:3000/api/order/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceType": "放生",
  "serviceName": "放生服务",
  "serviceDate": "2026-04-01T10:00:00+08:00",
  "location": "上海市浦东新区",
  "price": 100,
  "quantity": 1,
  "remark": "备注信息"
}
```

---

## 🔐 认证说明

除登录接口外，其他接口均需要在 Header 中携带 JWT Token：

```
Authorization: Bearer {token}
```

Token 有效期：7 天

---

## 📦 技术栈

- **运行时**: Node.js 22.22.0
- **框架**: Express 4.18
- **数据库**: MongoDB
- **缓存**: Redis (可选)
- **认证**: JWT
- **部署**: 火山云服务器

---

## 🌩️ 微信云函数

### 云函数清单 (4 个)

| 云函数 | 功能 | 部署环境 |
|--------|------|----------|
| login | 用户登录/注册 | 微信云 |
| createOrder | 创建订单 | 微信云 |
| grabOrder | 抢单（分布式锁） | 微信云 |
| uploadEvidence | 证据上传（断点续传） | 微信云 |

### 部署步骤

1. 打开微信开发者工具
2. 进入云开发控制台
3. 选择环境：`cloud1-7ga68ls3ccebbe5b`
4. 上传云函数文件夹

---

## 🗄️ 数据库集合

| 集合名 | 描述 | 用途 |
|--------|------|------|
| users | 用户表 | 存储用户信息 |
| orders | 订单表 | 存储订单数据 |
| evidence | 证据表 | 存储上传证据 |
| certificates | 证书表 | 存储证书信息 |
| transactions | 交易表 | 存储交易记录 |
| audit_logs | 审计日志 | 存储操作日志 |

---

## 📊 健康检查

```bash
GET http://101.96.192.63:3000/health
```

响应:
```json
{
  "status": "ok",
  "timestamp": "2026-03-30T03:24:00.000Z",
  "service": "clearspring-v2-api",
  "version": "2.0.0"
}
```

---

**版本**: 2.0.0  
**最后更新**: 2026-03-30
