# ⚡ SOLUÇÃO RÁPIDA - Copiar e Colar na VPS

## PROBLEMA ENCONTRADO

```
❌ Frontend rodando em modo dev (erro allowedHosts)
❌ Backend com erro fs.existsSync
❌ Imagens não aparecem
❌ Página carregando lentamente
```

## SOLUÇÃO (5 minutos)

Abra um SSH para a VPS e execute EXATAMENTE isto:

### PASSO 1: Copiar o script corrigido

```bash
cd /var/www/site
git pull origin main
```

### PASSO 2: Executar correção automática

```bash
bash corrigir-vps.sh
```

**Ou manualmente, um por um:**

```bash
# 1. Parar frontend
pm2 stop construmega-frontend
pm2 delete construmega-frontend
pm2 save

# 2. Atualizar código (já fez git pull acima)

# 3. Reiniciar backend
pm2 restart construmega-backend

# 4. Esperar 3 segundos
sleep 3

# 5. Validar Nginx
sudo nginx -t
sudo systemctl restart nginx

# 6. Verificar se está OK
pm2 logs construmega-backend | head -20
```

## VERIFICAR SUCESSO

```bash
# Teste 1: Backend respondendo
curl -I http://localhost:3000/api/produtos
# Esperado: HTTP/1.1 200 OK

# Teste 2: Imagens sendo servidas pelo backend
curl -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg
# Esperado: HTTP/1.1 200 OK, Content-Type: image/jpeg

# Teste 3: Nginx prox para imagens
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
# Esperado: HTTP/1.1 200 OK, Content-Type: image/jpeg

# Teste 4: Frontend carregando
curl -I https://construmega.online/
# Esperado: HTTP/1.1 200 OK, Content-Type: text/html
```

## O QUE FOI CORRIGIDO

✅ **backend/index.js**
- Removeu `fs.existsSync()` que estava causando erro
- Agora usa `fsPromises` (modo assíncrono) na função de conversão de base64
- Adicionou tratamento de erro robusto

✅ **PM2 Frontend**
- Removido completamente
- Frontend agora é servido como arquivos estáticos pelo Nginx
- Sem mais erro "allowedHosts"

✅ **Nginx**
- Já estava configurado corretamente
- Vai servir /var/www/site/frontend/build/ para frontend
- Vai proxear /api/ e /imagens/ para localhost:3000

## SE AINDA TIVER PROBLEMA

### Se imagens ainda não aparecerem:

```bash
# Verificar se imagens existem
ls -la /var/www/site/backend/public/imagens/produtos/

# Se vazio, copiar do backup
cp /var/www/site/backend/backup/imagens/* /var/www/site/backend/public/imagens/produtos/

# Reiniciar backend
pm2 restart construmega-backend
```

### Se página não carregar:

```bash
# Verificar se /frontend/build existe
ls -la /var/www/site/frontend/build/index.html

# Se não existir, fazer build local e enviar:
# No seu PC local:
cd frontend
npm run build
# Depois fazer SCP ou git

# Ou na VPS (se Node instalado):
cd /var/www/site
npm run build --prefix frontend
```

### Se backend falhar:

```bash
# Ver logs detalhados
tail -50 /root/.pm2/logs/construmega-backend-error.log

# Reiniciar
pm2 restart construmega-backend

# Monitorar
pm2 logs construmega-backend
```

## CHECKLIST FINAL

Abrir no navegador e verificar:

- [ ] https://construmega.online/ - Carrega rápido
- [ ] Página não tem erros na console (F12)
- [ ] Clicar em um produto - Página carrega
- [ ] Foto do produto está visível
- [ ] Se não, F12 > Network > verificar se GET /imagens/... retorna 200

---

**Dúvidas?** Verifique os logs com: `pm2 logs`
