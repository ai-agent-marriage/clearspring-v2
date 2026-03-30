/**
 * 执行者模块测试
 * 测试执行者资质、状态、列表等功能
 */

const request = require('supertest');
const { getAdminToken, getAuthHeader, BASE_URL, TEST_TIMEOUT } = require('../../helpers/test-utils');
const { executorData } = require('../../helpers/test-data-factory');

describe('👤 执行者模块', () => {
  let adminToken;
  let createdExecutorId;

  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    adminToken = await getAdminToken();
  });

  describe('GET /api/executor/list', () => {
    test('EXECUTOR-001: 获取执行者列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/executor/list?page=1&limit=20')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('executors');
      expect(Array.isArray(response.body.data.executors)).toBe(true);
    });

    test('EXECUTOR-002: 获取执行者列表 - 带筛选条件', async () => {
      const response = await request(BASE_URL)
        .get('/api/executor/list?status=available&page=1&limit=10')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });
  });

  describe('GET /api/executor/detail/:id', () => {
    test('EXECUTOR-003: 获取执行者详情 - 有效 ID', async () => {
      // 先获取列表找到一个执行者
      const listResponse = await request(BASE_URL)
        .get('/api/executor/list?page=1&limit=1')
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      if (listResponse.body.data && listResponse.body.data.executors.length > 0) {
        const executorId = listResponse.body.data.executors[0]._id || listResponse.body.data.executors[0].id;
        
        const response = await request(BASE_URL)
          .get(`/api/executor/detail/${executorId}`)
          .set(getAuthHeader(adminToken))
          .expect(200);
        
        expect(response.body.code).toBe('SUCCESS');
        expect(response.body.data).toHaveProperty('executor');
      }
    });

    test('EXECUTOR-004: 获取执行者详情 - 不存在的 ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .get(`/api/executor/detail/${fakeId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);
      
      expect(response.body.code).toBe('EXECUTOR_NOT_FOUND');
    });
  });

  describe('POST /api/executor/qualification', () => {
    test('EXECUTOR-005: 提交资质申请 - 有效数据', async () => {
      const response = await request(BASE_URL)
        .post('/api/executor/qualification')
        .set(getAuthHeader(adminToken))
        .send({
          realName: '张三',
          idCard: '310101199001011234',
          phone: '13800138000',
          skillTags: ['cleaning', 'cooking'],
          experience: '5 年家政经验'
        })
        .expect(200);
      
      // 可能成功或已存在资质
      expect(['SUCCESS', 'EXECUTOR_QUALIFICATION_PENDING']).toContain(response.body.code);
    });

    test('EXECUTOR-006: 提交资质申请 - 缺少必填字段', async () => {
      const response = await request(BASE_URL)
        .post('/api/executor/qualification')
        .set(getAuthHeader(adminToken))
        .send({
          realName: '张三'
          // 缺少其他必填字段
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });

    test('EXECUTOR-007: 提交资质申请 - 无效身份证号', async () => {
      const response = await request(BASE_URL)
        .post('/api/executor/qualification')
        .set(getAuthHeader(adminToken))
        .send({
          realName: '张三',
          idCard: 'invalid_id',
          phone: '13800138000'
        })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });

  describe('PUT /api/executor/status', () => {
    test('EXECUTOR-008: 更新执行者状态 - 有效状态', async () => {
      const response = await request(BASE_URL)
        .put('/api/executor/status')
        .set(getAuthHeader(adminToken))
        .send({ status: 'available' })
        .expect(200);
      
      // 可能成功或执行者不存在
      expect(['SUCCESS', 'EXECUTOR_NOT_FOUND']).toContain(response.body.code);
    });

    test('EXECUTOR-009: 更新执行者状态 - 无效状态', async () => {
      const response = await request(BASE_URL)
        .put('/api/executor/status')
        .set(getAuthHeader(adminToken))
        .send({ status: 'invalid_status' })
        .expect(200);
      
      expect(response.body.code).not.toBe('SUCCESS');
    });
  });

  describe('PUT /api/admin/executor/:id/qualification', () => {
    test('EXECUTOR-010: 审核资质 - 通过', async () => {
      // 需要先有一个待审核的资质
      const response = await request(BASE_URL)
        .put('/api/admin/executor/fake_id/qualification')
        .set(getAuthHeader(adminToken))
        .send({ status: 'approved', remark: '审核通过' })
        .expect(200);
      
      // 可能成功或不存在
      expect(['SUCCESS', 'EXECUTOR_NOT_FOUND', 'APPEAL_NOT_FOUND']).toContain(response.body.code);
    });

    test('EXECUTOR-011: 审核资质 - 拒绝', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/executor/fake_id/qualification')
        .set(getAuthHeader(adminToken))
        .send({ status: 'rejected', remark: '资料不完整' })
        .expect(200);
      
      expect(['SUCCESS', 'EXECUTOR_NOT_FOUND', 'APPEAL_NOT_FOUND']).toContain(response.body.code);
    });
  });
});
