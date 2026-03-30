/**
 * 云函数：login
 * 功能：用户登录/注册（微信云）
 * 部署环境：微信云开发 cloud1-7ga68ls3ccebbe5b
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext();
  
  try {
    const { code, encryptedData, iv } = event;
    
    if (!code) {
      return {
        code: 'MISSING_CODE',
        message: '缺少微信登录 code',
        data: null
      };
    }
    
    // 查询用户是否存在
    let userResult = await db.collection('users').where({
      openId: OPENID
    }).get();
    
    let user;
    let isNewUser = false;
    
    if (userResult.data.length === 0) {
      // 创建新用户
      isNewUser = true;
      const now = new Date();
      
      user = {
        openId: OPENID,
        unionId: UNIONID || null,
        nickName: event.nickName || '新用户',
        avatarUrl: event.avatarUrl || '',
        gender: event.gender || 0,
        city: event.city || '',
        province: event.province || '',
        country: event.country || '',
        phone: event.phone || '',
        role: 'user',
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      };
      
      const addResult = await db.collection('users').add({
        data: user
      });
      
      user._id = addResult._id;
    } else {
      // 更新已有用户
      user = userResult.data[0];
      
      await db.collection('users').doc(user._id).update({
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          ...(event.nickName && { nickName: event.nickName }),
          ...(event.avatarUrl && { avatarUrl: event.avatarUrl }),
          ...(event.phone && { phone: event.phone })
        }
      });
    }
    
    // 生成自定义登录凭证
    const token = cloud.getWXContext().OPENID;
    
    return {
      code: 'SUCCESS',
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        token,
        openId: OPENID,
        unionId: UNIONID,
        userId: user._id,
        isNewUser,
        user: {
          userId: user._id,
          openId: user.openId,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          role: user.role
        }
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      code: 'LOGIN_FAILED',
      message: error.message || '登录失败',
      data: null
    };
  }
};
