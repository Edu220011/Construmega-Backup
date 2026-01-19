#!/bin/bash

# 🔧 Script para Reset Git - Construmega
# Força sincronização completa com GitHub

echo "🔧 RESET COMPLETO DO GIT"
echo "========================"

cd /var/www/construmega

echo "Status atual:"
git status

echo -e "\nFazendo backup de mudanças locais..."
# Criar backup das mudanças locais se existirem
if [[ -n $(git status --porcelain) ]]; then
    mkdir -p /tmp/construmega-backup
    git diff --name-only | xargs -I {} cp {} /tmp/construmega-backup/ 2>/dev/null || true
    echo "Backup criado em /tmp/construmega-backup/"
fi

echo -e "\nResetando repositório..."
git reset --hard HEAD
git clean -fd

echo -e "\nConfigurando pull strategy..."
git config pull.rebase false

echo -e "\nSincronizando com GitHub..."
git pull origin master --allow-unrelated-histories

echo -e "\nStatus final:"
git status
git log --oneline -5

echo -e "\n✅ Git resetado e sincronizado!"