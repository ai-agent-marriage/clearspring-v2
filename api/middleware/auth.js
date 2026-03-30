/**
 * JWT 认证中间件
 * 支持两种 Token 格式：
 * 1. JWT Token（标准格式）
 * 2. 简单 Token（admin_username_timestamp 格式，用于管理后台）
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const authMiddleware = async (req, res, next) => {
  try {
    // 从 Header 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 'UNAUTHORIZED', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // 检查是否为简单 Token 格式（admin_username_timestamp）
    if (token.startsWith('admin_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const username = parts[1];
        // 从数据库获取管理员信息
        const db = req.app.get('db');
        if (db) {
          const admin = await db.collection('admins').findOne({ username: username, status: 'active' });
          if (admin) {
            req.user = {
              userId: admin._id.toString(),
              username: admin.username,
              role: admin.role || 'admin',
              permissions: admin.permissions || []
            };
            return next();
          }
        }
      }
      throw new AppError('无效的管理员令牌', 'INVALID_TOKEN', 401);
    }
    
    // JWT Token 验证
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clearspring_v2_secret_key_2026');
    
    // 将用户信息附加到请求
    req.user = {
      userId: decoded.userId,
      openId: decoded.openId,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('无效的认证令牌', 'INVALID_TOKEN', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('认证令牌已过期', 'TOKEN_EXPIRED', 401));
    } else {
      next(error);
    }
  }
};

// 可选认证（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clearspring_v2_secret_key_2026');
      req.user = {
        userId: decoded.userId,
        openId: decoded.openId,
        role: decoded.role || 'user'
      };
    }
    next();
  } catch (error) {
    // 认证失败但不阻断请求
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
