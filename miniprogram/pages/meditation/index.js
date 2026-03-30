/**
 * 冥想首页
 * 功能：
 * - 冥想分类（入门/进阶/专题）
 * - 推荐冥想课程
 * - 冥想时长统计
 * - 连续打卡天数
 */

Page({
  data: {
    // 统计数据
    totalMinutes: 0,
    totalCount: 0,
    streakDays: 0,
    isCheckedIn: false,
    
    // 推荐课程
    recommendedCourses: []
  },

  onLoad() {
    this.loadMeditationData();
    this.loadRecommendedCourses();
  },

  onShow() {
    this.refreshCheckinStatus();
  },

  onPullDownRefresh() {
    this.loadMeditationData();
    this.loadRecommendedCourses();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载冥想统计数据
   */
  async loadMeditationData() {
    try {
      // 从本地缓存加载
      const meditationData = wx.getStorageSync('meditationData') || {};
      this.setData({
        totalMinutes: meditationData.totalMinutes || 0,
        totalCount: meditationData.totalCount || 0,
        streakDays: meditationData.streakDays || 0
      });

      // 从云函数获取最新数据
      const res = await wx.cloud.callFunction({
        name: 'getMeditationData',
        data: {}
      });

      if (res.result && res.result.success) {
        const { totalMinutes, totalCount, streakDays } = res.result.data;
        this.setData({
          totalMinutes,
          totalCount,
          streakDays
        });
        // 更新本地缓存
        wx.setStorageSync('meditationData', {
          totalMinutes,
          totalCount,
          streakDays
        });
      }
    } catch (error) {
      console.error('加载冥想数据失败:', error);
    }
  },

  /**
   * 加载推荐课程
   */
  async loadRecommendedCourses() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRecommendedCourses',
        data: {
          limit: 3
        }
      });

      if (res.result && res.result.success) {
        this.setData({
          recommendedCourses: res.result.courses || []
        });
      } else {
        // 使用本地默认数据
        this.setData({
          recommendedCourses: this.getDefaultRecommendedCourses()
        });
      }
    } catch (error) {
      console.error('加载推荐课程失败:', error);
      this.setData({
        recommendedCourses: this.getDefaultRecommendedCourses()
      });
    }
  },

  /**
   * 获取默认推荐课程
   */
  getDefaultRecommendedCourses() {
    return [
      {
        id: 1,
        name: '呼吸观察',
        duration: 10,
        level: '入门',
        image: '/static/meditation/breath.png',
        count: 1280
      },
      {
        id: 2,
        name: '身体扫描',
        duration: 15,
        level: '入门',
        image: '/static/meditation/body.png',
        count: 956
      },
      {
        id: 3,
        name: '减压冥想',
        duration: 20,
        level: '专题',
        image: '/static/meditation/stress.png',
        count: 2103
      }
    ];
  },

  /**
   * 刷新签到状态
   */
  refreshCheckinStatus() {
    const today = new Date().toDateString();
    const lastCheckin = wx.getStorageSync('lastCheckinDate') || '';
    this.setData({
      isCheckedIn: lastCheckin === today
    });
  },

  /**
   * 跳转到课程列表
   */
  goToCourses(e) {
    const category = e.currentTarget.dataset.category || '';
    wx.navigateTo({
      url: `/pages/meditation/courses?category=${category}`
    });
  },

  /**
   * 跳转到播放页
   */
  goToPlayer(e) {
    const course = e.currentTarget.dataset.course;
    wx.navigateTo({
      url: `/pages/meditation/player?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`
    });
  },

  /**
   * 处理签到
   */
  async handleCheckin() {
    if (this.data.isCheckedIn) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    try {
      // 更新本地签到状态
      const today = new Date().toDateString();
      wx.setStorageSync('lastCheckinDate', today);

      // 调用云函数记录签到
      await wx.cloud.callFunction({
        name: 'meditationCheckin',
        data: {
          date: today
        }
      });

      this.setData({ isCheckedIn: true });
      
      wx.showToast({
        title: '签到成功',
        icon: 'success'
      });

      // 更新连续天数
      this.loadMeditationData();
    } catch (error) {
      console.error('签到失败:', error);
      wx.showToast({
        title: '签到失败',
        icon: 'none'
      });
    }
  }
});
