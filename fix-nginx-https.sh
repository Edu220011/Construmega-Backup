#!/bin/bash

# Fix Nginx HTTPS - Adicionar bloco listen 443 ao nginx.conf
# Execute: bash /var/www/site/fix-nginx-https.sh

echo "🔧 Corrigindo Nginx HTTPS..."

# Backup
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%s)

# Adicionar bloco HTTPS antes do include sites-enabled
sudo tee /etc/nginx/nginx.conf > /dev/null << 'NGINX_CONF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # ===== CONSTRUMEGA =====
    server {
        listen 80;
        server_name construmega.online www.construmega.online;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name construmega.online www.construmega.online;

        ssl_certificate /etc/letsencrypt/live/construmega.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/construmega.online/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        access_log /var/log/nginx/construmega_access.log main;
        error_log /var/log/nginx/construmega_error.log;

        location /imagens/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            expires 7d;
        }

        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave) {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /var/www/site/frontend/build;
            expires 1y;
        }

        location / {
            root /var/www/site/frontend/build;
            try_files $uri $uri/ /index.html;
        }
    }

    include /etc/nginx/conf.d/*.conf;
}
NGINX_CONF

echo "✅ Arquivo nginx.conf atualizado"

# Validar
echo "🔍 Validando..."
sudo nginx -t

# Reiniciar
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# Verificar portas
echo ""
echo "📊 Portas ouvindo:"
sudo netstat -tlnp 2>/dev/null | grep nginx || sudo ss -tlnp | grep nginx

# Testar
echo ""
echo "🧪 Testando HTTPS:"
curl -I https://localhost/ 2>/dev/null | head -1
curl -I https://construmega.online/ 2>/dev/null | head -1

echo ""
echo "✅ HTTPS DEVE ESTAR FUNCIONANDO AGORA!"
