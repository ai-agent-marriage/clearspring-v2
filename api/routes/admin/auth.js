/**
 * 管理员认证路由
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../../server');
const { AppError } = require('../../middleware/errorHandler');

/**
 * POST /api/admin/login
 * 管理员登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 参数验证
    if (!username || !password) {
      throw new AppError('账号和密码不能为空', 'INVALID_PARAMS', 400);
    }
    
    const db = req.app.get('db');
    
    // 查询管理员账号
    const result = await db.collection('admins')
      .findOne({
        username: username,
        password: password,
        status: 'active'
      });
    
    if (!result) {
      throw new AppError('账号或密码错误', 'AUTH_FAILED', 401);
    }
    
    // 生成 Token（简单实现，生产环境应该用 JWT）
    const token = 'admin_' + username + '_' + Date.now();
    
    // 更新最后登录时间
    await db.collection('admins').updateOne(
      { _id: result._id },
      {
        $set: {
          lastLoginAt: new Date()
        }
      }
    );
    
    // 记录登录日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_login',
      admin_id: result._id,
      admin_username: username,
      action: '登录管理后台',
      ip: req.ip,
      timestamp: new Date(),
      success: true
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        token: token,
        username: result.username,
        role: result.role,
        permissions: result.permissions || [],
        lastLoginAt: result.lastLoginAt
      },
      message: '登录成功'
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/info
 * 获取管理员信息
 */
router.get('/info', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('未授权访问', 'UNAUTHORIZED', 401);
    }
    
    const db = req.app.get('db');
    
    // 从 Token 中提取用户名（简单实现）
    const parts = token.split('_');
    if (parts.length < 2) {
      throw new AppError('Token 格式错误', 'INVALID_TOKEN', 401);
    }
    
    const username = parts[1];
    
    const admin = await db.collection('admins')
      .findOne({ username: username });
    
    if (!admin) {
      throw new AppError('管理员不存在', 'NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      data: {
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions || [],
        lastLoginAt: admin.lastLoginAt
      },
      message: '获取成功'
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/logout
 * 退出登录
 */
router.post('/logout', async (req, res, next) => {
  try {
    // 简单实现，实际应该使 Token 失效
    res.json({
      code: 'SUCCESS',
      data: null,
      message: '退出成功'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
