#!/bin/bash

# Script de Correcao Completa: Parar Frontend + Corrigir Backend
# Execute na VPS com: bash /var/www/site/corrigir-vps.sh

echo "=========================================="
echo "🔧 CORRIGINDO CONSTRUMEGA VPS"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /var/www/site || { echo "❌ Erro ao entrar em /var/www/site"; exit 1; }

echo -e "\n${YELLOW}[1/6] Parando e removendo frontend do PM2...${NC}"
pm2 stop construmega-frontend 2>/dev/null || echo "⚠️  Frontend já estava parado"
pm2 delete construmega-frontend 2>/dev/null || echo "⚠️  Frontend não estava no PM2"
pm2 save

echo -e "${GREEN}✅ Frontend removido do PM2${NC}"

echo -e "\n${YELLOW}[2/6] Atualizando código do backend...${NC}"
git pull origin main 2>/dev/null || echo "⚠️  Erro ao fazer git pull"

echo -e "${GREEN}✅ Código atualizado${NC}"

echo -e "\n${YELLOW}[3/6] Reiniciando backend...${NC}"
pm2 restart construmega-backend --no-autorestart

sleep 2

echo -e "${GREEN}✅ Backend reiniciado${NC}"

echo -e "\n${YELLOW}[4/6] Verificando logs do backend...${NC}"
echo "📋 Últimas 10 linhas de erro:"
tail -10 /root/.pm2/logs/construmega-backend-error.log

echo -e "\n${YELLOW}[5/6] Validando Nginx...${NC}"
sudo nginx -t

echo -e "\n${YELLOW}[6/6] Testando endpoints...${NC}"
echo "🔍 Testando /api/produtos..."
curl -s -I http://localhost:3000/api/produtos | head -1

echo "🔍 Testando /imagens/..."
curl -s -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg | head -1

echo -e "\n${GREEN}=========================================="
echo "✅ CORREÇÃO COMPLETA REALIZADA"
echo "==========================================${NC}\n"

echo "📝 PRÓXIMOS PASSOS:"
echo "1. Acesse https://construmega.online/"
echo "2. Se página não carregar, verifique:"
echo "   - ls -la /var/www/site/frontend/build/"
echo "   - sudo tail -20 /var/log/nginx/error.log"
echo "3. Se imagens não aparecerem:"
echo "   - curl -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg"
echo "   - curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg"

echo -e "\n${YELLOW}Para monitorar logs em tempo real:${NC}"
echo "pm2 logs construmega-backend"
