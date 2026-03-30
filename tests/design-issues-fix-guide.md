# 清如 ClearSpring 设计问题清单与修复指南

**生成日期**: 2026-03-31  
**优先级说明**: P0-紧急 | P1-重要 | P2-优化  

---

## 🔴 P0 问题（紧急 - 必须修复）

### 问题 #1: order-hall 页面抢单按钮热区不足

**问题等级**: 🔴 P0  
**影响范围**: 执行者端 - 抢单大厅  
**用户体验影响**: 高（可能导致点击失败、误触）  

#### 问题详情
- **文件位置**: `/root/.openclaw/workspace/projects/clearspring-v2/miniprogram/pages/executor/order-hall/order-hall.wxss`
- **问题代码行**: 约第 85-93 行
- **当前代码**:
  ```css
  .grab-btn {
    min-height: 72rpx;  /* ❌ 低于 88rpx 标准 */
    padding: 0 40rpx;
    border-radius: 36rpx;
    background: linear-gradient(135deg, var(--executor-green) 0%, var(--executor-green-light) 100%);
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    box-shadow: 0 4rpx 16rpx rgba(74, 93, 78, 0.3);
  }
  ```

#### 修复方案
```css
.grab-btn {
  min-height: 88rpx;   /* ✅ 修复：提高到 88rpx */
  min-width: 88rpx;    /* ✅ 新增：确保最小点击宽度 */
  padding: 0 40rpx;
  border-radius: 44rpx; /* ✅ 调整：与高度匹配的圆角 */
  background: linear-gradient(135deg, var(--executor-green) 0%, var(--executor-green-light) 100%);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(74, 93, 78, 0.3);
  transition: all 0.3s ease;
}

.grab-btn:active {
  transform: scale(0.95);
}
```

#### 验证方法
1. 打开微信开发者工具
2. 进入抢单大厅页面
3. 使用工具测量按钮点击区域
4. 确认热区 ≥ 88rpx

#### 预计修复时间
- 开发：10 分钟
- 测试：5 分钟
- **总计：15 分钟**

---

## 🟡 P1 问题（重要 - 建议修复）

### 问题 #2: profile 页面样式未统一至 V2.0 规范

**问题等级**: 🟡 P1  
**影响范围**: 祈福者端 - 个人中心  
**用户体验影响**: 中（视觉风格不一致）  

#### 问题详情
- **文件位置**: `/root/.openclaw/workspace/pages/profile/profile.wxss`
- **问题描述**: 页面使用旧版样式，未使用 CSS 变量，与设计规范不一致
- **当前代码**:
  ```css
  page {
    background-color: #f5f5f5;  /* ❌ 硬编码色值 */
  }
  
  .profile-card {
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);  /* ❌ 硬编码渐变色 */
    color: #fff;
  }
  
  .avatar {
    width: 128rpx;
    height: 128rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
  }
  
  .login-btn {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 32rpx;  /* ❌ 圆角不统一 */
    font-size: 28rpx;
  }
  ```

#### 修复方案
```css
/**
 * 清如 ClearSpring V2.0 - 个人中心页样式
 * 页面路径：pages/profile/profile
 * 
 * 设计规范：
 * - 主色调：禅意金 #D4B87B
 * - 组件圆角：24rpx
 * - 按钮热区：≥88rpx
 */

/* ====================
   CSS 变量定义
   ==================== */
page {
  --bg-primary: #F5F5F0;         /* 浅色背景 */
  --primary-gold: #D4B87B;       /* 禅意金 */
  --primary-gold-dark: #B89A5B;  /* 深金色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-hint: #999999;
  --card-radius: 24rpx;          /* 组件圆角 */
  --btn-min-height: 88rpx;       /* 按钮最小热区 */
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

/* ====================
   页面基础样式
   ==================== */
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* ====================
   用户信息卡片
   ==================== */
.profile-card {
  margin: 30rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  border-radius: var(--card-radius);
  color: #FFFFFF;
  box-shadow: 0 8rpx 40rpx rgba(212, 184, 123, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  margin-right: 24rpx;
  background-color: #FFFFFF;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  opacity: 0.9;
}

/* ====================
   菜单列表
   ==================== */
.menu-section {
  background: #FFFFFF;
  border-radius: var(--card-radius);
  margin: 0 30rpx 30rpx;
  box-shadow: var(--shadow-light);
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  min-height: var(--btn-min-height);  /* ✅ 确保按钮热区 */
  min-width: 88rpx;
  border-bottom: 1rpx solid #F5F5F5;
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: rgba(212, 184, 123, 0.08);
}

.menu-name {
  font-size: 30rpx;
  color: var(--text-primary);
}

.menu-arrow {
  color: var(--text-hint);
  font-size: 28rpx;
}

/* ====================
   操作按钮
   ==================== */
.action-btn {
  margin: 0 30rpx 30rpx;
  min-height: var(--btn-min-height);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  color: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(212, 184, 123, 0.4);
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-secondary {
  background: #FFFFFF;
  color: var(--primary-gold-dark);
  border: 2rpx solid var(--primary-gold);
}

/* ====================
   响应式适配
   ==================== */
@media (max-width: 375px) {
  .profile-card {
    margin: 20rpx;
    padding: 30rpx;
  }
  
  .nickname {
    font-size: 32rpx;
  }
}
```

