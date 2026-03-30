// pages/ritual/learn.js
const ritualData = require('./ritual-data.js');

Page({
  data: {
    ritual: null,
    currentStepIndex: 0,
    currentStep: null,
    isCompleted: false,
    isPlaying: false,
    showNotes: false,
    notes: '',
    startTime: 0,
    learnTime: 0
  },

  onLoad(options) {
    const ritualId = options.id;
    const startStep = parseInt(options.step) || 0;
    
    this.loadRitual(ritualId);
    this.loadNotes(ritualId);
    this.setData({ currentStepIndex: startStep });
  },

  onReady() {
    this.updateCurrentStep();
    this.setData({ startTime: Date.now() });
  },

  onUnload() {
    // 保存学习进度
    this.saveProgress();
  },

  loadRitual(ritualId) {
    const ritual = ritualData.rituals.find(r => r.id === ritualId);
    if (!ritual) {
      wx.showToast({ title: '仪轨不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ ritual });
  },

  loadNotes(ritualId) {
    const notes = wx.getStorageSync(`ritual_notes_${ritualId}`) || '';
    this.setData({ notes });
  },

  updateCurrentStep() {
    const { ritual, currentStepIndex } = this.data;
    if (ritual && ritual.steps[currentStepIndex]) {
      this.setData({
        currentStep: ritual.steps[currentStepIndex]
      });
    }
  },

  // 上一步
  onPrevStep() {
    const { currentStepIndex } = this.data;
    if (currentStepIndex > 0) {
      this.setData({ currentStepIndex: currentStepIndex - 1 });
      this.updateCurrentStep();
    }
  },

  // 下一步
  onNextStep() {
    const { currentStepIndex, ritual } = this.data;
    if (currentStepIndex < ritual.steps.length - 1) {
      this.setData({ currentStepIndex: currentStepIndex + 1 });
      this.updateCurrentStep();
      this.saveProgress();
    } else {
      // 完成学习
      this.completeLearn();
    }
  },

  // 播放音频
  onPlayAudio() {
    const { currentStep, isPlaying } = this.data;
    
    if (!currentStep || !currentStep.audio) return;
    
    if (isPlaying) {
      // 停止播放
      this.stopAudio();
    } else {
      // 开始播放
      this.playAudio(currentStep.audio);
    }
  },

  playAudio(audioFile) {
    const audioPath = `/static/audio/rituals/${audioFile}`;
    
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = audioPath;
    
    innerAudioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    
    innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    
    innerAudioContext.onError(() => {
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
    
    innerAudioContext.play();
    
    // 保存音频上下文以便后续停止
    this.audioContext = innerAudioContext;
  },

  stopAudio() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.setData({ isPlaying: false });
    }
  },

  // 保存进度
  saveProgress() {
    const { ritual, currentStepIndex } = this.data;
    const progress = wx.getStorageSync('ritual_progress') || {};
    
    progress[ritual.id] = {
      currentStep: currentStepIndex + 1,
      lastLearnTime: Date.now(),
      completed: false
    };
    
    wx.setStorageSync('ritual_progress', progress);
  },

  // 完成学习
  completeLearn() {
    const { ritual } = this.data;
    const endTime = Date.now();
    const learnTime = Math.floor((endTime - this.data.startTime) / 1000);
    
    // 保存完成状态
    const progress = wx.getStorageSync('ritual_progress') || {};
    progress[ritual.id] = {
      currentStep: ritual.steps.length,
      lastLearnTime: Date.now(),
      completed: true,
      completeTime: endTime,
      learnTime: learnTime
    };
    
    wx.setStorageSync('ritual_progress', progress);
    
    this.setData({ isCompleted: true });
    
    // 显示完成提示
    wx.showModal({
      title: '学习完成',
      content: `恭喜您完成"${ritual.title}"的学习！\n学习时长：${Math.floor(learnTime / 60)}分钟`,
      showCancel: false,
      confirmText: '开始实践',
      success: () => {
        wx.navigateTo({
          url: `/pages/ritual/practice?id=${ritual.id}`
        });
      }
    });
  },

  // 打开笔记
  onOpenNotes() {
    this.setData({ showNotes: true });
  },

  // 关闭笔记
  onCloseNotes() {
    this.setData({ showNotes: false });
  },

  // 保存笔记
  onSaveNotes() {
    const { ritual, notes } = this.data;
    wx.setStorageSync(`ritual_notes_${ritual.id}`, notes);
    
    wx.showToast({
      title: '笔记已保存',
      icon: 'success'
    });
    
    this.setData({ showNotes: false });
  },

  // 笔记输入
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  // 打卡
  onCheckIn() {
    const { ritual } = this.data;
    
    // 保存打卡记录
    const checkIns = wx.getStorageSync('ritual_checkins') || [];
    checkIns.push({
      ritualId: ritual.id,
      ritualTitle: ritual.title,
      checkInTime: Date.now()
    });
    
    wx.setStorageSync('ritual_checkins', checkIns);
    
    wx.showToast({
      title: '打卡成功',
      icon: 'success'
    });
  },

  // 返回首页
  onGoHome() {
    wx.navigateBack({ delta: 2 });
  }
});
