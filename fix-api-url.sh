#!/bin/bash

# Corrigir Mixed Content - API_URL em produção
# Execute na VPS: bash /var/www/site/fix-api-url.sh

echo "🔧 Corrigindo API_URL para HTTPS..."

# Atualizar código
cd /var/www/site
git pull origin main

# Fazer build
cd frontend
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps 2>&1 | grep -E "added|up to date" | tail -1

echo "🔨 Compilando frontend..."
npm run build 2>&1 | tail -5

# Validar
if [ -f build/index.html ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro: build não foi criado"
    exit 1
fi

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
cd /var/www/site
sudo systemctl restart nginx

# Testar
echo ""
echo "🧪 Testando página de produto..."
curl -s https://construmega.online/produto-venda/4 | grep -q "Carregando" && echo "✅ Página carregando corretamente" || echo "⚠️  Verificar console do navegador"

echo ""
echo "✅ TUDO PRONTO! Abra https://construmega.online/produto-venda/4 no navegador"
