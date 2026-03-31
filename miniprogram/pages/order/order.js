/**
 * 清如 ClearSpring V2.0 - 订单页逻辑
 * 页面路径：pages/order/order
 * 
 * 功能说明：
 * - 订单创建表单（物种/数量/时间/地点）
 * - 订单确认
 * - 订单状态展示（待支付/待执行/已完成）
 * - 支付功能
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 2,  // 当前选中的 Tab 索引（订单页）
    orderMode: 'create',  // 页面模式：create（创建）/ detail（详情）
    isFromTab: false,  // 是否从 Tab 进入
    
    // 订单创建相关
    selectedService: null,  // 选中的服务
    speciesList: [  // 物种列表
      { id: 1, name: '鲫鱼', unit: '份' },
      { id: 2, name: '鲤鱼', unit: '份' },
      { id: 3, name: '泥鳅', unit: '份' },
      { id: 4, name: '乌龟', unit: '只' },
      { id: 5, name: '鸽子', unit: '只' }
    ],
    speciesIndex: 0,  // 选中的物种索引
    selectedSpecies: null,  // 选中的物种
    quantity: 1,  // 数量
    releaseDate: '',  // 放生日期
    blessingTarget: '',  // 祈福对象
    contactPhone: '',  // 联系电话
    orderRemark: '',  // 订单备注
    canSubmit: false,  // 是否可以提交
    phoneInvalid: false,  // 手机号验证状态
    
    // 订单详情相关
    orderDetail: {},  // 订单详情
    statusIcons: {  // 状态图标映射
      pending_payment: 'cuIcon-clock',
      pending_execution: 'cuIcon-check',
      completed: 'cuIcon-roundcheckfill',
      cancelled: 'cuIcon-close'
    },
    statusTexts: {  // 状态文本映射
      pending_payment: '待支付',
      pending_execution: '待执行',
      completed: '已完成',
      cancelled: '已取消'
    },
    
    // 表单验证规则
    phoneRules: [
      { required: true, message: '请输入联系电话' },
      { mobile: true, message: '手机号码格式不正确' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('订单页加载完成', options);
    
    // 判断是否从 Tab 进入
    if (options.fromTab === 'true') {
      this.setData({ isFromTab: true });
    }
    
    // 判断页面模式
    if (options.orderId) {
      // 查看订单详情
      this.setData({ orderMode: 'detail' });
      this.loadOrderDetail(options.orderId);
    } else {
      // 创建订单
      this.setData({ orderMode: 'create' });
      if (options.serviceId) {
        this.loadServiceInfo(options.serviceId);
      }
      if (options.type === 'quick') {
        // 快速放生，使用默认服务
        this.loadDefaultService();
      }
    }
    
    this.checkCanSubmit();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 页面上拉触底
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 如法放生订单',
      path: '/pages/order/order',
      imageUrl: '/static/share/order.jpg'
    };
  },

  /**
   * 加载默认服务（快速放生）
   */
  async loadDefaultService() {
    try {
      // 调用云函数获取默认服务
      const res = await wx.cloud.callFunction({
        name: 'getDefaultService',
        data: {}
      });
      
      if (res.result && res.result.success) {
        this.setData({
          selectedService: res.result.data
        });
      }
    } catch (error) {
      console.error('加载默认服务失败:', error);
      // 使用模拟数据
      this.setData({
        selectedService: {
          id: 1,
          title: '鲫鱼放生',
          price: 99,
          image: '/static/service/crucian.jpg'
        }
      });
    }
  },

  /**
   * 加载服务信息
   */
  async loadServiceInfo(serviceId) {
    try {
      // 调用云函数获取服务详情
      const res = await wx.cloud.callFunction({
        name: 'getServiceDetail',
        data: { serviceId }
      });
      
      if (res.result && res.result.success) {
        this.setData({
          selectedService: res.result.data
        });
      }
    } catch (error) {
      console.error('加载服务信息失败:', error);
    }
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail(orderId) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 调用云函数获取订单详情
      const res = await wx.cloud.callFunction({
        name: 'getOrderDetail',
        data: { orderId }
      });
      
      if (res.result && res.result.success) {
        this.setData({
          orderDetail: res.result.data
        });
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.hideLoading();
      
      // 使用模拟数据
      this.loadMockOrderDetail(orderId);
    }
  },

  /**
   * 加载模拟订单详情（用于开发测试）
   */
  loadMockOrderDetail(orderId) {
    const mockOrder = {
      orderNo: 'CS202603300001',
      createTime: '2026-03-30 10:30:00',
      releaseDate: '2026-04-05',
      blessingTarget: '张三全家',
      contactPhone: '138****8888',
      serviceName: '鲫鱼放生',
      serviceImage: '/static/service/crucian.jpg',
      quantity: 3,
      totalAmount: 297,
      status: 'pending_payment',
      statusDesc: '请在 30 分钟内完成支付'
    };
    
    this.setData({ orderDetail: mockOrder });
  },

  /**
   * 物种选择变化
   */
  onSpeciesChange(e) {
    const index = e.detail.value;
    const species = this.data.speciesList[index];
    
    this.setData({
      speciesIndex: index,
      selectedSpecies: species
    });
    
    this.checkCanSubmit();
  },

  /**
   * 数量减少
   */
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
      this.checkCanSubmit();
    }
  },

  /**
   * 数量增加
   */
  increaseQuantity() {
    if (this.data.quantity < 99) {
      this.setData({
        quantity: this.data.quantity + 1
      });
      this.checkCanSubmit();
    }
  },

  /**
   * 数量输入
   */
  onQuantityInput(e) {
    let value = parseInt(e.detail.value) || 1;
    if (value < 1) value = 1;
    if (value > 99) value = 99;
    
    this.setData({ quantity: value });
    this.checkCanSubmit();
  },

  /**
   * 日期选择变化
   */
  onDateChange(e) {
    this.setData({
      releaseDate: e.detail.value
    });
    this.checkCanSubmit();
  },

  /**
   * 祈福对象输入
   */
  onBlessingInput(e) {
    this.setData({
      blessingTarget: e.detail.value
    });
  },

  /**
   * 联系电话输入
   */
  onPhoneInput(e) {
    const value = e.detail.value;
    this.setData({
      contactPhone: value
    });
    
    // 实时验证手机号
    const validator = this.selectComponent('.phone-validator');
    if (validator) {
      const isValid = validator.validate(value);
      this.setData({ phoneInvalid: !isValid });
    }
    
    this.checkCanSubmit();
  },

  /**
   * 订单备注输入
   */
  onRemarkInput(e) {
    this.setData({
      orderRemark: e.detail.value
    });
  },

  /**
   * 检查是否可以提交
   */
  checkCanSubmit() {
    const { contactPhone, releaseDate } = this.data;
    
    // 必须填写联系电话和放生日期
    const canSubmit = contactPhone.length === 11 && releaseDate !== '';
    
    this.setData({ canSubmit });
  },

  /**
   * 计算总金额
   */
  get totalAmount() {
    const price = this.data.selectedService?.price || 0;
    const quantity = this.data.quantity;
    return price * quantity;
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    // 验证手机号
    const phoneValidator = this.selectComponent('.phone-validator');
    if (phoneValidator) {
      const isPhoneValid = phoneValidator.validate(this.data.contactPhone);
      if (!isPhoneValid) {
        wx.showToast({
          title: '请填写正确的手机号',
          icon: 'none'
        });
        return;
      }
    }
    
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 检查用户是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再创建订单',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    try {
      wx.showLoading({ title: '提交中...' });

      // 准备订单数据
      const orderData = {
        serviceId: this.data.selectedService?.id,
        serviceName: this.data.selectedService?.title,
        servicePrice: this.data.selectedService?.price,
        speciesId: this.data.speciesList[this.data.speciesIndex]?.id,
        speciesName: this.data.speciesList[this.data.speciesIndex]?.name,
        quantity: this.data.quantity,
        releaseDate: this.data.releaseDate,
        blessingTarget: this.data.blessingTarget,
        contactPhone: this.data.contactPhone,
        remark: this.data.orderRemark,
        totalAmount: this.totalAmount
      };

      // 调用云函数创建订单
      const res = await wx.cloud.callFunction({
        name: 'createOrder',
        data: orderData
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        const orderId = res.result.data.orderId;
        
        wx.showModal({
          title: '提交成功',
          content: '订单已提交，请尽快完成支付',
          showCancel: false,
          success: () => {
            // 跳转到订单详情页
            wx.redirectTo({
              url: `/pages/order/order?orderId=${orderId}`
            });
          }
        });
      } else {
        wx.showToast({
          title: res.result?.message || '提交失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 支付订单
   */
  async payOrder() {
    try {
      wx.showLoading({ title: '支付中...' });

      // 调用微信支付
      const res = await wx.cloud.callFunction({
        name: 'payOrder',
        data: {
          orderId: this.data.orderDetail.id
        }
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        // 调用微信支付
        wx.requestPayment({
          ...res.result.payment,
          success: () => {
            wx.showModal({
              title: '支付成功',
              content: '感谢您的放生功德',
              showCancel: false,
              success: () => {
                // 刷新订单详情
                this.loadOrderDetail(this.data.orderDetail.id);
              }
            });
          },
          fail: (err) => {
            console.error('支付失败:', err);
            wx.showToast({
              title: '支付取消',
              icon: 'none'
            });
          }
        });
      } else {
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('支付订单失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '支付失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 查看放生记录
   */
  viewEvidence() {
    wx.navigateTo({
      url: `/pages/evidence/evidence?orderId=${this.data.orderDetail.id}`
    });
  },

  /**
   * 联系客服
   */
  callService() {
    wx.makePhoneCall({
      phoneNumber: '400-888-8888',
      fail: () => {
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 返回
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 切换 Tab
   */
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    
    if (index === this.data.currentTab) {
      return;
    }

    const pages = [
      '/pages/index/index',
      '/pages/service/service',
      '/pages/order/order?fromTab=true',
      '/pages/profile/profile'
    ];

    if (index < pages.length) {
      wx.switchTab({
        url: pages[index],
        fail: (err) => {
          console.error('切换 Tab 失败:', err);
          wx.navigateTo({
            url: pages[index]
          });
        }
      });
    }
  }
});
