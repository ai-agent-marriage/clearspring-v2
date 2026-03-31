/**
 * 清如 ClearSpring V2.0 - 首页逻辑
 * 页面路径：pages/index/index
 * 
 * 功能说明：
 * - 展示法师推荐语
 * - 展示如法性保障声明
 * - 功德快捷入口（今日功德/累计功德/功德林）
 * - 快速放生功能
 * - 底部 TabBar 导航
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,  // 当前选中的 Tab 索引
    todayMeritCount: 0,    // 今日功德数
    totalMeritCount: 0,    // 累计功德数
    meritForestCount: 0,   // 功德林数量
    userInfo: null         // 用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('首页加载完成', options);
    this.loadUserData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.refreshMeritData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshMeritData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 页面上拉触底
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 如法放生平台',
      path: '/pages/index/index',
      imageUrl: '/static/share/index.jpg'
    };
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      // 从本地缓存获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        // 如果没有用户信息，尝试从云开发获取
        await this.fetchUserInfo();
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  /**
   * 从云开发获取用户信息
   */
  async fetchUserInfo() {
    try {
      // 暂时注释掉云函数调用，待后续实现
      /*
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {}
      });
      
      if (res.result && res.result.success) {
        this.setData({ 
          userInfo: res.result.data 
        });
        wx.setStorageSync('userInfo', res.result.data);
      }
      */
      console.log('获取用户信息功能待实现');
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  /**
   * 刷新功德数据
   */
  async refreshMeritData() {
    try {
      // 暂时注释掉云函数调用，待后续实现
      /*
      const res = await wx.cloud.callFunction({
        name: 'getMeritData',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const { todayCount, totalCount, forestCount } = res.result.data;
        this.setData({
          todayMeritCount: todayCount || 0,
          totalMeritCount: totalCount || 0,
          meritForestCount: forestCount || 0
        });
      }
      */
      console.log('获取功德数据功能待实现');
      
      // 使用默认值
      this.setData({
        todayMeritCount: 0,
        totalMeritCount: 0,
        meritForestCount: 0
      });
    } catch (error) {
      console.error('获取功德数据失败:', error);
      // 使用默认值
      this.setData({
        todayMeritCount: 0,
        totalMeritCount: 0,
        meritForestCount: 0
      });
    }
  },

  /**
   * 切换 Tab
   */
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    
    if (index === this.data.currentTab) {
      return;
    }

    const pages = [
      '/pages/index/index',
      '/pages/service/service',
      '/pages/order/order',
      '/pages/profile/profile'
    ];

    if (index < pages.length) {
      wx.switchTab({
        url: pages[index],
        fail: (err) => {
          console.error('切换 Tab 失败:', err);
          // 如果 switchTab 失败，尝试使用 navigateTo
          wx.navigateTo({
            url: pages[index]
          });
        }
      });
    }
  },

  /**
   * 跳转到今日功德页面
   */
  goToTodayMerit() {
    wx.navigateTo({
      url: '/pages/merit/today'
    });
  },

  /**
   * 跳转到累计功德页面
   */
  goToTotalMerit() {
    wx.navigateTo({
      url: '/pages/merit/total'
    });
  },

  /**
   * 跳转到功德林页面
   */
  goToMeritForest() {
    wx.navigateTo({
      url: '/pages/merit-forest/merit-forest'
    });
  },

  /**
   * 快速放生
   */
  quickRelease() {
    // 检查用户是否登录
    if (!this.data.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再进行放生',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    // 跳转到订单创建页面
    wx.navigateTo({
      url: '/pages/order/order?type=quick'
    });
  }
});
