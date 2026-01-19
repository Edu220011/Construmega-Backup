#!/bin/bash

# 🚀 Script de Deploy Automático - Construmega VPS
# Versão: 1.0
# Data: $(date)
# Uso: ./deploy-vps.sh

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
   exit 1
fi

log "🚀 Iniciando deploy do Construmega na VPS..."

# Detectar sistema operacional
if [[ -f /etc/debian_version ]]; then
    OS="debian"
    PACKAGE_MANAGER="apt"
    log "Sistema detectado: Debian/Ubuntu"
elif [[ -f /etc/redhat-release ]] || [[ -f /etc/almalinux-release ]] || [[ -f /etc/rocky-release ]] || [[ -f /etc/oracle-release ]]; then
    OS="redhat"
    PACKAGE_MANAGER="yum"
    if command -v dnf &> /dev/null; then
        PACKAGE_MANAGER="dnf"
    fi

    # Detectar distribuição específica
    if [[ -f /etc/almalinux-release ]]; then
        DISTRO="AlmaLinux"
    elif [[ -f /etc/rocky-release ]]; then
        DISTRO="Rocky Linux"
    elif [[ -f /etc/oracle-release ]]; then
        DISTRO="Oracle Linux"
    else
        DISTRO="RHEL/CentOS"
    fi

    log "Sistema detectado: $DISTRO (usando $PACKAGE_MANAGER)"
else
    # Tentar detectar outros sistemas
    if command -v apt &> /dev/null; then
        OS="debian"
        PACKAGE_MANAGER="apt"
        log "Sistema detectado: Debian/Ubuntu (fallback)"
    elif command -v yum &> /dev/null || command -v dnf &> /dev/null; then
        OS="redhat"
        PACKAGE_MANAGER="yum"
        if command -v dnf &> /dev/null; then
            PACKAGE_MANAGER="dnf"
        fi
        log "Sistema detectado: RHEL/CentOS/AlmaLinux (fallback usando $PACKAGE_MANAGER)"
    else
        error "Sistema operacional não suportado. Distribuições suportadas: Debian/Ubuntu, RHEL/CentOS, AlmaLinux, Rocky Linux"
        exit 1
    fi
fi

# Função para instalar pacotes
install_package() {
    local package=$1
    info "Instalando $package..."

    if [[ $PACKAGE_MANAGER == "apt" ]]; then
        apt update -qq && apt install -y -qq $package
    else
        $PACKAGE_MANAGER install -y -q $package
    fi
}

# Passo 1: Atualizar sistema
log "📦 Atualizando sistema..."
if [[ $PACKAGE_MANAGER == "apt" ]]; then
    apt update -qq && apt upgrade -y -qq
else
    $PACKAGE_MANAGER update -y -q
fi

