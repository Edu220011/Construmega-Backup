#!/bin/bash

# 🔧 Script para Corrigir Git - Construmega
# Resolve problema de branches divergentes

echo "🔧 CORRIGINDO PROBLEMA DO GIT"
echo "============================="

cd /var/www/construmega

echo "Status atual do Git:"
git status

echo -e "\nConfigurando estratégia de merge..."
git config pull.rebase false

echo -e "\nFazendo pull com merge..."
git pull origin master

echo -e "\nStatus após correção:"
git status

echo -e "\n✅ Problema do Git resolvido!"