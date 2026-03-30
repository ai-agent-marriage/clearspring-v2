# 清如 ClearSpring V2.0 - 测试执行指南

**版本**: 2.0.0  
**生成时间**: 2026-03-30  
**适用对象**: 测试工程师、开发人员

---

## 📋 目录

1. [测试环境配置](#1-测试环境配置)
2. [测试数据准备](#2-测试数据准备)
3. [测试执行步骤](#3-测试执行步骤)
4. [测试结果分析](#4-测试结果分析)
5. [常见问题解决](#5-常见问题解决)

---

## 1. 测试环境配置

### 1.1 系统要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥18.0.0 | 运行测试环境 |
| npm | ≥9.0.0 | 包管理工具 |
| Jest | ≥29.0.0 | 测试框架 |
| Supertest | ≥6.0.0 | API 测试工具 |

### 1.2 环境搭建步骤

#### 步骤 1: 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
```

#### 步骤 2: 克隆项目

```bash
git clone <repository-url>
cd clearspring-v2/tests
```

#### 步骤 3: 安装依赖

```bash
npm install
```

#### 步骤 4: 配置环境变量

创建 `.env` 文件：

```bash
# API 服务器地址
API_URL=http://101.96.192.63:3000

# 测试环境标识
NODE_ENV=test

# 日志级别
LOG_LEVEL=info
```

### 1.3 测试环境验证

```bash
# 验证 Node.js 版本
node --version  # 应输出 v22.x.x

# 验证 npm 版本
npm --version  # 应输出 9.x.x 或更高

# 验证依赖安装
npm list jest supertest  # 应显示已安装的版本
```

---

## 2. 测试数据准备

### 2.1 数据库初始化

#### 步骤 1: 连接数据库

```bash
# 使用 MongoDB Compass 或命令行
mongo "mongodb://localhost:27017/clearspring_test"
```

#### 步骤 2: 创建测试数据

使用提供的脚本：

```bash
# 运行数据初始化脚本
node scripts/init-test-data.js
```

#### 步骤 3: 验证数据

```bash
# 检查测试账号
db.admins.findOne({ username: 'admin' })

# 检查测试订单
db.orders.countDocuments()
```

### 2.2 测试账号清单

| 账号类型 | 用户名 | 密码 | 权限 |
|----------|--------|------|------|
| 超级管理员 | admin | admin123 | 所有权限 |
| 普通管理员 | operator | operator123 | 部分权限 |
| 测试用户 | testuser | test123 | 用户权限 |
| 测试执行者 | executor | executor123 | 执行者权限 |

### 2.3 测试数据工厂

使用数据工厂生成测试数据：

```javascript
const testDataFactory = require('./data/test-data-factory');

// 生成随机订单
const order = testDataFactory.createOrder();

// 生成随机用户
const user = testDataFactory.createUser();

// 生成随机执行者
const executor = testDataFactory.createExecutor();
```

### 2.4 测试数据清理

测试完成后清理数据：

```bash
# 运行清理脚本
node scripts/clean-test-data.js

# 或手动清理
db.orders.deleteMany({ remark: { $regex: /测试/ } })
db.admins.deleteMany({ username: { $regex: /test/ } })
```

---

## 3. 测试执行步骤

### 3.1 运行所有测试

```bash
# 运行所有测试用例
npm test

# 或
npm run test:all
```

### 3.2 运行特定测试

#### 按文件运行

```bash
# 运行 API 测试
npm run test:api

# 运行 P0 补充测试
npx jest p0-supplemental.test.js

# 运行特定测试文件
npx jest jest-api.test.js
```

#### 按用例运行

```bash
# 运行特定测试用例
npx jest -t "API-AUTH-001"

# 运行特定模块
npx jest -t "认证模块"
```

### 3.3 运行测试并生成报告

#### 覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看 HTML 报告
open coverage/index.html
```

#### HTML 测试报告

```bash
# 生成 HTML 报告
npm run test:report

# 查看报告
open reports/test-report.html
```

#### JSON 测试报告

```bash
# 生成 JSON 报告
npm run test:json

# 查看报告
cat reports/test-results.json
```

### 3.4 监视模式

开发时使用监视模式：

```bash
# 运行监视模式
npm run test:watch

# 运行特定文件的监视模式
npx jest --watch p0-supplemental.test.js
```

### 3.5 并行执行

```bash
# 并行执行测试 (默认)
npm test

# 指定并行数量
npx jest --maxWorkers=4

# 串行执行 (调试时使用)
npx jest --runInBand
```

---

## 4. 测试结果分析

### 4.1 测试结果输出

典型的测试结果输出：

```
PASS  tests/jest-api.test.js
  🔐 管理员认证模块
    ✓ API-AUTH-001: 正常登录 - 有效账号密码 (123 ms)
    ✓ API-AUTH-002: 异常场景 - 账号为空 (45 ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Time:        5.234 s
```

### 4.2 结果解读

| 指标 | 说明 | 合格标准 |
|------|------|----------|
| Test Suites | 测试文件数量 | 全部通过 |
| Tests | 测试用例总数 | 通过率≥95% |
| Time | 执行时间 | <10 分钟 |
| Coverage | 代码覆盖率 | ≥80% |

### 4.3 失败用例分析

#### 查看失败详情

```bash
# 运行测试并显示详细错误
npx jest --verbose

# 只运行失败的测试
npx jest --bail
```

#### 失败原因分类

1. **断言失败**: 预期结果与实际不符
2. **超时失败**: 接口响应超时
3. **连接失败**: 无法连接 API 服务
4. **数据失败**: 测试数据问题

#### 失败处理流程

```
1. 查看错误日志
   ↓
2. 复现问题
   ↓
3. 定位原因
   ↓
4. 修复问题
   ↓
5. 重新测试
```

### 4.4 性能分析

#### 慢测试识别

```bash
# 显示慢测试 (>1000ms)
npx jest --detectOpenHandles --verbose

# 生成性能报告
npx jest --json --outputFile=perf.json
```

#### 性能优化建议

1. 减少数据库查询
2. 使用 Mock 数据
3. 并行执行独立测试
4. 优化测试数据准备

---

## 5. 常见问题解决

### 5.1 测试超时

**问题**: 测试运行超时

**原因**:
- API 响应慢
- 网络问题
- 数据库查询慢

**解决方案**:
```javascript
// 增加超时时间
jest.setTimeout(30000);

// 或针对单个测试
test('慢测试', async () => {
  jest.setTimeout(30000);
  // ...
}, 30000);
```

### 5.2 Token 失效

**问题**: 认证相关测试失败

**原因**:
- Token 过期
- Token 格式错误

**解决方案**:
```javascript
// 在每个测试前重新获取 Token
beforeEach(async () => {
  adminToken = await getAdminToken();
});
```

### 5.3 数据库连接失败

**问题**: 无法连接数据库

**原因**:
- 数据库未启动
- 连接字符串错误

**解决方案**:
```bash
# 检查数据库状态
systemctl status mongod

# 重启数据库
systemctl restart mongod

# 验证连接
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

### 5.4 端口冲突

**问题**: 端口被占用

**原因**:
- 服务重复启动
- 端口冲突

**解决方案**:
```bash
# 查看端口占用
lsof -i :3000

# 杀死占用进程
kill -9 <PID>

# 或使用不同端口
export API_URL=http://localhost:3001
```

### 5.5 依赖安装失败

**问题**: npm install 失败

**原因**:
- 网络问题
- 版本冲突

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 5.6 覆盖率不达标

**问题**: 代码覆盖率低于阈值

**原因**:
- 测试用例不足
- 边界场景未覆盖

**解决方案**:
1. 添加更多测试用例
2. 覆盖边界条件
3. 临时调整阈值 (不推荐)

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,  // 临时降低要求
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

---

## 附录

### A. 测试命令速查

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:api` | 运行 API 测试 |
| `npm run test:coverage` | 生成覆盖率报告 |
| `npm run test:watch` | 监视模式 |
| `npm run test:report` | 生成 HTML 报告 |
| `npx jest -t "用例名"` | 运行特定用例 |
| `npx jest --watch` | 监视文件变化 |
| `npx jest --bail` | 失败即停 |

### B. 测试文件结构

```
tests/
├── jest-api.test.js           # API 接口测试
├── p0-supplemental.test.js    # P0 补充测试
├── miniprogram/               # 小程序测试
│   ├── login.test.js
│   ├── order.test.js
│   └── ...
├── admin/                     # 管理后台测试
│   ├── Login.test.js
│   ├── Dashboard.test.js
│   └── ...
├── cloud-functions/           # 云函数测试
│   ├── login.test.js
│   ├── createOrder.test.js
│   └── ...
├── data/                      # 测试数据
│   ├── mock-data.json
│   └── test-data-factory.js
├── scripts/                   # 测试脚本
│   ├── init-test-data.js
│   └── clean-test-data.js
└── coverage/                  # 覆盖率报告
```

### C. 测试最佳实践

1. **测试命名**: 使用描述性名称，包含用例 ID
2. **测试独立性**: 每个测试应该独立，不依赖其他测试
3. **测试数据**: 使用后立即清理，避免污染
4. **断言明确**: 每个测试只验证一个场景
5. **错误处理**: 捕获并记录所有错误
6. **日志输出**: 使用 console.log 记录关键步骤
7. **Mock 外部依赖**: 避免测试依赖外部服务

### D. CI/CD 集成

#### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '22'
    
    - name: Install dependencies
      run: |
        cd tests
        npm install
    
    - name: Run tests
      run: |
        cd tests
        npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
      with:
        directory: ./tests/coverage
```

---

**文档维护**: ClearSpring 测试团队  
**最后更新**: 2026-03-30  
**版本**: V2.0.0
