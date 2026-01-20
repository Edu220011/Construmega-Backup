# 🚀 COMANDOS PARA ATUALIZAR NA VPS

## ⚡ RÁPIDO (Copie e Cole)

```bash
# 1. Conectar na VPS
ssh root@construmega.online

# 2. Fazer backup do Nginx
sudo cp /etc/nginx/sites-available/construmega /etc/nginx/sites-available/construmega.backup.$(date +%Y%m%d_%H%M%S)

# 3. Editar arquivo
sudo nano /etc/nginx/sites-available/construmega

# 4. Procure por:  location /api/ {
# 5. ANTES dessa linha, ADICIONE isso:

    # Imagens de produtos (servidas pelo backend Node.js)
    location /imagens/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache de imagens (1 semana)
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

# 6. Salve: Ctrl+X, Y, Enter

# 7. Validar
sudo nginx -t

# 8. Se OK, reiniciar
sudo systemctl restart nginx

# 9. Verificar status
sudo systemctl status nginx

# 10. Testar
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg

# Deve retornar: HTTP/2 200
```

---

## 📋 PASSO A PASSO DETALHADO

### Passo 1: SSH na VPS
```bash
ssh root@construmega.online
```

### Passo 2: Fazer Backup (IMPORTANTE!)
```bash
sudo cp /etc/nginx/sites-available/construmega /etc/nginx/sites-available/construmega.backup.$(date +%Y%m%d_%H%M%S)

# Verificar se backup foi criado
ls -la /etc/nginx/sites-available/construmega.backup*
```

### Passo 3: Abrir Arquivo
```bash
sudo nano /etc/nginx/sites-available/construmega
```

### Passo 4: Encontrar a Linha Correta

**Procure por esta linha:**
```nginx
    # Backend API (proxy para Node.js)
    location /api/ {
```

### Passo 5: Inserir Novo Bloco

**ANTES de `location /api/ {`, adicione:**

```nginx
    # Imagens de produtos (servidas pelo backend Node.js)
    location /imagens/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache de imagens (1 semana)
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
```

**Resultado esperado:**
```nginx
    # Imagens de produtos (servidas pelo backend Node.js)
    location /imagens/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Backend API (proxy para Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
        # ... resto do código
    }
```

### Passo 6: Salvar Arquivo
```
Ctrl+X
Y
Enter
```

### Passo 7: Validar Sintaxe
```bash
sudo nginx -t
```

**Resultado esperado:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration will be successful
```

### Passo 8: Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

### Passo 9: Verificar Status
```bash
sudo systemctl status nginx
```

**Deve mostrar:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

---

## 🧪 TESTES

### Teste 1: HTTP Direto (dentro da VPS)
```bash
curl -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 25338
```

### Teste 2: HTTPS via Nginx (de fora)
```bash
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
```

**Resultado esperado:**
```
HTTP/2 200
content-type: image/jpeg
cache-control: public, max-age=604800
expires: ...
```

### Teste 3: No Navegador
1. Acesse: `https://construmega.online/produtos`
2. Clique em um produto que tem imagem
3. A imagem deve aparecer ✅

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Conectado à VPS via SSH
- [ ] Backup criado com sucesso
- [ ] Arquivo `/etc/nginx/sites-available/construmega` aberto
- [ ] Bloco `/imagens/` adicionado ANTES de `/api/`
- [ ] Arquivo salvo (Ctrl+X, Y, Enter)
- [ ] `sudo nginx -t` retorna "configuration will be successful"
- [ ] `sudo systemctl restart nginx` executado com sucesso
- [ ] Status do Nginx é "active (running)"
- [ ] Curl de teste retorna HTTP 200
- [ ] Navegador mostra imagens nos produtos ✅

---

## 🆘 SE ALGO DER ERRADO

### Erro na Sintaxe
```bash
# Se nginx -t retornar erro, restaurar backup
sudo cp /etc/nginx/sites-available/construmega.backup.* /etc/nginx/sites-available/construmega

# Tentar novamente
sudo nginx -t
```

### Nginx não reinicia
```bash
# Ver erro
sudo systemctl status nginx

# Ver log completo
sudo journalctl -u nginx -n 50

# Ou
tail -f /var/log/nginx/error.log
```

### Imagens ainda não aparecem
```bash
# Verificar se backend está rodando
pm2 status
ps aux | grep node

# Se não estiver, reiniciar
pm2 restart construmega-backend

# Ou
cd /root/Construmega/backend && npm start
```

### Permissões das imagens
```bash
# Se tiver problema de acesso
chmod 755 /root/Construmega/backend/public/imagens/produtos/
chmod 644 /root/Construmega/backend/public/imagens/produtos/*
```

---

## 📞 REFERÊNCIAS

- Arquivo editado: `/etc/nginx/sites-available/construmega`
- Serviço reiniciado: `nginx`
- Backend em: `localhost:3000`
- Pasta de imagens: `/root/Construmega/backend/public/imagens/produtos/`

---

## ⏱️ TEMPO ESTIMADO

- **Conexão SSH:** 1 min
- **Backup:** 1 min
- **Edição arquivo:** 3 min
- **Validação e restart:** 2 min
- **Testes:** 3 min
- **Total:** ~10 minutos

---

**Pronto para executar! 🚀**
