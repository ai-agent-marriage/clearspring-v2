/**
 * 管理端 - 执行者管理接口
 */

const express = require('express');

const { validate, updateExecutorStatusSchema, idParamSchema } = require('../../validators/admin.validator');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const server = require('../../server');
const { ObjectId } = require('mongodb');
const logger = require('../../utils/logger');



/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // 检查是否为管理员（支持 admin 和 super_admin）
    const adminRoles = ['admin', 'super_admin'];
    if (!adminRoles.includes(req.user?.role)) {
      return next(new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403));
    }
    
    next();
  });
};

/**
 * GET /api/admin/executors
 * 执行者列表
 * 查询参数：page, pageSize, status, keyword, serviceType
 */
router.get('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      page = 1,
      pageSize = 20,
      status,
      keyword,
      serviceType
    } = req.query;
    
    // 构建查询条件
    const query = { role: 'executor' };
    
    if (status) {
      query.status = status; // active, inactive, banned
    }
    
    // 关键词搜索（昵称、手机号）
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { nickName: keywordRegex },
        { phone: keywordRegex }
      ];
    }
    
    // 服务类型筛选
    if (serviceType) {
      query.serviceTypes = serviceType;
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询执行者列表
    const executors = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('users').countDocuments(query);
    
    // 统计每个执行者的订单数据
    const executorIds = executors.map(e => e._id);
    
    const orderStats = await db.collection('orders').aggregate([
      {
        $match: {
          executorId: { $in: executorIds }
        }
      },
      {
        $group: {
          _id: '$executorId',
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    const statsMap = {};
    orderStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        executors: executors.map(executor => {
          const stats = statsMap[executor._id.toString()] || {
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
          };
          
          // 计算平均评分
          const rating = executor.rating || 0;
          
          return {
            executorId: executor._id.toString(),
            openId: executor.openId,
            nickName: executor.nickName,
            avatarUrl: executor.avatarUrl,
            phone: executor.phone,
            gender: executor.gender,
            city: executor.city,
            province: executor.province,
            status: executor.status,
            rating: rating,
            serviceTypes: executor.serviceTypes || [],
            serviceAreas: executor.serviceAreas || [],
            bio: executor.bio || '',
            totalOrders: stats.totalOrders,
            completedOrders: stats.completedOrders,
            cancelledOrders: stats.cancelledOrders,
            completionRate: stats.totalOrders > 0 
              ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(2)
              : 0,
            createdAt: executor.createdAt,
            lastLoginAt: executor.lastLoginAt
          };
        }),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/executor/:id/status
 * 执行者状态更新
 * Body: status (active/inactive/banned), remark
 */
router.put('/:id/status', adminMiddleware, validate(idParamSchema, 'params'), validate(updateExecutorStatusSchema, 'body'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const executorId = req.params.id;
    const { status, remark } = req.body;
    
    // 验证状态
    const validStatuses = ['active', 'inactive', 'banned'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError('无效的状态', 'INVALID_STATUS', 400);
    }
    
    // 检查执行者是否存在
    const executor = await db.collection('users').findOne({
      _id: new ObjectId(executorId),
      role: 'executor'
    });
    
    if (!executor) {
      throw new AppError('执行者不存在', 'EXECUTOR_NOT_FOUND', 404);
    }
    
    // 更新状态
    const updateData = {
      status: status || executor.status,
      updatedAt: new Date()
    };
    
    if (remark) {
      updateData.statusRemark = remark;
      updateData.statusUpdatedAt = new Date();
    }
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(executorId) },
      { $set: updateData }
    );
    
    // 如果状态变为 banned，强制下线（可选：在这里添加 Redis 清理逻辑）
    if (status === 'banned') {
      // 可以在这里添加清理逻辑，比如清除 Redis session
      logger.info(`执行者 ${executorId} 已被禁用`);
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_executor_status_update',
      userId: req.user.userId,
      executorId: new ObjectId(executorId),
      oldStatus: executor.status,
      newStatus: status || executor.status,
      remark: remark || '',
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        executorId,
        status: status || executor.status,
        updatedAt: new Date()
      },
      message: '执行者状态已更新'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
