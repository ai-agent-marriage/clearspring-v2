/**
 * 清如 ClearSpring - 管理员登录云函数
 * 使用 JWT 和 bcrypt 进行安全认证
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      return {
        code: 'AUTH_FAILED',
        message: '账号或密码错误'
      };
    }
    
    // 生成 JWT Token
    // 注意：云函数环境变量需在云开发控制台配置
    const JWT_SECRET = process.env.JWT_SECRET || 'temp_secret_change_in_production';
    
    if (JWT_SECRET === 'temp_secret_change_in_production') {
      console.error('⚠️ 警告：请使用云开发控制台配置 JWT_SECRET 环境变量');
    }
    
    const token = jwt.sign(
      {
        adminId: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions || []
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
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
