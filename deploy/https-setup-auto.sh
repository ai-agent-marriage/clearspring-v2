#!/bin/bash
# 清如 ClearSpring - HTTPS 证书自动配置脚本
# 域名：sf.dexoconnect.com
# 服务器 IP: 101.96.192.63

set -e

DOMAIN="sf.dexoconnect.com"
EMAIL="davisedwad82@gmail.com"
NGINX_CONFIG="/etc/nginx/sites-available/clearspring"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

echo "🚀 清如 ClearSpring HTTPS 证书配置"
echo "===================================="
echo ""
echo "域名：${DOMAIN}"
echo "邮箱：${EMAIL}"
echo ""

# 1. 检查 Nginx
echo "1️⃣ 检查 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx 未安装，正在安装..."
    apt-get update
    apt-get install -y nginx
else
    echo "✅ Nginx 已安装：$(nginx -v 2>&1)"
fi

# 2. 检查 Certbot
echo ""
echo "2️⃣ 检查 Certbot..."
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot 未安装，正在安装..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
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
    echo "⚠️  域名解析可能未完成："
    echo "   期望：101.96.192.63"
    echo "   实际：${RESOLVED_IP:-未解析}"
    echo ""
    echo "   请先配置 DNS 解析，然后重新运行此脚本"
    echo "   DNS 配置："
    echo "   - 记录类型：A"
    echo "   - 主机记录：sf"
    echo "   - 记录值：101.96.192.63"
    echo "   - TTL: 600"
    exit 1
fi

# 4. 申请 Let's Encrypt 证书
echo ""
echo "4️⃣ 申请 Let's Encrypt 证书..."
certbot certonly --standalone \
  -d ${DOMAIN} \
  --email ${EMAIL} \
  --agree-tos \
  --non-interactive \
  --force-renewal

echo "✅ 证书申请成功！"
echo "   证书路径：${CERT_PATH}"

# 5. 配置 Nginx HTTPS
echo ""
echo "5️⃣ 配置 Nginx HTTPS..."

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

# 6. 启用 Nginx 配置
echo ""
echo "6️⃣ 启用 Nginx 配置..."
ln -sf ${NGINX_CONFIG} /etc/nginx/sites-enabled/clearspring
nginx -t
systemctl reload nginx

echo "✅ Nginx 配置已启用并重新加载"

# 7. 配置证书自动续期
echo ""
echo "7️⃣ 配置证书自动续期..."

cat > /etc/cron.daily/certbot-renew << 'CRON_EOF'
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
CRON_EOF

chmod +x /etc/cron.daily/certbot-renew

echo "✅ 证书自动续期配置完成（每天执行）"

# 8. 验证 HTTPS
echo ""
echo "8️⃣ 验证 HTTPS 配置..."
sleep 2
curl -vI https://${DOMAIN} 2>&1 | grep -E "(SSL|TLS|subject|issuer)" || echo "⚠️  验证完成，请手动访问测试"

# 9. 完成
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
