/**
 * 订单接口路由
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { getDb, getRedis } = require('../server');
const { ObjectId } = require('mongodb');

/**
 * POST /api/order/create
 * 创建订单
 */
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    
    const {
      serviceType,
      serviceName,
      serviceDate,
      location,
      price,
      quantity = 1,
      remark,
      executorId
    } = req.body;
    
    // 参数验证
    if (!serviceType || !serviceName || !serviceDate || !price) {
      throw new AppError('缺少必填参数', 'MISSING_PARAMS', 400);
    }
    
    // 生成订单号
    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // 创建订单
    const order = {
      orderNo,
      userId: ObjectId(userId),
      serviceType,
      serviceName,
      serviceDate: new Date(serviceDate),
      location: location || '',
      price: parseFloat(price),
      quantity: parseInt(quantity),
      totalPrice: parseFloat(price) * parseInt(quantity),
      status: 'pending', // pending, paid, grabbed, completed, cancelled
      paymentStatus: 'unpaid',
      executorId: executorId ? ObjectId(executorId) : null,
      grabTime: null,
      paidAt: null,
      completedAt: null,
      cancelledAt: null,
      remark: remark || '',
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    res.json({
      code: 'SUCCESS',
      message: '订单创建成功',
      data: {
        order: {
          orderId: result.insertedId.toString(),
          orderNo: order.orderNo,
          serviceType: order.serviceType,
          serviceName: order.serviceName,
          serviceDate: order.serviceDate,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/order/list
 * 订单列表
 */
router.get('/list', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    const { status, page = 1, pageSize = 10 } = req.query;
    
    // 构建查询条件
    const query = { userId: ObjectId(userId) };
    if (status) {
      query.status = status;
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询订单
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('orders').countDocuments(query);
    
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
          totalPrice: order.totalPrice,
          status: order.status,
          paymentStatus: order.paymentStatus,
          executorName: order.executorName,
          createdAt: order.createdAt,
          grabTime: order.grabTime
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
 * GET /api/order/detail/:id
 * 订单详情
 */
router.get('/detail/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const order = await db.collection('orders').findOne({
      _id: ObjectId(orderId),
      userId: ObjectId(userId)
    });
    
    if (!order) {
      throw new AppError('订单不存在', 'ORDER_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        order: {
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
          executorId: order.executorId?.toString(),
          executorName: order.executorName,
          grabTime: order.grabTime,
          paidAt: order.paidAt,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          remark: order.remark,
          evidence: order.evidence,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/order/cancel
 * 取消订单
 */
router.post('/cancel', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    const { orderId, reason } = req.body;
    
    if (!orderId) {
      throw new AppError('缺少订单 ID', 'MISSING_ORDER_ID', 400);
    }
    
    const order = await db.collection('orders').findOne({
      _id: ObjectId(orderId),
      userId: ObjectId(userId)
    });
    
    if (!order) {
      throw new AppError('订单不存在', 'ORDER_NOT_FOUND', 404);
    }
    
    // 只有 pending 或 paid 状态的订单可以取消
    if (!['pending', 'paid'].includes(order.status)) {
      throw new AppError('当前状态无法取消订单', 'ORDER_CANNOT_CANCEL', 400);
    }
    
    // 更新订单状态
    await db.collection('orders').updateOne(
      { _id: ObjectId(orderId) },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: reason || '',
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      code: 'SUCCESS',
      message: '订单已取消',
      data: {
        orderId,
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
