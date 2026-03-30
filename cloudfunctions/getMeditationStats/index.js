/**
 * 云函数：getMeditationStats
 * 功能：获取用户详细冥想统计数据（用于统计页）
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
        data: {}
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
    
    // 基础统计
    const totalMinutes = records.reduce((sum, record) => sum + (record.duration || 0), 0);
    const totalCount = records.length;
    const streakDays = calculateStreak(records);
    
    // 日历数据（过去 30 天）
    const calendar = generateCalendarData(records);
    
    // 周统计
    const weekStats = generateWeekStats(records);
    
    // 最爱课程
    const favorite = generateFavoriteCourse(records);
    
    // 徽章数据
    const badges = generateBadges(totalMinutes, totalCount, streakDays);
    
    return {
      success: true,
      message: '获取成功',
      data: {
        stats: {
          totalMinutes,
          totalCount,
          streakDays
        },
        calendar,
        weekStats,
        favorite,
        badges
      }
    };
  } catch (error) {
    console.error('获取冥想统计失败:', error);
    return {
      success: false,
      message: error.message,
      data: {}
    };
  }
};

function calculateStreak(records) {
  if (!records || records.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  const hasToday = records.some(record => {
    const recordDate = new Date(record.completedAt);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === currentDate.getTime();
  });
  
  if (!hasToday) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasYesterday = records.some(record => {
      const recordDate = new Date(record.completedAt);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === yesterday.getTime();
    });
    
    if (!hasYesterday) return 0;
    currentDate = yesterday;
  }
  
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

function generateCalendarData(records) {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0];
    const dayMinutes = records
      .filter(record => {
        const recordDate = new Date(record.completedAt);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      })
      .reduce((sum, record) => sum + (record.duration || 0), 0);
    
    let level = 0;
    if (dayMinutes > 0) level = 1;
    if (dayMinutes > 10) level = 2;
    if (dayMinutes > 20) level = 3;
    
    days.push({
      date: date.getDate().toString(),
      fullDate: dateStr,
      minutes: dayMinutes,
      level: `level-${level}`
    });
  }
  
  return days;
}

function generateWeekStats(records) {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  const currentDay = today.getDay();
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - currentDay);
  startDate.setHours(0, 0, 0, 0);
  
  const weekData = [];
  const maxMinutes = 60;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayMinutes = records
      .filter(record => {
        const recordDate = new Date(record.completedAt);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      })
      .reduce((sum, record) => sum + (record.duration || 0), 0);
    
    weekData.push({
      day: weekDays[i],
      date: date.toISOString().split('T')[0],
      minutes: dayMinutes,
      height: (dayMinutes / maxMinutes) * 100
    });
  }
  
  return weekData;
}

function generateFavoriteCourse(records) {
  if (records.length === 0) return null;
  
  const courseCount = {};
  records.forEach(record => {
    const courseId = record.courseId;
    courseCount[courseId] = (courseCount[courseId] || 0) + 1;
  });
  
  let maxCount = 0;
  let favoriteCourseId = null;
  
  Object.keys(courseCount).forEach(courseId => {
    if (courseCount[courseId] > maxCount) {
      maxCount = courseCount[courseId];
      favoriteCourseId = courseId;
    }
  });
  
  if (!favoriteCourseId) return null;
  
  return {
    courseId: favoriteCourseId,
    name: records.find(r => r.courseId === favoriteCourseId)?.courseTitle || '未知课程',
    completedCount: maxCount,
    image: '/static/meditation/default.png'
  };
}

function generateBadges(totalMinutes, totalCount, streakDays) {
  return [
    {
      id: 1,
      name: '初尝禅悦',
      description: '完成第一次冥想',
      emoji: '🌱',
      unlocked: totalCount >= 1
    },
    {
      id: 2,
      name: '持之以恒',
      description: '累计冥想 10 次',
      emoji: '💪',
      unlocked: totalCount >= 10
    },
    {
      id: 3,
      name: '精进不懈',
      description: '累计冥想 50 次',
      emoji: '🔥',
      unlocked: totalCount >= 50
    },
    {
      id: 4,
      name: '百日筑基',
      description: '连续冥想 100 天',
      emoji: '🏆',
      unlocked: streakDays >= 100
    },
    {
      id: 5,
      name: '时间积累',
      description: '累计冥想 1000 分钟',
      emoji: '⏰',
      unlocked: totalMinutes >= 1000
    },
    {
      id: 6,
      name: '深度修行',
      description: '单次冥想 60 分钟',
      emoji: '🧘',
      unlocked: false
    },
    {
      id: 7,
      name: '清晨行者',
      description: '连续 7 天清晨冥想',
      emoji: '🌅',
      unlocked: false
    },
    {
      id: 8,
      name: '夜静心安',
      description: '连续 7 天晚间冥想',
      emoji: '🌙',
      unlocked: false
    },
    {
      id: 9,
      name: '课程大师',
      description: '完成所有入门课程',
      emoji: '📚',
      unlocked: false
    },
    {
      id: 10,
      name: '慈悲喜舍',
      description: '完成所有专题课程',
      emoji: '❤️',
      unlocked: false
    }
  ];
}
