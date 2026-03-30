/**
 * 测试辅助工具
 * 提供通用的测试函数和配置
 */

const request = require('supertest');

// 配置
const BASE_URL = process.env.API_URL || 'http://101.96.192.63:3000';
const TEST_TIMEOUT = 15000;

/**
 * 延迟执行辅助函数
 * @param {number} ms - 延迟毫秒数
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取管理员 Token
 * @returns {Promise<string>} JWT Token
 */
async function getAdminToken() {
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };
  
  const response = await request(BASE_URL)
    .post('/api/admin/auth/login')
    .send(adminCredentials)
    .expect(200);
  
  if (response.body.code === 'SUCCESS') {
    return response.body.data.token;
  }
  throw new Error('获取管理员 Token 失败');
}

/**
 * 获取认证 Header
 * @param {string} token - JWT Token
 * @returns {Object} HTTP Headers
 */
function getAuthHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 生成唯一测试 ID
 * @param {string} prefix - 前缀
 * @returns {string} 唯一 ID
 */
function generateTestId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 清理测试数据
 * @param {string} token - 管理员 Token
 * @param {Object} testData - 测试数据
 */
async function cleanupTestData(token, testData) {
  // 实现清理逻辑
  console.log('清理测试数据:', testData);
}

module.exports = {
  BASE_URL,
  TEST_TIMEOUT,
  delay,
  getAdminToken,
  getAuthHeader,
  generateTestId,
  cleanupTestData,
};
