# ⚡ COMANDOS CORRETOS - PASSO MANUAL

## Estrutura Correta na VPS

```
/var/www/site/
├── backend/
│   ├── public/
│   │   └── imagens/
│   │       └── produtos/  ← Imagens aqui
│   └── index.js
├── frontend/
└── ...
```

---

## 🚀 PASSO A PASSO (Manual)

### 1️⃣ Conectar na VPS
```bash
ssh root@construmega.online
```

### 2️⃣ Fazer backup do Nginx
```bash
sudo cp /etc/nginx/sites-available/construmega /etc/nginx/sites-available/construmega.bak
echo "✅ Backup criado"
```

### 3️⃣ Editar arquivo Nginx
```bash
sudo nano /etc/nginx/sites-available/construmega
```

### 4️⃣ Procure por esta linha
Use `Ctrl+W` e procure por:
```
    # Backend API (proxy para Node.js)
    location /api/ {
```

### 5️⃣ Posicione o cursor ANTES dessa linha

Pressione `Ctrl+A` e vá para a linha anterior

### 6️⃣ ADICIONE esta seção:

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

### 7️⃣ Salve o arquivo
```
Ctrl+X → Y → Enter
```

### 8️⃣ Validate a sintaxe
```bash
sudo nginx -t
```

**Resultado esperado:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration will be successful
```

### 9️⃣ Reinicie Nginx
```bash
sudo systemctl restart nginx
```

### 🔟 Verifique o status
```bash
sudo systemctl status nginx
```

**Deve mostrar:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running)
```

---

## 🧪 TESTES

### Teste 1: Backend local
```bash
curl -I http://localhost:3000/imagens/produtos/1_imagem_0.jpeg
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
```

### Teste 2: Via Nginx
```bash
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
```

**Resultado esperado:**
```
HTTP/2 200
```

### Teste 3: No navegador
1. Abra: `https://construmega.online/produtos`
2. Clique em um produto que tem imagem
3. A imagem deve aparecer ✅

---

## 📁 Caminhos Importantes

```bash
# Verificar imagens em disco
ls -la /var/www/site/backend/public/imagens/produtos/

# Verificar se URLs estão em produtos.json
grep "/imagens/produtos/" /var/www/site/backend/produtos.json | head -3

# Se tiver problema de permissões
chmod 755 /var/www/site/backend/public/imagens/produtos/
chmod 644 /var/www/site/backend/public/imagens/produtos/*
```

---

## 🆘 SE PRECISAR RESTAURAR

```bash
sudo cp /etc/nginx/sites-available/construmega.bak /etc/nginx/sites-available/construmega
sudo systemctl restart nginx
echo "✅ Restaurado"
```

---

## ✅ CHECKLIST

- [ ] Conectado à VPS
- [ ] Backup criado
- [ ] Arquivo aberto em nano
- [ ] Procurou por "location /api/"
- [ ] Adicionou bloco /imagens/ ANTES de /api/
- [ ] Salvou arquivo (Ctrl+X, Y, Enter)
- [ ] `sudo nginx -t` OK
- [ ] `sudo systemctl restart nginx` OK
- [ ] Status do Nginx é "active (running)"
- [ ] Teste HTTP retorna 200
- [ ] Navegador mostra imagens ✅

---

**Pronto! Tudo com caminhos corretos: `/var/www/site/` 🚀**