#### 验证方法
1. 对比其他 V2.0 页面的视觉效果
2. 检查 CSS 变量使用情况
3. 测量按钮热区是否达标
4. 测试响应式适配

#### 预计修复时间
- 开发：30 分钟
- 测试：15 分钟
- **总计：45 分钟**

---

## 🟢 P2 问题（优化 - 可选）

### 问题 #3: CSS 变量使用不统一

**问题等级**: 🟢 P2  
**影响范围**: 多个页面  
**用户体验影响**: 低（主要影响代码可维护性）  

#### 问题详情
部分页面仍使用硬编码的色值和尺寸，未使用 CSS 变量：

| 文件 | 硬编码项 | 建议变量 |
|-----|---------|---------|
| `pages/profile/profile.wxss` | `#f5f5f5`, `#07c160`, `32rpx` | `--bg-primary`, `--executor-green`, 统一圆角 |
| `pages/executor/order-hall/order-hall.wxss` | 部分色值 | 统一使用变量 |

#### 修复方案

**步骤 1**: 在所有页面顶部统一定义 CSS 变量
```css
page {
  /* 基础色值 */
  --bg-primary: #F5F5F0;
  --primary-gold: #D4B87B;
  --primary-gold-dark: #B89A5B;
  --executor-green: #4A5D4E;
  --executor-green-light: #6B7D6E;
  
  /* 功能色值 */
  --success-green: #39B54A;
  --warning-orange: #F37B1D;
  --error-red: #E54D42;
  
  /* 文字色值 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-hint: #999999;
  
  /* 尺寸规范 */
  --card-radius: 24rpx;
  --btn-min-height: 88rpx;
  --btn-radius: 44rpx;
  
  /* 阴影 */
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8rpx 40rpx rgba(0, 0, 0, 0.12);
}
```

**步骤 2**: 替换所有硬编码值为变量
```css
/* ❌ 旧代码 */
.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

/* ✅ 新代码 */
.card {
  background: #FFFFFF;  /* 白色可保留 */
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-light);
}
```

#### 验证方法
1. 搜索所有硬编码色值（`#[0-9A-Fa-f]{3,6}`）
2. 确认已替换为对应变量
3. 视觉对比确保无色差

#### 预计修复时间
- 开发：1 小时
- 测试：30 分钟
- **总计：1.5 小时**

---

## 📋 修复检查清单

### 修复前准备
- [ ] 备份当前代码（Git commit）
- [ ] 创建修复分支
- [ ] 记录当前版本号

### 修复流程
- [ ] 按优先级依次修复问题
- [ ] 每个问题修复后自测
- [ ] 更新相关文档注释

### 修复后验证
- [ ] 按钮热区测试（微信开发者工具）
- [ ] 表单验证测试（实际输入测试）
- [ ] 视觉一致性检查（多页面对比）
- [ ] 响应式测试（多设备预览）

### 代码审查要点
- [ ] CSS 变量使用是否统一
- [ ] 按钮热区是否 ≥ 88rpx
- [ ] 圆角是否统一为 24rpx/44rpx
- [ ] 色值是否使用变量
- [ ] 注释是否完整清晰

---

## 📊 修复进度跟踪

| 问题编号 | 优先级 | 状态 | 负责人 | 预计完成 | 实际完成 |
|---------|-------|------|-------|---------|---------|
| 问题 #1 | P0 | ⏳ 待修复 | - | - | - |
| 问题 #2 | P1 | ⏳ 待修复 | - | - | - |
| 问题 #3 | P2 | ⏳ 待修复 | - | - | - |

---

## 🔗 相关文档

- [设计质量测试报告](./design-quality-test-report.md)
- [设计规范文档](../docs/design-spec.md)
- [前端开发规范](../docs/frontend-guide.md)

---

**文档维护**: 设计质量测试-Agent  
**最后更新**: 2026-03-31 00:30:00 GMT+8
