console.log('=== INÍCIO DO ARQUIVO INDEX.JS - VERSÃO SEM MIDDLEWARES ESTÁTICOS ===');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Tokens de admin
let adminToken = null;
let adminTokenExpiracao = null;

// Funções para hash de senhas
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Verificar se o token foi carregado
console.log('MP_ACCESS_TOKEN carregado:', !!process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN valor (primeiros 10 chars):', process.env.MP_ACCESS_TOKEN ? process.env.MP_ACCESS_TOKEN.substring(0, 10) + '...' : 'undefined');

// Função para logar em arquivo
async function logToFile(message) {
  try {
    const logPath = path.join(__dirname, 'debug.log');
    const timestamp = new Date().toISOString();
    await fs.appendFile(logPath, `[${timestamp}] ${message}\n`);
  } catch (err) {
    console.error('Erro ao escrever log:', err);
  }
}

console.log('Variáveis de ambiente carregadas:');
console.log('MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'DEFINIDO' : 'NÃO DEFINIDO');
console.log('Valor completo:', process.env.MP_ACCESS_TOKEN);

const app = express();
// Configurar limite de headers para evitar erro 431
app.set('maxHttpHeaderSize', 65536); // 64KB
// Middleware CORS deve vir antes de todas as rotas
app.use(cors({
  maxHttpBufferSize: 100 * 1024 * 1024 // 100MB
}));

// ========== MIDDLEWARE DE SEGURANÇA ==========

// Headers de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Prevenir acesso direto aos arquivos JSON
app.use((req, res, next) => {
  if (req.path.endsWith('.json') && !req.path.startsWith('/api/')) {
    console.log(`🚫 Tentativa de acesso direto ao arquivo JSON: ${req.path} de ${req.ip}`);
    return res.status(403).json({
      erro: 'Acesso negado',
      mensagem: 'Acesso direto aos arquivos de dados não é permitido'
    });
  }
  next();
});

// Detectar e bloquear requests suspeitos (DevTools, scanners, etc.)
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /devtools/i,
    /inspector/i,
    /debugger/i,
    /burp/i,
    /postman/i,
    /curl/i,
    /wget/i,
    /python/i,
    /scrapy/i,
    /selenium/i,
    /phantomjs/i,
    /headless/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious && !req.path.startsWith('/api/login')) {
    console.log(`🚨 Request suspeito detectado: ${req.method} ${req.path} - UA: ${userAgent} - IP: ${req.ip}`);
    return res.status(403).json({
      erro: 'Acesso negado',
      mensagem: 'Atividade suspeita detectada'
    });
  }

  next();
});

// Rate limiting básico para prevenir ataques de força bruta
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 100; // máximo de requests por janela

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const userData = requestCounts.get(ip);
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
    } else {
      userData.count++;
      if (userData.count > maxRequests) {
        console.log(`🚫 Rate limit excedido para IP: ${ip}`);
        return res.status(429).json({
          erro: 'Muitas requisições',
          mensagem: 'Limite de requisições excedido. Tente novamente mais tarde.'
        });
      }
    }
  }

  next();
});

// ========== FIM DO MIDDLEWARE DE SEGURANÇA ==========

// Middleware global para aceitar JSON maior (até 50mb)
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Middleware de log para todas as requisições
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Função para obter configurações do Mercado Pago (prioriza configuracoes.json, depois .env)
async function getMPConfig() {
  try {
    const config = await readJson('configuracoes.json');
    return {
      accessToken: config.mpAccessToken || process.env.MP_ACCESS_TOKEN,
      publicKey: config.mpPublicKey || process.env.REACT_APP_MP_PUBLIC_KEY
    };
  } catch (err) {
    console.error('Erro ao ler configuracoes.json:', err);
    return {
      accessToken: process.env.MP_ACCESS_TOKEN,
      publicKey: process.env.REACT_APP_MP_PUBLIC_KEY
    };
  }
}

// Configuração Mercado Pago
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
let mpClient = null;
let preferenceClient = null;
let paymentClient = null;

async function initMercadoPago() {
  const mpConfig = await getMPConfig();
  if (mpConfig.accessToken) {
    console.log('Criando MercadoPagoConfig...');
    mpClient = new MercadoPagoConfig({
      accessToken: mpConfig.accessToken
    });
    console.log('mpClient criado:', !!mpClient);
    console.log('Criando Preference client...');
    preferenceClient = new Preference(mpClient);
    console.log('preferenceClient criado:', !!preferenceClient);
    console.log('Criando Payment client...');
    paymentClient = new Payment(mpClient);
    console.log('paymentClient criado:', !!paymentClient);
    console.log('Mercado Pago configurado com access token.');
  } else {
    console.warn('MP_ACCESS_TOKEN não definido. Funcionalidades de pagamento estarão desabilitadas.');
  }
}

// Inicializar Mercado Pago
initMercadoPago();

// Rota de login
app.post('/api/login', async (req, res) => {
  console.log('🔥 LOGIN ROUTE HIT - Body:', req.body);
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Verificar admin
    if (email === 'admin@admin.com' && senha === 'admin') {
      const token = gerarToken();
      adminToken = token;
      adminTokenExpiracao = Date.now() + (24 * 60 * 60 * 1000); // Expira em 24 horas
      return res.json({
        sucesso: true,
        token,
        usuario: {
          id: 'admin',
          nome: 'Administrador',
          email: 'admin@admin.com',
          tipo: 'admin'
        }
      });
    }

    // Verificar usuários normais
    const usuarios = await readJson('usuarios.json');
    let usuario = null;
    
    for (const u of usuarios) {
      if (u.email === email || u.cpf === email) {
        // Verificar senha com bcrypt
        const senhaCorreta = await verifyPassword(senha, u.senha);
        if (senhaCorreta) {
          usuario = u;
          break;
        }
      }
    }

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gerar novo token e invalidar sessões anteriores
    const token = gerarToken();
    usuario.tokenAtual = token;
    usuario.tokenExpiracao = Date.now() + (24 * 60 * 60 * 1000); // Expira em 24 horas
    await writeJson('usuarios.json', usuarios);

    res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        endereco: usuario.endereco,
        tipo: usuario.tipo || 'cliente', // Usar tipo do usuário ou 'cliente' como padrão
        pontos: usuario.pontos || 0
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

console.log('✅ Rota /login registrada');

// Rota de login alternativa para formulários (sem JS)
app.post('/login', async (req, res) => {
  console.log('🔥 LOGIN FORM ROUTE HIT - Body:', req.body);
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.redirect('/login?erro=Email e senha são obrigatórios');
    }

    // Verificar admin
    if (email === 'admin@admin.com' && senha === 'admin') {
      const token = gerarToken();
      adminToken = token;
      adminTokenExpiracao = Date.now() + (24 * 60 * 60 * 1000); // Expira em 24 horas
      // Para formulário, redirecionar com token em cookie ou algo, mas por simplicidade, redirecionar para /
      res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      return res.redirect('/');
    }

    // Verificar usuários normais
    const usuarios = await readJson('usuarios.json');
    let usuario = null;
    
    for (const u of usuarios) {
      if (u.email === email || u.cpf === email) {
        // Verificar senha com bcrypt
        const senhaCorreta = await verifyPassword(senha, u.senha);
        if (senhaCorreta) {
          usuario = u;
          break;
        }
      }
    }

    if (!usuario) {
      return res.redirect('/login?erro=Credenciais inválidas');
    }

    // Gerar novo token
    const token = gerarToken();
    usuario.tokenAtual = token;
    usuario.tokenExpiracao = Date.now() + (24 * 60 * 60 * 1000);
    await writeJson('usuarios.json', usuarios);

    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/');
  } catch (err) {
    console.error('Erro no login form:', err);
    res.redirect('/login?erro=Erro interno do servidor');
  }
});

