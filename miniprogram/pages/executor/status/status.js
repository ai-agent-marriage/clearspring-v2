/**
 * 清如 ClearSpring V2.0 - 执行者端审核状态页逻辑
 * 页面路径：pages/executor/status/status
 * 
 * 功能说明：
 * - 审核结果展示（通过/驳回/待审核）
 * - 驳回原因说明
 * - 重新提交入口
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 审核状态：0-待提交，1-审核中，2-审核通过，3-审核驳回
    auditStatus: 0,
    resultClass: 'pending',
    resultIcon: 'cuIcon-time',
    resultTitle: '待提交',
    resultDesc: '请前往资质审核页提交相关资料',
    auditTime: '',
    rejectReason: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    logger.info('审核状态页加载完成', options);
    this.loadAuditStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 刷新状态
    this.loadAuditStatus();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadAuditStatus();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 审核状态',
      path: '/pages/executor/status/status'
    };
  },

  /**
   * 加载审核状态
   */
  async loadAuditStatus() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await wx.cloud.callFunction({
        name: 'getQualificationStatus',
        data: {}
      });
      
      wx.hideLoading();
      
      if (res.result && res.result.success) {
        const { status, auditTime, rejectReason } = res.result.data;
        this.updateStatusDisplay(status, auditTime, rejectReason);
      }
    } catch (error) {
      console.error('加载审核状态失败:', error);
      wx.hideLoading();
      // 默认显示待提交状态
      this.updateStatusDisplay(0, '', '');
    }
  },

  /**
   * 更新状态显示
   */
  updateStatusDisplay(status, auditTime, rejectReason) {
    const statusMap = {
      0: {
        class: 'pending',
        icon: 'cuIcon-edit',
        title: '待提交',
        desc: '请前往资质审核页提交相关资料'
      },
      1: {
        class: 'auditing',
        icon: 'cuIcon-time',
        title: '审核中',
        desc: '您的资料正在审核中，预计 1-3 个工作日内完成'
      },
      2: {
        class: 'approved',
        icon: 'cuIcon-fillcheck',
        title: '审核通过',
        desc: '恭喜您！已成为认证执行者，可以开始接取任务了'
      },
      3: {
        class: 'rejected',
        icon: 'cuIcon-close',
        title: '审核驳回',
        desc: '很抱歉，您的资料未通过审核，请根据提示重新提交'
      }
    };

    const statusInfo = statusMap[status] || statusMap[0];
    
    this.setData({
      auditStatus: status,
      resultClass: statusInfo.class,
      resultIcon: statusInfo.icon,
      resultTitle: statusInfo.title,
      resultDesc: statusInfo.desc,
      auditTime: auditTime || '',
      rejectReason: rejectReason || ''
    });
  },

  /**
   * 跳转到抢单大厅
   */
  goToOrderHall() {
    wx.switchTab({
      url: '/pages/executor/order-hall/order-hall'
    });
  },

  /**
   * 跳转到任务助手
   */
  goToAssistant() {
    wx.navigateTo({
      url: '/pages/executor/assistant/assistant'
    });
  },

  /**
   * 跳转到收入管理
   */
  goToIncome() {
    wx.navigateTo({
      url: '/pages/executor/income/income'
    });
  },

  /**
   * 重新提交
   */
  resubmit() {
    wx.navigateTo({
      url: '/pages/executor/qualification/qualification'
    });
  }
});
