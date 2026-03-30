# 清如 ClearSpring V2.0 - 管理端 API 清单

**版本**: 2.0.0  
**更新日期**: 2026-03-30  
**API 地址**: `http://101.96.192.63:3000/api/admin`  
**CORS 允许来源**: `http://localhost:8080`, `http://101.96.192.63:8080`

---

## 目录

1. [认证接口](#认证接口)
2. [管理员管理](#管理员管理)
3. [订单管理](#订单管理)
4. [执行者管理](#执行者管理)
5. [资质审核](#资质审核)
6. [分账配置](#分账配置)
7. [操作日志](#操作日志)
8. [数据统计](#数据统计)
9. [数据导出](#数据导出)

---

## 认证接口

### 1.1 管理员登录
- **接口**: `POST /api/admin/auth/login`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **响应**:
  ```json
  {
    "code": "SUCCESS",
    "message": "登录成功",
    "data": {
      "token": "eyJhbGc...",
      "admin": {
        "adminId": "...",
        "username": "admin",
        "nickName": "管理员",
        "role": "admin",
        "permissions": ["all"]
      }
    }
  }
  ```

### 1.2 获取管理员信息
- **接口**: `GET /api/admin/auth/profile`
- **权限**: 管理员
- **Headers**: `Authorization: Bearer <token>`

### 1.3 更新管理员信息
- **接口**: `PUT /api/admin/auth/profile`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "nickName": "新昵称",
    "phone": "13800138000",
    "email": "admin@example.com"
  }
  ```

### 1.4 修改密码
- **接口**: `PUT /api/admin/auth/password`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码"
  }
  ```

### 1.5 管理员登出
- **接口**: `POST /api/admin/auth/logout`
- **权限**: 管理员

---

## 管理员管理

### 2.1 管理员列表
- **接口**: `GET /api/admin/admins`
- **权限**: 超级管理员
- **查询参数**: `page`, `pageSize`, `status`, `keyword`

### 2.2 管理员详情
- **接口**: `GET /api/admin/admin/:id`
- **权限**: 超级管理员

### 2.3 创建管理员
- **接口**: `POST /api/admin/admin`
- **权限**: 超级管理员
- **请求体**:
  ```json
  {
    "username": "newadmin",
    "password": "password123",
    "nickName": "新管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "permissions": ["view_orders", "view_executors"]
  }
  ```

### 2.4 更新管理员
- **接口**: `PUT /api/admin/admin/:id`
- **权限**: 超级管理员
- **请求体**:
  ```json
  {
    "nickName": "新昵称",
    "permissions": ["all"],
    "status": "active"
  }
  ```

### 2.5 删除管理员
- **接口**: `DELETE /api/admin/admin/:id`
- **权限**: 超级管理员
- **说明**: 软删除，将状态设为 inactive

### 2.6 重置密码
- **接口**: `PUT /api/admin/admin/:id/reset-password`
- **权限**: 超级管理员
- **请求体**:
  ```json
  {
    "newPassword": "新密码"
  }
  ```

---

## 订单管理

### 3.1 订单列表
- **接口**: `GET /api/admin/orders`
- **权限**: 管理员
- **查询参数**: `page`, `pageSize`, `status`, `paymentStatus`, `serviceType`, `startDate`, `endDate`, `keyword`

### 3.2 订单状态更新
- **接口**: `PUT /api/admin/order/:id/status`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "status": "completed",
    "remark": "备注"
  }
  ```

### 3.3 订单删除
- **接口**: `DELETE /api/admin/order/:id`
- **权限**: 管理员
- **说明**: 只能删除已取消的订单

---

## 执行者管理

### 4.1 执行者列表
- **接口**: `GET /api/admin/executors`
- **权限**: 管理员
- **查询参数**: `page`, `pageSize`, `status`, `keyword`, `serviceType`

### 4.2 执行者状态更新
- **接口**: `PUT /api/admin/executor/:id/status`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "status": "active",
    "remark": "备注"
  }
  ```
- **状态值**: `active`, `inactive`, `banned`

---

## 资质审核

### 5.1 资质审核列表
- **接口**: `GET /api/admin/qualifications`
- **权限**: 管理员
- **查询参数**: `page`, `pageSize`, `status`, `type`, `userId`

### 5.2 审核资质
- **接口**: `PUT /api/admin/qualification/:id`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "status": "approved",
    "auditRemark": "审核通过"
  }
  ```
  或
  ```json
  {
    "status": "rejected",
    "rejectReason": "证书不清晰",
    "auditRemark": "请重新上传"
  }
  ```

---

## 分账配置

### 6.1 获取分账配置
- **接口**: `GET /api/admin/profit-sharing`
- **权限**: 管理员

### 6.2 更新分账配置
- **接口**: `PUT /api/admin/profit-sharing`
- **权限**: 管理员
- **请求体**:
  ```json
  {
    "platformRate": 0.10,
    "executorMinRate": 0.70,
    "executorMaxRate": 0.90,
    "defaultExecutorRate": 0.80,
    "minOrderAmount": 10,
    "maxOrderAmount": 10000
  }
  ```

---

## 操作日志

### 7.1 操作日志列表
- **接口**: `GET /api/admin/audit-logs`
- **权限**: 管理员
- **查询参数**: `page`, `pageSize`, `type`, `userId`, `startDate`, `endDate`, `keyword`

### 7.2 日志类型列表
- **接口**: `GET /api/admin/audit-logs/types`
- **权限**: 管理员

### 7.3 操作日志统计
- **接口**: `GET /api/admin/audit-logs/stats`
- **权限**: 管理员
- **查询参数**: `startDate`, `endDate`, `groupBy` (day/week/month)

### 7.4 日志详情
- **接口**: `GET /api/admin/audit-logs/:id`
- **权限**: 管理员

### 7.5 清空日志
- **接口**: `DELETE /api/admin/audit-logs`
- **权限**: 超级管理员
- **查询参数**: `beforeDate` (可选)

---

## 数据统计

### 8.1 概览数据
- **接口**: `GET /api/admin/dashboard/overview`
- **权限**: 管理员
- **查询参数**: `startDate`, `endDate` (默认最近 7 天)
- **返回**: 订单统计、用户统计、执行者统计、资质统计、收入统计

### 8.2 订单趋势
- **接口**: `GET /api/admin/dashboard/orders-trend`
- **权限**: 管理员
- **查询参数**: `startDate`, `endDate`, `groupBy` (day/week/month)

### 8.3 服务类型分布
- **接口**: `GET /api/admin/dashboard/service-types`
- **权限**: 管理员

### 8.4 执行者排行
- **接口**: `GET /api/admin/dashboard/executors-ranking`
- **权限**: 管理员
- **查询参数**: `startDate`, `endDate`, `limit`

### 8.5 实时数据
- **接口**: `GET /api/admin/dashboard/realtime`
- **权限**: 管理员
- **返回**: 今日订单、进行中订单、待审核资质、在线执行者

---

## 数据导出

### 9.1 导出订单
- **接口**: `GET /api/admin/export/orders`
- **权限**: 管理员
- **查询参数**: `startDate`, `endDate`, `status`, `serviceType`, `format` (csv/xlsx)
- **响应**: 文件下载

### 9.2 导出执行者
- **接口**: `GET /api/admin/export/executors`
- **权限**: 管理员
- **查询参数**: `status`, `format` (csv/xlsx)

### 9.3 导出用户
- **接口**: `GET /api/admin/export/users`
- **权限**: 管理员
- **查询参数**: `format` (csv/xlsx)

### 9.4 导出资质
- **接口**: `GET /api/admin/export/qualifications`
- **权限**: 管理员
- **查询参数**: `status`, `format` (csv/xlsx)

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| SUCCESS | 成功 |
| UNAUTHORIZED | 未授权 |
| FORBIDDEN | 权限不足 |
| NOT_FOUND | 资源不存在 |
| INVALID_CREDENTIALS | 凭证无效 |
| MISSING_CREDENTIALS | 缺少凭证 |
| PASSWORD_TOO_SHORT | 密码过短 |
| INVALID_STATUS | 无效状态 |
| ORDER_NOT_FOUND | 订单不存在 |
| EXECUTOR_NOT_FOUND | 执行者不存在 |
| CERTIFICATE_NOT_FOUND | 资质不存在 |
| ADMIN_NOT_FOUND | 管理员不存在 |

---

## 测试命令

```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
node tests/admin-api-test.js
```

---

## 更新日志

### v2.0.0 (2026-03-30)
- ✅ 新增管理员认证接口（登录、登出、修改密码）
- ✅ 新增管理员信息管理接口
- ✅ 新增操作日志接口
- ✅ 新增数据统计接口（Dashboard）
- ✅ 新增数据导出接口（CSV/Excel）
- ✅ 配置 CORS 支持 PC 管理后台访问
- ✅ 完善接口测试脚本
