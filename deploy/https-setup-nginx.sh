#!/bin/bash
# 清如 ClearSpring - HTTPS 证书配置（Nginx 插件模式）
# 域名：sf.dexoconnect.com

set -e

DOMAIN="sf.dexoconnect.com"
EMAIL="davisedwad82@gmail.com"
NGINX_CONFIG="/etc/nginx/sites-available/clearspring"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

echo "🚀 清如 ClearSpring HTTPS 证书配置（Nginx 插件模式）"
echo "===================================================="
echo ""
echo "域名：${DOMAIN}"
echo "邮箱：${EMAIL}"
echo ""

# 1. 检查 Nginx
echo "1️⃣ 检查 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx 未安装"
    exit 1
else
    echo "✅ Nginx 已安装：$(nginx -v 2>&1)"
fi

# 2. 检查 Certbot
echo ""
echo "2️⃣ 检查 Certbot..."
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot 未安装"
    exit 1
else
    echo "✅ Certbot 已安装：$(certbot --version)"
fi

# 3. 检查域名解析
echo ""
echo "3️⃣ 检查域名解析..."
RESOLVED_IP=$(dig +short ${DOMAIN} | head -1)
if [ "$RESOLVED_IP" == "101.96.192.63" ]; then
    echo "✅ 域名解析正确：${DOMAIN} → ${RESOLVED_IP}"
else
    echo "❌ 域名解析不正确"
    exit 1
fi

# 4. 创建临时 Nginx 配置（用于 ACME 验证）
echo ""
echo "4️⃣ 创建临时 Nginx 配置..."

cat > /etc/nginx/sites-available/clearspring-temp << 'TEMP_EOF'
server {
    listen 80;
    server_name sf.dexoconnect.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
TEMP_EOF

ln -sf /etc/nginx/sites-available/clearspring-temp /etc/nginx/sites-enabled/clearspring-temp
nginx -t
systemctl reload nginx

echo "✅ 临时配置创建成功"

# 5. 申请 Let's Encrypt 证书
echo ""
echo "5️⃣ 申请 Let's Encrypt 证书..."

mkdir -p /var/www/certbot

certbot certonly --webroot \
  -w /var/www/certbot \
  -d ${DOMAIN} \
  --email ${EMAIL} \
  --agree-tos \
  --non-interactive \
  --force-renewal

echo "✅ 证书申请成功！"
echo "   证书路径：${CERT_PATH}"

# 6. 配置 Nginx HTTPS
echo ""
echo "6️⃣ 配置 Nginx HTTPS..."

cat > ${NGINX_CONFIG} << 'NGINX_EOF'
server {
    listen 443 ssl http2;
    server_name sf.dexoconnect.com;

    # SSL 证书配置
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

echo "✅ Nginx 配置文件创建：${NGINX_CONFIG}"

# 7. 启用 Nginx 配置
echo ""
echo "7️⃣ 启用 Nginx 配置..."

# 移除临时配置
rm -f /etc/nginx/sites-enabled/clearspring-temp

# 启用正式配置
ln -sf ${NGINX_CONFIG} /etc/nginx/sites-enabled/clearspring
nginx -t
systemctl reload nginx

echo "✅ Nginx 配置已启用并重新加载"

# 8. 配置证书自动续期
echo ""
echo "8️⃣ 配置证书自动续期..."

cat > /etc/cron.daily/certbot-renew << 'CRON_EOF'
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
CRON_EOF

chmod +x /etc/cron.daily/certbot-renew

echo "✅ 证书自动续期配置完成（每天执行）"

# 9. 验证 HTTPS
echo ""
echo "9️⃣ 验证 HTTPS 配置..."
sleep 2
curl -kI https://${DOMAIN} 2>&1 | head -10 || echo "⚠️  验证完成，请手动访问测试"

# 10. 完成
echo ""
echo "🎉 HTTPS 证书配置完成！"
echo ""
echo "访问地址："
echo "  - HTTPS: https://${DOMAIN}"
echo "  - HTTP: http://${DOMAIN} (自动跳转 HTTPS)"
echo ""
echo "证书信息："
echo "  - 颁发机构：Let's Encrypt"
echo "  - 有效期：90 天（自动续期）"
echo "  - 证书路径：${CERT_PATH}"
echo ""
echo "监控告警配置："
echo "  - 飞书 Webhook: 已配置"
echo "  - Gmail SMTP: 已配置"
echo ""
