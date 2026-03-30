/**
 * 清如 ClearSpring V2.0 - 收入管理逻辑
 */

Page({
  data: {
    currentTab: 'today',
    totalIncome: '0.00',
    todayIncome: '0.00',
    weekIncome: '0.00',
    monthIncome: '0.00',
    availableAmount: '0.00',
    incomeList: [],
    loading: false
  },

  onLoad() {
    this.loadIncomeData();
  },

  onShow() {
    this.refreshIncome();
  },

  onPullDownRefresh() {
    this.refreshIncome();
    wx.stopPullDownRefresh();
  },

  async loadIncomeData() {
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getExecutorIncome',
        data: { tab: this.data.currentTab }
      });
      
      if (res.result && res.result.success) {
        const { total, today, week, month, available, list } = res.result.data;
        this.setData({
          totalIncome: total || '0.00',
          todayIncome: today || '0.00',
          weekIncome: week || '0.00',
          monthIncome: month || '0.00',
          availableAmount: available || '0.00',
          incomeList: list || []
        });
      }
    } catch (error) {
      console.error('加载收入数据失败:', error);
    }
    
    this.setData({ loading: false });
  },

  async refreshIncome() {
    wx.showLoading({ title: '刷新中...' });
    await this.loadIncomeData();
    wx.hideLoading();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadIncomeData();
  },

  showWithdraw() {
    const available = parseFloat(this.data.availableAmount);
    
    if (available < 100) {
      wx.showModal({
        title: '提现提示',
        content: `当前可提现${available.toFixed(2)}元，满 100 元可提现`,
        showCancel: false
      });
      return;
    }

    wx.showModal({
      title: '提现',
      content: `可提现金额：¥${available.toFixed(2)}\n\n请输入提现金额`,
      editable: true,
      placeholderText: '请输入金额（最低 100 元）',
      success: async (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (amount < 100) {
            wx.showToast({ title: '最低提现 100 元', icon: 'none' });
            return;
          }
          if (amount > available) {
            wx.showToast({ title: '余额不足', icon: 'none' });
            return;
          }

          try {
            wx.showLoading({ title: '处理中...' });
            await wx.cloud.callFunction({
              name: 'withdraw',
              data: { amount }
            });
            wx.hideLoading();
            wx.showToast({ title: '提现申请已提交', icon: 'success' });
            this.loadIncomeData();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: '提现失败', icon: 'none' });
          }
        }
      }
    });
  }
});
