/**
 * 云函数：recordMeditation
 * 功能：记录冥想完成（小程序端使用）
 * 部署环境：微信云开发
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  try {
    const { courseId, duration } = event;
    
    if (!courseId || !duration) {
      return {
        code: 'INVALID_PARAMS',
        message: '课程 ID 和时长不能为空',
        data: null
      };
    }
    
    // 查询用户
    const userResult = await db.collection('users').where({
      openId: OPENID
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: 'USER_NOT_FOUND',
        message: '用户不存在',
        data: null
      };
    }
    
    const user = userResult.data[0];
    
    // 检查课程是否存在
    const courseResult = await db.collection('meditation_courses').where({
      _id: courseId
    }).get();
    
    if (courseResult.data.length === 0) {
      return {
        code: 'COURSE_NOT_FOUND',
        message: '课程不存在',
        data: null
      };
    }
    
    const course = courseResult.data[0];
    const now = new Date();
    
    // 创建冥想记录
    const record = {
      userId: user._id,
      userOpenId: OPENID,
      courseId: courseId,
      courseTitle: course.title,
      duration: parseInt(duration),
      completedAt: now,
      createdAt: now
    };
    
    const addResult = await db.collection('meditation_records').add({
      data: record
    });
    
    return {
      code: 'SUCCESS',
      message: '记录成功',
      data: {
        recordId: addResult._id,
        courseId,
        duration,
        completedAt: now
      }
    };
  } catch (error) {
    console.error('记录冥想失败:', error);
    return {
      code: 'RECORD_FAILED',
      message: error.message || '记录失败',
      data: null
    };
  }
};
