/**
 * 冥想播放页
 * 功能：
 * - 音频播放器（播放/暂停/进度）
 * - 冥想引导文字
 * - 倒计时功能
 * - 完成后功德 +1
 */

const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    courseId: '',
    courseName: '',
    courseImage: '/static/meditation/default.png',
    audioUrl: '',
    totalDuration: 600, // 默认 10 分钟
    currentTime: 0,
    isPlaying: false,
    isCompleted: false,
    guideText: '调整呼吸，放松身心',
    showCountdown: false,
    countdownTime: 0,
    timerInterval: null
  },

  onLoad(options) {
    const { courseId, courseName } = options;
    this.setData({
      courseId: courseId || '1',
      courseName: decodeURIComponent(courseName || '冥想练习')
    });
    this.loadCourseDetail();
    this.initAudio();
  },

  onUnload() {
    this.cleanup();
  },

  /**
   * 初始化音频
   */
  initAudio() {
    innerAudioContext.autoplay = false;
    innerAudioContext.loop = false;
    
    innerAudioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });

    innerAudioContext.onPause(() => {
      this.setData({ isPlaying: false });
    });

    innerAudioContext.onEnded(() => {
      this.setData({ 
        isPlaying: false,
        isCompleted: true 
      });
      this.stopCountdown();
      wx.showToast({
        title: '冥想完成',
        icon: 'success'
      });
    });

    innerAudioContext.onError((res) => {
      console.error('音频播放错误:', res);
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });
  },

  /**
   * 加载课程详情
   */
  async loadCourseDetail() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCourseDetail',
        data: {
          courseId: this.data.courseId
        }
      });

      if (res.result && res.result.success) {
        const course = res.result.course;
        this.setData({
          courseImage: course.image || this.data.courseImage,
          audioUrl: course.audioUrl || '',
          totalDuration: course.duration * 60 || 600,
          guideText: course.guideText || '调整呼吸，放松身心'
        });
      } else {
        // 使用本地默认数据
        this.loadLocalCourseData();
      }
    } catch (error) {
      console.error('加载课程详情失败:', error);
      this.loadLocalCourseData();
    }
  },

  /**
   * 加载本地课程数据
   */
  loadLocalCourseData() {
    const courses = this.getLocalCourses();
    const course = courses.find(c => c.id === parseInt(this.data.courseId)) || courses[0];
    
    if (course) {
      this.setData({
        courseImage: course.image,
        audioUrl: course.audioUrl,
        totalDuration: course.duration * 60,
        guideText: course.guideText
      });
    }
  },

  /**
   * 获取本地课程数据
   */
  getLocalCourses() {
    return [
      {
        id: 1,
        name: '呼吸观察',
        duration: 10,
        image: '/static/meditation/breath.png',
        audioUrl: '/static/meditation/audio/breath.mp3',
        guideText: '专注于呼吸，感受气息的进出'
      },
      {
        id: 2,
        name: '身体扫描',
        duration: 15,
        image: '/static/meditation/body.png',
        audioUrl: '/static/meditation/audio/body.mp3',
        guideText: '从头到脚，觉察身体的每个部位'
      }
    ];
  },

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (this.data.isPlaying) {
      innerAudioContext.pause();
    } else {
      innerAudioContext.play();
      this.startCountdown();
    }
  },

  /**
   * 快退 15 秒
   */
  skipBackward() {
    const newTime = Math.max(0, innerAudioContext.currentTime - 15);
    innerAudioContext.seek(newTime);
  },

  /**
   * 快进 15 秒
   */
  skipForward() {
    const newTime = Math.min(this.data.totalDuration, innerAudioContext.currentTime + 15);
    innerAudioContext.seek(newTime);
  },

  /**
   * 进度条拖动
   */
  onSliderChanging(e) {
    const value = e.detail.value;
    innerAudioContext.seek(value);
    this.setData({ currentTime: value });
  },

  /**
   * 音频播放
   */
  onAudioPlay() {
    this.setData({ isPlaying: true });
    this.startCountdown();
  },

  /**
   * 音频暂停
   */
  onAudioPause() {
    this.setData({ isPlaying: false });
    this.stopCountdown();
  },

  /**
   * 音频结束
   */
  onAudioEnded() {
    this.setData({ 
      isPlaying: false,
      isCompleted: true 
    });
    this.stopCountdown();
  },

  /**
   * 时间更新
   */
  onTimeUpdate() {
    const currentTime = Math.floor(innerAudioContext.currentTime);
    this.setData({ 
      currentTime,
      formatCurrentTime: this.formatTime(currentTime),
      formatTotalTime: this.formatTime(this.data.totalDuration)
    });

    // 检查是否完成
    if (currentTime >= this.data.totalDuration) {
      this.completeMeditation();
    }
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    if (!this.data.showCountdown) return;
    
    this.stopCountdown();
    const interval = setInterval(() => {
      const remaining = this.data.totalDuration - this.data.currentTime;
      this.setData({
        countdownTime: remaining,
        formatCountdown: this.formatTime(remaining)
      });
    }, 1000);
    
    this.setData({ timerInterval: interval });
  },

  /**
   * 停止倒计时
   */
  stopCountdown() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  /**
   * 切换倒计时显示
   */
  toggleCountdown() {
    const showCountdown = !this.data.showCountdown;
    this.setData({ showCountdown });
    
    if (showCountdown && this.data.isPlaying) {
      this.startCountdown();
    } else {
      this.stopCountdown();
    }
  },

  /**
   * 设置定时关闭
   */
  setTimer() {
    const durations = [15, 30, 45, 60];
    wx.showActionSheet({
      itemList: durations.map(d => `${d}分钟`),
      success: (res) => {
        const minutes = durations[res.tapIndex];
        const targetTime = this.data.currentTime + minutes * 60;
        
        wx.showToast({
          title: `${minutes}分钟后关闭`,
          icon: 'success'
        });

        // 设置定时关闭逻辑
        setTimeout(() => {
          if (this.data.isPlaying) {
            innerAudioContext.pause();
            wx.showToast({
              title: '定时关闭',
              icon: 'none'
            });
          }
        }, minutes * 60 * 1000);
      }
    });
  },

  /**
   * 完成冥想
   */
  async completeMeditation() {
    if (this.data.isCompleted) return;

    try {
      // 更新本地数据
      const meditationData = wx.getStorageSync('meditationData') || {};
      meditationData.totalMinutes = (meditationData.totalMinutes || 0) + Math.floor(this.data.totalDuration / 60);
      meditationData.totalCount = (meditationData.totalCount || 0) + 1;
      wx.setStorageSync('meditationData', meditationData);

      // 调用云函数记录完成并增加功德
      await wx.cloud.callFunction({
        name: 'completeMeditation',
        data: {
          courseId: this.data.courseId,
          duration: this.data.totalDuration
        }
      });

      this.setData({ isCompleted: true });
      this.stopCountdown();

      wx.showToast({
        title: '功德 +1',
        icon: 'success'
      });

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('完成冥想失败:', error);
      wx.showToast({
        title: '记录失败',
        icon: 'none'
      });
    }
  },

  /**
   * 清理资源
   */
  cleanup() {
    this.stopCountdown();
    innerAudioContext.stop();
    innerAudioContext.destroy();
  }
});
