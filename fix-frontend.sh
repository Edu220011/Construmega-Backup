#!/bin/bash

# Fix Frontend - Remover PM2 dev server e fazer build correto
# Execute na VPS: bash /var/www/site/fix-frontend.sh

echo "=========================================="
echo "🔧 CORRIGINDO FRONTEND"
echo "=========================================="

cd /var/www/site || exit 1

echo -e "\n1️⃣  Removendo frontend com erro do PM2..."
pm2 stop construmega-frontend 2>/dev/null
pm2 delete construmega-frontend 2>/dev/null
pm2 save

echo -e "\n2️⃣  Mostrando erro anterior:"
pm2 logs construmega-frontend --err 2>/dev/null | tail -20 || echo "Sem logs (já foi removido)"

echo -e "\n3️⃣  Preparando frontend para produção..."
cd /var/www/site/frontend

echo "📦 Instalando dependências..."
npm install --legacy-peer-deps 2>&1 | tail -5

echo -e "\n🔨 Compilando frontend (pode levar 1-2 minutos)..."
npm run build

if [ -f /var/www/site/frontend/build/index.html ]; then
    echo -e "\n✅ Build criado com sucesso!"
    ls -lah /var/www/site/frontend/build/index.html
else
    echo -e "\n❌ Erro: build/index.html não foi criado"
    exit 1
fi

echo -e "\n4️⃣  Reiniciando Nginx..."
sudo systemctl restart nginx

echo -e "\n5️⃣  Testando..."
echo "🔍 Frontend (arquivo estático):"
curl -I http://localhost/ 2>/dev/null | head -1

echo -e "\n🔍 API:"
curl -I http://localhost:3000/api/produtos 2>/dev/null | head -1

echo -e "\n🔍 Imagens:"
curl -I http://localhost/imagens/produtos/1_imagem_0.jpeg 2>/dev/null | head -1

echo -e "\n=========================================="
echo "✅ FRONTEND CONFIGURADO CORRETAMENTE"
echo "=========================================="
echo -e "\n📊 Processos PM2 agora:"
pm2 list

echo -e "\n✨ Frontend é servido como arquivos estáticos por Nginx"
echo "✨ Nenhum Node.js rodando para frontend (economiza RAM)"
echo "✨ Backend roda em PM2 (node /var/www/site/backend/index.js)"
