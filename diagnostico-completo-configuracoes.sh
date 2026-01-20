#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ DIAGNÓSTICO COMPLETO - DADOS DA EMPRESA NÃO APARECEM          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICAR BACKEND - localhost:3000/configuracoes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_RESPONSE=$(curl -s http://localhost:3000/configuracoes)

if echo "$BACKEND_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "✅ BACKEND RESPONDENDO COM JSON:"
    echo "$BACKEND_RESPONSE" | jq . | head -20
else
    echo "❌ BACKEND NÃO RESPONDENDO COM JSON"
    echo "Resposta recebida:"
    echo "$BACKEND_RESPONSE" | head -20
fi

echo ""
echo ""

# 2. Verificar Nginx
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  VERIFICAR NGINX - https://construmega.online/configuracoes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NGINX_RESPONSE=$(curl -s https://construmega.online/configuracoes)

if echo "$NGINX_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "✅ NGINX PROXIANDO CORRETAMENTE:"
    echo "$NGINX_RESPONSE" | jq . | head -20
else
    echo "❌ NGINX RETORNANDO HTML (não está proxiando)"
    echo "Primeiras 200 caracteres:"
    echo "$NGINX_RESPONSE" | head -c 200
fi

echo ""
echo ""

# 3. Verificar configuração do Nginx
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  VERIFICAR CONFIGURAÇÃO DO NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "configuracoes" /etc/nginx/nginx.conf; then
    echo "✅ /configuracoes ESTÁ NA CONFIGURAÇÃO DO NGINX"
    echo ""
    echo "Linha correspondente:"
    grep "configuracoes" /etc/nginx/nginx.conf | head -1
else
    echo "❌ /configuracoes NÃO ESTÁ NA CONFIGURAÇÃO DO NGINX"
    echo ""
    echo "É necessário aplicar a correção:"
    echo "  bash /var/www/site/fix-configuracoes-nginx.sh"
fi

echo ""
echo ""

# 4. Verificar se arquivo configuracoes.json existe
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VERIFICAR ARQUIVO configuracoes.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "/var/www/site/backend/configuracoes.json" ]; then
    echo "✅ ARQUIVO EXISTE: /var/www/site/backend/configuracoes.json"
    echo ""
    echo "Conteúdo (primeiras linhas):"
    head -20 /var/www/site/backend/configuracoes.json
else
    echo "❌ ARQUIVO NÃO ENCONTRADO"
fi

echo ""
echo ""

# 5. Testar status do backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  STATUS DO BACKEND (PM2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

pm2 status | grep construmega-backend

echo ""
echo ""

# 6. Resumo e próximos passos
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 RESUMO E PRÓXIMOS PASSOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! grep -q "configuracoes" /etc/nginx/nginx.conf; then
    echo "⚠️  AÇÃO NECESSÁRIA:"
    echo ""
    echo "Execute o script de correção:"
    echo "   bash /var/www/site/fix-configuracoes-nginx.sh"
    echo ""
fi

if echo "$NGINX_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "✅ ENDPOINT RETORNANDO JSON CORRETAMENTE"
    echo ""
    echo "No navegador, faça hard refresh para limpar cache:"
    echo "   WINDOWS/LINUX: Ctrl+Shift+R"
    echo "   MAC: Cmd+Shift+R"
    echo ""
    echo "Depois abra: https://construmega.online"
fi

echo ""
