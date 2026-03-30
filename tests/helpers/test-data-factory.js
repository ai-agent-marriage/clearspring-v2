/**
 * 测试数据工厂
 * 生成各种测试场景所需的数据
 */

/**
 * 管理员测试数据
 */
const adminData = {
  valid: {
    username: 'admin',
    password: 'admin123'
  },
  invalid: {
    username: 'invalid_admin',
    password: 'wrong_password'
  },
  empty: {
    username: '',
    password: ''
  }
};

/**
 * 订单测试数据
 */
const orderData = {
  valid: {
    serviceType: 'cleaning',
    serviceName: '家庭保洁',
    serviceDate: '2026-04-15T10:00:00+08:00',
    location: '上海市浦东新区',
    price: 100,
    quantity: 1,
    remark: '测试订单'
  },
  invalid: {
    serviceType: '',
    serviceName: '',
    price: -100
  },
  missingFields: {
    serviceType: 'cleaning'
    // 缺少其他必填字段
  }
};

/**
 * 执行者测试数据
 */
const executorData = {
  valid: {
    userId: 'test_user_id',
    realName: '张三',
    idCard: '310101199001011234',
    phone: '13800138000',
    skillTags: ['cleaning', 'cooking'],
    experience: '5 年家政经验'
  },
  invalid: {
    realName: '',
    idCard: 'invalid_id',
    phone: '123456'
  }
};

/**
 * 分润配置测试数据
 */
const profitSharingData = {
  valid: {
    platformRate: 0.10,
    executorMinRate: 0.70,
    executorMaxRate: 0.90,
    defaultExecutorRate: 0.80,
    minOrderAmount: 10,
    maxOrderAmount: 10000
  },
  invalid: {
    platformRate: 1.5, // 超过 1
    executorMinRate: -0.1 // 负数
  }
};

/**
 * 内容测试数据
 */
const contentData = {
  wiki: {
    title: '测试 Wiki',
    content: '测试内容',
    category: 'guide'
  },
  meditation: {
    title: '冥想课程',
    duration: 600,
    level: 'beginner'
  },
  ritual: {
    title: '仪式内容',
    type: 'daily',
    steps: ['步骤 1', '步骤 2', '步骤 3']
  }
};

/**
 * 用户测试数据
 */
const userData = {
  valid: {
    nickName: '测试用户',
    phone: '13800138000',
    avatarUrl: 'https://example.com/avatar.png'
  },
  invalid: {
    phone: '123456', // 格式错误
    email: 'invalid_email'
  }
};

module.exports = {
  adminData,
  orderData,
  executorData,
  profitSharingData,
  contentData,
  userData,
};
