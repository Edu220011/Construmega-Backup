#!/bin/bash

# 🚀 Script Automático de Instalação - Imagens Nginx
# Uso: bash atualizar-imagens-nginx.sh

set -e  # Parar se houver erro

echo "================================"
echo "🚀 ATUALIZAÇÃO - PROXY /imagens/"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Fazer backup
print_info "Fazendo backup do arquivo Nginx..."
BACKUP_FILE="/etc/nginx/sites-available/construmega.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp /etc/nginx/sites-available/construmega "$BACKUP_FILE"
print_success "Backup criado: $BACKUP_FILE"
echo ""

# 2. Verificar se arquivo já tem /imagens/
print_info "Verificando se /imagens/ já está configurado..."
if grep -q "location /imagens/" /etc/nginx/sites-available/construmega; then
    print_warning "Configuração /imagens/ já existe!"
    echo "Se deseja atualizar, remova a configuração antiga manualmente."
    exit 1
fi
echo ""

# 3. Encontrar a linha onde inserir
print_info "Localizando ponto de inserção (location /api/)..."
LINE_NUMBER=$(grep -n "location /api/" /etc/nginx/sites-available/construmega | head -1 | cut -d: -f1)

if [ -z "$LINE_NUMBER" ]; then
    print_error "Não encontrado 'location /api/' no arquivo!"
    print_warning "Restaurando backup..."
    sudo cp "$BACKUP_FILE" /etc/nginx/sites-available/construmega
    exit 1
fi

print_success "Encontrado em linha $LINE_NUMBER"
echo ""

# 4. Criar bloco de configuração
CONFIG_BLOCK="    # Imagens de produtos (servidas pelo backend Node.js)
    location /imagens/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Cache de imagens (1 semana)
        expires 7d;
        add_header Cache-Control \"public, max-age=604800\";
    }
"

# 5. Inserir antes de location /api/
print_info "Inserindo configuração /imagens/..."

# Usar sed para inserir antes da linha
sudo sed -i "${LINE_NUMBER}i\\${CONFIG_BLOCK}" /etc/nginx/sites-available/construmega

print_success "Configuração inserida"
echo ""

# 6. Validar sintaxe
print_info "Validando sintaxe Nginx..."
if sudo nginx -t > /tmp/nginx_test.log 2>&1; then
    print_success "Sintaxe OK"
else
    print_error "Erro de sintaxe!"
    cat /tmp/nginx_test.log
    print_warning "Restaurando backup..."
    sudo cp "$BACKUP_FILE" /etc/nginx/sites-available/construmega
    exit 1
fi
echo ""

# 7. Reiniciar Nginx
print_info "Reiniciando Nginx..."
if sudo systemctl restart nginx; then
    print_success "Nginx reiniciado com sucesso"
else
    print_error "Erro ao reiniciar Nginx!"
    print_warning "Restaurando backup..."
    sudo cp "$BACKUP_FILE" /etc/nginx/sites-available/construmega
    sudo systemctl restart nginx
    exit 1
fi
echo ""

# 8. Verificar status
print_info "Verificando status do Nginx..."
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx está rodando"
else
    print_error "Nginx não está rodando!"
    exit 1
fi
echo ""

# 9. Testar acesso local
print_info "Testando acesso às imagens (localhost)..."
if curl -s -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg | grep -q "200"; then
    print_success "Backend respondendo corretamente"
else
    print_warning "Backend pode estar offline"
fi
echo ""

# 10. Testar via Nginx
print_info "Testando via Nginx..."
DOMAIN="construmega.online"
if curl -s -I https://$DOMAIN/imagens/produtos/1_imagem_0.jpeg | grep -q "200"; then
    print_success "Nginx proxiando corretamente"
else
    print_warning "Teste HTTP retornou status diferente de 200"
    print_info "Verifique manualmente: curl -I https://$DOMAIN/imagens/produtos/1_imagem_0.jpeg"
fi
echo ""

# 11. Resumo final
echo "================================"
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "================================"
echo ""
print_success "Backup: $BACKUP_FILE"
echo ""
echo "Próximos passos:"
echo "  1. Teste no navegador: https://construmega.online/produtos"
echo "  2. Clique em um produto com imagem"
echo "  3. Verifique se a imagem aparece"
echo ""
echo "Se algo der errado, restaure com:"
echo "  sudo cp $BACKUP_FILE /etc/nginx/sites-available/construmega"
echo "  sudo systemctl restart nginx"
echo ""
