# 清如 ClearSpring 代码规范

> **版本**: 2.0.0  
> **更新时间**: 2026-03-31  
> **适用范围**: API 后端代码

---

## 目录

1. [代码风格](#代码风格)
2. [命名规范](#命名规范)
3. [错误处理](#错误处理)
4. [注释规范](#注释规范)
5. [最佳实践](#最佳实践)

---

## 代码风格

### 1. 基本规则

- **缩进**: 2 个空格
- **分号**: 必须使用
- **单引号**: 字符串使用单引号
- **行宽**: 最大 100 字符
- **末尾空格**: 禁止
- **空行**: 最多连续 2 个空行

```javascript
// ✅ 好的做法
const userName = '张三';
const items = [1, 2, 3];

function getUser(id) {
  const user = db.find(id);
  return user;
}

// ❌ 不好的做法
const userName = "李四";
const items = [1,2,3];

function getUser(id)
{
  const user = db.find(id);
  return user;
}
```

### 2. 对象和数组

```javascript
// ✅ 好的做法
const user = {
  name: '张三',
  age: 25,
  tags: ['admin', 'user'],
};

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

// ❌ 不好的做法
const user = {name: '张三', age: 25, tags: ['admin', 'user']};
```

### 3. 箭头函数

```javascript
// ✅ 好的做法
const add = (a, b) => a + b;

const users.map(user => ({
  id: user.id,
  name: user.name,
}));

// 多参数或需要块级作用域时
const process = (req, res) => {
  const result = doSomething(req);
  res.json(result);
};

// ❌ 不好的做法
const add = function(a, b) {
  return a + b;
};
```

---

## 命名规范

### 1. 变量和函数

- **小驼峰**: 变量、函数、方法
- **大驼峰**: 类、构造函数
- **全大写**: 常量

```javascript
// ✅ 好的做法
const userName = '张三';
function getUserInfo() {}
class UserService {}
const MAX_RETRY_COUNT = 3;
const ERROR_CODES = { ... };

// ❌ 不好的做法
const UserName = '张三'; // 变量不应大驼峰
const MAXRETRYCOUNT = 3; // 常量需要下划线
function getuserinfo() {} // 函数名应清晰
```

### 2. 文件和目录

- **小驼峰或短横线**: 文件名
- **复数形式**: 包含多个项目的目录

```javascript
// ✅ 好的做法
userService.js
error-handler.js
routes/
middlewares/
utils/

// ❌ 不好的做法
UserService.js
user_service.js
route/
```

### 3. 错误码命名

格式：`MODULE_ERROR_TYPE`

```javascript
// ✅ 好的做法
USER_NOT_FOUND
ORDER_CREATE_FAILED
VALIDATION_EMAIL_INVALID

// ❌ 不好的做法
UserNotFound
USERNOTFOUND
USER_ERROR
```

---

## 错误处理

### 1. 使用统一的错误类

```javascript
const { AppError, asyncHandler, sendError } = require('./middleware/errorHandler');

// ✅ 好的做法
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) {
    throw new AppError('USER_NOT_FOUND');
  }
  res.json({ code: 'SUCCESS', data: user });
}));

// ❌ 不好的做法
router.get('/user/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '出错了' });
  }
});
```

### 2. 错误响应格式

统一响应格式（HTTP 200）：

```javascript
{
  "code": "ERROR_CODE",
  "data": null,
  "message": "错误消息"
}
```

成功响应：

```javascript
{
  "code": "SUCCESS",
  "data": { ... },
  "message": "操作成功"
}
```

### 3. 错误日志

```javascript
const logger = require('./utils/logger');

// ✅ 好的做法
try {
  await riskyOperation();
} catch (error) {
  logger.error('操作失败', {
    error: error.message,
    stack: error.stack,
    userId: req.user.id,
  });
  throw error;
}
```

---

## 注释规范

### 1. 文件头部

```javascript
/**
 * 用户相关 API 路由
 * @module routes/user
 * @author ClearSpring Team
 * @since 2.0.0
 */
```

### 2. 函数注释

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户 ID
 * @param {Object} options - 可选参数
 * @param {boolean} options.includeProfile - 是否包含详细信息
 * @returns {Promise<Object>} 用户信息
 * @throws {AppError} USER_NOT_FOUND - 用户不存在
 */
async function getUser(userId, options = {}) {
  // ...
}
```

### 3. 行内注释

```javascript
// ✅ 好的做法
// 计算用户积分
const points = calculatePoints(order);

// 缓存有效期：24 小时
const CACHE_TTL = 24 * 60 * 60;

// ❌ 不好的做法
const points = calculatePoints(order); // 计算积分
```

---

## 最佳实践

### 1. 异步处理

始终使用 `asyncHandler` 包装异步路由处理器：

```javascript
const { asyncHandler } = require('./middleware/errorHandler');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const token = await authenticate(username, password);
  res.json({ code: 'SUCCESS', data: { token } });
}));
```

### 2. 参数验证

使用 `express-validator` 进行参数验证：

```javascript
const { body, validationResult } = require('express-validator');

router.post('/register',
  [
    body('username').isLength({ min: 3 }).withMessage('用户名至少 3 个字符'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少 6 个字符'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('VALIDATION_ERROR', errors.array()[0].msg);
    }
    // 业务逻辑
  })
);
```

### 3. 数据库操作

```javascript
// ✅ 好的做法
const user = await db.collection('users').findOne({ _id: userId });
if (!user) {
  throw new AppError('USER_NOT_FOUND');
}

// ❌ 不好的做法
const user = db.collection('users').findOne({ _id: userId });
// 忘记 await
```

### 4. 日志记录

```javascript
const logger = require('./utils/logger');

// 不同级别日志
logger.info('用户登录', { userId });
logger.warn('频繁请求', { userId, count });
logger.error('数据库连接失败', { error: error.message });
```

### 5. 安全性

```javascript
// ✅ 好的做法
// 使用环境变量
const dbUri = process.env.MONGODB_URI;

// 密码加密
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ 不好的做法
const dbUri = 'mongodb://localhost:27017/mydb';
const password = '123456'; // 明文密码
```

---

## 工具命令

### 代码检查

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 格式化代码
npm run format

# 检查格式化
npm run format:check

# 完整验证（lint + format + test）
npm run validate
```

### 测试

```bash
# 运行测试
npm test

# 生成覆盖率报告
npm run test:coverage
```

---

## 编辑器配置

### VS Code 推荐插件

- ESLint
- Prettier - Code formatter
- Jest

### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"]
}
```

---

## 违反规范的后果

- **警告**: 代码风格问题（空格、引号等）
- **错误**: 可能导致 bug 的问题（未捕获异常、未使用变量等）
- **阻断**: 严重问题（安全漏洞、语法错误等）

---

**维护者**: 清如开发团队  
**最后更新**: 2026-03-31
