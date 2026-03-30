#!/bin/bash
# 清如 ClearSpring - 快速启动脚本

echo "🚀 清如 ClearSpring 后端服务启动"
echo "================================"

cd /root/.openclaw/workspace/projects/clearspring-v2/api

# 1. 检查 PM2
echo "1️⃣ 检查 PM2 状态..."
pm2 list | grep clearspring || echo "未找到 clearspring-api 进程"

# 2. 停止旧进程（如果有）
echo ""
echo "2️⃣ 停止旧进程..."
pm2 delete clearspring-api 2>/dev/null || true

# 3. 启动服务
echo ""
echo "3️⃣ 启动服务..."
pm2 start server.js --name clearspring-api --watch

# 4. 保存 PM2 配置
echo ""
echo "4️⃣ 保存 PM2 配置..."
pm2 save

# 5. 等待启动
echo ""
echo "5️⃣ 等待服务启动..."
sleep 3

# 6. 检查状态
echo ""
echo "6️⃣ 检查服务状态..."
pm2 status

# 7. 健康检查
echo ""
echo "7️⃣ 健康检查..."
sleep 2
curl -v http://127.0.0.1:3000/health

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📊 查看日志：pm2 logs clearspring-api"
echo "🔍 健康检查：curl http://127.0.0.1:3000/health"
echo "🌐 外部访问：http://101.96.192.63:3000/health"
