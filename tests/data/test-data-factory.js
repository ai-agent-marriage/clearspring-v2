/**
 * 清如 ClearSpring V2.0 - 测试数据工厂
 * 
 * 提供测试所需的各类数据生成
 */

const faker = {
  // 生成随机字符串
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // 生成随机邮箱
  randomEmail: () => {
    return `test_${faker.randomString(8)}@example.com`;
  },
  
  // 生成随机手机号
  randomPhone: () => {
    const prefix = ['138', '139', '136', '137', '135', '158', '159', '188', '187', '182'];
    const prefixChoice = prefix[Math.floor(Math.random() * prefix.length)];
    return prefixChoice + faker.randomString(8);
  },
  
  // 生成随机日期
  randomDate: (start = new Date(2026, 0, 1), end = new Date(2026, 11, 31)) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },
  
  // 生成随机 ID（MongoDB ObjectId 格式）
  randomObjectId: () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// 管理员测试数据
const adminData = {
  // 有效管理员
  valid: {
    username: 'admin',
    password: 'admin123'
  },
  
  // 无效管理员（账号错误）
  invalidUsername: {
    username: 'wrong_admin_' + faker.randomString(5),
    password: 'admin123'
  },
  
  // 无效管理员（密码错误）
  invalidPassword: {
    username: 'admin',
    password: 'wrong_' + faker.randomString(5)
  },
  
  // 空账号
  emptyUsername: {
    username: '',
    password: 'admin123'
  },
  
  // 空密码
  emptyPassword: {
    username: 'admin',
    password: ''
  }
};

// 订单测试数据
const orderData = {
  // 有效订单
  valid: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100,
    quantity: 1,
    remark: '测试订单'
  },
  
  // 缺少必填字段
  missingServiceType: {
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100
  },
  
  // 缺少服务名称
  missingServiceName: {
    serviceType: 'cleaning',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100
  },
  
  // 无效价格（负数）
  invalidPrice: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: -100,
    quantity: 1
  },
  
  // 无效数量（0）
  invalidQuantity: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100,
    quantity: 0
  },
  
  // 边界值 - 最小价格
  minPrice: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 0.01,
    quantity: 1
  },
  
  // 边界值 - 最大价格
  maxPrice: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 999999.99,
    quantity: 1
  },
  
  // 边界值 - 最大数量
  maxQuantity: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100,
    quantity: 9999
  }
};

// 执行者测试数据
const executorData = {
  // 有效执行者
  valid: {
    nickName: '测试执行者_' + faker.randomString(5),
    phone: faker.randomPhone(),
    serviceTypes: ['cleaning', 'maintenance'],
    serviceAreas: ['上海市', '浦东新区'],
    bio: '专业执行者，5 年经验'
  },
  
  // 状态更新数据
  statusActive: {
    status: 'active',
    remark: '激活执行者'
  },
  
  statusInactive: {
    status: 'inactive',
    remark: '暂时休息'
  },
  
  statusBanned: {
    status: 'banned',
    remark: '违规操作'
  },
  
  // 无效状态
  invalidStatus: {
    status: 'invalid_status_' + faker.randomString(5),
    remark: '无效状态'
  }
};

// 资质审核测试数据
const qualificationData = {
  // 有效资质
  valid: {
    type: 'health_cert',
    certificateNo: 'CERT-' + faker.randomString(10),
    certificateName: '健康证书',
    issueDate: '2026-01-01',
    expiryDate: '2027-01-01'
  },
  
  // 审核通过
  approve: {
    status: 'approved',
    auditRemark: '审核通过'
  },
  
  // 审核驳回（有原因）
  reject: {
    status: 'rejected',
    rejectReason: '照片模糊，无法辨认',
    auditRemark: '请重新上传清晰照片'
  },
  
  // 审核驳回（无原因 - 用于测试验证）
  rejectNoReason: {
    status: 'rejected',
    rejectReason: ''
  },
  
  // 无效状态
  invalidStatus: {
    status: 'invalid_' + faker.randomString(5)
  }
};

// 分账配置测试数据
const profitSharingData = {
  // 有效配置
  valid: {
    platformRate: 0.10,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80,
    minOrderAmount: 10,
    maxOrderAmount: 10000
  },
  
  // 平台比例超限
  invalidPlatformRate: {
    platformRate: 1.5,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80
  },
  
  // 执行者比例超限（负数）
  invalidExecutorMinRate: {
    platformRate: 0.10,
    executorMinRate: -0.1,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80
  },
  
  // 比例总和超限
  invalidRateSum: {
    platformRate: 0.5,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.6
  },
  
  // 边界值 - 平台比例 0
  zeroPlatformRate: {
    platformRate: 0,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80
  },
  
  // 边界值 - 平台比例 1
  maxPlatformRate: {
    platformRate: 1,
    executorMinRate: 0,
    executorMaxRate: 0,
    defaultExecutorRate: 0
  }
};

// 分页参数测试数据
const paginationData = {
  // 默认分页
  default: {
    page: 1,
    pageSize: 20
  },
  
  // 第一页
  firstPage: {
    page: 1,
    pageSize: 10
  },
  
  // 大页码
  largePage: {
    page: 99999,
    pageSize: 20
  },
  
  // 大页大小
  largePageSize: {
    page: 1,
    pageSize: 1000
  },
  
  // 负数页码
  negativePage: {
    page: -1,
    pageSize: 20
  },
  
  // 负数页大小
  negativePageSize: {
    page: 1,
    pageSize: -10
  }
};

// 时间范围测试数据
const timeRangeData = {
  // 最近 7 天
  last7Days: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  
  // 最近 30 天
  last30Days: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  
  // 本月
  thisMonth: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  
  // 未来时间
  future: {
    startDate: '2030-01-01',
    endDate: '2030-12-31'
  },
  
  // 过去时间
  past: {
    startDate: '2020-01-01',
    endDate: '2020-12-31'
  },
  
  // 结束时间早于开始时间
  invalidRange: {
    startDate: '2026-12-31',
    endDate: '2026-01-01'
  }
};

// Token 测试数据
const tokenData = {
  // 无 Token
  none: null,
  
  // 有效 Token（动态获取）
  valid: null, // 运行时设置
  
  // 格式错误
  invalidFormat: 'invalid_token_format',
  
  // 过期 Token
  expired: 'expired_token_' + faker.randomString(10),
  
  // 被篡改的 Token
  tampered: 'Bearer tampered_' + faker.randomString(20),
  
  // 普通用户 Token（无管理员权限）
  normalUser: 'user_token_' + faker.randomString(10)
};

// 搜索关键词测试数据
const searchData = {
  // 有效关键词
  valid: '测试',
  
  // 空关键词
  empty: '',
  
  // 特殊字符
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  
  // SQL 注入尝试
  sqlInjection: "'; DROP TABLE users; --",
  
  // XSS 尝试
  xss: '<script>alert("xss")</script>',
  
  // 超长关键词
  long: faker.randomString(500),
  
  // 不存在的关键词
  notFound: '不存在的关键词_' + faker.randomString(10)
};

// 导出所有测试数据
module.exports = {
  faker,
  adminData,
  orderData,
  executorData,
  qualificationData,
  profitSharingData,
  paginationData,
  timeRangeData,
  tokenData,
  searchData
};
