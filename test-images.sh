#!/bin/bash

# Script para testar a conversão de imagens base64 para URLs
# Execute: bash test-images.sh

echo "================================"
echo "  TESTE DE CONVERSÃO DE IMAGENS"
echo "================================"
echo ""

# Cores para output
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se backend está rodando
echo -e "${AMARELO}[1] Verificando se Backend está rodando...${NC}"
if curl -s http://localhost:3000/api/produtos > /dev/null 2>&1; then
    echo -e "${VERDE}✓ Backend está rodando em http://localhost:3000${NC}"
else
    echo -e "${VERMELHO}✗ Backend não está respondendo${NC}"
    echo "Inicie com: node backend/index.js"
    exit 1
fi
echo ""

# 2. Verificar pasta de imagens
echo -e "${AMARELO}[2] Verificando se pasta de imagens foi criada...${NC}"
if [ -d "backend/public/imagens/produtos" ]; then
    echo -e "${VERDE}✓ Pasta /backend/public/imagens/produtos/ existe${NC}"
    FILE_COUNT=$(find backend/public/imagens/produtos -type f | wc -l)
    echo "   Arquivos encontrados: $FILE_COUNT"
else
    echo -e "${VERMELHO}✗ Pasta /backend/public/imagens/produtos/ não encontrada${NC}"
    echo "   Criando pasta..."
    mkdir -p backend/public/imagens/produtos
    echo -e "${VERDE}✓ Pasta criada${NC}"
fi
echo ""

# 3. Buscar produtos com base64
echo -e "${AMARELO}[3] Verificando produtos.json...${NC}"
PRODUTOS_COM_BASE64=$(grep -c "data:image" backend/produtos.json || echo "0")
PRODUTOS_COM_URL=$(grep -c "/imagens/produtos/" backend/produtos.json || echo "0")

echo "   Base64 encontrados: $PRODUTOS_COM_BASE64"
echo "   URLs encontradas: $PRODUTOS_COM_URL"

if [ "$PRODUTOS_COM_BASE64" -eq 0 ] && [ "$PRODUTOS_COM_URL" -gt 0 ]; then
    echo -e "${VERDE}✓ Conversão completada com sucesso!${NC}"
elif [ "$PRODUTOS_COM_BASE64" -gt 0 ]; then
    echo -e "${AMARELO}⚠ Ainda há base64 no arquivo${NC}"
    echo "   Reinicie o servidor para completar a conversão"
fi
echo ""

# 4. Testar acesso direto a imagens
echo -e "${AMARELO}[4] Testando acesso a arquivos de imagem...${NC}"
if [ -f "backend/public/imagens/produtos/1_0.jpeg" ] || [ -f "backend/public/imagens/produtos/1_0.png" ]; then
    echo -e "${VERDE}✓ Arquivo de imagem encontrado${NC}"
    # Tentar acessar via HTTP
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/imagens/produtos/1_0.jpeg 2>/dev/null || echo "000")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "404" ]; then
        echo "   Status HTTP: $RESPONSE"
        if [ "$RESPONSE" = "200" ]; then
            echo -e "${VERDE}✓ Arquivo acessível via HTTP${NC}"
        else
            echo -e "${AMARELO}⚠ Arquivo não acessível (404) - pode estar com nome diferente${NC}"
        fi
    fi
else
    echo -e "${AMARELO}⚠ Nenhum arquivo de imagem encontrado ainda${NC}"
    echo "   Arquivos serão criados na próxima inicialização do servidor"
fi
echo ""

# 5. Verificar API de produtos
echo -e "${AMARELO}[5] Obtendo dados de um produto da API...${NC}"
PRODUTO=$(curl -s http://localhost:3000/api/produtos | jq '.[0]' 2>/dev/null)
if [ ! -z "$PRODUTO" ]; then
    IMAGENS=$(echo "$PRODUTO" | jq '.imagens' 2>/dev/null)
    NOME=$(echo "$PRODUTO" | jq -r '.nome' 2>/dev/null)
    echo "   Produto: $NOME"
    echo "   Imagens: $IMAGENS"
    
    # Verificar se contém base64 ou URL
    if echo "$IMAGENS" | grep -q "data:image"; then
        echo -e "${AMARELO}⚠ Ainda em base64${NC}"
    elif echo "$IMAGENS" | grep -q "/imagens/"; then
        echo -e "${VERDE}✓ Usando URLs${NC}"
    fi
else
    echo -e "${VERMELHO}✗ Erro ao buscar produtos${NC}"
fi
echo ""

# 6. Resumo
echo "================================"
echo "           RESUMO"
echo "================================"
echo ""
echo -e "Base64 em JSON:      ${AMARELO}$PRODUTOS_COM_BASE64${NC}"
echo -e "URLs em JSON:        ${VERDE}$PRODUTOS_COM_URL${NC}"
echo ""
echo "Status: Se Base64 = 0 e URLs > 0, tudo funcionando ✓"
echo ""
