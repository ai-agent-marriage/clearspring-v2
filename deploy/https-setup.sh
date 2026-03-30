#!/bin/bash
# ClearSpring HTTPS 证书配置脚本
# Phase 3 Day 1 - HTTPS 证书配置

set -e

DOMAIN="clearspring.example.com"
EMAIL="admin@clearspring.example.com"
NGINX_CONF="/etc/nginx/sites-available/clearspring"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

echo "🔐 ClearSpring HTTPS 证书配置脚本"
echo "=================================="

# 1. 检查并安装依赖
echo "[1/5] 检查依赖..."
if ! command -v certbot &> /dev/null; then
    echo "安装 Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt-get install -y nginx
fi

# 2. 创建 Nginx 配置
echo "[2/5] 配置 Nginx HTTPS..."
cat > ${NGINX_CONF} << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    server_name clearspring.example.com;

    ssl_certificate /etc/letsencrypt/live/clearspring.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clearspring.example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name clearspring.example.com;
    return 301 https://$server_name$request_uri;
}
NGINX_EOF

# 启用配置
ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/clearspring
rm -f /etc/nginx/sites-enabled/default

# 3. 申请 Let's Encrypt 证书
echo "[3/5] 申请 Let's Encrypt 证书..."
if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
    # 使用 standalone 模式申请证书
    certbot certonly --standalone -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive
else
    echo "证书已存在，跳过申请"
fi

# 4. 配置自动续期
echo "[4/5] 配置证书自动续期..."
CRON_JOB="0 2 * * * certbot renew --quiet --post-hook \"systemctl reload nginx\""
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
    echo "已添加 cron 任务：每天凌晨 2 点检查续期"
else
    echo "续期任务已存在"
fi

# 5. 重启 Nginx
echo "[5/5] 重启 Nginx..."
/usr/sbin/nginx -t
systemctl reload nginx

echo ""
echo "✅ HTTPS 配置完成!"
echo ""
echo "📋 配置信息:"
echo "  - 域名：${DOMAIN}"
echo "  - Nginx 配置：${NGINX_CONF}"
echo "  - 证书目录：${CERT_DIR}"
echo ""
echo "🔍 验证命令:"
echo "  curl -vI https://${DOMAIN}"
echo "  openssl s_client -connect ${DOMAIN}:443"
echo ""
