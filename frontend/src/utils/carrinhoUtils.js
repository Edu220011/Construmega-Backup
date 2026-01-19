// Utilitários para gerenciamento de carrinho por usuário

// Chave base para localStorage
const CARRINHO_KEY = 'carrinho_usuario_';

// Salvar carrinho de um usuário específico
export const salvarCarrinhoUsuario = (usuarioId, itens) => {
  if (!usuarioId) return;
  const chave = CARRINHO_KEY + usuarioId;
  localStorage.setItem(chave, JSON.stringify(itens));
  
  // Disparar evento customizado para atualizar o contador
  window.dispatchEvent(new CustomEvent('carrinhoChanged', { 
    detail: { usuarioId, itens } 
  }));
};

// Carregar carrinho de um usuário específico
export const carregarCarrinhoUsuario = (usuarioId) => {
  if (!usuarioId) return [];
  const chave = CARRINHO_KEY + usuarioId;
  const carrinhoSalvo = localStorage.getItem(chave);
  return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
};

// Limpar carrinho de um usuário específico
export const limparCarrinhoUsuario = (usuarioId) => {
  if (!usuarioId) return;
  const chave = CARRINHO_KEY + usuarioId;
  localStorage.removeItem(chave);
  
  // Disparar evento customizado para atualizar o contador
  window.dispatchEvent(new CustomEvent('carrinhoChanged', { 
    detail: { usuarioId } 
  }));
};

// Adicionar item ao carrinho do usuário
export const adicionarItemCarrinhoUsuario = (usuarioId, novoItem) => {
  if (!usuarioId) return;

  const itensAtuais = carregarCarrinhoUsuario(usuarioId);
  const itemExistente = itensAtuais.find(item => String(item.id) === String(novoItem.id));

  if (itemExistente) {
    // Se o item já existe, aumenta a quantidade
    itemExistente.quantidade += novoItem.quantidade || 1;
  } else {
    // Se não existe, adiciona o item
    itensAtuais.push({
      ...novoItem,
      quantidade: novoItem.quantidade || 1
    });
  }

  salvarCarrinhoUsuario(usuarioId, itensAtuais);
  return itensAtuais;
};

// Transferir carrinho global (anônimo) para usuário logado
export const transferirCarrinhoParaUsuario = (usuarioId) => {
  const carrinhoGlobal = localStorage.getItem('carrinho');
  if (carrinhoGlobal && usuarioId) {
    const itensGlobais = JSON.parse(carrinhoGlobal);
    const itensUsuario = carregarCarrinhoUsuario(usuarioId);

    // Mesclar carrinhos (itens globais têm prioridade)
    const carrinhoMesclado = [...itensUsuario];

    itensGlobais.forEach(itemGlobal => {
      const itemExistente = carrinhoMesclado.find(item => String(item.id) === String(itemGlobal.id));
      if (itemExistente) {
        itemExistente.quantidade += itemGlobal.quantidade;
      } else {
        carrinhoMesclado.push(itemGlobal);
      }
    });

    salvarCarrinhoUsuario(usuarioId, carrinhoMesclado);
    localStorage.removeItem('carrinho'); // Limpar carrinho global
    return carrinhoMesclado;
  }
  return carregarCarrinhoUsuario(usuarioId);
};