# 🎊 清如 ClearSpring - 管理员账号创建指南

## ⚠️ 重要说明

**微信云开发控制台无法直接在浏览器访问**，必须通过**微信开发者工具**访问！

---

## 📋 方法 1：通过微信开发者工具（推荐）

### 步骤 1：下载并安装微信开发者工具

**下载地址**：
```
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

**选择版本**：
- Windows：稳定版（64 位）
- Mac：稳定版（Intel/Apple Silicon）

---

### 步骤 2：导入小程序项目

1. **打开微信开发者工具**
2. **选择「导入项目」**
3. **填写项目信息**：
   - 项目名称：清如 ClearSpring
   - 目录：`/root/.openclaw/workspace/projects/clearspring-v2/miniprogram`
   - AppID：`wxa914ecc15836bda6`
   - 后端服务：微信云开发

4. **点击「导入」**

---

### 步骤 3：进入云开发控制台

1. **点击工具栏的「云开发」按钮**（云朵图标）
2. **选择环境**：`cloud1-7ga68ls3ccebbe5b`
3. **进入数据库**

---

### 步骤 4：创建 admins 集合

1. **点击「+」创建集合**
2. **集合名称**：`admins`
3. **点击「确定」**

---

### 步骤 5：添加管理员账号

**方式 A：通过界面添加**

1. 点击 `admins` 集合
2. 点击「添加数据」
3. 选择「自定义类型」
4. 粘贴以下 JSON：

```json
{
  "_id": "admin001",
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
  "createdAt": {
    "$date": "2026-03-30T00:00:00.000Z"
  },
  "lastLoginAt": null,
  "createdBy": "system"
}
```

5. **点击「确定」**

---

**方式 B：通过批量导入（推荐）**

1. 在服务器执行以下命令生成导入文件：

```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
cat > /tmp/admins_import.json << 'EOF'
[
  {
    "_id": "admin001",
    "username": "admin",
    "password": "admin123",
    "role": "super_admin",
    "status": "active",
    "permissions": ["order:*", "qualification:*", "appeal:*", "executor:*", "profit:*", "export:*", "settings:*"],
    "createdAt": "2026-03-30T00:00:00.000Z"
  },
  {
    "_id": "operator001",
    "username": "operator",
    "password": "operator123",
    "role": "operator",
    "status": "active",
    "permissions": ["order:*", "qualification:*", "appeal:*", "executor:*", "export:*"],
    "createdAt": "2026-03-30T00:00:00.000Z"
  },
  {
    "_id": "auditor001",
    "username": "auditor",
    "password": "auditor123",
    "role": "auditor",
    "status": "active",
    "permissions": ["order:read", "qualification:*", "appeal:*", "executor:read"],
    "createdAt": "2026-03-30T00:00:00.000Z"
  }
]
EOF

echo "导入文件已生成：/tmp/admins_import.json"
```

2. **在微信开发者工具中**：
   - 进入 `admins` 集合
   - 点击「导入」
   - 选择 `/tmp/admins_import.json`
   - 点击「确定」

---

### 步骤 6：验证账号

**在微信开发者工具中**：
1. 进入 `admins` 集合
2. 查看是否有 3 条数据
3. 确认账号信息正确

---

## 📋 方法 2：通过云函数初始化（自动化）

### 步骤 1：创建初始化云函数

在服务器执行：

```bash
mkdir -p /root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/initAdmins

