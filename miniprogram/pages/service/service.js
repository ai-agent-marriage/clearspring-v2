/**
 * 清如 ClearSpring V2.0 - 服务页逻辑
 * 页面路径：pages/service/service
 * 
 * 功能说明：
 * - 服务分类切换（物命救护/法事服务/随喜功德）
 * - 服务列表展示
 * - 服务详情弹窗
 * - 服务选择
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 1,  // 当前选中的 Tab 索引（服务页）
    currentCategory: 0,  // 当前选中的分类索引
    
    // 服务分类
    categories: [
      { id: 1, name: '物命救护' },
      { id: 2, name: '法事服务' },
      { id: 3, name: '随喜功德' }
    ],
    
    // 服务列表（模拟数据）
    services: [
      {
        id: 1,
        title: '物命救护 - 鱼类放生',
        description: '如法放生鱼类，功德无量，护生护命',
        price: 100,
        image: '/static/service/fish.jpg',
        category: '物命救护',
        tag: '热门',
        rating: 4.9
      },
      {
        id: 2,
        title: '物命救护 - 鸟类放生',
        description: '放生鸟类，护生护命，功德圆满',
        price: 200,
        image: '/static/service/bird.jpg',
        category: '物命救护',
        tag: '推荐',
        rating: 4.8
      },
      {
        id: 3,
        title: '法事服务 - 超度法会',
        description: '如法超度，离苦得乐，功德无量',
        price: 500,
        image: '/static/service/ceremony.jpg',
        category: '法事服务',
        rating: 5.0
      },
      {
        id: 4,
        title: '随喜功德 - 寺院建设',
        description: '随喜赞助寺院建设，广种福田',
        price: 50,
        image: '/static/service/temple.jpg',
        category: '随喜功德',
        tag: '公益'
      }
    ],
    filteredServices: [],
    
    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    
    // 弹窗
    showDetailModal: false,
    selectedService: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    logger.info('服务页加载完成', options);
    this.loadServices();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshServices();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreServices();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '清如 · ClearSpring - 如法放生服务',
      path: '/pages/service/service',
      imageUrl: '/static/share/service.jpg'
    };
  },

  /**
   * 加载服务列表
   */
  async loadServices() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 调用云函数获取服务列表
      const res = await wx.cloud.callFunction({
        name: 'getServices',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          categoryId: this.data.categories[this.data.currentCategory]?.id
        }
      });
      
      if (res.result && res.result.success) {
        const { list, hasMore } = res.result.data;
        this.setData({
          services: list,
          filteredServices: list,
          hasMore: hasMore
        });
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载服务列表失败:', error);
      wx.hideLoading();
      
      // 使用模拟数据
      this.loadMockServices();
    }
  },

  /**
   * 加载模拟服务数据（用于开发测试）
   */
  loadMockServices() {
    const mockData = {
      0: [  // 物命救护
        {
          id: 1,
          title: '鲫鱼放生',
          description: '鲫鱼生命力强，适应性好，是常见的放生物种',
          price: 99,
          unit: '份',
          sales: 1256,
          rating: 4.9,
          tag: '热门',
          image: '/static/service/crucian.jpg',
          rules: ['每份约 500g', '由法师主持放生仪轨', '提供放生视频记录'],
          notice: '放生时间由寺院统一安排，请保持手机畅通'
        },
        {
          id: 2,
          title: '鲤鱼放生',
          description: '鲤鱼寓意吉祥，体型较大，功德殊胜',
          price: 199,
          unit: '份',
          sales: 856,
          rating: 4.8,
          tag: '推荐',
          image: '/static/service/carp.jpg',
          rules: ['每份约 1000g', '由法师主持放生仪轨', '提供放生视频记录'],
          notice: '放生时间由寺院统一安排，请保持手机畅通'
        },
        {
          id: 3,
          title: '泥鳅放生',
          description: '泥鳅数量多，救命数量大，功德无量',
          price: 158,
          unit: '份',
          sales: 2103,
          rating: 4.9,
          image: '/static/service/loach.jpg',
          rules: ['每份约 2kg', '由法师主持放生仪轨', '提供放生视频记录'],
          notice: '放生时间由寺院统一安排，请保持手机畅通'
        }
      ],
      1: [  // 法事服务
        {
          id: 4,
          title: '超度法事',
          description: '为亡者超度，离苦得乐，往生净土',
          price: 999,
          unit: '场',
          sales: 326,
          rating: 5.0,
          tag: '殊胜',
          image: '/static/service/memorial.jpg',
          rules: ['需提供亡者姓名和生辰', '法事由住持法师主持', '提供法事视频记录'],
          notice: '法事时间需提前预约，请至少提前 3 天联系'
        },
        {
          id: 5,
          title: '祈福法事',
          description: '为家人祈福消灾，增福增慧',
          price: 699,
          unit: '场',
          sales: 512,
          rating: 4.9,
          image: '/static/service/blessing.jpg',
          rules: ['需提供祈福人姓名', '法事由住持法师主持', '提供法事视频记录'],
          notice: '法事时间需提前预约，请至少提前 3 天联系'
        }
      ],
      2: [  // 随喜功德
        {
          id: 6,
          title: '寺院修缮',
          description: '随喜寺院修缮，护持道场，功德无量',
          price: 100,
          unit: '元',
          sales: 1876,
          rating: 5.0,
          tag: '常设',
          image: '/static/service/temple.jpg',
          rules: ['金额不限，随喜功德', '开具功德证书', '功德芳名刻入功德碑'],
          notice: '所有善款专款专用，定期公示使用情况'
        },
        {
          id: 7,
          title: '供灯功德',
          description: '供灯祈福，照亮前程，智慧增长',
          price: 30,
          unit: '盏',
          sales: 3256,
          rating: 4.9,
          image: '/static/service/lamp.jpg',
          rules: ['每盏灯供奉 7 天', '提供供灯照片', '可代写祈福牌'],
          notice: '供灯期间由寺院法师每日诵经回向'
        }
      ]
    };
    
    const categoryData = mockData[this.data.currentCategory] || [];
    this.setData({
      services: categoryData,
      filteredServices: categoryData,
      hasMore: false
    });
  },

  /**
   * 刷新服务列表
   */
  async refreshServices() {
    this.setData({ page: 1 });
    await this.loadServices();
  },

  /**
   * 加载更多服务
   */
  async loadMoreServices() {
    this.setData({ page: this.data.page + 1 });
    await this.loadServices();
  },

  /**
   * 切换分类
   */
  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    
    if (index === this.data.currentCategory) {
      return;
    }

    this.setData({
      currentCategory: index,
      page: 1,
      hasMore: true
    });
    
    this.loadServices();
  },

  /**
   * 显示服务详情
   */
  showServiceDetail(e) {
    const service = e.currentTarget.dataset.service;
    this.setData({
      selectedService: service,
      showDetailModal: true
    });
  },

  /**
   * 隐藏服务详情
   */
  hideServiceDetail() {
    this.setData({
      showDetailModal: false,
      selectedService: null
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止事件冒泡
  },

  /**
   * 选择服务
   */
  selectService(e) {
    const service = e.currentTarget.dataset.service;
    
    // 检查用户是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再选择服务',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    // 跳转到订单创建页面
    wx.navigateTo({
      url: `/pages/order/order?serviceId=${service.id}&type=service`
    });
  },

  /**
   * 确认选择服务（从弹窗）
   */
  confirmService() {
    if (this.data.selectedService) {
      this.selectService({
        currentTarget: {
          dataset: {
            service: this.data.selectedService
          }
        }
      });
    }
  },

  /**
   * 切换 Tab
   */
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    
    if (index === this.data.currentTab) {
      return;
    }

    const pages = [
      '/pages/index/index',
      '/pages/service/service',
      '/pages/order/order',
      '/pages/profile/profile'
    ];

    if (index < pages.length) {
      wx.switchTab({
        url: pages[index],
        fail: (err) => {
          console.error('切换 Tab 失败:', err);
          wx.navigateTo({
            url: pages[index]
          });
        }
      });
    }
  }
});
