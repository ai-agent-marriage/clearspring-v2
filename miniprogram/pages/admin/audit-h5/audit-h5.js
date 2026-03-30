/**
 * 清如 ClearSpring V2.0 - 管理端资质审核 H5 页逻辑
 * 页面路径：pages/admin/audit-h5/audit-h5
 * 
 * 功能说明：
 * - 资质审核列表（移动端优化）
 * - 审核详情（图片预览）
 * - 审核通过/驳回
 * - 驳回原因快捷选择
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前 Tab：0-待审核，1-已通过，2-已驳回
    currentTab: 0,
    pendingCount: 0,
    
    // 审核列表
    auditList: [],
    page: 1,
    pageSize: 10,
    isLastPage: false,
    loading: false,
    
    // 弹窗相关
    showAuditModal: false,
    modalType: 'approve', // approve / reject
    modalTitle: '审核详情',
    currentAudit: {},
    
    // 图片标签
    imgLabels: ['身份证正面', '身份证反面', '放生证', '推荐信'],
    
    // 驳回原因
    rejectReasons: [
      '图片不清晰',
      '资料不完整',
      '身份证过期',
      '证书无效',
      '信息不符',
      '其他'
    ],
    selectedReason: '',
    customReason: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    logger.info('资质审核 H5 页加载完成', options);
    this.loadAuditList();
    this.loadPendingCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 刷新数据
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshList();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 资质审核',
      path: '/pages/admin/audit-h5/audit-h5'
    };
  },

  /**
   * 切换 Tab
   */
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    if (tab === this.data.currentTab) return;
    
    this.setData({
      currentTab: tab,
      auditList: [],
      page: 1,
      isLastPage: false
    });
    
    this.loadAuditList();
    
    // 如果是待审核 Tab，清除未读数
    if (tab === 0) {
      this.setData({ pendingCount: 0 });
    }
  },

  /**
   * 加载审核列表
   */
  async loadAuditList() {
    if (this.data.loading || this.data.isLastPage) return;
    
    this.setData({ loading: true });
    
    try {
      // 调用云函数获取审核列表
      const res = await wx.cloud.callFunction({
        name: 'getAuditList',
        data: {
          status: this.data.currentTab,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });
      
      if (res.result && res.result.success) {
        const { list, total, hasMore } = res.result.data;
        
        // 转换数据格式
        const auditList = list.map(item => this.formatAuditItem(item));
        
        this.setData({
          auditList: this.data.page === 1 ? auditList : [...this.data.auditList, ...auditList],
          page: this.data.page + 1,
          isLastPage: !hasMore,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载审核列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 加载待审核数量
   */
  async loadPendingCount() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getPendingAuditCount',
        data: {}
      });
      
      if (res.result && res.result.success) {
        this.setData({ pendingCount: res.result.data.count || 0 });
      }
    } catch (error) {
      console.error('加载待审核数量失败:', error);
    }
  },

  /**
   * 格式化审核项
   */
  formatAuditItem(item) {
    const statusMap = {
      0: { class: 'pending', text: '待审核' },
      1: { class: 'approved', text: '已通过' },
      2: { class: 'rejected', text: '已驳回' }
    };
    
    const statusInfo = statusMap[item.status] || statusMap[0];
    
    // 计算资料完整性
    const imageCount = (item.images || []).length;
    const completeness = Math.min(100, Math.round((imageCount / 4) * 100));
    
    return {
      ...item,
      statusClass: statusInfo.class,
      statusText: statusInfo.text,
      completeness,
      previewImages: (item.images || []).slice(0, 3),
      applyTime: this.formatTime(item.applyTime),
      auditTime: item.auditTime ? this.formatTime(item.auditTime) : ''
    };
  },

  /**
   * 刷新列表
   */
  async refreshList() {
    this.setData({
      auditList: [],
      page: 1,
      isLastPage: false
    });
    
    await this.loadAuditList();
    await this.loadPendingCount();
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (!this.data.loading && !this.data.isLastPage) {
      this.loadAuditList();
    }
  },

  /**
   * 查看详情
   */
  viewDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      showAuditModal: true,
      modalType: 'approve',
      modalTitle: '审核详情',
      currentAudit: item,
      selectedReason: '',
      customReason: ''
    });
  },

  /**
   * 隐藏弹窗
   */
  hideAuditModal() {
    this.setData({
      showAuditModal: false,
      selectedReason: '',
      customReason: ''
    });
  },

  /**
   * 通过审核
   */
  approveAudit(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      showAuditModal: true,
      modalType: 'approve',
      modalTitle: '确认通过',
      currentAudit: item
    });
  },

  /**
   * 驳回审核
   */
  rejectAudit(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      showAuditModal: true,
      modalType: 'reject',
      modalTitle: '确认驳回',
      currentAudit: item,
      selectedReason: '',
      customReason: ''
    });
  },

  /**
   * 选择驳回原因
   */
  selectReason(e) {
    const reason = e.currentTarget.dataset.reason;
    this.setData({ selectedReason: reason });
  },

  /**
   * 驳回原因输入
   */
  onReasonInput(e) {
    this.setData({ customReason: e.detail.value });
  },

  /**
   * 确认审核
   */
  async confirmAudit() {
    const { modalType, currentAudit, selectedReason, customReason } = this.data;
    
    // 驳回需要选择原因
    if (modalType === 'reject' && !selectedReason && !customReason) {
      wx.showToast({ title: '请选择或填写驳回原因', icon: 'none' });
      return;
    }
    
    try {
      wx.showLoading({ title: '处理中...' });
      
      const result = await wx.cloud.callFunction({
        name: 'auditQualification',
        data: {
          auditId: currentAudit.id,
          userId: currentAudit.userId,
          action: modalType,
          rejectReason: modalType === 'reject' ? (selectedReason || customReason) : ''
        }
      });
      
      wx.hideLoading();
      
      if (result.result && result.result.success) {
        wx.showToast({ 
          title: modalType === 'approve' ? '已通过' : '已驳回', 
          icon: 'success' 
        });
        
        this.hideAuditModal();
        this.refreshList();
      } else {
        throw new Error(result.result?.message || '操作失败');
      }
    } catch (error) {
      console.error('审核操作失败:', error);
      wx.hideLoading();
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    
    wx.previewImage({
      urls: this.data.currentAudit.images || [],
      current: src
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 1 分钟内
    if (diff < 60000) return '刚刚';
    
    // 1 小时内
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }
    
    // 24 小时内
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    
    // 格式化日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // 今年不显示年份
    if (year === now.getFullYear()) {
      return `${month}-${day} ${hours}:${minutes}`;
    }
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
});
