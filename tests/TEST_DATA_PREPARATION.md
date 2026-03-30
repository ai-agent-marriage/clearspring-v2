# 清如 ClearSpring V2.0 - 测试数据准备指南

**版本**: 2.0.0  
**生成时间**: 2026-03-30  
**适用对象**: 测试工程师、开发人员

---

## 📋 目录

1. [测试数据概述](#1-测试数据概述)
2. [模拟数据文件](#2-模拟数据文件)
3. [数据工厂使用](#3-数据工厂使用)
4. [数据初始化脚本](#4-数据初始化脚本)
5. [数据清理脚本](#5-数据清理脚本)
6. [测试数据管理](#6-测试数据管理)

---

## 1. 测试数据概述

### 1.1 数据类型

| 数据类型 | 说明 | 用途 |
|----------|------|------|
| 管理员数据 | 管理员账号信息 | 认证测试 |
| 用户数据 | 普通用户信息 | 用户功能测试 |
| 执行者数据 | 服务执行者信息 | 执行者功能测试 |
| 订单数据 | 订单记录 | 订单流程测试 |
| 资质证书 | 资质证书信息 | 资质审核测试 |
| 申诉记录 | 申诉仲裁记录 | 申诉流程测试 |
| 系统配置 | 系统设置数据 | 配置功能测试 |

### 1.2 数据量要求

| 测试类型 | 最小数据量 | 推荐数据量 |
|----------|------------|------------|
| 功能测试 | 10 条 | 50 条 |
| 性能测试 | 100 条 | 1000 条 |
| 压力测试 | 1000 条 | 10000 条 |
| 边界测试 | 特殊值 | 极限值 |

### 1.3 数据质量要求

- **真实性**: 数据应接近真实场景
- **多样性**: 覆盖各种业务场景
- **完整性**: 数据字段完整
- **一致性**: 数据关系正确
- **可重复**: 测试可重复执行

---

## 2. 模拟数据文件

### 2.1 mock-data.json 结构

```json
{
  "admins": [
    {
      "username": "admin",
      "password": "admin123",
      "role": "super_admin",
      "status": "active",
      "email": "admin@clearspring.com",
      "phone": "13800138000"
    },
    {
      "username": "operator",
      "password": "operator123",
      "role": "operator",
      "status": "active",
      "email": "operator@clearspring.com",
      "phone": "13800138001"
    }
  ],
  
  "users": [
    {
      "openid": "test_openid_001",
      "nickname": "测试用户 1",
      "avatar": "https://example.com/avatar1.jpg",
      "phone": "13900139001",
      "status": "active"
    },
    {
      "openid": "test_openid_002",
      "nickname": "测试用户 2",
      "avatar": "https://example.com/avatar2.jpg",
      "phone": "13900139002",
      "status": "active"
    }
  ],
  
  "executors": [
    {
      "openid": "executor_openid_001",
      "nickname": "测试执行者 1",
      "serviceType": "cleaning",
      "rating": 4.8,
      "status": "active",
      "serviceAreas": ["浦东新区", "黄浦区"]
    },
    {
      "openid": "executor_openid_002",
      "nickname": "测试执行者 2",
      "serviceType": "repair",
      "rating": 4.5,
      "status": "active",
      "serviceAreas": ["静安区", "徐汇区"]
    }
  ],
  
  "orders": [
    {
      "orderNo": "ORD20260330001",
      "serviceType": "cleaning",
      "serviceName": "家庭保洁",
      "status": "pending",
      "price": 100,
      "userId": "test_openid_001",
      "executorId": null,
      "serviceDate": "2026-04-15T10:00:00+08:00",
      "location": "上海市浦东新区",
      "remark": "测试订单 1"
    },
    {
      "orderNo": "ORD20260330002",
      "serviceType": "repair",
      "serviceName": "家电维修",
      "status": "completed",
      "price": 200,
      "userId": "test_openid_002",
      "executorId": "executor_openid_001",
      "serviceDate": "2026-03-25T14:00:00+08:00",
      "location": "上海市黄浦区",
      "remark": "测试订单 2"
    }
  ],
  
  "qualifications": [
    {
      "type": "health_cert",
      "userId": "executor_openid_001",
      "status": "approved",
      "imageUrl": "https://example.com/cert1.jpg",
      "approvedAt": "2026-03-01T10:00:00+08:00"
    },
    {
      "type": "skill_cert",
      "userId": "executor_openid_001",
      "status": "pending",
      "imageUrl": "https://example.com/cert2.jpg",
      "submittedAt": "2026-03-28T10:00:00+08:00"
    }
  ],
  
  "appeals": [
    {
      "orderId": "ORD20260330001",
      "userId": "test_openid_001",
      "reason": "服务质量不满意",
      "status": "pending",
      "evidence": ["photo1.jpg", "photo2.jpg"],
      "expectation": "退款",
      "createdAt": "2026-03-29T10:00:00+08:00"
    }
  ],
  
  "profitSharing": {
    "platformRate": 0.1,
    "executorMinRate": 0.7,
    "executorMaxRate": 0.9,
    "defaultExecutorRate": 0.8,
    "minOrderAmount": 10,
    "maxOrderAmount": 10000
  },
  
  "settings": {
    "siteName": "清如 ClearSpring",
    "customerServicePhone": "400-123-4567",
    "orderAutoCancelMinutes": 30,
    "maxUploadSize": 10485760
  }
}
```

### 2.2 使用模拟数据

```javascript
const mockData = require('./data/mock-data.json');

// 使用管理员账号登录
const admin = mockData.admins[0];
await request(BASE_URL)
  .post('/api/admin/auth/login')
  .send({
    username: admin.username,
    password: admin.password
  });
```

---

## 3. 数据工厂使用

### 3.1 数据工厂类

```javascript
// test-data-factory.js
class TestDataFactory {
  /**
   * 生成随机字符串
   */
  static randomString(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail() {
    return `test_${this.randomString(8)}@example.com`;
  }

  /**
   * 生成随机手机号
   */
  static randomPhone() {
    const prefix = '138';
    const suffix = this.randomString(8);
    return prefix + suffix;
  }

  /**
   * 生成随机 ObjectId
   */
  static randomObjectId() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机日期
   */
  static randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
  }

  /**
   * 创建测试管理员
   */
  static createAdmin(overrides = {}) {
    return {
      username: `admin_${this.randomString(6)}`,
      password: 'admin123',
      role: 'admin',
      status: 'active',
      email: this.randomEmail(),
      phone: this.randomPhone(),
      ...overrides
    };
  }

  /**
   * 创建测试用户
   */
  static createUser(overrides = {}) {
    return {
      openid: `test_openid_${this.randomString(10)}`,
      nickname: `测试用户${this.randomString(4)}`,
      avatar: `https://example.com/avatar_${this.randomString(6)}.jpg`,
      phone: this.randomPhone(),
      status: 'active',
      ...overrides
    };
  }

  /**
   * 创建测试执行者
   */
  static createExecutor(overrides = {}) {
    return {
      openid: `executor_${this.randomString(10)}`,
      nickname: `测试执行者${this.randomString(4)}`,
      serviceType: 'cleaning',
      rating: 4.5 + Math.random() * 0.5,
      status: 'active',
      serviceAreas: ['浦东新区', '黄浦区'],
      ...overrides
    };
  }

  /**
   * 创建测试订单
   */
  static createOrder(overrides = {}) {
    return {
      orderNo: `ORD${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}${this.randomString(4)}`,
      serviceType: 'cleaning',
      serviceName: '家庭保洁',
      status: 'pending',
      price: 100 + Math.floor(Math.random() * 900),
      userId: `test_openid_${this.randomString(10)}`,
      executorId: null,
      serviceDate: this.randomDate(new Date(), new Date('2026-12-31')),
      location: '上海市浦东新区',
      remark: `测试订单 ${this.randomString(6)}`,
      ...overrides
    };
  }

  /**
   * 创建测试资质
   */
  static createQualification(overrides = {}) {
    return {
      type: 'health_cert',
      userId: `executor_${this.randomString(10)}`,
      status: 'pending',
      imageUrl: `https://example.com/cert_${this.randomString(6)}.jpg`,
      ...overrides
    };
  }

  /**
   * 创建测试申诉
   */
  static createAppeal(overrides = {}) {
    return {
      orderId: `ORD${this.randomString(10)}`,
      userId: `test_openid_${this.randomString(10)}`,
      reason: '服务质量问题',
      status: 'pending',
      evidence: [`photo_${this.randomString(6)}.jpg`],
      expectation: '退款',
      ...overrides
    };
  }
}

module.exports = TestDataFactory;
```

### 3.2 使用示例

```javascript
const TestDataFactory = require('./data/test-data-factory');

// 创建测试数据
const admin = TestDataFactory.createAdmin();
const user = TestDataFactory.createUser();
const executor = TestDataFactory.createExecutor();
const order = TestDataFactory.createOrder({
  status: 'pending',
  price: 200
});

// 使用创建的数据进行测试
test('创建订单', async () => {
  const response = await request(BASE_URL)
    .post('/api/admin/orders')
    .send(order)
    .set(getAuthHeader());
  
  expect(response.body.code).toBe('SUCCESS');
});
```

---

## 4. 数据初始化脚本

### 4.1 初始化脚本 (init-test-data.js)

```javascript
/**
 * 测试数据初始化脚本
 * 
 * 用途：在测试前准备测试数据
 * 使用：node scripts/init-test-data.js
 */

const { MongoClient } = require('mongodb');
const mockData = require('../data/mock-data.json');

const DB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'clearspring_test';

async function initTestData() {
  const client = new MongoClient(DB_URL);
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    const db = client.db(DB_NAME);
    
    // 清空现有测试数据
    await clearTestData(db);
    console.log('✅ 已清空现有测试数据');
    
    // 插入管理员数据
    await db.collection('admins').insertMany(mockData.admins);
    console.log(`✅ 已插入 ${mockData.admins.length} 个管理员`);
    
    // 插入用户数据
    await db.collection('users').insertMany(mockData.users);
    console.log(`✅ 已插入 ${mockData.users.length} 个用户`);
    
    // 插入执行者数据
    await db.collection('executors').insertMany(mockData.executors);
    console.log(`✅ 已插入 ${mockData.executors.length} 个执行者`);
    
    // 插入订单数据
    await db.collection('orders').insertMany(mockData.orders);
    console.log(`✅ 已插入 ${mockData.orders.length} 个订单`);
    
    // 插入资质数据
    await db.collection('qualifications').insertMany(mockData.qualifications);
    console.log(`✅ 已插入 ${mockData.qualifications.length} 个资质`);
    
    // 插入申诉数据
    await db.collection('appeals').insertMany(mockData.appeals);
    console.log(`✅ 已插入 ${mockData.appeals.length} 个申诉`);
    
    // 插入分账配置
    await db.collection('profit_sharing').insertOne(mockData.profitSharing);
    console.log('✅ 已插入分账配置');
    
    // 插入系统设置
    await db.collection('settings').insertOne(mockData.settings);
    console.log('✅ 已插入系统设置');
    
    console.log('\n🎉 测试数据初始化完成!');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function clearTestData(db) {
  const collections = [
    'admins',
    'users',
    'executors',
    'orders',
    'qualifications',
    'appeals',
    'profit_sharing',
    'settings'
  ];
  
  for (const collection of collections) {
    await db.collection(collection).deleteMany({});
  }
}

// 执行初始化
initTestData();
```

### 4.2 运行初始化

```bash
# 设置环境变量
export MONGODB_URL="mongodb://localhost:27017"

# 运行初始化脚本
cd tests
node scripts/init-test-data.js
```

### 4.3 初始化输出

```
✅ 数据库连接成功
✅ 已清空现有测试数据
✅ 已插入 2 个管理员
✅ 已插入 2 个用户
✅ 已插入 2 个执行者
✅ 已插入 2 个订单
✅ 已插入 2 个资质
✅ 已插入 1 个申诉
✅ 已插入分账配置
✅ 已插入系统设置

🎉 测试数据初始化完成!
```

---

## 5. 数据清理脚本

### 5.1 清理脚本 (clean-test-data.js)

```javascript
/**
 * 测试数据清理脚本
 * 
 * 用途：测试后清理测试数据
 * 使用：node scripts/clean-test-data.js
 */

const { MongoClient } = require('mongodb');

const DB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'clearspring_test';

async function cleanTestData() {
  const client = new MongoClient(DB_URL);
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    const db = client.db(DB_NAME);
    
    // 清理测试数据 (保留生产数据)
    await db.collection('admins').deleteMany({ 
      username: { $regex: /^test_/ } 
    });
    console.log('✅ 已清理测试管理员');
    
    await db.collection('users').deleteMany({ 
      openid: { $regex: /^test_/ } 
    });
    console.log('✅ 已清理测试用户');
    
    await db.collection('executors').deleteMany({ 
      openid: { $regex: /^test_|^executor_/ } 
    });
    console.log('✅ 已清理测试执行者');
    
    await db.collection('orders').deleteMany({ 
      remark: { $regex: /测试/ } 
    });
    console.log('✅ 已清理测试订单');
    
    await db.collection('qualifications').deleteMany({ 
      userId: { $regex: /^test_|^executor_/ } 
    });
    console.log('✅ 已清理测试资质');
    
    await db.collection('appeals').deleteMany({ 
      userId: { $regex: /^test_/ } 
    });
    console.log('✅ 已清理测试申诉');
    
    console.log('\n🎉 测试数据清理完成!');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// 执行清理
cleanTestData();
```

### 5.2 运行清理

```bash
# 运行清理脚本
node scripts/clean-test-data.js
```

### 5.3 清理输出

```
✅ 数据库连接成功
✅ 已清理测试管理员
✅ 已清理测试用户
✅ 已清理测试执行者
✅ 已清理测试订单
✅ 已清理测试资质
✅ 已清理测试申诉

🎉 测试数据清理完成!
```

---

## 6. 测试数据管理

### 6.1 数据版本控制

使用 Git 管理测试数据结构：

```bash
# 提交测试数据变更
git add data/mock-data.json
git add data/test-data-factory.js
git commit -m "feat: 更新测试数据结构"
```

### 6.2 数据备份

定期备份测试数据：

```bash
# 导出测试数据
mongodump --db clearspring_test --out ./backup/$(date +%Y%m%d)

# 恢复测试数据
mongorestore --db clearspring_test ./backup/20260330/clearspring_test/
```

### 6.3 数据脱敏

生产数据用于测试前需要脱敏：

```javascript
// 脱敏脚本
function sanitizeData(data) {
  return {
    ...data,
    phone: data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    email: data.email.replace(/(.{3}).*/, '$1***@example.com'),
    openid: `test_${data.openid.slice(-8)}`
  };
}
```

### 6.4 数据生成策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 固定数据 | 使用预定义数据 | 回归测试 |
| 随机数据 | 动态生成数据 | 压力测试 |
| 边界数据 | 使用极限值 | 边界测试 |
| 异常数据 | 使用无效值 | 异常测试 |

### 6.5 数据依赖管理

处理数据间的依赖关系：

```javascript
// 创建有依赖的测试数据
async function createOrderWithUser() {
  // 1. 先创建用户
  const user = TestDataFactory.createUser();
  await db.collection('users').insertOne(user);
  
  // 2. 创建订单，使用用户的 openid
  const order = TestDataFactory.createOrder({
    userId: user.openid
  });
  await db.collection('orders').insertOne(order);
  
  return { user, order };
}
```

---

## 附录

### A. 测试数据检查清单

- [ ] 管理员账号可用
- [ ] 用户账号可用
- [ ] 执行者账号可用
- [ ] 订单数据完整
- [ ] 资质数据完整
- [ ] 申诉数据完整
- [ ] 系统配置正确
- [ ] 数据关系正确

### B. 常用数据操作命令

```bash
# 查看测试数据
mongo clearspring_test --eval "db.admins.find()"

# 统计各集合数据量
mongo clearspring_test --eval "db.getCollectionNames().forEach(c => print(c + ': ' + db[c].count()))"

# 删除特定测试数据
mongo clearspring_test --eval "db.orders.deleteMany({ remark: /测试/ })"
```

### C. 测试数据最佳实践

1. **隔离性**: 测试数据与生产数据隔离
2. **可重复**: 测试可重复执行
3. **可维护**: 数据结构清晰易维护
4. **可扩展**: 易于添加新数据类型
5. **可清理**: 测试后易于清理

---

**文档维护**: ClearSpring 测试团队  
**最后更新**: 2026-03-30  
**版本**: V2.0.0
