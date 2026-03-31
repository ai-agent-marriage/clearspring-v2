/**
 * 清如 ClearSpring V2.0 - 功德林页逻辑
 * 页面路径：pages/merit-forest/merit-forest
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalCount: 28,
    totalMerit: 1680,
    forestCount: 3,
    certificates: [
      {
        id: 1,
        title: '鱼类放生功德',
        date: '2026-03-30',
        description: '今日放生鲤鱼 10 条，功德无量，愿众生离苦得乐',
        merit: 100
      },
      {
        id: 2,
        title: '鸟类放生功德',
        date: '2026-03-29',
        description: '放生鸽子 5 只，护生护命，功德圆满',
        merit: 200
      },
      {
        id: 3,
        title: '超度法会功德',
        date: '2026-03-28',
        description: '参加超度法会，愿亡者往生净土',
        merit: 500
      },
      {
        id: 4,
        title: '寺院建设随喜',
        date: '2026-03-27',
        description: '随喜寺院建设，广种福田',
        merit: 300
      },
      {
        id: 5,
        title: '放生鲫鱼功德',
        date: '2026-03-26',
        description: '放生鲫鱼 20 条，功德无量',
        merit: 200
      },
      {
        id: 6,
        title: '放生泥鳅功德',
        date: '2026-03-25',
        description: '放生泥鳅 50 条，愿众生安乐',
        merit: 180
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('功德林页加载完成', options);
    this.loadMeritData();
  },

  /**
   * 加载功德数据
   */
  async loadMeritData() {
    try {
      // TODO: 调用云函数获取功德数据
      // 暂时使用模拟数据
      console.log('功德数据加载成功');
    } catch (error) {
      console.error('加载功德数据失败:', error);
    }
  },

  /**
   * 查看证书详情
   */
  viewCertificate(e) {
    const id = e.currentTarget.dataset.id;
    const cert = this.data.certificates.find(item => item.id === id);
    
    wx.showModal({
      title: cert.title,
      content: `${cert.description}\n\n日期：${cert.date}\n功德：${cert.merit}`,
      showCancel: false,
      confirmText: '关闭'
    });
  }
});
