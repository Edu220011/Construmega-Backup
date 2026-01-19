#!/bin/bash

# 🚀 Script Completo de Setup - Construmega VPS
# Versão: 2.0 - Setup completo do sistema

set -e

echo "🚀 SETUP COMPLETO - CONSTRUMEGA VPS"
echo "==================================="

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Este script deve ser executado como root (sudo)"
   exit 1
fi

# Passo 1: Verificar sistema
echo "🔍 Verificando sistema..."
echo "Sistema: $(cat /etc/almalinux-release)"
echo "Arquitetura: $(uname -m)"
echo "Kernel: $(uname -r)"

# Passo 2: Instalar Node.js se necessário
echo -e "\n🟢 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    dnf module enable -y nodejs:18
    dnf install -y nodejs
else
    echo "✅ Node.js já instalado: $(node --version)"
fi

# Passo 3: Instalar PM2 se necessário
echo -e "\n⚙️ Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    npm install -g pm2
else
    echo "✅ PM2 já instalado: $(pm2 --version)"
fi

# Passo 4: Instalar Nginx se necessário
echo -e "\n🌐 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Instalando Nginx..."
    dnf install -y nginx
    systemctl enable nginx
else
    echo "✅ Nginx já instalado"
fi

# Passo 5: Instalar Git se necessário
echo -e "\n📋 Verificando Git..."
if ! command -v git &> /dev/null; then
    echo "Instalando Git..."
    dnf install -y git
else
    echo "✅ Git já instalado: $(git --version)"
fi

# Passo 6: Criar diretórios
echo -e "\n📁 Criando diretórios..."
mkdir -p /var/www
mkdir -p /var/log/pm2

# Passo 7: Clonar/Atualizar repositório
echo -e "\n📥 Configurando repositório..."
cd /var/www

if [[ -d "construmega" ]]; then
    echo "Atualizando repositório existente..."
    cd construmega
    git pull origin master
else
    echo "Clonando repositório..."
    git clone https://github.com/Edu220011/Construmega-Backup.git construmega
    cd construmega
fi

# Passo 8: Instalar dependências do projeto raiz
echo -e "\n📦 Instalando dependências do projeto..."
if [[ -f "package.json" ]]; then
    npm install
fi

# Passo 9: Setup Backend
echo -e "\n🔧 Configurando Backend..."
cd backend

# Instalar dependências do backend
echo "Instalando dependências do backend..."
npm install

# Criar .env se não existir
if [[ ! -f ".env" ]]; then
    echo "Criando arquivo .env..."
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
    echo "⚠️  IMPORTANTE: Configure o MP_ACCESS_TOKEN e MP_PUBLIC_KEY no arquivo .env"
fi

# Passo 10: Setup Frontend
echo -e "\n⚛️ Configurando Frontend..."
cd ../frontend

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
npm install

# Build de produção
echo "Gerando build de produção..."
npm run build

# Verificar se build foi criado
if [[ ! -d "build" ]]; then
    echo "❌ Build do frontend falhou!"
    exit 1
fi

echo "✅ Build do frontend criado com sucesso"

# Passo 11: Configurar Nginx
echo -e "\n🌐 Configurando Nginx..."
nginx_config="/etc/nginx/conf.d/construmega.conf"

cat > $nginx_config << 'EOF'
server {
    listen 80;
    server_name construmega.online www.construmega.online;

    # Logs
    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;

    # Frontend (React build)
    location / {
        root /var/www/construmega/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Forwarded-For $proxy_add_x_forwarded_for;
        add_header X-Forwarded-Proto $scheme;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Backend API (proxy para Node.js)
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

    # Outras rotas da API
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

    # Arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remover configuração padrão se existir
rm -f /etc/nginx/conf.d/default.conf

# Passo 12: Configurar Firewall
echo -e "\n🔒 Configurando Firewall..."
dnf install -y firewalld
systemctl start firewalld
systemctl enable firewalld

firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

# Passo 13: Iniciar serviços
echo -e "\n▶️ Iniciando serviços..."

# Parar processos existentes
pm2 delete all 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Iniciar backend
echo "Iniciando backend..."
cd /var/www/construmega/backend
pm2 start index.js --name "construmega-backend"

# Salvar configuração PM2
pm2 save
pm2 startup systemd -u root --hp /root

# Iniciar Nginx
echo "Iniciando Nginx..."
systemctl restart nginx

# Passo 14: Verificações finais
echo -e "\n✅ Verificações finais..."

# Verificar serviços
echo "Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: ATIVO"
else
    echo "❌ Nginx: INATIVO"
fi

echo "Verificando Backend..."
if pm2 describe construmega-backend >/dev/null 2>&1; then
    echo "✅ Backend: ATIVO"
else
    echo "❌ Backend: INATIVO"
fi

# Verificar conectividade
echo "Testando conectividade..."
sleep 3

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

# Passo 15: Criar arquivo de status
echo -e "\n📄 Criando arquivo de status..."
cat > /var/www/construmega/setup-status.txt << EOF
Setup realizado em: $(date)
Sistema: $(cat /etc/almalinux-release)
Node.js: $(node --version)
NPM: $(npm --version)
PM2: $(pm2 --version)
Status: Completo
EOF

echo ""
echo "🎉 SETUP COMPLETO!"
echo ""
echo "📋 STATUS FINAL:"
echo "- Nginx: $(systemctl is-active nginx)"
echo "- Backend: $(pm2 jlist | grep -o '"name":"construmega-backend"' >/dev/null && echo 'ATIVO' || echo 'INATIVO')"
echo ""
echo "🌐 Acesse: http://construmega.online"
echo "👤 Login admin: admin@admin.com / admin"
echo ""
echo "📊 MONITORAMENTO:"
echo "- Status: pm2 status"
echo "- Logs: pm2 logs construmega-backend"
echo "- Reiniciar backend: pm2 restart construmega-backend"
echo ""
echo "⚙️ CONFIGURAÇÃO:"
echo "- Mercado Pago: nano /var/www/construmega/backend/.env"
echo ""
echo "📄 Status salvo em: /var/www/construmega/setup-status.txt"