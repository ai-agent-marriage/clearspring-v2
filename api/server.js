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
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');

// 中间件导入
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Swagger 文档
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = require('./utils/logger');

// 基础中间件
app.use(helmet());

// CORS 配置 - 允许 PC 管理后台访问
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://101.96.192.63:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
    
    // 设置到 app 对象，供路由使用
    app.set('db', db);
    
    logger.info('MongoDB 连接成功');
    return db;
  } catch (error) {
    logger.error('MongoDB 连接失败', { error: error.message });
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
    
    redisClient.on('error', (err) => logger.error('Redis 错误', { error: err.message }));
    await redisClient.connect();
    logger.info('Redis 连接成功');
    return redisClient;
  } catch (error) {
    logger.error('Redis 连接失败', { error: error.message });
    // Redis 可选，不阻断启动
  }
}

// 路由注册
app.use('/api/user', userRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/executor', executorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '清如 ClearSpring API 文档',
}));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'clearspring-v2-api',
    version: '2.0.0'
  });
});

// 404 处理 - 统一返回 200 + 业务错误码
app.use((req, res) => {
  res.status(200).json({
    code: 'NOT_FOUND',
    message: '接口不存在',
    data: null
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
      logger.info('服务器启动成功');
      logger.info(`监听地址：http://0.0.0.0:${PORT}`);
      logger.info(`环境：${process.env.NODE_ENV || 'development'}`);
      logger.info('可用接口列表', {
        user: ['POST /api/user/login', 'GET /api/user/profile', 'PUT /api/user/profile'],
        order: ['POST /api/order/create', 'GET /api/order/list', 'GET /api/order/detail/:id', 'POST /api/order/cancel'],
        executor: ['GET /api/executor/list', 'GET /api/executor/detail/:id'],
        admin: ['GET /api/admin/orders', 'PUT /api/admin/order/:id/status', 'DELETE /api/admin/order/:id']
      });
    });
  } catch (error) {
    logger.error('服务器启动失败', { error: error.message });
    process.exit(1);
  }
}

// 启动
startServer();

// 导出 app 和获取 db 的函数供路由使用
module.exports = { 
  app, 
  getDb: () => db, 
  getRedis: () => redisClient 
};
