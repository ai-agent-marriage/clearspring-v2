/**
 * 清如 ClearSpring - 管理员登录云函数
 * 功能：管理员账号验证和 Token 生成
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { username, password } = event;
  
  // 参数验证
  if (!username || !password) {
    return {
      code: 'INVALID_PARAMS',
      message: '账号和密码不能为空'
    };
  }
  
  try {
    // 查询管理员账号
    const result = await db.collection('admins')
      .where({
        username: username,
        password: password, // 生产环境应该用加密密码
        status: 'active'
      })
      .limit(1)
      .get();
    
    if (result.data.length === 0) {
      return {
        code: 'AUTH_FAILED',
        message: '账号或密码错误'
      };
    }
    
    const admin = result.data[0];
    
    // 生成 Token（简单实现，生产环境应该用 JWT）
    const token = 'admin_' + username + '_' + Date.now();
    
    // 记录登录日志
    await db.collection('audit_logs').add({
      data: {
        type: 'admin_login',
        admin_id: admin._id,
        admin_username: admin.username,
        action: '登录管理后台',
        ip: context.CLIENTIP,
        timestamp: new Date(),
        success: true
      }
    });
    
    return {
      code: 'SUCCESS',
      message: '登录成功',
      data: {
        token: token,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions || [],
        lastLoginAt: admin.lastLoginAt
      }
    };
    
  } catch (error) {
    console.error('管理员登录失败:', error);
    
    return {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    };
  }
};
