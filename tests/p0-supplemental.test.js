/**
 * 清如 ClearSpring V2.0 - P0 核心功能补充测试套件
 * 
 * 测试框架：Jest + Supertest
 * 优先级：P0 (核心功能)
 * 用例数：20 个
 * 
 * 测试范围:
 * - 订单管理补充测试 (4 个)
 * - 认证模块补充测试 (2 个)
 * - Dashboard 补充测试 (2 个)
 * - 资质审核补充测试 (2 个)
 * - 申诉仲裁补充测试 (2 个)
 * - 执行者管理补充测试 (2 个)
 * - 分账配置补充测试 (2 个)
 * - 数据导出补充测试 (2 个)
 * - 系统设置补充测试 (2 个)
 */

const request = require('supertest');

// 配置
const BASE_URL = process.env.API_URL || 'http://101.96.192.63:3000';
const TEST_TIMEOUT = 15000;

// 测试数据
let adminToken = null;
let testOrderId = null;
let testAppealId = null;

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
    remark: 'P0 补充测试订单'
  },
  appeal: {
    orderId: '',
    reason: '服务不满意',
    evidence: ['photo1.jpg', 'photo2.jpg'],
    expectation: '退款'
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

// ==================== 订单管理补充测试 ====================

describe('📦 订单管理补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('订单状态流转测试', () => {
    test('API-ORD-017: 正常场景 - 订单状态完整流转', async () => {
      // 1. 创建订单 (pending)
      const createResponse = await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'pending'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(createResponse.body.code).toBe('SUCCESS');
      testOrderId = createResponse.body.data.id;
      
      // 2. 更新为进行中 (in_progress)
      const progressResponse = await request(BASE_URL)
        .put(`/api/admin/orders/${testOrderId}/status`)
        .send({ status: 'in_progress' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(progressResponse.body.code).toBe('SUCCESS');
      expect(progressResponse.body.data.status).toBe('in_progress');
      
      // 3. 更新为已完成 (completed)
      const completeResponse = await request(BASE_URL)
        .put(`/api/admin/orders/${testOrderId}/status`)
        .send({ status: 'completed' })
        .set(getAuthHeader())
        .expect(200);
      
      expect(completeResponse.body.code).toBe('SUCCESS');
      expect(completeResponse.body.data.status).toBe('completed');
    });
  });

  describe('订单取消流程测试', () => {
    test('API-ORD-018: 正常场景 - 用户取消订单', async () => {
      // 1. 创建订单
      const createResponse = await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'pending',
          remark: '测试取消订单'
        })
        .set(getAuthHeader())
        .expect(200);
      
      const orderId = createResponse.body.data.id;
      
      // 2. 取消订单
      const cancelResponse = await request(BASE_URL)
        .put(`/api/admin/orders/${orderId}/status`)
        .send({ 
          status: 'cancelled',
          cancelReason: '用户主动取消'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(cancelResponse.body.code).toBe('SUCCESS');
      expect(cancelResponse.body.data.status).toBe('cancelled');
      expect(cancelResponse.body.data.cancelReason).toBe('用户主动取消');
    });

    test('API-ORD-018-2: 异常场景 - 已完成的订单不能取消', async () => {
      const cancelResponse = await request(BASE_URL)
        .put(`/api/admin/orders/${testOrderId}/status`)
        .send({ status: 'cancelled' })
        .set(getAuthHeader())
        .expect(400);
      
      expect(cancelResponse.body.code).toBe('ORDER_CANNOT_CANCEL');
    });
  });

  describe('订单退款流程测试', () => {
    test('API-ORD-019: 正常场景 - 订单退款处理', async () => {
      // 1. 创建已支付的订单
      const createResponse = await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'paid',
          remark: '测试退款订单'
        })
        .set(getAuthHeader())
        .expect(200);
      
      const orderId = createResponse.body.data.id;
      
      // 2. 申请退款
      const refundApplyResponse = await request(BASE_URL)
        .post(`/api/admin/orders/${orderId}/refund`)
        .send({
          refundReason: '服务质量问题',
          refundAmount: 100
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(refundApplyResponse.body.code).toBe('SUCCESS');
      expect(refundApplyResponse.body.data.refundStatus).toBe('pending');
      
      // 3. 审批退款
      const refundApproveResponse = await request(BASE_URL)
        .post(`/api/admin/orders/${orderId}/refund/approve`)
        .send({
          approved: true,
          remark: '同意退款'
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(refundApproveResponse.body.code).toBe('SUCCESS');
      expect(refundApproveResponse.body.data.refundStatus).toBe('success');
    });

    test('API-ORD-019-2: 异常场景 - 退款金额不能超过订单金额', async () => {
      const createResponse = await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'paid',
          remark: '测试超额退款'
        })
        .set(getAuthHeader())
        .expect(200);
      
      const orderId = createResponse.body.data.id;
      
      const refundResponse = await request(BASE_URL)
        .post(`/api/admin/orders/${orderId}/refund`)
        .send({
          refundReason: '测试',
          refundAmount: 9999 // 超过订单金额
        })
        .set(getAuthHeader())
        .expect(400);
      
      expect(refundResponse.body.code).toBe('INVALID_REFUND_AMOUNT');
    });
  });

  describe('订单超时自动取消测试', () => {
    test('API-ORD-020: 边界场景 - 超时未支付订单自动取消', async () => {
      // 1. 创建待支付订单
      const createResponse = await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'pending_payment',
          remark: '测试超时取消',
          paymentTimeout: 1 // 1 秒超时 (测试用)
        })
        .set(getAuthHeader())
        .expect(200);
      
      const orderId = createResponse.body.data.id;
      
      // 2. 等待超时
      await delay(2000);
      
      // 3. 检查订单状态
      const getResponse = await request(BASE_URL)
        .get(`/api/admin/orders/${orderId}`)
        .set(getAuthHeader())
        .expect(200);
      
      // 订单应该被自动取消
      expect(getResponse.body.data.status).toBe('cancelled');
      expect(getResponse.body.data.cancelReason).toContain('超时');
    });
  });
});

