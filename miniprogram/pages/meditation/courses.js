/**
 * 冥想课程列表页
 * 功能：
 * - 展示 20 个冥想课程
 * - 分类筛选（入门/进阶/专题）
 * - 课程搜索
 */

Page({
  data: {
    currentCategory: '',
    allCourses: [],
    filteredCourses: []
  },

  onLoad(options) {
    const category = options.category || '';
    this.setData({ currentCategory: category });
    this.loadCourses();
  },

  onPullDownRefresh() {
    this.loadCourses();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载课程列表
   */
  async loadCourses() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCourses',
        data: {
          category: this.data.currentCategory
        }
      });

      if (res.result && res.result.success) {
        this.setData({
          allCourses: res.result.courses || [],
          filteredCourses: res.result.courses || []
        });
      } else {
        this.loadLocalCourses();
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      this.loadLocalCourses();
    }
  },

  /**
   * 加载本地课程数据（20 个课程）
   */
  loadLocalCourses() {
    const courses = this.getAllCourses();
    let filtered = courses;

    if (this.data.currentCategory) {
      filtered = courses.filter(c => c.levelType === this.data.currentCategory);
    }

    this.setData({
      allCourses: courses,
      filteredCourses: filtered
    });
  },

  /**
   * 获取所有课程数据（20 个）
   */
  getAllCourses() {
    return [
      // 入门系列（5 个）
      {
        id: 1,
        name: '呼吸观察',
        description: '专注于呼吸的自然流动，培养觉知力',
        duration: 10,
        level: '入门',
        levelType: 'beginner',
        image: '/static/meditation/breath.png',
        audioUrl: '/static/meditation/audio/breath.mp3',
        count: 1280,
        guideText: '专注于呼吸，感受气息的进出'
      },
      {
        id: 2,
        name: '身体扫描',
        description: '系统性地觉察身体每个部位',
        duration: 15,
        level: '入门',
        levelType: 'beginner',
        image: '/static/meditation/body.png',
        audioUrl: '/static/meditation/audio/body.mp3',
        count: 956,
        guideText: '从头到脚，觉察身体的每个部位'
      },
      {
        id: 3,
        name: '基础坐禅',
        description: '学习正确的坐姿和基础禅修方法',
        duration: 20,
        level: '入门',
        levelType: 'beginner',
        image: '/static/meditation/sitting.png',
        audioUrl: '/static/meditation/audio/sitting.mp3',
        count: 823,
        guideText: '端正坐姿，保持觉知'
      },
      {
        id: 4,
        name: '觉察当下',
        description: '培养对当下的清晰觉察',
        duration: 12,
        level: '入门',
        levelType: 'beginner',
        image: '/static/meditation/present.png',
        audioUrl: '/static/meditation/audio/present.mp3',
        count: 1045,
        guideText: '安住当下，觉察此刻'
      },
      {
        id: 5,
        name: '放松练习',
        description: '深度放松身心的基础练习',
        duration: 15,
        level: '入门',
        levelType: 'beginner',
        image: '/static/meditation/relax.png',
        audioUrl: '/static/meditation/audio/relax.mp3',
        count: 1567,
        guideText: '释放紧张，全然放松'
      },

      // 进阶系列（5 个）
      {
        id: 6,
        name: '慈心禅',
        description: '培养对自己和他人的慈悲心',
        duration: 25,
        level: '进阶',
        levelType: 'advanced',
        image: '/static/meditation/loving.png',
        audioUrl: '/static/meditation/audio/loving.mp3',
        count: 678,
        guideText: '愿一切众生安乐'
      },
      {
        id: 7,
        name: '观想禅',
        description: '通过观想深化禅修体验',
        duration: 30,
        level: '进阶',
        levelType: 'advanced',
        image: '/static/meditation/visualization.png',
        audioUrl: '/static/meditation/audio/visualization.mp3',
        count: 534,
        guideText: '清晰观想，深入定境'
      },
      {
        id: 8,
        name: '行禅',
        description: '在行走中保持觉知的练习',
        duration: 20,
        level: '进阶',
        levelType: 'advanced',
        image: '/static/meditation/walking.png',
        audioUrl: '/static/meditation/audio/walking.mp3',
        count: 445,
        guideText: '步步觉知，行住坐卧皆是禅'
      },
      {
        id: 9,
        name: '内观禅修',
        description: '深入观察身心现象的本质',
        duration: 35,
        level: '进阶',
        levelType: 'advanced',
        image: '/static/meditation/insight.png',
        audioUrl: '/static/meditation/audio/insight.mp3',
        count: 389,
        guideText: '如实观察，洞见真相'
      },
      {
        id: 10,
        name: '默照禅',
        description: '默然照见的深度禅修',
        duration: 40,
        level: '进阶',
        levelType: 'advanced',
        image: '/static/meditation/silent.png',
        audioUrl: '/static/meditation/audio/silent.mp3',
        count: 312,
        guideText: '默然无言，照见万法'
      },

      // 专题系列（10 个）
      {
        id: 11,
        name: '减压冥想',
        description: '释放压力，恢复内心平静',
        duration: 20,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/stress.png',
        audioUrl: '/static/meditation/audio/stress.mp3',
        count: 2103,
        guideText: '放下压力，回归平静'
      },
      {
        id: 12,
        name: '助眠冥想',
        description: '放松身心，改善睡眠质量',
        duration: 30,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/sleep.png',
        audioUrl: '/static/meditation/audio/sleep.mp3',
        count: 1876,
        guideText: '放松入眠，安然自在'
      },
      {
        id: 13,
        name: '专注提升',
        description: '训练专注力，提升工作效率',
        duration: 15,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/focus.png',
        audioUrl: '/static/meditation/audio/focus.mp3',
        count: 1534,
        guideText: '一心专注，心无旁骛'
      },
      {
        id: 14,
        name: '慈悲培养',
        description: '扩展慈悲心，关爱一切众生',
        duration: 25,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/compassion.png',
        audioUrl: '/static/meditation/audio/compassion.mp3',
        count: 987,
        guideText: '慈悲喜舍，普度众生'
      },
      {
        id: 15,
        name: '情绪调节',
        description: '觉察情绪，保持内心平衡',
        duration: 18,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/emotion.png',
        audioUrl: '/static/meditation/audio/emotion.mp3',
        count: 1245,
        guideText: '觉察情绪，不迎不拒'
      },
      {
        id: 16,
        name: '感恩练习',
        description: '培养感恩心，提升幸福感',
        duration: 15,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/gratitude.png',
        audioUrl: '/static/meditation/audio/gratitude.mp3',
        count: 1098,
        guideText: '心怀感恩，知足常乐'
      },
      {
        id: 17,
        name: '自我接纳',
        description: '接纳自己，拥抱内在',
        duration: 20,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/acceptance.png',
        audioUrl: '/static/meditation/audio/acceptance.mp3',
        count: 876,
        guideText: '如实地接纳自己'
      },
      {
        id: 18,
        name: '能量提升',
        description: '激活内在能量，焕发活力',
        duration: 20,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/energy.png',
        audioUrl: '/static/meditation/audio/energy.mp3',
        count: 1321,
        guideText: '激活能量，充满活力'
      },
      {
        id: 19,
        name: '清晨冥想',
        description: '开启美好一天的清晨练习',
        duration: 10,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/morning.png',
        audioUrl: '/static/meditation/audio/morning.mp3',
        count: 1654,
        guideText: '清晨觉醒，迎接新的一天'
      },
      {
        id: 20,
        name: '晚间反思',
        description: '回顾一天，安然入眠',
        duration: 15,
        level: '专题',
        levelType: 'special',
        image: '/static/meditation/evening.png',
        audioUrl: '/static/meditation/audio/evening.mp3',
        count: 1432,
        guideText: '回顾反思，安然放下'
      }
    ];
  },

  /**
   * 按分类筛选
   */
  filterByCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });

    const courses = this.data.allCourses;
    let filtered = courses;

    if (category) {
      filtered = courses.filter(c => c.levelType === category);
    }

    this.setData({ filteredCourses: filtered });
  },

  /**
   * 跳转到播放页
   */
  goToPlayer(e) {
    const course = e.currentTarget.dataset.course;
    wx.navigateTo({
      url: `/pages/meditation/player?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`
    });
  }
});
