/**
 * 清如 ClearSpring V2.0 - API 联调测试脚本
 * 
 * 测试接口：
 * 1. 用户登录接口
 * 2. 订单创建接口
 * 3. 订单列表接口
 * 4. 执行者列表接口
 */

const http = require('http');
const logger = require('../../utils/logger');


const BASE_URL = 'http://101.96.192.63:3000';
let authToken = null;
let testResults = [];

// 工具函数：发送 HTTP 请求（带超时）
function httpRequest(options, postData = null, timeout = 5000) {
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

// 测试：健康检查
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
    testResults.push({
      name: '健康检查',
      passed,
      statusCode: result.statusCode,
      response: result.data
    });
    
    logger.info(`   状态：${passed ? '✅ 通过' : '❌ 失败'}`);
    logger.info(`   响应：${JSON.stringify(result.data)}`);
    return passed;
  } catch (error) {
    logger.info(`   状态：❌ 失败 - ${error.message}`);
    testResults.push({
      name: '健康检查',
      passed: false,
      error: error.message
    });
    return false;
  }
}

// 测试 1: 用户登录
async function testUserLogin() {
  logger.info('\n👤 测试 1: 用户登录接口');
  logger.info('   POST /api/user/login');
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/user/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      code: 'test_login_code_12345'
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    if (passed && result.data.data && result.data.data.token) {
      authToken = result.data.data.token;
      logger.info(`   状态：✅ 通过 (Token 已获取)`);
    } else {
      logger.info(`   状态：${passed ? '⚠️  部分通过' : '❌ 失败'}`);
    }
    logger.info(`   响应：${JSON.stringify(result.data).substring(0, 200)}...`);
    
    testResults.push({
      name: '用户登录',
      passed,
      statusCode: result.statusCode,
      response: result.data,
      tokenObtained: !!authToken
    });
    
    return passed;
  } catch (error) {
    logger.info(`   状态：❌ 失败 - ${error.message}`);
    testResults.push({
      name: '用户登录',
      passed: false,
      error: error.message
    });
    return false;
  }
}

// 测试 2: 订单创建
async function testOrderCreate() {
  logger.info('\n📦 测试 2: 订单创建接口');
  logger.info('   POST /api/order/create');
  
  if (!authToken) {
    logger.info('   状态：⏭️  跳过 (缺少 Token)');
    testResults.push({
      name: '订单创建',
      passed: false,
      error: '缺少认证 Token'
    });
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/order/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      serviceType: '放生',
      serviceName: '放生服务测试',
      serviceDate: '2026-04-01T10:00:00+08:00',
      location: '上海市浦东新区',
      price: 100,
      quantity: 1,
      remark: 'API 测试订单'
    });
    
    const passed = result.statusCode === 200 && 
                   (result.data.code === 'SUCCESS' || result.data.code === 'CREATED');
    logger.info(`   状态：${passed ? '✅ 通过' : '❌ 失败'}`);
    logger.info(`   响应：${JSON.stringify(result.data).substring(0, 200)}...`);
    
    testResults.push({
      name: '订单创建',
      passed,
      statusCode: result.statusCode,
      response: result.data
    });
    
    return passed;
  } catch (error) {
    logger.info(`   状态：❌ 失败 - ${error.message}`);
    testResults.push({
      name: '订单创建',
      passed: false,
      error: error.message
    });
    return false;
  }
}

// 测试 3: 订单列表
async function testOrderList() {
  logger.info('\n📋 测试 3: 订单列表接口');
  logger.info('   GET /api/order/list');
  
  if (!authToken) {
    logger.info('   状态：⏭️  跳过 (缺少 Token)');
    testResults.push({
      name: '订单列表',
      passed: false,
      error: '缺少认证 Token'
    });
    return false;
  }
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/order/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    logger.info(`   状态：${passed ? '✅ 通过' : '❌ 失败'}`);
    logger.info(`   响应：${JSON.stringify(result.data).substring(0, 200)}...`);
    
    testResults.push({
      name: '订单列表',
      passed,
      statusCode: result.statusCode,
      response: result.data
    });
    
    return passed;
  } catch (error) {
    logger.info(`   状态：❌ 失败 - ${error.message}`);
    testResults.push({
      name: '订单列表',
      passed: false,
      error: error.message
    });
    return false;
  }
}

// 测试 4: 执行者列表
async function testExecutorList() {
  logger.info('\n👷 测试 4: 执行者列表接口');
  logger.info('   GET /api/executor/list');
  
  try {
    const result = await httpRequest({
      hostname: '101.96.192.63',
      port: 3000,
      path: '/api/executor/list',
      method: 'GET'
    });
    
    const passed = result.statusCode === 200 && result.data.code === 'SUCCESS';
    logger.info(`   状态：${passed ? '✅ 通过' : '❌ 失败'}`);
    logger.info(`   响应：${JSON.stringify(result.data).substring(0, 200)}...`);
    
    testResults.push({
      name: '执行者列表',
      passed,
      statusCode: result.statusCode,
      response: result.data
    });
    
    return passed;
  } catch (error) {
    logger.info(`   状态：❌ 失败 - ${error.message}`);
    testResults.push({
      name: '执行者列表',
      passed: false,
      error: error.message
    });
    return false;
  }
}

// 生成测试报告
function generateReport() {
  logger.info('\n' + '='.repeat(60));
  logger.info('📊 测试结果报告');
  logger.info('='.repeat(60));
  
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const failed = total - passed;
  
  logger.info(`\n总计：${total} 个测试`);
  logger.info(`✅ 通过：${passed}`);
  logger.info(`❌ 失败：${failed}`);
  logger.info(`成功率：${((passed / total) * 100).toFixed(1)}%`);
  
  logger.info('\n详细结果:');
  testResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    logger.info(`  ${index + 1}. ${icon} ${result.name}`);
    if (result.error) {
      logger.info(`     错误：${result.error}`);
    }
  });
  
  logger.info('\n' + '='.repeat(60));
  
  return { total, passed, failed, successRate: ((passed / total) * 100).toFixed(1) };
}

// 主函数
async function main() {
  logger.info('🚀 清如 ClearSpring V2.0 - API 联调测试');
  logger.info('测试开始时间:', new Date().toISOString());
  logger.info('API 地址:', BASE_URL);
  
  const startTime = Date.now();
  
  // 执行测试
  await testHealth();
  await testUserLogin();
  await testOrderCreate();
  await testOrderList();
  await testExecutorList();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 生成报告
  const report = generateReport();
  
  logger.info(`\n⏱️  测试耗时：${duration}ms`);
  logger.info('测试结束时间:', new Date().toISOString());
  
  // 返回结果
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
