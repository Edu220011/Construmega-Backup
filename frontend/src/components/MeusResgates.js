
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComprovanteCard from './ComprovanteCard';

function MeusResgates({ cliente, empresaConfig }) {
  const [resgates, setResgates] = useState([]);
  const [erro, setErro] = useState("");
  const [buscaComprovante, setBuscaComprovante] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  // Se vier por rota dinâmica, usa o id da URL, senão usa o cliente logado
  const usuarioId = params.id || cliente?.id;
  const [abaAtiva, setAbaAtiva] = useState('todos');

  // Proteção: se está na rota dinâmica e existe cliente logado, só permite se o id da URL for igual ao do cliente
  useEffect(() => {
    if (params.id && cliente && String(params.id) !== String(cliente.id)) {
      setErro("Acesso negado: você não pode visualizar pedidos de outro usuário.");
      setResgates([]);
      // Opcional: redireciona para a página do próprio usuário
      // navigate(`/meus-pedidos/${cliente.id}`, { replace: true });
      return;
    }
    setErro("");
    if (!usuarioId) return;
    const token = localStorage.getItem('token');
    console.log('Token no localStorage:', token ? 'EXISTE' : 'NÃO EXISTE');
    console.log('Fazendo requisição para:', `/pedidos/${usuarioId}`);
    fetch(`/pedidos/${usuarioId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('Resposta da API:', res.status, res.statusText);
        if (res.status === 401) {
          console.log('Erro 401 - Token inválido ou expirado');
          setErro("Sessão expirada. Faça login novamente.");
          // Invalidar token e redirecionar para login
          localStorage.removeItem('token');
          localStorage.removeItem('cliente');
          localStorage.removeItem('admin');
          navigate('/login');
          return [];
        }
        return res.json();
      })
      .then(data => {
        console.log('Dados recebidos:', data);
        setResgates(data);
      })
      .catch(err => {
        console.error('Erro na requisição:', err);
        setErro("Erro ao carregar pedidos.");
      });
  }, [usuarioId, params.id, cliente]);

  // Filtrar resgates baseado na aba ativa
  const resgatesFiltrados = resgates.filter(r => {
    if (abaAtiva === 'todos') return true;
    if (abaAtiva === 'pendentes') return r.status === 'Pendente';
    if (abaAtiva === 'aprovados') return r.status === 'Aprovado';
    if (abaAtiva === 'recusados') return r.status === 'Recusado';
    if (abaAtiva === 'pontos') return r.tipo === 'resgate';
    if (abaAtiva === 'vendas') return r.tipo === 'venda';
    return true;
  }).sort((a, b) => {
    // Ordenar por status: Aprovado primeiro, depois Pendente, Recusado
    const order = { 'Aprovado': 1, 'Pendente': 2, 'Recusado': 3 };
    return (order[a.status] || 4) - (order[b.status] || 4);
  });

  // Função para copiar comprovante
  const copiarComprovante = (comprovante) => {
    if (!comprovante) {
      alert('Não há código para copiar');
      return;
    }
    navigator.clipboard.writeText(comprovante.toString()).then(() => {
      alert('Código do comprovante copiado: ' + comprovante);
    }).catch(() => {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = comprovante.toString();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Código do comprovante copiado: ' + comprovante);
    });
  };

  // Função para imprimir comprovante
  const imprimirComprovante = (resgate) => {
    const metodoLabel = resgate.metodoEntrega ? (resgate.metodoEntrega === 'retirada' ? 'Retirada na loja' : 'Entrega') : 'Não especificado';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprovante de Compra - ${resgate.comprovante}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .comprovante { font-size: 24px; font-weight: bold; color: #333; background: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; }
            .info { margin: 10px 0; }
            .status { padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
            .aprovado { background-color: #28a745; }
            .pendente { background-color: #ffc107; color: black; }
            .recusado { background-color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Comprovante de Compra</h1>
            ${empresaConfig?.logo ? `<div style="text-align: center; margin: 20px 0;"><img src="${empresaConfig.logo}" alt="Logo da Empresa" style="max-width: 200px; max-height: 100px; object-fit: contain;" /></div>` : ''}
            <div class="comprovante">N° ${resgate.comprovante}</div>
          </div>
          <div class="info"><strong>Data:</strong> ${resgate.data}</div>
          <div class="info"><strong>Cliente:</strong> ${resgate.usuarioNome} (ID: ${resgate.usuarioId})</div>
          <div class="info"><strong>Produtos:</strong>
            ${Array.isArray(resgate.itens) ? (`<ul style="margin:6px 0 0 18px; padding:0;">${resgate.itens.map(i => `<li>${(i.title||i.produtoNome||i.nome||i.produto)} — ${i.quantity||i.quantidade||1}</li>`).join('')}</ul>`) : `<div style="margin-top:6px">${resgate.produtoNome || resgate.produto} — ${resgate.quantidade || 1}</div>`}
          </div>
          <div class="info"><strong>Valor:</strong> ${resgate.tipo === 'resgate' ? `P ${resgate.pontos}` : `R$ ${(resgate.valorProduto * (resgate.quantidade || 1)).toFixed(2)}`}</div>
          <div class="info"><strong>Método:</strong> ${metodoLabel}</div>
          ${resgate.metodoEntrega === 'entrega' ? `<div class="info"><strong>Endereço de Entrega:</strong> ${resgate.localRetirada || '(não informado)'}</div>` : ''}
          ${resgate.metodoEntrega === 'retirada' || (!resgate.metodoEntrega && resgate.localRetirada) ? `<div class="info"><strong>Local de Retirada:</strong> ${resgate.localRetirada}</div>` : ''}
          <div class="info"><strong>WhatsApp:</strong> ${empresaConfig?.telefoneEmpresa || '(11) 99999-9999'}</div>
          <div class="info"><strong>Status:</strong> <span class="status ${resgate.status?.toLowerCase()}">${resgate.status}</span></div>
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            ${resgate.metodoEntrega === 'entrega' ? 'O produto será entregue no endereço informado.' : 'Apresente este comprovante na loja para retirada do produto.'}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{maxWidth:800,margin:'32px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:10,fontSize:28}}>Meus Pedidos</h2>
      
      {/* Campo de busca por comprovante */}
      <div style={{textAlign:'center',marginBottom:20}}>
        <input
          type="text"
          placeholder="Buscar por código do comprovante..."
          value={buscaComprovante}
          onChange={(e) => setBuscaComprovante(e.target.value)}
          style={{
            padding:'10px 16px',
            borderRadius:8,
            border:'2px solid #ddd',
            fontSize:16,
            width:'100%',
            maxWidth:300,
            outline:'none',
            transition:'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>
      
      {/* Abas de filtro - sempre visíveis */}
      <div className="filtros-container">
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('todos')} 
          style={{
            '--btn-bg': abaAtiva === 'todos' ? '#007bff' : '#fff',
            '--btn-color': abaAtiva === 'todos' ? '#fff' : '#333'
          }}
        >
          Todos ({resgates.length})
        </button>
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('pendentes')} 
          style={{
            '--btn-bg': abaAtiva === 'pendentes' ? '#ffc107' : '#fff',
            '--btn-color': abaAtiva === 'pendentes' ? '#fff' : '#333'
          }}
        >
          Pendentes ({resgates.filter(r => r.status && r.status.toLowerCase() === 'pendente').length})
        </button>
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('aprovados')} 
          style={{
            '--btn-bg': abaAtiva === 'aprovados' ? '#28a745' : '#fff',
            '--btn-color': abaAtiva === 'aprovados' ? '#fff' : '#333'
          }}
        >
          Aprovados ({resgates.filter(r => r.status && r.status.toLowerCase() === 'aprovado').length})
        </button>
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('recusados')} 
          style={{
            '--btn-bg': abaAtiva === 'recusados' ? '#dc3545' : '#fff',
            '--btn-color': abaAtiva === 'recusados' ? '#fff' : '#333'
          }}
        >
          Recusados ({resgates.filter(r => r.status && r.status.toLowerCase() === 'recusado').length})
        </button>
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('pontos')} 
          style={{
            '--btn-bg': abaAtiva === 'pontos' ? '#17a2b8' : '#fff',
            '--btn-color': abaAtiva === 'pontos' ? '#fff' : '#333'
          }}
        >
          Pontos ({resgates.filter(r => r.tipo === 'resgate').length})
        </button>
        <button 
          className="filtro-btn"
          onClick={() => setAbaAtiva('vendas')} 
          style={{
            '--btn-bg': abaAtiva === 'vendas' ? '#6f42c1' : '#fff',
            '--btn-color': abaAtiva === 'vendas' ? '#fff' : '#333'
          }}
        >
          Vendas ({resgates.filter(r => r.tipo === 'venda').length})
        </button>
      </div>
      
      {(() => {
        if (erro) {
          return <p style={{textAlign:'center',color:'#b22',fontSize:16}}>{erro}</p>;
        }
        if (!usuarioId) {
          return <p style={{textAlign:'center',color:'#b22',fontSize:16}}>Você precisa estar logado ou acessar com um ID válido para ver os pedidos.</p>;
        }
        if (resgatesFiltrados.length === 0) {
          return <p style={{textAlign:'center',color:'#888',fontSize:16}}>
            {abaAtiva === 'todos' ? 'Nenhum pedido realizado ainda.' : 
             abaAtiva === 'pendentes' ? 'Nenhum pedido pendente.' :
             abaAtiva === 'aprovados' ? 'Nenhum pedido aprovado.' :
             abaAtiva === 'recusados' ? 'Nenhum pedido recusado.' :
             abaAtiva === 'pontos' ? 'Nenhum resgate por pontos realizado ainda.' :
             'Nenhum pedido encontrado.'}
          </p>;
        }
        return <>
          {resgatesFiltrados.some(r => r.status && r.status.toLowerCase() === 'pendente') && (
            <div style={{background:'#fffbe6',border:'1.5px solid #ffe066',color:'#b28500',borderRadius:10,padding:'14px 20px',marginBottom:18,fontWeight:'bold',fontSize:17,textAlign:'center'}}>
              Você possui pedidos pendentes! Passe na loja para retirar seu produto.
            </div>
          )}
          {resgatesFiltrados.some(r => r.status && r.status.toLowerCase() === 'aprovado') && (
            <div style={{background:'#d4edda',border:'1.5px solid #28a745',color:'#155724',borderRadius:10,padding:'14px 20px',marginBottom:18,fontWeight:'bold',fontSize:17,textAlign:'center'}}>
              Você possui pedidos aprovados! Passe na loja para retirar seu produto.
            </div>
          )}
          <div className="comprovantes-grid">
            {resgatesFiltrados.map((r, idx) => (
              <ComprovanteCard
                key={idx}
                resgate={r}
                onCopiar={copiarComprovante}
                onImprimir={imprimirComprovante}
              />
            ))}
          </div>
        </>;
      })()}
    </div>
  );
}

export default MeusResgates;