cat > /root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/initAdmins/index.js << 'EOF'
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 创建 admins 集合
    await db.createCollection('admins');
    
    // 添加超级管理员
    await db.collection('admins').add({
      data: {
        username: 'admin',
        password: 'admin123',
        role: 'super_admin',
        status: 'active',
        permissions: ['*'],
        createdAt: new Date(),
        createdBy: 'system'
      }
    });
    
    // 添加运营管理员
    await db.collection('admins').add({
      data: {
        username: 'operator',
        password: 'operator123',
        role: 'operator',
        status: 'active',
        permissions: ['order:*', 'qualification:*', 'appeal:*', 'executor:*'],
        createdAt: new Date(),
        createdBy: 'system'
      }
    });
    
    // 添加审核员
    await db.collection('admins').add({
      data: {
        username: 'auditor',
        password: 'auditor123',
        role: 'auditor',
        status: 'active',
        permissions: ['qualification:*', 'appeal:*'],
        createdAt: new Date(),
        createdBy: 'system'
      }
    });
    
    return {
      code: 'SUCCESS',
      message: '管理员账号初始化成功',
      data: {
        accounts: [
          { username: 'admin', password: 'admin123', role: '超级管理员' },
          { username: 'operator', password: 'operator123', role: '运营管理员' },
          { username: 'auditor', password: 'auditor123', role: '审核员' }
        ]
      }
    };
  } catch (error) {
    return {
      code: 'ERROR',
      message: error.message
    };
  }
};
EOF

cat > /root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/initAdmins/package.json << 'EOF'
{
  "name": "initAdmins",
  "version": "1.0.0",
  "description": "初始化管理员账号",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
EOF

cat > /root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/initAdmins/config.json << 'EOF'
{
  "permissions": {
    "openapi": []
  }
}
EOF

echo "云函数已创建！"
```

---

### 步骤 2：部署云函数

**在微信开发者工具中**：
1. 点击「云开发」
2. 进入「云函数」
3. 点击「添加云函数」
4. 上传 `/root/.openclaw/workspace/projects/clearspring-v2/cloudfunctions/initAdmins/` 目录
5. 等待部署完成

---

### 步骤 3：执行云函数

**在微信开发者工具中**：
1. 找到 `initAdmins` 云函数
2. 右键点击「云函数调用」
3. 输入参数：`{}`
4. 点击「确定」

**期望返回**：
```json
{
  "code": "SUCCESS",
  "message": "管理员账号初始化成功",
  "data": {
    "accounts": [
      {"username": "admin", "password": "admin123", "role": "超级管理员"},
      {"username": "operator", "password": "operator123", "role": "运营管理员"},
      {"username": "auditor", "password": "auditor123", "role": "审核员"}
    ]
  }
}
```

---

### 步骤 4：验证账号

**在微信开发者工具中**：
1. 进入「数据库」
2. 查看 `admins` 集合
3. 确认有 3 条管理员账号

---

## 🔐 测试账号

| 账号 | 密码 | 角色 | 权限 |
|------|------|------|------|
| admin | admin123 | 超级管理员 | 全部权限 |
| operator | operator123 | 运营管理员 | 订单/资质/申诉/执行者 |
| auditor | auditor123 | 审核员 | 资质审核/申诉仲裁 |

⚠️ **生产环境请立即修改默认密码！**

---

## 📞 常见问题

### Q1: 微信开发者工具无法登录？
**A**: 需要使用小程序管理员的微信扫码登录。

### Q2: 找不到云开发入口？
**A**: 
1. 确保已开通云开发（免费版即可）
2. 确保 AppID 正确（`wxa914ecc15836bda6`）
3. 重启微信开发者工具

### Q3: 创建集合失败？
**A**: 
1. 检查云开发环境是否正确（`cloud1-7ga68ls3ccebbe5b`）
2. 检查是否有数据库权限
3. 尝试手动创建集合

### Q4: 云函数调用失败？
**A**: 
1. 检查云函数是否部署成功
2. 检查云函数日志
3. 确保 wx-server-sdk 版本正确

---

## 🚀 下一步

**创建管理员账号后**：

1. ✅ 访问管理后台：https://springs.dexoconnect.com/admin
2. ✅ 使用测试账号登录
3. ✅ 验证管理功能
4. ✅ 修改默认密码

---

**需要我帮你执行哪个步骤吗？** 🎉
