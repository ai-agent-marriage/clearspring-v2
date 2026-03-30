/**
 * 清如 ClearSpring V2.0 - 执行者首页逻辑
 * 页面路径：pages/executor/home/home
 */

Page({
  data: {
    // 收入数据
    totalIncome: '0.00',
    todayIncome: '0.00',
    weekIncome: '0.00',
    monthIncome: '0.00',
    updateTime: '--:--',
    
    // 任务统计
    ongoingTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    
    // 公告
    hasUnreadNotice: false,
    notice: ''
  },

  onLoad() {
    this.loadDashboardData();
  },

  onShow() {
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  async loadDashboardData() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getExecutorDashboard',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const { income, tasks, notice } = res.result.data;
        this.setData({
          totalIncome: income?.total || '0.00',
          todayIncome: income?.today || '0.00',
          weekIncome: income?.week || '0.00',
          monthIncome: income?.month || '0.00',
          updateTime: this.formatTime(new Date()),
          ongoingTasks: tasks?.ongoing || 0,
          pendingTasks: tasks?.pending || 0,
          completedTasks: tasks?.completed || 0,
          notice: notice || '',
          hasUnreadNotice: !!notice
        });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  },

  async refreshData() {
    wx.showLoading({ title: '刷新中...' });
    await this.loadDashboardData();
    wx.hideLoading();
  },

  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  },

  goToIncome() {
    wx.navigateTo({ url: '/pages/executor/income/income' });
  },

  withdraw() {
    wx.showModal({
      title: '提现',
      content: '提现功能开发中',
      showCancel: false
    });
  },

  goToMyTasks(e) {
    const status = e?.currentTarget?.dataset?.status || 'all';
    wx.navigateTo({ url: `/pages/executor/my-tasks/my-tasks?status=${status}` });
  },

  goToOrderHall() {
    wx.switchTab({ url: '/pages/executor/order-hall/order-hall' });
  },

  goToAssistant() {
    wx.navigateTo({ url: '/pages/executor/assistant/assistant' });
  },

  goToEvidence() {
    wx.navigateTo({ url: '/pages/executor/evidence/evidence' });
  },

  viewNotice() {
    wx.showModal({
      title: '平台公告',
      content: this.data.notice,
      showCancel: false
    });
  },

  goToNotification() {
    wx.navigateTo({ url: '/pages/executor/notification/notification' });
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/executor/profile/profile' });
  }
});
