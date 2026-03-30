/**
 * 管理端 - 数据统计接口（Dashboard）
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const server = require('../../server');
const { ObjectId } = require('mongodb');



/**
 * 管理员权限中间件
 */
const adminMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/overview
 * 概览数据
 * 查询参数：startDate, endDate（默认最近 7 天）
 */
router.get('/overview', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { startDate, endDate } = req.query;
    
    // 默认查询最近 7 天
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const timeRange = {
      $gte: startDate ? new Date(startDate) : defaultStart,
      $lte: endDate ? new Date(endDate) : now
    };
    
    // 订单统计
    const orderStats = await db.collection('orders').aggregate([
      { $match: { createdAt: timeRange } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          grabbedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'grabbed'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // 用户统计
    const userStats = await db.collection('users').aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newUsers: {
            $sum: { $cond: [{ $gte: ['$createdAt', timeRange.$gte] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // 执行者统计
    const executorStats = await db.collection('users').aggregate([
      {
        $match: { role: 'executor' }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const executorMap = {};
    executorStats.forEach(stat => {
      executorMap[stat._id] = stat.count;
    });
    
    // 资质审核统计
    const qualificationStats = await db.collection('certificates').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const qualificationMap = {};
    qualificationStats.forEach(stat => {
      qualificationMap[stat._id] = stat.count;
    });
    
    // 收入统计（分账后平台收入）
    const revenueStats = await db.collection('orders').aggregate([
      { 
        $match: { 
          status: 'completed',
          completedAt: timeRange
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          platformRevenue: { 
            $sum: { $multiply: ['$totalPrice', 0.1] } // 假设平台抽成 10%
          }
        }
      }
    ]).toArray();
    
    const stats = orderStats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      grabbedOrders: 0
    };
    
    const users = userStats[0] || {
      totalUsers: 0,
      newUsers: 0
    };
    
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      platformRevenue: 0
    };
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        overview: {
          orders: {
            total: stats.totalOrders || 0,
            totalAmount: stats.totalAmount || 0,
            completed: stats.completedOrders || 0,
            cancelled: stats.cancelledOrders || 0,
            pending: stats.pendingOrders || 0,
            paid: stats.paidOrders || 0,
            grabbed: stats.grabbedOrders || 0,
            completionRate: stats.totalOrders > 0 
              ? ((stats.completedOrders || 0) / stats.totalOrders * 100).toFixed(2)
              : 0
          },
          users: {
            total: users.totalUsers || 0,
            newUsers: users.newUsers || 0
          },
          executors: {
            active: executorMap['active'] || 0,
            inactive: executorMap['inactive'] || 0,
            banned: executorMap['banned'] || 0,
            total: (executorMap['active'] || 0) + (executorMap['inactive'] || 0) + (executorMap['banned'] || 0)
          },
          qualifications: {
            pending: qualificationMap['pending'] || 0,
            approved: qualificationMap['approved'] || 0,
            rejected: qualificationMap['rejected'] || 0,
            total: (qualificationMap['pending'] || 0) + (qualificationMap['approved'] || 0) + (qualificationMap['rejected'] || 0)
          },
          revenue: {
            total: revenue.totalRevenue || 0,
            platform: revenue.platformRevenue || 0
          }
        },
        timeRange: {
          startDate: timeRange.$gte.toISOString(),
          endDate: timeRange.$lte.toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/dashboard/orders-trend
 * 订单趋势（按天/周/月）
 * 查询参数：startDate, endDate, groupBy (day/week/month)
 */
router.get('/orders-trend', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query;
    
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const timeRange = {
      $gte: startDate ? new Date(startDate) : defaultStart,
      $lte: endDate ? new Date(endDate) : now
    };
    
    let dateFormat;
    if (groupBy === 'week') {
      dateFormat = '%Y-W%V';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    } else {
      dateFormat = '%Y-%m-%d';
    }
    
    // 按时间分组统计订单
    const trend = await db.collection('orders').aggregate([
      { $match: { createdAt: timeRange } },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        trend: trend.map(item => ({
          period: item._id,
          totalOrders: item.totalOrders,
          totalAmount: item.totalAmount,
          completedOrders: item.completedOrders,
          cancelledOrders: item.cancelledOrders
        })),
        groupBy,
        timeRange: {
          startDate: timeRange.$gte.toISOString(),
          endDate: timeRange.$lte.toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/dashboard/service-types
 * 服务类型分布
 */
router.get('/service-types', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { startDate, endDate } = req.query;
    
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const query = { createdAt: { $gte: startDate ? new Date(startDate) : defaultStart, $lte: now } };
    
    const serviceTypes = await db.collection('orders').aggregate([
      { $match: query },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
          avgAmount: { $avg: '$totalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const total = serviceTypes.reduce((sum, item) => sum + item.count, 0);
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        serviceTypes: serviceTypes.map(item => ({
          type: item._id,
          count: item.count,
          percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : 0,
          totalAmount: item.totalAmount,
          avgAmount: item.avgAmount?.toFixed(2) || 0
        })),
        total
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/dashboard/executors-ranking
 * 执行者排行
 * 查询参数：startDate, endDate, limit (默认 10)
 */
router.get('/executors-ranking', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      startDate,
      endDate,
      limit = 10
    } = req.query;
    
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const timeRange = {
      $gte: startDate ? new Date(startDate) : defaultStart,
      $lte: endDate ? new Date(endDate) : now
    };
    
    // 按执行者统计订单
    const ranking = await db.collection('orders').aggregate([
      { 
        $match: { 
          executorId: { $exists: true },
          status: 'completed',
          completedAt: timeRange
        } 
      },
      {
        $group: {
          _id: '$executorId',
          completedOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { completedOrders: -1 } },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    // 获取执行者信息
    const executorIds = ranking.map(item => new ObjectId(item._id));
    const executors = await db.collection('users')
      .find({ _id: { $in: executorIds } })
      .project({ _id: 1, nickName: 1, avatarUrl: 1, phone: 1, rating: 1 })
      .toArray();
    
    const executorMap = {};
    executors.forEach(executor => {
      executorMap[executor._id.toString()] = executor;
    });
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        ranking: ranking.map((item, index) => {
          const executor = executorMap[item._id.toString()] || {};
          return {
            rank: index + 1,
            executorId: item._id.toString(),
            nickName: executor.nickName || '未知',
            avatarUrl: executor.avatarUrl,
            phone: executor.phone,
            rating: executor.rating || 0,
            completedOrders: item.completedOrders,
            totalAmount: item.totalAmount
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/dashboard/realtime
 * 实时数据
 */
router.get('/realtime', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const now = new Date();
    
    // 今日统计
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 今日订单
    const todayOrders = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          amount: { $sum: '$totalPrice' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // 当前进行中订单
    const activeOrders = await db.collection('orders').countDocuments({
      status: { $in: ['paid', 'grabbed'] }
    });
    
    // 待审核资质
    const pendingQualifications = await db.collection('certificates').countDocuments({
      status: 'pending'
    });
    
    // 在线执行者（最近 30 分钟有活动）
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const onlineExecutors = await db.collection('users').countDocuments({
      role: 'executor',
      status: 'active',
      lastLoginAt: { $gte: thirtyMinutesAgo }
    });
    
    const today = todayOrders[0] || { total: 0, amount: 0, completed: 0 };
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        realtime: {
          today: {
            orders: today.total,
            amount: today.amount,
            completed: today.completed
          },
          activeOrders,
          pendingQualifications,
          onlineExecutors,
          timestamp: now.toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
