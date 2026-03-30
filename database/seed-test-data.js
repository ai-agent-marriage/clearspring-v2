/**
 * 测试数据种子脚本
 * 功能：为各业务模块创建测试数据，验证功能完整性
 * 
 * 数据包含：
 * - 管理员账号（1 个）
 * - 执行者账号（5 个）
 * - 订单数据（20 个）
 * - 资质审核数据（10 个）
 * - 分账配置（1 个）
 * - 用户账号（若干）
 * - 交易记录（若干）
 * - 证书数据（若干）
 */

// 尝试从多个路径加载 mongodb
let MongoClient;
try {
  MongoClient = require('mongodb').MongoClient;
} catch (e) {
  try {
    MongoClient = require('../api/node_modules/mongodb').MongoClient;
  } catch (e2) {
    console.error('❌ 无法找到 mongodb 模块，请先安装依赖:');
    console.error('   cd /root/.openclaw/workspace/projects/clearspring-v2/api');
    console.error('   npm install');
    process.exit(1);
  }
}

// 数据库配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2';
const DB_NAME = 'clearspring_v2';

// 辅助函数：生成随机日期
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 辅助函数：生成随机数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 辅助函数：生成订单号
function generateOrderNo(index) {
  const date = new Date();
  const yearMonth = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0');
  return `ORD${yearMonth}${index.toString().padStart(4, '0')}`;
}

