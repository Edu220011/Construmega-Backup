#!/bin/bash

echo "=== CORRIGINDO NGINX PARA SERVIR /configuracoes ==="
echo ""

# Backup da configuração atual
echo "1. Fazendo backup do nginx.conf..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%s)

# Adicionar /configuracoes à lista de rotas proxiadas
echo "2. Atualizando configuração do Nginx..."
sudo sed -i 's/location ~ \^\/(login|usuarios|produtos|pedidos|resgates|pagamento|chave)/location ~ ^\/\(login|usuarios|produtos|pedidos|resgates|pagamento|chave|configuracoes\)/g' /etc/nginx/nginx.conf

# Testar configuração
echo "3. Testando configuração do Nginx..."
sudo nginx -t

# Recarregar Nginx
echo "4. Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "5. Testando endpoint /configuracoes..."
sleep 2
curl -s https://construmega.online/configuracoes | jq . 2>/dev/null || echo "Retornou HTML - aguarde mais um momento"

echo ""
echo "✓ Correção aplicada!"
echo "A rota /configuracoes deve agora retornar JSON corretamente."
