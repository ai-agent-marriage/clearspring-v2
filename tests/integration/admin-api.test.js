/**
 * 清如 ClearSpring V2 - 管理端 API 集成测试
 * 测试 8 个管理端接口的功能
 */

const assert = require('assert');

// 测试配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''; // 需要替换为实际的管理员 token

// 测试工具函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (ADMIN_TOKEN) {
    headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  const data = await response.json();
  return { response, data };
}

// 测试结果存储
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  return async () => {
    try {
      await fn();
      testResults.passed++;
      testResults.tests.push({ name, status: 'passed' });
      console.log(`✅ ${name}`);
    } catch (error) {
      testResults.failed++;
      testResults.tests.push({ name, status: 'failed', error: error.message });
      console.log(`❌ ${name}`);
      console.log(`   错误：${error.message}`);
    }
  };
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || '断言失败'}: 期望 ${expected}, 实际 ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message || '断言失败：条件不成立');
  }
}

// ==================== 订单管理测试 ====================

async function testOrderManagement() {
  console.log('\n📦 订单管理测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取订单列表
  await test('GET /api/admin/orders - 获取订单列表', async () => {
    const { response, data } = await request('/api/admin/orders?page=1&pageSize=10');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(Array.isArray(data.data.orders), '订单应为数组');
    assertTrue(data.data.pagination !== undefined, '应包含分页信息');
  });
  
  // 测试 2: 订单列表筛选 - 按状态
  await test('GET /api/admin/orders?status=paid - 按状态筛选', async () => {
    const { response, data } = await request('/api/admin/orders?status=paid');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    // 验证所有订单状态都是 paid
    data.data.orders.forEach(order => {
      assertEqual(order.status, 'paid', `订单 ${order.orderNo} 的状态`);
    });
  });
  
  // 测试 3: 订单列表筛选 - 关键词搜索
  await test('GET /api/admin/orders?keyword=ORD - 关键词搜索', async () => {
    const { response, data } = await request('/api/admin/orders?keyword=ORD');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
  });
  
  // 测试 4: 更新订单状态
  await test('PUT /api/admin/order/:id/status - 更新订单状态', async () => {
    // 先获取一个订单
    const { data: listData } = await request('/api/admin/orders?page=1&pageSize=1');
    if (listData.data.orders.length > 0) {
      const orderId = listData.data.orders[0].orderId;
      const { response, data } = await request(`/api/admin/order/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed', remark: '测试完成' })
      });
      assertEqual(response.status, 200, '状态码');
      assertEqual(data.code, 'SUCCESS', '返回码');
      assertEqual(data.data.status, 'completed', '新状态');
    } else {
      throw new Error('没有可测试的订单');
    }
  });
  
  // 测试 5: 删除订单（只能删除已取消的订单）
  await test('DELETE /api/admin/order/:id - 删除订单', async () => {
    // 先获取一个已取消的订单
    const { data: listData } = await request('/api/admin/orders?status=cancelled&page=1&pageSize=1');
    if (listData.data.orders.length > 0) {
      const orderId = listData.data.orders[0].orderId;
      const { response, data } = await request(`/api/admin/order/${orderId}`, {
        method: 'DELETE'
      });
      assertEqual(response.status, 200, '状态码');
      assertEqual(data.code, 'SUCCESS', '返回码');
    } else {
      console.log('   ⚠️  跳过：没有已取消的订单可删除');
    }
  });
  
  // 测试 6: 删除非取消状态的订单（应失败）
  await test('DELETE /api/admin/order/:id - 删除非取消状态订单（应失败）', async () => {
    const { data: listData } = await request('/api/admin/orders?status=completed&page=1&pageSize=1');
    if (listData.data.orders.length > 0) {
      const orderId = listData.data.orders[0].orderId;
      const { response, data } = await request(`/api/admin/order/${orderId}`, {
        method: 'DELETE'
      });
      assertEqual(response.status, 400, '状态码应为 400');
      assertEqual(data.code, 'ORDER_CANNOT_DELETE', '错误码');
    } else {
      console.log('   ⚠️  跳过：没有已完成的订单');
    }
  });
}

// ==================== 资质审核测试 ====================

async function testQualificationAudit() {
  console.log('\n📜 资质审核测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取资质审核列表
  await test('GET /api/admin/qualifications - 获取资质列表', async () => {
    const { response, data } = await request('/api/admin/qualifications?page=1&pageSize=10');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(Array.isArray(data.data.qualifications), '资质列表应为数组');
  });
  
  // 测试 2: 资质列表筛选 - 按状态
  await test('GET /api/admin/qualifications?status=pending - 按状态筛选', async () => {
    const { response, data } = await request('/api/admin/qualifications?status=pending');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    data.data.qualifications.forEach(qual => {
      assertEqual(qual.status, 'pending', `资质 ${qual.qualificationId} 的状态`);
    });
  });
  
  // 测试 3: 审核通过
  await test('PUT /api/admin/qualification/:id - 审核通过', async () => {
    const { data: listData } = await request('/api/admin/qualifications?status=pending&page=1&pageSize=1');
    if (listData.data.qualifications.length > 0) {
      const qualId = listData.data.qualifications[0].qualificationId;
      const { response, data } = await request(`/api/admin/qualification/${qualId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: 'approved',
          auditRemark: '测试审核通过'
        })
      });
      assertEqual(response.status, 200, '状态码');
      assertEqual(data.code, 'SUCCESS', '返回码');
      assertEqual(data.data.status, 'approved', '新状态');
    } else {
      console.log('   ⚠️  跳过：没有待审核的资质');
    }
  });
  
  // 测试 4: 审核驳回
  await test('PUT /api/admin/qualification/:id - 审核驳回', async () => {
    const { data: listData } = await request('/api/admin/qualifications?status=pending&page=1&pageSize=1');
    if (listData.data.qualifications.length > 0) {
      const qualId = listData.data.qualifications[0].qualificationId;
      const { response, data } = await request(`/api/admin/qualification/${qualId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: 'rejected',
          rejectReason: '测试驳回：图片不清晰'
        })
      });
      assertEqual(response.status, 200, '状态码');
      assertEqual(data.code, 'SUCCESS', '返回码');
      assertEqual(data.data.status, 'rejected', '新状态');
    } else {
      console.log('   ⚠️  跳过：没有待审核的资质');
    }
  });
  
  // 测试 5: 审核驳回缺少原因（应失败）
  await test('PUT /api/admin/qualification/:id - 驳回缺少原因（应失败）', async () => {
    const { data: listData } = await request('/api/admin/qualifications?status=pending&page=1&pageSize=1');
    if (listData.data.qualifications.length > 0) {
      const qualId = listData.data.qualifications[0].qualificationId;
      const { response, data } = await request(`/api/admin/qualification/${qualId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' })
      });
      assertEqual(response.status, 400, '状态码应为 400');
      assertEqual(data.code, 'MISSING_REJECT_REASON', '错误码');
    } else {
      console.log('   ⚠️  跳过：没有待审核的资质');
    }
  });
}

