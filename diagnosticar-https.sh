#!/bin/bash

# Diagnóstico de HTTPS na VPS
# Execute na VPS com: bash /var/www/site/diagnosticar-https.sh

echo "=========================================="
echo "🔍 DIAGNÓSTICO HTTPS - CONSTRUMEGA"
echo "=========================================="

echo -e "\n1️⃣  Nginx rodando?"
sudo systemctl status nginx | grep Active

echo -e "\n2️⃣  Ouvindo na porta 443?"
sudo netstat -tlnp | grep 443 || echo "⚠️  Porta 443 não está aberta"

echo -e "\n3️⃣  Ouvindo na porta 80?"
sudo netstat -tlnp | grep 80 || echo "⚠️  Porta 80 não está aberta"

echo -e "\n4️⃣  Certificado SSL existe?"
ls -la /etc/letsencrypt/live/construmega.online/ 2>/dev/null || echo "❌ Certificado não encontrado"

echo -e "\n5️⃣  Testando HTTP (porta 80):"
curl -I http://localhost/ 2>/dev/null | head -1

echo -e "\n6️⃣  Testando HTTPS (porta 443) localmente:"
curl -I --insecure https://localhost/ 2>/dev/null | head -1 || echo "❌ HTTPS localmente falhou"

echo -e "\n7️⃣  Testando API via HTTP:"
curl -I http://localhost/api/produtos 2>/dev/null | head -1

echo -e "\n8️⃣  Configuração Nginx valida?"
sudo nginx -t

echo -e "\n9️⃣  Nginx logs de erro (últimas 10 linhas):"
sudo tail -10 /var/log/nginx/error.log

echo -e "\n🔟 Backend respondendo?"
curl -I http://localhost:3000/api/produtos 2>/dev/null | head -1

echo -e "\n=========================================="
echo "ℹ️  Se HTTPS não funcionar:"
echo "   - Verificar firewall: sudo ufw status"
echo "   - Verificar certificado: sudo certbot certificates"
echo "   - Renovar certificado: sudo certbot renew"
echo "=========================================="
