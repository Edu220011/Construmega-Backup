#!/bin/bash

# Fix Nginx Image Location Matching
# Adiciona ^~ ao location /imagens/ para dar precedência sobre regex
# Execute: bash /var/www/site/fix-imagens-location.sh

echo "🔧 Corrigindo matching de location /imagens/..."

# Fazer backup
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%s)

# Adicionar ^~ para dar precedência sobre regex
sudo sed -i 's|location /imagens/|location ^~ /imagens/|g' /etc/nginx/nginx.conf

# Validar
echo "✅ Validando Nginx..."
sudo nginx -t

# Reiniciar
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# Testar
echo ""
echo "🧪 Testando imagens..."
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg 2>/dev/null | head -1
curl -I https://construmega.online/imagens/produtos/11_imagem_0.png 2>/dev/null | head -1

echo ""
echo "✅ IMAGENS DEVEM ESTAR FUNCIONANDO!"
