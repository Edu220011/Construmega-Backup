#!/bin/bash

# 🚀 Setup Simples - Construmega VPS
# Baixa ZIP do GitHub e configura tudo

echo "🚀 SETUP SIMPLES - CONSTRUMEGA VPS"
echo "=================================="

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Este script deve ser executado como root (sudo)"
   exit 1
fi

# Passo 1: Baixar ZIP do GitHub
echo "📥 Baixando arquivos do GitHub..."
cd /tmp
rm -f construmega.zip
wget -O construmega.zip https://github.com/Edu220011/Construmega-Backup/archive/refs/heads/master.zip

if [[ ! -f "construmega.zip" ]]; then
    echo "❌ Falha ao baixar ZIP"
    exit 1
fi

# Passo 2: Extrair e mover
echo "📦 Extraindo arquivos..."
rm -rf /tmp/Construmega-Backup-master
unzip construmega.zip

# Backup do atual se existir
if [[ -d "/var/www/construmega" ]]; then
    echo "Fazendo backup da versão atual..."
    mv /var/www/construmega /var/www/construmega-backup-$(date +%Y%m%d-%H%M%S)
fi

# Mover para local correto
mv /tmp/Construmega-Backup-master /var/www/construmega

echo "✅ Arquivos extraídos com sucesso!"

# Passo 3: Verificar/instalar Node.js
echo "🟢 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    dnf module enable -y nodejs:18
    dnf install -y nodejs
fi
echo "✅ Node.js: $(node --version)"

# Passo 4: Verificar/instalar PM2
echo "⚙️ Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    npm install -g pm2
fi
echo "✅ PM2: $(pm2 --version)"

# Passo 5: Verificar/instalar Nginx
echo "🌐 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Instalando Nginx..."
    dnf install -y nginx
    systemctl enable nginx
fi

# Passo 6: Configurar projeto
echo "⚙️ Configurando projeto..."
cd /var/www/construmega

# Backend
echo "Configurando backend..."
cd backend
npm install

# Criar .env se não existir
if [[ ! -f ".env" ]]; then
    cat > .env << 'EOF'
# Configurações do Mercado Pago
MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MP_PUBLIC_KEY=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Configurações do servidor
PORT=3000
NODE_ENV=production

# Configurações de segurança
JWT_SECRET=construmega-jwt-secret-key-2024
EOF
fi

# Frontend
echo "Configurando frontend..."
cd ../frontend
npm install
npm run build

# Passo 7: Configurar Nginx
echo "🌐 Configurando Nginx..."
nginx_config="/etc/nginx/conf.d/construmega.conf"

cat > $nginx_config << 'EOF'
server {
    listen 80;
    server_name construmega.online www.construmega.online;

    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;

    location / {
        root /var/www/construmega/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Forwarded-For $proxy_add_x_forwarded_for;
        add_header X-Forwarded-Proto $scheme;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remover configuração padrão
rm -f /etc/nginx/conf.d/default.conf

# Passo 8: Configurar firewall
echo "🔒 Configurando firewall..."
dnf install -y firewalld
systemctl start firewalld
systemctl enable firewalld

firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

# Passo 9: Iniciar serviços
echo "▶️ Iniciando serviços..."

# Parar processos existentes
pm2 delete all 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Iniciar backend
cd /var/www/construmega/backend
pm2 start index.js --name "construmega-backend"
pm2 save
pm2 startup systemd -u root --hp /root

# Iniciar Nginx
systemctl restart nginx

# Passo 10: Verificações finais
echo -e "\n✅ Verificações finais..."

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: ATIVO"
else
    echo "❌ Nginx: INATIVO"
fi

if pm2 describe construmega-backend >/dev/null 2>&1; then
    echo "✅ Backend: ATIVO"
else
    echo "❌ Backend: INATIVO"
fi

if curl -s --max-time 5 http://localhost >/dev/null; then
    echo "✅ Frontend: RESPONDENDO"
else
    echo "❌ Frontend: NÃO RESPONDE"
fi

if curl -s --max-time 5 http://localhost:3000/api/produtos >/dev/null; then
    echo "✅ API Backend: RESPONDENDO"
else
    echo "❌ API Backend: NÃO RESPONDE"
fi

# Limpar arquivos temporários
rm -f /tmp/construmega.zip

echo ""
echo "🎉 SETUP CONCLUÍDO!"
echo ""
echo "🌐 Acesse: http://construmega.online"
echo "👤 Login admin: admin@admin.com / admin"
echo ""
echo "⚙️ Configure o Mercado Pago:"
echo "nano /var/www/construmega/backend/.env"
echo ""
echo "📊 Monitoramento:"
echo "pm2 status"
echo "pm2 logs construmega-backend"