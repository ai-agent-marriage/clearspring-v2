/**
 * 统一错误码字典
 * 命名规范：MODULE_ERROR_TYPE
 * 
 * 错误码分类：
 * - 1xxx: 通用错误
 * - 2xxx: 用户相关
 * - 3xxx: 订单相关
 * - 4xxx: 内容相关
 * - 5xxx: 管理相关
 * - 6xxx: 执行者相关
 * - 7xxx: 系统相关
 */

module.exports = {
  // ========== 通用错误 (1xxx) ==========
  SUCCESS: { code: 'SUCCESS', message: '操作成功', statusCode: 200 },
  INVALID_PARAM: { code: 'COMMON_INVALID_PARAM', message: '参数错误', statusCode: 400 },
  MISSING_PARAM: { code: 'COMMON_MISSING_PARAM', message: '缺少必要参数', statusCode: 400 },
  DUPLICATE_REQUEST: { code: 'COMMON_DUPLICATE_REQUEST', message: '重复请求', statusCode: 400 },
  
  // ========== 用户相关错误 (2xxx) ==========
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: '用户不存在', statusCode: 404 },
  USER_LOGIN_FAILED: { code: 'USER_LOGIN_FAILED', message: '登录失败', statusCode: 401 },
  USER_TOKEN_INVALID: { code: 'USER_TOKEN_INVALID', message: 'Token 无效', statusCode: 401 },
  USER_TOKEN_EXPIRED: { code: 'USER_TOKEN_EXPIRED', message: 'Token 已过期', statusCode: 401 },
  USER_PERMISSION_DENIED: { code: 'USER_PERMISSION_DENIED', message: '权限不足', statusCode: 403 },
  USER_ALREADY_EXISTS: { code: 'USER_ALREADY_EXISTS', message: '用户已存在', statusCode: 409 },
  
  // ========== 订单相关错误 (3xxx) ==========
  ORDER_NOT_FOUND: { code: 'ORDER_NOT_FOUND', message: '订单不存在', statusCode: 404 },
  ORDER_CREATE_FAILED: { code: 'ORDER_CREATE_FAILED', message: '创建订单失败', statusCode: 500 },
  ORDER_UPDATE_FAILED: { code: 'ORDER_UPDATE_FAILED', message: '更新订单失败', statusCode: 500 },
  ORDER_DELETE_FAILED: { code: 'ORDER_DELETE_FAILED', message: '删除订单失败', statusCode: 500 },
  ORDER_GRAB_FAILED: { code: 'ORDER_GRAB_FAILED', message: '抢单失败', statusCode: 400 },
  ORDER_STATUS_INVALID: { code: 'ORDER_STATUS_INVALID', message: '订单状态无效', statusCode: 400 },
  ORDER_ALREADY_GRABBED: { code: 'ORDER_ALREADY_GRABBED', message: '订单已被抢占', statusCode: 409 },
  
  // ========== 内容相关错误 (4xxx) ==========
  CONTENT_NOT_FOUND: { code: 'CONTENT_NOT_FOUND', message: '内容不存在', statusCode: 404 },
  CONTENT_CREATE_FAILED: { code: 'CONTENT_CREATE_FAILED', message: '创建内容失败', statusCode: 500 },
  CONTENT_UPDATE_FAILED: { code: 'CONTENT_UPDATE_FAILED', message: '更新内容失败', statusCode: 500 },
  CONTENT_DELETE_FAILED: { code: 'CONTENT_DELETE_FAILED', message: '删除内容失败', statusCode: 500 },
  WIKI_NOT_FOUND: { code: 'WIKI_NOT_FOUND', message: 'Wiki 内容不存在', statusCode: 404 },
  MEDITATION_NOT_FOUND: { code: 'MEDITATION_NOT_FOUND', message: '冥想课程不存在', statusCode: 404 },
  RITUAL_NOT_FOUND: { code: 'RITUAL_NOT_FOUND', message: '仪式内容不存在', statusCode: 404 },
  
  // ========== 管理相关错误 (5xxx) ==========
  ADMIN_NOT_FOUND: { code: 'ADMIN_NOT_FOUND', message: '管理员不存在', statusCode: 404 },
  ADMIN_LOGIN_FAILED: { code: 'ADMIN_LOGIN_FAILED', message: '管理员登录失败', statusCode: 401 },
  ADMIN_PERMISSION_DENIED: { code: 'ADMIN_PERMISSION_DENIED', message: '管理员权限不足', statusCode: 403 },
  AUDIT_FAILED: { code: 'AUDIT_FAILED', message: '审核失败', statusCode: 400 },
  APPEAL_NOT_FOUND: { code: 'APPEAL_NOT_FOUND', message: '申诉不存在', statusCode: 404 },
  EXPORT_FAILED: { code: 'EXPORT_FAILED', message: '导出失败', statusCode: 500 },
  DASHBOARD_DATA_ERROR: { code: 'DASHBOARD_DATA_ERROR', message: '仪表板数据错误', statusCode: 500 },
  
  // ========== 执行者相关错误 (6xxx) ==========
  EXECUTOR_NOT_FOUND: { code: 'EXECUTOR_NOT_FOUND', message: '执行者不存在', statusCode: 404 },
  EXECUTOR_QUALIFICATION_PENDING: { code: 'EXECUTOR_QUALIFICATION_PENDING', message: '执行者资质审核中', statusCode: 400 },
  EXECUTOR_QUALIFICATION_REJECTED: { code: 'EXECUTOR_QUALIFICATION_REJECTED', message: '执行者资质未通过', statusCode: 400 },
  EXECUTOR_STATUS_INVALID: { code: 'EXECUTOR_STATUS_INVALID', message: '执行者状态无效', statusCode: 400 },
  EXECUTOR_INCOME_ERROR: { code: 'EXECUTOR_INCOME_ERROR', message: '执行者收益计算错误', statusCode: 500 },
  EVIDENCE_UPLOAD_FAILED: { code: 'EVIDENCE_UPLOAD_FAILED', message: '证据上传失败', statusCode: 500 },
  CAMERA_ACCESS_DENIED: { code: 'CAMERA_ACCESS_DENIED', message: '摄像头访问被拒绝', statusCode: 403 },
  
  // ========== 系统相关错误 (7xxx) ==========
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: '服务器内部错误', statusCode: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', message: '数据库错误', statusCode: 500 },
  REDIS_ERROR: { code: 'REDIS_ERROR', message: 'Redis 错误', statusCode: 500 },
  FILE_UPLOAD_FAILED: { code: 'FILE_UPLOAD_FAILED', message: '文件上传失败', statusCode: 500 },
  FILE_NOT_FOUND: { code: 'FILE_NOT_FOUND', message: '文件不存在', statusCode: 404 },
  NETWORK_ERROR: { code: 'NETWORK_ERROR', message: '网络错误', statusCode: 503 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', message: '服务不可用', statusCode: 503 },
  
  // ========== 验证相关错误 (8xxx) ==========
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: '验证失败', statusCode: 400 },
  VALIDATION_EMAIL_INVALID: { code: 'VALIDATION_EMAIL_INVALID', message: '邮箱格式错误', statusCode: 400 },
  VALIDATION_PHONE_INVALID: { code: 'VALIDATION_PHONE_INVALID', message: '手机号格式错误', statusCode: 400 },
  VALIDATION_PASSWORD_WEAK: { code: 'VALIDATION_PASSWORD_WEAK', message: '密码强度不足', statusCode: 400 },
};
