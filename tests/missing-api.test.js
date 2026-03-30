/**
 * 清如 ClearSpring V2 - 缺失 API 实现测试
 * 测试 5 个新补充实现的管理端接口
 */

const assert = require('assert');

// 测试配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

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

// ==================== Dashboard Stats API 测试 ====================

async function testDashboardStats() {
  console.log('\n📊 Dashboard Stats API 测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取统计数据
  await test('GET /api/admin/dashboard/stats - 获取统计数据', async () => {
    const { response, data } = await request('/api/admin/dashboard/stats');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(data.data !== undefined, '应包含 data');
    assertTrue(typeof data.data.totalOrders === 'number', 'totalOrders 应为数字');
    assertTrue(typeof data.data.pendingOrders === 'number', 'pendingOrders 应为数字');
    assertTrue(typeof data.data.activeExecutors === 'number', 'activeExecutors 应为数字');
    assertTrue(typeof data.data.pendingQualifications === 'number', 'pendingQualifications 应为数字');
  });
  
  // 测试 2: 无 Token 访问（应失败）
  await test('GET /api/admin/dashboard/stats - 无 Token（应失败）', async () => {
    const url = `${API_BASE_URL}/api/admin/dashboard/stats`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    assertEqual(response.status, 401, '状态码应为 401');
    assertTrue(data.code !== 'SUCCESS', '应返回错误码');
  });
}

// ==================== Orders Export API 测试 ====================

async function testOrdersExport() {
  console.log('\n📦 Orders Export API 测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 导出订单 Excel
  await test('GET /api/admin/orders/export?format=xlsx - 导出 Excel', async () => {
    const url = `${API_BASE_URL}/api/admin/orders/export?format=xlsx`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    // 检查 Content-Type
    const contentType = response.headers.get('content-type');
    assertTrue(
      contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      `Content-Type 应为 Excel 格式，实际：${contentType}`
    );
    
    // 检查 Content-Disposition
    const contentDisposition = response.headers.get('content-disposition');
    assertTrue(
      contentDisposition.includes('attachment'),
      '应包含 attachment'
    );
    assertTrue(
      contentDisposition.includes('.xlsx'),
      '文件名应为 .xlsx'
    );
  });
  
  // 测试 2: 导出订单 CSV
  await test('GET /api/admin/orders/export?format=csv - 导出 CSV', async () => {
    const url = `${API_BASE_URL}/api/admin/orders/export?format=csv`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    const contentType = response.headers.get('content-type');
    assertTrue(
      contentType.includes('text/csv'),
      `Content-Type 应为 CSV 格式，实际：${contentType}`
    );
    
    const contentDisposition = response.headers.get('content-disposition');
    assertTrue(
      contentDisposition.includes('.csv'),
      '文件名应为 .csv'
    );
  });
  
  // 测试 3: 导出订单 - 带筛选条件
  await test('GET /api/admin/orders/export?status=completed - 按状态筛选导出', async () => {
    const url = `${API_BASE_URL}/api/admin/orders/export?status=completed&format=xlsx`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    assertEqual(response.status, 200, '状态码');
    const contentType = response.headers.get('content-type');
    assertTrue(contentType.includes('application/vnd'), '应返回 Excel 文件');
  });
  
  // 测试 4: 无 Token 访问（应失败）
  await test('GET /api/admin/orders/export - 无 Token（应失败）', async () => {
    const url = `${API_BASE_URL}/api/admin/orders/export`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    assertEqual(response.status, 401, '状态码应为 401');
  });
}

// ==================== Profit Sharing Update API 测试 ====================

async function testProfitSharingUpdate() {
  console.log('\n💰 Profit Sharing Update API 测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 更新分账配置
  await test('PUT /api/admin/profit-sharing - 更新分账配置', async () => {
    const newConfig = {
      platformRate: 0.15,
      executorRate: 0.85,
      minAmount: 1,
      maxAmount: 100
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(newConfig)
    });
    
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertEqual(data.data.profitSharing.platformRate, 0.15, '平台抽成比例');
    assertEqual(data.data.profitSharing.executorRate, 0.85, '执行者比例');
  });
  
  // 测试 2: 更新分账配置 - 无效平台比例（应失败）
  await test('PUT /api/admin/profit-sharing - 无效平台比例（应失败）', async () => {
    const invalidConfig = {
      platformRate: 1.5,
      executorRate: 0.8
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(invalidConfig)
    });
    
    assertEqual(response.status, 400, '状态码应为 400');
    assertEqual(data.code, 'INVALID_PLATFORM_RATE', '错误码');
  });
  
  // 测试 3: 更新分账配置 - 无效执行者比例（应失败）
  await test('PUT /api/admin/profit-sharing - 无效执行者比例（应失败）', async () => {
    const invalidConfig = {
      platformRate: 0.2,
      executorRate: -0.1
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(invalidConfig)
    });
    
    assertEqual(response.status, 400, '状态码应为 400');
    assertTrue(data.code !== 'SUCCESS', '应返回错误码');
  });
  
  // 测试 4: 更新分账配置 - 比例总和超限（应失败）
  await test('PUT /api/admin/profit-sharing - 比例总和超限（应失败）', async () => {
    const invalidConfig = {
      platformRate: 0.5,
      executorRate: 0.6
    };
    
    const { response, data } = await request('/api/admin/profit-sharing', {
      method: 'PUT',
      body: JSON.stringify(invalidConfig)
    });
    
    assertEqual(response.status, 400, '状态码应为 400');
    assertEqual(data.code, 'INVALID_RATE_SUM', '错误码');
  });
}

