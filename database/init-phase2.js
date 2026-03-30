/**
 * 清如 ClearSpring V2.0 - Phase 2 内容生态数据库初始化
 * 初始化 5 个数据库集合：
 * - wiki_contents - 百科内容
 * - meditation_courses - 冥想课程
 * - meditation_records - 冥想记录
 * - ritual_contents - 仪轨内容
 * - ritual_progress - 学习进度
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2';
const DB_NAME = 'clearspring_v2';

async function initializeDatabase() {
  let client;
  
  try {
    console.log('🔌 连接 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    const db = client.db(DB_NAME);
    
    // 1. 创建 wiki_contents 集合
    console.log('\n📚 初始化 wiki_contents (百科内容)...');
    await db.createCollection('wiki_contents');
    
    const wikiCollection = db.collection('wiki_contents');
    await wikiCollection.createIndex({ title: 1 }, { unique: true });
    await wikiCollection.createIndex({ category: 1 });
    await wikiCollection.createIndex({ status: 1 });
    await wikiCollection.createIndex({ createdAt: -1 });
    
    // 插入示例数据
    await wikiCollection.insertMany([
      {
        title: '冥想入门指南',
        category: 'meditation',
        content: '冥想是一种简单而强大的练习...',
        tags: ['冥想', '入门', '健康'],
        coverImage: '',
        status: 'published',
        viewCount: 0,
        likeCount: 0,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '仪轨学习基础',
        category: 'ritual',
        content: '仪轨是传统文化的重要组成部分...',
        tags: ['仪轨', '传统文化', '学习'],
        coverImage: '',
        status: 'published',
        viewCount: 0,
        likeCount: 0,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('✅ wiki_contents 初始化完成');
    
    // 2. 创建 meditation_courses 集合
    console.log('\n🧘 初始化 meditation_courses (冥想课程)...');
    await db.createCollection('meditation_courses');
    
    const meditationCoursesCollection = db.collection('meditation_courses');
    await meditationCoursesCollection.createIndex({ category: 1 });
    await meditationCoursesCollection.createIndex({ level: 1 });
    await meditationCoursesCollection.createIndex({ order: 1 });
    await meditationCoursesCollection.createIndex({ status: 1 });
    
    // 插入示例数据
    await meditationCoursesCollection.insertMany([
      {
        title: '清晨唤醒冥想',
        description: '5 分钟清晨冥想，帮助你唤醒身体，开启充满活力的一天',
        category: 'morning',
        level: 'beginner',
        duration: 5,
        audioUrl: '',
        coverImage: '',
        instructor: '清如导师',
        playCount: 0,
        likeCount: 0,
        order: 1,
        status: 'published',
        createdAt: new Date()
      },
      {
        title: '午间放松冥想',
        description: '10 分钟午间冥想，释放上午的压力，恢复精力',
        category: 'relaxation',
        level: 'beginner',
        duration: 10,
        audioUrl: '',
        coverImage: '',
        instructor: '清如导师',
        playCount: 0,
        likeCount: 0,
        order: 2,
        status: 'published',
        createdAt: new Date()
      },
      {
        title: '深度睡眠冥想',
        description: '20 分钟睡前冥想，帮助你深度放松，进入优质睡眠',
        category: 'sleep',
        level: 'intermediate',
        duration: 20,
        audioUrl: '',
        coverImage: '',
        instructor: '清如导师',
        playCount: 0,
        likeCount: 0,
        order: 3,
        status: 'published',
        createdAt: new Date()
      }
    ]);
    console.log('✅ meditation_courses 初始化完成');
    
    // 3. 创建 meditation_records 集合
    console.log('\n📝 初始化 meditation_records (冥想记录)...');
    await db.createCollection('meditation_records');
    
    const meditationRecordsCollection = db.collection('meditation_records');
    await meditationRecordsCollection.createIndex({ userId: 1 });
    await meditationRecordsCollection.createIndex({ courseId: 1 });
    await meditationRecordsCollection.createIndex({ completedAt: -1 });
    await meditationRecordsCollection.createIndex({ userId: 1, completedAt: -1 });
    console.log('✅ meditation_records 初始化完成');
    
    // 4. 创建 ritual_contents 集合
    console.log('\n📖 初始化 ritual_contents (仪轨内容)...');
    await db.createCollection('ritual_contents');
    
    const ritualContentsCollection = db.collection('ritual_contents');
    await ritualContentsCollection.createIndex({ category: 1 });
    await ritualContentsCollection.createIndex({ level: 1 });
    await ritualContentsCollection.createIndex({ order: 1 });
    await ritualContentsCollection.createIndex({ status: 1 });
    
    // 插入示例数据
    await ritualContentsCollection.insertMany([
      {
        title: '晨间感恩仪轨',
        description: '通过感恩练习，培养积极心态，开启美好的一天',
        category: 'daily',
        level: 'beginner',
        steps: [
          { order: 1, title: '静心准备', description: '找一个安静的地方，深呼吸 3 次' },
          { order: 2, title: '感恩回顾', description: '回想过去 24 小时内值得感恩的 3 件事' },
          { order: 3, title: '表达感谢', description: '在心中或大声表达对这些人事物的感谢' },
          { order: 4, title: '设定意图', description: '为今天设定一个积极的意图' }
        ],
        estimatedDuration: 10,
        coverImage: '',
        instructor: '清如导师',
        learnCount: 0,
        completedCount: 0,
        likeCount: 0,
        order: 1,
        status: 'published',
        createdAt: new Date()
      },
      {
        title: '晚间反思仪轨',
        description: '通过晚间反思，整理一天的经历，获得成长与平静',
        category: 'daily',
        level: 'beginner',
        steps: [
          { order: 1, title: '静心准备', description: '找一个安静的地方，深呼吸 3 次' },
          { order: 2, title: '回顾一天', description: '回想今天发生的 3 件重要事情' },
          { order: 3, title: '学习总结', description: '从今天的经历中学到了什么' },
          { order: 4, title: '放下释怀', description: '放下今天的烦恼和遗憾' }
        ],
        estimatedDuration: 15,
        coverImage: '',
        instructor: '清如导师',
        learnCount: 0,
        completedCount: 0,
        likeCount: 0,
        order: 2,
        status: 'published',
        createdAt: new Date()
      }
    ]);
    console.log('✅ ritual_contents 初始化完成');
    
    // 5. 创建 ritual_progress 集合
    console.log('\n📊 初始化 ritual_progress (学习进度)...');
    await db.createCollection('ritual_progress');
    
    const ritualProgressCollection = db.collection('ritual_progress');
    await ritualProgressCollection.createIndex({ userId: 1 });
    await ritualProgressCollection.createIndex({ ritualId: 1 });
    await ritualProgressCollection.createIndex({ userId: 1, ritualId: 1 }, { unique: true });
    await ritualProgressCollection.createIndex({ completed: 1 });
    await ritualProgressCollection.createIndex({ updatedAt: -1 });
    console.log('✅ ritual_progress 初始化完成');
    
    console.log('\n✅✅✅ 数据库初始化全部完成！');
    console.log('\n集合列表:');
    console.log('  📚 wiki_contents - 百科内容');
    console.log('  🧘 meditation_courses - 冥想课程');
    console.log('  📝 meditation_records - 冥想记录');
    console.log('  📖 ritual_contents - 仪轨内容');
    console.log('  📊 ritual_progress - 学习进度');
    
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
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };
