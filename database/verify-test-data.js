/**
 * 数据验证脚本
 * 功能：验证测试数据是否正确导入
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

async function verifyData() {
  let client;
  
  try {
    logger.info('🔌 连接 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    logger.info('✅ MongoDB 连接成功\n');
    
    const db = client.db(DB_NAME);
    
    // 验证各集合数据
    const collections = [
      { name: 'admins', label: '管理员账号' },
      { name: 'executors', label: '执行者账号' },
      { name: 'users', label: '用户账号' },
      { name: 'orders', label: '订单数据' },
      { name: 'qualifications', label: '资质审核' },
      { name: 'profit_configs', label: '分账配置' },
      { name: 'transactions', label: '交易记录' },
      { name: 'certificates', label: '证书数据' },
      { name: 'appeals', label: '申诉数据' },
      { name: 'audit_logs', label: '审计日志' }
    ];
    
    logger.info('📊 数据验证结果:\n');
    logger.info('集合名称\t\t\t记录数\t状态');
    logger.info('─'.repeat(60));
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        const status = count > 0 ? '✅' : '⚠️';
        logger.info(`${collection.label}\t\t\t${count}\t${status}`);
      } catch (error) {
        logger.info(`${collection.label}\t\t\t0\t❌ (集合不存在)`);
      }
    }
    
    logger.info('─'.repeat(60));
    
    // 抽样验证
    logger.info('\n🔍 抽样验证:\n');
    
    // 验证管理员
    const admin = await db.collection('admins').findOne({ username: 'admin' });
    if (admin) {
      logger.info('✅ 管理员账号验证通过');
      logger.info(`   用户名：${admin.username}`);
      logger.info(`   角色：${admin.role}`);
      logger.info(`   状态：${admin.status}`);
    }
    
    // 验证执行者
    const executorCount = await db.collection('executors').countDocuments();
    if (executorCount >= 5) {
      logger.info(`\n✅ 执行者账号验证通过 (${executorCount} 个)`);
      const executor = await db.collection('executors').findOne({ username: 'executor001' });
      if (executor) {
        logger.info(`   示例：${executor.username} (${executor.name})`);
        logger.info(`   完成订单：${executor.completedOrders}`);
        logger.info(`   评分：${executor.rating}`);
      }
    }
    
    // 验证订单
    const orderCount = await db.collection('orders').countDocuments();
    if (orderCount >= 20) {
      logger.info(`\n✅ 订单数据验证通过 (${orderCount} 个)`);
      const order = await db.collection('orders').findOne({ status: 'completed' });
      if (order) {
        logger.info(`   示例订单：${order.orderNo}`);
        logger.info(`   类型：${order.type}`);
        logger.info(`   金额：¥${order.amount}`);
      }
    }
    
    // 验证资质审核
    const qualCount = await db.collection('qualifications').countDocuments();
    if (qualCount >= 10) {
      logger.info(`\n✅ 资质审核数据验证通过 (${qualCount} 个)`);
    }
    
    // 验证分账配置
    const profitConfig = await db.collection('profit_configs').findOne({ configId: 'default_config' });
    if (profitConfig) {
      logger.info(`\n✅ 分账配置验证通过`);
      logger.info(`   平台分成：${profitConfig.platformRate}%`);
      logger.info(`   执行者分成：${profitConfig.executorRate}%`);
    }
    
    logger.info('\n' + '='.repeat(60));
    logger.info('🎉 数据验证完成！');
    logger.info('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 数据验证失败:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      logger.info('\n👋 MongoDB 连接已关闭');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  verifyData()
    .then(() => {
      logger.info('\n✅ 验证脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 验证脚本执行失败');
      process.exit(1);
    });
}

module.exports = { verifyData };
