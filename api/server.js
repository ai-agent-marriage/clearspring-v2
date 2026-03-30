/**
 * 清如 ClearSpring V2.0 - Express API 服务器
 * 部署环境：火山云服务器 (101.96.192.63:3000)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const Redis = require('redis');

// 加载环境变量
dotenv.config();

// 导入路由
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const executorRoutes = require('./routes/executor');

// 中间件导入
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
let db;
let redisClient;

// MongoDB 连接
async function connectMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/clearspring_v2');
    await client.connect();
    db = client.db('clearspring_v2');
    console.log('✅ MongoDB 连接成功');
    return db;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    throw error;
  }
}

// Redis 连接
async function connectRedis() {
  try {
    redisClient = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    });
    
    redisClient.on('error', (err) => console.error('Redis 错误:', err));
    await redisClient.connect();
    console.log('✅ Redis 连接成功');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis 连接失败:', error);
    // Redis 可选，不阻断启动
  }
}

// 路由注册
app.use('/api/user', userRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/executor', executorRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'clearspring-v2-api',
    version: '2.0.0'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: '接口不存在'
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    await connectMongoDB();
    await connectRedis();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 监听地址：http://0.0.0.0:${PORT}`);
      console.log(`🌍 环境：${process.env.NODE_ENV || 'development'}`);
      console.log(`\n可用接口:`);
      console.log(`  用户接口:`);
      console.log(`    POST   /api/user/login`);
      console.log(`    GET    /api/user/profile`);
      console.log(`    PUT    /api/user/profile`);
      console.log(`  订单接口:`);
      console.log(`    POST   /api/order/create`);
      console.log(`    GET    /api/order/list`);
      console.log(`    GET    /api/order/detail/:id`);
      console.log(`    POST   /api/order/cancel`);
      console.log(`  执行者接口:`);
      console.log(`    GET    /api/executor/list`);
      console.log(`    GET    /api/executor/detail/:id`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 导出 db 和 redis 客户端供路由使用
module.exports = { app, getDb: () => db, getRedis: () => redisClient };

// 启动
startServer();