// ==================== Export History API 测试 ====================

async function testExportHistory() {
  console.log('\n📜 Export History API 测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 获取导出历史
  await test('GET /api/admin/export/history - 获取导出历史', async () => {
    const { response, data } = await request('/api/admin/export/history?page=1&pageSize=20');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(data.data !== undefined, '应包含 data');
    assertTrue(Array.isArray(data.data.history), 'history 应为数组');
    assertTrue(data.data.pagination !== undefined, '应包含分页信息');
    assertTrue(typeof data.data.pagination.total === 'number', 'total 应为数字');
  });
  
  // 测试 2: 获取导出历史 - 按数据类型筛选
  await test('GET /api/admin/export/history?dataType=orders - 按数据类型筛选', async () => {
    const { response, data } = await request('/api/admin/export/history?dataType=orders');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
  });
  
  // 测试 3: 无 Token 访问（应失败）
  await test('GET /api/admin/export/history - 无 Token（应失败）', async () => {
    const url = `${API_BASE_URL}/api/admin/export/history`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    assertEqual(response.status, 401, '状态码应为 401');
  });
}

// ==================== Settings Update API 测试 ====================

async function testSettingsUpdate() {
  console.log('\n⚙️  Settings Update API 测试');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 测试 1: 更新系统设置
  await test('POST /api/admin/settings - 更新系统设置', async () => {
    const setting = {
      key: 'site_name',
      value: '清如家政服务平台'
    };
    
    const { response, data } = await request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(setting)
    });
    
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertEqual(data.data.key, 'site_name', '设置键');
    assertEqual(data.data.value, '清如家政服务平台', '设置值');
  });
  
  // 测试 2: 获取系统设置
  await test('GET /api/admin/settings - 获取系统设置', async () => {
    const { response, data } = await request('/api/admin/settings');
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(data.data !== undefined, '应包含 data');
    assertTrue(data.data.settings !== undefined, '应包含 settings');
  });
  
  // 测试 3: 批量更新系统设置
  await test('PUT /api/admin/settings - 批量更新系统设置', async () => {
    const settings = {
      'site_description': '专业家政服务平台',
      'contact_email': 'support@clearspring.com'
    };
    
    const { response, data } = await request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
    assertTrue(typeof data.data.updated === 'number', 'updated 应为数字');
  });
  
  // 测试 4: 更新系统设置 - 无效键名（应失败）
  await test('POST /api/admin/settings - 无效键名（应失败）', async () => {
    const invalidSetting = {
      key: 'invalid-key!',
      value: 'test'
    };
    
    const { response, data } = await request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(invalidSetting)
    });
    
    assertEqual(response.status, 400, '状态码应为 400');
    assertEqual(data.code, 'INVALID_PARAMS', '错误码');
  });
  
  // 测试 5: 更新系统设置 - 缺少键名（应失败）
  await test('POST /api/admin/settings - 缺少键名（应失败）', async () => {
    const invalidSetting = {
      value: 'test'
    };
    
    const { response, data } = await request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(invalidSetting)
    });
    
    assertEqual(response.status, 400, '状态码应为 400');
    assertTrue(data.code !== 'SUCCESS', '应返回错误码');
  });
  
  // 测试 6: 删除系统设置
  await test('DELETE /api/admin/settings/site_description - 删除系统设置', async () => {
    const { response, data } = await request('/api/admin/settings/site_description', {
      method: 'DELETE'
    });
    
    assertEqual(response.status, 200, '状态码');
    assertEqual(data.code, 'SUCCESS', '返回码');
  });
  
  // 测试 7: 无 Token 访问（应失败）
  await test('POST /api/admin/settings - 无 Token（应失败）', async () => {
    const url = `${API_BASE_URL}/api/admin/settings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      }
    });
    assertEqual(response.status, 401, '状态码应为 401');
  });
}

// ==================== 主测试流程 ====================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   清如 ClearSpring V2 - 缺失 API 实现测试            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n📍 API 地址：${API_BASE_URL}`);
  console.log(`🔑 Token: ${ADMIN_TOKEN ? '已配置' : '未配置（部分测试可能失败）'}`);
  
  if (!ADMIN_TOKEN) {
    console.log('\n⚠️  警告：未配置 ADMIN_TOKEN，请设置环境变量后重试');
    console.log('   export ADMIN_TOKEN="your_admin_token_here"\n');
  }
  
  try {
    // 运行所有测试
    await testDashboardStats();
    await testOrdersExport();
    await testProfitSharingUpdate();
    await testExportHistory();
    await testSettingsUpdate();
    
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
