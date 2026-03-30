/**
 * 清如 ClearSpring V2.0 - 证据提交逻辑
 */

Page({
  data: {
    taskId: '',
    taskInfo: null,
    mediaList: [],
    description: '',
    descriptionLength: 0,
    locationText: '',
    location: null,
    canSubmit: false
  },

  onLoad(options) {
    if (options.taskId) {
      this.setData({ taskId: options.taskId });
      this.loadTaskInfo(options.taskId);
    }
  },

  async loadTaskInfo(taskId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTaskDetail',
        data: { taskId }
      });
      
      if (res.result && res.result.success) {
        this.setData({
          taskInfo: res.result.data
        });
      }
    } catch (error) {
      console.error('加载任务信息失败:', error);
    }
  },

  uploadMedia() {
    wx.chooseMedia({
      count: 9 - this.data.mediaList.length,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newMedia = res.tempFiles.map(file => ({
          type: file.fileType,
          path: file.tempFilePath
        }));
        
        this.setData({
          mediaList: [...this.data.mediaList, ...newMedia]
        });
        this.checkCanSubmit();
      }
    });
  },

  deleteMedia(e) {
    const index = e.currentTarget.dataset.index;
    const mediaList = this.data.mediaList.filter((_, i) => i !== index);
    this.setData({ mediaList });
    this.checkCanSubmit();
  },

  onDescInput(e) {
    const value = e.detail.value;
    this.setData({
      description: value,
      descriptionLength: value.length
    });
    this.checkCanSubmit();
  },

  selectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          locationText: `${res.name} - ${res.address}`,
          location: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.checkCanSubmit();
      }
    });
  },

  checkCanSubmit() {
    const { mediaList, location } = this.data;
    const canSubmit = mediaList.length > 0 && location !== null;
    this.setData({ canSubmit });
  },

  async submitEvidence() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请完善证据', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认提交',
      content: '确认证据无误并提交？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            
            // 上传媒体文件到云存储
            const uploadedMedia = [];
            for (const media of this.data.mediaList) {
              const fileName = `evidence/${Date.now()}_${Math.random()}`;
              const uploadRes = await wx.cloud.uploadFile({
                cloudPath: fileName,
                filePath: media.path
              });
              uploadedMedia.push({
                type: media.type,
                fileID: uploadRes.fileID
              });
            }
            
            // 提交证据到云函数
            const result = await wx.cloud.callFunction({
              name: 'submitEvidence',
              data: {
                taskId: this.data.taskId,
                media: uploadedMedia,
                description: this.data.description,
                location: this.data.location
              }
            });
            
            wx.hideLoading();
            
            if (result.result && result.result.success) {
              wx.showToast({ title: '提交成功', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 1500);
            } else {
              throw new Error('提交失败');
            }
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '提交失败', icon: 'none' });
          }
        }
      }
    });
  }
});
