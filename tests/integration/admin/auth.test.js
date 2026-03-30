/**
 * 管理员认证模块测试
 * 测试登录、Token 验证等功能
 */

const request = require('supertest');
const { getAdminToken, getAuthHeader, BASE_URL, TEST_TIMEOUT } = require('../helpers/test-utils');
const { adminData } = require('../helpers/test-data-factory');

describe('🔐 管理员认证模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
  });

  describe('POST /api/admin/auth/login', () => {
    test('AUTH-001: 正常登录 - 有效账号密码', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send(adminData.valid)
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('AUTH-002: 登录失败 - 错误密码', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          username: 'admin',
          password: 'wrong_password'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
      expect(response.body.data).toBeNull();
      expect(response.body.message).toContain('密码');
    });

    test('AUTH-003: 登录失败 - 不存在的账号', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
      expect(response.body.data).toBeNull();
    });

    test('AUTH-004: 登录失败 - 缺少用户名', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          password: 'admin123'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
      expect(response.body.message).toContain('参数');
    });

    test('AUTH-005: 登录失败 - 缺少密码', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({
          username: 'admin'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
      expect(response.body.message).toContain('参数');
    });

    test('AUTH-006: 登录失败 - 空请求体', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({})
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });

  describe('认证 Token 验证', () => {
    let validToken;

    beforeAll(async () => {
      validToken = await getAdminToken();
    });

    test('AUTH-007: Token 格式验证', async () => {
      expect(validToken).toBeDefined();
      expect(validToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('AUTH-008: 使用有效 Token 访问受保护接口', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard')
        .set(getAuthHeader(validToken))
        .expect(200);
      
      // 只要不是 401 或 Token 相关错误即可
      expect(response.body.code).not.toBe('USER_TOKEN_INVALID');
    });

    test('AUTH-009: 使用无效 Token 访问受保护接口', async () => {
      const invalidToken = 'invalid.token.here';
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard')
        .set(getAuthHeader(invalidToken))
        .expect(200);
      
      expect(response.body.code).toBe('USER_TOKEN_INVALID');
    });

    test('AUTH-010: 无 Token 访问受保护接口', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard')
        .expect(200);
      
      expect(response.body.code).toBe('USER_TOKEN_INVALID');
    });
  });
});
