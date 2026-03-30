#!/bin/bash
# 清如 ClearSpring - 后端服务启动脚本

echo "🚀 清如 ClearSpring 后端服务启动"
echo "================================"

# 1. 检查 Node.js
echo "1️⃣ 检查 Node.js 版本..."
node -v
npm -v

# 2. 安装依赖
echo ""
echo "2️⃣ 安装依赖..."
cd /root/.openclaw/workspace/projects/clearspring-v2/api
npm install

# 3. 配置检查
echo ""
echo "3️⃣ 配置检查..."
if [ ! -f .env ]; then
  echo "⚠️  未找到 .env 文件，创建默认配置..."
  cp .env.example .env
  echo "请编辑 .env 文件配置以下参数："
  echo "  - WECHAT_SECRET (微信小程序 Secret)"
  echo "  - VOLCANE_ACCESS_KEY (火山云 AccessKey)"
  echo "  - VOLCANE_SECRET_KEY (火山云 SecretKey)"
  exit 1
fi

# 4. 初始化数据库
echo ""
echo "4️⃣ 初始化数据库..."
node database/init.js

# 5. 启动服务
echo ""
echo "5️⃣ 启动服务..."
npm start

echo ""
echo "✅ 服务启动完成！"
echo "访问地址：http://101.96.192.63:3000"
echo "健康检查：http://101.96.192.63:3000/health"
