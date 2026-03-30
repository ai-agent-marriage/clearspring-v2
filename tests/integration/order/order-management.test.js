/**
 * 订单管理模块测试
 * 测试订单 CRUD、状态变更等功能
 */

const request = require('supertest');
const { getAdminToken, getAuthHeader, BASE_URL, TEST_TIMEOUT } = require('../../helpers/test-utils');
const { orderData } = require('../../helpers/test-data-factory');

describe('📦 订单管理模块', () => {
  let adminToken;
  let createdOrderId;

  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    adminToken = await getAdminToken();
  });

  describe('POST /api/admin/order/create', () => {
    test('ORDER-001: 创建订单 - 有效数据', async () => {
      const response = await request(BASE_URL)
        .post('/api/order/create')
        .set(getAuthHeader(adminToken))
        .send(orderData.valid)
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.order).toHaveProperty('orderId');
      
      createdOrderId = response.body.data.order.orderId;
    });

    test('ORDER-002: 创建订单 - 缺少必填字段', async () => {
      const response = await request(BASE_URL)
        .post('/api/order/create')
        .set(getAuthHeader(adminToken))
        .send(orderData.missingFields)
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
      expect(response.body.message).toContain('参数');
    });

    test('ORDER-003: 创建订单 - 无效价格', async () => {
      const response = await request(BASE_URL)
        .post('/api/order/create')
        .set(getAuthHeader(adminToken))
        .send({
          ...orderData.valid,
          price: -100
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });

    test('ORDER-004: 创建订单 - 无效日期', async () => {
      const response = await request(BASE_URL)
        .post('/api/order/create')
        .set(getAuthHeader(adminToken))
        .send({
          ...orderData.valid,
          serviceDate: 'invalid-date'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });

  describe('GET /api/admin/orders', () => {
    test('ORDER-005: 获取订单列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders?page=1&limit=20')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('orders');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });

    test('ORDER-006: 获取订单列表 - 带筛选条件', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders?status=pending&page=1&limit=10')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('orders');
    });

    test('ORDER-007: 获取订单列表 - 无认证', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .expect(200);
      
      expect(response.body.code).toBe('USER_TOKEN_INVALID');
    });
  });

  describe('GET /api/admin/order/:id', () => {
    test('ORDER-008: 获取订单详情 - 有效 ID', async () => {
      if (!createdOrderId) return;
      
      const response = await request(BASE_URL)
        .get(`/api/admin/order/${createdOrderId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.order.orderId).toBe(createdOrderId);
    });

    test('ORDER-009: 获取订单详情 - 无效 ID', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/order/invalid_id')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });

    test('ORDER-010: 获取订单详情 - 不存在的订单', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .get(`/api/admin/order/${fakeId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('PUT /api/admin/order/:id/status', () => {
    test('ORDER-011: 更新订单状态 - 有效状态', async () => {
      if (!createdOrderId) return;
      
      const response = await request(BASE_URL)
        .put(`/api/admin/order/${createdOrderId}/status`)
        .set(getAuthHeader(adminToken))
        .send({ status: 'completed' })
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('ORDER-012: 更新订单状态 - 无效状态', async () => {
      if (!createdOrderId) return;
      
      const response = await request(BASE_URL)
        .put(`/api/admin/order/${createdOrderId}/status`)
        .set(getAuthHeader(adminToken))
        .send({ status: 'invalid_status' })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });

  describe('DELETE /api/admin/order/:id', () => {
    test('ORDER-013: 删除订单 - 有效 ID', async () => {
      if (!createdOrderId) return;
      
      const response = await request(BASE_URL)
        .delete(`/api/admin/order/${createdOrderId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('ORDER-014: 删除订单 - 不存在的订单', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .delete(`/api/admin/order/${fakeId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });
});
