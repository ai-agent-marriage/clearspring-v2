# 清如 ClearSpring V2.0 - 自动化测试套件

## 📋 目录结构

```
tests/
├── README.md                      # 本文档
├── package.json                   # 测试依赖配置
├── jest.config.js                 # Jest 配置文件
├── jest-api.test.js              # API 接口测试脚本
├── TEST_CASES.md                 # 完整测试用例文档
└── data/
    ├── mock-data.json            # 模拟测试数据
    └── test-data-factory.js      # 测试数据工厂
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd tests
npm install
```

### 2. 配置环境变量（可选）

创建 `.env` 文件或在命令行中设置：

```bash
export API_URL=http://101.96.192.63:3000
```

### 3. 运行测试

#### 运行所有测试

```bash
npm test
```

#### 运行 API 测试

```bash
npm run test:api
```

#### 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

#### 监视模式（开发时使用）

```bash
npm run test:watch
```

#### 生成 JSON 测试报告

```bash
npm run test:report
```

## 📊 测试覆盖范围

### API 接口测试 (P0 - 高优先级)

| 模块 | 接口数量 | 测试用例数 | 状态 |
|------|----------|------------|------|
| 管理员认证 | 3 | 11 | ✅ |
| Dashboard 统计 | 5 | 11 | ✅ |
| 订单管理 | 3 | 16 | ✅ |
| 资质审核 | 2 | 11 | ✅ |
| 执行者管理 | 2 | 11 | ✅ |
| 分账配置 | 2 | 8 | ✅ |
| 数据导出 | 4 | 8 | ✅ |
| 操作日志 | 3 | 7 | ✅ |
| **总计** | **24** | **83** | ✅ |

### 前端功能测试 (P1 - 中优先级)

| 页面 | 测试用例数 | 状态 |
|------|------------|------|
| 登录页 | 6 | 📝 待实现 |
| 控制台 | 5 | 📝 待实现 |
| 订单管理 | 7 | 📝 待实现 |
| 资质审核 | 6 | 📝 待实现 |
| 申诉仲裁 | 4 | 📝 待实现 |
| 分账配置 | 4 | 📝 待实现 |
| 执行者管理 | 5 | 📝 待实现 |
| 数据导出 | 4 | 📝 待实现 |
| 系统设置 | 3 | 📝 待实现 |
| **总计** | **44** | 📝 |

### 云函数测试 (P1 - 中优先级)

| 云函数 | 测试用例数 | 状态 |
|--------|------------|------|
| login | 4 | 📝 待实现 |
| createOrder | 4 | 📝 待实现 |
| grabOrder | 5 | 📝 待实现 |
| uploadEvidence | 6 | 📝 待实现 |
| **总计** | **19** | 📝 |

### 异常处理测试 (P2 - 低优先级)

| 类型 | 测试用例数 | 状态 |
|------|------------|------|
| 网络异常 | 3 | 📝 待实现 |
| 数据库异常 | 3 | 📝 待实现 |
| 认证异常 | 3 | 📝 待实现 |
| 参数验证异常 | 4 | 📝 待实现 |
| 服务器异常 | 3 | 📝 待实现 |
| **总计** | **16** | 📝 |

## 📝 测试用例文档

完整的测试用例文档请查看：[TEST_CASES.md](./TEST_CASES.md)

测试用例包含：
- 用例 ID
- 接口/页面
- 测试场景
- 输入数据
- 预期结果
- 优先级

## 🔧 测试配置

### Jest 配置 (jest.config.js)

```javascript
{
  testEnvironment: 'node',      // Node.js 环境
  testTimeout: 15000,           // 15 秒超时
  verbose: true,                // 详细输出
  collectCoverageFrom: [        // 覆盖率统计范围
    'api/**/*.js',
    '!api/node_modules/**'
  ],
  coverageThreshold: {          // 覆盖率阈值
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| API_URL | http://101.96.192.63:3000 | API 服务器地址 |
| NODE_ENV | test | 运行环境 |

## 📈 测试报告

### 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告将生成在 `coverage/` 目录：

```bash
coverage/
├── lcov-report/    # HTML 格式报告（浏览器查看）
├── lcov.info       # LCOV 格式报告（CI 集成）
└── coverage/       # 文本格式报告
```

### HTML 测试报告

安装 HTML 报告器：

```bash
npm install --save-dev jest-html-reporters
```

运行测试后，HTML 报告将生成在 `reports/test-report.html`。

## 🧪 测试数据

### 模拟数据 (mock-data.json)

包含预定义的测试数据：
- 管理员账号
- 用户数据
- 执行者数据
- 订单数据
- 资质证书
- 系统设置
- 审计日志

### 数据工厂 (test-data-factory.js)

提供动态数据生成：
- 随机字符串
- 随机邮箱
- 随机手机号
- 随机日期
- 随机 ObjectId
- 各类测试场景数据

## 🎯 测试用例设计原则

### 1. 正常场景测试
- 有效参数
- 标准流程
- 预期成功

### 2. 边界场景测试
- 空值/ null
- 最大值/最小值
- 极限情况

### 3. 异常场景测试
- 无效 Token
- 权限不足
- 参数错误
- 资源不存在

### 4. 安全测试
- SQL 注入尝试
- XSS 攻击尝试
- 特殊字符处理

## 🚦 CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/test.yml`:

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

## 🐛 常见问题

### 1. 测试超时

**问题**: 测试运行超时

**解决**: 
- 增加 `testTimeout` 配置
- 检查网络连接
- 确认 API 服务正常运行

### 2. Token 失效

**问题**: 认证相关测试失败

**解决**:
- 确认管理员账号密码正确
- 检查 Token 生成逻辑
- 更新测试数据中的凭证

### 3. 覆盖率不达标

**问题**: 代码覆盖率低于阈值

**解决**:
- 添加更多测试用例
- 覆盖边界情况
- 调整覆盖率阈值（临时）

## 📚 相关文档

- [API 文档](../api/README.md)
- [测试用例文档](./TEST_CASES.md)
- [部署指南](../DEPLOYMENT_GUIDE.md)

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**版本**: 2.0.0  
**最后更新**: 2026-03-30  
**维护者**: ClearSpring Team
