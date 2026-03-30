/**
 * 清如 ClearSpring V2.0 - Jest + Supertest 自动化测试套件
 * 
 * 测试框架：Jest + Supertest
 * 运行命令：npm test
 * 
 * 测试范围:
 * - API 接口测试 (P0)
 * - 异常处理测试 (P2)
 */

const request = require('supertest');
const logger = require('../../utils/logger');


// 配置
const BASE_URL = process.env.API_URL || 'http://101.96.192.63:3000';
const TEST_TIMEOUT = 15000;

// 测试数据
let adminToken = null;
let testOrderId = null;
let testExecutorId = null;
let testQualificationId = null;

// 测试数据工厂
const testData = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  order: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100,
    quantity: 1,
    remark: '测试订单'
  },
  profitSharing: {
    platformRate: 0.10,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80,
    minOrderAmount: 10,
    maxOrderAmount: 10000
  }
};

/**
 * 辅助函数：获取认证 Token
 */
async function getAdminToken() {
  const response = await request(BASE_URL)
    .post('/api/admin/auth/login')
    .send(testData.admin)
    .expect(200);
  
  if (response.body.code === 'SUCCESS') {
    adminToken = response.body.data.token;
    return adminToken;
  }
  throw new Error('获取 Token 失败');
}

/**
 * 辅助函数：获取认证 Header
 */
function getAuthHeader() {
  return {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 辅助函数：延迟执行
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== 认证模块测试 ====================

describe('🔐 管理员认证模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
  });

  describe('POST /api/admin/auth/login', () => {
    test('API-AUTH-001: 正常登录 - 有效账号密码', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send(testData.admin)
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('role');
      
      adminToken = response.body.data.token;
    });

    test('API-AUTH-002: 异常场景 - 账号为空', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({ username: '', password: 'admin123' })
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_PARAMS');
    });

    test('API-AUTH-003: 异常场景 - 密码为空', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: '' })
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_PARAMS');
    });

    test('API-AUTH-004: 异常场景 - 账号错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({ username: 'wrongadmin', password: 'admin123' })
        .expect(200);
      
      expect(response.body.code).toBe('AUTH_FAILED');
      expect(response.body.code).not.toBe('SUCCESS');
    });

    test('API-AUTH-005: 异常场景 - 密码错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'wrongpass' })
        .expect(200);
      
      expect(response.body.code).toBe('AUTH_FAILED');
    });

    test('API-AUTH-008: 异常场景 - 缺少请求体', async () => {
      const response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send({})
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_PARAMS');
    });
  });

  describe('GET /api/admin/auth/info', () => {
    beforeAll(async () => {
      if (!adminToken) {
        await getAdminToken();
      }
    });

    test('API-AUTH-009: 正常场景 - 有效 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('role');
    });

    test('API-AUTH-010: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    test('API-AUTH-011: 异常场景 - Token 格式错误', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .set('Authorization', 'Bearer invalid_token_format')
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    test('API-AUTH-012: 异常场景 - Token 过期', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .set('Authorization', 'Bearer expired_token_12345')
        .expect(200);
      
      // Token 不存在时应该返回 NOT_FOUND 或 UNAUTHORIZED
      expect(['NOT_FOUND', 'UNAUTHORIZED', 'INVALID_TOKEN']).toContain(response.body.code);
    });
  });
});

// ==================== Dashboard 统计模块测试 ====================

