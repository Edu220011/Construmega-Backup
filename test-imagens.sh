#!/bin/bash
# Script para testar imagens em localhost e VPS

echo "================================"
echo "🔍 TESTE DE IMAGENS - CONSTRUMEGA"
echo "================================"
echo ""

# Cores
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar URL
testar_url() {
    local url=$1
    local descricao=$2
    
    echo -n "Testando $descricao... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${VERDE}✓ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${VERMELHO}✗ FALHA (HTTP $response)${NC}"
        return 1
    fi
}

# Teste 1: Backend em localhost
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  TESTE LOCAL (localhost:3000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Verificando se backend está rodando..."
if curl -s http://localhost:3000/produtos > /dev/null 2>&1; then
    echo -e "${VERDE}✓ Backend está rodando${NC}"
else
    echo -e "${VERMELHO}✗ Backend NÃO está rodando${NC}"
    echo "  Inicie com: npm start (na pasta backend/)"
    exit 1
fi

echo ""

# Verificar se há imagens no JSON
echo "Verificando produtos.json..."
if grep -q '"/imagens/produtos/' backend/produtos.json 2>/dev/null; then
    echo -e "${VERDE}✓ Produtos com URLs de imagens encontrados${NC}"
    
    # Extrair primeira URL
    primeira_url=$(grep -o '"/imagens/produtos/[^"]*' backend/produtos.json | head -1 | tr -d '"')
    
    if [ -n "$primeira_url" ]; then
        echo "  Primeira imagem: $primeira_url"
        testar_url "http://localhost:3000$primeira_url" "imagem via HTTP direto"
    fi
else
    echo -e "${AMARELO}⚠ Nenhuma imagem com URL encontrada em produtos.json${NC}"
    echo "  Verifique se há imagens com base64..."
    if grep -q '"data:image' backend/produtos.json; then
        echo -e "${AMARELO}  ⚠ Encontrados base64 - reinicie o servidor para converter${NC}"
    fi
fi

echo ""

# Teste 2: Verificar arquivos no disco
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  TESTE DE ARQUIVOS NO DISCO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "backend/public/imagens/produtos" ]; then
    echo -e "${VERDE}✓ Pasta de imagens existe${NC}"
    
    count=$(ls -1 backend/public/imagens/produtos/*.{jpeg,jpg,png} 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo -e "${VERDE}✓ $count arquivo(s) de imagem encontrado(s)${NC}"
        
        # Listar primeiros arquivos
        echo "  Primeiros arquivos:"
        ls -1 backend/public/imagens/produtos/ 2>/dev/null | head -3 | sed 's/^/    - /'
    else
        echo -e "${AMARELO}⚠ Nenhum arquivo de imagem encontrado${NC}"
    fi
else
    echo -e "${VERMELHO}✗ Pasta backend/public/imagens/produtos NÃO existe${NC}"
fi

echo ""

# Teste 3: VPS (se disponível)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  TESTE VPS (construmega.online)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ping -c 1 construmega.online > /dev/null 2>&1; then
    echo "Testando acesso ao site..."
    
    testar_url "https://construmega.online" "homepage"
    testar_url "https://construmega.online/produtos" "página de produtos"
    
    # Testar primeira imagem na VPS
    if [ -n "$primeira_url" ]; then
        testar_url "https://construmega.online$primeira_url" "imagem na VPS"
    fi
    
    echo ""
    echo "🔍 Teste Nginx em detalhes:"
    curl -I https://construmega.online/imagens/produtos/ 2>/dev/null | head -5
else
    echo -e "${AMARELO}⚠ VPS construmega.online não está acessível${NC}"
    echo "  (Normal se estiver em desenvolvimento local)"
fi

echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Para imagens funcionarem:"
echo "1. Backend deve estar rodando (npm start)"
echo "2. Arquivos devem existir em backend/public/imagens/produtos/"
echo "3. URLs devem estar em produtos.json (não base64)"
echo "4. Na VPS: Nginx deve proxyar /imagens/ para backend"
echo ""
echo "Próximo passo:"
echo "→ Se imagens não aparecerem, verifique DEPLOY_VPS.md"
echo "→ Seção 'Passo 7: Instalar e Configurar Nginx'"
