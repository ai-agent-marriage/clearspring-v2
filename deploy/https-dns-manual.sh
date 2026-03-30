#!/bin/bash
# HTTPS 证书 DNS 手动模式

echo "🔐 HTTPS 证书申请（DNS 手动验证）"
echo "================================"
echo ""
echo "执行以下命令申请证书："
echo ""
echo "certbot certonly --manual --preferred-challenges dns \\"
echo "  -d sf.dexoconnect.com \\"
echo "  --email davisedwad82@gmail.com \\"
echo "  --agree-tos \\"
echo "  --manual-public-ip-logging-ok"
echo ""
echo "Certbot 会显示一个 TXT 记录值，添加到你的域名 DNS 配置中"
echo "添加完成后等待 5-10 分钟，然后按回车继续验证"
