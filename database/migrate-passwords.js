/**
 * 密码迁移脚本
 * 功能：将 admins 集合中的明文密码迁移为 bcrypt 加密密码
 * 
 * 使用方法：
 * 1. 备份数据库
 * 2. 执行：node migrate-passwords.js
 * 3. 验证迁移结果
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// 数据库配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2';
const DB_NAME = 'clearspring_v2';

// 默认管理员密码
const DEFAULT_PASSWORDS = {
  'admin': 'admin123',
  'operator': 'operator123',
  'auditor': 'auditor123'
};

async function migratePasswords() {
  let client;
  
  try {
    console.log('🔌 连接 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    const db = client.db(DB_NAME);
    const adminsCollection = db.collection('admins');
    
    // 查询所有包含明文密码的管理员
    const adminsWithPlainPassword = await adminsCollection.find({
      password: { $exists: true },
      passwordHash: { $exists: false }
    }).toArray();
    
    if (adminsWithPlainPassword.length === 0) {
      console.log('\n✅ 无需迁移，所有管理员密码已加密');
      return;
    }
    
    console.log(`\n📋 发现 ${adminsWithPlainPassword.length} 个管理员需要迁移密码`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const admin of adminsWithPlainPassword) {
      try {
        const username = admin.username;
        
        // 确定密码（使用默认密码或保留原有密码）
        let passwordToHash = admin.password;
        if (DEFAULT_PASSWORDS[username] && admin.password === DEFAULT_PASSWORDS[username]) {
          console.log(`  ℹ️  管理员 ${username} 使用默认密码`);
        }
        
        // 生成 bcrypt 加密密码
        const passwordHash = await bcrypt.hash(passwordToHash, 10);
        
        // 更新数据库
        await adminsCollection.updateOne(
          { _id: admin._id },
          {
            $set: {
              passwordHash: passwordHash,
              passwordChangedAt: new Date(),
              updatedAt: new Date()
            },
            $unset: {
              password: ""
            }
          }
        );
        
        console.log(`  ✅ ${username} - 密码已加密`);
        migratedCount++;
        
      } catch (error) {
        console.error(`  ❌ ${admin.username} - 迁移失败：${error.message}`);
        skippedCount++;
      }
    }
    
    console.log('\n🎉 密码迁移完成！');
    console.log(`  ✅ 成功迁移：${migratedCount} 个`);
    console.log(`  ⏭️  跳过：${skippedCount} 个`);
    console.log('\n🔒 所有密码已使用 bcrypt 加密存储（salt rounds = 10）');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
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
  migratePasswords()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migratePasswords };
