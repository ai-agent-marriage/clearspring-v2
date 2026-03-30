/**
 * 创建初始管理员账户脚本
 */

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const logger = require('../utils/logger');

async function createInitialAdmin() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2');
    await client.connect();
    logger.info('MongoDB 连接成功');
    
    const db = client.db('clearspring_v2');
    
    // 检查是否已存在管理员
    const existingAdmin = await db.collection('admins').findOne({ username: 'admin' });
    if (existingAdmin) {
      logger.warn('管理员账户已存在');
      await client.close();
      return;
    }
    
    // 创建管理员账户
    const admin = {
      username: 'admin',
      password: 'admin123', // 简单密码，生产环境应该加密
      role: 'super_admin',
      permissions: ['*'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('admins').insertOne(admin);
    logger.info('初始管理员账户创建成功', { username: 'admin', password: 'admin123' });
    logger.warn('请在生产环境中立即修改密码！');
    
    await client.close();
  } catch (error) {
    logger.error('创建管理员失败', { error: error.message });
    process.exit(1);
  }
}

createInitialAdmin();
