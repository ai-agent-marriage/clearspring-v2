#!/bin/bash

# 清如 ClearSpring 设计问题快速修复脚本
# 用途：自动修复 P0 级设计问题
# 执行时间：2026-03-31

set -e

echo "🔧 清如 ClearSpring 设计问题快速修复脚本"
echo "=========================================="
echo ""

# 定义颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/root/.openclaw/workspace/projects/clearspring-v2"

echo "📁 项目根目录：$PROJECT_ROOT"
echo ""

# 备份原文件
backup_file() {
    local file=$1
    local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$file" "$backup"
    echo -e "${YELLOW}✓ 已备份原文件:${NC} $backup"
}

# 修复问题 #1: order-hall 页面按钮热区不足
fix_order_hall_button() {
    local file="$PROJECT_ROOT/miniprogram/pages/executor/order-hall/order-hall.wxss"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ 文件不存在：$file${NC}"
        return 1
    fi
    
    echo "🔴 修复问题 #1: order-hall 页面按钮热区不足"
    echo "   文件：$file"
    
    # 备份原文件
    backup_file "$file"
    
    # 使用 sed 替换
    # 将 min-height: 72rpx 替换为 min-height: 88rpx
    # 将 border-radius: 36rpx 替换为 border-radius: 44rpx
    sed -i.bak 's/min-height: 72rpx/min-height: 88rpx/g' "$file"
    sed -i.bak 's/border-radius: 36rpx/border-radius: 44rpx/g' "$file"
    
    # 检查是否已包含 min-width，如果没有则添加
    if ! grep -q "min-width: 88rpx" "$file"; then
        # 在 .grab-btn 定义中添加 min-width
        sed -i.bak '/\.grab-btn {/a\  min-width: 88rpx;' "$file"
    fi
    
    # 清理备份文件
    rm -f "${file}.bak"
    
    echo -e "${GREEN}✓ 修复完成${NC}"
    echo ""
    echo "   修改内容:"
    echo "   - min-height: 72rpx → 88rpx"
    echo "   - border-radius: 36rpx → 44rpx"
    echo "   - 新增 min-width: 88rpx"
    echo ""
}

# 验证修复结果
verify_fix() {
    local file="$PROJECT_ROOT/miniprogram/pages/executor/order-hall/order-hall.wxss"
    
    echo "🔍 验证修复结果..."
    echo ""
    
    # 检查 min-height
    if grep -q "min-height: 88rpx" "$file"; then
        echo -e "${GREEN}✓ min-height: 88rpx${NC}"
    else
        echo -e "${RED}✗ min-height 未达到 88rpx${NC}"
        return 1
    fi
    
    # 检查 min-width
    if grep -q "min-width: 88rpx" "$file"; then
        echo -e "${GREEN}✓ min-width: 88rpx${NC}"
    else
        echo -e "${YELLOW}⚠ min-width 未设置（建议添加）${NC}"
    fi
    
    # 检查 border-radius
    if grep -q "border-radius: 44rpx" "$file"; then
        echo -e "${GREEN}✓ border-radius: 44rpx${NC}"
    else
        echo -e "${YELLOW}⚠ border-radius 未更新${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ 验证通过！${NC}"
    echo ""
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --fix-all     修复所有 P0 问题"
    echo "  --fix-1       仅修复问题 #1 (order-hall 按钮热区)"
    echo "  --verify      仅验证修复结果"
    echo "  --help        显示帮助信息"
    echo ""
}

# 主流程
main() {
    case "${1:---fix-all}" in
        --fix-all)
            echo "🚀 开始修复所有 P0 问题..."
            echo ""
            fix_order_hall_button
            verify_fix
            ;;
        --fix-1)
            echo "🚀 开始修复问题 #1..."
            echo ""
            fix_order_hall_button
            verify_fix
            ;;
        --verify)
            verify_fix
            ;;
        --help)
            show_usage
            ;;
        *)
            echo -e "${RED}✗ 未知选项：$1${NC}"
            show_usage
            exit 1
            ;;
    esac
    
    echo "=========================================="
    echo "💡 下一步操作:"
    echo "   1. 在微信开发者工具中预览效果"
    echo "   2. 测试按钮点击区域是否达标"
    echo "   3. 提交代码到版本管理"
    echo ""
}

# 执行主流程
main "$@"
