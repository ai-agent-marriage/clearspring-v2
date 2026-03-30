/**
 * 错误处理中间件
 * 
 * 统一错误处理逻辑，所有错误通过此中间件处理
 * 响应格式：{ code, data, message, stack? }
 */

const logger = require('../utils/logger');
const errorCodes = require('../utils/errorCodes');

/**
 * 应用错误类
 * 用于包装业务逻辑中的预期错误
 */
class AppError extends Error {
  /**
   * @param {string} errorCode - 错误码 key，如 'USER_NOT_FOUND'
   * @param {string} [customMessage] - 可选的自定义错误消息
   */
  constructor(errorCode, customMessage) {
    const errorConfig = errorCodes[errorCode] || errorCodes.INTERNAL_ERROR;
    const message = customMessage || errorConfig.message;
    
    super(message);
    this.code = errorConfig.code;
    this.statusCode = errorConfig.statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 快速响应错误助手函数
 * @param {Object} res - Express response 对象
 * @param {string} errorCode - 错误码 key
 * @param {string} [customMessage] - 可选的自定义错误消息
 */
const sendError = (res, errorCode, customMessage) => {
  const errorConfig = errorCodes[errorCode] || errorCodes.INTERNAL_ERROR;
  const message = customMessage || errorConfig.message;
  
  res.status(200).json({
    code: errorConfig.code,
    data: null,
    message,
  });
};

/**
 * 快速响应成功助手函数
 * @param {Object} res - Express response 对象
 * @param {Object} [data] - 响应数据
 * @param {string} [message] - 成功消息
 */
const sendSuccess = (res, data = {}, message = '操作成功') => {
  res.status(200).json({
    code: 'SUCCESS',
    data,
    message,
  });
};

/**
 * 错误处理中间件
 * 统一处理所有路由错误
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let code = err.code || 'INTERNAL_ERROR';
  
  // 生产环境不暴露详细错误栈
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = '服务器内部错误';
    code = 'INTERNAL_ERROR';
  }
  
  // 记录错误日志
  logger.error(`${code}: ${message}`, { 
    code, 
    message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // 所有业务错误都返回 HTTP 200，通过 code 字段区分成功/失败
  res.status(200).json({
    code,
    data: null,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 异步处理器包装器
 * 自动捕获 async 路由处理器中的错误
 * @param {Function} fn - async 路由处理器
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  sendError,
  sendSuccess,
  asyncHandler,
  errorCodes,
};
