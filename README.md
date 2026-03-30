# 清如 ClearSpring V2.0 - 放生服务小程序

**版本**: V2.0  
**启动时间**: 2026-03-30  
**项目状态**: 重新启动  

---

## 📋 项目概况

- **项目类型**: 放生服务类微信小程序
- **AppID**: wxa914ecc15836bda6
- **开发环境**: OpenClaw + 微信云开发
- **火山云 IP**: 101.96.192.63
- **微信云环境 ID**: cloud1-7ga68ls3ccebbe5b

---

## 🎯 V2.0 核心决策（2026-03-29 21:41）

### 决策 1：技术架构
- ✅ 混合架构（火山云 + 微信云）
- ❌ 否决纯微信云开发（豆包建议）
- ❌ 否决纯火山云（KIMI 建议）

### 决策 2：MVP 范围
- ✅ 30 个页面（V2.0）
- ✅ 32 个接口（V2.0）
- ✅ 21 个组件（V2.0）

### 决策 3：开发节奏
- ✅ 最快速度开发
- ❌ 否决豆包 6 里程碑（8-10 周）
- ✅ 5 Agent 并行开发

### 决策 4：Agent 配置
- 前端开发 Agent
- 后端开发 Agent
- 数据库与安全 Agent
- 质量监督 Agent
- 运维部署 Agent

---

## 📁 项目结构

```
clearspring-v2/
├── pages/              # 小程序页面（30 个）
│   ├── index/          # 首页
│   ├── service/        # 服务页
│   ├── order/          # 订单页
│   ├── profile/        # 个人中心
│   ├── merit-forest/   # 功德林
│   ├── wiki/           # 科普百科
│   ├── settings/       # 设置页
│   ├── login/          # 登录页
│   ├── guide/          # 新手引导
│   └── executor-*      # 执行者端（9 个）
├── cloud/              # 云函数（8 个）
│   └── functions/
│       ├── login/
│       ├── createOrder/
│       ├── grabOrder/
│       └── uploadEvidence/
├── admin-pc/           # PC 管理后台（9 个页面）
├── admin-h5/           # 移动应急 H5（2 个页面）
├── tests/              # 单元测试
└── docs/               # 飞书文档链接
```

---

## 📊 开发规范

### 工作准则（2026-03-30 新增）
- 🔴 无代码提交不汇报进度
- 🔴 每次汇报必须附带 `git log --oneline -3`
- 🔴 知识库信息必须双重验证（代码 + 文档）
- 🔴 质量监督 Agent 有权否决虚假汇报

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
test: 测试用例
refactor: 重构
chore: 构建/工具
```

---

## 📚 相关文档

| 文档 | 链接 |
|------|------|
| 需求规格说明书 V2.0 | https://www.feishu.cn/docx/DVlhdHIBfo8qOPxMDPicqu9onbh |
| 项目设计文档 V2.0 | https://www.feishu.cn/docx/W0ssdrZNrotoUSxufdhcEEBBnEc |
| 页面路由规划 V2.0 | https://www.feishu.cn/docx/OCxUdiB4LodE3CxGmQqcawF1nmb |
| 组件库规范 V2.0 | https://www.feishu.cn/docx/LENDdADm8oHWkgxKaK3c4Q8bnxB |
| API 接口文档 V2.0 | https://www.feishu.cn/docx/IiRQdVdyAoUgRxxglWZcWEW9nie |
| 综合评审（豆包+KIMI） | https://www.feishu.cn/docx/S2GLwmVf9i7OlMkvjnFcs75Tnub |

---

## 🚀 开发进度

| 里程碑 | 状态 | Git 提交 |
|--------|------|---------|
| 项目初始化 | ✅ 完成 | - |
| ColorUI 集成 | ⏳ 待开始 | - |
| 祈福者端开发 | ⏳ 待开始 | - |
| 执行者端开发 | ⏳ 待开始 | - |
| 管理端开发 | ⏳ 待开始 | - |
| 后端 API 开发 | ⏳ 待开始 | - |
| 联调测试 | ⏳ 待开始 | - |

---

**最后更新**: 2026-03-30 07:35  
**下次汇报**: 首次代码提交后
