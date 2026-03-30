# 📱 清如 ClearSpring - 小程序前端查看指南

## 🎯 查看小程序前端的 4 种方法

---

## 方法 1：微信开发者工具（推荐）⭐⭐⭐⭐⭐

### 适用场景
- 查看完整小程序效果
- 调试小程序功能
- 预览真实运行效果

### 操作步骤

#### 步骤 1：下载微信开发者工具
**下载地址**：
```
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

**选择版本**：
- Windows：稳定版（64 位）
- Mac：稳定版（Intel/Apple Silicon）

---

#### 步骤 2：导入小程序项目

1. **打开微信开发者工具**

2. **选择「导入项目」**

3. **填写项目信息**：
   ```
   项目名称：清如 ClearSpring
   目录：/root/.openclaw/workspace/projects/clearspring-v2/miniprogram
   AppID：wxa914ecc15836bda6
   后端服务：微信云开发
   ```

4. **点击「导入」**

---

#### 步骤 3：查看页面

**项目结构**：
```
miniprogram/
├── pages/
│   ├── index/              # 祈福者端首页
│   ├── service/            # 服务页
│   ├── order/              # 订单页
│   ├── profile/            # 个人中心
│   ├── merit-forest/       # 功德林
│   ├── wiki/               # 科普百科
│   ├── settings/           # 设置页
│   ├── executor/           # 执行者端（9 个页面）
│   ├── meditation/         # 冥想模块（4 个页面）
│   └── ritual/             # 放生仪轨（4 个页面）
├── app.js                  # 小程序入口
├── app.json                # 小程序配置
├── app.wxss                # 全局样式
└── project.config.json     # 项目配置
```

**预览页面**：
1. 点击左侧文件树
2. 选择任意 `.wxml` 文件
3. 右侧自动预览效果

---

#### 步骤 4：编译预览

1. **点击工具栏「编译」按钮**
2. **选择预览模式**：
   - 普通预览
   - 真机预览
   - 远程调试

3. **查看效果**：
   - 模拟器预览
   - 扫码真机预览

---

### 设计特点

**祈福者端**：
- 背景色：宣纸底 `#EFEEE9`
- 主色调：禅意金 `#D4B87B`
- 组件圆角：24rpx
- 液态玻璃效果：70% 透明度 + backdrop-blur

**执行者端**：
- 背景色：岱绿系 `#4A5D4E` / `#334537`
- 组件圆角：24rpx
- 按钮热区：≥88rpx

**冥想模块**：
- 清新淡雅风格
- 渐变紫色背景
- 卡片式布局

**放生仪轨**：
- 传统佛教风格
- 庄严肃穆配色
- 分步学习模式

---

## 方法 2：查看设计文档（快速预览）⭐⭐⭐

### 适用场景
- 快速了解设计风格
- 查看配色方案
- 了解页面结构

### 查看位置

**设计文档**：
```
/root/.openclaw/workspace/projects/clearspring-v2/docs/
├── 设计规范 V4.0.md
├── UI 设计说明.md
├── 原型设计说明.md
└── 页面路由规划.md
```

**飞书文档**：
- 改造规划 V2.0：https://www.feishu.cn/docx/M2QgdoDhpoYMNwxAuLdcgS2knzc
- 需求规格说明书 V2.0：https://www.feishu.cn/docx/DVlhdHIBfo8qOPxMDPicqu9onbh
- 项目设计文档 V2.0：https://www.feishu.cn/docx/W0ssdrZNrotoUSxufdhcEEBBnEc

---

### 设计规范摘要

**配色系统**：
```css
/* 祈福者端 */
--cs-bg-primary: #EFEEE9;    /* 宣纸底 */
--cs-primary: #D4B87B;       /* 禅意金 */
--cs-primary-dark: #B89A5B;  /* 深金 */

/* 执行者端 */
--cs-executor-bg: #4A5D4E;   /* 岱绿 */
--cs-executor-primary: #334537; /* 深绿 */

/* 通用 */
--cs-radius: 24rpx;          /* 圆角 */
--cs-btn-min-height: 88rpx;  /* 按钮热区 */
```

**UI 规范**：
- ✅ CSS 变量驱动（禁止硬编码色值）
- ✅ 禁止 1px 实线边框（用色调渐变）
- ✅ 液态玻璃效果（70% 透明度 + backdrop-blur(20rpx)）
- ✅ 组件圆角统一 24rpx
- ✅ 按钮热区≥88rpx
- ✅ 敏感信息脱敏显示
- ✅ 关键操作审计日志

---

## 方法 3：查看源代码（开发者）⭐⭐⭐⭐

### 适用场景
- 开发者查看实现细节
- 学习代码结构
- 二次开发参考

### 查看方式

#### 方式 A：直接查看文件
```bash
# 查看首页代码
cat /root/.openclaw/workspace/projects/clearspring-v2/miniprogram/pages/index/index.wxml
cat /root/.openclaw/workspace/projects/clearspring-v2/miniprogram/pages/index/index.wxss
cat /root/.openclaw/workspace/projects/clearspring-v2/miniprogram/pages/index/index.js
```

