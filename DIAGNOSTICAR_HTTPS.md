# 🔐 PROBLEMA: HTTPS Não Responde (Porta 443)

## Sintoma

```
curl: (7) Failed to connect to construmega.online port 443: Connection refused
```

## Causa Provável

1. ❌ Certificado SSL expirado
2. ❌ Nginx não ouvindo na porta 443
3. ❌ Firewall bloqueando porta 443
4. ❌ Arquivo de configuração SSL incorreto

## Diagnóstico Rápido

Execute **NA VPS**:

```bash
bash /var/www/site/diagnosticar-https.sh
```

Ou manualmente:

### Passo 1: Verificar se Nginx está rodando

```bash
sudo systemctl status nginx

# Esperado: Active (running)
```

### Passo 2: Verificar portas abertas

```bash
sudo netstat -tlnp | grep nginx

# Esperado:
# tcp  0  0 0.0.0.0:80    0.0.0.0:*  LISTEN
# tcp  0  0 0.0.0.0:443   0.0.0.0:*  LISTEN
```

### Passo 3: Verificar certificado SSL

```bash
sudo certbot certificates

# Esperado: Certificate is valid
# Se expirado: EXPIRED - need to renew
```

### Passo 4: Renovar certificado (se necessário)

```bash
sudo certbot renew

# Ou forçar:
sudo certbot renew --force-renewal
```

### Passo 5: Validar configuração Nginx

```bash
sudo nginx -T | grep -A 20 "listen 443"

# Esperado: ver bloco server com listen 443
```

### Passo 6: Testar HTTPS

```bash
# Localhost
curl -I --insecure https://localhost/

# Esperado: HTTP 200

# Remoto
curl -I https://construmega.online/

# Esperado: HTTP 200
```

## Se Certificado Expirou

```bash
# Renovar agora
sudo certbot renew --force-renewal

# Reiniciar Nginx
sudo systemctl restart nginx

# Testar
curl -I https://construmega.online/
```

## Se Porta 443 Não Está Aberta

```bash
# Verificar firewall
sudo ufw status

# Se ativo, liberar HTTPS
sudo ufw allow 443

# Liberar HTTP também
sudo ufw allow 80

# Recarregar
sudo ufw reload
```

## Se Arquivo de Config Está Errado

```bash
# Ver arquivo
sudo cat /etc/nginx/sites-available/construmega

# Deve ter um bloco como:
# server {
#     listen 443 ssl http2;
#     server_name construmega.online;
#     ssl_certificate /etc/letsencrypt/live/construmega.online/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/construmega.online/privkey.pem;
#     ...
# }
```

## Solução Rápida - Executar Tudo

```bash
# 1. Renovar certificado
sudo certbot renew --force-renewal

# 2. Validar Nginx
sudo nginx -t

# 3. Reiniciar Nginx
sudo systemctl restart nginx

# 4. Testar
curl -I https://construmega.online/
```

Se depois disso HTTPS não funcionar, pode ser firewall ou certificado não instalado.
