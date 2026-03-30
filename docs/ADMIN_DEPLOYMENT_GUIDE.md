# 🎊 清如 ClearSpring - 管理后台部署指南

## 📋 部署步骤

### 1. 创建管理员账号（微信云开发控制台）

**步骤**：
1. 登录微信云开发控制台：https://console.cloud.weixin.qq.com/
2. 选择环境：`cloud1-7ga68ls3ccebbe5b`
3. 进入数据库
4. 创建集合：`admins`
5. 点击"添加数据"，粘贴以下内容：

```json
{
  "username": "admin",
  "password": "admin123",
  "role": "super_admin",
  "status": "active",
  "permissions": [
    "order:read", "order:write", "order:delete",
    "qualification:read", "qualification:write",
    "appeal:read", "appeal:write",
    "executor:read", "executor:write",
    "profit:read", "profit:write",
    "export:read", "settings:read", "settings:write"
  ],
  "createdAt": "2026-03-30T00:00:00.000Z",
  "lastLoginAt": null,
  "createdBy": "system"
}
```

**测试账号**：
| 账号 | 密码 | 角色 | 权限 |
|------|------|------|------|
| admin | admin123 | 超级管理员 | 全部权限 |
| operator | operator123 | 运营管理员 | 订单/资质/申诉/执行者 |
| auditor | auditor123 | 审核员 | 资质审核/申诉仲裁 |

⚠️ **生产环境请立即修改默认密码！**

---

### 2. 部署云函数（adminLogin）

**步骤**：
1. 在微信云开发控制台 → 云函数
2. 点击"添加云函数"
3. 上传 `/root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/adminLogin/` 目录
4. 等待部署完成
5. 测试云函数

**测试参数**：
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**期望返回**：
```json
{
  "code": "SUCCESS",
  "message": "登录成功",
  "data": {
    "token": "admin_admin_xxxxxx",
    "username": "admin",
    "role": "super_admin"
  }
}
```

---

### 3. 部署后端 API（火山云服务器）

**步骤**：
1. SSH 登录服务器：`ssh root@101.96.192.63`
2. 进入项目目录：`cd /root/.openclaw/workspace/projects/clearspring-v2/api`
3. 安装依赖：`npm install`
4. 重启服务：`pm2 restart clearspring-api`

**验证 API**：
```bash
curl https://springs.dexoconnect.com/health
# 返回：{"status":"ok","version":"2.0.0"}
```

---

### 4. 验证管理后台

**访问**：https://springs.dexoconnect.com/admin

**测试登录**：
- 账号：`admin`
- 密码：`admin123`

**验证功能**：
1. ✅ 登录成功
2. ✅ 跳转到控制台
3. ✅ 显示统计数据
4. ✅ 显示最近订单
5. ✅ 退出登录

---

## 🔧 后端 API 路由

需要实现的后端 API 接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| POST /api/admin/login | 管理员登录 |
| GET /api/admin/info | 获取管理员信息 |
| POST /api/admin/logout | 退出登录 |
| GET /api/admin/dashboard/stats | 统计数据 |
| GET /api/admin/dashboard/recent-orders | 最近订单 |
| GET /api/admin/orders | 订单列表 |
| PUT /api/admin/orders/:id/status | 更新订单状态 |
| GET /api/admin/qualifications | 资质审核列表 |
| PUT /api/admin/qualifications/:id | 审核资质 |
| GET /api/admin/appeals | 申诉列表 |
| PUT /api/admin/appeals/:id/arbitrate | 仲裁申诉 |
| GET /api/admin/executors | 执行者列表 |
| PUT /api/admin/executors/:id/status | 更新执行者状态 |
| GET /api/admin/profit-sharing | 分账配置 |
| PUT /api/admin/profit-sharing | 更新分账配置 |
| GET /api/admin/settings | 系统设置 |
| GET /api/admin/logs | 操作日志 |

---

## 📁 文件清单

**前端文件**（已部署到 `/var/www/clearspring-admin/`）：
- ✅ index.html - 登录页
- ✅ dashboard.html - 控制台
- 📁 api/ - API 封装模块（9 个文件）

**云函数**：
- ✅ cloudfunctions/adminLogin/ - 管理员登录

**后端 API**：
- ⏳ api/routes/admin/ - 管理端路由（需要实现）

**数据库集合**：
- ⏳ admins - 管理员账号（需要创建）
- ✅ orders - 订单表
- ✅ users - 用户表
- ✅ executors - 执行者表

---

## 🔐 安全建议

1. **修改默认密码** - 首次登录后立即修改
2. **启用 HTTPS** - 已配置 ✅
3. **Token 过期时间** - 建议设置 24 小时
4. **密码加密** - 生产环境使用 bcrypt 加密
5. **操作日志** - 记录所有管理操作
6. **权限控制** - 基于角色的权限管理

---

## 📞 技术支持

如有问题，请检查：
1. Nginx 日志：`tail -f /var/log/nginx/error.log`
2. PM2 日志：`pm2 logs clearspring-api`
3. 云函数日志：微信云开发控制台 → 云函数 → 日志

---

**部署完成后，访问 https://springs.dexoconnect.com/admin 开始管理！** 🚀
