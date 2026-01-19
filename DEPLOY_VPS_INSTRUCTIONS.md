# 🌐 Instruções de Deploy na VPS

## 📋 Resumo
Atualizar `backend/index.js` para converter base64 para URLs na inicialização.

## 🔐 Acesso SSH

```bash
# Conectar na VPS
ssh root@seu-ip-vps

# Ou com chave
ssh -i /caminho/chave.pem root@seu-ip-vps
```

## 📁 Estrutura VPS

```
/root/Construmega/
├── backend/
│   ├── public/
│   │   └── imagens/
│   │       └── produtos/  ← Será criado automaticamente
│   ├── index.js  ← ATUALIZAR
│   ├── produtos.json  ← Será modificado
│   └── ...
├── frontend/
└── ...
```

## 🚀 Processo de Deploy

### 1. Backup (IMPORTANTE!)

```bash
# Entrar na pasta
cd /root/Construmega

# Backup do índex.js
cp backend/index.js backend/index.js.backup.$(date +%Y%m%d_%H%M%S)

# Backup de produtos.json
cp backend/produtos.json backend/produtos.json.backup.$(date +%Y%m%d_%H%M%S)

# Verificar backups criados
ls -la backend/index.js.backup*
ls -la backend/produtos.json.backup*
```

### 2. Parar o Servidor

Se usar **PM2**:
```bash
# Verificar status
pm2 status

# Parar o app
pm2 stop construmega  # Substitua pelo nome do seu app
# ou parar todos
pm2 stop all
```

Se usar **systemd**:
```bash
sudo systemctl stop seu-servico-name
```

Se rodando manual no tmux/screen:
```bash
# Encontrar a sessão
tmux list-sessions

# Entrar na sessão
tmux attach -t 0  # Ou seu número

# Sair: Ctrl+C para parar o servidor
# Sair da sessão: Ctrl+B D
```

Se rodando com `nohup`:
```bash
# Encontrar PID
ps aux | grep "node"

# Matar processo
kill -9 <PID>
```

### 3. Atualizar Arquivo

#### Opção A: Via Git
```bash
cd /root/Construmega

# Se tem repositório remoto
git fetch origin
git checkout main  # ou sua branch
git pull origin main

# Verificar se index.js foi atualizado
git diff HEAD~1 backend/index.js | head -50
```

#### Opção B: Via SCP (do seu PC)
```bash
# No seu PC, na pasta com os arquivos
scp backend/index.js root@seu-ip:/root/Construmega/backend/

# Ou com chave
scp -i /caminho/chave.pem backend/index.js root@seu-ip:/root/Construmega/backend/
```

#### Opção C: Copiar Manualmente
```bash
# Na VPS, criar arquivo novo
nano backend/index.js

# Colar conteúdo do novo index.js
# Salvar: Ctrl+O, Enter, Ctrl+X
```

### 4. Verificar Arquivo

```bash
# Verificar se arquivo foi atualizado
ls -la backend/index.js

# Verificar data de modificação (deve ser recente)
stat backend/index.js
```

### 5. Reiniciar Servidor

Se usar **PM2**:
```bash
# Reiniciar app específico
pm2 restart construmega  # Substitua pelo nome

# Ou reiniciar todos
pm2 restart all

# Verificar status
pm2 status

# Ver logs
pm2 logs construmega  # Espere 5-10 segundos
```

Se usar **npm start**:
```bash
# Entrar na pasta
cd /root/Construmega

# Iniciar (assumindo npm start funciona)
npm start

# Ou especificar
node backend/index.js
```

Se usar **systemd**:
```bash
sudo systemctl start seu-servico-name
sudo systemctl status seu-servico-name
```

### 6. Verificar Logs

```bash
# Se PM2
pm2 logs construmega

# Procure por:
# ✅ Imagem salva: /imagens/produtos/1_0.jpeg
# ✅ Base64 convertido para URLs na inicialização

# Se manual
# Veja no console direto
```

## 🔍 Validar Deploy

### 1. Verificar Pasta de Imagens

```bash
# Verificar se pasta foi criada
ls -la backend/public/imagens/produtos/

# Deve mostrar algo como:
# -rw-r--r-- 1 root root 12345 Dec 25 14:30 1_0.jpeg
# -rw-r--r-- 1 root root 12345 Dec 25 14:30 1_1.jpeg
```

### 2. Verificar Arquivo JSON

```bash
# Primeiro, fazer backup se não fez ainda
cp backend/produtos.json backend/produtos.json.before

# Ver primeiras imagens
grep -A 1 "imagens" backend/produtos.json | head -10

# Deve mostrar URLs, não base64:
# "imagens": [
# "/imagens/produtos/1_0.jpeg"
```

### 3. Testar via API

