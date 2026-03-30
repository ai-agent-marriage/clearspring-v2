/**
 * 冥想统计页
 * 功能：
 * - 累计冥想时长
 * - 累计完成次数
 * - 冥想日历热力图
 * - 成就徽章系统
 */

Page({
  data: {
    // 统计数据
    totalMinutes: 0,
    totalCount: 0,
    streakDays: 0,
    
    // 日历数据
    calendarDays: [],
    
    // 徽章数据
    allBadges: [],
    unlockedBadges: [],
    
    // 周统计
    weekDays: [],
    
    // 最爱课程
    favoriteCourse: null
  },

  onLoad() {
    this.loadStatsData();
  },

  onShow() {
    this.refreshStats();
  },

  onPullDownRefresh() {
    this.loadStatsData();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载统计数据
   */
  async loadStatsData() {
    try {
      // 从本地缓存加载
      const meditationData = wx.getStorageSync('meditationData') || {};
      this.setData({
        totalMinutes: meditationData.totalMinutes || 0,
        totalCount: meditationData.totalCount || 0,
        streakDays: meditationData.streakDays || 0
      });

      // 从云函数获取详细数据
      const res = await wx.cloud.callFunction({
        name: 'getMeditationStats',
        data: {}
      });

      if (res.result && res.result.success) {
        const { stats, calendar, badges, weekStats, favorite } = res.result.data;
        this.setData({
          totalMinutes: stats.totalMinutes || this.data.totalMinutes,
          totalCount: stats.totalCount || this.data.totalCount,
          streakDays: stats.streakDays || this.data.streakDays,
          calendarDays: calendar || this.generateCalendarData(),
          allBadges: badges || this.getAllBadges(),
          unlockedBadges: (badges || []).filter(b => b.unlocked),
          weekDays: weekStats || this.generateWeekData(),
          favoriteCourse: favorite || null
        });
      } else {
        this.loadLocalStats();
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      this.loadLocalStats();
    }
  },

  /**
   * 刷新统计
   */
  refreshStats() {
    const meditationData = wx.getStorageSync('meditationData') || {};
    this.setData({
      totalMinutes: meditationData.totalMinutes || 0,
      totalCount: meditationData.totalCount || 0,
      streakDays: meditationData.streakDays || 0
    });
  },

  /**
   * 加载本地统计数据
   */
  loadLocalStats() {
    this.setData({
      calendarDays: this.generateCalendarData(),
      allBadges: this.getAllBadges(),
      unlockedBadges: this.getAllBadges().filter(b => b.unlocked),
      weekDays: this.generateWeekData()
    });
  },

  /**
   * 生成日历数据（过去 30 天）
   */
  generateCalendarData() {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      const day = date.getDate();
      
      // 模拟数据：随机生成冥想时长
      const randomMinutes = Math.random() > 0.4 ? Math.floor(Math.random() * 30) : 0;
      let level = 0;
      if (randomMinutes > 0) level = 1;
      if (randomMinutes > 10) level = 2;
      if (randomMinutes > 20) level = 3;
      
      days.push({
        date: day.toString(),
        fullDate: dateStr,
        minutes: randomMinutes,
        level: `level-${level}`
      });
    }
    
    return days;
  },

  /**
   * 获取所有徽章
   */
  getAllBadges() {
    const badges = [
      {
        id: 1,
        name: '初尝禅悦',
        description: '完成第一次冥想',
        emoji: '🌱',
        unlocked: this.data.totalCount >= 1
      },
      {
        id: 2,
        name: '持之以恒',
        description: '累计冥想 10 次',
        emoji: '💪',
        unlocked: this.data.totalCount >= 10
      },
      {
        id: 3,
        name: '精进不懈',
        description: '累计冥想 50 次',
        emoji: '🔥',
        unlocked: this.data.totalCount >= 50
      },
      {
        id: 4,
        name: '百日筑基',
        description: '连续冥想 100 天',
        emoji: '🏆',
        unlocked: this.data.streakDays >= 100
      },
      {
        id: 5,
        name: '时间积累',
        description: '累计冥想 1000 分钟',
        emoji: '⏰',
        unlocked: this.data.totalMinutes >= 1000
      },
      {
        id: 6,
        name: '深度修行',
        description: '单次冥想 60 分钟',
        emoji: '🧘',
        unlocked: false // 需要记录单次时长
      },
      {
        id: 7,
        name: '清晨行者',
        description: '连续 7 天清晨冥想',
        emoji: '🌅',
        unlocked: false // 需要记录时间段
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
        unlocked: false // 需要记录课程完成情况
      },
      {
        id: 10,
        name: '慈悲喜舍',
        description: '完成所有专题课程',
        emoji: '❤️',
        unlocked: false
      }
    ];
    
    return badges;
  },

  /**
   * 生成周统计数据
   */
  generateWeekData() {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const currentDay = today.getDay();
    
    // 计算本周的起始日期（周日）
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);
    
    const weekData = [];
    const maxMinutes = 60; // 用于计算柱状图高度的最大值
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // 模拟数据
      const randomMinutes = Math.floor(Math.random() * 40);
      const height = (randomMinutes / maxMinutes) * 100;
      
      weekData.push({
        day: weekDays[i],
        date: date.toISOString().split('T')[0],
        minutes: randomMinutes,
        height: height
      });
    }
    
    return weekData;
  },

  /**
   * 更新徽章状态
   */
  updateBadges() {
    const badges = this.getAllBadges();
    this.setData({
      allBadges: badges,
      unlockedBadges: badges.filter(b => b.unlocked)
    });
  }
});