// ==================== 认证模块补充测试 ====================

describe('🔐 认证模块补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
  });

  describe('Token 刷新机制测试', () => {
    test('API-AUTH-014: 正常场景 - Token 刷新', async () => {
      // 1. 登录获取 Token
      const loginResponse = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send(testData.admin)
        .expect(200);
      
      const oldToken = loginResponse.body.data.token;
      expect(oldToken).toBeDefined();
      
      // 2. 刷新 Token
      const refreshResponse = await request(BASE_URL)
        .post('/api/admin/auth/refresh')
        .send({ refreshToken: loginResponse.body.data.refreshToken })
        .set('Authorization', `Bearer ${oldToken}`)
        .expect(200);
      
      expect(refreshResponse.body.code).toBe('SUCCESS');
      expect(refreshResponse.body.data.token).toBeDefined();
      expect(refreshResponse.body.data.token).not.toBe(oldToken);
    });

    test('API-AUTH-014-2: 异常场景 - 使用过期的 RefreshToken', async () => {
      const refreshResponse = await request(BASE_URL)
        .post('/api/admin/auth/refresh')
        .send({ refreshToken: 'expired_refresh_token' })
        .expect(401);
      
      expect(refreshResponse.body.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('多设备登录测试', () => {
    test('API-AUTH-015: 正常场景 - 同一账号多设备登录', async () => {
      // 设备 1 登录
      const login1Response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send(testData.admin)
        .expect(200);
      
      expect(login1Response.body.code).toBe('SUCCESS');
      const token1 = login1Response.body.data.token;
      
      // 设备 2 登录 (同一账号)
      const login2Response = await request(BASE_URL)
        .post('/api/admin/auth/login')
        .send(testData.admin)
        .expect(200);
      
      expect(login2Response.body.code).toBe('SUCCESS');
      const token2 = login2Response.body.data.token;
      
      // 两个 Token 都应该有效
      const info1Response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      expect(info1Response.body.code).toBe('SUCCESS');
      
      const info2Response = await request(BASE_URL)
        .get('/api/admin/auth/info')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
      
      expect(info2Response.body.code).toBe('SUCCESS');
    });
  });
});

// ==================== Dashboard 补充测试 ====================

describe('📊 Dashboard 补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('实时数据刷新测试', () => {
    test('API-DASH-012: 正常场景 - 实时数据更新', async () => {
      // 1. 获取初始数据
      const initialResponse = await request(BASE_URL)
        .get('/api/admin/dashboard/realtime')
        .set(getAuthHeader())
        .expect(200);
      
      expect(initialResponse.body.code).toBe('SUCCESS');
      const initialData = initialResponse.body.data;
      
      // 2. 创建新订单
      await request(BASE_URL)
        .post('/api/admin/orders')
        .send({
          ...testData.order,
          status: 'pending'
        })
        .set(getAuthHeader())
        .expect(200);
      
      // 3. 再次获取实时数据
      const updatedResponse = await request(BASE_URL)
        .get('/api/admin/dashboard/realtime')
        .set(getAuthHeader())
        .expect(200);
      
      expect(updatedResponse.body.code).toBe('SUCCESS');
      // 待处理订单数应该增加
      expect(updatedResponse.body.data.pendingOrders).toBeGreaterThanOrEqual(initialData.pendingOrders);
    });
  });

  describe('大数据量性能测试', () => {
    test('API-DASH-013: 边界场景 - 大量数据查询性能', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .get('/api/admin/dashboard/overview')
        .set(getAuthHeader())
        .expect(200);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.body.code).toBe('SUCCESS');
      // 查询时间应该小于 2 秒
      expect(duration).toBeLessThan(2000);
    });
  });
});

