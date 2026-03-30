// pages/ritual/detail.js
const ritualData = require('./ritual-data.js');

Page({
  data: {
    ritual: null,
    category: null,
    userProgress: {},
    currentStep: 0,
    isCompleted: false,
    showVideo: false,
    videoUrl: ''
  },

  onLoad(options) {
    const ritualId = options.id;
    this.loadRitual(ritualId);
    this.loadUserProgress(ritualId);
  },

  loadRitual(ritualId) {
    const ritual = ritualData.rituals.find(r => r.id === ritualId);
    const category = ritualData.categories.find(c => c.id === ritual.category);
    
    if (!ritual) {
      wx.showToast({
        title: '仪轨不存在',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    
    this.setData({ 
      ritual, 
      category,
      currentStep: 0
    });
  },

  loadUserProgress(ritualId) {
    const progress = wx.getStorageSync('ritual_progress') || {};
    const ritualProgress = progress[ritualId] || {};
    
    this.setData({
      userProgress: progress,
      currentStep: ritualProgress.currentStep || 0,
      isCompleted: ritualProgress.completed || false
    });
  },

  // 开始学习
  onStartLearn() {
    const { ritual, currentStep } = this.data;
    wx.navigateTo({
      url: `/pages/ritual/learn?id=${ritual.id}&step=${currentStep}`
    });
  },

  // 继续学习
  onContinueLearn() {
    const { ritual, currentStep } = this.data;
    wx.navigateTo({
      url: `/pages/ritual/learn?id=${ritual.id}&step=${currentStep}`
    });
  },

  // 开始实践
  onStartPractice() {
    const { ritual } = this.data;
    wx.navigateTo({
      url: `/pages/ritual/practice?id=${ritual.id}`
    });
  },

  // 播放音频
  onPlayAudio(e) {
    const stepIndex = e.currentTarget.dataset.index;
    const { ritual } = this.data;
    const step = ritual.steps[stepIndex];
    
    // 模拟音频播放（实际项目中需要替换为真实音频路径）
    const audioPath = `/static/audio/rituals/${step.audio}`;
    
    wx.showToast({
      title: '播放音频',
      icon: 'none'
    });
    
    // 实际音频播放代码
    // const innerAudioContext = wx.createInnerAudioContext();
    // innerAudioContext.src = audioPath;
    // innerAudioContext.play();
  },

  // 播放视频
  onPlayVideo() {
    const { ritual } = this.data;
    const videoUrl = `/static/video/rituals/${ritual.id}.mp4`;
    
    this.setData({
      showVideo: true,
      videoUrl: videoUrl
    });
  },

  closeVideo() {
    this.setData({
      showVideo: false,
      videoUrl: ''
    });
  },

  // 预览步骤
  onStepTap(e) {
    const stepIndex = e.currentTarget.dataset.index;
    this.setData({ currentStep: stepIndex });
  },

  // 分享
  onShareAppMessage() {
    const { ritual } = this.data;
    return {
      title: `一起学习${ritual.title}`,
      path: `/pages/ritual/detail?id=${ritual.id}`
    };
  }
});
