/**
 * 清如 ClearSpring V2.0 - 执行者端资质审核页逻辑
 * 页面路径：pages/executor/qualification/qualification
 * 
 * 功能说明：
 * - 资质资料上传（身份证/放生证/推荐信）
 * - 实时审核状态展示
 * - 审核进度条
 * - 个人信息确认
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 审核状态：0-待提交，1-审核中，2-审核通过，3-审核驳回
    auditStatus: 0,
    currentStep: 1,
    progress: 33,
    statusClass: 'pending',
    statusText: '待提交',
    
    // 上传图片
    idCardFront: '',
    idCardBack: '',
    releaseCert: '',
    recommendLetter: '',
    
    // 用户信息
    userInfo: null,
    maskedPhone: '',
    maskedIdCard: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    logger.info('资质审核页加载完成', options);
    this.loadUserInfo();
    this.loadQualificationStatus();
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
    this.loadQualificationStatus();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 执行者资质审核',
      path: '/pages/executor/qualification/qualification'
    };
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ 
          userInfo,
          maskedPhone: this.maskPhone(userInfo.phone || ''),
          maskedIdCard: this.maskIdCard(userInfo.idCard || '')
        });
      } else {
        // 尝试从云开发获取
        await this.fetchUserInfo();
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  /**
   * 从云开发获取用户信息
   */
  async fetchUserInfo() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const userInfo = res.result.data;
        this.setData({
          userInfo,
          maskedPhone: this.maskPhone(userInfo.phone || ''),
          maskedIdCard: this.maskIdCard(userInfo.idCard || '')
        });
        wx.setStorageSync('userInfo', userInfo);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  /**
   * 加载资质审核状态
   */
  async loadQualificationStatus() {
    try {
      // 调用云函数获取审核状态
      const res = await wx.cloud.callFunction({
        name: 'getQualificationStatus',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const { status, auditTime, rejectReason } = res.result.data;
        this.updateStatus(status);
        
        // 如果有已上传的图片，加载回来
        if (res.result.images) {
          this.setData({
            idCardFront: res.result.images.idCardFront || '',
            idCardBack: res.result.images.idCardBack || '',
            releaseCert: res.result.images.releaseCert || '',
            recommendLetter: res.result.images.recommendLetter || ''
          });
        }
        
        // 如果是驳回状态，显示驳回原因
        if (status === 3 && rejectReason) {
          wx.showModal({
            title: '审核驳回',
            content: rejectReason,
            showCancel: false,
            confirmText: '重新提交'
          });
        }
      }
    } catch (error) {
      console.error('加载审核状态失败:', error);
    }
  },

  /**
   * 更新审核状态显示
   */
  updateStatus(status) {
    const statusMap = {
      0: { step: 1, progress: 33, class: 'pending', text: '待提交' },
      1: { step: 2, progress: 66, class: 'auditing', text: '审核中' },
      2: { step: 3, progress: 100, class: 'approved', text: '审核通过' },
      3: { step: 1, progress: 33, class: 'rejected', text: '审核驳回' }
    };
    
    const statusInfo = statusMap[status] || statusMap[0];
    this.setData({
      auditStatus: status,
      currentStep: statusInfo.step,
      progress: statusInfo.progress,
      statusClass: statusInfo.class,
      statusText: statusInfo.text
    });
  },

  /**
   * 上传图片
   */
  uploadImage(e) {
    const type = e.currentTarget.dataset.type;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 显示上传中提示
        wx.showLoading({ title: '上传中...' });
        
        // 上传图片到云存储
        const fileName = `qualification/${Date.now()}_${type}.jpg`;
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: tempFilePath,
          success: (uploadRes) => {
            // 更新本地显示
            const updateData = {};
            updateData[type] = uploadRes.fileID;
            this.setData(updateData);
            
            wx.hideLoading();
            wx.showToast({ title: '上传成功', icon: 'success' });
            
            // 检查是否可以提交
            this.checkCanSubmit();
          },
          fail: (err) => {
            console.error('上传失败:', err);
            wx.hideLoading();
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  /**
   * 检查是否可以提交
   */
  checkCanSubmit() {
    const { idCardFront, idCardBack, releaseCert, recommendLetter } = this.data;
    const canSubmit = !!(idCardFront && idCardBack && releaseCert && recommendLetter);
    this.setData({ canSubmit });
  },

  /**
   * 提交审核
   */
  async submitQualification() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请上传完整资料', icon: 'none' });
      return;
    }

    // 确认提交
    wx.showModal({
      title: '确认提交',
      content: '请确保所有资料真实有效，提交后将进入审核流程',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            
            // 调用云函数提交审核
            const result = await wx.cloud.callFunction({
              name: 'submitQualification',
              data: {
                idCardFront: this.data.idCardFront,
                idCardBack: this.data.idCardBack,
                releaseCert: this.data.releaseCert,
                recommendLetter: this.data.recommendLetter,
                userInfo: this.data.userInfo
              }
            });
            
            wx.hideLoading();
            
            if (result.result && result.result.success) {
              wx.showToast({ title: '提交成功', icon: 'success' });
              // 更新状态为审核中
              this.updateStatus(1);
            } else {
              throw new Error(result.result?.message || '提交失败');
            }
          } catch (error) {
            console.error('提交审核失败:', error);
            wx.hideLoading();
            wx.showToast({ title: error.message || '提交失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 手机号脱敏
   */
  maskPhone(phone) {
    if (!phone || phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  /**
   * 身份证号脱敏
   */
  maskIdCard(idCard) {
    if (!idCard || idCard.length < 10) return idCard;
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }
});
