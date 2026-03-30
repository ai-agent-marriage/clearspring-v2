/**
 * 云函数：createOrder
 * 功能：创建订单（调用火山云 HTTP API）
 * 部署环境：微信云开发 cloud1-7ga68ls3ccebbe5b
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const axios = require('axios');

// 火山云 API 地址
const VOLCANE_API_BASE = 'http://101.96.192.63:3000/api';

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  try {
    const {
      serviceType,
      serviceName,
      serviceDate,
      location,
      price,
      quantity = 1,
      remark,
      executorId
    } = event;
    
    // 参数验证
    if (!serviceType || !serviceName || !serviceDate || !price) {
      return {
        code: 'MISSING_PARAMS',
        message: '缺少必填参数',
        data: null
      };
    }
    
    // 查询用户信息
    const userResult = await db.collection('users').where({
      openId: OPENID
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: 'USER_NOT_FOUND',
        message: '用户不存在',
        data: null
      };
    }
    
    const user = userResult.data[0];
    
    // 调用火山云 API 创建订单
    const response = await axios.post(
      `${VOLCANE_API_BASE}/order/create`,
      {
        serviceType,
        serviceName,
        serviceDate,
        location,
        price,
        quantity,
        remark,
        executorId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENID}`
        },
        timeout: 10000
      }
    );
    
    const orderData = response.data.data;
    
    // 在微信云数据库也保存一份订单记录
    const now = new Date();
    const localOrder = {
      openId: OPENID,
      userId: user._id,
      orderNo: orderData.orderNo,
      serviceType,
      serviceName,
      serviceDate: new Date(serviceDate),
      location: location || '',
      price: parseFloat(price),
      quantity: parseInt(quantity),
      totalPrice: parseFloat(price) * parseInt(quantity),
      status: 'pending',
      paymentStatus: 'unpaid',
      executorId: executorId || null,
      remark: remark || '',
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection('orders').add({
      data: localOrder
    });
    
    return {
      code: 'SUCCESS',
      message: '订单创建成功',
      data: orderData
    };
  } catch (error) {
    console.error('创建订单失败:', error);
    return {
      code: 'CREATE_ORDER_FAILED',
      message: error.response?.data?.message || error.message || '创建订单失败',
      data: null
    };
  }
};
