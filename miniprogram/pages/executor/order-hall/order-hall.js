/**
 * 清如 ClearSpring V2.0 - 抢单大厅逻辑
 */

Page({
  data: {
    currentFilter: 'all',
    orderList: [],
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.refreshOrders();
  },

  async loadOrders() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          filter: this.data.currentFilter,
          status: 'available'
        }
      });
      
      if (res.result && res.result.success) {
        this.setData({
          orderList: res.result.data || [],
          hasMore: res.result.hasMore || false
        });
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    }
    
    this.setData({ loading: false });
  },

  async refreshOrders() {
    wx.showLoading({ title: '刷新中...' });
    await this.loadOrders();
    wx.hideLoading();
  },

  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentFilter: type });
    this.loadOrders();
  },

  async grabOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认抢单',
      content: '确定要接取这个任务吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '抢单中...' });
            
            const result = await wx.cloud.callFunction({
              name: 'grabOrder',
              data: { orderId }
            });
            
            wx.hideLoading();
            
            if (result.result && result.result.success) {
              wx.showToast({ title: '抢单成功', icon: 'success' });
              this.loadOrders();
            } else {
              throw new Error(result.result?.message || '抢单失败');
            }
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '抢单失败', icon: 'none' });
          }
        }
      }
    });
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  goToHome() {
    wx.switchTab({ url: '/pages/executor/home/home' });
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/executor/my-tasks/my-tasks' });
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/executor/profile/profile' });
  }
});
