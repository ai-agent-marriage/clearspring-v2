# CI/CD Setup Guide - ClearSpring V2

本文档介绍 ClearSpring V2 项目的 GitHub Actions CI/CD 配置和部署流程。

## 📋 目录

- [概述](#概述)
- [工作流文件](#工作流文件)
- [GitHub Secrets 配置](#github-secrets-配置)
- [部署流程](#部署流程)
- [故障排查](#故障排查)

## 概述

本项目使用 GitHub Actions 实现自动化部署，包含以下环境：

| 环境 | 触发条件 | 目标服务器 |
|------|----------|------------|
| **Production** | 推送到 main 分支 | 101.96.192.63 |
| **Staging** | Pull Request | 预发布服务器 |

## 工作流文件

### 1. deploy.yml - 生产环境部署

**位置**: `.github/workflows/deploy.yml`

**功能**:
- 检出代码
- 设置 Node.js 22 环境
- 安装 API 依赖
- 运行测试
- 构建前端 (admin-pc)
- SSH 部署到服务器
- 重启 PM2 服务

**触发条件**:
```yaml
on:
  push:
    branches: [main]
```

### 2. staging.yml - 预发布环境部署

**位置**: `.github/workflows/staging.yml`

**功能**:
- 与生产环境类似的部署流程
- 部署到预发布目录
- 重启预发布服务

**触发条件**:
```yaml
on:
  pull_request:
    branches: [main]
```

### 3. notify.yml - 部署通知

**位置**: `.github/workflows/notify.yml`

**功能**:
- 监听生产部署工作流完成事件
- 发送飞书通知

**触发条件**:
```yaml
on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]
```

## GitHub Secrets 配置

在 GitHub 仓库中配置以下 Secrets：

**路径**: Repository Settings → Secrets and variables → Actions

### 必需 Secrets

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SSH_PRIVATE_KEY` | SSH 私钥（用于服务器连接） | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST` | 服务器 IP 地址 | `101.96.192.63` |
| `SERVER_USER` | 服务器用户名 | `root` |
| `FEISHU_WEBHOOK` | 飞书机器人 Webhook URL | `https://open.feishu.cn/open-apis/bot/v2/hook/...` |

### 生成 SSH 密钥

```bash
# 生成新的 SSH 密钥对
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -C "github-actions@clearspring"

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub root@101.96.192.63

# 复制私钥内容到 GitHub Secrets
cat ~/.ssh/github_actions | pbcopy  # macOS
# 或
cat ~/.ssh/github_actions | xclip -selection clipboard  # Linux
```

## 部署流程

### 生产环境部署

```mermaid
graph LR
    A[Push to main] --> B[Checkout Code]
    B --> C[Setup Node.js]
    C --> D[Install Dependencies]
    D --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Build Frontend]
    F -->|No| H[❌ Deployment Failed]
    G --> I[SSH Deploy]
    I --> J[Restart PM2]
    J --> K[Send Notification]
    K --> L[✅ Deployment Complete]
```

### 详细步骤

1. **代码检出**
   ```yaml
   - uses: actions/checkout@v3
   ```

2. **环境设置**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v3
     with:
       node-version: '22'
   ```

3. **依赖安装**
   ```bash
   cd api && npm install
   ```

4. **测试运行**
   ```bash
   cd api && npm test
   ```
   ⚠️ 测试失败将终止部署

5. **前端构建**
   ```bash
   cd admin-pc && npm run build
   ```

6. **SSH 部署**
   - 使用 `easingthemes/ssh-deploy@v3`
   - 排除 `node_modules/` 和 `.git/`
   - 部署到 `/root/.openclaw/workspace/projects/clearspring-v2`

7. **服务重启**
   ```bash
   cd /root/.openclaw/workspace/projects/clearspring-v2/api
   npm install
   pm2 restart clearspring-api
   ```

8. **通知发送**
   - 通过飞书 Webhook 发送部署完成通知

## 故障排查

### 常见问题

#### 1. 部署失败 - SSH 连接错误

**症状**: `Permission denied (publickey)`

**解决方案**:
- 验证 SSH 私钥已正确配置到 GitHub Secrets
- 确认公钥已添加到服务器的 `~/.ssh/authorized_keys`
- 检查服务器 SSH 配置允许密钥认证

#### 2. 测试失败

**症状**: `Error: Test failed`

**解决方案**:
- 查看 GitHub Actions 日志中的测试输出
- 本地运行测试：`cd api && npm test`
- 修复测试后重新推送

#### 3. PM2 重启失败

**症状**: `PM2 process not found`

**解决方案**:
- 确认 PM2 已安装：`npm install -g pm2`
- 检查进程名称：`pm2 list`
- 更新工作流中的进程名称

#### 4. 飞书通知未发送

**症状**: 部署完成但无通知

**解决方案**:
- 验证 `FEISHU_WEBHOOK` Secret 已配置
- 检查 Webhook URL 是否有效
- 确认飞书机器人已添加到目标群聊

### 查看部署日志

1. 访问 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择对应的工作流运行
4. 查看详细日志输出

### 手动触发部署

如需手动触发部署，可在工作流文件中添加：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # 添加此行
```

然后在 Actions 页面手动触发。

## 安全最佳实践

1. **SSH 密钥管理**
   - 使用专用密钥对（不要使用个人密钥）
   - 定期轮换密钥
   - 限制密钥权限（仅允许必要命令）

2. **Secret 保护**
   - 不在代码中硬编码敏感信息
   - 使用 GitHub Environments 保护生产环境
   - 启用 Secret 扫描

3. **部署权限**
   - 限制谁可以推送到 main 分支
   - 使用分支保护规则
   - 要求 Pull Request 审查

## 监控与维护

### 部署监控

- GitHub Actions 运行状态
- PM2 进程状态：`pm2 monit`
- 服务器资源使用：`htop`, `df -h`

### 日志查看

```bash
# PM2 日志
pm2 logs clearspring-api

# 系统日志
journalctl -u pm2-root

# Nginx 日志（如使用）
tail -f /var/log/nginx/access.log
```

## 更新历史

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-30 | 1.0.0 | 初始 CI/CD 配置 |

---

**文档维护**: ClearSpring 开发团队  
**最后更新**: 2026-03-30
