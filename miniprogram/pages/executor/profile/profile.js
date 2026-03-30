/**
 * 清如 ClearSpring V2.0 - 执行者个人中心逻辑
 */

Page({
  data: {
    userInfo: null,
    isLogin: false,
    totalTasks: 0,
    rating: '0%',
    totalIncome: '0.00',
    qualificationText: '未认证',
    qualificationClass: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.refreshData();
  },

  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ 
          userInfo,
          isLogin: true
        });
        this.loadExecutorStats();
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  async loadExecutorStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getExecutorStats',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const { totalTasks, rating, totalIncome, qualification } = res.result.data;
        this.setData({
          totalTasks: totalTasks || 0,
          rating: `${rating || 0}%`,
          totalIncome: totalIncome || '0.00',
          ...this.getQualificationInfo(qualification)
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  getQualificationInfo(status) {
    const map = {
      0: { text: '未认证', class: '' },
      1: { text: '审核中', class: 'pending' },
      2: { text: '已认证', class: 'approved' },
      3: { text: '已驳回', class: 'rejected' }
    };
    return map[status] || map[0];
  },

  async refreshData() {
    wx.showLoading({ title: '刷新中...' });
    await this.loadUserInfo();
    wx.hideLoading();
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/executor/edit-profile/edit-profile' });
  },

  goToQualification() {
    wx.navigateTo({ url: '/pages/executor/qualification/qualification' });
  },

  goToMyTasks() {
    wx.switchTab({ url: '/pages/executor/my-tasks/my-tasks' });
  },

  goToIncome() {
    wx.navigateTo({ url: '/pages/executor/income/income' });
  },

  goToAssistant() {
    wx.navigateTo({ url: '/pages/executor/assistant/assistant' });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/executor/settings/settings' });
  },

  goToHelp() {
    wx.navigateTo({ url: '/pages/executor/help/help' });
  },

  goToAbout() {
    wx.navigateTo({ url: '/pages/executor/about/about' });
  },

  goToHome() {
    wx.switchTab({ url: '/pages/executor/home/home' });
  },

  goToOrderHall() {
    wx.switchTab({ url: '/pages/executor/order-hall/order-hall' });
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/executor/my-tasks/my-tasks' });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({
            userInfo: null,
            isLogin: false,
            totalTasks: 0,
            rating: '0%',
            totalIncome: '0.00'
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  }
});
