# Corrigir Dados da Empresa não Aparecendo - Solução Rápida VPS

## Problema
O endpoint `/configuracoes` estava retornando HTML em vez de JSON porque não estava incluído nas rotas proxiadas do Nginx.

## Solução em 3 passos

### Passo 1: Atualizar repositório
```bash
cd /var/www/site
git pull origin main
```

### Passo 2: Aplicar correção do Nginx
```bash
bash fix-configuracoes-nginx.sh
```

O script vai:
- ✅ Fazer backup do nginx.conf
- ✅ Adicionar `/configuracoes` à lista de rotas proxiadas
- ✅ Testar configuração
- ✅ Recarregar Nginx

### Passo 3: Limpar cache do navegador e recarregar

Abra seu navegador e pressione `Ctrl+Shift+R` para limpar o cache, depois acesse:
```
https://construmega.online
```

## Verificar Solução
```bash
# Testar se endpoint está retornando JSON
curl -s https://construmega.online/configuracoes | jq .

# Deve retornar JSON como:
# {
#   "nomeEmpresa": "CONSTRUMEGA",
#   "endereco": "Av. Henrique Agostineto, 502A - Várzea, Caconde/SP.",
#   ...
# }
```

## Detalhes Técnicos

**Raiz do problema**: O Nginx estava interceptando `/configuracoes` e servindo a página React (index.html) em vez de proxiar para o backend.

**Arquivo modificado**: `/etc/nginx/nginx.conf`

**Mudança**: Adicionada `|configuracoes` ao regex de rotas proxiadas:
```
# ANTES:
location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave)

# DEPOIS:
location ~ ^/(login|usuarios|produtos|pedidos|resgates|pagamento|chave|configuracoes)
```

Isso garante que requisições para `/configuracoes` sejam encaminhadas ao backend Node.js (localhost:3000) em vez de serem respondidas pela página React.
