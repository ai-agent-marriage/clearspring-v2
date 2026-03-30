# Phase 3 Day 6-7 - PM2 监控告警配置完成报告

**完成时间**: 2026-03-30  
**负责人**: ClearSpring 开发团队  
**版本**: v1.0.0

---

## 📋 任务概述

配置服务器监控和告警系统，确保生产环境稳定运行。

---

## ✅ 完成内容

### 1. PM2 进程监控配置

**文件**: `ecosystem.config.js`

**配置详情**:
- ✅ 应用名称：`clearspring-api`
- ✅ 启动脚本：`./api/server.js`
- ✅ 进程实例：4 个 (cluster 模式)
- ✅ 内存限制：500MB (自动重启)
- ✅ 日志轮转：10MB/文件，保留 7 个
- ✅ 日志格式：`YYYY-MM-DD HH:mm:ss`
- ✅ 自动重启：启用 (最小运行时间 10 秒)

**部署命令**:
```bash
# 安装 PM2 和日志轮转插件
npm install -g pm2
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# 启动应用
pm2 start ecosystem.config.js

# 保存配置并设置开机自启
pm2 save
pm2 startup
```

---

### 2. 服务器监控配置

**工具**: Node Exporter + Prometheus + Grafana

**监控指标**:
| 指标 | 警告阈值 | 严重阈值 | 说明 |
|------|---------|---------|------|
| CPU 使用率 | 80% | 95% | 5 分钟持续 |
| 内存使用率 | 85% | 95% | 5 分钟持续 |
| 磁盘使用率 | 90% | 95% | 5 分钟持续 |
| 接口响应时间 | 1 秒 | 3 秒 | P95 延迟 |
| 接口错误率 | 1% | 5% | HTTP 5xx |
| 服务宕机 | - | - | 1 分钟无响应 |

**安装步骤**:
```bash
# Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*/
./node_exporter &

# Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz

# Grafana
wget https://dl.grafana.com/oss/release/grafana_9.3.0_amd64.deb
dpkg -i grafana_9.3.0_amd64.deb
```

---

### 3. 告警通知配置

**告警渠道**:
- ✅ 飞书机器人 Webhook
- ✅ 邮件通知 (SMTP)
- ⚠️ 短信通知 (需第三方服务)

**告警规则文件**: `monitoring/alert-rules.yml`

**告警类型**:
1. **HighCPU** - CPU 使用率过高
2. **CriticalCPU** - CPU 使用率严重过高
3. **HighMemory** - 内存使用率过高
4. **CriticalMemory** - 内存使用率严重过高
5. **HighDiskUsage** - 磁盘使用率过高
6. **CriticalDiskUsage** - 磁盘使用率严重过高
7. **ServiceDown** - 服务宕机
8. **HighResponseTime** - 接口响应时间过长
9. **HighErrorRate** - 接口错误率过高
10. **PM2FrequentRestarts** - PM2 进程频繁重启
11. **PM2HighMemory** - PM2 进程内存使用过高

**通知路由**:
- 严重告警 → 飞书关键群 + 邮件
- 警告告警 → 飞书运维群
- 服务宕机 → 飞书关键群 + 邮件 + 短信

---

### 4. Grafana 监控仪表板

**文件**: `monitoring/grafana-dashboard.json`

**仪表板面板**:
1. **CPU 使用率** - 实时趋势图 (0-100%)
2. **内存使用率** - 实时趋势图 (0-100%)
3. **磁盘使用率** - 按挂载点展示
4. **网络流量** - 接收/发送速率
5. **API 响应时间** - P95/P50 延迟
6. **API 请求量** - 按状态码分类
7. **API 错误率** - 5xx 错误百分比
8. **服务状态** - UP/DOWN 状态指示
9. **PM2 进程内存** - 各进程内存使用
10. **PM2 进程重启** - 1 小时内重启次数

**访问地址**: `http://localhost:3000`  
**默认账号**: `admin` / `admin` (首次登录需修改)

---

## 📁 文件清单

```
clearspring-v2/
├── ecosystem.config.js              # PM2 进程配置
├── logs/                            # 日志目录
│   ├── error.log
│   └── out.log
└── monitoring/
    ├── README.md                    # 部署文档
    ├── alert-rules.yml              # Prometheus 告警规则
    ├── alertmanager.yml             # Alertmanager 通知配置
    ├── grafana-dashboard.json       # Grafana 仪表板
    ├── pm2-exporter.md              # PM2 Exporter 配置指南
    └── prometheus.yml               # Prometheus 配置
```

---

## 🚀 部署流程

### 步骤 1: 安装 PM2
```bash
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 步骤 2: 启动应用
```bash
cd /path/to/clearspring-v2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 步骤 3: 安装监控组件
```bash
# Node Exporter
./monitoring/install-node-exporter.sh

# Prometheus
./monitoring/install-prometheus.sh

# Grafana
./monitoring/install-grafana.sh

# Alertmanager
./monitoring/install-alertmanager.sh
```

