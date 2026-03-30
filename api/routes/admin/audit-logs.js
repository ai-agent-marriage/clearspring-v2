/**
 * 管理端 - 操作日志接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { getDb } = require('../../server');
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
 * GET /api/admin/audit-logs
 * 操作日志列表
 * 查询参数：page, pageSize, type, userId, startDate, endDate, keyword
 */
router.get('/audit-logs', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const {
      page = 1,
      pageSize = 20,
      type,
      userId,
      startDate,
      endDate,
      keyword
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (userId) {
      query.userId = ObjectId(userId);
    }
    
    // 时间范围筛选
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    // 关键词搜索
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { username: keywordRegex },
        { targetUsername: keywordRegex }
      ];
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询日志列表
    const logs = await db.collection('audit_logs')
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('audit_logs').countDocuments(query);
    
    // 获取用户信息（批量）
    const userIds = logs
      .filter(log => log.userId)
      .map(log => log.userId);
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, nickName: 1, username: 1, avatarUrl: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        logs: logs.map(log => ({
          logId: log._id.toString(),
          type: log.type,
          typeName: getLogTypeName(log.type),
          userId: log.userId?.toString(),
          user: userMap[log.userId?.toString()] ? {
            userId: log.userId.toString(),
            nickName: userMap[log.userId.toString()].nickName || userMap[log.userId.toString()].username,
            avatarUrl: userMap[log.userId.toString()].avatarUrl
          } : null,
          username: log.username,
          targetUserId: log.targetUserId?.toString(),
          targetAdminId: log.targetAdminId?.toString(),
          targetUsername: log.targetUsername,
          orderId: log.orderId?.toString(),
          executorId: log.executorId?.toString(),
          certificateId: log.certificateId?.toString(),
          oldStatus: log.oldStatus,
          newStatus: log.newStatus,
          oldConfig: log.oldConfig,
          newConfig: log.newConfig,
          changes: log.changes,
          remark: log.remark,
          ip: log.ip,
          userAgent: log.userAgent,
          timestamp: log.timestamp
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
 * GET /api/admin/audit-logs/types
 * 获取日志类型列表
 */
router.get('/audit-logs/types', adminMiddleware, async (req, res, next) => {
  try {
    const logTypes = [
      { type: 'admin_login', name: '管理员登录' },
      { type: 'admin_logout', name: '管理员登出' },
      { type: 'admin_password_change', name: '修改密码' },
      { type: 'admin_create', name: '创建管理员' },
      { type: 'admin_update', name: '更新管理员' },
      { type: 'admin_delete', name: '删除管理员' },
      { type: 'admin_password_reset', name: '重置密码' },
      { type: 'admin_order_status_update', name: '订单状态更新' },
      { type: 'admin_order_delete', name: '订单删除' },
      { type: 'admin_qualification_audit', name: '资质审核' },
      { type: 'admin_executor_status_update', name: '执行者状态更新' },
      { type: 'admin_profit_sharing_update', name: '分账配置更新' },
      { type: 'admin_data_export', name: '数据导出' }
    ];
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        logTypes
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs/stats
 * 操作日志统计
 * 查询参数：startDate, endDate, groupBy (day/week/month)
 */
router.get('/audit-logs/stats', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query;
    
    // 默认查询最近 7 天
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const query = {
      timestamp: {
        $gte: startDate ? new Date(startDate) : defaultStart,
        $lte: endDate ? new Date(endDate) : now
      }
    };
    
    // 按类型统计
    const typeStats = await db.collection('audit_logs').aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // 按用户统计
    const userStats = await db.collection('audit_logs').aggregate([
      { $match: query },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          username: { $first: '$username' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // 按时间分组统计
    let timeStats = [];
    if (groupBy === 'day') {
      timeStats = await db.collection('audit_logs').aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
    } else if (groupBy === 'week') {
      timeStats = await db.collection('audit_logs').aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-W%V', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
    } else if (groupBy === 'month') {
      timeStats = await db.collection('audit_logs').aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
    }
    
    // 总数
    const total = await db.collection('audit_logs').countDocuments(query);
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        total,
        typeStats: typeStats.map(stat => ({
          type: stat._id,
          typeName: getLogTypeName(stat._id),
          count: stat.count
        })),
        userStats: userStats.map(stat => ({
          userId: stat._id?.toString(),
          username: stat.username,
          count: stat.count
        })),
        timeStats: timeStats.map(stat => ({
          period: stat._id,
          count: stat.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs/:id
 * 日志详情
 */
router.get('/audit-logs/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const logId = req.params.id;
    
    const log = await db.collection('audit_logs').findOne({
      _id: ObjectId(logId)
    });
    
    if (!log) {
      throw new AppError('日志不存在', 'LOG_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        log: {
          logId: log._id.toString(),
          type: log.type,
          typeName: getLogTypeName(log.type),
          userId: log.userId?.toString(),
          username: log.username,
          targetUserId: log.targetUserId?.toString(),
          targetAdminId: log.targetAdminId?.toString(),
          targetUsername: log.targetUsername,
          orderId: log.orderId?.toString(),
          executorId: log.executorId?.toString(),
          certificateId: log.certificateId?.toString(),
          oldStatus: log.oldStatus,
          newStatus: log.newStatus,
          oldConfig: log.oldConfig,
          newConfig: log.newConfig,
          changes: log.changes,
          remark: log.remark,
          ip: log.ip,
          userAgent: log.userAgent,
          timestamp: log.timestamp
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/audit-logs
 * 清空日志（需要超级管理员权限）
 * 查询参数：beforeDate（可选，清空该日期之前的日志）
 */
router.delete('/audit-logs', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const { beforeDate } = req.query;
    
    // 检查是否为超级管理员
    const admin = await db.collection('users').findOne({
      _id: ObjectId(req.user.userId)
    });
    
    if (!admin || !(admin.permissions?.includes('all') || admin.permissions?.includes('manage_logs'))) {
      throw new AppError('权限不足，需要超级管理员权限', 'FORBIDDEN', 403);
    }
    
    const query = {};
    if (beforeDate) {
      query.timestamp = { $lt: new Date(beforeDate) };
    }
    
    const result = await db.collection('audit_logs').deleteMany(query);
    
    res.json({
      code: 'SUCCESS',
      message: `已删除 ${result.deletedCount} 条日志`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// 工具函数：获取日志类型名称
function getLogTypeName(type) {
  const typeMap = {
    'admin_login': '管理员登录',
    'admin_logout': '管理员登出',
    'admin_password_change': '修改密码',
    'admin_create': '创建管理员',
    'admin_update': '更新管理员',
    'admin_delete': '删除管理员',
    'admin_password_reset': '重置密码',
    'admin_order_status_update': '订单状态更新',
    'admin_order_delete': '订单删除',
    'admin_qualification_audit': '资质审核',
    'admin_executor_status_update': '执行者状态更新',
    'admin_profit_sharing_update': '分账配置更新',
    'admin_data_export': '数据导出'
  };
  return typeMap[type] || type;
}

module.exports = router;
