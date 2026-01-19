const fs = require('fs');
const path = require('path');

// Caminho dos arquivos
const produtosPath = path.join(__dirname, 'produtos.json');
const imagemDir = path.join(__dirname, 'public/imagens/produtos');

console.log('🔄 Iniciando conversão de imagens base64...\n');

// Criar diretório se não existir
if (!fs.existsSync(imagemDir)) {
  fs.mkdirSync(imagemDir, { recursive: true });
  console.log(`✅ Diretório criado: ${imagemDir}\n`);
}

// Ler arquivo de produtos
const produtos = JSON.parse(fs.readFileSync(produtosPath, 'utf8'));

let convertidas = 0;

// Processar cada produto
produtos.forEach((produto) => {
  // Processar campo 'foto' (imagem única)
  if (produto.foto && typeof produto.foto === 'string' && produto.foto.startsWith('data:image')) {
    const base64Data = produto.foto.split(',')[1];
    const format = produto.foto.includes('jpeg') ? 'jpeg' : 'png';
    const nomeArquivo = `${produto.id}_foto.${format}`;
    const caminhoArquivo = path.join(imagemDir, nomeArquivo);

    try {
      fs.writeFileSync(caminhoArquivo, Buffer.from(base64Data, 'base64'));
      produto.foto = `/imagens/produtos/${nomeArquivo}`;
      convertidas++;
      console.log(`✅ Salvo: /imagens/produtos/${nomeArquivo}`);
    } catch (err) {
      console.error(`❌ Erro ao salvar ${nomeArquivo}:`, err.message);
    }
  }

  // Processar campo 'imagem' (imagem única alternativa)
  if (produto.imagem && typeof produto.imagem === 'string' && produto.imagem.startsWith('data:image')) {
    const base64Data = produto.imagem.split(',')[1];
    const format = produto.imagem.includes('jpeg') ? 'jpeg' : 'png';
    const nomeArquivo = `${produto.id}_imagem.${format}`;
    const caminhoArquivo = path.join(imagemDir, nomeArquivo);

    try {
      fs.writeFileSync(caminhoArquivo, Buffer.from(base64Data, 'base64'));
      produto.imagem = `/imagens/produtos/${nomeArquivo}`;
      convertidas++;
      console.log(`✅ Salvo: /imagens/produtos/${nomeArquivo}`);
    } catch (err) {
      console.error(`❌ Erro ao salvar ${nomeArquivo}:`, err.message);
    }
  }

  // Processar array 'imagens' (múltiplas imagens)
  if (Array.isArray(produto.imagens)) {
    produto.imagens = produto.imagens.map((imagem, index) => {
      if (imagem && typeof imagem === 'string' && imagem.startsWith('data:image')) {
        const base64Data = imagem.split(',')[1];
        const format = imagem.includes('jpeg') ? 'jpeg' : 'png';
        const nomeArquivo = `${produto.id}_imagem_${index}.${format}`;
        const caminhoArquivo = path.join(imagemDir, nomeArquivo);

        try {
          fs.writeFileSync(caminhoArquivo, Buffer.from(base64Data, 'base64'));
          convertidas++;
          console.log(`✅ Salvo: /imagens/produtos/${nomeArquivo}`);
          return `/imagens/produtos/${nomeArquivo}`;
        } catch (err) {
          console.error(`❌ Erro ao salvar ${nomeArquivo}:`, err.message);
          return imagem; // Mantém original em caso de erro
        }
      }
      return imagem;
    });
  }
});

// Salvar arquivo produtos.json atualizado
fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2), 'utf8');

console.log(`\n✅ Conversão concluída!`);
console.log(`📊 Total de imagens convertidas: ${convertidas}`);
console.log(`📁 Arquivo atualizado: ${produtosPath}`);
console.log('\n🚀 Próximo passo: reinicie o backend com "npm start"');
