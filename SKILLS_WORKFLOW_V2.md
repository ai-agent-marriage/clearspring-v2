# 清如 ClearSpring V2.0 - 15 技能完整调度流程

**版本**: 2.0  
**生效时间**: 2026-03-31 14:52  
**技能总数**: 15 个（6 个核心 + 9 个质量增强）

---

## 📊 完整技能清单

### 核心层（6 个）- 已有 ✅

| # | 技能名称 | 版本 | 用途 | 触发时机 |
|---|---------|------|------|---------|
| 1 | **agent-team-orchestration** | 1.0.0 | 多 Agent 任务协调 | 每次开发任务 |
| 2 | **self-improving-agent** | 3.0.10 | 错误记录和经验积累 | 每次遇到问题 |
| 3 | **proactive-agent** | 3.1.0 | 主动检查和提醒 | 每日心跳检查 |
| 4 | **frontend-design** | - | UI 设计和优化 | 页面开发时 |
| 5 | **multi-team-coding** | 1.0.0 | 大型功能并行开发 | 阶段性冲刺 |
| 6 | **skill-discovery** | - | 发现新技能 | 需要新能力时 |

### 质量层（5 个）- 新增 ⭐

| # | 技能名称 | 版本 | 用途 | 触发时机 |
|---|---------|------|------|---------|
| 7 | **quack-code-review** | 3.698 | 快速代码审查 | 每次代码提交前 |
| 8 | **debug-pro** | 1.0.0 | 专业调试工具 | 遇到 bug 时 |
| 9 | **test-runner** | 3.668 | 自动化测试运行 | 开发完成后 |
| 10 | **requirement-analysis-system** | 3.233 | 需求分析 | 需求评审时 |
| 11 | **code-review-assistant** | 3.603 | 代码审查助手 | 代码审查时 |

### 预防层（4 个）- 推荐安装

| # | 技能名称 | 状态 | 用途 | 触发时机 |
|---|---------|------|------|---------|
| 12 | **debug-checklist** | 待安装 | Debug 检查清单 | 调试问题时 |
| 13 | **api-contract-designer** | ❌不存在 | API 契约定义 | 接口设计时 |
| 14 | **unit-test-generator** | ❌不存在 | 单元测试生成 | 编写代码时 |
| 15 | **coverage-analyzer** | ❌不存在 | 覆盖率分析 | 测试完成后 |

**注**: 部分技能在 clawhub 上不存在，使用同类替代技能

---

## 🔄 完整开发流程（7 阶段）

### 阶段 1：需求分析（预防阶段）⭐⭐⭐⭐⭐

**使用技能**: `proactive-agent` + `requirement-analysis-system` + `agent-team-orchestration`

**流程**:
```
1. proactive-agent 主动分析需求
   ↓
2. requirement-analysis-system 深度分析
   - 需求完整性检查
   - 依赖关系识别
   - 风险评估
   ↓
3. agent-team-orchestration 任务分解
   - 分解为子任务
   - 定义 Agent 角色
   - 分配负责人
```

**输出物**:
- ✅ 需求分析报告
- ✅ 任务分解清单
- ✅ 风险评估文档
- ✅ Agent 分配方案

**工程工具**:
```bash
# 需求分析模板
cat docs/requirement-template.md

# 任务分解检查清单
bash scripts/task-checklist.sh
```

**质量门禁**:
- [ ] 需求覆盖率 100%
- [ ] 所有依赖已识别
- [ ] 风险已评估
- [ ] 任务已分解到可执行粒度

---

### 阶段 2：架构设计（预防阶段）⭐⭐⭐⭐⭐

**使用技能**: `agent-team-orchestration` + `frontend-design`

**流程**:
```
1. 架构设计
   - 数据结构设计
   - 接口契约定义
   - 组件拆分方案
   ↓
2. frontend-design UI 设计
   - 选择设计风格（Stitch 风格）
   - 定义配色方案
   - 组件设计规范
   ↓
3. 设计评审
   - 架构合理性审查
   - UI 设计审查
   - 可维护性评估
```

**输出物**:
- ✅ 架构设计文档
- ✅ 数据结构定义
- ✅ API 接口契约
- ✅ UI 设计稿

**工程工具**:
```bash
# API 契约模板
bash scripts/api-validator.sh

# 组件化指南
cat docs/component-guide.md
```

**质量门禁**:
- [ ] 架构符合最佳实践
- [ ] 数据结构已定义
- [ ] API 契约已评审
- [ ] UI 设计符合规范

---

### 阶段 3：并行开发（执行阶段）⭐⭐⭐⭐⭐

**使用技能**: `multi-team-coding` + `frontend-design`

