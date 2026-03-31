# 组件化重构指南

## 组件化标准

### 何时需要组件化？

当页面文件满足以下任一条件时，应该考虑组件化：

1. **单文件超过 500 行**
2. **相同代码重复 3 次以上**
3. **功能模块可以独立复用**

---

## 标准组件结构

### 目录结构
```
components/
├── service-card/
│   ├── service-card.wxml    # 组件模板
│   ├── service-card.wxss    # 组件样式
│   ├── service-card.js      # 组件逻辑
│   └── service-card.json    # 组件配置
├── order-form/
└── merit-stat/
```

### 组件配置 (service-card.json)
```json
{
  "component": true,
  "usingComponents": {}
}
```

### 组件模板 (service-card.wxml)
```xml
<view class="service-card card-shadow">
  <view class="service-image-wrapper">
    <image class="service-image" src="{{service.image}}" mode="aspectFill"></image>
    <view class="service-tag" wx:if="{{service.tag}}">{{service.tag}}</view>
  </view>
  
  <view class="service-content">
    <view class="service-header">
      <text class="service-title">{{service.title}}</text>
      <view class="service-rating" wx:if="{{service.rating}}">
        <text class="cuIcon-cuIcon-starfill text-yellow"></text>
        <text class="rating-value">{{service.rating}}</text>
      </view>
    </view>
    
    <text class="service-desc text-cut">{{service.description}}</text>
    
    <view class="service-footer">
      <view class="service-price">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{service.price}}</text>
      </view>
      <button class="service-action-btn" bindtap="onAction">立即放生</button>
    </view>
  </view>
</view>
```

### 组件逻辑 (service-card.js)
```javascript
Component({
  properties: {
    service: {
      type: Object,
      value: {},
      observer: 'onServiceChange'
    }
  },
  
  data: {
    
  },
  
  methods: {
    onServiceChange(newVal) {
      console.log('服务数据变化:', newVal);
    },
    
    onAction() {
      this.triggerEvent('action', {
        serviceId: this.data.service.id
      });
    }
  }
})
```

### 组件样式 (service-card.wxss)
```css
.service-card {
  border-radius: 24rpx;
  background: #FFFFFF;
  overflow: hidden;
  transition: all 0.3s ease;
}

.service-card:active {
  transform: scale(0.98);
}

/* ... 其他样式 ... */
```

---

## 使用组件

### 在页面中引用

**页面 JSON 配置**
```json
{
  "usingComponents": {
    "service-card": "/components/service-card/service-card"
  }
}
```

**页面 WXML**
```xml
<view class="service-list">
  <service-card 
    wx:for="{{services}}" 
    wx:key="id"
    service="{{item}}"
    bind:action="onServiceAction"
  />
</view>
```

---

## 推荐组件清单

### 基础组件
1. **service-card** - 服务卡片
2. **merit-stat** - 功德统计卡片
3. **order-form** - 订单表单
4. **evidence-uploader** - 证据上传组件
5. **meditation-player** - 冥想播放器

### 业务组件
6. **release-form** - 放生表单
7. **prayer-card** - 祈福卡片
8. **certificate-wall** - 证书墙（瀑布流）
9. **executor-card** - 执行者卡片
10. **admin-stat** - 管理统计卡片

---

## 组件开发流程

1. **识别可复用模块**
   - 查看哪些代码重复出现
   - 识别独立功能模块

2. **提取组件**
   - 创建组件目录
   - 分离 template/script/style

3. **定义 Props**
   - 确定组件需要的输入数据
   - 定义事件输出

4. **测试组件**
   - 单独测试组件功能
   - 在页面中集成测试

5. **文档化**
   - 编写组件使用说明
   - 提供示例代码

---

## 组件化收益

- ✅ **代码复用** - 减少重复代码
- ✅ **维护简单** - 修改一处，全局生效
- ✅ **测试容易** - 独立测试组件
- ✅ **性能优化** - 按需加载组件
- ✅ **团队协作** - 多人并行开发

---

**最后更新**: 2026-03-31
