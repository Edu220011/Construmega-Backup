import React, { useEffect, useState } from 'react';

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroEstoque, setFiltroEstoque] = useState('todos');
  const [ordemClassificacao, setOrdemClassificacao] = useState('nome');
  const [visualizacao, setVisualizacao] = useState('tabela'); // 'tabela' ou 'grid'

  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  // Filtrar produtos baseado em todos os critérios
  const produtosFiltrados = produtos.filter(p => {
    const matchNome = p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                      String(p.id).includes(termoBusca);
    
    const matchCategoria = filtroCategoria === 'todos' || 
                          (p.categoria && p.categoria.toLowerCase() === filtroCategoria.toLowerCase());
    
    const matchEstoque = filtroEstoque === 'todos' || 
                        (filtroEstoque === 'baixo' && Number(p.estoque) <= 5) ||
                        (filtroEstoque === 'zerado' && Number(p.estoque) === 0) ||
                        (filtroEstoque === 'disponivel' && Number(p.estoque) > 0);
    
    return matchNome && matchCategoria && matchEstoque;
  }).sort((a, b) => {
    switch(ordemClassificacao) {
      case 'nome': return a.nome.localeCompare(b.nome);
      case 'estoque-asc': return Number(a.estoque) - Number(b.estoque);
      case 'estoque-desc': return Number(b.estoque) - Number(a.estoque);
      case 'id': return Number(a.id) - Number(b.id);
      default: return 0;
    }
  });

  // Estatísticas do estoque
  const estatisticas = {
    total: produtos.length,
    semEstoque: produtos.filter(p => Number(p.estoque) === 0).length,
    estoqueBaixo: produtos.filter(p => Number(p.estoque) > 0 && Number(p.estoque) <= 5).length,
    valorTotalEstoque: produtos.reduce((acc, p) => acc + (Number(p.preco) || 0) * (Number(p.estoque) || 0), 0)
  };

  function handleEstoqueChange(id, value) {
    // função removida
  }

  function handleEstoqueSave(id, estoque) {
    // função removida
  }

  // Botões de navegação iguais ao ConfigProduto
  const [idBusca, setIdBusca] = React.useState("");
  const [produtoBuscado, setProdutoBuscado] = React.useState(null);
  const [formAberto, setFormAberto] = React.useState(false);
  const [quantidade, setQuantidade] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [produtosAtualizados, setProdutosAtualizados] = React.useState(null);
  // Remover estoque
  const [formRemoverAberto, setFormRemoverAberto] = React.useState(false);
  const [idBuscaRemover, setIdBuscaRemover] = React.useState("");
  const [produtoRemover, setProdutoRemover] = React.useState(null);
  const [quantidadeRemover, setQuantidadeRemover] = React.useState("");
  const [msgRemover, setMsgRemover] = React.useState("");

  function handleAbrirForm() {
    setFormAberto(true);
    setProdutoBuscado(null);
    setIdBusca("");
    setQuantidade("");
    setMsg("");
  }

  function handleFecharForm() {
    setFormAberto(false);
    setProdutoBuscado(null);
    setIdBusca("");
    setQuantidade("");
    setMsg("");
  }
  function handleAbrirFormRemover() {
    setFormRemoverAberto(true);
    setProdutoRemover(null);
    setIdBuscaRemover("");
    setQuantidadeRemover("");
    setMsgRemover("");
  }
  function handleFecharFormRemover() {
    setFormRemoverAberto(false);
    setProdutoRemover(null);
    setIdBuscaRemover("");
    setQuantidadeRemover("");
    setMsgRemover("");
  }
  function handleBuscarProdutoRemover(e) {
    e.preventDefault();
    const prod = produtos.find(p => String(p.id) === String(idBuscaRemover));
    setProdutoRemover(prod || null);
    setMsgRemover("");
  }
  async function handleRemoverEstoque(e) {
    e.preventDefault();
    if (!produtoRemover || !quantidadeRemover || isNaN(Number(quantidadeRemover))) {
      setMsgRemover("Preencha uma quantidade válida.");
      return;
    }
    if (Number(produtoRemover.estoque) === 0) {
      window.alert("Não é possível remover: o estoque já está zerado!");
      setMsgRemover("");
      return;
    }
    if (Number(quantidadeRemover) > Number(produtoRemover.estoque)) {
      setMsgRemover("Quantidade maior que o estoque atual.");
      return;
    }
    setMsgRemover("Removendo...");
    try {
      const novoEstoque = Math.max(0, (Number(produtoRemover.estoque) || 0) - Number(quantidadeRemover));
      const res = await fetch(`/api/produtos/${produtoRemover.id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...produtoRemover, estoque: novoEstoque })
      });
      if (res.ok) {
        setMsgRemover("Estoque atualizado com sucesso!");
        setProdutoRemover({...produtoRemover, estoque: novoEstoque});
        setQuantidadeRemover("");
        // Atualiza todos os produtos após alteração
        const resProdutos = await fetch('/produtos');
        if (resProdutos.ok) {
          const lista = await resProdutos.json();
          setProdutosAtualizados(lista);
        }
      } else {
        setMsgRemover("Erro ao atualizar estoque.");
      }
    } catch {
      setMsgRemover("Erro de conexão com o servidor.");
    }
  }

  function handleBuscarProduto(e) {
    e.preventDefault();
    const prod = produtos.find(p => String(p.id) === String(idBusca));
    setProdutoBuscado(prod || null);
    setMsg("");
  }

  async function handleAdicionarEstoque(e) {
    e.preventDefault();
    if (!produtoBuscado || !quantidade || isNaN(Number(quantidade))) {
      setMsg("Preencha uma quantidade válida.");
      return;
    }
    setMsg("Adicionando...");
    try {
      const novoEstoque = (Number(produtoBuscado.estoque) || 0) + Number(quantidade);
      const res = await fetch(`/api/produtos/${produtoBuscado.id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...produtoBuscado, estoque: novoEstoque })
      });
      if (res.ok) {
        setMsg("Estoque atualizado com sucesso!");
        setProdutoBuscado({...produtoBuscado, estoque: novoEstoque});
        setQuantidade("");
        // Atualiza todos os produtos após alteração
        const resProdutos = await fetch('/produtos');
        if (resProdutos.ok) {
          const lista = await resProdutos.json();
          setProdutosAtualizados(lista);
        }
      } else {
        setMsg("Erro ao atualizar estoque.");
      }
    } catch {
      setMsg("Erro de conexão com o servidor.");
    }
  }

  return (
    <div style={{maxWidth:1200,margin:'10px auto',padding:'0 8px'}}>
      {/* Header */}
      <div style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #0002',padding:'16px 12px',marginBottom:16}}>
        <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:16,fontSize:'clamp(18px, 5vw, 24px)',fontWeight:600}}>
          📦 Estoque
        </h2>
        
        {/* Navegação */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16,flexWrap:'wrap'}}>
          <button className="btn-padrao" onClick={()=>window.location.href='/config-produto/criar'}
                  style={{fontSize:'clamp(12px, 3vw, 14px)',padding:'8px 12px'}}>
            ➕ Criar
          </button>
          <button className="btn-padrao" onClick={()=>window.location.href='/config-produto/produtos'}
                  style={{fontSize:'clamp(12px, 3vw, 14px)',padding:'8px 12px'}}>
            📋 Lista
          </button>
          <button className="btn-padrao" onClick={()=>window.location.href='/config-produto/estoque'}
                  style={{background:'linear-gradient(135deg, #3ec46d 0%, #27ae60 100%)',fontSize:'clamp(12px, 3vw, 14px)',padding:'8px 12px'}}>
            📦 Estoque
          </button>
        </div>

        {/* Dashboard de Estatísticas */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:8,marginBottom:16}}>
          <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'#fff',padding:12,borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:'clamp(20px, 6vw, 28px)',fontWeight:'bold'}}>{estatisticas.total}</div>
            <div style={{fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.9}}>Total</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',color:'#fff',padding:12,borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:'clamp(20px, 6vw, 28px)',fontWeight:'bold'}}>{estatisticas.semEstoque}</div>
            <div style={{fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.9}}>Zerado</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',color:'#fff',padding:12,borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:'clamp(20px, 6vw, 28px)',fontWeight:'bold'}}>{estatisticas.estoqueBaixo}</div>
            <div style={{fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.9}}>Baixo</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #3ec46d 0%, #27ae60 100%)',color:'#fff',padding:12,borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:'clamp(14px, 4vw, 18px)',fontWeight:'bold'}}>R$ {estatisticas.valorTotalEstoque.toFixed(0)}</div>
            <div style={{fontSize:'clamp(10px, 2.5vw, 12px)',opacity:0.9}}>Valor Total</div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:12,flexWrap:'wrap'}}>
          <button className="btn-padrao" style={{background:'linear-gradient(135deg, #3ec46d 0%, #27ae60 100%)',fontSize:'clamp(11px, 3vw, 13px)',padding:'8px 10px'}} onClick={handleAbrirForm}>
            ⬆️ Adicionar
          </button>
          <button className="btn-padrao" style={{background:'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',fontSize:'clamp(11px, 3vw, 13px)',padding:'8px 10px'}} onClick={handleAbrirFormRemover}>
            ⬇️ Remover
          </button>
          <button className="btn-padrao" style={{background:'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',fontSize:'clamp(11px, 3vw, 13px)',padding:'8px 10px'}} 
                  onClick={() => setVisualizacao(visualizacao === 'tabela' ? 'grid' : 'tabela')}>
            {visualizacao === 'tabela' ? '⊞ Grade' : '≣ Tabela'}
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #0002',padding:12,marginBottom:16}}>
        <h3 style={{margin:'0 0 12px 0',color:'#2d3a4b',fontSize:'clamp(14px, 4vw, 16px)',fontWeight:600}}>🔍 Filtros</h3>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:12,marginBottom:12}}>
          {/* Busca */}
          <div>
            <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(12px, 3vw, 13px)'}}>Buscar</label>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Nome ou ID..."
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid #e9ecf3',
                borderRadius:6,
                fontSize:'clamp(14px, 4vw, 16px)',
                boxShadow:'0 1px 3px #0001'
              }}
            />
          </div>

          {/* Filtros em linha */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {/* Filtro de Estoque */}
            <div>
              <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(12px, 3vw, 13px)'}}>Status</label>
              <select 
                value={filtroEstoque} 
                onChange={(e) => setFiltroEstoque(e.target.value)}
                style={{
                  width:'100%',
                  padding:'10px 8px',
                  border:'1px solid #e9ecf3',
                  borderRadius:6,
                  fontSize:'clamp(12px, 3vw, 14px)',
                  background:'#fff'
                }}
              >
                <option value="todos">📦 Todos</option>
                <option value="disponivel">✅ Disponível</option>
                <option value="baixo">⚠️ Baixo</option>
                <option value="zerado">❌ Zerado</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(12px, 3vw, 13px)'}}>Ordenar</label>
              <select 
                value={ordemClassificacao} 
                onChange={(e) => setOrdemClassificacao(e.target.value)}
                style={{
                  width:'100%',
                  padding:'10px 8px',
                  border:'1px solid #e9ecf3',
                  borderRadius:6,
                  fontSize:'clamp(12px, 3vw, 14px)',
                  background:'#fff'
                }}
              >
                <option value="nome">📝 Nome</option>
                <option value="id">🔢 ID</option>
                <option value="estoque-asc">📈 Estoque ↑</option>
                <option value="estoque-desc">📉 Estoque ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contadores de Filtros */}
        <div style={{textAlign:'center',fontSize:'clamp(12px, 3vw, 13px)',color:'#666'}}>
          <span>📊 {produtosFiltrados.length} de {produtos.length}</span>
          {(filtroEstoque !== 'todos' || termoBusca) && (
            <div style={{marginTop:4,fontSize:'clamp(10px, 2.5vw, 11px)',color:'#888'}}>
              {filtroEstoque !== 'todos' && <span>Filtrado</span>}
              {termoBusca && <span>{filtroEstoque !== 'todos' ? ' • ' : ''}Buscando</span>}
            </div>
          )}
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {estatisticas.semEstoque > 0 || estatisticas.estoqueBaixo > 0 ? (
        <div style={{background:'linear-gradient(135deg, #fff5cd 0%, #ffecb3 100%)',borderRadius:8,padding:12,marginBottom:16,border:'1px solid #f39c12'}}>
          <h4 style={{margin:'0 0 8px 0',color:'#e67e22',fontSize:'clamp(13px, 3.5vw, 15px)',fontWeight:600,textAlign:'center'}}>
            ⚠️ Alertas
          </h4>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',fontSize:'clamp(11px, 3vw, 12px)'}}>
            {estatisticas.semEstoque > 0 && (
              <div style={{background:'#fff',padding:'6px 10px',borderRadius:6,color:'#e74c3c',fontWeight:500,border:'1px solid #f8d7da',textAlign:'center'}}>
                🚨 {estatisticas.semEstoque} zerado{estatisticas.semEstoque > 1 ? 's' : ''}
              </div>
            )}
            {estatisticas.estoqueBaixo > 0 && (
              <div style={{background:'#fff',padding:'6px 10px',borderRadius:6,color:'#f39c12',fontWeight:500,border:'1px solid #ffeaa7',textAlign:'center'}}>
                ⚠️ {estatisticas.estoqueBaixo} baixo{estatisticas.estoqueBaixo > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Lista de Produtos */}
      <div style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #0002',overflow:'hidden'}}>
        <div style={{padding:'12px 16px',background:'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',borderBottom:'1px solid #dee2e6'}}>
          <h4 style={{margin:0,color:'#2d3a4b',fontSize:'clamp(14px, 4vw, 16px)',fontWeight:600,textAlign:'center'}}>
            📋 {visualizacao === 'tabela' ? 'Tabela' : 'Grade'}
          </h4>
        </div>

        {visualizacao === 'tabela' ? (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'clamp(11px, 3vw, 13px)'}}>
              <thead>
                <tr style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'#fff'}}>
                  <th style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>📷</th>
                  <th style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>ID</th>
                  <th style={{padding:'8px 6px',textAlign:'left',fontWeight:500}}>Nome</th>
                  <th style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>R$</th>
                  <th style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>Qtd</th>
                  <th style={{padding:'8px 4px',textAlign:'center',fontWeight:500}}>⚡</th>
                </tr>
              </thead>
              <tbody>
                {(produtosAtualizados || produtosFiltrados).map((p, index) => {
                  const valorTotal = (Number(p.preco) || 0) * (Number(p.estoque) || 0);
                  const isEstoqueZero = Number(p.estoque) === 0;
                  const isEstoqueBaixo = Number(p.estoque) > 0 && Number(p.estoque) <= 5;
                  
                  return (
                    <tr key={p.id} style={{
                      borderBottom:'1px solid #f1f3f4',
                      background: index % 2 === 0 ? '#fafbfc' : '#fff',
                      opacity: p.inativo ? 0.6 : 1
                    }}>
                      <td style={{padding:'6px 4px',textAlign:'center'}}>
                        {p.imagem ? (
                          <img src={p.imagem} alt={p.nome} 
                               style={{width:32,height:32,objectFit:'cover',borderRadius:6,border:'1px solid #e9ecef'}} />
                        ) : (
                          <div style={{width:32,height:32,background:'#f8f9fa',border:'1px dashed #dee2e6',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>
                            📷
                          </div>
                        )}
                      </td>
                      <td style={{padding:'6px 4px',textAlign:'center',fontWeight:600,color:'#495057'}}>{p.id}</td>
                      <td style={{padding:'6px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:4}}>
                          <span style={{
                            display:'inline-block',
                            width:6,
                            height:6,
                            borderRadius:'50%',
                            background: !p.inativo ? '#28a745' : '#dc3545'
                          }}></span>
                          <span style={{fontWeight:500,color:'#212529',fontSize:'clamp(10px, 3vw, 12px)'}}>
                            {p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome}
                          </span>
                        </div>
                      </td>
                      <td style={{padding:'6px 4px',textAlign:'center',fontWeight:500,color:'#28a745'}}>
                        {(Number(p.preco) || 0).toFixed(0)}
                      </td>
                      <td style={{padding:'6px 4px',textAlign:'center'}}>
                        <span style={{
                          padding:'2px 6px',
                          borderRadius:10,
                          fontSize:'clamp(10px, 2.5vw, 11px)',
                          fontWeight:600,
                          background: isEstoqueZero ? '#dc3545' : isEstoqueBaixo ? '#ffc107' : '#28a745',
                          color: '#fff'
                        }}>
                          {p.estoque !== undefined ? p.estoque : 'N/A'}
                        </span>
                      </td>
                      <td style={{padding:'6px 4px',textAlign:'center'}}>
                        {isEstoqueZero && <span style={{fontSize:14}}>🚨</span>}
                        {isEstoqueBaixo && <span style={{fontSize:14}}>⚠️</span>}
                        {!isEstoqueZero && !isEstoqueBaixo && <span style={{fontSize:14}}>✅</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{padding:12,display:'grid',gridTemplateColumns:'1fr',gap:8}}>
            {(produtosAtualizados || produtosFiltrados).map(p => {
              const valorTotal = (Number(p.preco) || 0) * (Number(p.estoque) || 0);
              const isEstoqueZero = Number(p.estoque) === 0;
              const isEstoqueBaixo = Number(p.estoque) > 0 && Number(p.estoque) <= 5;
              
              return (
                <div key={p.id} style={{
                  background:'#fff',
                  border:'1px solid #f1f3f4',
                  borderRadius:8,
                  padding:12,
                  opacity: p.inativo ? 0.6 : 1
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    {p.imagem ? (
                      <img src={p.imagem} alt={p.nome} 
                           style={{width:40,height:40,objectFit:'cover',borderRadius:6,border:'1px solid #e9ecef'}} />
                    ) : (
                      <div style={{width:40,height:40,background:'#f8f9fa',border:'1px dashed #dee2e6',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                        📷
                      </div>
                    )}
                    <div style={{flex:1}}>
                      <div style={{fontSize:'clamp(12px, 3.5vw, 14px)',fontWeight:600,color:'#212529'}}>ID: {p.id}</div>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                        <span style={{
                          display:'inline-block',
                          width:6,
                          height:6,
                          borderRadius:'50%',
                          background: !p.inativo ? '#28a745' : '#dc3545'
                        }}></span>
                        <span style={{fontSize:'clamp(10px, 3vw, 11px)',color:'#6c757d'}}>
                          {p.inativo ? 'Inativo' : 'Ativo'}
                        </span>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {isEstoqueZero && <span style={{fontSize:16}}>🚨</span>}
                      {isEstoqueBaixo && <span style={{fontSize:16}}>⚠️</span>}
                      {!isEstoqueZero && !isEstoqueBaixo && <span style={{fontSize:16}}>✅</span>}
                    </div>
                  </div>
                  
                  <h5 style={{margin:'0 0 8px 0',color:'#212529',fontSize:'clamp(13px, 3.5vw, 15px)',fontWeight:500}}>
                    {p.nome.length > 25 ? p.nome.substring(0, 25) + '...' : p.nome}
                  </h5>
                  
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:8,fontSize:'clamp(11px, 3vw, 12px)'}}>
                    <div style={{textAlign:'center',padding:'4px 6px',background:'#f8f9fa',borderRadius:4}}>
                      <div style={{color:'#6c757d',fontSize:'clamp(9px, 2.5vw, 10px)'}}>Preço</div>
                      <div style={{fontWeight:600,color:'#28a745',fontSize:'clamp(10px, 3vw, 11px)'}}>R$ {(Number(p.preco) || 0).toFixed(0)}</div>
                    </div>
                    <div style={{textAlign:'center',padding:'4px 6px',background:'#f8f9fa',borderRadius:4}}>
                      <div style={{color:'#6c757d',fontSize:'clamp(9px, 2.5vw, 10px)'}}>Estoque</div>
                      <div style={{
                        fontWeight:600,
                        color: isEstoqueZero ? '#dc3545' : isEstoqueBaixo ? '#ffc107' : '#28a745',
                        fontSize:'clamp(10px, 3vw, 11px)'
                      }}>
                        {p.estoque !== undefined ? p.estoque : 'N/A'}
                      </div>
                    </div>
                    <div style={{textAlign:'center',padding:'4px 6px',background:'#f8f9fa',borderRadius:4}}>
                      <div style={{color:'#6c757d',fontSize:'clamp(9px, 2.5vw, 10px)'}}>Total</div>
                      <div style={{fontWeight:600,color:'#6f42c1',fontSize:'clamp(10px, 3vw, 11px)'}}>R$ {valorTotal.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(produtosAtualizados || produtosFiltrados).length === 0 && (
          <div style={{padding:40,textAlign:'center',color:'#6c757d'}}>
            <div style={{fontSize:32,marginBottom:12}}>📦</div>
            <h4 style={{margin:'0 0 6px 0',color:'#495057',fontSize:'clamp(14px, 4vw, 16px)'}}>Nenhum produto encontrado</h4>
            <p style={{margin:0,fontSize:'clamp(12px, 3vw, 13px)'}}>Ajuste os filtros ou adicione produtos</p>
          </div>
        )}
      </div>

      {/* Modal - Adicionar Estoque */}
      {formAberto && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'10px'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'16px 20px',width:'100%',maxWidth:380,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <button onClick={handleFecharForm} style={{position:'absolute',top:12,right:16,border:'none',background:'none',fontSize:20,cursor:'pointer',color:'#888',width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{width:50,height:50,background:'linear-gradient(135deg, #3ec46d 0%, #27ae60 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:20}}>⬆️</div>
              <h4 style={{margin:0,color:'#2d3a4b',fontSize:'clamp(16px, 4vw, 18px)',fontWeight:600}}>Adicionar Estoque</h4>
            </div>
            
            <form onSubmit={handleBuscarProduto} style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(13px, 3.5vw, 14px)'}}>ID do Produto</label>
              <div style={{display:'flex',gap:8}}>
                <input type="text" value={idBusca} onChange={e=>setIdBusca(e.target.value)} placeholder="Digite o ID..." 
                       style={{flex:1,padding:'10px 12px',borderRadius:6,border:'1px solid #e9ecef',fontSize:'clamp(14px, 4vw, 16px)'}} />
                <button type="submit" className="btn-padrao" style={{fontSize:'clamp(12px, 3vw, 13px)',padding:'8px 12px'}}>🔍</button>
              </div>
            </form>
            
            {produtoBuscado && (
              <div style={{background:'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',borderRadius:8,padding:12,border:'1px solid #e9ecef'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  {produtoBuscado.imagem ? (
                    <img src={produtoBuscado.imagem} alt={produtoBuscado.nome} 
                         style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:'2px solid #fff',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}} />
                  ) : (
                    <div style={{width:60,height:60,background:'#dee2e6',border:'2px solid #fff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📷</div>
                  )}
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:'clamp(14px, 4vw, 16px)',color:'#2d3a4b'}}>ID: {produtoBuscado.id}</div>
                    <div style={{fontSize:'clamp(12px, 3.5vw, 14px)',color:'#495057',marginTop:2,lineHeight:1.3}}>
                      {produtoBuscado.nome.length > 20 ? produtoBuscado.nome.substring(0, 20) + '...' : produtoBuscado.nome}
                    </div>
                    <div style={{fontSize:'clamp(12px, 3.5vw, 14px)',fontWeight:600,color:'#3ec46d',marginTop:2}}>
                      Estoque: {produtoBuscado.estoque !== undefined ? produtoBuscado.estoque : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleAdicionarEstoque}>
                  <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(13px, 3.5vw, 14px)'}}>Quantidade</label>
                  <input type="number" value={quantidade} onChange={e=>setQuantidade(e.target.value)} placeholder="Ex: 10" 
                         style={{width:'100%',padding:'10px 12px',borderRadius:6,border:'1px solid #e9ecef',fontSize:'clamp(14px, 4vw, 16px)',marginBottom:12}} min="1" />
                  <button type="submit" className="btn-padrao" style={{width:'100%',background:'linear-gradient(135deg, #3ec46d 0%, #27ae60 100%)',fontSize:'clamp(13px, 3.5vw, 14px)',padding:'10px'}}>
                    ➕ Adicionar
                  </button>
                  {msg && (
                    <div style={{marginTop:10,padding:8,borderRadius:6,textAlign:'center',fontWeight:500,fontSize:'clamp(12px, 3vw, 13px)',
                                background:msg.includes('sucesso')?'#d4edda':'#f8d7da',
                                color:msg.includes('sucesso')?'#155724':'#721c24',
                                border:`1px solid ${msg.includes('sucesso')?'#c3e6cb':'#f5c6cb'}`}}>
                      {msg}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal - Remover Estoque */}
      {formRemoverAberto && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'10px'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'16px 20px',width:'100%',maxWidth:380,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <button onClick={handleFecharFormRemover} style={{position:'absolute',top:12,right:16,border:'none',background:'none',fontSize:20,cursor:'pointer',color:'#888',width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{width:50,height:50,background:'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:20}}>⬇️</div>
              <h4 style={{margin:0,color:'#2d3a4b',fontSize:'clamp(16px, 4vw, 18px)',fontWeight:600}}>Remover Estoque</h4>
            </div>
            
            <form onSubmit={handleBuscarProdutoRemover} style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(13px, 3.5vw, 14px)'}}>ID do Produto</label>
              <div style={{display:'flex',gap:8}}>
                <input type="text" value={idBuscaRemover} onChange={e=>setIdBuscaRemover(e.target.value)} placeholder="Digite o ID..." 
                       style={{flex:1,padding:'10px 12px',borderRadius:6,border:'1px solid #e9ecef',fontSize:'clamp(14px, 4vw, 16px)'}} />
                <button type="submit" className="btn-padrao" style={{background:'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',fontSize:'clamp(12px, 3vw, 13px)',padding:'8px 12px'}}>🔍</button>
              </div>
            </form>
            
            {produtoRemover && (
              <div style={{background:'linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%)',borderRadius:8,padding:12,border:'1px solid #f8d7da'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  {produtoRemover.imagem ? (
                    <img src={produtoRemover.imagem} alt={produtoRemover.nome} 
                         style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:'2px solid #fff',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}} />
                  ) : (
                    <div style={{width:60,height:60,background:'#dee2e6',border:'2px solid #fff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📷</div>
                  )}
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:'clamp(14px, 4vw, 16px)',color:'#2d3a4b'}}>ID: {produtoRemover.id}</div>
                    <div style={{fontSize:'clamp(12px, 3.5vw, 14px)',color:'#495057',marginTop:2,lineHeight:1.3}}>
                      {produtoRemover.nome.length > 20 ? produtoRemover.nome.substring(0, 20) + '...' : produtoRemover.nome}
                    </div>
                    <div style={{fontSize:'clamp(12px, 3.5vw, 14px)',fontWeight:600,color:'#e74c3c',marginTop:2}}>
                      Estoque: {produtoRemover.estoque !== undefined ? produtoRemover.estoque : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleRemoverEstoque}>
                  <label style={{display:'block',marginBottom:6,fontWeight:500,color:'#2d3a4b',fontSize:'clamp(13px, 3.5vw, 14px)'}}>Quantidade</label>
                  <input type="number" value={quantidadeRemover} onChange={e=>setQuantidadeRemover(e.target.value)} placeholder="Ex: 5" 
                         style={{width:'100%',padding:'10px 12px',borderRadius:6,border:'1px solid #e9ecef',fontSize:'clamp(14px, 4vw, 16px)',marginBottom:12}} 
                         min="1" max={produtoRemover.estoque} />
                  <button type="submit" className="btn-padrao" style={{width:'100%',background:'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',fontSize:'clamp(13px, 3.5vw, 14px)',padding:'10px'}}>
                    ➖ Remover
                  </button>
                  {msgRemover && (
                    <div style={{marginTop:10,padding:8,borderRadius:6,textAlign:'center',fontWeight:500,fontSize:'clamp(12px, 3vw, 13px)',
                                background:msgRemover.includes('sucesso')?'#d4edda':'#f8d7da',
                                color:msgRemover.includes('sucesso')?'#155724':'#721c24',
                                border:`1px solid ${msgRemover.includes('sucesso')?'#c3e6cb':'#f5c6cb'}`}}>
                      {msgRemover}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
