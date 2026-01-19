#!/bin/bash

# 🚀 Script de Deploy Otimizado - Construmega AlmaLinux
# Versão: 2.0 - Otimizado para AlmaLinux 9
# Data: $(date)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🚀 Iniciando deploy otimizado do Construmega para AlmaLinux..."

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Passo 1: Verificações iniciais
log "🔍 Realizando verificações iniciais..."
info "Sistema: $(cat /etc/almalinux-release)"
info "Kernel: $(uname -r)"
info "SELinux: $(getenforce)"

# Passo 2: Instalar Node.js diretamente (método mais rápido)
log "🟢 Instalando Node.js 18 (método direto)..."

# Habilitar módulo Node.js 18 do AlmaLinux
log "Habilitando módulo Node.js 18..."
dnf module enable -y nodejs:18 >/dev/null 2>&1

# Instalar Node.js
log "Instalando Node.js..."
dnf install -y nodejs >/dev/null 2>&1

# Verificar instalação
if command -v node &> /dev/null; then
    node_version=$(node --version)
    npm_version=$(npm --version)
    log "✅ Node.js instalado: $node_version"
    log "✅ NPM instalado: $npm_version"
else
    error "❌ Falha na instalação do Node.js"
    exit 1
fi

# Passo 3: Instalar ferramentas necessárias
log "📋 Instalando ferramentas necessárias..."
dnf install -y git curl wget >/dev/null 2>&1

# Instalar PM2
log "⚙️ Instalando PM2..."
npm install -g pm2 >/dev/null 2>&1

# Passo 4: Instalar Nginx
log "🌐 Instalando Nginx..."
dnf install -y nginx >/dev/null 2>&1

# Passo 5: Criar diretórios
log "📁 Criando diretórios..."
mkdir -p /var/www
cd /var/www

# Passo 6: Clonar repositório
log "📥 Clonando repositório..."
if [[ -d "construmega" ]]; then
    rm -rf construmega
fi
git clone https://github.com/Edu220011/Construmega-Backup.git construmega >/dev/null 2>&1
cd construmega

# Passo 7: Instalar dependências backend
log "⚙️ Instalando dependências backend..."
cd backend
npm install >/dev/null 2>&1

# Criar .env se não existir
if [[ ! -f ".env" ]]; then
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
    warning "⚠️  Configure o MP_ACCESS_TOKEN e MP_PUBLIC_KEY no arquivo /var/www/construmega/backend/.env"
fi

# Passo 8: Instalar dependências frontend e build
log "⚙️ Instalando dependências frontend..."
cd ../frontend
npm install >/dev/null 2>&1
npm run build >/dev/null 2>&1

# Passo 9: Configurar Nginx
log "🌐 Configurando Nginx..."
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
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
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

# Passo 10: Configurar firewall
log "🔒 Configurando firewall..."
dnf install -y firewalld >/dev/null 2>&1
systemctl start firewalld >/dev/null 2>&1
systemctl enable firewalld >/dev/null 2>&1

firewall-cmd --permanent --add-port=22/tcp >/dev/null 2>&1
firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1
firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1
firewall-cmd --reload >/dev/null 2>&1

# Passo 11: Iniciar serviços
log "🔄 Iniciando serviços..."

# Iniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Iniciar backend com PM2
cd /var/www/construmega/backend
pm2 delete construmega-backend 2>/dev/null || true
pm2 start index.js --name "construmega-backend" >/dev/null 2>&1
pm2 save >/dev/null 2>&1
pm2 startup systemd -u root --hp /root >/dev/null 2>&1

# Passo 12: Verificações finais
log "✅ Realizando verificações finais..."

# Verificar serviços
if systemctl is-active --quiet nginx; then
    log "✅ Nginx: ATIVO"
else
    error "❌ Nginx: INATIVO"
fi

if pm2 describe construmega-backend >/dev/null 2>&1; then
    log "✅ Backend: ATIVO"
else
    error "❌ Backend: INATIVO"
fi

# Verificar arquivos
if [[ -f "/var/www/construmega/frontend/build/index.html" ]]; then
    log "✅ Build frontend: OK"
else
    error "❌ Build frontend: FALHA"
fi

log ""
log "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
log ""
log "📋 PRÓXIMOS PASSOS:"
log "1. Configure o Mercado Pago:"
log "   nano /var/www/construmega/backend/.env"
log ""
log "2. Acesse: http://construmega.online"
log "   Login admin: admin@admin.com / admin"
log ""
log "📊 MONITORAMENTO:"
log "• Ver status: pm2 status"
log "• Ver logs: pm2 logs construmega-backend"
log "• Reiniciar: pm2 restart construmega-backend"
log ""
log "🔒 SSL (Opcional):"
log "• Instalar certbot: dnf install -y certbot python3-certbot-nginx"
log "• Gerar certificado: certbot --nginx -d construmega.online"
log ""

# Criar arquivo de status
cat > /var/www/construmega/deploy-status.txt << EOF
Deploy realizado em: $(date)
Sistema: AlmaLinux $(cat /etc/almalinux-release | grep -oP 'release \K\d+\.\d+')
Node.js: $(node --version)
Status: Concluído
EOF

log "📄 Status salvo em: /var/www/construmega/deploy-status.txt"