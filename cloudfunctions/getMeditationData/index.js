/**
 * 云函数：getMeditationData
 * 功能：获取用户冥想统计数据
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  try {
    // 查询用户
    const userResult = await db.collection('users').where({
      openId: OPENID
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在',
        data: {
          totalMinutes: 0,
          totalCount: 0,
          streakDays: 0
        }
      };
    }
    
    const user = userResult.data[0];
    
    // 查询冥想记录
    const recordsResult = await db.collection('meditation_records')
      .where({
        userOpenId: OPENID
      })
      .orderBy('completedAt', 'desc')
      .get();
    
    const records = recordsResult.data;
    
    // 计算总时长和总次数
    const totalMinutes = records.reduce((sum, record) => sum + (record.duration || 0), 0);
    const totalCount = records.length;
    
    // 计算连续天数
    const streakDays = calculateStreak(records);
    
    return {
      success: true,
      message: '获取成功',
      data: {
        totalMinutes,
        totalCount,
        streakDays
      }
    };
  } catch (error) {
    console.error('获取冥想数据失败:', error);
    return {
      success: false,
      message: error.message,
      data: {
        totalMinutes: 0,
        totalCount: 0,
        streakDays: 0
      }
    };
  }
};

/**
 * 计算连续天数
 */
function calculateStreak(records) {
  if (!records || records.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // 检查是否有今天的记录
  const hasToday = records.some(record => {
    const recordDate = new Date(record.completedAt);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === currentDate.getTime();
  });
  
  if (!hasToday) {
    // 检查昨天是否有记录
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasYesterday = records.some(record => {
      const recordDate = new Date(record.completedAt);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === yesterday.getTime();
    });
    
    if (!hasYesterday) {
      return 0;
    }
    
    currentDate = yesterday;
  }
  
  // 计算连续天数
  while (true) {
    const hasRecord = records.some(record => {
      const recordDate = new Date(record.completedAt);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === currentDate.getTime();
    });
    
    if (hasRecord) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
