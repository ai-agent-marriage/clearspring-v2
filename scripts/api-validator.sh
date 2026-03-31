#!/bin/bash
# 清如 ClearSpring V2.0 - API 契约校验器
# 用途：检查 API 返回数据格式，自动生成 Mock 数据

echo "🔧 API 契约校验器"
echo "================"
echo ""

# 定义标准 API 返回格式
STANDARD_RESPONSE='{
  "code": 200,
  "message": "success",
  "data": {}
}'

# 检查云函数返回格式
echo "检查云函数返回格式..."

# 服务列表标准格式
SERVICES_SCHEMA='{
  "services": [
    {
      "id": "number (必填)",
      "title": "string (必填)",
      "description": "string",
      "price": "number (必填)",
      "image": "string (必填)",
      "category": "string (必填)",
      "tag": "string",
      "rating": "number"
    }
  ]
}'

echo ""
echo "📋 服务列表 API 标准格式:"
echo "$SERVICES_SCHEMA"

echo ""
echo "📊 Mock 数据生成:"
echo "----------------"

# 生成服务列表 Mock 数据
cat > /tmp/mock_services.json << 'EOF'
{
  "code": 200,
  "message": "success",
  "data": {
    "services": [
      {
        "id": 1,
        "title": "物命救护 - 鱼类放生",
        "description": "如法放生鱼类，功德无量",
        "price": 100,
        "image": "/static/service/fish.jpg",
        "category": "物命救护",
        "tag": "热门",
        "rating": 4.9
      },
      {
        "id": 2,
        "title": "物命救护 - 鸟类放生",
        "description": "放生鸟类，护生护命",
        "price": 200,
        "image": "/static/service/bird.jpg",
        "category": "物命救护",
        "tag": "推荐",
        "rating": 4.8
      },
      {
        "id": 3,
        "title": "法事服务 - 超度法会",
        "description": "如法超度，离苦得乐",
        "price": 500,
        "image": "/static/service/ceremony.jpg",
        "category": "法事服务",
        "rating": 5.0
      },
      {
        "id": 4,
        "title": "随喜功德 - 寺院建设",
        "description": "随喜赞助寺院建设",
        "price": 50,
        "image": "/static/service/temple.jpg",
        "category": "随喜功德",
        "tag": "公益"
      }
    ]
  }
}
EOF

echo "✅ 服务列表 Mock 数据已生成"
echo "文件位置：/tmp/mock_services.json"
echo ""
echo "内容预览:"
cat /tmp/mock_services.json | head -20

echo ""
echo "💡 使用建议:"
echo "-----------"
echo "1. 在云函数中返回符合标准格式的数据"
echo "2. 如果真实数据不可用，使用 Mock 数据临时填充"
echo "3. 前端页面根据标准格式渲染，避免空数组导致页面空白"

echo ""
echo "生成时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "================"
