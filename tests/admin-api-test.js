/**
 * 清如 ClearSpring V2.0 - 管理端 API 测试脚本
 * 
 * 测试接口：
 * 1. 健康检查
 * 2. 管理员登录
 * 3. 管理员信息
 * 4. 订单管理
 * 5. 执行者管理
 * 6. 资质审核
 * 7. 分账配置
 * 8. 管理员管理
 * 9. 操作日志
 * 10. Dashboard 统计
 * 11. 数据导出
 */

const http = require('http');
const logger = require('../../utils/logger');


const BASE_URL = 'http://101.96.192.63:3000';
let adminToken = null;
let testResults = [];
let testSummary = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// 工具函数：发送 HTTP 请求（带超时）
function httpRequest(options, postData = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`请求超时 (${timeout}ms)`));
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// 记录测试结果
function recordTest(name, passed, statusCode, response, error = null) {
  testSummary.total++;
  if (passed) {
    testSummary.passed++;
  } else if (error === 'SKIPPED') {
    testSummary.skipped++;
  } else {
    testSummary.failed++;
  }
  
  testResults.push({
    name,
    passed,
    statusCode,
    response: typeof response === 'object' ? JSON.stringify(response).substring(0, 200) : response,
    error
  });
  
  const icon = passed ? '✅' : (error === 'SKIPPED' ? '⏭️' : '❌');
  logger.info(`   ${icon} ${name}${error && error !== 'SKIPPED' ? ` - ${error}` : ''}`);
}

// 测试 0: 健康检查
async function testHealth() {
  logger.info('\n📊 测试 0: 健康检查');
  logger.info('   GET /health');
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    
    const passed = result.statusCode === 200 && result.data.status === 'ok';
    recordTest('健康检查', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('健康检查', false, null, null, error.message);
    return false;
  }
}

// 测试 1: 管理员登录
async function testAdminLogin() {
  logger.info('\n🔐 测试 1: 管理员登录');
  logger.info('   POST /api/admin/auth/login');
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'admin',
      password: 'admin123'
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    if (passed && result.data.data && result.data.data.token) {
      adminToken = result.data.data.token;
      logger.info(`   ✅ Token 已获取`);
    }
    recordTest('管理员登录', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('管理员登录', false, null, null, error.message);
    return false;
  }
}

