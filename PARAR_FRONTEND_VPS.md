# ⚠️ PARAR FRONTEND DO PM2 NA VPS

## PROBLEMA

O frontend React está rodando em modo **desenvolvimento** via PM2 na VPS, causando:
- ❌ Erro: `Invalid options object... allowedHosts[0] should be a non-empty string`
- ❌ Aplicação em loop infinito (exiting e reiniciando continuamente)
- ❌ Porta 8080 em uso
- ❌ Nginx não consegue servir o frontend estático

## SOLUÇÃO

O frontend deve ser servido como **arquivos estáticos** pelo Nginx, não como aplicação Node.js em desenvolvimento!

### Passo 1: Parar Frontend PM2 (na VPS)

```bash
# SSH na VPS
ssh root@construmega.online

# Entrar no diretório
cd /var/www/site

# Parar o processo
pm2 stop construmega-frontend

# Remover do PM2
pm2 delete construmega-frontend

# Salvar configuração
pm2 save

# Verificar que foi removido
pm2 list
```

### Passo 2: Construir Frontend para Produção (Local)

No seu PC local:

```bash
cd frontend
npm run build
```

Isso cria `/frontend/build/` com arquivos estáticos.

### Passo 3: Enviar Build para VPS

```powershell
# No PowerShell local
scp -r frontend/build root@construmega.online:/var/www/site/frontend/

# OU com git (mais eficiente)
cd C:\Users\MegaGiga\Desktop\Construmega-Backup-main\Construmega-Backup-main
git add backend/index.js
git commit -m "Corrigir fs.existsSync e parar frontend PM2"
git push origin main

# Na VPS
cd /var/www/site
git pull origin main
npm run build --prefix frontend
```

### Passo 4: Verificar Estrutura na VPS

```bash
# Na VPS
ls -la /var/www/site/frontend/build/

# Deve mostrar: index.html, static/, favicon.ico, etc.
```

### Passo 5: Verificar Nginx

```bash
# Na VPS
sudo nginx -t

# Deve retornar: syntax ok, configuration successful

sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### Passo 6: Testar

```bash
# No browser ou curl
curl -I https://construmega.online/

# Deve retornar: HTTP 200 com Content-Type: text/html

# Testar imagens
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg

# Deve retornar: HTTP 200 com Content-Type: image/jpeg
```

## RESULTADO ESPERADO

- ✅ Frontend carrega via Nginx como arquivos estáticos
- ✅ React roda no navegador, não no servidor
- ✅ Nginx proxeia /api/ para Node.js backend
- ✅ Nginx proxeia /imagens/ para Node.js backend
- ✅ Sem erro "allowedHosts"
- ✅ Sem processo PM2 frontend rodando

## VERIFICAR BACKEND

O backend também teve correções no `fs.existsSync`:

```bash
# Na VPS, verificar se backend está OK
pm2 logs construmega-backend | tail -20

# Não deve aparecer: "fs.existsSync is not a function"
```

Se ainda tiver erro fs no backend, reiniciar:

```bash
pm2 restart construmega-backend
pm2 logs construmega-backend
```
