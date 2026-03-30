/**
 * 请求验证中间件
 * 用于验证请求参数、body 和 query
 */

const { AppError } = require('./errorHandler');

/**
 * 验证请求的工厂函数
 * @param {Object} schema - Joi schema
 * @param {String} source - 'body' | 'query' | 'params'
 */
const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = req[source];
      const { error, value } = schema.validate(data, { 
        abortEarly: false,
        allowUnknown: true 
      });
      
      if (error) {
        const messages = error.details.map(detail => detail.message).join('; ');
        throw new AppError(messages, 'INVALID_PARAMS', 400);
      }
      
      // 验证通过，将验证后的值附加到请求
      req[source] = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { validateRequest };
