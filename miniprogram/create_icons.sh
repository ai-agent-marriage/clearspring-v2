#!/bin/bash
# 创建简单的 PNG 占位图标（1x1 透明像素）

# PNG 文件头（1x1 透明像素）
PNG_DATA="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

ICONS=(
  "home.png"
  "home-active.png"
  "service.png"
  "service-active.png"
  "order.png"
  "order-active.png"
  "profile.png"
  "profile-active.png"
)

for icon in "${ICONS[@]}"; do
  echo "$PNG_DATA" | base64 -d > "static/tabbar/$icon"
  echo "Created: static/tabbar/$icon"
done

echo "Done! Created 8 placeholder icons."
