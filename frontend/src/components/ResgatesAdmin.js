import React, { useEffect, useState } from 'react';

function ResgatesAdmin() {
  const [resgates, setResgates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [comprovante, setComprovante] = useState('');
  const [filtros, setFiltros] = useState({
    status: '',
    usuario: '',
    produto: '',
    dataInicio: '',
    dataFim: '',
    comprovanteFiltro: ''
  });

  const resgatesFiltrados = resgates.filter(r => {
    if (filtros.status && r.status !== filtros.status) return false;
    if (filtros.usuario && !String(r.usuarioNome || r.usuarioId || '').toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
    if (filtros.produto && !String(r.produtoNome || r.produtoId || '').toLowerCase().includes(filtros.produto.toLowerCase())) return false;
    if (filtros.comprovanteFiltro && !String(r.comprovante || '').includes(filtros.comprovanteFiltro)) return false;
    if (filtros.dataInicio && r.data && new Date(r.data) < new Date(filtros.dataInicio)) return false;
    if (filtros.dataFim && r.data && new Date(r.data) > new Date(filtros.dataFim)) return false;
    return true;
  });

  useEffect(() => {
    async function fetchResgates() {
      setLoading(true);
      setErro('');
      try {
        const res = await fetch('/pedidos');
        if (!res.ok) throw new Error('Erro ao buscar resgates');
        const data = await res.json();
        setResgates(data);
      } catch (e) {
        setErro('Erro ao buscar resgates.');
      }
      setLoading(false);
    }
    fetchResgates();
  }, []);

  const aprovarPedido = async () => {
    if (!comprovante.trim()) {
      alert('Digite o número do comprovante.');
      return;
    }
    const pedido = resgates.find(r => String(r.comprovante) === String(comprovante.trim()));
    if (!pedido) {
      alert('Comprovante não encontrado.');
      return;
    }
    if (pedido.status !== 'Pendente') {
      alert('Este pedido já foi processado.');
      return;
    }
    try {
      const res = await fetch(`/pedidos/${pedido.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Aprovado' })
      });
      if (!res.ok) throw new Error('Erro ao aprovar pedido');
      setResgates(prev => prev.map(r => r.id === pedido.id ? { ...r, status: 'Aprovado' } : r));
      setComprovante('');
      alert('Pedido aprovado com sucesso!');
      window.location.reload(); // Recarregar para atualizar dados
    } catch (e) {
      alert('Erro ao aprovar pedido: ' + e.message);
    }
  };

  const recusarPedido = async () => {
    if (!comprovante.trim()) {
      alert('Digite o número do comprovante.');
      return;
    }
    const pedido = resgates.find(r => String(r.comprovante) === String(comprovante.trim()));
    if (!pedido) {
      alert('Comprovante não encontrado.');
      return;
    }
    if (pedido.status !== 'Pendente') {
      alert('Este pedido já foi processado.');
      return;
    }
    try {
      const res = await fetch(`/pedidos/${pedido.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Recusado' })
      });
      if (!res.ok) throw new Error('Erro ao recusar pedido');
      setResgates(prev => prev.map(r => r.id === pedido.id ? { ...r, status: 'Recusado' } : r));
      setComprovante('');
      alert('Pedido recusado com sucesso! Pontos devolvidos ao usuário.');
      window.location.reload(); // Recarregar para atualizar dados
    } catch (e) {
      alert('Erro ao recusar pedido: ' + e.message);
    }
  };

  const excluirPedido = async (pedidoId) => {
    if (!confirm('Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const res = await fetch(`/pedidos/${pedidoId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erro ao excluir pedido');
      setResgates(prev => prev.filter(r => r.id !== pedidoId));
      alert('Pedido excluído com sucesso!');
    } catch (e) {
      alert('Erro ao excluir pedido: ' + e.message);
    }
  };

  return (
    <div style={{maxWidth:1100,margin:'40px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:24,fontSize:28}}>Painel de Resgates (Admin)</h2>
      {loading && <div>Carregando resgates...</div>}
      {erro && <div style={{color:'#b22',marginBottom:16}}>{erro}</div>}
      {!loading && !erro && (
        <div style={{marginBottom:24, display:'flex', gap:16, alignItems:'center'}}>
          <label style={{fontWeight:'bold'}}>
            Comprovante:
            <input
              type="text"
              value={comprovante}
              onChange={(e) => setComprovante(e.target.value)}
              placeholder="Digite o nº do comprovante"
              style={{
                marginLeft:8,
                padding:'8px 12px',
                border:'1px solid #ccc',
                borderRadius:4,
                fontSize:16
              }}
            />
          </label>
          <button 
            onClick={aprovarPedido}
            style={{
              background:'#2d8a4b',
              color:'#fff',
              border:'none',
              padding:'12px 24px',
              borderRadius:8,
              cursor:'pointer',
              fontWeight:'bold',
              fontSize:16
            }}
          >
            Aprovar Pedido
          </button>
          <button 
            onClick={recusarPedido}
            style={{
              background:'#b22',
              color:'#fff',
              border:'none',
              padding:'12px 24px',
              borderRadius:8,
              cursor:'pointer',
              fontWeight:'bold',
              fontSize:16
            }}
          >
            Recusar Pedido
          </button>
        </div>
      )}
      {!loading && !erro && (
        <div style={{marginBottom:24, padding:16, background:'#f6f8fa', borderRadius:8, border:'1px solid #eee'}}>
          <h3 style={{marginTop:0, marginBottom:16, color:'#1D2A5A'}}>Filtros de Pesquisa</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:16, alignItems:'center'}} className="filtros-resgates">
            <label>
              Status:
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}
              >
                <option value="">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Recusado">Recusado</option>
              </select>
            </label>
            <label>
              Usuário:
              <input
                type="text"
                value={filtros.usuario}
                onChange={(e) => setFiltros({...filtros, usuario: e.target.value})}
                placeholder="Nome ou ID do usuário"
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4, width:150}}
              />
            </label>
            <label>
              Produto:
              <input
                type="text"
                value={filtros.produto}
                onChange={(e) => setFiltros({...filtros, produto: e.target.value})}
                placeholder="Nome ou ID do produto"
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4, width:150}}
              />
            </label>
            <label>
              Comprovante:
              <input
                type="text"
                value={filtros.comprovanteFiltro}
                onChange={(e) => setFiltros({...filtros, comprovanteFiltro: e.target.value})}
                placeholder="Número do comprovante"
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4, width:150}}
              />
            </label>
            <label>
              Data Início:
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}
              />
            </label>
            <label>
              Data Fim:
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}
              />
            </label>
            <button
              onClick={() => setFiltros({status:'', usuario:'', produto:'', dataInicio:'', dataFim:'', comprovanteFiltro:''})}
              style={{
                background:'#6c757d',
                color:'#fff',
                border:'none',
                padding:'8px 16px',
                borderRadius:4,
                cursor:'pointer',
                fontWeight:'bold'
              }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
      {!loading && !erro && (
        <>
          <div style={{overflowX: 'auto', marginTop:16}} className="tabela-resgates-container">
            <table style={{width:'100%',borderCollapse:'collapse', minWidth: '800px'}} className="tabela-resgates">
          <thead>
            <tr style={{background:'#f6f8fa'}}>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>ID</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Usuário</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Produto</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Qtd</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Data</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Pontos</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Status</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Comprovante</th>
              <th style={{padding:6,border:'1px solid #eee', fontSize:14}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {resgatesFiltrados.length === 0 && (
              <tr><td colSpan={9} style={{textAlign:'center',padding:16, fontSize:14}}>Nenhum resgate encontrado com os filtros aplicados.</td></tr>
            )}
            {resgatesFiltrados.map(r => (
              <tr key={r.id}>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.id}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.usuarioNome || r.usuarioId || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.produtoNome || r.produtoId || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.quantidade || 1}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.data || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.pontos || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>{r.status || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14, fontWeight:'bold',letterSpacing:2}}>{r.comprovante || '-'}</td>
                <td style={{padding:6,border:'1px solid #eee', fontSize:14}}>
                  <button 
                    onClick={() => excluirPedido(r.id)}
                    style={{
                      background:'#dc3545',
                      color:'#fff',
                      border:'none',
                      padding:'4px 8px',
                      borderRadius:4,
                      cursor:'pointer',
                      fontSize:12,
                      fontWeight:'bold'
                    }}
                    title="Excluir pedido permanentemente"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="tabela-resgates-mobile" style={{display: 'none'}}>
          {resgatesFiltrados.length === 0 && (
            <div style={{textAlign:'center',padding:16, fontSize:14, background:'#f6f8fa', borderRadius:8, marginTop:16}}>
              Nenhum resgate encontrado com os filtros aplicados.
            </div>
          )}
          {resgatesFiltrados.map(r => (
            <div key={r.id} style={{border:'1px solid #eee', borderRadius:8, padding:16, marginBottom:16, background:'#fff', boxShadow:'0 2px 4px #0001'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <strong>ID: {r.id}</strong>
                <span style={{fontSize:12, color: r.status === 'Aprovado' ? '#2d8a4b' : r.status === 'Recusado' ? '#b22' : '#f39c12', fontWeight:'bold'}}>
                  {r.status || '-'}
                </span>
              </div>
              <div style={{marginBottom:4}}><strong>Usuário:</strong> {r.usuarioNome || r.usuarioId || '-'}</div>
              <div style={{marginBottom:4}}><strong>Produto:</strong> {r.produtoNome || r.produtoId || '-'}</div>
              <div style={{marginBottom:4}}><strong>Quantidade:</strong> {r.quantidade || 1}</div>
              <div style={{marginBottom:4}}><strong>Data:</strong> {r.data || '-'}</div>
              <div style={{marginBottom:4}}><strong>Pontos:</strong> {r.pontos || '-'}</div>
              <div style={{marginBottom:8}}><strong>Comprovante:</strong> <span style={{fontWeight:'bold', letterSpacing:1}}>{r.comprovante || '-'}</span></div>
              <button 
                onClick={() => excluirPedido(r.id)}
                style={{
                  background:'#dc3545',
                  color:'#fff',
                  border:'none',
                  padding:'6px 12px',
                  borderRadius:4,
                  cursor:'pointer',
                  fontSize:12,
                  fontWeight:'bold'
                }}
                title="Excluir pedido permanentemente"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

export default ResgatesAdmin;
