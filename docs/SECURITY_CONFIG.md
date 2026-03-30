# 🔐 安全配置指南

**清如 ClearSpring V2** - 安全配置与最佳实践

---

## 📋 目录

1. [环境变量配置](#环境变量配置)
2. [JWT 认证配置](#jwt-认证配置)
3. [密码安全配置](#密码安全配置)
4. [数据库安全](#数据库安全)
5. [API 安全](#api-安全)
6. [部署安全](#部署安全)
7. [安全审计](#安全审计)

---

## 环境变量配置

### 必需的环境变量

```bash
# .env 文件示例

# ==================== 服务器配置 ====================
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# ==================== JWT 认证配置 ====================
# 使用 256-bit 随机密钥（64 位十六进制）
# 生成命令：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=85918c796cc9215dc52d2a90d7b20c07aaabf17a7997a9a90e52344b0ffa3e1b
JWT_EXPIRES_IN=24h

# ==================== 数据库配置 ====================
MONGODB_URI=mongodb://localhost:27017/clearspring_v2

# ==================== Redis 配置（可选） ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ==================== 微信配置 ====================
WECHAT_APPID=wxa914ecc15836bda6
WECHAT_SECRET=your_wechat_secret
WECHAT_TOKEN=your_wechat_token

# ==================== 火山云配置 ====================
VOLCANE_REGION=cn-shanghai
VOLCANE_ACCESS_KEY=your_access_key
VOLCANE_SECRET_KEY=your_secret_key
```

### 密钥生成

```bash
# 生成 JWT 密钥（256-bit）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 bcrypt 密码哈希
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

### 安全建议

- ✅ 不要将 `.env` 文件提交到版本控制（已加入 `.gitignore`）
- ✅ 生产环境使用独立的密钥，不要使用示例密钥
- ✅ 定期轮换密钥（建议每 90 天）
- ✅ 使用密钥管理服务（如 AWS Secrets Manager、HashiCorp Vault）

---

## JWT 认证配置

### Token 生成

```javascript
const jwt = require('jsonwebtoken');

// 生成 Token
const token = jwt.sign(
  {
    adminId: admin._id.toString(),
    username: admin.username,
    role: admin.role,
    permissions: admin.permissions || []
  },
  process.env.JWT_SECRET,
  { 
    expiresIn: '24h',
    issuer: 'clearspring-v2',
    audience: 'clearspring-admin'
  }
);
```

### Token 验证

```javascript
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: '未提供认证令牌'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: '认证令牌已过期'
      });
    }
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: '无效的认证令牌'
    });
  }
};
```

### Token 安全最佳实践

1. **有效期设置**: 
   - 管理员 Token: 24 小时
   - 普通用户 Token: 7 天
   - 敏感操作 Token: 1 小时

2. **Token 刷新**: 实现 refresh token 机制

3. **Token 失效**: 
   - 密码修改后使所有 Token 失效
   - 账号禁用后立即失效 Token
   - 使用 Redis 实现 Token 黑名单

---

## 密码安全配置

### bcrypt 加密

```javascript
const bcrypt = require('bcryptjs');

// 加密密码（salt rounds = 10）
const passwordHash = await bcrypt.hash(password, 10);

// 验证密码
const isValid = await bcrypt.compare(password, passwordHash);
```

### 密码策略

```javascript
// 密码验证函数
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('密码长度至少 8 位');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 密码存储规范

```javascript
// admins 集合字段规范
{
  username: String,           // 用户名
  passwordHash: String,       // bcrypt 加密密码（必需）
  passwordChangedAt: Date,    // 密码修改时间
  role: String,               // 角色
  status: String,             // 状态：active/inactive
  permissions: Array,         // 权限列表
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

---

## 数据库安全

### MongoDB 安全配置

```bash
# 启用认证
mongod --auth

# 创建管理员用户
use admin
db.createUser({
  user: "clearspring_admin",
  pwd: "strong_password_here",
  roles: [
    { role: "readWrite", db: "clearspring_v2" },
    { role: "dbAdmin", db: "clearspring_v2" }
  ]
})
```

### 连接字符串

```bash
# 使用认证连接
MONGODB_URI=mongodb://clearspring_admin:password@localhost:27017/clearspring_v2?authSource=admin
```

### 索引安全

```javascript
// 为常用查询字段创建索引
db.collection('admins').createIndex({ username: 1 }, { unique: true });
db.collection('admins').createIndex({ status: 1 });
db.collection('admins').createIndex({ role: 1 });
```

---

## API 安全

### 请求验证

```javascript
// 输入验证中间件
const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 'INVALID_PARAMS',
      message: error.details[0].message
    });
  }
  req.body = value;
  next();
};
```

### 速率限制

```javascript
const rateLimit = require('express-rate-limit');

// 登录接口限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 最多 5 次尝试
  message: {
    code: 'TOO_MANY_REQUESTS',
    message: '尝试次数过多，请稍后再试'
  }
});

router.post('/login', loginLimiter, loginHandler);
```

### CORS 配置

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://admin.clearspring.com',
    'https://manage.clearspring.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 部署安全

### 防火墙配置

```bash
# 只开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 443/tcp   # HTTPS
ufw deny 3000/tcp   # API 不直接暴露（通过 Nginx 反向代理）

# 启用防火墙
ufw enable
```

### Nginx 反向代理

```nginx
server {
    listen 443 ssl http2;
    server_name api.clearspring.com;
    
    ssl_certificate /etc/ssl/certs/clearspring.crt;
    ssl_certificate_key /etc/ssl/private/clearspring.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 强制

```javascript
// 强制 HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 安全审计

### 审计日志

```javascript
// 记录所有敏感操作
async function logAuditEvent(event) {
  const db = getDb();
  await db.collection('audit_logs').insertOne({
    type: event.type,
    userId: event.userId,
    action: event.action,
    targetId: event.targetId,
    ip: event.ip,
    userAgent: event.userAgent,
    timestamp: new Date(),
    success: event.success,
    details: event.details
  });
}

// 使用示例
await logAuditEvent({
  type: 'admin_login',
  userId: admin._id,
  action: '管理员登录',
  ip: req.ip,
  userAgent: req.get('user-agent'),
  success: true
});
```

### 安全扫描

```bash
# 使用 npm audit 检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# 使用 Snyk 进行深度扫描
npx snyk test
```

### 定期检查清单

- [ ] 检查依赖包安全更新
- [ ] 审查审计日志中的异常行为
- [ ] 验证 JWT 密钥安全性
- [ ] 检查数据库备份完整性
- [ ] 测试 API 接口权限控制
- [ ] 审查新代码的安全问题

---

## 应急响应

### 安全事件处理流程

1. **发现漏洞**: 立即记录详细信息
2. **评估影响**: 确定受影响范围和严重程度
3. **临时修复**: 实施临时措施限制损害
4. **正式修复**: 开发并部署永久修复方案
5. **事后分析**: 编写事故报告，改进流程

### 联系方式

- 安全团队：security@clearspring.com
- 紧急联系：+86-xxx-xxxx-xxxx

---

## 附录

### 相关文档

- [API 安全最佳实践](./api-security.md)
- [数据库安全指南](./database-security.md)
- [部署安全检查清单](./deployment-checklist.md)

### 工具推荐

- **密码生成**: 1Password, Bitwarden
- **密钥管理**: AWS Secrets Manager, HashiCorp Vault
- **安全扫描**: Snyk, npm audit, SonarQube
- **日志分析**: ELK Stack, Splunk

---

**最后更新**: 2026-03-31  
**维护团队**: ClearSpring 开发团队