**流程**:
```
1. multi-team-coding 创建独立 worktree
   ↓
2. 分配任务给各 Agent
   Agent 1 → worktree/feature-1
   Agent 2 → worktree/feature-2
   Agent 3 → worktree/feature-3
   ↓
3. 并行开发
   - 各 Agent 独立开发
   - 实时提交到各自分支
   - 互不干扰
   ↓
4. frontend-design 提供 UI 指导
   - Stitch 风格实施
   - 组件开发
   - 样式优化
```

**输出物**:
- ✅ 功能代码（多个分支）
- ✅ UI 组件
- ✅ 单元测试
- ✅ 开发日志

**工程工具**:
```bash
# 创建 worktree
git worktree add ../worktree/feature-1 -b feature/feature-1

# 生成 Mock 数据
bash scripts/api-validator.sh
```

**质量门禁**:
- [ ] 代码符合 AGENTS.md 规范
- [ ] 有模拟数据确保页面可渲染
- [ ] 单元测试覆盖率 > 80%
- [ ] 无 console.error 报错

---

### 阶段 4：代码审查（控制阶段）⭐⭐⭐⭐⭐

**使用技能**: `quack-code-review` + `code-review-assistant` + `agent-team-orchestration`

**流程**:
```
1. Builder 提交代码
   ↓
2. quack-code-review 快速审查
   - 代码风格检查
   - 潜在问题识别
   - 安全漏洞扫描
   ↓
3. code-review-assistant 深度审查
   - 逻辑正确性
   - 性能优化建议
   - 可维护性评估
   ↓
4. Reviewer 汇总审查结果
   - 通过 → 合并
   - 小修 → 修改后合并
   - 打回 → 重新开发
```

**输出物**:
- ✅ 代码审查报告
- ✅ 问题清单
- ✅ 修复建议
- ✅ 合并决定

**工程工具**:
```bash
# 代码审查检查清单
bash scripts/code-review-checklist.sh

# 静态分析
bash scripts/tree-generator.sh
```

**质量门禁**:
- [ ] 代码审查通过率 > 90%
- [ ] P0 问题已修复
- [ ] P1 问题已修复或接受
- [ ] 代码风格符合规范

---

### 阶段 5：自动化测试（保障阶段）⭐⭐⭐⭐⭐

**使用技能**: `test-runner` + `multi-team-coding`

**流程**:
```
1. test-runner 运行自动化测试
   ↓
2. E2E 测试
   - 核心流程测试（登录/下单/支付）
   - 边界条件测试
   - 错误处理测试
   ↓
3. API 测试
   - 接口功能测试
   - 数据格式验证
   - 错误响应测试
   ↓
4. 视觉测试
   - UI 一致性检查
   - 响应式布局测试
   - 视觉回归测试
   ↓
5. 生成测试报告
```

**输出物**:
- ✅ 测试执行报告
- ✅ 测试覆盖率报告
- ✅ 问题清单
- ✅ 修复建议

**工程工具**:
```bash
# 运行 E2E 测试
npx playwright test e2e/

# 运行 API 测试
npx playwright test api/

# 生成覆盖率报告
npx playwright test --coverage
```

**质量门禁**:
- [ ] 测试通过率 > 95%
- [ ] 核心功能覆盖率 100%
- [ ] P0/P1 问题已修复
- [ ] 视觉测试通过

---

### 阶段 6：调试修复（修复阶段）⭐⭐⭐⭐⭐

**使用技能**: `debug-pro` + `debug-checklist` + `self-improving-agent`

**流程**:
```
1. 发现问题
   ↓
2. debug-pro 专业调试
   - 问题复现
   - 根因分析
   - 修复方案
   ↓
3. debug-checklist 系统化检查
   - 按清单逐项排查
   - 避免遗漏
   - 确保彻底
   ↓
4. 修复并验证
   ↓
5. self-improving-agent 记录经验
   - 记录到 ERRORS.md
   - 记录到 LEARNINGS.md
   - 更新 AGENTS.md
```

**输出物**:
- ✅ 问题根因分析报告
- ✅ 修复方案
- ✅ 验证结果
- ✅ 经验文档

**工程工具**:
```bash
# Debug 检查清单
bash scripts/debug-checklist.sh

# 记录错误
cat >> .learnings/ERRORS.md << 'EOF'
## 问题描述
## 根因分析
## 解决方案
## 预防措施
EOF
```

**质量门禁**:
- [ ] 问题根因已找到
- [ ] 修复方案已验证
- [ ] 经验已记录
- [ ] 预防措施已实施

---

### 阶段 7：质量门禁（放行阶段）⭐⭐⭐⭐⭐

