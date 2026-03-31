# 清如 ClearSpring V2.0 - AI 技能组合流程

**版本**: 1.0  
**生效时间**: 2026-03-31  
**适用范围**: 清如小程序项目开发管理

---

## 📊 技能选择策略

### 核心原则
**只选择最有效的技能，不是所有技能都要用**

根据清如项目特点（微信小程序开发、多角色系统、测试发现问题多），选择以下 **6 个核心技能**：

| 技能 | 优先级 | 使用场景 | 使用频率 |
|------|--------|---------|---------|
| **agent-team-orchestration** | ⭐⭐⭐⭐⭐ | 多 Agent 任务分配和协调 | 每次开发任务 |
| **self-improvement** | ⭐⭐⭐⭐⭐ | 错误记录和经验积累 | 每次遇到问题 |
| **proactive-agent** | ⭐⭐⭐⭐ | 主动检查和提醒 | 每日心跳检查 |
| **frontend-design** | ⭐⭐⭐⭐ | UI 设计和优化 | 页面开发时 |
| **multi-team-coding** | ⭐⭐⭐ | 大型功能并行开发 | 阶段性冲刺 |
| **skill-discovery** | ⭐⭐ | 发现新技能 | 需要新能力时 |

### 不推荐使用的技能

| 技能 | 原因 |
|------|------|
| **elite-longterm-memory** | 功能与 MEMORY.md 重复，增加复杂度 |
| **memory-setup-openclaw** | 记忆系统已配置完成，无需重复设置 |
| **ontology** | 项目规模不需要知识图谱 |
| **ui-ux-pro-max-skill** | 与 frontend-design 功能重叠 |
| **delegate-task** | 已有 agent-team-orchestration 更强大 |
| **impeccable-uxui** | 与 frontend-design 功能重叠 |

---

## 🔄 标准开发流程

### 流程概览

```
需求分析 → 任务分解 → Agent 分配 → 并行开发 → 质量检查 → 测试验证 → 经验总结
    ↓          ↓          ↓          ↓          ↓          ↓          ↓
  主动      团队编排   多团队      前端设计   质量专家   自动化    自我改进
  检查      技能       编码       技能       审查       测试      技能
```

---

## 📋 详细流程步骤

### 阶段 1：需求分析和任务分解

**使用技能**: `proactive-agent` + `agent-team-orchestration`

**步骤**:
1. **主动分析需求** (proactive-agent)
   - 分析用户需求的完整范围
   - 识别潜在风险和依赖
   - 提出补充建议

2. **任务分解** (agent-team-orchestration)
   ```
   大需求 → 子任务 1 → 子任务 2 → 子任务 3
           ↓          ↓          ↓
        Builder   Builder   Builder
   ```

3. **定义角色**
   - **Orchestrator** (主 Agent): 任务分配和进度跟踪
   - **Builder** (开发 Agent): 代码实现
   - **Reviewer** (质量 Agent): 代码审查

**输出**: 任务清单 + 分配方案

---

### 阶段 2：并行开发

**使用技能**: `multi-team-coding` + `frontend-design`

**步骤**:

1. **创建开发团队** (multi-team-coding)
   ```bash
   # 为每个子任务创建独立 worktree
   git worktree add ../worktree/feature-1 -b feature/feature-1
   git worktree add ../worktree/feature-2 -b feature/feature-2
   ```

2. **分配任务** (agent-team-orchestration)
   ```
   Agent 1 → 任务 A → worktree/feature-1
   Agent 2 → 任务 B → worktree/feature-2
   Agent 3 → 任务 C → worktree/feature-3
   ```

3. **UI 设计指导** (frontend-design)
   - 选择设计方向（Stitch 风格）
   - 定义配色方案（宣纸底 + 禅意金 + 岱绿）
   - 提供组件设计指南

4. **并行开发**
   - 各 Agent 在独立 worktree 中开发
   - 互不干扰，可以修改相同文件
   - 实时提交到各自分支

