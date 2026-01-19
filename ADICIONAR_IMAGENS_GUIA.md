# 📸 GUIA: Como Adicionar Imagens aos Produtos

## ✅ Passo 1: Encontre onde as imagens serão armazenadas

A pasta agora está em:
```
backend/public/imagens/produtos/
```

## ✅ Passo 2: Coloque suas imagens nessa pasta

Exemplo:
```
backend/public/imagens/produtos/
├── esmerilhadeira.jpg
├── esmerilhadeira-2.jpg
├── martelo.jpg
└── chave-inglesa.png
```

## ✅ Passo 3: Atualize o arquivo `backend/produtos.json`

Abra `backend/produtos.json` e modifique cada produto, adicionando o campo `imagens`:

### Antes (SEM imagens):
```json
{
  "id": "4",
  "nome": "ESMERILHADEIRA ELÉTRICA MEE 750W 4 1/2\"",
  "moeda": "real",
  "preco": 219.90,
  "imagens": []
}
```

### Depois (COM imagens):
```json
{
  "id": "4",
  "nome": "ESMERILHADEIRA ELÉTRICA MEE 750W 4 1/2\"",
  "moeda": "real",
  "preco": 219.90,
  "imagens": [
    "/imagens/produtos/esmerilhadeira.jpg",
    "/imagens/produtos/esmerilhadeira-2.jpg"
  ]
}
```

## ✅ Passo 4: Salve e reinicie o servidor

```bash
# No terminal do backend
npm start
# ou
node index.js
```

## ✅ Passo 5: Deploy na VPS (se necessário)

```bash
cd /var/www/site
git pull origin main
cd backend
npm install
# Copiar imagens para a VPS
scp -r ./public/imagens root@construmega.online:/var/www/site/backend/
pm2 restart all
```

## 📝 Exemplo Completo

Se você tem a imagem do esmerilhador como `esmerilhadeira-1.jpg`:

1. **Copie a imagem** para `backend/public/imagens/produtos/`
2. **Edite o produto** em `backend/produtos.json`:

```json
{
  "id": "4",
  "nome": "ESMERILHADEIRA ELÉTRICA MEE 750W 4 1/2\"",
  "descricao": "Esmerilhadeira potente para uso profissional",
  "unidade": "un",
  "moeda": "real",
  "preco": 219.90,
  "codigoBarras": "000000000004",
  "foto": null,
  "inativo": false,
  "promo": true,
  "estoque": 5,
  "imagens": ["/imagens/produtos/esmerilhadeira-1.jpg"],
  "reservado": 0
}
```

3. **Acesse**: `http://localhost/produto-venda/4` (ou na VPS: `http://construmega.online/produto-venda/4`)

✅ A imagem aparecerá!

## 🎯 Dica: Como fazer URL da imagem aparecer no navegador

Para testar se a URL da imagem está correta:

```
http://localhost:3001/imagens/produtos/esmerilhadeira-1.jpg
```

Se a imagem aparecer, está tudo certo! 

## ⚠️ Erros Comuns

### ❌ Imagem não aparece
- Verifique o caminho em `produtos.json`
- Verifique se o arquivo existe na pasta `backend/public/imagens/produtos/`
- Verifique se o servidor reiniciou após as mudanças

### ❌ Erro 404 ao acessar URL
- Verifique se a rota `/imagens` está ativada no backend (já está ✅)
- Verifique o caminho da imagem em `produtos.json`

### ❌ Imagem com caracteres especiais
- Use nomes em inglês: `esmerilhadeira-1.jpg` não `esmerilhadeira-açúcar.jpg`
- Use apenas letras, números, hífen e underscore

## 🚀 Resumo Rápido

1. Imagem vai em: `backend/public/imagens/produtos/`
2. URL fica: `/imagens/produtos/nome-da-imagem.jpg`
3. Adiciona em `produtos.json` no array `imagens`
4. Pronto! ✅
