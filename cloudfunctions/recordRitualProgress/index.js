/**
 * 云函数：recordRitualProgress
 * 功能：记录仪轨学习进度（小程序端使用）
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
    const { ritualId, currentStep, completed = false } = event;
    
    if (!ritualId) {
      return {
        code: 'INVALID_PARAMS',
        message: '仪轨 ID 不能为空',
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
    
    // 检查仪轨是否存在
    const ritualResult = await db.collection('ritual_contents').where({
      _id: ritualId
    }).get();
    
    if (ritualResult.data.length === 0) {
      return {
        code: 'RITUAL_NOT_FOUND',
        message: '仪轨不存在',
        data: null
      };
    }
    
    const ritual = ritualResult.data[0];
    const now = new Date();
    
    // 查询是否已有进度记录
    const existingProgress = await db.collection('ritual_progress').where({
      userOpenId: OPENID,
      ritualId: ritualId
    }).get();
    
    let progressData;
    
    if (existingProgress.data.length > 0) {
      // 更新已有进度
      const progress = existingProgress.data[0];
      const updateData = {
        updatedAt: now,
        currentStep: currentStep !== undefined ? currentStep : progress.currentStep
      };
      
      if (completed && !progress.completed) {
        updateData.completed = true;
        updateData.completedAt = now;
        
        // 增加仪轨完成次数
        await db.collection('ritual_contents').doc(ritualId).update({
          data: {
            completedCount: _.inc(1)
          }
        });
      }
      
      await db.collection('ritual_progress').doc(progress._id).update({
        data: updateData
      });
      
      progressData = {
        ritualId,
        currentStep: updateData.currentStep,
        completed: updateData.completed || progress.completed,
        updatedAt: now
      };
    } else {
      // 创建新进度记录
      progressData = {
        userId: user._id,
        userOpenId: OPENID,
        ritualId: ritualId,
        ritualTitle: ritual.title,
        currentStep: currentStep || 0,
        completed: completed,
        completedAt: completed ? now : null,
        createdAt: now,
        updatedAt: now
      };
      
      const addResult = await db.collection('ritual_progress').add({
        data: progressData
      });
      
      progressData = {
        ritualId,
        progressId: addResult._id,
        currentStep: progressData.currentStep,
        completed: progressData.completed,
        createdAt: now
      };
      
      // 如果是首次完成，增加仪轨完成次数
      if (completed) {
        await db.collection('ritual_contents').doc(ritualId).update({
          data: {
            completedCount: _.inc(1)
          }
        });
      }
    }
    
    return {
      code: 'SUCCESS',
      message: completed ? '恭喜完成！' : '进度已更新',
      data: progressData
    };
  } catch (error) {
    console.error('记录仪轨进度失败:', error);
    return {
      code: 'RECORD_FAILED',
      message: error.message || '记录失败',
      data: null
    };
  }
};
