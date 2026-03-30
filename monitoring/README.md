# ClearSpring 监控告警系统

本文档描述如何部署和配置 ClearSpring 生产环境的监控告警系统。

## 目录结构

```
monitoring/
├── alert-rules.yml          # Prometheus 告警规则
├── prometheus.yml           # Prometheus 配置文件
├── grafana-dashboard.json   # Grafana 仪表板配置
├── alertmanager.yml         # Alertmanager 配置（告警通知）
└── README.md                # 本文档
```

## 组件说明

### 1. PM2 进程管理

**安装 PM2 和日志轮转插件：**

```bash
# 全局安装 PM2
npm install -g pm2

# 安装日志轮转插件
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

**启动应用：**

```bash
# 在项目根目录执行
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs clearspring-api

# 保存 PM2 配置（开机自启）
pm2 save
pm2 startup
```

### 2. Node Exporter（服务器资源监控）

**安装：**

```bash
# 下载 Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz

# 解压
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*/

# 后台运行
./node_exporter &

# 或使用 systemd 管理服务
sudo useradd --no-create-home --shell /bin/false node_exporter
sudo cp node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

# 创建 systemd 服务文件
sudo nano /etc/systemd/system/node_exporter.service
```

**systemd 服务配置：**

```ini
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

**启动服务：**

```bash
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
```

### 3. Prometheus（指标收集与告警）

**安装：**

```bash
# 下载 Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz

# 解压
tar xvfz prometheus-*.tar.gz
cd prometheus-*/

# 复制配置文件
cp prometheus.yml /etc/prometheus/
cp -r monitoring/alert-rules.yml /etc/prometheus/

# 创建 systemd 服务
sudo useradd --no-create-home --shell /bin/false prometheus
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus

# 复制二进制文件
sudo cp prometheus /usr/local/bin/
sudo cp promtool /usr/local/bin/
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool
```

**启动 Prometheus：**

```bash
prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090
```

### 4. Grafana（可视化仪表板）

**安装：**

```bash
# Ubuntu/Debian
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_9.3.0_amd64.deb
sudo dpkg -i grafana_9.3.0_amd64.deb

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**导入仪表板：**

1. 访问 http://localhost:3000 (默认账号：admin/admin)
2. 进入 Dashboards → Import
3. 上传 `grafana-dashboard.json` 文件
4. 选择 Prometheus 数据源
5. 点击 Import

### 5. Alertmanager（告警通知）

**配置飞书机器人通知：**

创建 `alertmanager.yml`：

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'feishu'

receivers:
  - name: 'feishu'
    webhook_configs:
      - url: 'https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_KEY'
        send_resolved: true
```

**告警通知渠道：**

- ✅ 飞书机器人 Webhook
- ✅ 邮件通知（SMTP）
- ⚠️ 短信通知（需要第三方服务）

## 监控指标阈值

| 指标 | 警告阈值 | 严重阈值 | 持续时间 |
|------|---------|---------|---------|
| CPU 使用率 | 80% | 95% | 5 分钟 |
| 内存使用率 | 85% | 95% | 5 分钟 |
| 磁盘使用率 | 90% | 95% | 5 分钟 |
| 接口响应时间 | 1 秒 | 3 秒 | 5 分钟 |
| 接口错误率 | 1% | 5% | 5 分钟 |
| 服务宕机 | - | - | 1 分钟 |

## 验证监控

### 检查 Node Exporter

```bash
curl http://localhost:9100/metrics
```

### 检查 Prometheus

```bash
curl http://localhost:9090/api/v1/targets
```

### 检查告警规则

```bash
curl http://localhost:9090/api/v1/rules
```

### 测试告警

```bash
# 模拟 CPU 负载（安装 stress 工具）
sudo apt-get install stress
stress --cpu 4 --timeout 300s

# 观察 Prometheus 和 Alertmanager
```

## 常用命令

```bash
# PM2 操作
pm2 status
pm2 logs clearspring-api
pm2 restart clearspring-api
pm2 stop clearspring-api
pm2 delete clearspring-api

# 查看系统资源
top
htop
free -h
df -h

# 查看服务状态
systemctl status node_exporter
systemctl status prometheus
systemctl status grafana-server
```

## 故障排查

### PM2 进程异常重启

```bash
# 查看 PM2 日志
pm2 logs clearspring-api --lines 100

# 查看内存使用
pm2 show clearspring-api

# 调整内存限制
# 修改 ecosystem.config.js 中的 max_memory_restart
```

### 告警未触发

1. 检查 Prometheus 是否正常抓取数据
2. 检查告警规则语法
3. 查看 Alertmanager 日志
4. 验证 Webhook URL 是否正确

### Grafana 仪表板无数据

1. 检查 Prometheus 数据源配置
2. 验证查询语句
3. 检查时间范围设置

## 安全建议

1. 配置防火墙，仅允许内网访问监控端口
2. 启用 Grafana 认证
3. 定期备份监控配置
4. 使用 HTTPS 加密通信

## 参考链接

- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Prometheus 文档](https://prometheus.io/docs/introduction/overview/)
- [Grafana 文档](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
