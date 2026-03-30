/**
 * 管理端 - 订单管理接口
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
    // 先通过基础认证
    await authMiddleware(req, res, () => {});
    
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders
 * 订单列表（分页/筛选）
 * 查询参数：page, pageSize, status, paymentStatus, serviceType, startDate, endDate, keyword
 */
router.get('/orders', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const {
      page = 1,
      pageSize = 20,
      status,
      paymentStatus,
      serviceType,
      startDate,
      endDate,
      keyword
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    // 时间范围筛选
    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) {
        query.serviceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.serviceDate.$lte = new Date(endDate);
      }
    }
    
    // 关键词搜索（订单号、服务名称、用户手机号）
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { orderNo: keywordRegex },
        { serviceName: keywordRegex },
        { location: keywordRegex }
      ];
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询订单列表
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('orders').countDocuments(query);
    
    // 获取用户信息（批量）
    const userIds = orders
      .filter(o => o.userId)
      .map(o => o.userId);
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // 获取执行者信息（批量）
    const executorIds = orders
      .filter(o => o.executorId)
      .map(o => o.executorId);
    
    const executors = await db.collection('users')
      .find({ _id: { $in: executorIds } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const executorMap = {};
    executors.forEach(executor => {
      executorMap[executor._id.toString()] = executor;
    });
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        orders: orders.map(order => ({
          orderId: order._id.toString(),
          orderNo: order.orderNo,
          serviceType: order.serviceType,
          serviceName: order.serviceName,
          serviceDate: order.serviceDate,
          location: order.location,
          price: order.price,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          status: order.status,
          paymentStatus: order.paymentStatus,
          user: userMap[order.userId?.toString()] ? {
            userId: order.userId.toString(),
            nickName: userMap[order.userId.toString()].nickName,
            phone: userMap[order.userId.toString()].phone
          } : null,
          executor: executorMap[order.executorId?.toString()] ? {
            executorId: order.executorId.toString(),
            nickName: executorMap[order.executorId.toString()].nickName,
            phone: executorMap[order.executorId.toString()].phone
          } : null,
          grabTime: order.grabTime,
          paidAt: order.paidAt,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
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
 * PUT /api/admin/order/:id/status
 * 订单状态更新
 * Body: status, remark
 */
router.put('/order/:id/status', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const orderId = req.params.id;
    const { status, remark } = req.body;
    
    // 验证状态
    const validStatuses = ['pending', 'paid', 'grabbed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError('无效的订单状态', 'INVALID_STATUS', 400);
    }
    
    // 检查订单是否存在
    const order = await db.collection('orders').findOne({
      _id: ObjectId(orderId)
    });
    
    if (!order) {
      throw new AppError('订单不存在', 'ORDER_NOT_FOUND', 404);
    }
    
    // 构建更新内容
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) {
      updateData.status = status;
      
      // 根据状态设置对应时间
      if (status === 'paid') {
        updateData.paidAt = new Date();
      } else if (status === 'grabbed') {
        updateData.grabTime = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
    }
    
    if (remark) {
      updateData.adminRemark = remark;
    }
    
    // 更新订单
    await db.collection('orders').updateOne(
      { _id: ObjectId(orderId) },
      { $set: updateData }
    );
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_order_status_update',
      userId: req.user.userId,
      orderId: ObjectId(orderId),
      oldStatus: order.status,
      newStatus: status || order.status,
      remark: remark || '',
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '订单状态已更新',
      data: {
        orderId,
        status: status || order.status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/order/:id
 * 订单删除
 */
router.delete('/order/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const orderId = req.params.id;
    
    // 检查订单是否存在
    const order = await db.collection('orders').findOne({
      _id: ObjectId(orderId)
    });
    
    if (!order) {
      throw new AppError('订单不存在', 'ORDER_NOT_FOUND', 404);
    }
    
    // 只有 cancelled 状态的订单可以删除
    if (order.status !== 'cancelled') {
      throw new AppError('只能删除已取消的订单', 'ORDER_CANNOT_DELETE', 400);
    }
    
    // 删除订单
    await db.collection('orders').deleteOne({
      _id: ObjectId(orderId)
    });
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_order_delete',
      userId: req.user.userId,
      orderId: ObjectId(orderId),
      orderNo: order.orderNo,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '订单已删除',
      data: {
        orderId,
        orderNo: order.orderNo,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
