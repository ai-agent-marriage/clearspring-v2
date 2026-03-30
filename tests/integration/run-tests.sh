#!/bin/bash

# 清如 ClearSpring V2 - 管理端 API 测试运行脚本

echo "╔════════════════════════════════════════════════════╗"
echo "║   清如 ClearSpring V2 - 管理端 API 测试              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# 检查是否配置了 API 地址
if [ -z "$API_BASE_URL" ]; then
  export API_BASE_URL="http://localhost:3000"
  echo "ℹ️  使用默认 API 地址：$API_BASE_URL"
fi

# 检查是否配置了管理员 Token
if [ -z "$ADMIN_TOKEN" ]; then
  echo "⚠️  警告：未设置 ADMIN_TOKEN 环境变量"
  echo "   部分测试可能需要管理员权限"
  echo ""
  echo "   设置方式："
  echo "   export ADMIN_TOKEN=\"your_admin_token_here\""
  echo ""
fi

echo "📍 API 地址：$API_BASE_URL"
echo "🔑 Token: ${ADMIN_TOKEN:-未配置}"
echo ""

# 运行测试
echo "🚀 开始运行测试..."
echo ""

node tests/integration/admin-api.test.js

# 捕获测试结果
TEST_RESULT=$?

echo ""
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ 所有测试通过！"
else
  echo "❌ 部分测试失败，请查看上面的错误信息"
fi

echo ""
echo "📄 测试报告已生成在控制台输出中"
echo ""

exit $TEST_RESULT
