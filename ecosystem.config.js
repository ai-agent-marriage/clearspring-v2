module.exports = {
  apps: [{
    name: 'clearspring-api',
    script: './api/server.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    watch: false,
    // 日志轮转配置 (需要安装 pm2-logrotate)
    log_rotate: true,
    // 自动重启配置
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
