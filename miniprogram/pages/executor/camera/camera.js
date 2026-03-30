/**
 * 清如 ClearSpring V2.0 - 原生拍摄逻辑
 */

Page({
  data: {
    hasPermission: false,
    photoPath: '',
    watermarkText: '',
    flash: 'off'
  },

  onLoad(options) {
    this.checkPermission();
    this.generateWatermark();
  },

  async checkPermission() {
    try {
      const res = await wx.authorize({ scope: 'scope.camera' });
      this.setData({ hasPermission: false });
    } catch (error) {
      this.setData({ hasPermission: true });
    }
  },

  generateWatermark() {
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          watermarkText: `${time}\n经纬度：${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`
        });
      },
      fail: () => {
        this.setData({ watermarkText: time });
      }
    });
  },

  switchCamera() {
    // 切换前后摄像头逻辑
  },

  toggleFlash() {
    this.setData({ flash: this.data.flash === 'off' ? 'on' : 'off' });
  },

  takePhoto() {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({ photoPath: res.tempImagePath });
      }
    });
  },

  retake() {
    this.setData({ photoPath: '' });
  },

  confirmPhoto() {
    if (this.data.photoPath) {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.onPhotoTaken) {
        prevPage.onPhotoTaken(this.data.photoPath);
      }
      wx.navigateBack();
    }
  },

  onCameraError(e) {
    console.error('相机错误:', e);
    wx.showToast({ title: '相机不可用', icon: 'none' });
  },

  requestPermission() {
    wx.openSetting();
  }
});