#### 方式 B：使用 VS Code
1. 打开 VS Code
2. 文件 → 打开文件夹
3. 选择 `/root/.openclaw/workspace/projects/clearspring-v2/miniprogram`
4. 浏览文件结构

#### 方式 C：在线查看 GitHub
**仓库地址**：
```
https://github.com/ai-agent-marriage/clearspring-v2
```

**文件路径**：
```
miniprogram/pages/
├── index/              # 首页
├── service/            # 服务页
├── order/              # 订单页
└── ...
```

---

### 代码结构说明

**页面文件**（每个页面 4 个文件）：
- `.wxml` - 页面结构（类似 HTML）
- `.wxss` - 页面样式（类似 CSS）
- `.js` - 页面逻辑（JavaScript）
- `.json` - 页面配置

**示例：首页代码结构**：
```xml
<!-- index.wxml -->
<view class="container">
  <!-- 顶部导航栏（液态玻璃效果） -->
  <view class="glass-header">
    <text>清如 ClearSpring</text>
  </view>
  
  <!-- 法师推荐语卡片 -->
  <view class="master-card">
    <text>{{masterQuote}}</text>
  </view>
  
  <!-- 功德快捷入口 -->
  <view class="merit-grid">
    <view class="merit-item">
      <text>今日功德</text>
      <text class="number">{{todayMerit}}</text>
    </view>
  </view>
</view>
```

```css
/* index.wxss */
.container {
  background-color: var(--cs-bg-primary); /* #EFEEE9 */
}

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20rpx);
}

.merit-item {
  border-radius: var(--cs-radius); /* 24rpx */
}
```

---

## 方法 4：截图/录屏展示（非开发者）⭐⭐⭐

### 适用场景
- 向非技术人员展示
- 会议演示
- 宣传材料

### 操作方式

#### 方式 A：微信开发者工具截图
1. 在微信开发者工具中打开小程序
2. 点击工具栏「截图」按钮
3. 保存截图文件

#### 方式 B：真机录屏
1. 手机开启录屏功能
2. 微信扫码打开小程序
3. 操作小程序并录制
4. 导出视频文件

#### 方式 C：设计稿导出
1. 打开设计文档
2. 导出配色方案/组件示例
3. 制作成 PPT/PDF

---

## 📊 页面数量统计

### 祈福者端（7 个页面）
1. 首页 (index)
2. 服务页 (service)
3. 订单页 (order)
4. 个人中心 (profile)
5. 功德林 (merit-forest)
6. 科普百科 (wiki)
7. 设置页 (settings)

### 执行者端（9 个页面）
1. 资质审核 (qualification)
2. 审核状态 (status)
3. 执行者首页 (home)
4. 抢单大厅 (order-hall)
5. 任务助手 (assistant)
6. 原生拍摄 (camera)
7. 证据提交 (evidence)
8. 收入管理 (income)
9. 个人中心 (profile)

### 冥想模块（4 个页面）
1. 冥想首页 (index)
2. 冥想播放页 (player)
3. 冥想课程列表 (courses)
4. 冥想统计页 (stats)

### 放生仪轨（4 个页面）
1. 仪轨首页 (index)
2. 仪轨详情页 (detail)
3. 仪轨学习页 (learn)
4. 仪轨实践页 (practice)

### 管理端 H5（2 个页面）
1. 资质审核 H5 (audit-h5)
2. 申诉仲裁 H5 (arbitration-h5)

**总计**：26 个小程序页面 + 9 个管理后台页面 = **35 个页面**

---

## 🎨 设计风格关键词

### 祈福者端
- 禅意
- 素雅
- 宣纸质感
- 金色点缀
- 液态玻璃

### 执行者端
- 专业
- 稳重
- 岱绿色系
- 清晰易用

### 冥想模块
- 清新
- 淡雅
- 渐变紫色
- 放松舒适

### 放生仪轨
- 传统
- 庄严
- 佛教风格
- 步骤清晰

---

## 🚀 推荐方案

### 如果你是开发者
**推荐**：方法 1（微信开发者工具）+ 方法 3（查看源代码）

### 如果你是设计师
**推荐**：方法 2（查看设计文档）+ 方法 4（截图展示）

### 如果你是产品经理
**推荐**：方法 1（微信开发者工具）+ 方法 2（设计文档）

### 如果你是投资人/客户
**推荐**：方法 4（截图/录屏展示）

---

## 📞 快速开始

**最快方式**（5 分钟）：
1. 下载微信开发者工具
2. 导入项目（目录：`miniprogram`）
3. 点击「编译」
4. 查看效果

**查看设计**（2 分钟）：
1. 打开飞书文档
2. 查看「项目设计文档 V2.0」
3. 查看配色方案和 UI 规范

---

**需要我帮你做什么？**
1. 远程协助安装微信开发者工具？
2. 生成小程序演示视频？
3. 导出设计稿 PPT？

告诉我你的需求！📱