// 测试 2: 获取管理员信息
async function testAdminProfile() {
  logger.info('\n👤 测试 2: 获取管理员信息');
  logger.info('   GET /api/admin/auth/profile');
  
  if (!adminToken) {
    recordTest('获取管理员信息', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('获取管理员信息', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('获取管理员信息', false, null, null, error.message);
    return false;
  }
}

// 测试 3: Dashboard 概览
async function testDashboardOverview() {
  logger.info('\n📈 测试 3: Dashboard 概览');
  logger.info('   GET /api/admin/dashboard/overview');
  
  if (!adminToken) {
    recordTest('Dashboard 概览', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/dashboard/overview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('Dashboard 概览', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('Dashboard 概览', false, null, null, error.message);
    return false;
  }
}

// 测试 4: 订单列表
async function testAdminOrders() {
  logger.info('\n📦 测试 4: 订单列表');
  logger.info('   GET /api/admin/orders');
  
  if (!adminToken) {
    recordTest('订单列表', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/orders?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('订单列表', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('订单列表', false, null, null, error.message);
    return false;
  }
}

// 测试 5: 执行者列表
async function testAdminExecutors() {
  logger.info('\n👷 测试 5: 执行者列表');
  logger.info('   GET /api/admin/executors');
  
  if (!adminToken) {
    recordTest('执行者列表', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/executors?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('执行者列表', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('执行者列表', false, null, null, error.message);
    return false;
  }
}

// 测试 6: 资质审核列表
async function testAdminQualifications() {
  logger.info('\n📜 测试 6: 资质审核列表');
  logger.info('   GET /api/admin/qualifications');
  
  if (!adminToken) {
    recordTest('资质审核列表', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/qualifications?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('资质审核列表', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('资质审核列表', false, null, null, error.message);
    return false;
  }
}

// 测试 7: 分账配置
async function testProfitSharing() {
  logger.info('\n💰 测试 7: 分账配置');
  logger.info('   GET /api/admin/profit-sharing');
  
  if (!adminToken) {
    recordTest('分账配置', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/profit-sharing',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('分账配置', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('分账配置', false, null, null, error.message);
    return false;
  }
}

// 测试 8: 管理员列表
async function testAdminsList() {
  logger.info('\n👥 测试 8: 管理员列表');
  logger.info('   GET /api/admin/admins');
  
  if (!adminToken) {
    recordTest('管理员列表', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/admins?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('管理员列表', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('管理员列表', false, null, null, error.message);
    return false;
  }
}

// 测试 9: 操作日志列表
async function testAuditLogs() {
  logger.info('\n📋 测试 9: 操作日志列表');
  logger.info('   GET /api/admin/audit-logs');
  
  if (!adminToken) {
    recordTest('操作日志列表', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/audit-logs?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('操作日志列表', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('操作日志列表', false, null, null, error.message);
    return false;
  }
}

// 测试 10: Dashboard 实时数据
async function testDashboardRealtime() {
  logger.info('\n⚡ 测试 10: Dashboard 实时数据');
  logger.info('   GET /api/admin/dashboard/realtime');
  
  if (!adminToken) {
    recordTest('Dashboard 实时数据', false, null, null, 'SKIPPED');
    logger.info('   ⏭️  跳过 (缺少 Token)');
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/dashboard/realtime',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    recordTest('Dashboard 实时数据', passed, result.statusCode, result.data);
    return passed;
  } catch (error) {
    recordTest('Dashboard 实时数据', false, null, null, error.message);
    return false;
  }
}

// 测试 11: 管理员列表 API（验证 CORS）
async function testCORS() {
  logger.info('\n🌐 测试 11: CORS 配置验证');
  logger.info('   OPTIONS /api/admin/auth/login');
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/admin/auth/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    const passed = result.statusCode === 204 || result.statusCode === 200;
    const corsHeader = result.headers['access-control-allow-origin'];
    logger.info(`   CORS Header: ${corsHeader || '未设置'}`);
    recordTest('CORS 配置验证', passed, result.statusCode, { corsHeader });
    return passed;
  } catch (error) {
    recordTest('CORS 配置验证', false, null, null, error.message);
    return false;
  }
}

// 生成测试报告
function generateReport() {
  logger.info('\n' + '='.repeat(70));
  logger.info('📊 管理端 API 测试报告');
  logger.info('='.repeat(70));
  logger.info(`测试时间：${new Date().toLocaleString('zh-CN')}`);
  logger.info(`API 地址：${BASE_URL}`);
  logger.info('');
  logger.info(`总计：${testSummary.total} 个测试`);
  logger.info(`✅ 通过：${testSummary.passed}`);
  logger.info(`❌ 失败：${testSummary.failed}`);
  logger.info(`⏭️  跳过：${testSummary.skipped}`);
  
  const successRate = testSummary.total > 0 
    ? ((testSummary.passed / testSummary.total) * 100).toFixed(1)
    : 0;
  logger.info(`成功率：${successRate}%`);
  
  logger.info('\n详细结果:');
  testResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : (result.error === 'SKIPPED' ? '⏭️' : '❌');
    logger.info(`  ${index + 1}. ${icon} ${result.name}`);
    if (result.error && result.error !== 'SKIPPED') {
      logger.info(`     错误：${result.error}`);
    }
  });
  
  logger.info('\n' + '='.repeat(70));
  
  return testSummary;
}

// 主函数
async function main() {
  logger.info('🚀 清如 ClearSpring V2.0 - 管理端 API 测试');
  logger.info('测试开始时间:', new Date().toLocaleString('zh-CN'));
  logger.info('API 地址:', BASE_URL);
  logger.info('');
  
  const startTime = Date.now();
  
  // 执行测试
  await testHealth();
  await testAdminLogin();
  await testAdminProfile();
  await testDashboardOverview();
  await testAdminOrders();
  await testAdminExecutors();
  await testAdminQualifications();
  await testProfitSharing();
  await testAdminsList();
  await testAuditLogs();
  await testDashboardRealtime();
  await testCORS();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 生成报告
  const report = generateReport();
  
  logger.info(`\n⏱️  测试耗时：${duration}ms`);
  logger.info('测试结束时间:', new Date().toLocaleString('zh-CN'));
  
  return report;
}

// 运行测试
main()
  .then(report => {
    logger.info('\n测试完成！');
    process.exit(report.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