console.log('✅ Rota /login (form) registrada');

// Adicionar pontos ao usuário
app.post('/api/usuarios/:id/pontos', async (req, res) => {
  try {
    console.log('Recebido body:', req.body);
    const pontos = req.body && req.body.pontos;
    if (typeof pontos !== 'number') {
      console.error('Pontos inválidos:', pontos);
      return res.status(400).json({ erro: 'Pontos inválidos.' });
    }
    let usuarios = await readJson('usuarios.json');
    const idx = usuarios.findIndex(u => String(u.id) === String(req.params.id));
    if (idx === -1) {
      console.error('Usuário não encontrado:', req.params.id);
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    console.log('Usuário antes:', usuarios[idx]);
    usuarios[idx].pontos = (usuarios[idx].pontos || 0) + pontos;
    console.log('Usuário depois:', usuarios[idx]);
    await writeJson('usuarios.json', usuarios);
    res.json({ sucesso: true, pontos: usuarios[idx].pontos });
  } catch (err) {
    console.error('Erro ao adicionar pontos:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});
const PORT = 3000;

// Para qualquer rota não-API, retorna o index.html do React
app.get('/configuracoes', async (req, res) => {
  let config = await readJson('configuracoes.json');
  // Garante que todos os campos existam
  config = {
    nomeEmpresa: '',
    cnpj: '',
    logo: '',
    telefoneEmpresa: '',
    whatsappEmpresa: '',
    horarios: '',
    ...config
  };
  res.json(config);
});

app.post('/configuracoes', async (req, res) => {
  try {
    console.log('Recebido em /configuracoes:', req.body);
    const config = req.body;
    await writeJson('configuracoes.json', config);
    // Reinicializar Mercado Pago com as novas configurações
    await initMercadoPago();
    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao salvar /configuracoes:', err);
    res.status(400).json({ erro: 'JSON inválido ou erro ao salvar.' });
  }
});

// Endpoint para obter a chave pública do Mercado Pago
app.get('/mp-public-key', async (req, res) => {
  try {
    const mpConfig = await getMPConfig();
    res.json({ publicKey: mpConfig.publicKey || '' });
  } catch (err) {
    console.error('Erro ao obter chave pública:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Utilitários para arquivos JSON
const getFile = (file) => path.join(__dirname, file);
async function readJson(file) {
  try {
    const data = await fs.readFile(getFile(file), 'utf8');
    return JSON.parse(data);
  } catch {
    return Array.isArray(file) ? [] : {};
  }
}
async function writeJson(file, data) {
  try {
    await fs.writeFile(getFile(file), JSON.stringify(data, null, 2));
    console.log(`✅ Arquivo ${file} escrito com sucesso`);
  } catch (err) {
    console.error(`❌ Erro ao escrever ${file}:`, err.message);
    throw err; // relançar para que o catch da rota pegue
  }
}

// Função utilitária para gerar chave de 25 caracteres (letras e números)
function gerarChave(length = 25) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chave = '';
  for (let i = 0; i < length; i++) {
    chave += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return chave;
}

// Endpoint para gerar nova chave
app.get('/chave/gerar', (req, res) => {
  const chave = gerarChave();
  res.json({ chave });
});

// Endpoint para validar chave (simples, pode ser expandido)
app.post('/chave/validar', express.json(), (req, res) => {
  const { chave } = req.body;
  if (typeof chave === 'string' && chave.length === 25 && /^[A-Za-z0-9]+$/.test(chave)) {
    res.json({ valida: true });
  } else {
    res.json({ valida: false });
  }
});


// Resetar senha do usuário (admin)
app.put('/usuarios/:id/senha', async (req, res) => {
  const { senha } = req.body;
  if (!senha) return res.status(400).json({ erro: 'Senha obrigatória.' });
  let usuarios = await readJson('usuarios.json');
  const idx = usuarios.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  // Fazer hash da nova senha
  usuarios[idx].senha = await hashPassword(senha);
  await writeJson('usuarios.json', usuarios);
  res.json({ sucesso: true });
});

// Alterar senha do próprio usuário (cliente)
app.put('/usuarios/:id/alterar-senha', async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias.' });
  }
  
  try {
    let usuarios = await readJson('usuarios.json');
    const idx = usuarios.findIndex(u => String(u.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    
    // Verificar se a senha atual está correta
    const senhaCorreta = await verifyPassword(senhaAtual, usuarios[idx].senha);
    if (!senhaCorreta) {
      return res.status(400).json({ erro: 'Senha atual incorreta.' });
    }
    
    // Atualizar para a nova senha (com hash)
    usuarios[idx].senha = await hashPassword(novaSenha);
    await writeJson('usuarios.json', usuarios);
    res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// Editar usuário
app.put('/usuarios/:id', async (req, res) => {
  let usuarios = await readJson('usuarios.json');
  const idx = usuarios.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  usuarios[idx] = { ...usuarios[idx], ...req.body };
  await writeJson('usuarios.json', usuarios);
  res.json({ sucesso: true });
});

// Excluir usuário
app.delete('/usuarios/:id', async (req, res) => {
  let usuarios = await readJson('usuarios.json');
  usuarios = usuarios.filter(u => u.id != req.params.id);
  await writeJson('usuarios.json', usuarios);
  res.json({ sucesso: true });
});

// Rotas para produtos
app.get('/produtos', async (req, res) => {
  console.log('🔍 GET /produtos chamado');
  try {
    console.log('Tentando ler produtos.json...');
    const produtos = await readJson('produtos.json');
    console.log('Produtos lidos:', produtos.length, 'itens');
    
    // Mapear imagens[0] para foto para compatibilidade com frontend
    produtos.forEach(produto => {
      if (produto.imagens && produto.imagens.length > 0 && !produto.foto) {
        produto.foto = produto.imagens[0];
      }
    });
    
    res.json(produtos);
    console.log('Resposta JSON enviada');
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.get('/api/produtos', async (req, res) => {
  console.log('📋 Rota /api/produtos GET chamada');
  console.log('📋 Headers:', JSON.stringify(req.headers));
  console.log('📋 IP:', req.ip, 'Method:', req.method, 'URL:', req.url);
  const produtos = await readJson('produtos.json');
  
  // Migrar campo 'imagem' para 'imagens' para cada produto se necessário
  produtos.forEach(produto => {
    if (produto.imagem && (!produto.imagens || produto.imagens.length === 0)) {
      produto.imagens = [produto.imagem];
    }
  });
  
  console.log('📋 Produtos retornados:', produtos.length);
  res.json(produtos);
});

// Buscar produto específico por ID
app.get('/api/produtos/:id', async (req, res) => {
  console.log('📋 Rota /api/produtos/:id GET chamada para ID:', req.params.id);
  try {
    const produtos = await readJson('produtos.json');
    const produto = produtos.find(p => String(p.id) === String(req.params.id));
    if (!produto) {
      console.log('📋 Produto não encontrado para ID:', req.params.id);
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Migrar campo 'imagem' para 'imagens' se necessário
    if (produto.imagem && (!produto.imagens || produto.imagens.length === 0)) {
      produto.imagens = [produto.imagem];
    }

    console.log('📋 Produto encontrado:', produto.nome);
    res.json(produto);
  } catch (error) {
    console.error('📋 Erro ao buscar produto:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});


app.post('/api/produtos', async (req, res) => {
  let produtos = await readJson('produtos.json');
  const id = produtos.length ? (parseInt(produtos[produtos.length-1].id) + 1).toString() : '1';
  // Garante que imagens seja array de strings
  let imagens = [];
  if (Array.isArray(req.body.imagens)) {
    imagens = req.body.imagens.filter(x => typeof x === 'string' && x.length > 0);
  } else if (typeof req.body.imagem === 'string' && req.body.imagem.length > 0) {
    imagens = [req.body.imagem];
  }
  // Garante estoque padrão 0 se não informado
  let estoque = 0;
  if (typeof req.body.estoque === 'number') {
    estoque = req.body.estoque;
  } else if (typeof req.body.estoque === 'string' && req.body.estoque.trim() !== '') {
    estoque = Number(req.body.estoque) || 0;
  }
  const novo = { ...req.body, imagens, id, estoque };
  // Mapear foto para imagens[0] para compatibilidade
  if (imagens.length > 0) {
    novo.foto = imagens[0];
  }
  produtos.push(novo);
  await writeJson('produtos.json', produtos);
  res.json(novo);
});

// Editar produto existente
app.put('/api/produtos/:id', async (req, res) => {
  let produtos = await readJson('produtos.json');
  const idx = produtos.findIndex(p => String(p.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado.' });
  // Garante que imagens seja array de strings
  let imagens = [];
  if (Array.isArray(req.body.imagens)) {
    imagens = req.body.imagens.filter(x => typeof x === 'string' && x.length > 0);
  } else if (typeof req.body.imagem === 'string' && req.body.imagem.length > 0) {
    imagens = [req.body.imagem];
  } else if (Array.isArray(produtos[idx].imagens)) {
    imagens = produtos[idx].imagens;
  } else if (typeof produtos[idx].imagem === 'string' && produtos[idx].imagem.length > 0) {
    imagens = [produtos[idx].imagem];
  }
  produtos[idx] = { ...produtos[idx], ...req.body, imagens };
  // Mapear foto para imagens[0] para compatibilidade
  if (imagens.length > 0) {
    produtos[idx].foto = imagens[0];
  }
  await writeJson('produtos.json', produtos);
  res.json({ sucesso: true });
});

// Deletar produto
app.delete('/api/produtos/:id', async (req, res) => {
  console.log('🗑️ Rota /api/produtos/:id DELETE chamada para ID:', req.params.id);
  try {
    let produtos = await readJson('produtos.json');
    const idx = produtos.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) {
      console.log('🗑️ Produto não encontrado para ID:', req.params.id);
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    // Remove o produto do array
    produtos.splice(idx, 1);
    await writeJson('produtos.json', produtos);
    console.log('🗑️ Produto removido com sucesso, ID:', req.params.id);
    res.json({ sucesso: true });
  } catch (error) {
    console.error('🗑️ Erro ao deletar produto:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// Buscar usuário por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuarios = await readJson('usuarios.json');
    const usuario = usuarios.find(u => String(u.id) === String(req.params.id));
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: String(err) });
  }
});
// Rotas para usuários
app.get('/usuarios', async (req, res) => {
  const usuarios = await readJson('usuarios.json');
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  let usuarios = await readJson('usuarios.json');
  
  // Verificar se já existe um usuário com o mesmo email (CPF)
  const usuarioExistente = usuarios.find(u => u.email === req.body.email);
  if (usuarioExistente) {
    return res.status(400).json({ erro: 'Já existe um usuário cadastrado com este CPF.' });
  }
  
  // Fazer hash da senha
  const senhaHashed = await hashPassword(req.body.senha);
  
  let novo;
  if (req.body.tipo === 'admin') {
    // Admin não recebe id, mas agora recebe pontos: 0
    novo = { ...req.body, senha: senhaHashed, pontos: 0 };
  } else {
    // Cliente recebe id e pontos
    let id;
    let exists = true;
    while (exists) {
      id = String(Math.floor(100000 + Math.random() * 900000));
      exists = usuarios.some(u => u.id === id);
    }
    novo = { ...req.body, senha: senhaHashed, id, pontos: 0 };
  }
  usuarios.push(novo);
  await writeJson('usuarios.json', usuarios);
  res.json(novo);
});

// Rotas para pedidos
// Endpoint para resgates do usuário (compatível com frontend)
app.get('/resgates', async (req, res) => {
  try {
    const usuarioId = req.query.usuario;
    let pedidos = await readJson('pedidos.json');
    if (usuarioId) {
      pedidos = pedidos.filter(p => String(p.usuarioId) === String(usuarioId));
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar resgates', detalhes: String(err) });
  }
});
app.get('/pedidos', async (req, res) => {
  const pedidos = await readJson('pedidos.json');
  res.json(pedidos);
});

app.get('/pedidos/:usuarioId', async (req, res) => {
  console.log('🔍 Rota /pedidos/:usuarioId chamada com usuarioId:', req.params.usuarioId);
  try {
    console.log('Buscando pedidos para usuarioId:', req.params.usuarioId);
    const pedidos = await readJson('pedidos.json');
    console.log('Total de pedidos no arquivo:', pedidos.length);
    const pedidosUsuario = pedidos.filter(p => String(p.usuarioId) === String(req.params.usuarioId));
    console.log('Pedidos filtrados para usuario:', pedidosUsuario.length);
    res.json(pedidosUsuario);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ erro: 'Erro ao buscar pedidos', detalhes: String(err) });
  }
});

// Novo fluxo de resgate de produto por pontos
app.post('/pedidos', async (req, res) => {
  console.log('🔥 POST /pedidos chamado - Body:', req.body);
  try {
    let { usuarioId, produtoId, pontos, valor, produtoNome, codigoUsuario, quantidade = 1 } = req.body;
    console.log('usuarioId:', usuarioId, 'produtoId:', produtoId, 'pontos:', pontos, 'quantidade:', quantidade);
    // 1. Verificação do usuário
    if (!usuarioId || !produtoId) {
      console.log('❌ Dados inválidos: usuarioId ou produtoId ausente');
      return res.status(400).json({ erro: 'Dados inválidos.' });
    }
    let usuarios = await readJson('usuarios.json');
    const userIdx = usuarios.findIndex(u => String(u.id) === String(usuarioId));
    console.log('userIdx:', userIdx, 'usuarios.length:', usuarios.length);
    if (userIdx === -1) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    const user = usuarios[userIdx];
    console.log('Usuário encontrado:', user.nome, 'pontos:', user.pontos);
    // Verifica código do usuário se existir no sistema
    if (user.codigo && codigoUsuario && String(user.codigo) !== String(codigoUsuario)) {
      console.log('❌ Código do usuário inválido');
      return res.status(400).json({ erro: 'Código do usuário inválido.' });
    }

    // Determinar se é resgate por pontos ou venda real
    const isVendaReal = valor !== undefined && pontos === undefined;
    const isResgatePontos = pontos !== undefined && valor === undefined;

    if (!isVendaReal && !isResgatePontos) {
      return res.status(400).json({ erro: 'Deve especificar pontos ou valor.' });
    }

    if (isResgatePontos) {
      // Corrige tipo de pontos (string para number se necessário)
      pontos = Number(pontos);
      console.log('Pontos necessários:', pontos * quantidade, 'usuário tem:', user.pontos ?? 0);
      if (isNaN(pontos) || pontos <= 0) {
        console.log('❌ Pontos inválidos');
        return res.status(400).json({ erro: 'Pontos inválidos.' });
      }
      if ((user.pontos ?? 0) < pontos * quantidade) {
        console.log('❌ Pontos insuficientes');
        return res.status(400).json({ erro: 'Pontos insuficientes.' });
      }
    }

    // 2. Verificação do produto
    let produtos = await readJson('produtos.json');
    const prodIdx = produtos.findIndex(p => String(p.id) === String(produtoId));
    console.log('prodIdx:', prodIdx, 'produtos.length:', produtos.length);
    if (prodIdx === -1) {
      console.log('❌ Produto não encontrado');
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    const prod = produtos[prodIdx];
    console.log('Produto encontrado:', prod.nome, 'estoque:', prod.estoque, 'preco:', prod.preco);
    if ((prod.estoque ?? 0) < quantidade) {
      console.log('❌ Estoque insuficiente');
      return res.status(400).json({ erro: 'Produto sem estoque suficiente.' });
    }
    if (!prod.preco || isNaN(Number(prod.preco))) {
      console.log('❌ Valor do produto inválido');
      return res.status(400).json({ erro: 'Valor do produto inválido.' });
    }

    // 3. Validação e processamento
    let pedidos = await readJson('pedidos.json');
    // Debitar estoque
    console.log('Estoque ANTES:', prod.nome, 'ID:', prod.id, 'Estoque:', prod.estoque);
    produtos[prodIdx].estoque = (prod.estoque ?? 0) - quantidade;
    console.log('Estoque DEPOIS:', prod.nome, 'ID:', prod.id, 'Estoque:', produtos[prodIdx].estoque);

    if (isResgatePontos) {
      // Debitar pontos apenas para resgate
      usuarios[userIdx].pontos = (user.pontos ?? 0) - (pontos * quantidade);
    }

    // Criar pedido pendente
    const id = pedidos.length ? (parseInt(pedidos[pedidos.length-1].id) + 1).toString() : '1';
    // Gerar comprovante simples (6 dígitos aleatórios) apenas para resgates
    const comprovante = isResgatePontos ? Math.floor(100000 + Math.random() * 900000).toString() : null;
    // Campos adicionais para o comprovante
    const valorProduto = prod.preco || 0;
    // Buscar local de retirada das configurações
    const configuracoes = await readJson('configuracoes.json');
    const localRetirada = configuracoes.endereco || '';
    const novo = {
      id,
      usuarioId,
      usuarioNome: user.nome,
      produtoId,
      produtoNome: produtoNome || prod.nome,
      quantidade,
      valorProduto,
      localRetirada,
      pontos: isResgatePontos ? pontos * quantidade : 0,
      valor: isVendaReal ? valor : 0,
      tipo: isVendaReal ? 'venda' : 'resgate',
      data: new Date().toLocaleString('pt-BR'),
      status: 'Pendente',
      comprovante
    };
    pedidos.push(novo);
    await writeJson('produtos.json', produtos);
    await writeJson('usuarios.json', usuarios);
    await writeJson('pedidos.json', pedidos);
    res.json(novo);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

// Endpoint para admin aprovar ou recusar pedido
app.post('/pedidos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Aprovado', 'Recusado', 'Retirado'].includes(status)) return res.status(400).json({ erro: 'Status inválido.' });
    let pedidos = await readJson('pedidos.json');
    let produtos = await readJson('produtos.json');
    let usuarios = await readJson('usuarios.json');
    const idx = pedidos.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    const pedido = pedidos[idx];
    // Se recusar, devolver estoque e pontos
    if (status === 'Recusado' && pedido.status === 'Pendente') {
      const userIdx = usuarios.findIndex(u => String(u.id) === String(pedido.usuarioId));
      // Se o pedido tem múltiplos itens (carrinho), liberar reservas por item
      if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
        for (const it of pedido.itens) {
          const prodIdx = produtos.findIndex(p => String(p.id) === String(it.produtoId));
          const quantidade = it.quantidade || 0;
          if (prodIdx !== -1) {
            produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
            console.log(`Reserva liberada para produto ${it.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
          }
        }
      } else {
        // Pedido legado/resgate: liberar reserva se existir, caso contrário repor estoque (compatibilidade)
        const prodIdx = produtos.findIndex(p => String(p.id) === String(pedido.produtoId));
        if (prodIdx !== -1) {
          const quantidade = pedido.quantidade || 1;
          if ((produtos[prodIdx].reservado ?? 0) >= quantidade) {
            produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
            console.log(`Reserva liberada (legado) para produto ${pedido.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
          } else {
            produtos[prodIdx].estoque = (produtos[prodIdx].estoque ?? 0) + quantidade;
            console.log(`Estoque devolvido (legado) para produto ${pedido.produtoId}: +${quantidade}, estoque agora ${produtos[prodIdx].estoque}`);
          }
        }
      }

      if (userIdx !== -1) {
        usuarios[userIdx].pontos = (usuarios[userIdx].pontos ?? 0) + (pedido.pontos ?? 0);
        console.log(`Pontos devolvidos para usuário ${pedido.usuarioId}: ${usuarios[userIdx].pontos} (+${pedido.pontos})`);
      }
      await writeJson('produtos.json', produtos);
      await writeJson('usuarios.json', usuarios);
    }
    // Atualizar status
    pedidos[idx].status = status;
    await writeJson('pedidos.json', pedidos);
    res.json({ sucesso: true, pedido: pedidos[idx] });
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

// Endpoint para excluir pedido completamente
app.delete('/pedidos/:id', async (req, res) => {
  try {
    let pedidos = await readJson('pedidos.json');
    let produtos = await readJson('produtos.json');
    let usuarios = await readJson('usuarios.json');
    const idx = pedidos.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    const pedido = pedidos[idx];
    
    // Devolver reservas/estoque e pontos se o pedido estava pendente
    if (pedido.status === 'Pendente') {
      const userIdx = usuarios.findIndex(u => String(u.id) === String(pedido.usuarioId));
      if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
        for (const it of pedido.itens) {
          const prodIdx = produtos.findIndex(p => String(p.id) === String(it.produtoId));
          const quantidade = it.quantidade || 0;
          if (prodIdx !== -1) {
            produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
            console.log(`Reserva liberada (delete) para produto ${it.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
          }
        }
      } else {
        const prodIdx = produtos.findIndex(p => String(p.id) === String(pedido.produtoId));
        if (prodIdx !== -1) {
          const quantidade = pedido.quantidade || 1;
          if ((produtos[prodIdx].reservado ?? 0) >= quantidade) {
            produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
            console.log(`Reserva liberada (delete legado) para produto ${pedido.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
          } else {
            produtos[prodIdx].estoque = (produtos[prodIdx].estoque ?? 0) + quantidade;
            console.log(`Estoque devolvido (delete legado) para produto ${pedido.produtoId}: +${quantidade}, estoque agora ${produtos[prodIdx].estoque}`);
          }
        }
      }
      if (userIdx !== -1) {
        usuarios[userIdx].pontos = (usuarios[userIdx].pontos ?? 0) + (pedido.pontos ?? 0);
        console.log(`Pontos devolvidos para usuário ${pedido.usuarioId}: ${usuarios[userIdx].pontos} (+${pedido.pontos})`);
      }
      await writeJson('produtos.json', produtos);
      await writeJson('usuarios.json', usuarios);
    }
    
    // Remover pedido da lista
    pedidos.splice(idx, 1);
    await writeJson('pedidos.json', pedidos);
    res.json({ sucesso: true, mensagem: 'Pedido excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir pedido:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

// Endpoint para zerar pontos de todos os usuários do tipo cliente
app.post('/usuarios/zerar-pontos-clientes', async (req, res) => {
  try {
    let usuarios = await readJson('usuarios.json');
    let clientesZerados = 0;
    let pontosTotaisRemovidos = 0;
    
    // Zera pontos apenas dos usuários do tipo "cliente"
    usuarios.forEach(user => {
      if (user.tipo === 'cliente') {
        pontosTotaisRemovidos += user.pontos || 0;
        user.pontos = 0;
        clientesZerados++;
      }
    });
    
    await writeJson('usuarios.json', usuarios);
    
    console.log(`Pontos zerados para ${clientesZerados} clientes. Total de pontos removidos: ${pontosTotaisRemovidos}`);
    
    res.json({ 
      sucesso: true, 
      mensagem: `Pontos zerados com sucesso para ${clientesZerados} clientes. Total de pontos removidos: ${pontosTotaisRemovidos}`,
      clientesZerados,
      pontosTotaisRemovidos
    });
  } catch (err) {
    console.error('Erro ao zerar pontos dos clientes:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

// Rota de teste simples
app.post('/teste', (req, res) => {
  console.log('=== ROTA /teste CHAMADA ===');
  res.json({ sucesso: true, mensagem: 'Rota de teste funcionando' });
});

// Middleware para dar prioridade às rotas da API sobre arquivos estáticos
app.use('/pagamento', (req, res, next) => {
  // Se for uma rota da API, não servir arquivos estáticos
  if (req.method === 'POST' || req.method === 'GET') {
    return next();
  }
  next();
});

// Rota de teste para pagamento
app.post('/pagamento/teste', (req, res) => {
  console.log('=== ROTA /pagamento/teste CHAMADA ===');
  res.json({ sucesso: true, mensagem: 'Rota de pagamento teste funcionando' });
});

// Rota para criar pagamento no Mercado Pago
app.post('/pagamento/criar', async (req, res) => {
  console.log('=== ROTA /pagamento/criar CHAMADA - LOG IMEDIATO ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('req.method:', req.method);
  console.log('req.url:', req.url);
  console.log('req.body:', JSON.stringify(req.body));
  console.log('INÍCIO DA FUNÇÃO - ANTES DE QUALQUER VERIFICAÇÃO');
  await logToFile('=== ROTA CHAMADA ===');
  console.log('=== INÍCIO: /pagamento/criar ===');
  await logToFile('=== INÍCIO: /pagamento/criar ===');
  console.log('Recebida requisição para criar pagamento:', req.body);
  await logToFile('Recebida requisição: ' + JSON.stringify(req.body));
  await logToFile('preferenceClient existe: ' + !!preferenceClient);
  console.log('preferenceClient no início da rota:', !!preferenceClient);
  console.log('process.env.MP_ACCESS_TOKEN no início da rota:', !!process.env.MP_ACCESS_TOKEN);
  try {
    console.log('Entrando no bloco try');
    
    // Recarregar dotenv dentro da função
    require('dotenv').config();
    console.log('dotenv recarregado dentro da função');
    console.log('process.env.MP_ACCESS_TOKEN dentro do try:', !!process.env.MP_ACCESS_TOKEN);
    console.log('Valor do token:', process.env.MP_ACCESS_TOKEN ? 'DEFINIDO' : 'INDEFINIDO');
    console.log('Token length:', process.env.MP_ACCESS_TOKEN ? process.env.MP_ACCESS_TOKEN.length : 0);
    
    // Temporariamente desabilitar verificação do token
    // if (!process.env.MP_ACCESS_TOKEN) {
    //   return res.status(500).json({ erro: 'Sistema de pagamento não configurado. MP_ACCESS_TOKEN não definido.' });
    // }
    
    console.log('Verificação do token desabilitada temporariamente');
    console.log('MP_ACCESS_TOKEN verificado com sucesso');
    
    if (!preferenceClient) {
      return res.status(500).json({ erro: 'Cliente Mercado Pago não configurado.' });
    }
    console.log('preferenceClient verificado com sucesso');

    const { produtoId, usuarioId, quantidade = 1, metodoEntrega = 'entrega' } = req.body;
    console.log('Valores desestruturados:', { produtoId, usuarioId, quantidade });
    
    if (!produtoId || !usuarioId) {
      return res.status(400).json({ erro: 'Produto e usuário são obrigatórios.' });
    }

    // Buscar produto
    console.log('Buscando produto com id:', produtoId);
    const produtos = await readJson('produtos.json');
    console.log('Produtos carregados:', produtos.length);
    const produto = produtos.find(p => String(p.id) === String(produtoId));
    console.log('Produto encontrado:', !!produto);
    if (produto) {
      console.log('Produto:', produto);
    }
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Verificar estoque
    if ((produto.estoque ?? 0) < quantidade) {
      return res.status(400).json({ erro: 'Estoque insuficiente.' });
    }

    // Buscar usuário
    console.log('Buscando usuário com id:', usuarioId);
    const usuarios = await readJson('usuarios.json');
    console.log('Usuários carregados:', usuarios.length);
    const usuario = usuarios.find(u => String(u.id) === String(usuarioId));
    console.log('Usuário encontrado:', !!usuario);
    if (usuario) {
      console.log('Usuário:', usuario);
    }
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Calcular valor total
    const valorUnitario = Number(produto.preco);
    const valorTotal = valorUnitario * quantidade;

    // Criar preferência no Mercado Pago
    const externalRef = `pedido_${usuarioId}_${produtoId}_${quantidade}_${Date.now()}`;
    const preference = {
      items: [{
        title: produto.nome,
        unit_price: valorUnitario,
        quantity: quantidade,
        currency_id: 'BRL'
      }],
      payer: {
        name: usuario.nome,
        email: usuario.email || 'cliente@email.com'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/falha`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/pendente`
      },
      external_reference: externalRef,
      payment_methods: {
        allowed_payment_methods: [{ id: "pix" }],
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1
      },
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/pagamento/webhook`
    };

    console.log('MP_ACCESS_TOKEN definido:', !!process.env.MP_ACCESS_TOKEN);
    console.log('mpClient criado:', !!mpClient);
    console.log('preferenceClient criado:', !!preferenceClient);
    console.log('preferenceClient type:', typeof preferenceClient);
    console.log('preferenceClient methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(preferenceClient)));
    console.log('preference:', JSON.stringify(preference, null, 2));
    
    console.log('Tentando criar preferência...');
    await logToFile('Tentando criar preferência...');
    
    // Verificar se o cliente está funcionando
    if (!preferenceClient || typeof preferenceClient.create !== 'function') {
      throw new Error('Cliente Mercado Pago não está configurado corretamente');
    }
    
    let response;
    try {
      console.log('Fazendo chamada preferenceClient.create()...');
      response = await preferenceClient.create({ body: preference });
      console.log('Chamada create() concluída sem erro');
      await logToFile('Chamada create() concluída sem erro');
      console.log('Response type:', typeof response);
      console.log('Response is null:', response === null);
      console.log('Response is undefined:', response === undefined);
      console.log('Response constructor:', response?.constructor?.name);
      if (response !== null && response !== undefined) {
        console.log('Response keys:', Object.keys(response));
        console.log('Response has id:', 'id' in response);
        console.log('Response.id value:', response.id);
        console.log('Response.id type:', typeof response.id);
      } else {
        console.log('Response é null ou undefined');
        await logToFile('Response é null ou undefined');
      }
    } catch (createError) {
      console.error('Erro na chamada preferenceClient.create():', createError);
      await logToFile('Erro na chamada create(): ' + String(createError));
      // Log do erro detalhado
      console.error('Detalhes do erro:', JSON.stringify(createError, null, 2));
      await logToFile('Detalhes do erro: ' + JSON.stringify(createError, null, 2));
      throw createError;
    }
    console.log('Resposta recebida do Mercado Pago');
    await logToFile('Resposta recebida');
    console.log('Resposta completa do Mercado Pago:', JSON.stringify(response, null, 2));
    await logToFile('Resposta: ' + JSON.stringify(response, null, 2));
    console.log('Tipo da resposta:', typeof response);
    console.log('Propriedades da resposta:', Object.keys(response || {}));
    
    if (!response) {
      throw new Error('Resposta vazia do Mercado Pago');
    }
    
    // Verificar se response tem a propriedade id diretamente
    if (!response.id) {
      console.error('Response não tem propriedade id:', response);
      await logToFile('Response não tem propriedade id: ' + JSON.stringify(response, null, 2));
      throw new Error('Resposta do Mercado Pago não contém id da preferência');
    }
    
    console.log('Preferência criada:', response.id);

    // Criar pedido pendente após a preferência
    const pedidos = await readJson('pedidos.json');
    const configuracoes = await readJson('configuracoes.json');
    const nextId = pedidos.length ? (parseInt(pedidos[pedidos.length-1].id) + 1).toString() : '1';
    const localRetiradaValue = metodoEntrega === 'retirada' ? (configuracoes.endereco || '') : (usuario.endereco || '');
    const novoPedido = {
      id: nextId,
      usuarioId,
      usuarioNome: usuario.nome,
      produtoId,
      produtoNome: produto.nome,
      quantidade,
      valorProduto: produto.preco,
      localRetirada: localRetiradaValue,
      metodoEntrega,
      pontos: 0,
      valor: valorTotal,
      tipo: 'venda',
      data: new Date().toLocaleString('pt-BR'),
      status: 'Pendente',
      payment_id: null,
      external_reference: externalRef,
      init_point: response.init_point,
      comprovante: gerarComprovante()
    };
    pedidos.push(novoPedido);
    // Reservar quantidade no estoque para evitar vendas concorrentes
    try {
      const prodIdx = produtos.findIndex(p => String(p.id) === String(produtoId));
      if (prodIdx !== -1) {
        produtos[prodIdx].reservado = (produtos[prodIdx].reservado ?? 0) + quantidade;
        await writeJson('produtos.json', produtos);
        console.log(`Reserva criada: produto ${produtoId} reservado ${quantidade}. Reservado agora: ${produtos[prodIdx].reservado}`);
      }
    } catch (err) {
      console.error('Erro ao reservar produto:', err);
    }
    await writeJson('pedidos.json', pedidos);
    console.log('Pedido pendente criado para produto:', produtoId, 'para usuario:', usuarioId);

    res.json({
      sucesso: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      metodoEntrega
    });

  } catch (err) {
    console.error('Erro ao criar pagamento:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

console.log('✅ Rota /pagamento/criar registrada');

// Endpoint para criar pagamento do carrinho
app.post('/pagamento/criar-carrinho', async (req, res) => {
  console.log('=== ROTA /pagamento/criar-carrinho CHAMADA ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('req.body:', JSON.stringify(req.body));
  await logToFile('=== INÍCIO: /pagamento/criar-carrinho ===');

  try {
    console.log('🔍 Verificando preferenceClient...');
    if (!preferenceClient) {
      console.log('❌ preferenceClient não configurado');
      return res.status(500).json({ erro: 'Cliente Mercado Pago não configurado.' });
    }
    console.log('✅ preferenceClient OK');

    const { itens, usuarioId, tipoPagamento = 'pix', metodoEntrega = 'entrega' } = req.body;
    console.log('📦 Dados recebidos:', { itens: itens?.length, usuarioId, tipoPagamento });
    console.log('Valores recebidos:', { itens: itens?.length, usuarioId, tipoPagamento });

    if (!itens || !Array.isArray(itens) || itens.length === 0 || !usuarioId) {
      return res.status(400).json({ erro: 'Itens do carrinho e usuário são obrigatórios.' });
    }

    // Buscar usuário
    const usuarios = await readJson('usuarios.json');
    const usuario = usuarios.find(u => String(u.id) === String(usuarioId));
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Buscar produtos e validar estoque
    const produtos = await readJson('produtos.json');
    const items = [];
    let valorTotal = 0;

    for (const item of itens) {
      const { produtoId, quantidade } = item;

      if (!produtoId || !quantidade || quantidade <= 0) {
        return res.status(400).json({ erro: 'Dados do item inválidos.' });
      }

      const produto = produtos.find(p => String(p.id) === String(produtoId));
      if (!produto) {
        return res.status(404).json({ erro: `Produto ${produtoId} não encontrado.` });
      }

      // Verificar estoque
      if ((produto.estoque ?? 0) < quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}.` });
      }

      const valorUnitario = Number(produto.preco);
      if (isNaN(valorUnitario) || valorUnitario <= 0) {
        return res.status(400).json({ erro: `Preço inválido para ${produto.nome}.` });
      }

      items.push({
        title: produto.nome,
        unit_price: valorUnitario,
        quantity: quantidade,
        currency_id: 'BRL'
      });

      valorTotal += valorUnitario * quantidade;
    }

    // Configurar métodos de pagamento baseado no tipo
    let paymentMethods;
    if (tipoPagamento === 'creditcard') {
      // Permitir apenas cartões de crédito
      paymentMethods = {
        excluded_payment_methods: [],
        excluded_payment_types: [
          { id: "pix" },
          { id: "debit_card" },
          { id: "ticket" },
          { id: "bank_transfer" }
        ],
        installments: 12,
        default_installments: 1
      };
    } else {
      // PIX apenas (configuração atual)
      paymentMethods = {
        excluded_payment_methods: [
          { id: "visa" },
          { id: "master" },
          { id: "amex" },
          { id: "diners" },
          { id: "elo" },
          { id: "hipercard" }
        ],
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" }
        ],
        installments: 1,
        default_installments: 1
      };
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: items,
      payer: {
        name: usuario.nome,
        email: usuario.email || 'cliente@email.com'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/falha`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pagamento/pendente`
      },
      external_reference: `carrinho_${usuarioId}_${Date.now()}`,
      payment_methods: paymentMethods,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/pagamento/webhook`
    };

    console.log('Criando preferência do carrinho...');
    console.log('📋 Preference body:', JSON.stringify(preference, null, 2));
    const response = await preferenceClient.create({ body: preference });
    console.log('📋 Response do Mercado Pago:', JSON.stringify(response, null, 2));

    if (!response || !response.id) {
      console.log('❌ Resposta inválida:', response);
      throw new Error('Resposta inválida do Mercado Pago');
    }

    console.log('Preferência do carrinho criada:', response.id);

    // Criar um único pedido pendente representando todo o carrinho (com lista de itens)
    const externalRef = response.external_reference || `carrinho_${usuarioId}_${Date.now()}`;
    const pedidos = await readJson('pedidos.json');
    const configuracoes = await readJson('configuracoes.json');
    let nextId = pedidos.length ? (parseInt(pedidos[pedidos.length-1].id) + 1) : 1;

    // Montar lista de itens detalhados para o pedido
    const itensDetalhados = itens.map(item => {
      const produto = produtos.find(p => String(p.id) === String(item.produtoId));
      return {
        produtoId: item.produtoId,
        produtoNome: produto ? produto.nome : '',
        quantidade: item.quantidade,
        valorUnitario: produto ? produto.preco : 0
      };
    });

    const localRetiradaVal = metodoEntrega === 'retirada' ? (configuracoes.endereco || '') : (usuario.endereco || '');
    const valorTotalPedido = itensDetalhados.reduce((acc, it) => acc + (Number(it.valorUnitario) * it.quantidade), 0);

    const novoPedidoUnico = {
      id: nextId.toString(),
      usuarioId,
      usuarioNome: usuario.nome,
      itens: itensDetalhados,
      // Campos legados mantidos para compatibilidade (usar o primeiro item como referência)
      produtoId: itensDetalhados[0]?.produtoId || null,
      produtoNome: itensDetalhados[0]?.produtoNome || '',
      quantidade: itensDetalhados.reduce((acc, it) => acc + it.quantidade, 0),
      valorProduto: itensDetalhados[0]?.valorUnitario || 0,
      localRetirada: localRetiradaVal,
      metodoEntrega,
      pontos: 0,
      valor: valorTotalPedido,
      tipo: 'venda',
      data: new Date().toLocaleString('pt-BR'),
      status: 'Pendente',
      payment_id: null,
      external_reference: externalRef,
      init_point: response.init_point,
      comprovante: gerarComprovante()
    };

    pedidos.push(novoPedidoUnico);
    // Reservar estoque para cada item do pedido do carrinho
    try {
      for (const it of itensDetalhados) {
        const prodIdx = produtos.findIndex(p => String(p.id) === String(it.produtoId));
        if (prodIdx !== -1) {
          produtos[prodIdx].reservado = (produtos[prodIdx].reservado ?? 0) + (it.quantidade || 0);
          console.log(`Reserva criada para produto ${it.produtoId}: ${it.quantidade}. Reservado agora: ${produtos[prodIdx].reservado}`);
        }
      }
      await writeJson('produtos.json', produtos);
    } catch (err) {
      console.error('Erro ao reservar produtos do carrinho:', err);
    }
    await writeJson('pedidos.json', pedidos);
    console.log('Pedido pendente criado para carrinho (único) para usuario:', usuarioId);

    res.json({
      sucesso: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      valor_total: valorTotal
    });

  } catch (err) {
    console.error('❌ Erro ao criar pagamento do carrinho:', err);
    console.error('❌ Stack trace:', err.stack);
    console.error('❌ Error message:', err.message);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: String(err) });
  }
});

console.log('✅ Rota /pagamento/criar-carrinho registrada');

// Webhook para receber notificações do Mercado Pago
app.post('/pagamento/webhook', async (req, res) => {
  console.log('Webhook recebido:', req.body);
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar informações do pagamento
      const payment = await paymentClient.get({ id: paymentId });
      console.log('Pagamento encontrado:', payment);
      
      if (payment.status === 'approved') {
        const externalReference = payment.external_reference;
        const produtos = await readJson('produtos.json');
        const pedidos = await readJson('pedidos.json');

        // Find pending pedidos with matching external_reference
        const pendingPedidos = pedidos.filter(p => p.external_reference === externalReference && p.status === 'Pendente');

        if (pendingPedidos.length > 0) {
          for (const pedido of pendingPedidos) {
            // Update status
            pedido.status = 'Aprovado';
            pedido.payment_id = paymentId;

            // Debit stock properly: se havia reserva, consumir reservado e debitar estoque
            if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
              for (const it of pedido.itens) {
                const produtoId = it.produtoId || it.id || it.produtoId;
                const quantidade = it.quantidade || it.quantity || 0;
                const prodIdx = produtos.findIndex(p => String(p.id) === String(produtoId));
                if (prodIdx !== -1) {
                  const reservado = produtos[prodIdx].reservado ?? 0;
                  // Reduzir estoque fisico
                  produtos[prodIdx].estoque = (produtos[prodIdx].estoque ?? 0) - quantidade;
                  // Diminuir reserva correspondente
                  produtos[prodIdx].reservado = Math.max(0, reservado - quantidade);
                  console.log(`Webhook aprova: produto ${produtoId} - estoque agora ${produtos[prodIdx].estoque}, reservado agora ${produtos[prodIdx].reservado}`);
                }
              }
            } else {
              const produto = produtos.find(p => String(p.id) === String(pedido.produtoId));
              if (produto) {
                const prodIdx = produtos.findIndex(p => String(p.id) === String(pedido.produtoId));
                const quantidade = pedido.quantidade || 0;
                const reservado = produtos[prodIdx].reservado ?? 0;
                produtos[prodIdx].estoque = (produtos[prodIdx].estoque ?? 0) - quantidade;
                produtos[prodIdx].reservado = Math.max(0, reservado - quantidade);
                console.log(`Webhook aprova (legado): produto ${pedido.produtoId} - estoque agora ${produtos[prodIdx].estoque}, reservado agora ${produtos[prodIdx].reservado}`);
              }
            }
          }

          await writeJson('produtos.json', produtos);
          await writeJson('pedidos.json', pedidos);

          console.log('Pedidos atualizados com sucesso via webhook:', pendingPedidos.length, 'para externalReference:', externalReference);
        }
      }
    }
    
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.sendStatus(500);
  }
});

console.log('✅ Rota /pagamento/webhook registrada');

// Função para gerar token único
function gerarToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('Token recebido no header:', token ? 'PRESENTE' : 'AUSENTE');
  console.log('Headers recebidos:', JSON.stringify(req.headers, null, 2));

  if (!token) {
    console.log('ERRO: Token não fornecido');
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  // Verificar se o token é válido comparando com o último token do usuário
  const usuarios = require('./usuarios.json'); // Carregar usuários (simplificado)
  console.log('Procurando usuário com token:', token.substring(0, 10) + '...');
  const usuario = usuarios.find(u => u.tokenAtual === token);

  if (!usuario) {
    // Verificar se é token de admin
    if (token === adminToken && adminTokenExpiracao && Date.now() <= adminTokenExpiracao) {
      console.log('SUCESSO: Admin autenticado');
      req.usuario = { id: 'admin', tipo: 'admin' };
      return next();
    }
    console.log('ERRO: Token inválido ou expirado. Usuários encontrados:', usuarios.length);
    console.log('Tokens dos usuários:', usuarios.map(u => ({ id: u.id, token: u.tokenAtual ? u.tokenAtual.substring(0, 10) + '...' : 'SEM TOKEN' })));
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }

  // Verificar se o token expirou
  if (usuario.tokenExpiracao && Date.now() > usuario.tokenExpiracao) {
    console.log('ERRO: Token expirado para usuário:', usuario.id);
    return res.status(401).json({ erro: 'Token expirado' });
  }

  console.log('SUCESSO: Usuário autenticado:', usuario.id);
  req.usuario = usuario;
  next();
}
function gerarComprovante() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CMP-${timestamp}-${random}`.toUpperCase();
}
async function limparPedidosExpirados() {
  try {
    const pedidos = await readJson('pedidos.json');
    const agora = new Date();
    let alterado = false;

    for (const pedido of pedidos) {
      if (pedido.status === 'Pendente' && pedido.tipo !== 'resgate') {
        // Converter a data do pedido para Date
        const dataPedido = new Date(pedido.data.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6'));
        const diffMinutos = (agora - dataPedido) / (1000 * 60);

        if (diffMinutos > 10) {
          pedido.status = 'Recusado';
          alterado = true;
          console.log(`Pedido ${pedido.id} expirado após ${Math.floor(diffMinutos)} minutos, marcado como Recusado`);
          // Liberar reservas associadas ao pedido expirado
          try {
            const produtos = await readJson('produtos.json');
            if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
              for (const it of pedido.itens) {
                const prodIdx = produtos.findIndex(p => String(p.id) === String(it.produtoId));
                const quantidade = it.quantidade || 0;
                if (prodIdx !== -1) {
                  produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
                  console.log(`Reserva liberada (expirado) para produto ${it.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
                }
              }
            } else {
              const prodIdx = produtos.findIndex(p => String(p.id) === String(pedido.produtoId));
              if (prodIdx !== -1) {
                const quantidade = pedido.quantidade || 1;
                if ((produtos[prodIdx].reservado ?? 0) >= quantidade) {
                  produtos[prodIdx].reservado = Math.max(0, (produtos[prodIdx].reservado ?? 0) - quantidade);
                  console.log(`Reserva liberada (expirado legado) para produto ${pedido.produtoId}: liberado ${quantidade}, reservado agora ${produtos[prodIdx].reservado}`);
                } else {
                  produtos[prodIdx].estoque = (produtos[prodIdx].estoque ?? 0) + quantidade;
                  console.log(`Estoque devolvido (expirado legado) para produto ${pedido.produtoId}: +${quantidade}, estoque agora ${produtos[prodIdx].estoque}`);
                }
              }
            }
            await writeJson('produtos.json', produtos);
          } catch (err) {
            console.error('Erro ao liberar reservas de pedido expirado:', err);
          }
        }
      }
    }

    // Excluir pedidos recusados após 1 hora
    const pedidosParaExcluir = [];
    for (let i = pedidos.length - 1; i >= 0; i--) {
      const pedido = pedidos[i];
      if (pedido.status === 'Recusado') {
        const dataPedido = new Date(pedido.data.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6'));
        const diffHoras = (agora - dataPedido) / (1000 * 60 * 60);
        if (diffHoras > 1) {
          pedidosParaExcluir.push(pedido.id);
          pedidos.splice(i, 1);
          alterado = true;
          console.log(`Pedido ${pedido.id} recusado excluído após ${Math.floor(diffHoras)} horas`);
        }
      }
    }

    if (alterado) {
      await writeJson('pedidos.json', pedidos);
      console.log('Pedidos expirados atualizados');
      if (pedidosParaExcluir.length > 0) {
        console.log(`Pedidos excluídos: ${pedidosParaExcluir.join(', ')}`);
      }
    }
  } catch (err) {
    console.error('Erro ao limpar pedidos expirados:', err);
  }
}

// Executar limpeza a cada 1 minuto
setInterval(limparPedidosExpirados, 60 * 1000);

// Executar limpeza inicial
limparPedidosExpirados();

// Adicionar comprovantes aos pedidos existentes que não têm
async function adicionarComprovantesFaltantes() {
  try {
    const pedidos = await readJson('pedidos.json');
    let alterado = false;

    for (const pedido of pedidos) {
      if (!pedido.comprovante) {
        pedido.comprovante = gerarComprovante();
        alterado = true;
      }
    }

    if (alterado) {
      await writeJson('pedidos.json', pedidos);
      console.log('Comprovantes adicionados aos pedidos existentes');
    }
  } catch (err) {
    console.error('Erro ao adicionar comprovantes:', err);
  }
}

adicionarComprovantesFaltantes();

// Servir arquivos estáticos do React (DEVE vir DEPOIS das rotas da API)
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// Catch-all para SPA (Single Page Application) - deve vir DEPOIS de todas as rotas da API
app.use((req, res) => {
  console.log(`🔄 Catch-all handler: ${req.method} ${req.url}`);
  const indexPath = path.join(buildPath, 'index.html');
  console.log(`📁 Index path: ${indexPath}`);
  console.log(`📄 Index exists: ${require('fs').existsSync(indexPath)}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error sending file:', err);
      res.status(500).send('Error loading page');
    } else {
      console.log('✅ File sent successfully');
    }
  });
});

console.log('🔄 Iniciando servidor...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT} (0.0.0.0)`);
  console.log(`📋 Teste: http://localhost:${PORT}/produtos`);
  console.log(`💳 MP Access Token: ${process.env.MP_ACCESS_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
  console.log('✅ Servidor iniciado com sucesso!');
});
