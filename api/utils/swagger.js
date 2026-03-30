/**
 * Swagger 配置
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '清如 ClearSpring API 文档',
      version: '2.0.0',
      description: '清如 ClearSpring V2.0 后端 API 接口文档',
      contact: {
        name: 'ClearSpring Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '开发环境',
      },
      {
        url: 'https://api.clearspring.example.com/api',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token 认证',
        },
      },
      schemas: {
        // 通用响应
        Response: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: '响应码',
              example: 'SUCCESS',
            },
            data: {
              type: 'object',
              description: '响应数据',
            },
            message: {
              type: 'string',
              description: '响应消息',
              example: '操作成功',
            },
          },
        },
        
        // 错误响应
        ErrorResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: '错误码',
              example: 'USER_NOT_FOUND',
            },
            data: {
              type: 'null',
              description: '错误时 data 为 null',
            },
            message: {
              type: 'string',
              description: '错误消息',
              example: '用户不存在',
            },
          },
        },
        
        // 用户
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '用户 ID' },
            username: { type: 'string', description: '用户名' },
            email: { type: 'string', description: '邮箱' },
            phone: { type: 'string', description: '手机号' },
            role: { type: 'string', enum: ['user', 'admin', 'executor'], description: '角色' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        
        // 订单
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '订单 ID' },
            userId: { type: 'string', description: '用户 ID' },
            executorId: { type: 'string', description: '执行者 ID' },
            status: { type: 'string', enum: ['pending', 'grabbed', 'in_progress', 'completed', 'cancelled'], description: '订单状态' },
            title: { type: 'string', description: '订单标题' },
            description: { type: 'string', description: '订单描述' },
            reward: { type: 'number', description: '订单报酬' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          },
        },
        
        // 执行者
        Executor: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '执行者 ID' },
            userId: { type: 'string', description: '用户 ID' },
            qualificationStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: '资质状态' },
            status: { type: 'string', enum: ['available', 'busy', 'offline'], description: '在线状态' },
            completedOrders: { type: 'number', description: '完成订单数' },
            rating: { type: 'number', description: '评分' },
          },
        },
      },
    },
    tags: [
      { name: '用户', description: '用户相关接口' },
      { name: '订单', description: '订单相关接口' },
      { name: '执行者', description: '执行者相关接口' },
      { name: '内容', description: '内容管理接口' },
      { name: '管理', description: '管理后台接口' },
      { name: '认证', description: '认证相关接口' },
    ],
  },
  apis: [
    './routes/*.js',
    './routes/**/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
