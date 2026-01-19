// Script para validar todos os arquivos JSON do backend
// Salve como validar-jsons.js e execute com: node validar-jsons.js

const fs = require('fs');
const path = require('path');

const arquivos = [
  'produtos.json',
  'usuarios.json',
  'pedidos.json',
  'configuracoes.json',
  'perfis.json',
  'pontos.json'
];

const pasta = __dirname;
let algumErro = false;

console.log('--- Validação de arquivos JSON ---');

arquivos.forEach(arquivo => {
  const filePath = path.join(pasta, arquivo);
  try {
    const conteudo = fs.readFileSync(filePath, 'utf8');
    JSON.parse(conteudo);
    console.log(`✔️  ${arquivo} está válido.`);
  } catch (e) {
    algumErro = true;
    console.error(`❌  Erro no arquivo ${arquivo}:`, e.message);
  }
});

if (!algumErro) {
  console.log('\nTodos os arquivos JSON estão válidos!');
} else {
  console.log('\nAtenção: Corrija os arquivos acima para evitar falhas no backend.');
}
