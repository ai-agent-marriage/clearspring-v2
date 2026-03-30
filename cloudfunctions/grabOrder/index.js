/**
 * 云函数：grabOrder
 * 功能：抢单（使用分布式锁防止并发）
 * 部署环境：微信云开发 cloud1-7ga68ls3ccebbe5b
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 分布式锁实现（基于微信云数据库的原子操作）
class DistributedLock {
  constructor(key, ttl = 10000) {
    this.key = `lock:${key}`;
    this.ttl = ttl;
    this.lockId = `${Date.now()}:${Math.random()}`;
  }
  
  async acquire() {
    try {
      const now = Date.now();
      
      // 尝试获取锁
      const result = await db.collection('locks').where({
        key: this.key,
        $or: [
          { expireAt: _.lt(now) }, // 锁已过期
          { _id: this.lockId }      // 已经是自己的锁
        ]
      }).update({
        data: {
          lockId: this.lockId,
          expireAt: now + this.ttl,
          acquiredAt: now
        }
      });
      
      if (result.stats.updated > 0) {
        return true;
      }
      
      // 如果锁不存在，尝试创建
      try {
        await db.collection('locks').add({
          data: {
            key: this.key,
            lockId: this.lockId,
            expireAt: now + this.ttl,
            acquiredAt: now,
            createdAt: new Date()
          }
        });
        return true;
      } catch (e) {
        // 并发创建失败，说明锁已被其他进程获取
        return false;
      }
    } catch (error) {
      console.error('获取锁失败:', error);
      return false;
    }
  }
  
  async release() {
    try {
      await db.collection('locks').where({
        key: this.key,
        lockId: this.lockId
      }).remove();
      return true;
    } catch (error) {
      console.error('释放锁失败:', error);
      return false;
    }
  }
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  try {
    const { orderId } = event;
    
    if (!orderId) {
      return {
        code: 'MISSING_ORDER_ID',
        message: '缺少订单 ID',
        data: null
      };
    }
    
    // 查询执行者信息
    const executorResult = await db.collection('users').where({
      openId: OPENID,
      role: 'executor',
      status: 'active'
    }).get();
    
    if (executorResult.data.length === 0) {
      return {
        code: 'EXECUTOR_NOT_FOUND',
        message: '执行者不存在或未激活',
        data: null
      };
    }
    
    const executor = executorResult.data[0];
    
    // 获取分布式锁
    const lock = new DistributedLock(`order:${orderId}`, 10000);
    const acquired = await lock.acquire();
    
    if (!acquired) {
      return {
        code: 'ORDER_GRABBED',
        message: '订单已被抢走',
        data: null
      };
    }
    
    try {
      // 查询订单状态
      const orderResult = await db.collection('orders').doc(orderId).get();
      
      if (!orderResult.data) {
        return {
          code: 'ORDER_NOT_FOUND',
          message: '订单不存在',
          data: null
        };
      }
      
      const order = orderResult.data;
      
      // 检查订单状态
      if (order.status !== 'pending' && order.status !== 'paid') {
        return {
          code: 'ORDER_STATUS_ERROR',
          message: `订单状态不可抢单：${order.status}`,
          data: null
        };
      }
      
      // 更新订单状态
      const now = new Date();
      await db.collection('orders').doc(orderId).update({
        data: {
          status: 'grabbed',
          executorId: executor._id,
          executorName: executor.nickName,
          executorOpenId: executor.openId,
          executorPhone: executor.phone,
          grabTime: now,
          updatedAt: now
        }
      });
      
      // 记录抢单日志
      await db.collection('audit_logs').add({
        data: {
          type: 'grab_order',
          orderId: orderId,
          executorId: executor._id,
          executorOpenId: executor.openId,
          timestamp: now,
          details: {
            orderNo: order.orderNo,
            serviceName: order.serviceName
          }
        }
      });
      
      return {
        code: 'SUCCESS',
        message: '抢单成功',
        data: {
          orderId,
          executorId: executor._id,
          executorName: executor.nickName,
          grabTime: now
        }
      };
    } finally {
      // 释放锁
      await lock.release();
    }
  } catch (error) {
    console.error('抢单失败:', error);
    return {
      code: 'GRAB_ORDER_FAILED',
      message: error.message || '抢单失败',
      data: null
    };
  }
};
