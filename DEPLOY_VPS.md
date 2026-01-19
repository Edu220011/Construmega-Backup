# 🚀 Guia de Deploy - Construmega VPS

## 📋 Pré-requisitos

### Na sua VPS:
- Ubuntu/Debian Server 20.04+ ou CentOS/RHEL 8+
- Acesso root ou sudo
- Pelo menos 2GB RAM, 20GB disco
- Node.js 16+ instalado
- Git instalado
- Nginx instalado

### Credenciais necessárias:
- IP da VPS
- Usuário SSH (normalmente `root`)
- Senha ou chave SSH
- Domínio configurado (construmega.online)

---

## 🔧 Passo 1: Conectar à VPS

```bash
# Conectar via SSH
ssh root@construmega.online

# Ou se usar chave SSH:
ssh -i sua-chave.pem root@construmega.online
```

---

## 📦 Passo 2: Atualizar o Sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# ou
sudo dnf update -y
```

---

## 🟢 Passo 3: Instalar Node.js e Git

```bash
# Ubuntu/Debian - Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL - Instalar Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar Git (se não estiver instalado)
sudo apt install git -y  # Ubuntu/Debian
sudo yum install git -y  # CentOS/RHEL

# Instalar PM2 para gerenciar processos
sudo npm install -g pm2
```

---

## 📁 Passo 4: Clonar o Repositório

```bash
# Criar diretório do projeto
mkdir -p /var/www
cd /var/www

# Clonar o repositório
git clone https://github.com/Edu220011/Construmega-Backup.git construmega

# Entrar no diretório
cd construmega
```

---

## ⚙️ Passo 5: Configurar o Backend

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo de configuração do Mercado Pago
nano .env
```

**Conteúdo do arquivo `.env`:**
```env
MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MP_PUBLIC_KEY=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

```bash
# Salvar e sair (Ctrl+X, Y, Enter)

# Testar se o backend inicia
npm start
# Deve aparecer: "Servidor backend rodando na porta 3000"
# Parar com Ctrl+C
```

---

## ⚙️ Passo 6: Configurar o Frontend

```bash
# Voltar para a raiz do projeto
cd ..

# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Build de produção
npm run build

# Verificar se o build foi criado
ls -la build/
```

---

## 🌐 Passo 7: Instalar e Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y  # Ubuntu/Debian
sudo yum install nginx -y  # CentOS/RHEL

# Criar configuração do site
sudo nano /etc/nginx/sites-available/construmega
```

**Conteúdo do arquivo de configuração Nginx:**
```nginx
server {
    listen 80;
    server_name construmega.online www.construmega.online;

    # Logs
    access_log /var/log/nginx/construmega_access.log;
    error_log /var/log/nginx/construmega_error.log;

    # Frontend (React build)
    location / {
        root /var/www/construmega/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
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

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/construmega /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔄 Passo 8: Iniciar Serviços com PM2

```bash
# Voltar para a pasta backend
cd /var/www/construmega/backend

# Iniciar backend com PM2
pm2 start index.js --name "construmega-backend"

# Salvar configuração PM2
pm2 save
pm2 startup

# Verificar status
pm2 status
pm2 logs construmega-backend
```

---

## 🔒 Passo 9: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado SSL
sudo certbot --nginx -d construmega.online -d www.construmega.online

# Seguir as instruções na tela
# Escolher redirect HTTP para HTTPS
```

---

## 🔧 Passo 10: Configurações Adicionais

### Firewall (UFW - Ubuntu/Debian)
```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Verificar status
sudo ufw status
```

### Firewall (firewalld - CentOS/RHEL)
```bash
# Habilitar firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Permitir portas
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# Recarregar
sudo firewall-cmd --reload
```

---

## 📊 Passo 11: Monitoramento e Logs

```bash
# Verificar se os serviços estão rodando
sudo systemctl status nginx
pm2 status

# Ver logs
pm2 logs construmega-backend
sudo tail -f /var/log/nginx/construmega_access.log
sudo tail -f /var/log/nginx/construmega_error.log

# Monitorar recursos
htop
# ou
top
```

---

## 🔄 Passo 12: Atualização do Projeto

```bash
# Entrar no diretório do projeto
cd /var/www/construmega

# Puxar atualizações
git pull origin master

# Reiniciar serviços
cd backend
pm2 restart construmega-backend

cd ../frontend
npm run build

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🚨 Solução de Problemas

### Backend não inicia:
```bash
cd /var/www/construmega/backend
npm install
pm2 start index.js --name "construmega-backend"
```

### Frontend não carrega:
```bash
cd /var/www/construmega/frontend
npm install
npm run build
sudo systemctl reload nginx
```

### Porta 80/443 bloqueada:
```bash
# Verificar portas abertas
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Verificar firewall
sudo ufw status
sudo firewall-cmd --list-all
```

### Erro 502 Bad Gateway:
- Verificar se o backend está rodando na porta 3000
- Verificar configuração do proxy no Nginx
- Verificar logs: `pm2 logs construmega-backend`

---

## ✅ Verificação Final

Após completar todos os passos:

1. **Acesse:** https://construmega.online
2. **Teste login admin:** `admin@admin.com` / `admin`
3. **Verifique APIs:** https://construmega.online/api/produtos
4. **Teste funcionalidades:** Cadastro, produtos, carrinho, etc.

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `pm2 logs` e `/var/log/nginx/`
2. Teste conectividade: `curl -I https://construmega.online`
3. Verifique processos: `ps aux | grep node`

**🎉 Deploy concluído! Construmega.online está no ar!**