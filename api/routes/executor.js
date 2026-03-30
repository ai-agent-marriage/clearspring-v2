/**
 * 执行者接口路由
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// 数据库连接通过 req.app.get 获取
const { ObjectId } = require('mongodb');

/**
 * GET /api/executor/list
 * 执行者列表
 */
router.get('/list', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { status, page = 1, pageSize = 10 } = req.query;
    
    // 构建查询条件
    const query = { role: 'executor' };
    if (status) {
      query.status = status;
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询执行者
    const executors = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('users').countDocuments(query);
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        executors: executors.map(executor => ({
          executorId: executor._id.toString(),
          openId: executor.openId,
          nickName: executor.nickName,
          avatarUrl: executor.avatarUrl,
          phone: executor.phone,
          gender: executor.gender,
          city: executor.city,
          province: executor.province,
          status: executor.status,
          rating: executor.rating || 0,
          completedCount: executor.completedCount || 0,
          createdAt: executor.createdAt
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/executor/detail/:id
 * 执行者详情
 */
router.get('/detail/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const executorId = req.params.id;
    
    const executor = await db.collection('users').findOne({
      _id: ObjectId(executorId),
      role: 'executor'
    });
    
    if (!executor) {
      throw new AppError('执行者不存在', 'EXECUTOR_NOT_FOUND', 404);
    }
    
    // 统计完成的订单数
    const completedCount = await db.collection('orders').countDocuments({
      executorId: ObjectId(executorId),
      status: 'completed'
    });
    
    // 计算平均评分
    const ratingStats = await db.collection('orders').aggregate([
      {
        $match: {
          executorId: ObjectId(executorId),
          status: 'completed',
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const avgRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        executor: {
          executorId: executor._id.toString(),
          openId: executor.openId,
          nickName: executor.nickName,
          avatarUrl: executor.avatarUrl,
          phone: executor.phone,
          gender: executor.gender,
          city: executor.city,
          province: executor.province,
          country: executor.country,
          status: executor.status,
          rating: avgRating,
          completedCount: completedCount,
          serviceAreas: executor.serviceAreas || [],
          serviceTypes: executor.serviceTypes || [],
          bio: executor.bio || '',
          certificates: executor.certificates || [],
          createdAt: executor.createdAt,
          lastLoginAt: executor.lastLoginAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