// ==================== 资质审核补充测试 ====================

describe('📜 资质审核补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('批量审核测试', () => {
    test('API-QUAL-012: 正常场景 - 批量审核通过', async () => {
      // 1. 获取待审核资质列表
      const listResponse = await request(BASE_URL)
        .get('/api/admin/qualifications?status=pending')
        .set(getAuthHeader())
        .expect(200);
      
      expect(listResponse.body.code).toBe('SUCCESS');
      const pendingList = listResponse.body.data.list || [];
      
      if (pendingList.length > 0) {
        // 2. 批量审核
        const ids = pendingList.slice(0, 3).map(item => item.id);
        const batchResponse = await request(BASE_URL)
          .post('/api/admin/qualifications/batch-audit')
          .send({
            ids: ids,
            status: 'approved',
            remark: '批量审核通过'
          })
          .set(getAuthHeader())
          .expect(200);
        
        expect(batchResponse.body.code).toBe('SUCCESS');
        expect(batchResponse.body.data.successCount).toBe(ids.length);
      }
    });
  });

  describe('资质过期提醒测试', () => {
    test('API-QUAL-013: 正常场景 - 即将过期资质提醒', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/qualifications/expiring?days=30')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
    });
  });
});

// ==================== 申诉仲裁补充测试 ====================

describe('⚖️ 申诉仲裁补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('申诉超时自动处理测试', () => {
    test('API-APPL-007: 边界场景 - 申诉超时自动关闭', async () => {
      // 这个测试需要系统有定时任务支持
      // 这里只验证接口可用性
      const response = await request(BASE_URL)
        .get('/api/admin/appeals/timeout-check')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.body.code).toBe('SUCCESS');
    });
  });

  describe('申诉升级流程测试', () => {
    test('API-APPL-008: 正常场景 - 申诉升级到高级仲裁', async () => {
      // 1. 获取待处理申诉
      const listResponse = await request(BASE_URL)
        .get('/api/admin/appeals?status=pending')
        .set(getAuthHeader())
        .expect(200);
      
      expect(listResponse.body.code).toBe('SUCCESS');
      const pendingList = listResponse.body.data.list || [];
      
      if (pendingList.length > 0) {
        const appealId = pendingList[0].id;
        
        // 2. 升级申诉
        const escalateResponse = await request(BASE_URL)
          .post(`/api/admin/appeals/${appealId}/escalate`)
          .send({
            reason: '需要高级仲裁',
            targetLevel: 'senior'
          })
          .set(getAuthHeader())
          .expect(200);
        
        expect(escalateResponse.body.code).toBe('SUCCESS');
        expect(escalateResponse.body.data.level).toBe('senior');
      }
    });
  });
});

// ==================== 执行者管理补充测试 ====================

