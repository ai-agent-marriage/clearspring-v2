/**
 * 错误处理中间件
 */

const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let code = err.code || 'INTERNAL_ERROR';
  
  // 生产环境不暴露详细错误
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = '服务器内部错误';
    code = 'INTERNAL_ERROR';
  }
  
  logger.error(`${code}: ${message}`, { 
    code, 
    message, 
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  // 所有业务错误都返回 200，通过 code 字段区分成功/失败
  res.status(200).json({
    code,
    data: null,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  AppError,
  errorHandler
};
