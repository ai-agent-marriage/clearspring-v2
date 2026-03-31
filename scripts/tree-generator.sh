#!/bin/bash
# 清如 ClearSpring V2.0 - 项目目录树生成器
# 用途：生成项目目录结构，帮助 AI 理解全局文件路径

echo "📁 清如 ClearSpring V2.0 - 项目目录树"
echo "======================================"
echo ""

# 生成目录树（排除 node_modules 和.git）
echo "项目结构:"
find . -maxdepth 3 -type d \( -name 'node_modules' -o -name '.git' \) -prune -o -print | \
  sed -e 's/[^-][^\/]*\//  │   /g' \
      -e 's/│   \([^│]\)/  └── \1/' \
      -e 's/│/  │/' \
      -e 's/└──/  └──/'

echo ""
echo "📄 页面文件统计:"
echo "---------------"
echo "WXML 文件：$(find pages -name "*.wxml" 2>/dev/null | wc -l)"
echo "WXSS 文件：$(find pages -name "*.wxss" 2>/dev/null | wc -l)"
echo "JS 文件：$(find pages -name "*.js" 2>/dev/null | wc -l)"
echo "JSON 文件：$(find pages -name "*.json" 2>/dev/null | wc -l)"

echo ""
echo "📦 云函数统计:"
echo "-------------"
ls -1 cloudfunctions/ 2>/dev/null | while read func; do
  echo "  ✓ $func"
done

echo ""
echo "🔗 路由注册检查:"
echo "--------------"
if [ -f "app.json" ]; then
  echo "app.json 中注册的页面:"
  cat app.json | grep -A 20 '"pages"' | grep '"' | sed 's/.*"\(.*\)".*/  ✓ \1/'
else
  echo "  ❌ app.json 不存在"
fi

echo ""
echo "⚠️  缺失文件检查:"
echo "---------------"

# 检查 app.json 注册但文件不存在的页面
if [ -f "app.json" ]; then
  cat app.json | grep -A 30 '"pages"' | grep '"' | sed 's/.*"\(.*\)".*/\1/' | while read page; do
    if [ ! -f "${page}.wxml" ]; then
      echo "  ❌ 缺失：${page}.wxml"
    fi
  done
fi

echo ""
echo "生成时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================"
