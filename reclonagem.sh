#!/bin/bash

# 🔧 Script para Reclonagem Completa - Construmega
# Remove tudo e re-clona do zero

echo "🔧 RECLONAGEM COMPLETA DO REPOSITÓRIO"
echo "====================================="

# Fazer backup dos arquivos importantes
echo "Fazendo backup de arquivos importantes..."
mkdir -p /tmp/construmega-full-backup
cp -r /var/www/construmega/* /tmp/construmega-full-backup/ 2>/dev/null || true

# Remover repositório problemático
echo "Removendo repositório problemático..."
cd /var/www
rm -rf construmega

# Re-clonar do zero
echo "Re-clonando repositório do GitHub..."
git clone https://github.com/Edu220011/Construmega-Backup.git construmega

# Verificar se clonou corretamente
if [[ -d "construmega" ]]; then
    cd construmega
    echo "✅ Re-clonagem bem-sucedida!"
    echo "Branch atual: $(git branch --show-current)"
    echo "Último commit: $(git log --oneline -1)"
    echo ""
    echo "📁 Arquivos restaurados:"
    ls -la
else
    echo "❌ Falha na re-clonagem"
    exit 1
fi

echo ""
echo "✅ Repositório completamente limpo e sincronizado!"
echo "Backup antigo disponível em: /tmp/construmega-full-backup/"