# 📁 Pasta de Imagens dos Produtos

## Como usar:

### 1. Adicionar imagens aqui
Coloque as imagens dos produtos nesta pasta:
```
backend/public/imagens/produtos/
├── produto-1.jpg
├── produto-2.png
├── esmerilhadeira.jpg
└── ...
```

### 2. Atualizar o `produtos.json`
Adicione os nomes dos arquivos no array `imagens`:

```json
{
  "id": "4",
  "nome": "ESMERILHADEIRA ELÉTRICA MEE 750W 4 1/2\"",
  "moeda": "real",
  "preco": 219.90,
  "imagens": [
    "/imagens/produtos/esmerilhadeira.jpg",
    "/imagens/produtos/esmerilhadeira-2.jpg"
  ],
  ...
}
```

### 3. As imagens aparecerão automaticamente!

## Formatos suportados:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`
- `.svg`

## Estrutura de pasta recomendada:
```
backend/public/imagens/produtos/
├── 1-maça-1.jpg
├── 1-maça-2.jpg
├── 4-esmerilhadeira.jpg
├── 4-esmerilhadeira-2.jpg
└── ...
```

## Dicas:
- Use nomes descritivos com ID do produto
- Mantenha imagens em alta qualidade (min 380x380px para mostrar bem)
- Comprima imagens para reduzir tamanho (use https://tinypng.com/)
