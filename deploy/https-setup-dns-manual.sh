#!/bin/bash
# 清如 ClearSpring - HTTPS 证书配置（DNS 验证模式）
# 适用于无法通过 HTTP 验证的场景

set -e

DOMAIN="sf.dexoconnect.com"
EMAIL="davisedwad82@gmail.com"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

echo "🚀 清如 ClearSpring HTTPS 证书配置（DNS 验证模式）"
echo "=================================================="
echo ""
echo "域名：${DOMAIN}"
echo "邮箱：${EMAIL}"
echo ""
echo "⚠️  DNS 验证模式需要手动添加 TXT 记录"
echo ""

# 1. 手动模式申请证书
echo "1️⃣ 手动模式申请证书..."
echo ""
echo "请执行以下命令："
echo ""
echo "certbot certonly --manual --preferred-challenges dns \\"
echo "  -d ${DOMAIN} \\"
echo "  --email ${EMAIL} \\"
echo "  --agree-tos \\"
echo "  --manual-public-ip-logging-ok"
echo ""
echo "Certbot 会提示你添加 TXT 记录，添加完成后按回车继续"
echo ""

# 2. 配置 Nginx（预配置）
echo "2️⃣ 预配置 Nginx HTTPS..."

cat > /etc/nginx/sites-available/clearspring << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    server_name sf.dexoconnect.com;

    # SSL 证书配置（证书申请后会自动创建）
    ssl_certificate /etc/letsencrypt/live/sf.dexoconnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sf.dexoconnect.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 反向代理到后端 API
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件（管理后台）
    location /admin {
        alias /root/.openclaw/workspace/projects/clearspring-v2/admin-pc/dist;
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name sf.dexoconnect.com;
    return 301 https://$server_name$request_uri;
}
NGINX_EOF

echo "✅ Nginx 配置已准备：/etc/nginx/sites-available/clearspring"
echo ""
echo "📋 下一步操作："
echo "1. 运行 certbot 手动模式申请证书（见上方命令）"
echo "2. 按提示添加 DNS TXT 记录"
echo "3. 验证通过后证书会自动保存"
echo "4. 运行：ln -sf /etc/nginx/sites-available/clearspring /etc/nginx/sites-enabled/"
echo "5. 运行：systemctl reload nginx"
echo ""
