#!/bin/bash

echo "=== CORRIGINDO NGINX PARA ROTA /configuracoes ==="
echo ""

# 1. Backup
echo "1. Fazendo backup do nginx.conf..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%s)

# 2. Editar o arquivo - adicionar /configuracoes à regex de rotas
echo "2. Atualizando Nginx..."

# Usar awk para encontrar e modificar a linha específica
sudo awk '
/location ~ \^\/\(login\|usuarios\|produtos\|pedidos\|resgates\|pagamento\|chave\)/ {
    if (!modified) {
        gsub(/\(login\|usuarios\|produtos\|pedidos\|resgates\|pagamento\|chave\)/, 
             "(login|usuarios|produtos|pedidos|resgates|pagamento|chave|configuracoes)")
        modified = 1
    }
}
{ print }
' /etc/nginx/nginx.conf.backup.$(date +%s) | sudo tee /etc/nginx/nginx.conf > /dev/null

# 3. Testar
echo "3. Testando configuração..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "4. Recarregando Nginx..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ Nginx atualizado com sucesso!"
    echo ""
    echo "5. Testando endpoint em 2 segundos..."
    sleep 2
    
    RESPONSE=$(curl -s https://construmega.online/configuracoes)
    if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
        echo "✅ FUNCIONANDO! Retornando JSON:"
        echo "$RESPONSE" | jq . | head -15
    else
        echo "❌ Ainda retornando HTML. Verifique:"
        echo "$RESPONSE" | head -50
    fi
else
    echo "❌ ERRO na configuração do Nginx!"
    echo "Revertendo backup..."
    sudo cp /etc/nginx/nginx.conf.backup.$(date +%s) /etc/nginx/nginx.conf
    sudo nginx -t
fi