**输出**: 多个功能分支的代码

---

### 阶段 3：质量检查

**使用技能**: `agent-team-orchestration` (Reviewer 角色)

**步骤**:

1. **代码审查**
   ```
   Builder 提交代码 → Reviewer 审查 → 通过/打回
   ```

2. **审查清单**
   - [ ] 代码符合 AGENTS.md 规范
   - [ ] 有模拟数据确保页面可渲染
   - [ ] 路由配置已更新
   - [ ] 无 console.error 报错
   - [ ] 有适当的错误处理

3. **质量评分**
   - 90-100 分：直接合并
   - 80-89 分：小修后合并
   - <80 分：打回重做

**输出**: 审查报告 + 合并建议

---

### 阶段 4：测试验证

**使用技能**: `multi-team-coding` (Playwright 测试)

**步骤**:

1. **自动化测试**
   ```bash
   # E2E 测试
   npx playwright test e2e/
   
   # API 测试
   npx playwright test api/
   
   # 视觉测试
   npx playwright test visual/
   ```

2. **测试覆盖**
   - 核心流程测试（登录/下单/支付）
   - 边界条件测试
   - 错误处理测试

3. **生成测试报告**
   ```markdown
   ## 测试结果
   - 总测试：100 项
   - 通过：95 项
   - 失败：5 项
   - 覆盖率：95%
   ```

**输出**: 测试报告 + 问题清单

---

### 阶段 5：经验总结

**使用技能**: `self-improvement`

**步骤**:

1. **记录错误** (ERRORS.md)
   ```markdown
   ## 2026-03-31 - 登录页面缺失
   
   **问题**: 代码中引用了 /pages/login/login 但页面不存在
   
   **原因**: 生成代码前未检查路由配置
   
   **解决方案**: 
   1. 创建登录页面
   2. 在 app.json 中注册路由
   
   **预防措施**: 使用 tree-generator.sh 检查文件完整性
   ```

