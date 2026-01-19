import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  salvarCarrinhoUsuario,
  carregarCarrinhoUsuario,
  limparCarrinhoUsuario,
  transferirCarrinhoParaUsuario
} from '../utils/carrinhoUtils';
// Substitui modais por um painel unificado de pagamento

function Carrinho({ cliente, setCliente }) {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [showEntregaSelector, setShowEntregaSelector] = useState(false);
  const [metodoEntrega, setMetodoEntrega] = useState('retirada');
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [preferenceInitPoint, setPreferenceInitPoint] = useState(null);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({ pagamentoCartao: true, pagamentoPix: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (cliente && cliente.id) {
      // Se usuário está logado, carregar carrinho do usuário
      // Primeiro tenta transferir carrinho global se existir
      const carrinhoUsuario = transferirCarrinhoParaUsuario(cliente.id);
      setItens(carrinhoUsuario);
      calcularTotal(carrinhoUsuario);
    } else {
      // Se não está logado, carregar carrinho global (compatibilidade)
      const carrinhoSalvo = localStorage.getItem('carrinho');
      if (carrinhoSalvo) {
        const carrinho = JSON.parse(carrinhoSalvo);
        setItens(carrinho);
        calcularTotal(carrinho);
      }
    }
  }, [cliente]);

  useEffect(() => {
    // Carregar configurações de pagamento e dados da empresa
    fetch('/configuracoes')
      .then(res => res.json())
      .then(data => {
        setConfiguracoes(data || {});
      })
      .catch(err => console.error('Erro ao carregar configurações:', err));
  }, []);

  const calcularTotal = (itensCarrinho) => {
    const totalCalculado = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    setTotal(totalCalculado);
  };

  const removerItem = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);

    if (cliente && cliente.id) {
      salvarCarrinhoUsuario(cliente.id, novosItens);
    } else {
      localStorage.setItem('carrinho', JSON.stringify(novosItens));
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }

    calcularTotal(novosItens);
  };

  const alterarQuantidade = (index, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    const novosItens = [...itens];
    novosItens[index].quantidade = novaQuantidade;
    setItens(novosItens);

    if (cliente && cliente.id) {
      salvarCarrinhoUsuario(cliente.id, novosItens);
    } else {
      localStorage.setItem('carrinho', JSON.stringify(novosItens));
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }

    calcularTotal(novosItens);
  };

  const finalizarCompra = async () => {
    if (!cliente || !cliente.id) {
      alert('Por favor, faça login para finalizar a compra.');
      navigate('/login');
      return;
    }

    if (itens.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    // Mostrar seleção de método de entrega antes do pagamento
    setShowEntregaSelector(true);
  };

  const processarPagamento = async (tipoPagamento, metodoEntregaParam) => {
    try {
      setShowEntregaSelector(false);
      
      console.log('🔍 Verificando estoque antes do pagamento...');
      // Verificar estoque atualizado antes do pagamento
      const produtosAtualizados = await fetch('/produtos').then(r => r.json());
      console.log('Produtos atualizados:', produtosAtualizados);

      for (const item of itens) {
        const produtoAtual = produtosAtualizados.find(p => String(p.id) === String(item.id));
        console.log('Verificando produto:', item.id, 'estoque atual:', produtoAtual?.estoque);
        if (!produtoAtual || (produtoAtual.estoque ?? 0) < item.quantidade) {
          console.log('ERRO: Estoque insuficiente');
          alert(`Estoque insuficiente para ${item.nome}. Disponível: ${produtoAtual?.estoque ?? 0}`);
          return;
        }
      }

      console.log('Criando preferência de pagamento...');
      // Criar preferência de pagamento no Mercado Pago
      const itensParaPagamento = itens.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      }));
      console.log('Itens para pagamento:', itensParaPagamento);

      const res = await fetch('/pagamento/criar-carrinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: cliente.id,
          itens: itensParaPagamento,
          tipoPagamento: tipoPagamento,
          metodoEntrega: metodoEntregaParam || metodoEntrega
        })
      });

      console.log('Resposta da API:', res.status, res.statusText);

      if (!res.ok) {
        const erro = await res.json();
        console.log('ERRO na resposta:', erro);
        alert(erro.erro || 'Erro ao iniciar pagamento.');
        return;
      }

      const data = await res.json();
      console.log('Dados recebidos:', data);

      // Mostrar painel de pagamento unificado com link do Mercado Pago
      setPreferenceId(data.preference_id);
      setPreferenceInitPoint(data.init_point);
      setShowPaymentPanel(true);
      console.log('Painel de pagamento aberto com preferenceId:', data.preference_id);

    } catch (err) {
      console.error('ERRO GERAL:', err);
      alert('Erro ao conectar com o servidor.');
    }
  };

  const fecharPixModal = () => {
    setShowPixModal(false);
    setPreferenceId(null);
    // Limpar carrinho quando fechar o modal
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  const fecharCreditCardModal = () => {
    setShowCreditCardModal(false);
    setPreferenceId(null);
    // Limpar carrinho quando fechar o modal
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  const fecharPaymentMethodModal = () => {
  };


  const fecharPaymentPanel = () => {
    setShowPaymentPanel(false);
    setPreferenceId(null);
    setPreferenceInitPoint(null);
    // Limpar carrinho quando fechar o painel
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  const limparCarrinho = () => {
    setItens([]);
    if (cliente && cliente.id) {
      limparCarrinhoUsuario(cliente.id);
    } else {
      localStorage.removeItem('carrinho');
      // Disparar evento customizado para atualizar o contador
      window.dispatchEvent(new CustomEvent('carrinhoChanged'));
    }
    setTotal(0);
  };

  return (
    <div style={{maxWidth:400,margin:'32px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:20,fontSize:28}}>Carrinho de Compras</h2>
      
      {itens.length === 0 ? (
        <p style={{textAlign:'center',color:'#888',fontSize:16}}>Carrinho vazio</p>
      ) : (
        <>
          <div style={{marginBottom:20}}>
            {itens.map((item, index) => (
              <div key={index} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #eee'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'bold'}}>{item.nome}</div>
                  <div style={{fontSize:14,color:'#666'}}>R$ {item.preco.toFixed(2)} cada</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <button 
                    onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                    style={{
                      width:35,
                      height:35,
                      borderRadius:8,
                      border:'2px solid #007bff',
                      background:'#fff',
                      cursor:'pointer',
                      fontSize:18,
                      fontWeight:'bold',
                      color:'#007bff',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      lineHeight:1
                    }}
                  >
                    −
                  </button>
                  <span style={{minWidth:30,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{item.quantidade}</span>
                  <button 
                    onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                    style={{
                      width:35,
                      height:35,
                      borderRadius:8,
                      border:'2px solid #28a745',
                      background:'#fff',
                      cursor:'pointer',
                      fontSize:18,
                      fontWeight:'bold',
                      color:'#28a745',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      lineHeight:1
                    }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removerItem(index)}
                    style={{marginLeft:10,padding:'5px 10px',background:'#dc3545',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:12}}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{borderTop:'2px solid #eee',paddingTop:20,marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:'bold',textAlign:'center'}}>
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
          
          <div style={{display:'flex',gap:10}}>
            <button
              onClick={finalizarCompra}
              style={{flex:1,padding:'12px 0',background:'#28a745',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold',fontSize:16}}
            >
              Finalizar Compra
            </button>
            <button
              onClick={limparCarrinho}
              style={{padding:'12px 20px',background:'#6c757d',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold',fontSize:14}}
            >
              Limpar
            </button>
          </div>
        </>
      )}

      {/* Seletor de método de entrega (antes do modal de pagamento) */}
      {showEntregaSelector && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100}}>
          <div style={{background:'#fff',padding:24,borderRadius:12,maxWidth:520,width:'90%'}}>
            <h3 style={{marginTop:0}}>Escolha o método de entrega</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
              <label style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="radio" name="metodoEntrega" value="retirada" checked={metodoEntrega==='retirada'} onChange={() => setMetodoEntrega('retirada')} />
                <div style={{marginLeft:6}}><strong>Retirada na loja</strong><div style={{fontSize:12,color:'#666'}}>{configuracoes.endereco || 'Endereço da empresa não configurado'}</div></div>
              </label>
              {configuracoes.habilitarEntrega !== false ? (
                <label style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="radio" name="metodoEntrega" value="entrega" checked={metodoEntrega==='entrega'} onChange={() => setMetodoEntrega('entrega')} />
                  <div style={{marginLeft:6}}><strong>Entrega</strong><div style={{fontSize:12,color:'#666'}}>{(cliente && cliente.endereco) ? cliente.endereco : 'Usaremos o endereço do perfil do cliente'}</div></div>
                </label>
              ) : null}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}>
              <button onClick={() => setShowEntregaSelector(false)} style={{padding:'8px 12px',background:'#6c757d',color:'#fff',border:'none',borderRadius:6}}>Cancelar</button>
              <button onClick={() => { setShowEntregaSelector(false); processarPagamento('mercadopago', metodoEntrega); }} style={{padding:'8px 12px',background:'#28a745',color:'#fff',border:'none',borderRadius:6}}>Continuar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de método de pagamento removido: pagamento é iniciado diretamente */}

      {/* Painel de pagamento unificado (abre Mercado Pago) */}
      {showPaymentPanel && preferenceInitPoint && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100}}>
          <div style={{background:'#fff',padding:24,borderRadius:12,maxWidth:520,width:'90%'}}>
            <h3 style={{marginTop:0}}>Pagar agora</h3>
            <p>Você será redirecionado para o Mercado Pago para concluir o pagamento.</p>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}>
              <button onClick={fecharPaymentPanel} style={{padding:'8px 12px',background:'#6c757d',color:'#fff',border:'none',borderRadius:6}}>Cancelar</button>
              <button onClick={() => { window.open(preferenceInitPoint, '_blank'); fecharPaymentPanel(); }} style={{padding:'8px 12px',background:'#007bff',color:'#fff',border:'none',borderRadius:6}}>Pagar Agora no Mercado Pago</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carrinho;