# Backend - Sistema de Pontuação e Loja

## 🚀 Configuração do Mercado Pago (OBRIGATÓRIA)

**Status Atual:** ❌ Sistema funcionando, mas pagamentos desabilitados (token inválido)

### 📋 Passo a Passo Completo:

#### 1. **Criar Conta no Mercado Pago**
- Acesse: [https://www.mercadopago.com.br](https://www.mercadopago.com.br)
- Crie uma conta **pessoal** ou **business**
- Complete a verificação de identidade

#### 2. **Criar Aplicação**
- Acesse: [https://www.mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app)
- Clique em **"Criar aplicação"**
- **Nome:** "Sistema de Pontuação" (ou qualquer nome)
- **Tipo:** "Pagamentos" ou "E-commerce"
- **Modo:** 
  - 🧪 **"Sandbox"** (para testes - recomendado primeiro)
  - 💰 **"Produção"** (para vendas reais)

#### 3. **Obter Access Token**
- Na aplicação criada, clique em **"Credenciais"**
- **Para desenvolvimento/testes:** Copie o **"Access Token de Teste"**
- **Para produção:** Copie o **"Access Token"**
- ⚠️ **Importante:** O token começa sempre com `APP_USR-`

#### 4. **Configurar no Sistema**
Edite o arquivo `backend/.env`:
```bash
# ❌ REMOVA esta linha e substitua pela sua chave real
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# ✅ SUBSTITUA por algo como:
MP_ACCESS_TOKEN=APP_USR-12345678901234567890123456789012345678
```

#### 5. **Testar a Configuração**
```bash
# 1. Reinicie o servidor
node index.js

# 2. Teste a criação de pagamento
curl -X POST http://localhost:3000/pagamento/criar \
  -H "Content-Type: application/json" \
  -d '{"produtoId":"1","usuarioId":"729485"}'

# ✅ Resposta esperada (sucesso):
{
  "sucesso": true,
  "preference_id": "123456789-abcdef...",
  "init_point": "https://www.mercadopago.com.br/checkout/...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.br/..."
}

# ❌ Se ainda der erro, verifique o token
```

### 🎯 **Diferença entre Sandbox e Produção:**

| Modo | Quando Usar | Cartões de Teste | Dinheiro Real |
|------|-------------|------------------|---------------|
| **Sandbox** | Desenvolvimento/Testes | ✅ Sim (cartões de teste) | ❌ Não |
| **Produção** | Vendas Reais | ❌ Não | ✅ Sim |

### 🧪 **Cartões de Teste (Sandbox):**
```
Visa: 4235647728025682
Mastercard: 5031433215406351
CPF: 123.456.789-10
```

### ⚠️ **Importante:**
- **Nunca** use tokens de produção para testes
- **Nunca** compartilhe seus tokens
- Mantenha o `.env` fora do controle de versão (git)

---

## Funcionalidades

- ✅ Sistema de usuários e pontos
- ✅ Gerenciamento de produtos
- ✅ Sistema de pedidos (resgate por pontos)
- ✅ Integração Mercado Pago para vendas
- ✅ Webhook para confirmação automática de pagamentos
- ✅ Painel administrativo

## Endpoints da API

### Pagamentos
- `POST /pagamento/criar` - Criar preferência de pagamento
- `POST /pagamento/webhook` - Webhook do Mercado Pago

### Outros endpoints
- `GET /produtos` - Listar produtos
- `GET /usuarios` - Listar usuários
- `POST /pedidos` - Criar pedido
- etc.

## Funcionalidades

- ✅ Sistema de usuários e pontos
- ✅ Gerenciamento de produtos
- ✅ Sistema de pedidos (resgate por pontos)
- ✅ Integração Mercado Pago para vendas
- ✅ Webhook para confirmação automática de pagamentos
- ✅ Painel administrativo

## Endpoints da API

### Pagamentos
- `POST /pagamento/criar` - Criar preferência de pagamento
- `POST /pagamento/webhook` - Webhook do Mercado Pago

### Outros endpoints
- `GET /produtos` - Listar produtos
- `GET /usuarios` - Listar usuários
- `POST /pedidos` - Criar pedido
- etc.