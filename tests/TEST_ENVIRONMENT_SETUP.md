# 清如 ClearSpring V2.0 - 测试环境配置指南

**版本**: 2.0.0  
**生成时间**: 2026-03-30  
**适用对象**: 测试工程师、运维人员

---

## 📋 目录

1. [本地测试环境](#1-本地测试环境)
2. [CI/CD 测试环境](#2-cicd-测试环境)
3. [测试服务器配置](#3-测试服务器配置)
4. [环境变量配置](#4-环境变量配置)
5. [网络配置](#5-网络配置)
6. [监控与日志](#6-监控与日志)

---

## 1. 本地测试环境

### 1.1 系统要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核心 | 4 核心 |
| 内存 | 4GB | 8GB |
| 磁盘 | 10GB | 20GB |
| 网络 | 10Mbps | 100Mbps |

### 1.2 软件依赖

#### Node.js 环境

```bash
# 安装 Node.js (使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# 验证安装
node --version  # v22.x.x
npm --version   # 9.x.x 或更高
```

#### MongoDB 数据库

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS (使用 Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# 验证安装
mongo --version
```

#### Redis 缓存 (可选)

```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# macOS
brew install redis
brew services start redis

# 验证安装
redis-cli ping  # 应返回 PONG
```

### 1.3 项目配置

#### 克隆项目

```bash
git clone <repository-url>
cd clearspring-v2
```

#### 安装后端依赖

```bash
cd api
npm install
```

#### 安装测试依赖

```bash
cd tests
npm install
```

### 1.4 本地服务启动

#### 启动 MongoDB

```bash
# 使用系统服务
sudo systemctl start mongod

# 或手动启动
mongod --dbpath /data/db
```

#### 启动后端 API

```bash
cd api
npm start

# 或使用 PM2
pm2 start ecosystem.config.js
```

#### 验证服务

```bash
# 检查 API 服务
curl http://localhost:3000/api/health

# 检查数据库
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

---

## 2. CI/CD 测试环境

### 2.1 GitHub Actions 配置

创建 `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongo --eval 'db.runCommand({ connectionStatus: 1 })'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd api
        npm ci
        cd ../tests
        npm ci
    
    - name: Run lint
      run: |
        cd api
        npm run lint
    
    - name: Start API server
      run: |
        cd api
        npm start &
        sleep 10
    
    - name: Run tests
      run: |
        cd tests
        npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        directory: ./tests/coverage
        flags: unittests
        name: codecov-umbrella
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: tests/reports/
```

### 2.2 GitLab CI 配置

创建 `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - deploy

variables:
  MONGODB_URL: "mongodb://mongo:27017/clearspring_test"
  NODE_ENV: "test"

test:
  stage: test
  image: node:22
  services:
    - mongo:6.0
    - redis:7
  
  cache:
    paths:
      - node_modules/
      - api/node_modules/
      - tests/node_modules/
  
  before_script:
    - cd api && npm ci
    - cd ../tests && npm ci
  
  script:
    - cd api && npm run lint
    - cd api && npm start &
    - sleep 10
    - cd tests && npm run test:coverage
  
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: tests/coverage/cobertura-coverage.xml
    paths:
      - tests/coverage/
      - tests/reports/
    expire_in: 1 week
  
  coverage: '/All files\s*\|\s*([\d\.]+)/'
```

### 2.3 Jenkins 配置

创建 `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 22'
    }
    
    environment {
        MONGODB_URL = 'mongodb://localhost:27017/clearspring_test'
        NODE_ENV = 'test'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'cd api && npm ci'
                sh 'cd tests && npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'cd api && npm run lint'
            }
        }
        
        stage('Start Services') {
            steps {
                sh 'sudo systemctl start mongod'
                sh 'sudo systemctl start redis'
                sh 'cd api && npm start &'
                sh 'sleep 10'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'cd tests && npm run test:coverage'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'tests/coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
            
            junit 'tests/reports/*.xml'
        }
    }
}
```

---

## 3. 测试服务器配置

### 3.1 服务器规格

| 配置项 | 开发环境 | 测试环境 | 生产环境 |
|--------|----------|----------|----------|
| CPU | 2 核心 | 4 核心 | 8 核心 |
| 内存 | 4GB | 8GB | 16GB |
| 磁盘 | 50GB SSD | 100GB SSD | 200GB SSD |
| 网络 | 10Mbps | 100Mbps | 1Gbps |

### 3.2 服务器初始化

#### Ubuntu 服务器初始化

```bash
# 更新系统
sudo apt-get update
sudo apt-get upgrade -y

# 安装必要工具
sudo apt-get install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    net-tools

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装 Redis
sudo apt-get install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# 安装 PM2
sudo npm install -g pm2
```

### 3.3 防火墙配置

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 API 端口
sudo ufw allow 3000/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 3.4 Nginx 反向代理配置

创建 `/etc/nginx/sites-available/clearspring-test`:

```nginx
server {
    listen 80;
    server_name test.clearspring.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件
    location /static {
        alias /var/www/clearspring/static;
        expires 30d;
    }
    
    # 日志
    access_log /var/log/nginx/clearspring-test.access.log;
    error_log /var/log/nginx/clearspring-test.error.log;
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/clearspring-test /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4. 环境变量配置

### 4.1 环境变量文件

创建 `.env` 文件：

```bash
# 服务器配置
NODE_ENV=test
PORT=3000
HOST=0.0.0.0

# 数据库配置
MONGODB_URL=mongodb://localhost:27017/clearspring_test
MONGODB_USER=test_user
MONGODB_PASSWORD=test_password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=test_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# API 配置
API_URL=http://localhost:3000
API_VERSION=v1

# 微信配置 (测试用)
WECHAT_APP_ID=test_app_id
WECHAT_APP_SECRET=test_app_secret

# 文件上传配置
MAX_UPLOAD_SIZE=10485760
UPLOAD_PATH=./uploads

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 测试配置
TEST_TIMEOUT=15000
TEST_COVERAGE_THRESHOLD=80
```

### 4.2 环境变量加载

在应用启动时加载：

```javascript
// config/index.js
require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodb: {
    url: process.env.MONGODB_URL,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  }
  // ... 其他配置
};
```

### 4.3 不同环境的配置

#### 开发环境 (.env.development)

```bash
NODE_ENV=development
PORT=3000
MONGODB_URL=mongodb://localhost:27017/clearspring_dev
LOG_LEVEL=debug
```

#### 测试环境 (.env.test)

```bash
NODE_ENV=test
PORT=3001
MONGODB_URL=mongodb://localhost:27017/clearspring_test
LOG_LEVEL=info
TEST_TIMEOUT=15000
```

#### 生产环境 (.env.production)

```bash
NODE_ENV=production
PORT=3000
MONGODB_URL=mongodb://prod-server:27017/clearspring
LOG_LEVEL=warn
JWT_SECRET=production_secret_key
```

---

## 5. 网络配置

### 5.1 端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| API 服务 | 3000 | 后端 API |
| MongoDB | 27017 | 数据库 |
| Redis | 6379 | 缓存 |
| Nginx | 80/443 | 反向代理 |
| SSH | 22 | 远程登录 |

### 5.2 网络隔离

#### 开发网络

```
开发环境 (192.168.1.0/24)
├── 开发服务器 (192.168.1.10)
├── 测试数据库 (192.168.1.11)
└── 测试缓存 (192.168.1.12)
```

#### 测试网络

```
测试环境 (192.168.2.0/24)
├── 测试服务器 (192.168.2.10)
├── 测试数据库 (192.168.2.11)
└── 测试缓存 (192.168.2.12)
```

### 5.3 DNS 配置

添加本地 DNS 解析：

```bash
# /etc/hosts
127.0.0.1       localhost
192.168.1.10    test.clearspring.com
192.168.1.11    test-db.clearspring.com
192.168.1.12    test-redis.clearspring.com
```

---

## 6. 监控与日志

### 6.1 日志配置

#### 日志目录结构

```
logs/
├── app.log          # 应用日志
├── error.log        # 错误日志
├── access.log       # 访问日志
└── test/
    ├── test-run.log      # 测试运行日志
    └── test-report.log   # 测试报告日志
```

#### 日志轮转配置

创建 `/etc/logrotate.d/clearspring`:

```
/var/log/clearspring/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### 6.2 监控配置

#### PM2 监控

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 监控资源
pm2 monit
```

#### 系统监控

```bash
# 安装监控工具
sudo apt-get install -y htop iotop nethogs

# 查看 CPU
htop

# 查看 IO
iotop

# 查看网络
nethogs
```

### 6.3 告警配置

创建监控脚本 `scripts/health-check.sh`:

```bash
#!/bin/bash

# 检查 API 服务
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$API_STATUS" != "200" ]; then
    echo "❌ API 服务异常: $API_STATUS"
    # 发送告警
    # curl -X POST "https://alert.example.com/webhook" -d "API 服务异常"
fi

# 检查 MongoDB
MONGO_STATUS=$(mongo --eval "db.runCommand({ ping: 1 })" 2>&1 | grep -c "ok")
if [ "$MONGO_STATUS" -eq 0 ]; then
    echo "❌ MongoDB 异常"
fi

# 检查 Redis
REDIS_STATUS=$(redis-cli ping 2>&1 | grep -c "PONG")
if [ "$REDIS_STATUS" -eq 0 ]; then
    echo "❌ Redis 异常"
fi

# 检查磁盘空间
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "⚠️ 磁盘空间不足：${DISK_USAGE}%"
fi

# 检查内存
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "⚠️ 内存不足：${MEMORY_USAGE}%"
fi
```

设置定时检查：

```bash
# 添加到 crontab
crontab -e

# 每 5 分钟检查一次
*/5 * * * * /var/www/clearspring/scripts/health-check.sh >> /var/log/clearspring/health-check.log 2>&1
```

---

## 附录

### A. 环境检查清单

- [ ] Node.js 已安装
- [ ] MongoDB 已安装并运行
- [ ] Redis 已安装并运行 (可选)
- [ ] 项目依赖已安装
- [ ] 环境变量已配置
- [ ] 数据库已初始化
- [ ] 测试数据已准备
- [ ] 防火墙已配置
- [ ] 日志目录已创建
- [ ] 监控脚本已部署

### B. 常用命令速查

```bash
# 启动服务
sudo systemctl start mongod
sudo systemctl start redis
cd api && npm start

# 停止服务
sudo systemctl stop mongod
sudo systemctl stop redis
pm2 stop all

# 查看状态
sudo systemctl status mongod
sudo systemctl status redis
pm2 status

# 查看日志
tail -f logs/app.log
pm2 logs

# 重启服务
sudo systemctl restart mongod
pm2 restart all
```

### C. 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| API 无法启动 | 端口被占用 | `lsof -i :3000` 查看并关闭占用进程 |
| 数据库连接失败 | MongoDB 未启动 | `sudo systemctl start mongod` |
| 测试超时 | 网络慢或数据多 | 增加超时时间或优化查询 |
| 内存不足 | 数据量过大 | 增加服务器内存或优化代码 |

---

**文档维护**: ClearSpring 测试团队  
**最后更新**: 2026-03-30  
**版本**: V2.0.0
