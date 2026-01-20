# ⚡ COMANDOS RÁPIDOS - COPY & PASTE

## Opção 1: Automático (Script)

```bash
# SSH na VPS
ssh root@construmega.online

# Download do script
cd ~
wget https://raw.githubusercontent.com/Edu220011/Construmega-Backup/main/atualizar-imagens-nginx.sh

# Executar
bash atualizar-imagens-nginx.sh
```

**Vantagem:** Automático, rápido, com verificações
**Tempo:** 2 minutos

---

## Opção 2: Manual (Passo a Passo)

### 1️⃣ Conectar na VPS
```bash
ssh root@construmega.online
```

### 2️⃣ Fazer backup
```bash
sudo cp /etc/nginx/sites-available/construmega /etc/nginx/sites-available/construmega.bak
```

### 3️⃣ Editar arquivo
```bash
sudo nano /etc/nginx/sites-available/construmega
```

### 4️⃣ Procure por esta linha (use Ctrl+W):
```
    # Backend API (proxy para Node.js)
    location /api/ {
```

### 5️⃣ Posicione o cursor ANTES dessa linha (linha acima)

### 6️⃣ Adicione isto:
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

```

### 7️⃣ Salve (Ctrl+X, Y, Enter)

### 8️⃣ Valide
```bash
sudo nginx -t
```

**Resultado esperado:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration will be successful
```

### 9️⃣ Reinicie
```bash
sudo systemctl restart nginx
```

### 🔟 Teste
```bash
curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
```

**Resultado esperado:**
```
HTTP/2 200
```

**Vantagem:** Tem controle total
**Tempo:** 10 minutos

---

## Opção 3: Muito Rápido (Sed - Uma Linha)

```bash
ssh root@construmega.online

# Fazer backup
sudo cp /etc/nginx/sites-available/construmega /etc/nginx/sites-available/construmega.bak

# Inserir configuração (todo em uma linha, copie tudo)
sudo sed -i '/location \/api\/ {/i\    # Imagens de produtos (servidas pelo backend Node.js)\n    location \/imagens\/ {\n        proxy_pass http:\/\/localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        \n        expires 7d;\n        add_header Cache-Control "public, max-age=604800";\n    }\n' /etc/nginx/sites-available/construmega

# Validar e reiniciar
sudo nginx -t && sudo systemctl restart nginx && echo "✅ Concluído!"
```

**Vantagem:** Rápido e automatizado
**Tempo:** 2 minutos
**Risco:** Moderado (se algo der errado, restaure com: `sudo cp /etc/nginx/sites-available/construmega.bak /etc/nginx/sites-available/construmega`)

---

## 🎯 MINHA RECOMENDAÇÃO

### Se quer **garantia e segurança** → Opção 2 (Manual)
### Se quer **rápido e simples** → Opção 1 (Script automático)
### Se quer **muito rápido** → Opção 3 (Sed)

---

## ✅ APÓS A ATUALIZAÇÃO

1. **Teste imediatamente:**
   ```bash
   curl -I https://construmega.online/imagens/produtos/1_imagem_0.jpeg
   ```

2. **Abra no navegador:**
   ```
   https://construmega.online/produtos
   ```

3. **Clique em um produto com foto**
   - Deve aparecer a imagem ✅

4. **Se algo der errado, restaure:**
   ```bash
   sudo cp /etc/nginx/sites-available/construmega.bak /etc/nginx/sites-available/construmega
   sudo systemctl restart nginx
   ```

---

## 📞 VERIFICAÇÃO RÁPIDA

```bash
# Está no arquivo?
sudo grep -A 5 "location /imagens/" /etc/nginx/sites-available/construmega

# Status do Nginx
sudo systemctl status nginx

# Teste HTTP
curl -v https://construmega.online/imagens/produtos/1_imagem_0.jpeg 2>&1 | head -20
```

---

**Escolha uma opção acima e execute! 🚀**
