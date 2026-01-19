#!/bin/bash

# 📊 Script de Monitoramento - Construmega VPS
# Versão: 1.0
# Uso: ./monitor.sh

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 MONITORAMENTO - CONSTRUMEGA VPS${NC}"
echo "========================================"

# Verificar Nginx
echo -e "\n🌐 VERIFICANDO NGINX:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: ATIVO${NC}"
else
    echo -e "${RED}❌ Nginx: INATIVO${NC}"
fi

# Verificar PM2 e backend
echo -e "\n⚙️ VERIFICANDO BACKEND:"
if command -v pm2 &> /dev/null; then
    if pm2 describe construmega-backend &> /dev/null; then
        echo -e "${GREEN}✅ Backend PM2: ATIVO${NC}"
        pm2 status construmega-backend --no-interactive | grep -E "(name|status|cpu|memory|uptime)"
    else
        echo -e "${RED}❌ Backend PM2: INATIVO${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ PM2 não instalado${NC}"
fi

# Verificar processos Node.js
echo -e "\n🔍 VERIFICANDO PROCESSOS NODE.JS:"
node_processes=$(ps aux | grep node | grep -v grep | wc -l)
if [ $node_processes -gt 0 ]; then
    echo -e "${GREEN}✅ Processos Node.js: $node_processes rodando${NC}"
    ps aux | grep node | grep -v grep
else
    echo -e "${RED}❌ Nenhum processo Node.js encontrado${NC}"
fi

# Verificar portas
echo -e "\n🔌 VERIFICANDO PORTAS:"
echo "Porta 80 (HTTP):"
if netstat -tlnp | grep :80 &> /dev/null; then
    echo -e "${GREEN}✅ Porta 80: ABERTA${NC}"
else
    echo -e "${RED}❌ Porta 80: FECHADA${NC}"
fi

echo "Porta 443 (HTTPS):"
if netstat -tlnp | grep :443 &> /dev/null; then
    echo -e "${GREEN}✅ Porta 443: ABERTA${NC}"
else
    echo -e "${YELLOW}⚠️ Porta 443: FECHADA (SSL não configurado?)${NC}"
fi

echo "Porta 3000 (Backend):"
if netstat -tlnp | grep :3000 &> /dev/null; then
    echo -e "${GREEN}✅ Porta 3000: ABERTA${NC}"
else
    echo -e "${RED}❌ Porta 3000: FECHADA${NC}"
fi

# Verificar conectividade
echo -e "\n🌍 VERIFICANDO CONECTIVIDADE:"
echo "Testando localhost:"
if curl -s --max-time 5 http://localhost > /dev/null; then
    echo -e "${GREEN}✅ Localhost: OK${NC}"
else
    echo -e "${RED}❌ Localhost: FALHA${NC}"
fi

echo "Testando API backend:"
if curl -s --max-time 5 http://localhost:3000/api/produtos > /dev/null; then
    echo -e "${GREEN}✅ API Backend: OK${NC}"
else
    echo -e "${RED}❌ API Backend: FALHA${NC}"
fi

# Verificar arquivos importantes
echo -e "\n📁 VERIFICANDO ARQUIVOS:"
files_to_check=(
    "/var/www/construmega/frontend/build/index.html"
    "/var/www/construmega/backend/index.js"
    "/var/www/construmega/backend/package.json"
    "/etc/nginx/sites-enabled/construmega"
)

for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file: EXISTE${NC}"
    else
        echo -e "${RED}❌ $file: NÃO ENCONTRADO${NC}"
    fi
done

# Verificar uso de recursos
echo -e "\n💾 USO DE RECURSOS:"
echo "Memória:"
free -h | grep -E "^(Mem|Swap)"

echo -e "\nDisco:"
df -h / | tail -1

# Verificar logs recentes (últimas 5 linhas)
echo -e "\n📋 LOGS RECENTES:"
echo "Nginx access (últimas 3 linhas):"
tail -3 /var/log/nginx/construmega_access.log 2>/dev/null || echo "Log não encontrado"

echo -e "\nNginx error (últimas 3 linhas):"
tail -3 /var/log/nginx/construmega_error.log 2>/dev/null || echo "Log não encontrado"

echo -e "\nPM2 logs (últimas 3 linhas):"
pm2 logs construmega-backend --lines 3 --no-interactive 2>/dev/null | tail -6 || echo "Logs PM2 não disponíveis"

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${GREEN}✅ MONITORAMENTO CONCLUÍDO${NC}"
echo -e "${BLUE}=======================================${NC}"