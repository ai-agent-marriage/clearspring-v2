/**
 * 清如 ClearSpring V2.0 - 登录页逻辑
 * 页面路径：pages/login/login
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    code: '',
    phoneInvalid: false,
    isLoading: false,
    canSendCode: true,
    sendCodeText: '获取验证码',
    agreeProtocol: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('登录页加载完成', options);
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ 
      phone,
      phoneInvalid: false
    });
  },

  /**
   * 验证码输入
   */
  onCodeInput(e) {
    const code = e.detail.value;
    this.setData({ code });
  },

  /**
   * 发送验证码
   */
  sendCode() {
    if (!this.data.canSendCode) return;

    // 验证手机号
    if (!this.validatePhone()) {
      this.setData({ phoneInvalid: true });
      return;
    }

    // 模拟发送验证码
    this.setData({
      canSendCode: false,
      sendCodeText: '60s 后重发'
    });

    // 倒计时
    let seconds = 60;
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        this.setData({
          canSendCode: true,
          sendCodeText: '获取验证码'
        });
      } else {
        this.setData({
          sendCodeText: `${seconds}s 后重发`
        });
      }
    }, 1000);

    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },

  /**
   * 切换协议同意状态
   */
  toggleAgreement() {
    this.setData({
      agreeProtocol: !this.data.agreeProtocol
    });
  },

  /**
   * 查看用户协议
   */
  viewAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '感谢您使用清如 ClearSpring 放生服务平台...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 查看隐私政策
   */
  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 登录
   */
  async login() {
    // 验证协议
    if (!this.data.agreeProtocol) {
      wx.showModal({
        title: '提示',
        content: '请先同意用户协议和隐私政策',
        showCancel: false
      });
      return;
    }

    // 验证手机号
    if (!this.validatePhone()) {
      this.setData({ phoneInvalid: true });
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号码',
        showCancel: false
      });
      return;
    }

    // 验证验证码
    if (!this.data.code || this.data.code.length !== 6) {
      wx.showModal({
        title: '提示',
        content: '请输入 6 位验证码',
        showCancel: false
      });
      return;
    }

    // 执行登录
    this.setData({ isLoading: true });

    try {
      // TODO: 调用云函数登录
      // 模拟登录成功
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 保存用户信息
      const userInfo = {
        phone: this.data.phone,
        nickName: '用户_' + this.data.phone.substr(7, 4),
        avatarUrl: '/static/avatar/default.png'
      };
      
      wx.setStorageSync('userInfo', userInfo);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 返回上一页或跳转到首页
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1000);

    } catch (error) {
      console.error('登录失败:', error);
      wx.showModal({
        title: '登录失败',
        content: '请稍后重试',
        showCancel: false
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 验证手机号
   */
  validatePhone() {
    const phone = this.data.phone;
    return /^1[3-9]\d{9}$/.test(phone);
  }
});
