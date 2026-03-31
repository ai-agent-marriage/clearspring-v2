# 清如 ClearSpring V2.0 - 精简技能流程

**版本**: 3.0 精简版  
**生效时间**: 2026-03-31 15:08  
**核心原则**: 每个阶段 1 个技能，职责清晰，无重叠

---

## 📊 7 个技能覆盖全流程

| 阶段 | 技能 | 评分 | 职责 |
|------|------|------|------|
| **1. 需求分析** | proactive-agent | 3.1.0 | 主动分析需求完整性 |
| **2. 设计评审** | agent-team-orchestration | 1.0.0 | 任务分解和分配 |
| **3. 并行开发** | multi-team-coding | 1.0.0 | 多团队并行开发 |
| **4. 代码审查** | quack-code-review | 3.698 | 快速代码审查 |
| **5. 自动化测试** | test-runner | 3.668 | 自动化测试运行 |
| **6. 调试修复** | debug-pro | 3.707 | 专业调试工具 |
| **7. 经验总结** | self-improving-agent | 3.0.10 | 经验记录和改进 |

---

## 🔄 开发流程

```
1. 需求分析
   └─ proactive-agent 主动分析需求
      ↓
2. 设计评审
   └─ agent-team-orchestration 分解任务、分配 Agent
      ↓
3. 并行开发
   └─ multi-team-coding 创建 worktree、并行开发
      ↓
4. 代码审查
   └─ quack-code-review 快速审查代码
      ↓
5. 自动化测试
   └─ test-runner 运行测试
      ↓
6. 调试修复
   └─ debug-pro 根因分析和修复
      ↓
7. 经验总结
   └─ self-improving-agent 记录经验
      ↓
   ✅ 完成
```

---

## ✅ 移除的技能（8 个）

**原则**: 功能重叠、非必需、用脚本替代

| 移除技能 | 原因 | 替代方案 |
|---------|------|---------|
| frontend-design | UI 设计不是核心流程 | 手动设计 |
| skill-discovery | 技能发现非开发必需 | 需要时搜索 |
| code-review-assistant | 与 quack-code-review 重叠 | quack-code-review |
| systematic-debugging | 与 debug-pro 重叠 | debug-pro |
| requirement-analysis-system | 与 proactive-agent 重叠 | proactive-agent |
| api-contract-validator | 用脚本替代 | api-validator.sh |
| unit-test-generator | 用 test-runner 替代 | test-runner |
| coverage-analyzer | 用 test-runner 覆盖 | test-runner |

---

## 📋 各阶段详细说明

### 阶段 1：需求分析
**技能**: proactive-agent

**职责**:
- 主动分析需求完整性
- 识别依赖关系
- 风险评估
- 生成需求检查清单

**输出**:
- 需求分析报告
- 风险清单

---

### 阶段 2：设计评审
**技能**: agent-team-orchestration

**职责**:
- 任务分解为子任务
- 定义 Agent 角色（Builder/Reviewer）
- 分配负责人
- 设计数据结构

**输出**:
- 任务分解清单
- Agent 分配方案

---

### 阶段 3：并行开发
**技能**: multi-team-coding

**职责**:
- 创建独立 worktree
- 分配任务给各 Agent
- 并行开发
- 自动合并和冲突检测

**输出**:
- 功能代码（多个分支）
- 合并结果

---

### 阶段 4：代码审查
**技能**: quack-code-review

**职责**:
- 快速代码审查
- 代码风格检查
- 潜在问题识别
- 安全漏洞扫描

**输出**:
- 审查报告
- 问题清单
- 修复建议

---

### 阶段 5：自动化测试
**技能**: test-runner

**职责**:
- 运行自动化测试
- E2E 测试
- API 测试
- 生成测试报告

**输出**:
- 测试执行报告
- 测试覆盖率

---

### 阶段 6：调试修复
**技能**: debug-pro

**职责**:
- 问题复现
- 根因分析
- 修复建议
- 验证修复

**输出**:
- 根因分析报告
- 修复方案
- 验证结果

---

### 阶段 7：经验总结
**技能**: self-improving-agent

**职责**:
- 记录错误到 ERRORS.md
- 记录经验到 LEARNINGS.md
- 更新 AGENTS.md
- 持续改进

**输出**:
- 经验文档
- 规范更新

---

## 🎯 预期效果

### 精简前（15 个技能）
- 技能数量：15 个
- 流程复杂度：高
- 管理成本：高
- 一次开发成功率：85-90%

### 精简后（7 个技能）
- 技能数量：**7 个**（-53%）
- 流程复杂度：**低**
- 管理成本：**低**
- 一次开发成功率：**85-90%**（保持不变）

**结论**: 减少 53% 的技能，保持相同的效果！

---

## 📝 工程工具（保持不变）

**6 个脚本工具**（不是技能，但必需）:

1. tree-generator.sh - 静态分析
2. api-validator.sh - API 校验
3. component-guide.md - 组件化指南
4. code-review-checklist.sh - 审查清单
5. debug-checklist.sh - Debug 清单
6. quality-gate-checklist.sh - 质量门禁

---

## 🚀 立即执行

### 今日
1. ✅ 更新 SKILLS_WORKFLOW.md 为精简版
2. ✅ 移除不需要的技能（可选）
3. ⏳ 测试精简流程

### 本周
1. ⏳ 选择登录页面功能试点
2. ⏳ 收集反馈
3. ⏳ 优化流程

---

**精简版流程：7 个技能，覆盖全流程，职责清晰，无重叠！** 🎯

**最后更新**: 2026-03-31 15:08
