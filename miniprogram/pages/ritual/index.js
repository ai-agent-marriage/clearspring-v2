// pages/ritual/index.js
const ritualData = require('./ritual-data.js');

Page({
  data: {
    categories: [],
    rituals: [],
    filteredRituals: [],
    currentCategory: 'all',
    searchKey: '',
    userProgress: {},
    completedCount: 0,
    totalCount: 0
  },

  onLoad() {
    this.loadUserProgress();
    this.initData();
  },

  onShow() {
    // 每次显示时刷新进度
    this.loadUserProgress();
    this.updateStats();
  },

  initData() {
    const categories = ritualData.categories;
    const rituals = ritualData.rituals;
    
    this.setData({
      categories: [{ id: 'all', name: '全部', icon: '📚' }, ...categories],
      rituals: rituals,
      filteredRituals: rituals,
      totalCount: rituals.length
    });
    
    this.updateStats();
  },

  loadUserProgress() {
    // 从本地缓存加载学习进度
    const progress = wx.getStorageSync('ritual_progress') || {};
    this.setData({ userProgress: progress });
  },

  updateStats() {
    const { userProgress, rituals } = this.data;
    const completedCount = Object.keys(userProgress).filter(id => {
      const p = userProgress[id];
      return p && p.completed;
    }).length;
    
    this.setData({ completedCount });
  },

  // 切换分类
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    const { rituals } = this.data;
    
    let filtered = rituals;
    if (categoryId !== 'all') {
      filtered = rituals.filter(r => r.category === categoryId);
    }
    
    this.setData({
      currentCategory: categoryId,
      filteredRituals: filtered
    });
  },

  // 搜索
  onSearchInput(e) {
    const searchKey = e.detail.value.trim();
    this.filterRituals(searchKey);
  },

  onSearchConfirm(e) {
    const searchKey = e.detail.value.trim();
    this.filterRituals(searchKey);
  },

  filterRituals(searchKey) {
    const { rituals, currentCategory } = this.data;
    
    let filtered = rituals;
    
    // 按分类筛选
    if (currentCategory !== 'all') {
      filtered = filtered.filter(r => r.category === currentCategory);
    }
    
    // 按搜索词筛选
    if (searchKey) {
      filtered = filtered.filter(r => 
        r.title.includes(searchKey)
      );
    }
    
    this.setData({
      searchKey,
      filteredRituals: filtered
    });
  },

  // 进入仪轨详情
  onRitualTap(e) {
    const ritualId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/ritual/detail?id=${ritualId}`
    });
  },

  // 继续学习
  onContinueTap(e) {
    const ritualId = e.currentTarget.dataset.id;
    const { userProgress } = this.data;
    const progress = userProgress[ritualId] || {};
    
    // 如果有进度，继续学习；否则从第一步开始
    const nextStep = progress.currentStep || 0;
    
    wx.navigateTo({
      url: `/pages/ritual/learn?id=${ritualId}&step=${nextStep}`
    });
  },

  // 开始实践
  onPracticeTap(e) {
    const ritualId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/ritual/practice?id=${ritualId}`
    });
  }
});
