#!/bin/bash

# 🔍 Script de Diagnóstico - Construmega VPS
# Versão: 1.0

echo "🔍 DIAGNÓSTICO DO SISTEMA - CONSTRUMEGA"
echo "========================================"

# Verificar processos Node.js
echo -e "\n🔍 PROCESSOS NODE.JS:"
ps aux | grep node | grep -v grep || echo "Nenhum processo Node.js encontrado"

# Verificar PM2
echo -e "\n⚙️ PM2 STATUS:"
if command -v pm2 &> /dev/null; then
    pm2 list || echo "PM2 não tem processos"
else
    echo "PM2 não está instalado"
fi

# Verificar Nginx
echo -e "\n🌐 NGINX STATUS:"
if command -v nginx &> /dev/null; then
    systemctl status nginx --no-pager -l | head -10
else
    echo "Nginx não está instalado"
fi

# Verificar arquivos do projeto
echo -e "\n📁 ARQUIVOS DO PROJETO:"
if [[ -d "/var/www/construmega" ]]; then
    echo "Diretório do projeto existe"
    ls -la /var/www/construmega/
else
    echo "❌ Diretório do projeto NÃO existe"
fi

# Verificar Node.js
echo -e "\n🟢 NODE.JS:"
if command -v node &> /dev/null; then
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
else
    echo "❌ Node.js não está instalado"
fi

# Verificar portas
echo -e "\n🔌 PORTAS:"
netstat -tlnp | grep -E ":(80|3000|443)" || echo "Nenhuma porta relevante aberta"

# Verificar logs recentes
echo -e "\n📋 LOGS RECENTES:"
echo "Últimas 5 linhas do syslog:"
tail -5 /var/log/messages 2>/dev/null || tail -5 /var/log/syslog 2>/dev/null || echo "Logs não encontrados"

echo -e "\n✅ DIAGNÓSTICO CONCLUÍDO"