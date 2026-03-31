/**
 * 清如 ClearSpring V2.0 - 个人中心页逻辑
 * 页面路径：pages/profile/profile
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    todayMeritCount: 0,
    totalMeritCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('个人中心页加载完成', options);
    this.loadUserInfo();
    this.loadMeritData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserInfo();
    this.loadMeritData();
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  /**
   * 加载功德数据
   */
  async loadMeritData() {
    try {
      // TODO: 调用云函数获取功德数据
      // 暂时使用模拟数据
      this.setData({
        todayMeritCount: 3,
        totalMeritCount: 28
      });
    } catch (error) {
      console.error('加载功德数据失败:', error);
    }
  },

  /**
   * 跳转到登录页
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({ userInfo: {} });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 跳转到今日功德页
   */
  goToTodayMerit() {
    wx.navigateTo({
      url: '/pages/merit/today'
    });
  },

  /**
   * 跳转到累计功德页
   */
  goToTotalMerit() {
    wx.navigateTo({
      url: '/pages/merit/total'
    });
  },

  /**
   * 跳转到订单列表页
   */
  goToOrders() {
    wx.navigateTo({
      url: '/pages/order/list'
    });
  },

  /**
   * 跳转到功德林页
   */
  goToMeritForest() {
    wx.navigateTo({
      url: '/pages/merit-forest/merit-forest'
    });
  },

  /**
   * 跳转到设置页
   */
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});