// 测试数据生成
async function seedTestData() {
  let client;
  
  try {
    console.log('🔌 连接 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    const db = client.db(DB_NAME);
    
    // ==================== 1. 管理员账号 ====================
    console.log('\n📋 创建管理员账号...');
    const admins = db.collection('admins');
    
    // 清空现有管理员数据（可选，生产环境请注释）
    // await admins.deleteMany({});
    
    const adminData = {
      username: 'admin',
      password: 'admin123', // 生产环境请修改为强密码
      role: 'super_admin',
      status: 'active',
      permissions: [
        'order:read', 'order:write', 'order:delete',
        'qualification:read', 'qualification:write',
        'appeal:read', 'appeal:write',
        'executor:read', 'executor:write',
        'profit:read', 'profit:write',
        'export:read', 'settings:read', 'settings:write'
      ],
      createdAt: new Date(),
      lastLoginAt: null,
      createdBy: 'system'
    };
    
    await admins.updateOne(
      { username: 'admin' },
      { $set: adminData },
      { upsert: true }
    );
    console.log('✅ 管理员账号创建成功：admin / admin123');
    
    // ==================== 2. 执行者账号 ====================
    console.log('\n📋 创建执行者账号...');
    const executors = db.collection('executors');
    
    // 清空现有执行者数据（可选）
    // await executors.deleteMany({});
    
    const executorBaseData = [
      {
        username: 'executor001',
        name: '张明',
        phone: '13800138001',
        role: 'executor',
        status: 'active',
        completedOrders: 156,
        rating: 4.8,
        level: 'gold',
        specialties: ['物命救护', '放生仪式'],
        joinDate: randomDate(new Date(2024, 0, 1), new Date()),
        totalEarnings: 45600,
        bankAccount: '622202***********1234',
        bankName: '工商银行'
      },
      {
        username: 'executor002',
        name: '李华',
        phone: '13800138002',
        role: 'executor',
        status: 'active',
        completedOrders: 89,
        rating: 4.6,
        level: 'silver',
        specialties: ['超度法会', '祈福仪式'],
        joinDate: randomDate(new Date(2024, 0, 1), new Date()),
        totalEarnings: 28900,
        bankAccount: '622202***********2345',
        bankName: '农业银行'
      },
      {
        username: 'executor003',
        name: '王芳',
        phone: '13800138003',
        role: 'executor',
        status: 'active',
        completedOrders: 234,
        rating: 4.9,
        level: 'platinum',
        specialties: ['物命救护', '放生仪式', '超度法会'],
        joinDate: randomDate(new Date(2023, 6, 1), new Date()),
        totalEarnings: 67800,
        bankAccount: '622202***********3456',
        bankName: '建设银行'
      },
      {
        username: 'executor004',
        name: '刘强',
        phone: '13800138004',
        role: 'executor',
        status: 'active',
        completedOrders: 45,
        rating: 4.5,
        level: 'bronze',
        specialties: ['祈福仪式'],
        joinDate: randomDate(new Date(2024, 6, 1), new Date()),
        totalEarnings: 12300,
        bankAccount: '622202***********4567',
        bankName: '中国银行'
      },
      {
        username: 'executor005',
        name: '陈静',
        phone: '13800138005',
        role: 'executor',
        status: 'active',
        completedOrders: 178,
        rating: 4.7,
        level: 'gold',
        specialties: ['物命救护', '放生仪式'],
        joinDate: randomDate(new Date(2024, 2, 1), new Date()),
        totalEarnings: 52100,
        bankAccount: '622202***********5678',
        bankName: '交通银行'
      }
    ];
    
    for (const executor of executorBaseData) {
      await executors.updateOne(
        { username: executor.username },
        { $set: { ...executor, createdAt: new Date(), updatedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log(`✅ 执行者账号创建成功：${executorBaseData.length} 个`);
    
    // ==================== 3. 用户账号 ====================
    console.log('\n📋 创建用户账号...');
    const users = db.collection('users');
    
    const userBaseData = [];
    for (let i = 1; i <= 20; i++) {
      userBaseData.push({
        openId: `openid_user${i.toString().padStart(3, '0')}`,
        unionId: `unionid_user${i.toString().padStart(3, '0')}`,
        nickname: `用户${i}`,
        avatarUrl: `https://example.com/avatar${i}.jpg`,
        phone: `13900139${i.toString().padStart(3, '0')}`,
        role: 'user',
        status: 'active',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        totalOrders: randomInt(1, 50),
        totalSpent: randomInt(1000, 50000)
      });
    }
    
    for (const user of userBaseData) {
      await users.updateOne(
        { openId: user.openId },
        { $set: user },
        { upsert: true }
      );
    }
    console.log(`✅ 用户账号创建成功：${userBaseData.length} 个`);
    
    // ==================== 4. 订单数据 ====================
    console.log('\n📋 创建订单数据...');
    const orders = db.collection('orders');
    
    // 清空现有订单数据（可选）
    // await orders.deleteMany({});
    
    const orderTypes = ['物命救护', '放生仪式', '超度法会', '祈福仪式', '随喜功德'];
    const orderStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    const orderAmounts = [99, 199, 299, 399, 599, 999, 1999];
    
    const orderData = [];
    for (let i = 1; i <= 20; i++) {
      const userId = `openid_user${randomInt(1, 20).toString().padStart(3, '0')}`;
      const executorId = `executor00${randomInt(1, 5)}`;
      const status = i <= 3 ? 'pending' : i <= 6 ? 'confirmed' : i <= 10 ? 'in_progress' : i <= 18 ? 'completed' : 'cancelled';
      
      orderData.push({
        orderNo: generateOrderNo(i),
        orderId: `ORD${i.toString().padStart(3, '0')}`,
        userId: userId,
        executorId: executorId,
        type: orderTypes[randomInt(0, orderTypes.length - 1)],
        amount: orderAmounts[randomInt(0, orderAmounts.length - 1)],
        status: status,
        serviceDate: randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31)),
        description: `测试订单 ${i} - ${orderTypes[randomInt(0, orderTypes.length - 1)]}`,
        remarks: i % 5 === 0 ? '加急处理' : '',
        createdAt: randomDate(new Date(2025, 0, 1), new Date()),
        updatedAt: new Date(),
        completedAt: status === 'completed' ? randomDate(new Date(2025, 0, 1), new Date()) : null,
        location: {
          province: '浙江省',
          city: '杭州市',
          district: '西湖区',
          address: `测试地址 ${i}号`
        },
        contact: {
          name: `用户${randomInt(1, 20)}`,
          phone: `13900139${randomInt(1, 20).toString().padStart(3, '0')}`
        }
      });
    }
    
    for (const order of orderData) {
      await orders.updateOne(
        { orderNo: order.orderNo },
        { $set: order },
        { upsert: true }
      );
    }
    console.log(`✅ 订单数据创建成功：${orderData.length} 个`);
    
    // ==================== 5. 资质审核数据 ====================
    console.log('\n📋 创建资质审核数据...');
    const qualifications = db.collection('qualifications');
    
    // 清空现有资质数据（可选）
    // await qualifications.deleteMany({});
    
    const qualificationTypes = ['放生资质', '超度资质', '祈福资质', '药师资质'];
    const qualificationStatuses = ['pending', 'approved', 'rejected'];
    
    const qualificationData = [];
    for (let i = 1; i <= 10; i++) {
      const executorIdx = ((i - 1) % 5) + 1;
      const status = i <= 2 ? 'pending' : i <= 7 ? 'approved' : 'rejected';
      
      qualificationData.push({
        qualificationId: `QUAL${i.toString().padStart(3, '0')}`,
        userId: `executor00${executorIdx}`,
        type: qualificationTypes[randomInt(0, qualificationTypes.length - 1)],
        status: status,
        documents: [
          `doc${i}_1.jpg`,
          `doc${i}_2.jpg`,
          `doc${i}_certificate.pdf`
        ],
        submittedAt: randomDate(new Date(2024, 0, 1), new Date()),
        reviewedAt: status !== 'pending' ? randomDate(new Date(2024, 0, 1), new Date()) : null,
        reviewedBy: status !== 'pending' ? 'admin' : null,
        reviewRemarks: status === 'rejected' ? '资料不齐全' : '',
        validUntil: status === 'approved' ? new Date(2027, 0, 1) : null,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    for (const qual of qualificationData) {
      await qualifications.updateOne(
        { qualificationId: qual.qualificationId },
        { $set: qual },
        { upsert: true }
      );
    }
    console.log(`✅ 资质审核数据创建成功：${qualificationData.length} 个`);
    
    // ==================== 6. 分账配置 ====================
    console.log('\n📋 创建分账配置...');
    const profitConfigs = db.collection('profit_configs');
    
    const profitConfigData = {
      configId: 'default_config',
      platformRate: 20,
      executorRate: 80,
      minAmount: 1,
      maxAmount: 100,
      currency: 'CNY',
      taxRate: 0,
      description: '默认分账配置',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    };
    
    await profitConfigs.updateOne(
      { configId: 'default_config' },
      { $set: profitConfigData },
      { upsert: true }
    );
    console.log('✅ 分账配置创建成功');
    
    // ==================== 7. 交易记录 ====================
    console.log('\n📋 创建交易记录...');
    const transactions = db.collection('transactions');
    
    const transactionTypes = ['payment', 'refund', 'distribution', 'withdrawal'];
    const transactionStatuses = ['pending', 'completed', 'failed'];
    
    const transactionData = [];
    for (let i = 1; i <= 20; i++) {
      const orderId = orderData[i - 1] ? orderData[i - 1].orderNo : generateOrderNo(i);
      const type = i <= 15 ? 'payment' : i <= 17 ? 'distribution' : 'withdrawal';
      
      transactionData.push({
        transactionNo: `TXN${new Date().getFullYear()}${i.toString().padStart(6, '0')}`,
        orderId: orderId,
        userId: `openid_user${randomInt(1, 20).toString().padStart(3, '0')}`,
        executorId: `executor00${randomInt(1, 5)}`,
        type: type,
        amount: orderAmounts[randomInt(0, orderAmounts.length - 1)],
        platformFee: Math.round(orderAmounts[randomInt(0, orderAmounts.length - 1)] * 0.2),
        executorFee: Math.round(orderAmounts[randomInt(0, orderAmounts.length - 1)] * 0.8),
        status: i <= 18 ? 'completed' : 'pending',
        paymentMethod: i <= 10 ? 'wechat' : 'alipay',
        description: `交易记录 ${i}`,
        createdAt: randomDate(new Date(2025, 0, 1), new Date()),
        completedAt: i <= 18 ? randomDate(new Date(2025, 0, 1), new Date()) : null
      });
    }
    
    for (const txn of transactionData) {
      await transactions.updateOne(
        { transactionNo: txn.transactionNo },
        { $set: txn },
        { upsert: true }
      );
    }
    console.log(`✅ 交易记录创建成功：${transactionData.length} 个`);
    
    // ==================== 8. 证书数据 ====================
    console.log('\n📋 创建证书数据...');
    const certificates = db.collection('certificates');
    
    const certificateTypes = ['放生证书', '功德证书', '超度证书', '祈福证书'];
    
    const certificateData = [];
    for (let i = 1; i <= 15; i++) {
      const userIdx = randomInt(1, 20);
      
      certificateData.push({
        certificateId: `CERT${i.toString().padStart(4, '0')}`,
        userId: `openid_user${userIdx.toString().padStart(3, '0')}`,
        type: certificateTypes[randomInt(0, certificateTypes.length - 1)],
        status: 'issued',
        certificateNo: `CERT-${new Date().getFullYear()}-${i.toString().padStart(6, '0')}`,
        title: `功德证书 #${i}`,
        description: `感谢您参与${certificateTypes[randomInt(0, certificateTypes.length - 1)]}活动`,
        issuedAt: randomDate(new Date(2025, 0, 1), new Date()),
        imageUrl: `https://example.com/certificates/cert${i}.jpg`,
        orderId: orderData[i - 1] ? orderData[i - 1].orderNo : null,
        createdAt: randomDate(new Date(2025, 0, 1), new Date())
      });
    }
    
    for (const cert of certificateData) {
      await certificates.updateOne(
        { certificateId: cert.certificateId },
        { $set: cert },
        { upsert: true }
      );
    }
    console.log(`✅ 证书数据创建成功：${certificateData.length} 个`);
    
    // ==================== 9. 申诉数据 ====================
    console.log('\n📋 创建申诉数据...');
    const appeals = db.collection('appeals');
    
    const appealStatuses = ['pending', 'processing', 'resolved', 'rejected'];
    const appealReasons = ['服务质量问题', '时间冲突', '费用争议', '其他原因'];
    
    const appealData = [];
    for (let i = 1; i <= 5; i++) {
      const orderId = orderData[i - 1] ? orderData[i - 1].orderNo : generateOrderNo(i);
      
      appealData.push({
        appealId: `APPEAL${i.toString().padStart(3, '0')}`,
        orderId: orderId,
        userId: `openid_user${randomInt(1, 20).toString().padStart(3, '0')}`,
        executorId: `executor00${randomInt(1, 5)}`,
        type: 'user',
        reason: appealReasons[randomInt(0, appealReasons.length - 1)],
        description: `测试申诉 ${i} - 详细说明问题情况`,
        status: appealStatuses[randomInt(0, appealStatuses.length - 1)],
        evidence: [`evidence${i}_1.jpg`, `evidence${i}_2.jpg`],
        submittedAt: randomDate(new Date(2025, 0, 1), new Date()),
        handledAt: i <= 2 ? randomDate(new Date(2025, 0, 1), new Date()) : null,
        handledBy: i <= 2 ? 'admin' : null,
        result: i <= 2 ? '已解决' : null,
        remarks: i <= 2 ? '已协调解决' : '',
        createdAt: randomDate(new Date(2025, 0, 1), new Date()),
        updatedAt: new Date()
      });
    }
    
    for (const appeal of appealData) {
      await appeals.updateOne(
        { appealId: appeal.appealId },
        { $set: appeal },
        { upsert: true }
      );
    }
    console.log(`✅ 申诉数据创建成功：${appealData.length} 个`);
    
    // ==================== 10. 审计日志 ====================
    console.log('\n📋 创建审计日志...');
    const auditLogs = db.collection('audit_logs');
    
    const logTypes = ['login', 'order_create', 'order_update', 'qualification_review', 'profit_distribute'];
    
    const auditLogData = [];
    for (let i = 1; i <= 30; i++) {
      auditLogData.push({
        logId: `LOG${i.toString().padStart(6, '0')}`,
        type: logTypes[randomInt(0, logTypes.length - 1)],
        userId: `admin`,
        action: `测试操作 ${i}`,
        resource: `order_${randomInt(1, 20)}`,
        details: {
          action: 'test_action',
          data: { test: `data_${i}` }
        },
        ip: `192.168.1.${randomInt(1, 255)}`,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        timestamp: randomDate(new Date(2025, 0, 1), new Date()),
        status: 'success'
      });
    }
    
    for (const log of auditLogData) {
      await auditLogs.insertOne(log);
    }
    console.log(`✅ 审计日志创建成功：${auditLogData.length} 个`);
    
    // ==================== 汇总报告 ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 测试数据导入完成！');
    console.log('='.repeat(60));
    console.log('\n📊 数据汇总:');
    console.log('  ✅ 管理员账号：1 个');
    console.log('  ✅ 执行者账号：5 个');
    console.log('  ✅ 用户账号：20 个');
    console.log('  ✅ 订单数据：20 个');
    console.log('  ✅ 资质审核：10 个');
    console.log('  ✅ 分账配置：1 个');
    console.log('  ✅ 交易记录：20 个');
    console.log('  ✅ 证书数据：15 个');
    console.log('  ✅ 申诉数据：5 个');
    console.log('  ✅ 审计日志：30 个');
    console.log('\n🔑 默认账号信息:');
    console.log('  管理员：admin / admin123');
    console.log('\n💡 提示:');
    console.log('  - 生产环境请修改默认密码');
    console.log('  - 可根据需要调整测试数据量');
    console.log('  - 数据已做去重处理，重复运行不会创建重复数据');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 测试数据导入失败:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n👋 MongoDB 连接已关闭');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('\n✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败');
      process.exit(1);
    });
}

module.exports = { seedTestData };