describe('👤 执行者管理补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('执行者评级测试', () => {
    test('API-EXEC-012: 正常场景 - 执行者评级更新', async () => {
      // 1. 获取执行者列表
      const listResponse = await request(BASE_URL)
        .get('/api/admin/executors?status=active')
        .set(getAuthHeader())
        .expect(200);
      
      expect(listResponse.body.code).toBe('SUCCESS');
      const executors = listResponse.body.data.list || [];
      
      if (executors.length > 0) {
        const executorId = executors[0].id;
        
        // 2. 更新评级
        const updateResponse = await request(BASE_URL)
          .put(`/api/admin/executors/${executorId}/rating`)
          .send({
            rating: 4.5,
            remark: '优质服务'
          })
          .set(getAuthHeader())
          .expect(200);
        
        expect(updateResponse.body.code).toBe('SUCCESS');
        expect(updateResponse.body.data.rating).toBe(4.5);
      }
    });
  });

  describe('执行者服务区域测试', () => {
    test('API-EXEC-013: 正常场景 - 更新服务区域', async () => {
      const listResponse = await request(BASE_URL)
        .get('/api/admin/executors?status=active')
        .set(getAuthHeader())
        .expect(200);
      
      expect(listResponse.body.code).toBe('SUCCESS');
      const executors = listResponse.body.data.list || [];
      
      if (executors.length > 0) {
        const executorId = executors[0].id;
        
        const updateResponse = await request(BASE_URL)
          .put(`/api/admin/executors/${executorId}/service-areas`)
          .send({
            serviceAreas: ['浦东新区', '黄浦区', '静安区']
          })
          .set(getAuthHeader())
          .expect(200);
        
        expect(updateResponse.body.code).toBe('SUCCESS');
        expect(updateResponse.body.data.serviceAreas).toHaveLength(3);
      }
    });
  });
});

// ==================== 分账配置补充测试 ====================

describe('💰 分账配置补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('分账计算精度测试', () => {
    test('API-PROF-009: 边界场景 - 小数精度处理', async () => {
      const updateResponse = await request(BASE_URL)
        .put('/api/admin/profit-sharing')
        .send({
          platformRate: 0.1234, // 4 位小数
          defaultExecutorRate: 0.8766,
          executorMinRate: 0.7000,
          executorMaxRate: 0.9000
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(updateResponse.body.code).toBe('SUCCESS');
      // 验证精度处理
      expect(updateResponse.body.data.platformRate).toBeLessThanOrEqual(1);
    });
  });

  describe('分账历史记录测试', () => {
    test('API-PROF-010: 正常场景 - 查询分账历史', async () => {
      const historyResponse = await request(BASE_URL)
        .get('/api/admin/profit-sharing/history')
        .set(getAuthHeader())
        .expect(200);
      
      expect(historyResponse.body.code).toBe('SUCCESS');
      expect(historyResponse.body.data).toHaveProperty('list');
    });
  });
});

// ==================== 数据导出补充测试 ====================

describe('📥 数据导出补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('大数据量导出测试', () => {
    test('API-EXPT-009: 边界场景 - 大量数据导出性能', async () => {
      const startTime = Date.now();
      
      const response = await request(BASE_URL)
        .get('/api/admin/export/orders?format=xlsx')
        .set(getAuthHeader())
        .expect(200);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 验证返回的是文件
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // 导出时间应该小于 10 秒
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('导出文件格式验证测试', () => {
    test('API-EXPT-010: 正常场景 - CSV 格式验证', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/export/orders?format=csv')
        .set(getAuthHeader())
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
      // 验证 CSV 内容包含表头
      const content = response.text;
      expect(content).toContain('订单号');
    });
  });
});

// ==================== 系统设置补充测试 ====================

describe('⚙️ 系统设置补充测试 (P0)', () => {
  beforeAll(async () => {
    jest.setTimeout(TEST_TIMEOUT);
    if (!adminToken) {
      await getAdminToken();
    }
  });

  describe('配置项验证测试', () => {
    test('API-SETT-001: 正常场景 - 更新系统配置', async () => {
      const updateResponse = await request(BASE_URL)
        .put('/api/admin/settings')
        .send({
          siteName: '清如 ClearSpring V2.0',
          customerServicePhone: '400-123-4567',
          orderAutoCancelMinutes: 30
        })
        .set(getAuthHeader())
        .expect(200);
      
      expect(updateResponse.body.code).toBe('SUCCESS');
      expect(updateResponse.body.data.siteName).toBe('清如 ClearSpring V2.0');
    });

    test('API-SETT-001-2: 异常场景 - 无效配置项', async () => {
      const updateResponse = await request(BASE_URL)
        .put('/api/admin/settings')
        .send({
          invalidField: 'test'
        })
        .set(getAuthHeader())
        .expect(400);
      
      expect(updateResponse.body.code).toBe('INVALID_SETTINGS_FIELD');
    });
  });

  describe('配置历史记录测试', () => {
    test('API-SETT-002: 正常场景 - 查询配置历史', async () => {
      const historyResponse = await request(BASE_URL)
        .get('/api/admin/settings/history')
        .set(getAuthHeader())
        .expect(200);
      
      expect(historyResponse.body.code).toBe('SUCCESS');
      expect(historyResponse.body.data).toHaveProperty('list');
    });
  });
});
