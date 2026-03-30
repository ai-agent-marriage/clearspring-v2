/**
 * 管理端 - 分账配置接口
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
 * GET /api/admin/profit-sharing
 * 分账配置
 */
router.get('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    // 查询分账配置（假设配置存储在 settings 集合中）
    let config = await db.collection('settings').findOne({
      key: 'profit_sharing'
    });
    
    // 如果没有配置，返回默认配置
    if (!config) {
      config = {
        key: 'profit_sharing',
        value: {
          platformRate: 0.10, // 平台抽成比例 10%
          executorMinRate: 0.70, // 执行者最低比例 70%
          executorMaxRate: 0.90, // 执行者最高比例 90%
          defaultExecutorRate: 0.80, // 默认执行者比例 80%
          minOrderAmount: 10, // 最低订单金额
          maxOrderAmount: 10000, // 最高订单金额
          serviceTypeRates: {
            // 不同服务类型的特殊抽成比例
            cleaning: {
              platformRate: 0.10,
              executorRate: 0.85
            },
            maintenance: {
              platformRate: 0.12,
              executorRate: 0.82
            },
            delivery: {
              platformRate: 0.08,
              executorRate: 0.88
            }
          },
          tieredRates: [
            // 阶梯抽成（基于执行者月度完成订单数）
            { minOrders: 0, maxOrders: 10, executorRateBonus: 0 },
            { minOrders: 11, maxOrders: 30, executorRateBonus: 0.02 },
            { minOrders: 31, maxOrders: 50, executorRateBonus: 0.03 },
            { minOrders: 51, maxOrders: null, executorRateBonus: 0.05 }
          ],
          withdrawMinAmount: 100, // 最低提现金额
          withdrawFee: 0, // 提现手续费
          withdrawTaxRate: 0, // 提现税率
          updatedAt: new Date(),
          updatedBy: null
        }
      };
      
      // 保存默认配置
      await db.collection('settings').insertOne(config);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        profitSharing: config.value,
        lastUpdated: config.updatedAt,
        updatedBy: config.updatedBy
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/profit-sharing
 * 分账配置更新
 * Body: 完整的分账配置对象
 */
router.put('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const configData = req.body;
    
    // 验证必填字段
    if (!configData.platformRate || 
        configData.platformRate < 0 || 
        configData.platformRate > 1) {
      throw new AppError('平台抽成比例必须在 0-1 之间', 'INVALID_PLATFORM_RATE', 400);
    }
    
    if (!configData.executorMinRate || 
        configData.executorMinRate < 0 || 
        configData.executorMinRate > 1) {
      throw new AppError('执行者最低比例必须在 0-1 之间', 'INVALID_EXECUTOR_MIN_RATE', 400);
    }
    
    if (!configData.executorMaxRate || 
        configData.executorMaxRate < 0 || 
        configData.executorMaxRate > 1) {
      throw new AppError('执行者最高比例必须在 0-1 之间', 'INVALID_EXECUTOR_MAX_RATE', 400);
    }
    
    // 验证比例总和
    if (configData.platformRate + configData.defaultExecutorRate > 1) {
      throw new AppError('平台抽成比例 + 默认执行者比例不能大于 1', 'INVALID_RATE_SUM', 400);
    }
    
    // 查询现有配置
    const existingConfig = await db.collection('settings').findOne({
      key: 'profit_sharing'
    });
    
    const updateData = {
      value: {
        ...configData,
        updatedAt: new Date(),
        updatedBy: req.user.userId
      },
      updatedAt: new Date()
    };
    
    if (existingConfig) {
      // 更新现有配置
      await db.collection('settings').updateOne(
        { key: 'profit_sharing' },
        { $set: updateData }
      );
    } else {
      // 创建新配置
      await db.collection('settings').insertOne({
        key: 'profit_sharing',
        ...updateData
      });
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_profit_sharing_update',
      userId: req.user.userId,
      oldConfig: existingConfig ? existingConfig.value : null,
      newConfig: configData,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '分账配置已更新',
      data: {
        profitSharing: configData,
        updatedAt: new Date(),
        updatedBy: req.user.userId
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