# Passo 2: Instalar Node.js
log "🟢 Instalando Node.js..."
if [[ $OS == "debian" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
    apt install -y -qq nodejs
else
    # Para sistemas RHEL-like (CentOS, AlmaLinux, Rocky, etc.)
    log "Configurando repositórios para Node.js..."

    # Instalar EPEL se disponível (útil para AlmaLinux)
    if [[ $DISTRO == "AlmaLinux" ]] || [[ $DISTRO == "Rocky Linux" ]]; then
        $PACKAGE_MANAGER install -y -q epel-release >/dev/null 2>&1 || true
    fi

    # Instalar curl se não estiver disponível
    if ! command -v curl &> /dev/null; then
        $PACKAGE_MANAGER install -y -q curl >/dev/null 2>&1
    fi

    # Instalar Node.js via NodeSource
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
    $PACKAGE_MANAGER install -y -q nodejs

    # Verificar se a instalação foi bem-sucedida
    if ! command -v node &> /dev/null; then
        error "Falha ao instalar Node.js. Tentando método alternativo..."
        # Método alternativo para AlmaLinux/Rocky
        $PACKAGE_MANAGER install -y -q nodejs npm >/dev/null 2>&1
    fi
fi

# Verificar SELinux (comum em RHEL/AlmaLinux)
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    if [[ $SELINUX_STATUS == "Enforcing" ]]; then
        warning "SELinux está ativo. Pode ser necessário configurar permissões."
        log "Para desabilitar SELinux temporariamente: setenforce 0"
        log "Para desabilitar permanentemente: editar /etc/selinux/config"
    fi
fi

# Verificações específicas para AlmaLinux
if [[ $DISTRO == "AlmaLinux" ]]; then
    log "Configurações específicas para AlmaLinux aplicadas"
fi

# Passo 3: Instalar Git e outras ferramentas
log "📋 Instalando ferramentas necessárias..."
install_package git
install_package curl
install_package wget

# Instalar PM2 globalmente
log "⚙️ Instalando PM2..."
npm install -g pm2 >/dev/null 2>&1

# Passo 4: Instalar Nginx
log "🌐 Instalando Nginx..."
install_package nginx

# Passo 5: Criar diretórios
log "📁 Criando diretórios do projeto..."
mkdir -p /var/www
cd /var/www

# Passo 6: Clonar repositório
log "📥 Clonando repositório..."
if [[ -d "construmega" ]]; then
    warning "Diretório construmega já existe. Removendo..."
    rm -rf construmega
fi

git clone https://github.com/Edu220011/Construmega-Backup.git construmega >/dev/null 2>&1
cd construmega

# Passo 7: Configurar Backend
log "⚙️ Configurando backend..."
cd backend
npm install >/dev/null 2>&1

# Criar arquivo .env se não existir
if [[ ! -f ".env" ]]; then
    warning "Arquivo .env não encontrado. Criando template..."
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
    warning "⚠️  IMPORTANTE: Configure o MP_ACCESS_TOKEN e MP_PUBLIC_KEY no arquivo /var/www/construmega/backend/.env"
fi

# Passo 8: Configurar Frontend
log "⚙️ Configurando frontend..."
cd ../frontend
npm install >/dev/null 2>&1
npm run build >/dev/null 2>&1

# Passo 9: Configurar Nginx
log "🌐 Configurando Nginx..."
nginx_config="/etc/nginx/sites-available/construmega"

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

        # Timeout settings
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

# Criar link simbólico
ln -sf $nginx_config /etc/nginx/sites-enabled/

# Remover configuração padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Passo 10: Configurar firewall
log "🔒 Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable >/dev/null 2>&1
    ufw allow ssh >/dev/null 2>&1
    ufw allow 'Nginx Full' >/dev/null 2>&1
    log "Firewall UFW configurado"
elif command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld >/dev/null 2>&1
    systemctl enable firewalld >/dev/null 2>&1
    firewall-cmd --permanent --add-port=22/tcp >/dev/null 2>&1
    firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1
    firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1
    firewall-cmd --reload >/dev/null 2>&1
    log "Firewall firewalld configurado"
else
    warning "Nenhum firewall conhecido encontrado. Configure manualmente."
fi

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

# Verificar se serviços estão rodando
if systemctl is-active --quiet nginx; then
    log "✅ Nginx está rodando"
else
    error "❌ Nginx não está rodando"
fi

if pm2 describe construmega-backend >/dev/null 2>&1; then
    log "✅ Backend está rodando"
else
    error "❌ Backend não está rodando"
fi

# Verificar se arquivos existem
if [[ -f "/var/www/construmega/frontend/build/index.html" ]]; then
    log "✅ Build do frontend existe"
else
    error "❌ Build do frontend não encontrado"
fi

# Passo 13: SSL (opcional - Let's Encrypt)
read -p "Deseja configurar SSL com Let's Encrypt? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    log "🔒 Configurando SSL..."
    if [[ $OS == "debian" ]]; then
        apt install -y -qq certbot python3-certbot-nginx
    else
        $PACKAGE_MANAGER install -y -q certbot python3-certbot-nginx
    fi

    certbot --nginx -d construmega.online -d www.construmega.online --non-interactive --agree-tos --email admin@construmega.online
    log "✅ SSL configurado!"
fi

log ""
log "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
log ""
log "📋 PRÓXIMOS PASSOS:"
log "1. Configure o arquivo .env com suas credenciais do Mercado Pago:"
log "   nano /var/www/construmega/backend/.env"
log ""
log "2. Acesse o site: http://construmega.online"
log "   (ou https:// se SSL foi configurado)"
log ""
log "3. Teste o login admin: admin@admin.com / admin"
log ""
log "📊 COMANDOS ÚTEIS:"
log "- Ver logs do backend: pm2 logs construmega-backend"
log "- Ver logs do Nginx: tail -f /var/log/nginx/construmega_access.log"
log "- Reiniciar backend: pm2 restart construmega-backend"
log "- Atualizar projeto: cd /var/www/construmega && git pull && npm run build (frontend)"
log ""
log "🚨 EM CASO DE PROBLEMAS:"
log "- Verifique conectividade: curl -I http://localhost"
log "- Teste APIs: curl http://localhost:3000/api/produtos"
log ""

# Criar arquivo de status
cat > /var/www/construmega/deploy-status.txt << EOF
Deploy realizado em: $(date)
Sistema: $OS
Node.js: $node_version
NPM: $npm_version
Status: Concluído
EOF

log "📄 Status salvo em: /var/www/construmega/deploy-status.txt"