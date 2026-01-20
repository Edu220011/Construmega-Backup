#!/bin/bash

echo "=== TESTANDO ENDPOINT /configuracoes ==="
echo ""

echo "1. Backend localhost:3000/configuracoes:"
curl -s http://localhost:3000/configuracoes | jq . 2>/dev/null || curl -s http://localhost:3000/configuracoes

echo ""
echo "2. Via Nginx HTTPS:"
curl -s https://construmega.online/configuracoes | head -20

echo ""
echo "3. Backend status:"
pm2 status

echo ""
echo "4. Nginx test:"
sudo nginx -t

echo ""
echo "5. Verificando rota no backend (backend/index.js):"
grep -n "app.get.*configuracoes" /var/www/site/backend/index.js

echo ""
echo "6. Último erro no backend:"
pm2 logs construmega-backend | tail -20
