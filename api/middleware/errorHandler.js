/**
 * 错误处理中间件
 */

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
  
  console.error(`[${new Date().toISOString()}] ${code}: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  
  res.status(statusCode).json({
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  AppError,
  errorHandler
};
