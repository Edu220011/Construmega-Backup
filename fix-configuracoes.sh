#!/bin/bash

echo "=== DIAGNOSTICO: Por que /configuracoes retorna HTML em vez de JSON ==="
echo ""

# 1. Verificar se backend está respondendo
echo "1. Backend respondendo em localhost:3000/configuracoes?"
curl -s http://localhost:3000/configuracoes | head -50
echo ""
echo ""

# 2. Verificar configuração Nginx
echo "2. Verificando location blocks no nginx.conf:"
sudo grep -A 2 "location" /etc/nginx/nginx.conf | head -50
echo ""
echo ""

# 3. Problema: /configuracoes está sendo matchado por location / (catch-all) 
# e servindo a React app em vez de proxiar

echo "3. SOLUÇÃO: Adicionar location específico para /configuracoes ANTES de catch-all"
echo ""
echo "Estrutura esperada no Nginx:"
echo "  location ^~ /imagens/ { proxy_pass ... }"
echo "  location /api/ { proxy_pass ... }"
echo "  location /configuracoes { proxy_pass ... }  <-- FALTANDO"
echo "  location / { root /var/www/site/frontend/build; ... }"
echo ""

echo "4. Verificando se /configuracoes está no nginx.conf:"
sudo grep "/configuracoes" /etc/nginx/nginx.conf