2. **记录经验** (LEARNINGS.md)
   ```markdown
   ## 2026-03-31 - Stitch 风格设计规范
   
   **类型**: best_practice
   
   **发现**: Stitch 风格（深绿渐变 + 金色文字）显著提升 UI 质量
   
   **应用**: 
   - 首页欢迎语卡片
   - 服务页 Tab 设计
   - 订单页摘要卡片
   
   **代码示例**:
   ```css
   .welcome-card {
     background: linear-gradient(135deg, #4A5D4E 0%, #334537 100%);
     color: #D4B87B;
   }
   ```
   ```

3. **记录功能请求** (FEATURE_REQUESTS.md)
   ```markdown
   ## 登录功能
   
   **需求**: 微信授权登录页面
   
   **优先级**: P0
   
   **状态**: 开发中 (@login-agent)
   ```

4. **更新 AGENTS.md**
   - 将重要经验提升到 AGENTS.md
   - 更新开发规范
   - 添加新的检查清单

**输出**: 经验文档 + 规范更新

---

## 🛠️ 工具集成

### 工程思维工具（必用）

**1. tree-generator.sh** - 静态分析
```bash
# 在开始开发前运行
bash scripts/tree-generator.sh

# 输出：
# - 项目目录结构
# - 页面文件统计
# - 路由注册检查
# - 缺失文件检测
```

**2. api-validator.sh** - API 校验
```bash
# 在编写云函数前运行
bash scripts/api-validator.sh

# 输出：
# - 标准 API 格式
# - Mock 数据生成
# - 数据格式校验
```

**3. component-guide.md** - 组件化指南
```markdown
# 当单文件超过 500 行时参考
# 提取可复用组件
# 保持代码结构清晰
```

---

## 📊 心跳检查流程

**使用技能**: `proactive-agent`

**每日检查清单**（早晚各一次）：

### 早上检查（09:00）
- [ ] 检查 Git 仓库状态
- [ ] 查看未完成的任务
- [ ] 检查云函数状态
- [ ] 查看测试报告
- [ ] 生成今日工作计划

### 晚上检查（18:00）
- [ ] 检查今日完成情况
- [ ] 查看错误日志
- [ ] 更新经验文档
- [ ] 生成进度报告
- [ ] 规划明日工作

### 检查脚本
```bash
# 项目状态检查
git status
git log --oneline -5

# 文件完整性检查
bash scripts/tree-generator.sh

# API 校验
bash scripts/api-validator.sh

# 查看错误日志
cat .learnings/ERRORS.md | tail -20
```

---

## 🚨 问题处理流程

### P0 问题（阻塞）
**响应时间**: 立即

**流程**:
1. 记录到 `.learnings/ERRORS.md`
2. 分配最高优先级 Agent
3. 暂停其他任务，专注修复
4. 修复后运行全量测试
5. 更新经验文档

### P1 问题（严重）
**响应时间**: 24 小时

**流程**:
1. 记录到 `.learnings/ERRORS.md`
2. 分配 Agent 修复
3. 24 小时内完成
4. 审查后合并

### P2 问题（一般）
**响应时间**: 本周内

**流程**:
1. 记录到 `.learnings/ERRORS.md`
2. 加入待办清单
3. 本周内修复
4. 常规审查

### P3 问题（轻微）
**响应时间**: 后续完善

**流程**:
1. 记录到 `.learnings/FEATURE_REQUESTS.md`
2. 加入 backlog
3. 有时间时修复

---

## 📈 进度追踪

### 每日报告格式
```markdown
# 清如项目 - 日报 2026-03-31

## 今日完成
- ✅ 任务 1：描述
- ✅ 任务 2：描述
- ✅ 任务 3：描述

## 进行中
- ⏳ 任务 4：进度 50%
- ⏳ 任务 5：进度 30%

## 问题
- 🔴 P0 问题：描述 + 处理方案
- 🟠 P1 问题：描述 + 负责人

## 明日计划
- [ ] 任务 6
- [ ] 任务 7
- [ ] 任务 8

## 统计
- 总提交：XX 次
- 新增文件：XX 个
- 修复问题：XX 个
- 测试通过率：XX%
```

### 每周报告格式
```markdown
# 清如项目 - 周报 2026-W14

## 本周完成
- ✅ 阶段 1：登录功能开发
- ✅ 阶段 2：功德页面补充
- ✅ 阶段 3：云函数框架完善

## 质量指标
- 代码审查通过率：95%
- 测试覆盖率：87%
- P0 问题修复率：100%
- 技术债务：低/中/高

## 下周计划
- [ ] 订单流程完善
- [ ] 支付功能集成
- [ ] 性能优化

## 风险
- 🔴 风险 1：描述 + 缓解措施
- 🟡 风险 2：描述 + 缓解措施
```

---

## 🎯 成功标准

### 代码质量
- ✅ 代码审查通过率 > 90%
- ✅ 测试覆盖率 > 85%
- ✅ P0 问题修复率 100%
- ✅ 技术债务可控

### 开发效率
- ✅ 需求响应时间 < 2 小时
- ✅ 功能开发周期 < 3 天
- ✅ Bug 修复周期 < 1 天
- ✅ 每日提交 > 5 次

### 文档质量
- ✅ 经验文档及时更新
- ✅ AGENTS.md 持续完善
- ✅ 测试报告完整
- ✅ 进度报告清晰

---

## 📝 变更记录

| 时间 | 变更内容 | 变更人 | 原因 |
|------|---------|--------|------|
| 2026-03-31 | 初始版本 | AI Assistant | 规范技能使用流程 |

---

**所有参与清如项目的 AI Agent 必须遵守此流程！**

**违反流程将导致开发效率下降和代码质量问题，请严格遵守！**

**最后更新**: 2026-03-31 14:36