// ==================== 执行者管理测试 ====================

async function testExecutorManagement() {
  console.log('\n👤 执行者管理测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取执行者列表
  await test('GET /api/admin/executors - 获取执行者列表', async () => {
    const { response, data } = await request('/api/admin/executors?page=1&pageSize=10');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(Array.isArray(data.data.executors), '执行者列表应为数组');
    assertTrue(data.data.pagination !== undefined, '应包含分页信息');
  });
  
  // 测试 2: 执行者列表筛选 - 按状态
  await test('GET /api/admin/executors?status=active - 按状态筛选', async () => {
    const { response, data } = await request('/api/admin/executors?status=active');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    data.data.executors.forEach(executor => {
      assertEqual(executor.status, 'active', `执行者 ${executor.executorId} 的状态`);
    });
  });
  
  // 测试 3: 执行者列表筛选 - 关键词搜索
  await test('GET /api/admin/executors?keyword=test - 关键词搜索', async () => {
    const { response, data } = await request('/api/admin/executors?keyword=test');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
  });
  
  // 测试 4: 更新执行者状态
  await test('PUT /api/admin/executor/:id/status - 更新执行者状态', async () => {
    const { data: listData } = await request('/api/admin/executors?page=1&pageSize=1');
    if (listData.data.executors.length > 0) {
      const executorId = listData.data.executors[0].executorId;
      const { response, data } = await request(`/api/admin/executor/${executorId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'inactive', remark: '测试禁用' })
      });
      assertEqual(response.status, 200, '状态码');
      assertEqual(data.code, 'SUCCESS', '返回码');
      assertEqual(data.data.status, 'inactive', '新状态');
    } else {
      throw new Error('没有可测试的执行者');
    }
  });
}

// ==================== 分账配置测试 ====================

async function testProfitSharing() {
  console.log('\n💰 分账配置测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取分账配置
  await test('GET /api/admin/profit-sharing - 获取分账配置', async () => {
    const { response, data } = await request('/api/admin/profit-sharing');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(data.data.profitSharing !== undefined, '应包含分账配置');
    assertTrue(data.data.profitSharing.platformRate !== undefined, '应包含平台抽成比例');
  });
  
  // 测试 2: 更新分账配置
  await test('PUT /api/admin/profit-sharing - 更新分账配置', async () => {
    const newConfig = {
      platformRate: 0.12,
      executorMinRate: 0.68,
      executorMaxRate: 0.88,
      defaultExecutorRate: 0.78,
      minOrderAmount: 10,
      maxOrderAmount: 10000,
      withdrawMinAmount: 100
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(newConfig)
    });
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertEqual(data.data.profitSharing.platformRate, 0.12, '平台抽成比例');
  });
  
  // 测试 3: 更新分账配置 - 无效比例（应失败）
  await test('PUT /api/admin/profit-sharing - 无效比例（应失败）', async () => {
    const invalidConfig = {
      platformRate: 1.5, // 超过 1
      executorMinRate: 0.7,
      executorMaxRate: 0.9
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(invalidConfig)
    });
    assertEqual(response.status, 400, '状态码应为 400');
    assertTrue(data.code !== 'SUCCESS', '应返回错误码');
  });
}

// ==================== 主测试流程 ====================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   清如 ClearSpring V2 - 管理端 API 集成测试          ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n📍 API 地址：${API_BASE_URL}`);
  console.log(`🔑 Token: ${ADMIN_TOKEN ? '已配置' : '未配置（部分测试可能失败）'}`);
  
  if (!ADMIN_TOKEN) {
    console.log('\n⚠️  警告：未配置 ADMIN_TOKEN，请设置环境变量后重试');
    console.log('   export ADMIN_TOKEN="your_admin_token_here"\n');
  }
  
  try {
    // 运行所有测试
    await testOrderManagement();
    await testQualificationAudit();
    await testExecutorManagement();
    await testProfitSharing();
    
    // 输出测试结果
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              测试结果汇总                          ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n✅ 通过：${testResults.passed}`);
    console.log(`❌ 失败：${testResults.failed}`);
    console.log(`📊 总计：${testResults.passed + testResults.failed}`);
    console.log(`📈 通过率：${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ 失败的测试:');
      testResults.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`   - ${t.name}`);
          console.log(`     错误：${t.error}`);
        });
    }
    
    // 生成测试报告
    generateReport();
    
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error);
    process.exit(1);
  }
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    apiUrl: API_BASE_URL,
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2) + '%'
    },
    tests: testResults.tests
  };
  
  console.log('\n📄 测试报告已生成:');
  console.log(JSON.stringify(report, null, 2));
}

// 运行测试
if (require.main === module) {
  runAllTests()
    .then(() => {
      if (testResults.failed > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('测试失败:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testResults };
