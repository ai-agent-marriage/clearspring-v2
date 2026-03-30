/**
 * 清如 ClearSpring V2.0 - 管理端申诉仲裁 H5 页逻辑
 * 页面路径：pages/admin/arbitration-h5/arbitration-h5
 * 
 * 功能说明：
 * - 申诉列表
 * - 申诉详情（订单信息 + 执行者说明）
 * - 仲裁处理
 * - 仲裁记录查看
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 筛选条件
    currentFilter: 'all', // all / pending / processed
    pendingCount: 0,
    
    // 仲裁列表
    arbitrationList: [],
    page: 1,
    pageSize: 10,
    isLastPage: false,
    loading: false,
    
    // 弹窗相关
    showArbitrationModal: false,
    currentAppeal: {},
    
    // 仲裁表单
    arbitrationResult: '', // support / reject / mediate
    arbitrationNote: '',
    canSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    logger.info('申诉仲裁 H5 页加载完成', options);
    this.loadArbitrationList();
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
      title: '清如 · ClearSpring - 申诉仲裁',
      path: '/pages/admin/arbitration-h5/arbitration-h5'
    };
  },

  /**
   * 设置筛选条件
   */
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter === this.data.currentFilter) return;
    
    this.setData({
      currentFilter: filter,
      arbitrationList: [],
      page: 1,
      isLastPage: false
    });
    
    this.loadArbitrationList();
    
    // 如果是待处理，清除未读数
    if (filter === 'pending') {
      this.setData({ pendingCount: 0 });
    }
  },

  /**
   * 加载仲裁列表
   */
  async loadArbitrationList() {
    if (this.data.loading || this.data.isLastPage) return;
    
    this.setData({ loading: true });
    
    try {
      // 调用云函数获取仲裁列表
      const res = await wx.cloud.callFunction({
        name: 'getArbitrationList',
        data: {
          filter: this.data.currentFilter,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });
      
      if (res.result && res.result.success) {
        const { list, hasMore } = res.result.data;
        
        // 转换数据格式
        const arbitrationList = list.map(item => this.formatArbitrationItem(item));
        
        this.setData({
          arbitrationList: this.data.page === 1 ? arbitrationList : [...this.data.arbitrationList, ...arbitrationList],
          page: this.data.page + 1,
          isLastPage: !hasMore,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载仲裁列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /**
   * 加载待处理数量
   */
  async loadPendingCount() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getPendingArbitrationCount',
        data: {}
      });
      
      if (res.result && res.result.success) {
        this.setData({ pendingCount: res.result.data.count || 0 });
      }
    } catch (error) {
      console.error('加载待处理数量失败:', error);
    }
  },

  /**
   * 格式化仲裁项
   */
  formatArbitrationItem(item) {
    const statusMap = {
      0: { class: 'pending', text: '待处理' },
      1: { class: 'processed', text: '已处理' }
    };
    
    const statusInfo = statusMap[item.status] || statusMap[0];
    
    // 仲裁结果映射
    const resultMap = {
      'support': { class: 'support', text: '支持申诉' },
      'reject': { class: 'reject', text: '驳回申诉' },
      'mediate': { class: 'mediate', text: '调解处理' }
    };
    
    const resultInfo = item.result ? resultMap[item.result] : null;
    
    return {
      ...item,
      statusClass: statusInfo.class,
      statusText: statusInfo.text,
      resultClass: resultInfo ? resultInfo.class : '',
      resultText: resultInfo ? resultInfo.text : '',
      appealTime: this.formatTime(item.appealTime),
      processTime: item.processTime ? this.formatTime(item.processTime) : '',
      serviceTime: this.formatTime(item.serviceTime)
    };
  },

  /**
   * 刷新列表
   */
  async refreshList() {
    this.setData({
      arbitrationList: [],
      page: 1,
      isLastPage: false
    });
    
    await this.loadArbitrationList();
    await this.loadPendingCount();
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (!this.data.loading && !this.data.isLastPage) {
      this.loadArbitrationList();
    }
  },

  /**
   * 查看详情
   */
  viewDetail(e) {
    const item = e.currentTarget.dataset.item;
    
    // 如果是已处理，直接显示详情
    if (item.status === 1) {
      this.setData({
        showArbitrationModal: true,
        currentAppeal: item,
        arbitrationResult: item.result || '',
        arbitrationNote: item.arbitrationNote || ''
      });
    } else {
      // 待处理，显示处理表单
      this.setData({
        showArbitrationModal: true,
        currentAppeal: item,
        arbitrationResult: '',
        arbitrationNote: '',
        canSubmit: false
      });
    }
  },

  /**
   * 隐藏弹窗
   */
  hideArbitrationModal() {
    this.setData({
      showArbitrationModal: false,
      arbitrationResult: '',
      arbitrationNote: ''
    });
  },

  /**
   * 处理申诉
   */
  processAppeal(e) {
    const item = e.currentTarget.dataset.item;
    
    this.setData({
      showArbitrationModal: true,
      currentAppeal: item,
      arbitrationResult: '',
      arbitrationNote: '',
      canSubmit: false
    });
  },

  /**
   * 选择仲裁结果
   */
  selectResult(e) {
    const result = e.currentTarget.dataset.result;
    this.setData({ 
      arbitrationResult: result,
      canSubmit: !!result
    });
  },

  /**
   * 仲裁说明输入
   */
  onNoteInput(e) {
    const note = e.detail.value;
    this.setData({ 
      arbitrationNote: note,
      canSubmit: !!this.data.arbitrationResult
    });
  },

  /**
   * 预览凭证
   */
  previewEvidence(e) {
    const src = e.currentTarget.dataset.src;
    
    wx.previewImage({
      urls: this.data.currentAppeal.evidence || [],
      current: src
    });
  },

  /**
   * 提交仲裁
   */
  async submitArbitration() {
    const { currentAppeal, arbitrationResult, arbitrationNote } = this.data;
    
    if (!arbitrationResult) {
      wx.showToast({ title: '请选择仲裁结果', icon: 'none' });
      return;
    }
    
    if (!arbitrationNote || arbitrationNote.length < 10) {
      wx.showToast({ title: '请填写仲裁说明（至少 10 字）', icon: 'none' });
      return;
    }
    
    // 确认提交
    wx.showModal({
      title: '确认提交',
      content: '仲裁结果提交后将无法修改，请确认是否提交？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            
            const result = await wx.cloud.callFunction({
              name: 'submitArbitration',
              data: {
                appealId: currentAppeal.id,
                result: arbitrationResult,
                note: arbitrationNote
              }
            });
            
            wx.hideLoading();
            
            if (result.result && result.result.success) {
              wx.showToast({ title: '提交成功', icon: 'success' });
              this.hideArbitrationModal();
              this.refreshList();
            } else {
              throw new Error(result.result?.message || '提交失败');
            }
          } catch (error) {
            console.error('提交仲裁失败:', error);
            wx.hideLoading();
            wx.showToast({ title: error.message || '提交失败', icon: 'none' });
          }
        }
      }
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
