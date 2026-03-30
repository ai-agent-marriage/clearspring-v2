# PM2 Prometheus Exporter 配置

## 安装

```bash
# 安装 pm2-prometheus-exporter
npm install -g pm2-prometheus-exporter

# 或使用 PM2 模块方式
pm2 install pm2-prometheus-exporter
```

## 配置

创建 `pm2-exporter-config.yml`：

```yaml
port: 9616
host: '0.0.0.0'
metrics:
  - namespace: 'pm2'
    metrics:
      - name: 'process_cpu'
        type: 'gauge'
        help: 'PM2 process CPU usage'
      - name: 'process_memory_bytes'
        type: 'gauge'
        help: 'PM2 process memory usage in bytes'
      - name: 'process_restarts'
        type: 'counter'
        help: 'PM2 process restart count'
      - name: 'process_status'
        type: 'gauge'
        help: 'PM2 process status (1=online, 0=offline)'
```

## 启动 Exporter

```bash
# 方式 1：直接运行
pm2-exporter

# 方式 2：使用 PM2 管理
pm2 start pm2-exporter --name pm2-exporter

# 验证
curl http://localhost:9616/metrics
```

## Prometheus 配置

在 `prometheus.yml` 中添加：

```yaml
scrape_configs:
  - job_name: 'pm2'
    static_configs:
      - targets: ['localhost:9616']
```

## 监控指标

Exporter 提供以下指标：

- `pm2_process_cpu` - CPU 使用率
- `pm2_process_memory_bytes` - 内存使用
- `pm2_process_restarts` - 重启次数
- `pm2_process_status` - 进程状态
- `pm2_process_uptime` - 运行时间
- `pm2_process_pid` - 进程 ID

## Grafana 查询示例

```promql
# CPU 使用率
pm2_process_cpu{app="clearspring-api"}

# 内存使用
pm2_process_memory_bytes{app="clearspring-api"}

# 进程状态
pm2_process_status{app="clearspring-api"}

# 重启次数（过去 1 小时）
increase(pm2_process_restarts{app="clearspring-api"}[1h])
```