**使用技能**: `agent-team-orchestration` + `proactive-agent`

**流程**:
```
1. 质量门禁检查
   ↓
2. 代码质量检查
   - 代码审查通过率
   - 测试覆盖率
   - 技术债务评估
   ↓
3. 功能完整性检查
   - 需求覆盖率
   - 功能测试通过率
   - 用户体验评估
   ↓
4. 文档完整性检查
   - 技术文档
   - 用户文档
   - 经验文档
   ↓
5. 发布决定
   - 通过 → 发布
   - 不通过 → 打回修复
```

**输出物**:
- ✅ 质量门禁报告
- ✅ 发布决定
- ✅ 发布说明
- ✅ 回滚计划

**工程工具**:
```bash
# 质量门禁检查清单
bash scripts/quality-gate-checklist.sh

# 生成发布报告
bash scripts/generate-release-report.sh
```

**质量门禁**:
- [ ] 代码审查通过率 > 90%
- [ ] 测试覆盖率 > 85%
- [ ] P0/P1 问题修复率 100%
- [ ] 文档完整
- [ ] 回滚计划就绪

---

## 🛠️ 工程工具集成调度

### 工具清单

| 工具 | 用途 | 调用时机 | 输出 |
|------|------|---------|------|
| **tree-generator.sh** | 静态分析 | 开发前/完成后 | 目录树 + 文件统计 |
| **api-validator.sh** | API 校验 | 开发前/测试时 | Mock 数据 + 格式校验 |
| **component-guide.md** | 组件化指南 | 代码审查时 | 组件拆分建议 |
| **code-review-checklist.sh** | 审查清单 | 代码审查时 | 审查报告 |
| **debug-checklist.sh** | Debug 清单 | 调试问题时 | 根因分析 |
| **quality-gate-checklist.sh** | 质量门禁 | 发布前 | 发布决定 |

### 调度逻辑

```
开发流程
    ↓
工程工具自动调用
    ↓
生成检查报告
    ↓
质量门禁决策
    ↓
通过 → 下一阶段
不通过 → 修复后重试
```

### 自动化脚本

```bash
#!/bin/bash
# 完整开发流程自动化脚本

# 阶段 1: 需求分析
echo "=== 阶段 1: 需求分析 ==="
bash scripts/requirement-analysis.sh

# 阶段 2: 架构设计
echo "=== 阶段 2: 架构设计 ==="
bash scripts/architecture-design.sh

# 阶段 3: 并行开发
echo "=== 阶段 3: 并行开发 ==="
bash scripts/parallel-development.sh

# 阶段 4: 代码审查
echo "=== 阶段 4: 代码审查 ==="
bash scripts/code-review.sh

# 阶段 5: 自动化测试
echo "=== 阶段 5: 自动化测试 ==="
bash scripts/automated-testing.sh

# 阶段 6: 调试修复
echo "=== 阶段 6: 调试修复 ==="
bash scripts/debug-fix.sh

# 阶段 7: 质量门禁
echo "=== 阶段 7: 质量门禁 ==="
bash scripts/quality-gate.sh

echo "=== 开发流程完成 ==="
```

---

## 📊 技能使用矩阵

| 开发阶段 | 主要技能 | 辅助技能 | 工程工具 | 输出物 | 质量门禁 |
|---------|---------|---------|---------|--------|---------|
| **需求分析** | proactive-agent<br>requirement-analysis-system | agent-team-orchestration | requirement-template.md | 需求分析报告<br>任务清单 | 需求覆盖率 100% |
| **架构设计** | agent-team-orchestration<br>frontend-design | - | api-validator.sh<br>component-guide.md | 架构文档<br>UI 设计稿 | 架构评审通过 |
| **并行开发** | multi-team-coding<br>frontend-design | skill-discovery | tree-generator.sh<br>api-validator.sh | 功能代码<br>UI 组件 | 代码规范符合 |
| **代码审查** | quack-code-review<br>code-review-assistant | agent-team-orchestration | code-review-checklist.sh | 审查报告<br>问题清单 | 审查通过率>90% |
| **自动化测试** | test-runner<br>multi-team-coding | - | playwright | 测试报告<br>覆盖率报告 | 测试通过率>95% |
| **调试修复** | debug-pro<br>debug-checklist | self-improving-agent | debug-checklist.sh | 根因分析<br>修复方案 | 问题已解决 |
| **质量门禁** | agent-team-orchestration<br>proactive-agent | - | quality-gate-checklist.sh | 质量报告<br>发布决定 | 所有门禁通过 |

---

## 📈 预期效果对比