### 步骤 4: 配置告警通知
1. 创建飞书机器人，获取 Webhook URL
2. 编辑 `monitoring/alertmanager.yml`
3. 替换 `YOUR_WEBHOOK_KEY` 为实际值
4. 配置 SMTP 邮件服务器信息

### 步骤 5: 导入 Grafana 仪表板
1. 访问 http://localhost:3000
2. Dashboards → Import
3. 上传 `grafana-dashboard.json`
4. 选择 Prometheus 数据源

---

## ✅ 验收标准

| 验收项 | 状态 | 说明 |
|--------|------|------|
| PM2 进程监控正常 | ✅ | `pm2 status` 显示 online |
| 日志轮转配置 | ✅ | 日志文件不超过 10MB |
| 服务器监控配置 | ✅ | Node Exporter 正常运行 |
| Prometheus 抓取 | ✅ | 目标状态为 UP |
| 告警规则加载 | ✅ | 规则列表正常显示 |
| 告警通知可用 | ⚠️ | 需配置实际 Webhook 后测试 |
| Grafana 仪表板 | ⚠️ | 需安装 Grafana 后导入 |
| Git 提交成功 | ✅ | 已提交至 main 分支 |

---

## 🔧 验证命令

### PM2 验证
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs clearspring-api

# 查看详细信息
pm2 show clearspring-api

# 重启进程
pm2 restart clearspring-api
```

### 监控组件验证
```bash
# Node Exporter
curl http://localhost:9100/metrics

# Prometheus
curl http://localhost:9090/api/v1/targets
curl http://localhost:9090/api/v1/rules

# Grafana
curl http://localhost:3000/api/health
```

### 告警测试
```bash
# 模拟 CPU 负载
sudo apt-get install stress
stress --cpu 4 --timeout 300s

# 观察 Prometheus 告警
# 访问 http://localhost:9090/alerts

# 观察飞书通知
# 检查飞书群消息
```

---

## 📊 监控架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ClearSpring    │     │   Node          │     │   PM2           │
│  API Server     │     │   Exporter      │     │   Exporter      │
│  (Port 3000)    │     │   (Port 9100)   │     │   (Port 9616)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │         Metrics       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   Prometheus    │
                        │   (Port 9090)   │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
     │   Grafana       │ │ Alertmanager │ │   Alert Rules  │
     │   (Port 3000)   │ │ (Port 9093)  │ │   Evaluation   │
     └────────┬────────┘ └──────┬───────┘ └────────────────┘
              │                  │
              │         ┌────────▼────────┐
              │         │  Notification   │
              │         │  Channels       │
              │         └────────┬────────┘
              │                  │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌────────────────┐
     │  Web Browser    │ │  Feishu Bot    │ │  Email/SMS     │
     │  Dashboard      │ │  Webhook       │ │  SMTP          │
     └─────────────────┘ └────────────────┘ └────────────────┘
```

---

## 🔐 安全建议

1. **防火墙配置**
   - 仅允许内网访问监控端口 (9090, 9100, 3000)
   - 配置 Nginx 反向代理 + HTTPS

2. **认证授权**
   - 修改 Grafana 默认密码
   - 启用 Prometheus 基本认证
   - 配置 Alertmanager API 访问控制

3. **数据备份**
   - 定期备份 Prometheus 数据
   - 导出 Grafana 仪表板配置
   - 保存告警规则版本

4. **日志管理**
   - 配置日志轮转 (已配置)
   - 集中日志收集 (可选 ELK/Loki)
   - 敏感信息脱敏

---

## 📞 运维支持

### 常见问题

**Q: PM2 进程频繁重启？**  
A: 检查日志 `pm2 logs`，可能是内存超限或代码错误。调整 `max_memory_restart` 或修复代码。

**Q: 告警未触发？**  
A: 检查 Prometheus 目标状态、告警规则语法、Alertmanager 配置。

**Q: Grafana 无数据？**  
A: 检查 Prometheus 数据源配置、查询语句、时间范围。

**Q: 飞书通知未收到？**  
A: 检查 Webhook URL、机器人权限、网络连通性。

### 联系方式

- 技术支持：ops-team@clearspring.com
- 紧急联系：飞书运维群

---

## 📝 后续优化

- [ ] 配置分布式追踪 (Jaeger/Zipkin)
- [ ] 集成日志系统 (ELK/Loki)
- [ ] 添加业务指标监控 (订单量/用户数)
- [ ] 配置自动扩容 (K8s HPA)
- [ ] 建立运维值班制度
- [ ] 定期演练故障恢复

---

**报告生成时间**: 2026-03-30 14:22 GMT+8  
**Git 提交**: `fbc0bbe` feat(Phase 3): 完成 PM2 监控告警配置
