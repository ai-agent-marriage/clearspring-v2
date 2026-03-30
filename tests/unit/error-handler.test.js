/**
 * 错误处理中间件测试
 */

const { AppError, sendError, sendSuccess, errorCodes } = require('../../api/middleware/errorHandler');

describe('⚠️ 错误处理中间件', () => {
  describe('AppError 类', () => {
    test('ERROR-001: 创建标准错误', () => {
      const error = new AppError('USER_NOT_FOUND');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.message).toBe('用户不存在');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    test('ERROR-002: 创建错误 - 自定义消息', () => {
      const error = new AppError('VALIDATION_ERROR', '手机号格式不正确');
      
      expect(error.message).toBe('手机号格式不正确');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    test('ERROR-003: 创建错误 - 未知错误码', () => {
      const error = new AppError('UNKNOWN_ERROR_CODE');
      
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('服务器内部错误');
      expect(error.statusCode).toBe(500);
    });

    test('ERROR-004: 错误堆栈追踪', () => {
      const error = new AppError('ORDER_NOT_FOUND');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    test('ERROR-005: 错误码存在性', () => {
      const error = new AppError('SUCCESS');
      
      expect(error.code).toBe('SUCCESS');
      expect(error.message).toBe('操作成功');
      expect(error.statusCode).toBe(200);
    });
  });

  describe('错误码字典', () => {
    test('ERROR-006: 错误码结构', () => {
      expect(errorCodes.USER_NOT_FOUND).toBeDefined();
      expect(errorCodes.USER_NOT_FOUND.code).toBeDefined();
      expect(errorCodes.USER_NOT_FOUND.message).toBeDefined();
      expect(errorCodes.USER_NOT_FOUND.statusCode).toBeDefined();
    });

    test('ERROR-007: 错误码分类', () => {
      // 通用错误
      expect(errorCodes.SUCCESS).toBeDefined();
      expect(errorCodes.COMMON_INVALID_PARAM).toBeDefined();
      
      // 用户相关
      expect(errorCodes.USER_NOT_FOUND).toBeDefined();
      expect(errorCodes.USER_TOKEN_INVALID).toBeDefined();
      
      // 订单相关
      expect(errorCodes.ORDER_NOT_FOUND).toBeDefined();
      expect(errorCodes.ORDER_CREATE_FAILED).toBeDefined();
      
      // 系统相关
      expect(errorCodes.INTERNAL_ERROR).toBeDefined();
      expect(errorCodes.DATABASE_ERROR).toBeDefined();
    });

    test('ERROR-008: 错误码命名规范', () => {
      const errorKeys = Object.keys(errorCodes);
      
      errorKeys.forEach(key => {
        // 应该全大写，下划线分隔
        expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/);
        
        // 不应该包含小写字母
        expect(key).not.toMatch(/[a-z]/);
      });
    });
  });

  describe('sendError 助手函数', () => {
    test('ERROR-009: sendError 响应格式', () => {
      // 模拟 response 对象
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      sendError(mockRes, 'ORDER_NOT_FOUND');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 'ORDER_NOT_FOUND',
        data: null,
        message: '订单不存在'
      });
    });

    test('ERROR-010: sendError 自定义消息', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      sendError(mockRes, 'VALIDATION_ERROR', '自定义错误消息');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        data: null,
        message: '自定义错误消息'
      });
    });
  });

  describe('sendSuccess 助手函数', () => {
    test('ERROR-011: sendSuccess 响应格式', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      sendSuccess(mockRes, { id: 1 }, '操作成功');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 'SUCCESS',
        data: { id: 1 },
        message: '操作成功'
      });
    });

    test('ERROR-012: sendSuccess 默认消息', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      sendSuccess(mockRes, { id: 1 });
      
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 'SUCCESS',
        data: { id: 1 },
        message: '操作成功'
      });
    });

    test('ERROR-013: sendSuccess 空数据', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      sendSuccess(mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 'SUCCESS',
        data: {},
        message: '操作成功'
      });
    });
  });
});
