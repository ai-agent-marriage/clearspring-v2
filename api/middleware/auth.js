/**
 * JWT 认证中间件
 * 使用安全的 JWT Token 进行认证
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// 验证 JWT 密钥是否已配置
if (!process.env.JWT_SECRET) {
  console.error('❌ 错误：JWT_SECRET 环境变量未配置');
  console.error('请在 .env 文件中设置 JWT_SECRET');
  process.exit(1);
}

const authMiddleware = async (req, res, next) => {
  try {
    // 从 Header 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 'UNAUTHORIZED', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // JWT Token 验证
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息附加到请求
    req.user = {
      userId: decoded.userId,
      openId: decoded.openId,
      role: decoded.role || 'user',
      adminId: decoded.adminId,
      username: decoded.username,
      permissions: decoded.permissions || []
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        openId: decoded.openId,
        role: decoded.role || 'user',
        adminId: decoded.adminId,
        username: decoded.username,
        permissions: decoded.permissions || []
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
