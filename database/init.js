/**
 * 数据库初始化脚本
 * 功能：创建 6 个核心集合及索引
 */

const { MongoClient } = require('mongodb');

// 数据库配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2';
const DB_NAME = 'clearspring_v2';

async function initDatabase() {
  let client;
  
  try {
    console.log('🔌 连接 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    const db = client.db(DB_NAME);
    
    // 1. users 集合 - 用户表
    console.log('\n📋 初始化 users 集合...');
    await db.createCollection('users');
    const users = db.collection('users');
    
    await users.createIndex({ openId: 1 }, { unique: true });
    await users.createIndex({ unionId: 1 }, { sparse: true });
    await users.createIndex({ role: 1, status: 1 });
    await users.createIndex({ phone: 1 }, { sparse: true });
    await users.createIndex({ createdAt: -1 });
    
    console.log('✅ users 集合创建成功，索引已建立');
    
    // 2. orders 集合 - 订单表
    console.log('\n📋 初始化 orders 集合...');
    await db.createCollection('orders');
    const orders = db.collection('orders');
    
    await orders.createIndex({ orderNo: 1 }, { unique: true });
    await orders.createIndex({ userId: 1, createdAt: -1 });
    await orders.createIndex({ executorId: 1, status: 1 });
    await orders.createIndex({ status: 1, serviceDate: 1 });
    await orders.createIndex({ createdAt: -1 });
    
    console.log('✅ orders 集合创建成功，索引已建立');
    
    // 3. evidence 集合 - 证据表
    console.log('\n📋 初始化 evidence 集合...');
    await db.createCollection('evidence');
    const evidence = db.collection('evidence');
    
    await evidence.createIndex({ uploadId: 1 }, { unique: true });
    await evidence.createIndex({ openId: 1, createdAt: -1 });
    await evidence.createIndex({ orderId: 1 });
    await evidence.createIndex({ status: 1 });
    
    console.log('✅ evidence 集合创建成功，索引已建立');
    
    // 4. certificates 集合 - 证书表
    console.log('\n📋 初始化 certificates 集合...');
    await db.createCollection('certificates');
    const certificates = db.collection('certificates');
    
    await certificates.createIndex({ userId: 1 });
    await certificates.createIndex({ type: 1, status: 1 });
    await certificates.createIndex({ certificateNo: 1 }, { unique: true, sparse: true });
    await certificates.createIndex({ createdAt: -1 });
    
    console.log('✅ certificates 集合创建成功，索引已建立');
    
    // 5. transactions 集合 - 交易表
    console.log('\n📋 初始化 transactions 集合...');
    await db.createCollection('transactions');
    const transactions = db.collection('transactions');
    
    await transactions.createIndex({ transactionNo: 1 }, { unique: true });
    await transactions.createIndex({ orderId: 1 });
    await transactions.createIndex({ userId: 1, createdAt: -1 });
    await transactions.createIndex({ status: 1, type: 1 });
    await transactions.createIndex({ createdAt: -1 });
    
    console.log('✅ transactions 集合创建成功，索引已建立');
    
    // 6. audit_logs 集合 - 审计日志表
    console.log('\n📋 初始化 audit_logs 集合...');
    await db.createCollection('audit_logs');
    const auditLogs = db.collection('audit_logs');
    
    await auditLogs.createIndex({ type: 1, timestamp: -1 });
    await auditLogs.createIndex({ userId: 1, timestamp: -1 });
    await auditLogs.createIndex({ orderId: 1 });
    await auditLogs.createIndex({ timestamp: -1 }, { expireAfterSeconds: 7776000 }); // 90 天后自动过期
    
    console.log('✅ audit_logs 集合创建成功，索引已建立');
    
    // 创建 locks 集合（用于分布式锁）
    console.log('\n📋 初始化 locks 集合（分布式锁）...');
    await db.createCollection('locks');
    const locks = db.collection('locks');
    
    await locks.createIndex({ key: 1 }, { unique: true });
    await locks.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    
    console.log('✅ locks 集合创建成功，索引已建立');
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n集合列表:');
    console.log('  1. users - 用户表');
    console.log('  2. orders - 订单表');
    console.log('  3. evidence - 证据表');
    console.log('  4. certificates - 证书表');
    console.log('  5. transactions - 交易表');
    console.log('  6. audit_logs - 审计日志表');
    console.log('  7. locks - 分布式锁（系统用）');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
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
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
