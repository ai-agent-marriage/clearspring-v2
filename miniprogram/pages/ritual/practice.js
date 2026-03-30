// pages/ritual/practice.js
const ritualData = require('./ritual-data.js');

Page({
  data: {
    ritual: null,
    currentPhase: 'prepare', // prepare, practice, dedication
    checklist: [],
    practiceRecord: {
      startTime: null,
      endTime: null,
      animals: 0,
      notes: ''
    },
    dedication: {
      text: '',
      customText: ''
    },
    merit: {
      count: 0,
      note: ''
    },
    showComplete: false
  },

  onLoad(options) {
    const ritualId = options.id;
    this.loadRitual(ritualId);
    this.initChecklist();
    this.loadDedication();
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

  initChecklist() {
    const checklist = [
      { id: 1, text: '准备放生物（鱼/鸟/动物等）', checked: false },
      { id: 2, text: '准备放生工具（网/笼/容器等）', checked: false },
      { id: 3, text: '选择合适放生地点', checked: false },
      { id: 4, text: '确认环境安全适宜', checked: false },
      { id: 5, text: '净手漱口，身心清净', checked: false },
      { id: 6, text: '准备仪轨文本或音频', checked: false }
    ];
    this.setData({ checklist });
  },

  loadDedication() {
    const defaultDedication = '愿以此功德，庄严佛净土，\n上报四重恩，下济三途苦。\n若有见闻者，悉发菩提心，\n尽此一报身，同生极乐国。';
    const savedDedication = wx.getStorageSync('practice_dedication') || defaultDedication;
    this.setData({
      'dedication.text': savedDedication
    });
  },

  // 切换清单项
  onCheckToggle(e) {
    const index = e.currentTarget.dataset.index;
    const { checklist } = this.data;
    checklist[index].checked = !checklist[index].checked;
    this.setData({ checklist });
  },

  // 检查是否全部完成
  isChecklistComplete() {
    const { checklist } = this.data;
    return checklist.every(item => item.checked);
  },

  // 开始实践
  onStartPractice() {
    if (!this.isChecklistComplete()) {
      wx.showModal({
        title: '提示',
        content: '请先完成所有准备工作',
        showCancel: false
      });
      return;
    }
    
    this.setData({
      currentPhase: 'practice',
      'practiceRecord.startTime': Date.now()
    });
  },

  // 更新放生数量
  onAnimalCountChange(e) {
    this.setData({
      'practiceRecord.animals': parseInt(e.detail.value) || 0
    });
  },

  // 更新实践笔记
  onPracticeNotesChange(e) {
    this.setData({
      'practiceRecord.notes': e.detail.value
    });
  },

  // 更新自定义回向文
  onCustomDedicationChange(e) {
    this.setData({
      'dedication.customText': e.detail.value
    });
  },

  // 保存回向文
  onSaveDedication() {
    const { dedication } = this.data;
    const text = dedication.customText || dedication.text;
    wx.setStorageSync('practice_dedication', text);
    
    wx.showToast({
      title: '已保存',
      icon: 'success'
    });
  },

  // 进入回向
  onToDedication() {
    const { practiceRecord } = this.data;
    
    if (!practiceRecord.startTime) {
      wx.showToast({ title: '请先开始实践', icon: 'none' });
      return;
    }
    
    practiceRecord.endTime = Date.now();
    this.setData({
      currentPhase: 'dedication',
      practiceRecord
    });
  },

  // 完成回向
  onCompleteDedication() {
    const { ritual, practiceRecord, dedication, merit } = this.data;
    
    // 保存实践记录
    const records = wx.getStorageSync('practice_records') || [];
    records.push({
      ritualId: ritual.id,
      ritualTitle: ritual.title,
      ...practiceRecord,
      dedication: dedication.customText || dedication.text,
      merit: merit.count,
      meritNote: merit.note,
      createTime: Date.now()
    });
    
    wx.setStorageSync('practice_records', records);
    
    // 更新功德统计
    const meritTotal = wx.getStorageSync('merit_total') || 0;
    wx.setStorageSync('merit_total', meritTotal + merit.count);
    
    this.setData({ showComplete: true });
  },

  // 更新功德数
  onMeritCountChange(e) {
    this.setData({
      'merit.count': parseInt(e.detail.value) || 0
    });
  },

  // 更新功德备注
  onMeritNoteChange(e) {
    this.setData({
      'merit.note': e.detail.value
    });
  },

  // 返回首页
  onGoHome() {
    wx.navigateBack({ delta: 2 });
  },

  // 分享功德
  onShareMerit() {
    const { ritual, merit } = this.data;
    return {
      title: `我在${ritual.title}中积累了${merit.count}点功德`,
      path: `/pages/ritual/practice?id=${ritual.id}`
    };
  }
});
