# 清如 ClearSpring - 部署指南

## 📋 部署步骤

### 方式 1：手动部署（推荐）

**步骤 1**: SSH 登录服务器
```bash
ssh root@101.96.192.63
```

**步骤 2**: 进入项目目录
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2/api
```

**步骤 3**: 安装依赖
```bash
npm install
```

**步骤 4**: 配置环境变量
```bash
cp .env.example .env
nano .env  # 编辑配置
```

**必填配置**：
- `WECHAT_SECRET` - 微信小程序 Secret
- `VOLCANE_ACCESS_KEY` - 火山云 AccessKey
- `VOLCANE_SECRET_KEY` - 火山云 SecretKey

**步骤 5**: 初始化数据库
```bash
node database/init.js
```

**步骤 6**: 启动服务
```bash
npm start
```

或使用 PM2（生产环境推荐）：
```bash
pm2 start server.js --name clearspring-api
pm2 save
pm2 startup
```

---

### 方式 2：使用部署脚本

**本地执行**：
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
bash deploy/start-server.sh
```

---

## 🔍 验证部署

**健康检查**：
```bash
curl http://101.96.192.63:3000/health
```

**运行测试**：
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
export ADMIN_TOKEN="your_admin_token"
node tests/api-test.js
```

---

## 📊 服务状态

**查看 PM2 进程**：
```bash
pm2 list
pm2 logs clearspring-api
```

**重启服务**：
```bash
pm2 restart clearspring-api
```

**停止服务**：
```bash
pm2 stop clearspring-api
```

---

## 🔧 常见问题

### 1. 端口被占用
```bash
# 检查端口占用
lsof -i :3000
# 杀死占用进程
kill -9 <PID>
```

### 2. MongoDB 连接失败
```bash
# 检查 MongoDB 状态
systemctl status mongod
# 启动 MongoDB
systemctl start mongod
```

### 3. 防火墙问题
```bash
# 开放 3000 端口
ufw allow 3000
# 或 iptables
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

---

## 📝 部署检查清单

- [ ] Node.js 已安装（v22.22.0）
- [ ] MongoDB 已安装并运行
- [ ] Redis 已安装并运行（可选，用于分布式锁）
- [ ] .env 配置文件完整
- [ ] 数据库初始化成功
- [ ] 服务启动成功
- [ ] 健康检查通过
- [ ] 防火墙 3000 端口开放
- [ ] PM2 进程监控配置（生产环境）

---

**部署完成后，重新运行联调测试**：
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
node tests/api-test.js
```
