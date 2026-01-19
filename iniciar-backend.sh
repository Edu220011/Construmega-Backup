#!/bin/bash

# 🚀 Script para Iniciar Backend - Construmega
# Versão: 1.0

echo "🚀 INICIANDO BACKEND CONSTRUMEGA"
echo "================================="

# Verificar se estamos no diretório correto
if [[ ! -d "/var/www/construmega/backend" ]]; then
    echo "❌ Diretório do backend não encontrado"
    exit 1
fi

cd /var/www/construmega/backend

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Verificar se as dependências estão instaladas
if [[ ! -d "node_modules" ]]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se .env existe
if [[ ! -f ".env" ]]; then
    echo "⚙️ Criando arquivo .env..."
    cat > .env << EOF
# Configurações do Mercado Pago
MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MP_PUBLIC_KEY=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Configurações do servidor
PORT=3000
NODE_ENV=production

# Configurações de segurança
JWT_SECRET=sua-chave-secreta-aqui
EOF
    echo "⚠️  IMPORTANTE: Configure suas credenciais do Mercado Pago no arquivo .env"
fi

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pm2 delete construmega-backend 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true

# Iniciar o backend
echo "▶️ Iniciando backend..."
pm2 start index.js --name "construmega-backend"

# Aguardar um pouco
sleep 3

# Verificar se iniciou
if pm2 describe construmega-backend >/dev/null 2>&1; then
    echo "✅ Backend iniciado com sucesso!"
    pm2 status construmega-backend
    echo ""
    echo "📊 LOGS DO BACKEND:"
    pm2 logs construmega-backend --lines 10 --no-interactive
else
    echo "❌ Falha ao iniciar backend"
    echo "Tentando iniciar diretamente..."
    node index.js &
    sleep 3
    if ps aux | grep -v grep | grep "node index.js" >/dev/null; then
        echo "✅ Backend iniciado diretamente (sem PM2)"
    else
        echo "❌ Falha completa. Verifique os logs:"
        node index.js 2>&1 | head -20
    fi
fi

echo ""
echo "🔍 TESTANDO CONECTIVIDADE:"
curl -s http://localhost:3000/api/produtos | head -5 || echo "❌ API não responde"

echo ""
echo "✅ PROCESSO CONCLUÍDO"