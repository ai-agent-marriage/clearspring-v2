/**
 * 清如 ClearSpring V2.0 - 小程序入口
 * 
 * 功能说明：
 * - 初始化云开发环境
 * - 全局数据管理
 * - 生命周期管理
 */

App({
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    systemInfo: null,
    version: '2.0.0'
  },

  /**
   * 生命周期函数--监听小程序初始化
   */
  onLaunch() {
    console.log('清如 ClearSpring V2.0 启动');
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    console.log('系统信息:', systemInfo);

    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-7ga68ls3ccebbe5b',
        traceUser: true
      });
      console.log('云开发环境初始化成功');
    }

    // 检查用户登录状态
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听小程序显示
   */
  onShow() {
    console.log('小程序显示');
  },

  /**
   * 生命周期函数--监听小程序隐藏
   */
  onHide() {
    console.log('小程序隐藏');
  },

  /**
   * 检查用户登录状态
   */
  async checkLoginStatus() {
    try {
      // 从本地缓存获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        logger.info('用户已登录:', userInfo);
      } else {
        logger.info('用户未登录');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.globalData.userInfo;
  },

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  }
});
