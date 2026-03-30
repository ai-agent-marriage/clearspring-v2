/**
 * 清如 ClearSpring V2.0 - 任务助手逻辑
 */

Page({
  data: {
    taskId: '',
    taskStatus: 'pending',
    statusText: '待开始',
    taskInfo: {
      species: '',
      quantity: 0,
      location: '',
      requiredTime: ''
    },
    guideSteps: [
      { index: 1, title: '准备物资', desc: '检查放生工具、容器、氧气泵等是否齐全' },
      { index: 2, title: '到达地点', desc: '按照导航到达指定放生地点，确保环境适宜' },
      { index: 3, title: '念诵仪轨', desc: '依循放生仪轨念诵，心怀慈悲' },
      { index: 4, title: '实施放生', desc: '轻柔地将生物放入水中/自然环境中' },
      { index: 5, title: '拍照记录', desc: '拍摄放生过程照片/视频作为凭证' },
      { index: 6, title: '提交证据', desc: '在小程序中上传证据，完成任务' }
    ],
    tips: [
      '放生前请确保生物健康，避免放生生病个体',
      '选择合适的时间和地点，避免极端天气',
      '放生过程要轻柔，避免对生物造成伤害',
      '遵守当地法律法规，不在禁止区域放生',
      '保持环境整洁，不留垃圾'
    ]
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
        const task = res.result.data;
        this.setData({
          taskInfo: {
            species: task.species,
            quantity: task.quantity,
            location: task.location,
            requiredTime: task.requiredTime
          },
          taskStatus: task.status,
          statusText: this.getStatusText(task.status)
        });
      }
    } catch (error) {
      console.error('加载任务信息失败:', error);
    }
  },

  getStatusText(status) {
    const map = {
      pending: '待开始',
      ongoing: '进行中',
      completed: '已完成',
      verified: '已核实'
    };
    return map[status] || '未知';
  },

  startTask() {
    wx.showModal({
      title: '开始任务',
      content: '确认开始此任务？请确保已阅读仪轨指引',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'startTask',
              data: { taskId: this.data.taskId }
            });
            wx.showToast({ title: '任务已开始', icon: 'success' });
            this.setData({ taskStatus: 'ongoing', statusText: '进行中' });
          } catch (error) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  contactSupport() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  }
});