```bash
# Testar se servidor está respondendo
curl -s http://localhost:3000/api/produtos/1 | jq '.imagens'

# Deve retornar:
# ["/imagens/produtos/1_0.jpeg"]

# Se receber base64 ainda, servidor não foi recarregado
```

### 4. Testar Arquivo Direto

```bash
# Verificar se arquivo é acessível
curl -I http://localhost:3000/imagens/produtos/1_0.jpeg

# Esperado:
# HTTP/1.1 200 OK
# Content-Type: image/jpeg

# Se 404:
# HTTP/1.1 404 Not Found
# → Verificar se arquivo existe e caminho está correto
```

### 5. Testar no Navegador

```bash
# Acessar a página do produto
https://construmega.online/produto-venda/1

# Esperar imagem aparecer
# Se não aparecer:
# - Abrir DevTools (F12)
# - Aba Network
# - Procure por requisição de imagem
# - Verificar se retorna 200 ou 404
```

## ⚙️ Verificação Avançada

### Verificar Espaço em Disco
```bash
# Ver espaço disponível
df -h

# Verificar tamanho de produtos.json
du -h backend/produtos.json

# Verificar tamanho total de imagens
du -h backend/public/imagens/
```

### Verificar Permissões
```bash
# Ver permissões da pasta
ls -ld backend/public/imagens/produtos/

# Deve mostrar:
# drwxr-xr-x ... root root

# Se precisar ajustar
chmod 755 backend/public/imagens/produtos/
chmod 644 backend/public/imagens/produtos/*
```

### Verificar Processo Node
```bash
# Ver todos os processos node
ps aux | grep node

# Ver consumo de memória
top -p $(pgrep -f "node")  # Pressione Q para sair

# Ver arquivos abertos
lsof -p $(pgrep -f "node") | grep imagens
```

## 🐛 Solução de Problemas

### Problema: Imagens ainda não aparecem

```bash
# 1. Verificar se arquivo foi realmente atualizado
md5sum backend/index.js
# Deve ser diferente do backup

# 2. Verificar se servidor está rodando novo código
ps aux | grep node
# Deve mostrar processo recente

# 3. Se usar PM2, pode ser cache
pm2 restart --force construmega

# 4. Verificar logs com mais detalhes
pm2 logs construmega --lines 100 --err
```

### Problema: Erro de permissão

```bash
# Se receber erro "EACCES: permission denied"

# 1. Verificar dono dos arquivos
ls -la backend/

# 2. Se necessário, ajustar permissões
sudo chown -R $(whoami) backend/public/

# 3. Criar pasta se não existe
mkdir -p backend/public/imagens/produtos
```

### Problema: Disco cheio

```bash
# Verificar espaço
df -h

# Se próximo de 100%, limpar
# 1. Deletar logs antigos
rm /var/log/old-logs/*

# 2. Limpar cache
apt-get clean

# 3. Verificar imagens grandes
find backend/public/imagens/ -size +10M
```

### Problema: Porta em uso

```bash
# Se porta 3000 está em uso
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta em index.js
```

## 📊 Relatório de Validação

Depois de deploy, preencha este checklist:

```
Processo de Deploy
☐ Backup criado de index.js
☐ Backup criado de produtos.json
☐ Servidor parado corretamente
☐ Arquivo atualizado
☐ Servidor reiniciado
☐ Logs mostram conversão

Validação
☐ Pasta /imagens/produtos/ criada
☐ Arquivos .jpeg/.png em /imagens/produtos/
☐ produtos.json contém /imagens/produtos/ em vez de base64
☐ API retorna URLs
☐ Arquivo direto acessível (200 OK)
☐ Imagem aparece no navegador
☐ DevTools não mostra erros

Funcionamento
☐ Produto antigo com imagem carrega
☐ Novo produto pode ser criado com imagem
☐ Edição de produto funciona
☐ Múltiplas imagens por produto funcionam
```

## 📞 Rollback (Se Necessário)

Se algo der errado:

```bash
# 1. Parar servidor
pm2 stop construmega

# 2. Restaurar backup
cp backend/index.js.backup.* backend/index.js

# 3. Restaurar JSON se necessário
cp backend/produtos.json.backup.* backend/produtos.json

# 4. Reiniciar
pm2 restart construmega

# 5. Verificar
pm2 logs construmega
```

## 📝 Notas Importantes

1. **Backup é crítico**: Sempre faça antes de qualquer mudança
2. **Validação é obrigatória**: Sempre teste depois de deploy
3. **Logs são amigos**: Verifique sempre os logs
4. **Dados são ouro**: Nunca delete sem ter backup
5. **Performance**: Monitorar após deploy

## 🎯 Próximos Passos

1. ✅ Atualizar arquivo
2. ✅ Validar em VPS
3. ✅ Testar em https://construmega.online
4. ✅ Solicitar cliente validar
5. ✅ Documentar em produção

---

**Boa sorte com o deploy! 🚀**
