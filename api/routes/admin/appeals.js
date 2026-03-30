/**
 * 管理端 - 申诉仲裁接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { ObjectId } = require('mongodb');

/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // 检查是否为管理员
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return next(new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403));
    }
    
    next();
  });
};

/**
 * GET /api/admin/appeals
 * 申诉列表
 * 查询参数：page, pageSize, status, type
 */
router.get('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      page = 1,
      pageSize = 20,
      status,
      type
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (status) {
      query.status = status; // pending, processing, resolved, rejected
    }
    
    if (type) {
      query.type = type;
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询申诉列表
    const appeals = await db.collection('appeals')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('appeals').countDocuments(query);
    
    // 统计状态
    const stats = await db.collection('appeals').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const statsMap = {};
    stats.forEach(s => {
      statsMap[s._id] = s.count;
    });
    
    // 获取用户信息（批量）
    const userIds = appeals
      .filter(a => a.userId)
      .map(a => a.userId);
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, nickName: 1, phone: 1, avatarUrl: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // 获取订单信息（批量）
    const orderIds = appeals
      .filter(a => a.orderId)
      .map(a => new ObjectId(a.orderId));
    
    const orders = await db.collection('orders')
      .find({ _id: { $in: orderIds } })
      .project({ _id: 1, orderNo: 1, serviceType: 1, totalPrice: 1 })
      .toArray();
    
    const orderMap = {};
    orders.forEach(order => {
      orderMap[order._id.toString()] = order;
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        list: appeals.map(appeal => ({
          appealId: appeal._id.toString(),
          orderId: appeal.orderId?.toString(),
          order: orderMap[appeal.orderId?.toString()] ? {
            orderNo: orderMap[appeal.orderId.toString()].orderNo,
            serviceType: orderMap[appeal.orderId.toString()].serviceType,
            totalPrice: orderMap[appeal.orderId.toString()].totalPrice
          } : null,
          userId: appeal.userId?.toString(),
          user: userMap[appeal.userId?.toString()] ? {
            nickName: userMap[appeal.userId.toString()].nickName,
            phone: userMap[appeal.userId.toString()].phone,
            avatarUrl: userMap[appeal.userId.toString()].avatarUrl
          } : null,
          type: appeal.type, // service_dispute, quality_complaint, refund_request, other
          reason: appeal.reason,
          evidence: appeal.evidence || [],
          status: appeal.status, // pending, processing, resolved, rejected
          arbitrationResult: appeal.arbitrationResult || '',
          arbitrationRemark: appeal.arbitrationRemark || '',
          arbitratedBy: appeal.arbitratedBy?.toString(),
          arbitratedAt: appeal.arbitratedAt,
          createdAt: appeal.createdAt,
          updatedAt: appeal.updatedAt
        })),
        stats: {
          pending: statsMap['pending'] || 0,
          processed: (statsMap['resolved'] || 0) + (statsMap['rejected'] || 0),
          total: total,
          supportRate: total > 0 ? ((statsMap['resolved'] || 0) / total * 100).toFixed(2) : 0
        },
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
 * GET /api/admin/appeals/:id
 * 申诉详情
 */
router.get('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const appealId = req.params.id;
    
    const appeal = await db.collection('appeals').findOne({
      _id: new ObjectId(appealId)
    });
    
    if (!appeal) {
      throw new AppError('申诉不存在', 'NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      data: {
        appeal
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/appeals/:id/arbitrate
 * 仲裁处理
 * Body: status, arbitrationResult, arbitrationRemark
 */
router.put('/:id/arbitrate', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const appealId = req.params.id;
    const { status, arbitrationResult, arbitrationRemark } = req.body;
    
    // 验证状态
    if (!['resolved', 'rejected'].includes(status)) {
      throw new AppError('无效的状态，只能是 resolved 或 rejected', 'INVALID_STATUS', 400);
    }
    
    // 检查申诉是否存在
    const appeal = await db.collection('appeals').findOne({
      _id: new ObjectId(appealId)
    });
    
    if (!appeal) {
      throw new AppError('申诉不存在', 'NOT_FOUND', 404);
    }
    
    // 检查是否已经仲裁过
    if (appeal.status !== 'pending' && appeal.status !== 'processing') {
      throw new AppError('该申诉已经处理过', 'APPEAL_ALREADY_PROCESSED', 400);
    }
    
    // 构建更新内容
    const updateData = {
      status,
      arbitrationResult,
      arbitrationRemark,
      arbitratedBy: new ObjectId(req.user.userId),
      arbitratedAt: new Date(),
      updatedAt: new Date()
    };
    
    // 更新申诉状态
    await db.collection('appeals').updateOne(
      { _id: new ObjectId(appealId) },
      { $set: updateData }
    );
    
    // 如果申诉涉及订单，更新订单状态
    if (appeal.orderId && status === 'resolved') {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(appeal.orderId) },
        {
          $set: {
            appealStatus: 'resolved',
            appealResult: arbitrationResult,
            updatedAt: new Date()
          }
        }
      );
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_appeal_arbitrate',
      userId: req.user.userId,
      appealId: new ObjectId(appealId),
      oldStatus: appeal.status,
      newStatus: status,
      arbitrationResult: arbitrationResult || '',
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        appealId,
        status,
        arbitratedAt: new Date()
      },
      message: status === 'resolved' ? '仲裁完成' : '已驳回'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/appeals/:id/status
 * 更新申诉状态
 * Body: status (processing)
 */
router.put('/:id/status', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const appealId = req.params.id;
    const { status } = req.body;
    
    if (status !== 'processing') {
      throw new AppError('只能更新为 processing 状态', 'INVALID_STATUS', 400);
    }
    
    await db.collection('appeals').updateOne(
      { _id: new ObjectId(appealId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      code: 'SUCCESS',
      data: {
        appealId,
        status
      },
      message: '状态已更新'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
