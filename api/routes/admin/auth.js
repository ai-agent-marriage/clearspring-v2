/**
 * 管理员认证路由
 * 使用 JWT 和 bcrypt 进行安全认证
 */

const express = require('express');

const { validate, loginSchema } = require('../../validators/admin.validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../middleware/errorHandler');

/**
 * POST /api/admin/login
 * 管理员登录 - 使用 JWT 认证
 */
router.post('/login', validate(loginSchema, 'body'), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 参数验证
    if (!username || !password) {
      throw new AppError('账号和密码不能为空', 'INVALID_PARAMS', 400);
    }
    
    const db = req.app.get('db');
    
    // 查询管理员账号
    const admin = await db.collection('admins')
      .findOne({
        username: username,
        status: 'active'
      });
    
    if (!admin) {
      throw new AppError('账号或密码错误', 'AUTH_FAILED', 401);
    }
    
    // 验证密码（支持 bcrypt 加密密码和旧版明文密码过渡）
    let passwordValid = false;
    if (admin.passwordHash) {
      // 使用 bcrypt 验证加密密码
      passwordValid = await bcrypt.compare(password, admin.passwordHash);
    } else if (admin.password) {
      // 旧版明文密码（过渡期兼容）
      passwordValid = (admin.password === password);
    }
    
    if (!passwordValid) {
      throw new AppError('账号或密码错误', 'AUTH_FAILED', 401);
    }
    
    // 生成 JWT Token
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 更新最后登录时间
    await db.collection('admins').updateOne(
      { _id: admin._id },
      {
        $set: {
          lastLoginAt: new Date()
        }
      }
    );
    
    // 记录登录日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_login',
      admin_id: admin._id,
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
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions || [],
        lastLoginAt: admin.lastLoginAt
      },
      message: '登录成功'
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/info
 * 获取管理员信息 - 使用 JWT 认证
 */
router.get('/info', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 'UNAUTHORIZED', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证 JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const db = req.app.get('db');
    
    const admin = await db.collection('admins')
      .findOne({ 
        _id: require('mongodb').ObjectId(decoded.adminId),
        status: 'active'
      });
    
    if (!admin) {
      throw new AppError('用户不存在或已禁用', 'USER_NOT_FOUND', 404);
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
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('认证令牌无效或已过期', 'INVALID_TOKEN', 401));
    } else {
      next(error);
    }
  }
});

/**
 * POST /api/admin/logout
 * 退出登录
 */
router.post('/logout', async (req, res, next) => {
  try {
    // JWT 是无状态的，客户端只需删除 Token 即可
    // 如需立即失效，可将 Token 加入 Redis 黑名单
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