describe('📊 Dashboard 统计模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/dashboard/overview', () => {
    test('API-DASH-001: 正常场景 - 默认时间范围', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/overview')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data.overview).toHaveProperty('orders');
      expect(response.body.data.overview).toHaveProperty('users');
      expect(response.body.data.overview).toHaveProperty('executors');
    });

    test('API-DASH-002: 正常场景 - 自定义时间范围', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/overview')
        .query({
          startDate: '2026-03-01',
          endDate: '2026-03-30'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-DASH-003: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/overview')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    test('API-DASH-005: 边界场景 - 未来时间', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/overview')
        .query({
          startDate: '2030-01-01',
          endDate: '2030-12-31'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      // 未来时间应该返回空统计或 0
    });
  });

  describe('GET /api/admin/dashboard/orders-trend', () => {
    test('API-DASH-006: 正常场景 - 按天分组', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/orders-trend')
        .query({ groupBy: 'day' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('trend');
      expect(response.body.data).toHaveProperty('groupBy');
    });

    test('API-DASH-007: 正常场景 - 按周分组', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/orders-trend')
        .query({ groupBy: 'week' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-DASH-008: 正常场景 - 按月分组', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/orders-trend')
        .query({ groupBy: 'month' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });
  });

  describe('GET /api/admin/dashboard/realtime', () => {
    test('API-DASH-011: 正常场景 - 实时数据', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/realtime')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('realtime');
      expect(response.body.data.realtime).toHaveProperty('today');
      expect(response.body.data.realtime).toHaveProperty('activeOrders');
    });
  });
});

// ==================== 订单管理模块测试 ====================

describe('📦 订单管理模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/orders', () => {
    test('API-ORD-001: 正常场景 - 默认分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({ page: 1, pageSize: 20 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('API-ORD-002: 正常场景 - 状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({ status: 'completed' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-ORD-003: 正常场景 - 时间范围筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({
          startDate: '2026-03-01',
          endDate: '2026-03-30'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-ORD-004: 正常场景 - 关键词搜索', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({ keyword: '测试' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-ORD-005: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    test('API-ORD-006: 边界场景 - 空结果', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({ keyword: '不存在的关键词_xyz123' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data.orders).toHaveLength(0);
      expect(response.body.data.pagination.total).toBe(0);
    });

    test('API-ORD-007: 边界场景 - 超大页码', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/orders')
        .query({ page: 99999, pageSize: 20 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data.orders).toHaveLength(0);
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    test('API-ORD-010: 异常场景 - 订单不存在', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/orders/${fakeId}/status`)
        .send({ status: 'completed' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('ORDER_NOT_FOUND');
    });

    test('API-ORD-011: 异常场景 - 无效状态', async () => {
      // 先获取一个真实订单
      const listResponse = await request(BASE_URL)
        .get('/api/admin/orders')
        .set(getAuthHeader());
      
      if (listResponse.body.data.orders.length > 0) {
        const orderId = listResponse.body.data.orders[0].orderId;
        const response = await request(BASE_URL)
          .put(`/api/admin/orders/${orderId}/status`)
          .send({ status: 'invalid_status' })
          .set(getAuthHeader())
          .expect(200);
        
        expect(response.body.code).toBe('INVALID_STATUS');
      }
    });

    test('API-ORD-012: 异常场景 - 无 Token', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/orders/${fakeId}/status`)
        .send({ status: 'completed' })
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/admin/orders/:id', () => {
    test('API-ORD-015: 异常场景 - 删除非取消订单', async () => {
      const listResponse = await request(BASE_URL)
        .get('/api/admin/orders')
        .set(getAuthHeader());
      
      if (listResponse.body.data.orders.length > 0) {
        const order = listResponse.body.data.orders.find(o => o.status !== 'cancelled');
        if (order) {
          const response = await request(BASE_URL)
            .delete(`/api/admin/orders/${order.orderId}`)
            .set(getAuthHeader())
            .expect(200);
          
          expect(response.body.code).toBe('ORDER_CANNOT_DELETE');
        }
      }
    });

    test('API-ORD-016: 异常场景 - 订单不存在', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .delete(`/api/admin/orders/${fakeId}`)
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('ORDER_NOT_FOUND');
    });
  });
});

// ==================== 资质审核模块测试 ====================

describe('📜 资质审核模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/qualifications', () => {
    test('API-QUAL-001: 正常场景 - 默认分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/qualifications')
        .query({ page: 1, pageSize: 20 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('qualifications');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('API-QUAL-002: 正常场景 - 状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/qualifications')
        .query({ status: 'pending' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-QUAL-004: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/qualifications')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/admin/qualifications/:id', () => {
    test('API-QUAL-007: 异常场景 - 驳回无原因', async () => {
      const listResponse = await request(BASE_URL)
        .get('/api/admin/qualifications')
        .query({ status: 'pending' })
        .set(getAuthHeader());
      
      if (listResponse.body.data.qualifications.length > 0) {
        const qualId = listResponse.body.data.qualifications[0].qualificationId;
        const response = await request(BASE_URL)
          .put(`/api/admin/qualifications/${qualId}`)
          .send({ status: 'rejected', rejectReason: '' })
          .set(getAuthHeader())
          .expect(200);
        
        expect(response.body.code).toBe('MISSING_REJECT_REASON');
      }
    });

    test('API-QUAL-008: 异常场景 - 无效状态', async () => {
      const listResponse = await request(BASE_URL)
        .get('/api/admin/qualifications')
        .set(getAuthHeader());
      
      if (listResponse.body.data.qualifications.length > 0) {
        const qualId = listResponse.body.data.qualifications[0].qualificationId;
        const response = await request(BASE_URL)
          .put(`/api/admin/qualifications/${qualId}`)
          .send({ status: 'invalid' })
          .set(getAuthHeader())
          .expect(200);
        
        expect(response.body.code).toBe('INVALID_STATUS');
      }
    });

    test('API-QUAL-009: 异常场景 - 资质不存在', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/qualifications/${fakeId}`)
        .send({ status: 'approved' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('CERTIFICATE_NOT_FOUND');
    });

    test('API-QUAL-011: 异常场景 - 无 Token', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/qualifications/${fakeId}`)
        .send({ status: 'approved' })
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});

// ==================== 执行者管理模块测试 ====================

describe('👷 执行者管理模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/executors', () => {
    test('API-EXEC-001: 正常场景 - 默认分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/executors')
        .query({ page: 1, pageSize: 20 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('executors');
      expect(response.body.data).toHaveProperty('pagination');
      
      if (response.body.data.executors.length > 0) {
        testExecutorId = response.body.data.executors[0].executorId;
      }
    });

    test('API-EXEC-002: 正常场景 - 状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/executors')
        .query({ status: 'active' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-EXEC-003: 正常场景 - 关键词搜索', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/executors')
        .query({ keyword: '测试' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-EXEC-005: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/executors')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/admin/executors/:id/status', () => {
    test('API-EXEC-008: 异常场景 - 无效状态', async () => {
      if (testExecutorId) {
        const response = await request(BASE_URL)
          .put(`/api/admin/executors/${testExecutorId}/status`)
          .send({ status: 'invalid_status' })
          .set(getAuthHeader())
          .expect(200);
        
        expect(response.body.code).toBe('INVALID_STATUS');
      }
    });

    test('API-EXEC-009: 异常场景 - 执行者不存在', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/executors/${fakeId}/status`)
        .send({ status: 'active' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('EXECUTOR_NOT_FOUND');
    });

    test('API-EXEC-011: 异常场景 - 无 Token', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(BASE_URL)
        .put(`/api/admin/executors/${fakeId}/status`)
        .send({ status: 'active' })
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});

// ==================== 分账配置模块测试 ====================

describe('💰 分账配置模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/profit-sharing', () => {
    test('API-PROF-001: 正常场景 - 获取配置', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/profit-sharing')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('profitSharing');
    });

    test('API-PROF-003: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/profit-sharing')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/admin/profit-sharing', () => {
    test('API-PROF-004: 正常场景 - 更新配置', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send({
          platformRate: 0.10,
          executorMinRate: 0.70,
          executorMaxRate: 0.90,
          defaultExecutorRate: 0.80
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-PROF-005: 异常场景 - 平台比例超限', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send({ platformRate: 1.5 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_PLATFORM_RATE');
    });

    test('API-PROF-006: 异常场景 - 执行者比例超限', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send({ executorMinRate: -0.1 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_EXECUTOR_MIN_RATE');
    });

    test('API-PROF-007: 异常场景 - 比例总和超限', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send({
          platformRate: 0.5,
          defaultExecutorRate: 0.6
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('INVALID_RATE_SUM');
    });

    test('API-PROF-008: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send(testData.profitSharing)
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});

// ==================== 数据导出模块测试 ====================

describe('📥 数据导出模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT * 2);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/export/orders', () => {
    test('API-EXPT-001: 正常场景 - 导出 Excel', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/orders')
        .query({ format: 'xlsx' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    test('API-EXPT-002: 正常场景 - 导出 CSV', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/orders')
        .query({ format: 'csv' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
    });

    test('API-EXPT-005: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/orders')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/admin/export/executors', () => {
    test('API-EXPT-006: 正常场景 - 导出执行者', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/executors')
        .query({ format: 'xlsx' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('GET /api/admin/export/users', () => {
    test('API-EXPT-007: 正常场景 - 导出用户', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/users')
        .query({ format: 'xlsx' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });
});

// ==================== 操作日志模块测试 ====================

describe('📋 操作日志模块', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('GET /api/admin/audit-logs', () => {
    test('API-LOGS-001: 正常场景 - 默认分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/audit-logs')
        .query({ page: 1, pageSize: 20 })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('logs');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('API-LOGS-002: 正常场景 - 类型筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/audit-logs')
        .query({ type: 'admin_login' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });

    test('API-LOGS-004: 异常场景 - 无 Token', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/audit-logs')
        .expect(200);
      
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/admin/audit-logs/types', () => {
    test('API-LOGS-005: 正常场景 - 获取日志类型', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/audit-logs/types')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('logTypes');
    });
  });
});

// ==================== CORS 配置测试 ====================

describe('🌐 CORS 配置验证', () => {
  test('API-CORS-001: 允许管理后台跨域访问', async () => {
    const response = await request(BASE_URL)
      .options('/api/admin/auth/login')
      .set('Origin', 'http://localhost:8080')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type, Authorization');
    
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8080');
  });
});

// ==================== 健康检查测试 ====================

describe('🏥 健康检查', () => {
  test('API-HEALTH-001: 服务健康状态', async () => {
    const response = await request(BASE_URL)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
  });
});

// ==================== 测试报告生成 ====================

afterAll(() => {
  logger.info('\n========================================');
  logger.info('✅ 测试套件执行完成');
  logger.info('========================================\n');
});
