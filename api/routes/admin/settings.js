/**
 * 管理端 - 系统设置接口
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
 * GET /api/admin/settings
 * 获取系统设置
 */
router.get('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    // 查询所有系统设置
    const settings = await db.collection('settings').find({}).toArray();
    
    // 转换为键值对格式
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        settings: settingsMap,
        count: settings.length
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/settings
 * 更新系统设置
 * Body: 系统设置对象，包含 key 和 value
 */
router.post('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { key, value } = req.body;
    
    // 验证必填字段
    if (!key || typeof key !== 'string') {
      throw new AppError('设置键名不能为空', 'INVALID_PARAMS', 400);
    }
    
    if (value === undefined) {
      throw new AppError('设置值不能为空', 'INVALID_PARAMS', 400);
    }
    
    // 验证设置键名的合法性（防止非法字符）
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      throw new AppError('设置键名只能包含字母、数字和下划线', 'INVALID_PARAMS', 400);
    }
    
    // 查询现有设置
    const existingSetting = await db.collection('settings').findOne({ key });
    
    const updateData = {
      value,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    if (existingSetting) {
      // 更新现有设置
      await db.collection('settings').updateOne(
        { key },
        { $set: updateData }
      );
    } else {
      // 创建新设置
      await db.collection('settings').insertOne({
        key,
        ...updateData,
        createdAt: new Date()
      });
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_settings_update',
      userId: req.user.userId,
      settingKey: key,
      oldValue: existingSetting ? existingSetting.value : null,
      newValue: value,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        key,
        value,
        updatedAt: new Date(),
        updatedBy: req.user.userId
      },
      message: '系统设置已更新'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings
 * 批量更新系统设置
 * Body: 包含多个键值对的对象
 */
router.put('/', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new AppError('设置必须为对象', 'INVALID_PARAMS', 400);
    }
    
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // 验证键名
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        throw new AppError(`设置键名 '${key}' 包含非法字符`, 'INVALID_PARAMS', 400);
      }
      
      const existingSetting = await db.collection('settings').findOne({ key });
      
      const updateData = {
        value,
        updatedAt: new Date(),
        updatedBy: req.user.userId
      };
      
      if (existingSetting) {
        await db.collection('settings').updateOne(
          { key },
          { $set: updateData }
        );
      } else {
        await db.collection('settings').insertOne({
          key,
          ...updateData,
          createdAt: new Date()
        });
      }
      
      return { key, oldValue: existingSetting?.value, newValue: value };
    });
    
    const results = await Promise.all(updatePromises);
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_settings_batch_update',
      userId: req.user.userId,
      settings: results,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        updated: results.length,
        settings: results,
        updatedAt: new Date()
      },
      message: '系统设置已批量更新'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/settings/:key
 * 删除系统设置
 */
router.delete('/:key', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { key } = req.params;
    
    const existingSetting = await db.collection('settings').findOne({ key });
    
    if (!existingSetting) {
      throw new AppError('设置不存在', 'SETTING_NOT_FOUND', 404);
    }
    
    await db.collection('settings').deleteOne({ key });
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_settings_delete',
      userId: req.user.userId,
      settingKey: key,
      deletedValue: existingSetting.value,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        key,
        deletedAt: new Date()
      },
      message: '设置已删除'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
