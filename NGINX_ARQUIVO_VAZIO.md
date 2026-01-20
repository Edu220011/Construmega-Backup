# 🔧 ARQUIVO NGINX VAZIO - COMO PREENCHER

O arquivo `/etc/nginx/sites-available/construmega` está vazio. Vou mostrar como preenchê-lo.

---

## ⚡ OPÇÃO 1: COPIAR E COLAR (Mais fácil)

### 1️⃣ Na VPS, abra o arquivo
```bash
sudo nano /etc/nginx/sites-available/construmega
```

### 2️⃣ Copie TODO este conteúdo abaixo:

```nginx
server {
    listen 80;
    server_name construmega.online www.construmega.online;

    # Logs
    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;

    # Frontend (React build)
    location / {
        root /var/www/site/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

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

    # Backend API (proxy para Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Outras rotas da API
    location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3️⃣ Cole no nano
- Clique com botão direito na janela do terminal
- Ou Ctrl+Shift+V

### 4️⃣ Salve
```
Ctrl+X → Y → Enter
```

---

## ⚡ OPÇÃO 2: USAR CURL PARA PREENCHER

```bash
ssh root@construmega.online

# Download do arquivo correto do GitHub
sudo curl -o /etc/nginx/sites-available/construmega https://raw.githubusercontent.com/Edu220011/Construmega-Backup/main/nginx_construmega.conf

# Verificar se foi criado
cat /etc/nginx/sites-available/construmega

# Se tiver conteúdo, validar
sudo nginx -t

# Se OK, reiniciar
sudo systemctl restart nginx
```

---

## ⚡ OPÇÃO 3: CAT COM HERE DOCUMENT

```bash
ssh root@construmega.online

# Copie e execute isso (tudo junto):
sudo cat > /etc/nginx/sites-available/construmega << 'EOF'
server {
    listen 80;
    server_name construmega.online www.construmega.online;

    # Logs
    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;

    # Frontend (React build)
    location / {
        root /var/www/site/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

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

    # Backend API (proxy para Node.js)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Outras rotas da API
    location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

---

## ✅ APÓS PREENCHER

```bash
# 1. Verificar conteúdo
cat /etc/nginx/sites-available/construmega

# Deve mostrar o bloco "server { ... }"

# 2. Criar link simbólico (se não existir)
sudo ln -s /etc/nginx/sites-available/construmega /etc/nginx/sites-enabled/construmega 2>/dev/null || echo "Link já existe"

# 3. Remover configuração padrão (se existir)
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || echo "Arquivo padrão não existe"

# 4. Validar
sudo nginx -t

# Resultado esperado:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration will be successful

# 5. Reiniciar
sudo systemctl restart nginx

# 6. Verificar status
sudo systemctl status nginx

# Deve mostrar: Active: active (running)
```

---

## 🧪 TESTES

```bash
# 1. Teste de imagens
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
# HTTP/2 200 ✅

# 2. Teste de API
curl -I https://construmega.online/api/produtos
# HTTP/2 200 ✅

# 3. Teste de frontend
curl -I https://construmega.online/
# HTTP/2 200 ✅
```

---

## 🎯 RESUMO RÁPIDO

**Recomendo:** OPÇÃO 2 (Curl) - rápida e segura

```bash
ssh root@construmega.online
sudo curl -o /etc/nginx/sites-available/construmega https://raw.githubusercontent.com/Edu220011/Construmega-Backup/main/nginx_construmega.conf
sudo nginx -t
sudo systemctl restart nginx
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
```

---

**Escolha uma opção e execute! 🚀**
