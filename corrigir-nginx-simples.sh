#!/bin/bash

echo "╔═════════════════════════════════════════════════════════╗"
echo "║ CORRIGIR NGINX - ADICIONAR ROTA /configuracoes         ║"
echo "╚═════════════════════════════════════════════════════════╝"
echo ""

# Backup
BACKUP="/etc/nginx/nginx.conf.backup.$(date +%s)"
echo "📋 Fazendo backup: $BACKUP"
sudo cp /etc/nginx/nginx.conf "$BACKUP"

# Corrigir a linha
echo "🔧 Adicionando /configuracoes à rota do Nginx..."

sudo sed -i 's/location ~ \^\\\/(login|usuarios|produtos|pedidos|resgates|pagamento|chave)/location ~ ^\/(login|usuarios|produtos|pedidos|resgates|pagamento|chave|configuracoes)/' /etc/nginx/nginx.conf

# Testar
echo ""
echo "✔️  Testando configuração..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuração OK! Recarregando Nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "⏳ Aguardando 2 segundos..."
    sleep 2
    
    echo ""
    echo "🧪 Testando endpoint..."
    RESPONSE=$(curl -s https://construmega.online/configuracoes)
    
    if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
        echo ""
        echo "✅✅✅ SUCESSO! Endpoint retornando JSON:"
        echo ""
        echo "$RESPONSE" | jq .
        echo ""
        echo "🎉 Agora faça hard refresh no navegador:"
        echo "   WINDOWS/LINUX: Ctrl+Shift+R"
        echo "   MAC: Cmd+Shift+R"
    else
        echo ""
        echo "⚠️  Ainda recebendo HTML"
        echo "Primeiras 200 chars:"
        echo "$RESPONSE" | head -c 200
    fi
else
    echo ""
    echo "❌ ERRO na configuração! Revertendo..."
    sudo cp "$BACKUP" /etc/nginx/nginx.conf
    sudo nginx -t
fi