### 优化前（6 个技能）
```
需求 → 开发 → 测试 → 修复 → 发布
          ↓      ↓
       问题多  反复修

一次开发成功率：45%
返工率：55%
开发周期：4 周
```

### 优化后（15 个技能）
```
需求分析 → 设计评审 → 开发 + 审查 → 自动测试 → 调试修复 → 质量门禁 → 发布
    ↓          ↓          ↓          ↓          ↓          ↓
  完整性    架构合理   代码优质   问题早发现   彻底修复   质量达标
  检查      验证       保证       早修复       不复发     放行

一次开发成功率：85-90%
返工率：10-15%
开发周期：2-3 周
```

---

## 🎯 心跳检查流程

### 早上检查（09:00）

**使用技能**: `proactive-agent`

**检查清单**:
```bash
# Git 状态
git status
git log --oneline -5

# 文件完整性
bash scripts/tree-generator.sh

# API 校验
bash scripts/api-validator.sh

# 查看错误日志
cat .learnings/ERRORS.md | tail -20

# 生成今日计划
bash scripts/generate-daily-plan.sh
```

**输出**: 今日工作计划

---

### 晚上检查（18:00）

**使用技能**: `proactive-agent` + `self-improving-agent`

**检查清单**:
```bash
# 今日完成情况
git log --since="09:00" --oneline

# 查看错误日志
cat .learnings/ERRORS.md | tail -20

# 更新经验文档
bash scripts/update-learnings.sh

# 生成进度报告
bash scripts/generate-daily-report.sh

# 规划明日工作
bash scripts/plan-tomorrow.sh
```

**输出**: 日报 + 经验更新

---

## 🚨 问题升级流程

### P0 问题（阻塞）

**响应时间**: 立即

**流程**:
```
1. 记录到 ERRORS.md
   ↓
2. 分配 debug-pro
   ↓
3. 暂停其他任务，专注修复
   ↓
4. 运行全量测试
   ↓
5. 更新经验文档
   ↓
6. 质量门禁检查
```

**升级路径**: Builder → Reviewer → Orchestrator → 用户

---

### P1 问题（严重）

**响应时间**: 24 小时

**流程**:
```
1. 记录到 ERRORS.md
   ↓
2. 分配 debug-pro
   ↓
3. 24 小时内修复
   ↓
4. 审查后合并
   ↓
5. 更新经验文档
```

**升级路径**: Builder → Reviewer

---

### P2 问题（一般）

**响应时间**: 本周内

**流程**:
```
1. 记录到 ERRORS.md
   ↓
2. 加入待办清单
   ↓
3. 本周内修复
   ↓
4. 常规审查
```

**升级路径**: Builder

---

### P3 问题（轻微）

**响应时间**: 后续完善

**流程**:
```
1. 记录到 FEATURE_REQUESTS.md
   ↓
2. 加入 backlog
   ↓
3. 有时间时修复
```

**升级路径**: 记录即可

---

## 📝 经验总结机制

### 记录时机

**使用技能**: `self-improving-agent`

**触发条件**:
- ✅ 命令/操作失败
- ✅ 用户纠正 AI
- ✅ 发现缺失功能
- ✅ API/工具失败
- ✅ 知识过时或错误
- ✅ 发现更好方法

### 记录位置

| 类型 | 文件 | 用途 |
|------|------|------|
| **错误** | .learnings/ERRORS.md | 记录失败和根因 |
| **经验** | .learnings/LEARNINGS.md | 记录最佳实践 |
| **功能请求** | .learnings/FEATURE_REQUESTS.md | 记录缺失功能 |

### 经验提升路径

```
.learnings/LEARNINGS.md（具体经验）
    ↓
AGENTS.md（开发规范）
    ↓
SKILLS_WORKFLOW.md（流程优化）
    ↓
MEMORY.md（长期记忆）
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

### 一次开发成功率
- ✅ 目标：85-90%
- ✅ 当前：45%
- ✅ 提升：100%

### 文档质量
- ✅ 经验文档及时更新
- ✅ AGENTS.md 持续完善
- ✅ 测试报告完整
- ✅ 进度报告清晰

---

## 📋 变更记录

| 时间 | 变更内容 | 变更人 | 原因 |
|------|---------|--------|------|
| 2026-03-31 14:52 | 升级到 15 技能完整流程 | AI Assistant | 提高一次开发成功率 |
| 2026-03-31 14:36 | 初始 6 技能流程 | AI Assistant | 规范技能使用 |

---

**所有参与清如项目的 AI Agent 必须遵守此流程！**

**违反流程将导致开发效率下降和代码质量问题，请严格遵守！**

**最后更新**: 2026-03-31 14:52
