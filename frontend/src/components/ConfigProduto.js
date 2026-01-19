import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BarcodeReader from './BarcodeReader';

function ConfigProduto() {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para pegar query params
  function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
  }
  const [aba, setAba] = useState('criar');
  const [showBarcode, setShowBarcode] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produtosOriginais, setProdutosOriginais] = useState([]);
  const [filtros, setFiltros] = useState({
    status: '',
    nome: '',
    codigo: '',
    dataInicio: '',
    dataFim: '',
    promo: ''
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      .then(data => {
        console.log('Produtos carregados:', data.length, 'itens');
        const comFoto = data.filter(p => p.foto).length;
        console.log('Produtos com foto:', comFoto);
        console.log('Primeiro produto com foto:', data.find(p => p.foto));
        setProdutosOriginais(data);
        setProdutos(data);
      })
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  // Filtra produtos conforme modelo de filtros usado em Pedidos/Resgates
  const produtosFiltrados = (produtosOriginais || []).filter(p => {
    if (filtros.status && ((filtros.status === 'ativos' && (p.status === 'inativo' || p.inativo)) || (filtros.status === 'inativos' && !(p.status === 'inativo' || p.inativo)) )) return false;
    if (filtros.nome && !String(p.nome || p.id || '').toLowerCase().includes(filtros.nome.toLowerCase())) return false;
    if (filtros.codigo && !String((p.codigoBarras||p.codigo_barra||'')).includes(filtros.codigo)) return false;
    if (filtros.promo && filtros.promo === 'promo' && !p.promo) return false;
    if (filtros.promo && filtros.promo === 'sem' && p.promo) return false;
    if (filtros.moeda && filtros.moeda === 'real' && p.moeda === 'pontos') return false;
    if (filtros.moeda && filtros.moeda === 'pontos' && p.moeda !== 'pontos') return false;
    // dataInicio/dataFim não aplicam a produtos (mantidos para compatibilidade)
    return true;
  });

  return (
    <div style={{maxWidth: isMobile ? '95%' : 1200, margin: isMobile ? '20px auto' : '40px auto', background:'#fff',borderRadius:16,boxShadow:'0 2px 12px #0002',padding: isMobile ? 16 : 32}}>
      <style>{`
        /* Animação de shimmer para o preço */
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Hover effects para cards */
        .produto-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .produto-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 40px rgba(102, 126, 234, 0.15) !important;
          border-color: rgba(102, 126, 234, 0.3) !important;
        }
        
        .produto-card:hover .produto-acoes {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        .produto-card:hover .image-overlay {
          opacity: 1 !important;
        }
        
        /* Animação de entrada dos cards */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .produto-card {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* Delay escalonado para animação */
        .produto-card:nth-child(1) { animation-delay: 0.1s; }
        .produto-card:nth-child(2) { animation-delay: 0.2s; }
        .produto-card:nth-child(3) { animation-delay: 0.3s; }
        .produto-card:nth-child(4) { animation-delay: 0.4s; }
        .produto-card:nth-child(5) { animation-delay: 0.5s; }
        .produto-card:nth-child(6) { animation-delay: 0.6s; }
        .produto-card:nth-child(7) { animation-delay: 0.7s; }
        .produto-card:nth-child(8) { animation-delay: 0.8s; }
        
        /* Hover para botões de ação */
        .produto-acoes {
          transform: translateY(10px);
        }
        
        /* Responsividade melhorada */
        @media (max-width: 768px) {
          .produto-card {
            transform: none !important;
          }
          .produto-card:hover {
            transform: translateY(-4px) !important;
          }
        }
        
        /* Animação para inputs em foco */
        input:focus, textarea:focus, select:focus {
          transform: translateY(-1px) !important;
        }
        
        /* Pulse para badges promocionais */
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .produto-card label:has(input:checked) {
          animation: pulse 2s infinite;
        }
      `}</style>
      <h2 style={{textAlign:'center',color:'#2d3a4b',marginBottom:24}}>Configuração de Produtos</h2>
      <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:32}}>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/criar')}>Criar Produto</button>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/produtos')}>Produtos</button>
        <button className="btn-padrao" onClick={()=>navigate('/config-produto/estoque')}>Estoque</button>
      </div>
      <div style={{marginTop:32}}>
        {/* Bloco principal do conteúdo */}
          {location.pathname==='/config-produto/criar' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              borderRadius: 20,
              padding: isMobile ? '16px 20px' : '24px 32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Header compacto */}
              <div style={{
                textAlign: 'center',
                marginBottom: 28,
                paddingBottom: 20,
                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 50,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  marginBottom: 16
                }}>
                  🏷️ Criar Novo Produto
                </div>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Preencha os campos abaixo para adicionar um produto ao catálogo
                </p>
              </div>

              <form style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 240px',
                gap: 28,
                alignItems: 'start'
              }} onSubmit={async e => {
                  e.preventDefault();
                  const form = e.target;
                  const formData = new FormData(form);
                  const nome = formData.get('nome');
                  const descricao = formData.get('descricao');
                  const unidade = formData.get('unidade');
                  const moeda = formData.get('moeda');
                  const preco = formData.get('preco');
                  const codigoBarras = formData.get('codigoBarras');
                  const fotoFile = formData.get('foto');
                  let fotoBase64 = '';
                  if (fotoFile && fotoFile.size > 0) {
                    fotoBase64 = await new Promise(resolve => {
                      const reader = new FileReader();
                      reader.onload = ev => resolve(ev.target.result);
                      reader.readAsDataURL(fotoFile);
                    });
                  }
                  // Se não preencher código de barras, perguntar ao usuário
                  if (!codigoBarras) {
                    const confirmar = window.confirm('O campo Código de Barras não foi preenchido. Deseja salvar mesmo assim? O produto será adicionado e vinculado apenas ao ID.');
                    if (!confirmar) return;
                  }
                  const novoProduto = {
                    nome,
                    descricao,
                    unidade,
                    moeda,
                    preco,
                    codigoBarras,
                    estoque: 0,
                    imagens: fotoBase64 ? [fotoBase64] : []
                  };
                  try {
                    const res = await fetch('/api/produtos', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(novoProduto)
                    });
                    if (res.ok) {
                      alert('Produto criado com sucesso!');
                      navigate('/config-produto/produtos');
                    } else {
                      alert('Erro ao criar produto.');
                    }
                  } catch (err) {
                    alert('Erro ao criar produto.');
                  }
                }}>
                {/* Formulário principal */}
                <div style={{
                  display: 'grid',
                  gap: 20
                }}>
                  {/* Campos do produto */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: 16,
                    background: 'rgba(102, 126, 234, 0.03)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    {/* Nome do produto */}
                    <div style={{gridColumn: isMobile ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Nome do Produto *
                      </label>
                      <input 
                        name="nome" 
                        required 
                        placeholder="Digite o nome completo do produto"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Descrição */}
                    <div style={{gridColumn: isMobile ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Descrição *
                      </label>
                      <textarea 
                        name="descricao" 
                        required 
                        rows={2}
                        placeholder="Descreva o produto"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Unidade */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Unidade *
                      </label>
                      <input 
                        name="unidade" 
                        required 
                        placeholder="Ex: kg, un, L"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Moeda */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Moeda *
                      </label>
                      <select 
                        name="moeda" 
                        required 
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          background: '#fff',
                          color: '#2d3748',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="real">💰 Real (R$)</option>
                        <option value="pontos">🎯 Pontos</option>
                      </select>
                    </div>

                    {/* Preço */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Valor *
                      </label>
                      <input 
                        name="preco" 
                        required 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '2px solid rgba(76, 175, 80, 0.2)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          background: '#fff',
                          color: '#2d3748',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4caf50';
                          e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Código de Barras */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Código de Barras
                      </label>
                      <div style={{display: 'flex', gap: 8}}>
                        <input 
                          name="codigoBarras" 
                          id="codigoBarrasInput" 
                          placeholder="Opcional"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '2px solid rgba(255, 152, 0, 0.2)',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            background: '#fff',
                            color: '#2d3748',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ff9800';
                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowBarcode(true)}
                          style={{
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 16px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f57c00';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#ff9800';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          📷
                        </button>
                      </div>
                    </div>

                    {/* Upload e Botão */}
                    <div style={{gridColumn: isMobile ? '1' : '1 / -1'}}>
                      <label style={{
                        display: 'block',
                        fontWeight: '600', 
                        color: '#4a5568', 
                        fontSize: '0.9rem',
                        marginBottom: 6
                      }}>
                        Foto do Produto (1080x1080px)
                      </label>
                      <div style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center'}}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          name="foto" 
                          id="fotoProdutoInput" 
                          style={{flex: 1}}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                document.getElementById('previewProdutoImg').src = ev.target.result;
                              };
                              reader.readAsDataURL(file);
                            } else {
                              document.getElementById('previewProdutoImg').src = '';
                            }
                          }}
                        />
                        <button 
                          type="submit" 
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: isMobile ? '14px 24px' : '12px 24px',
                            fontSize: isMobile ? '1rem' : '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            whiteSpace: 'nowrap',
                            width: isMobile ? '100%' : 'auto'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          ✨ Salvar
                        </button>
                      </div>
                      {isMobile && (
                        <div style={{marginTop: 8}}>
                          <label 
                            htmlFor="cameraProdutoInput" 
                            style={{
                              cursor: 'pointer',
                              color: '#4caf50',
                              fontWeight: '600',
                              textDecoration: 'underline',
                              fontSize: '0.85rem'
                            }}
                          >
                            📷 Tirar foto com câmera
                          </label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            id="cameraProdutoInput" 
                            style={{display: 'none'}} 
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  document.getElementById('previewProdutoImg').src = ev.target.result;
                                  const dataTransfer = new DataTransfer();
                                  dataTransfer.items.add(file);
                                  document.getElementById('fotoProdutoInput').files = dataTransfer.files;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {showBarcode && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '16px',
                        background: 'rgba(255, 152, 0, 0.1)',
                        borderRadius: 12,
                        border: '2px solid rgba(255, 152, 0, 0.2)'
                      }}>
                        <BarcodeReader onDetected={codigo => {
                          document.getElementById('codigoBarrasInput').value = codigo;
                          setShowBarcode(false);
                        }} />
                        <button 
                          type="button" 
                          onClick={() => setShowBarcode(false)}
                          style={{
                            marginTop: 12,
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview lateral */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(156, 39, 176, 0.03)',
                  padding: '20px',
                  borderRadius: 16,
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 20
                }}>
                  <h4 style={{
                    color: '#9c27b0',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    textAlign: 'center'
                  }}>
                    👁️ Preview
                  </h4>
                  
                  <div style={{
                    width: '100%',
                    height: 180,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '2px dashed rgba(156, 39, 176, 0.2)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      id="previewProdutoImg" 
                      alt="Preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      pointerEvents: 'none'
                    }}>
                      {!document.getElementById('previewProdutoImg')?.src && '📷 Imagem'}
                    </div>
                  </div>
                  
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    Formato final no catálogo
                  </p>
                </div>
              </form>
            </div>
          )}
          {location.pathname==='/config-produto/produtos' && (
          <div>
            {/* Header moderno da página */}
            <div className="produtos-header">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                position: 'relative',
                zIndex: 2
              }}>
                <div>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    📦 Painel de Produtos
                  </h2>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    Gerencie seu catálogo completo de produtos
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {/* Estatísticas rápidas */}
                  <div style={{background: 'rgba(255, 255, 255, 0.15)',padding: '8px 16px',borderRadius: 12,display: 'flex',alignItems: 'center',gap: 8}}>
                    <span>🛍️</span>
                    <span>{(produtosOriginais||[]).length} Produtos</span>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.15)',padding: '8px 16px',borderRadius: 12,display: 'flex',alignItems: 'center',gap: 8}}>
                    <span>📦</span>
                    <span>Estoque: {(produtosOriginais||[]).reduce((s,p)=>s + (Number(p.estoque)||0), 0)}</span>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.15)',padding: '8px 16px',borderRadius: 12,display: 'flex',alignItems: 'center',gap: 8}}>
                    <span>🔒</span>
                    <span>Reservado: {(produtosOriginais||[]).reduce((s,p)=>s + (Number(p.reservado)||0), 0)}</span>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.15)',padding: '8px 16px',borderRadius: 12,display: 'flex',alignItems: 'center',gap: 8}}>
                    <span>🔥</span>
                    <span>{(produtosOriginais||[]).filter(p => p.promo).length}/10 Promoções</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros no mesmo modelo de Pedidos/Resgates */}
            <div style={{marginBottom:24, padding:16, background:'#f6f8fa', borderRadius:8, border:'1px solid #eee'}}>
              <h3 style={{marginTop:0, marginBottom:12, color:'#1D2A5A'}}>Filtros de Pesquisa</h3>
              <div style={{display:'flex', flexWrap:'wrap', gap:16, alignItems:'center'}}>
                <label>
                  Status:
                  <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}>
                    <option value="">Todos</option>
                    <option value="ativos">Ativos</option>
                    <option value="inativos">Inativos</option>
                  </select>
                </label>
                <label>
                  Nome / ID:
                  <input type="text" value={filtros.nome} onChange={(e)=>setFiltros({...filtros, nome: e.target.value})} placeholder="Nome ou ID do produto" style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4, width:180}} />
                </label>
                <label>
                  Código:
                  <input type="text" value={filtros.codigo} onChange={(e)=>setFiltros({...filtros, codigo: e.target.value})} placeholder="Código de barras" style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4, width:160}} />
                </label>
                <label>
                  Promo:
                  <select value={filtros.promo} onChange={(e)=>setFiltros({...filtros, promo: e.target.value})} style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}>
                    <option value="">Todas</option>
                    <option value="promo">Só Promo</option>
                    <option value="sem">Sem Promo</option>
                  </select>
                </label>
                <label>
                  Tipo:
                  <select value={filtros.moeda || ''} onChange={(e)=>setFiltros({...filtros, moeda: e.target.value})} style={{marginLeft:8, padding:'6px 8px', border:'1px solid #ccc', borderRadius:4}}>
                    <option value="">Todos</option>
                    <option value="real">Preço (R$)</option>
                    <option value="pontos">Pontos</option>
                  </select>
                </label>
                <button onClick={()=>setFiltros({status:'', nome:'', codigo:'', dataInicio:'', dataFim:'', promo:''})} style={{background:'#6c757d',color:'#fff',border:'none',padding:'8px 16px',borderRadius:4,cursor:'pointer',fontWeight:'bold'}}>Limpar Filtros</button>
              </div>
            </div>

            {/* Grid de produtos moderno */}
            <div className="produtos-grid">
              {produtosFiltrados.map(prod =>
                <div key={prod.id} className="produto-card-modern" onClick={(e) => {
                  if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('select') && !e.target.closest('textarea')) {
                    setEditId(editId === prod.id ? null : prod.id);
                    if (editId !== prod.id) {
                      setEditForm({
                        nome: prod.nome,
                        descricao: prod.descricao,
                        unidade: prod.unidade,
                        moeda: prod.moeda,
                        preco: prod.preco,
                        estoque: prod.estoque,
                        codigo_barra: prod.codigoBarras || prod.codigo_barra,
                        status: prod.status || (prod.inativo ? 'inativo' : 'ativo')
                      });
                      const params = new URLSearchParams(location.search);
                      params.set('id', prod.id);
                      navigate(location.pathname + '?' + params.toString(), { replace: true });
                    } else {
                      const params = new URLSearchParams(location.search);
                      params.delete('id');
                      navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                    }
                  }
                }}>
                  
                  {/* Badge de status superior */}
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 20,
                    display: 'flex',
                    gap: 8
                  }}>
                    {(() => {
                      const isInativo = prod.status === 'inativo' || prod.inativo === true;
                      return (
                        <span className={`status-badge ${isInativo ? 'inativo' : ''}`}>
                          {isInativo ? '❌ Inativo' : '✅ Ativo'}
                        </span>
                      );
                    })()}

                    <span className="id-badge">
                      ID: {prod.id}
                    </span>
                  </div>

                  {/* Badge de promoção */}
                    <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 20
                  }}>
                    <label onClick={e => e.stopPropagation()} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: prod.promo ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      color: prod.promo ? '#fff' : '#6b7280',
                      padding: '8px 14px',
                      borderRadius: 20,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: prod.promo ? 'none' : '2px solid rgba(102, 126, 234, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <input
                        onClick={e => e.stopPropagation()}
                        type="checkbox"
                        checked={!!prod.promo}
                        disabled={!prod.promo && produtos.filter(p => p.promo).length >= 10}
                        onChange={async e => {
                          e.stopPropagation();
                          const novoValor = e.target.checked;
                          try {
                            await fetch(`/api/produtos/${prod.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ promo: novoValor })
                            });
                          } catch (err) {
                            console.error('Erro atualizando promo:', err);
                          }
                          setProdutos(prev => {
                            const updated = prev.map(p => p.id === prod.id ? { ...p, promo: novoValor } : p);
                            if (novoValor) {
                              const idx = updated.findIndex(p => p.id === prod.id);
                              if (idx > -1) {
                                const [item] = updated.splice(idx, 1);
                                updated.unshift(item);
                              }
                            }
                            // Atualiza também a lista original para manter consistência
                            setProdutosOriginais(orig => {
                              const upOrig = (orig || []).map(p => p.id === prod.id ? { ...p, promo: novoValor } : p);
                              if (novoValor) {
                                const idx2 = upOrig.findIndex(p => p.id === prod.id);
                                if (idx2 > -1) {
                                  const [it] = upOrig.splice(idx2, 1);
                                  upOrig.unshift(it);
                                }
                              }
                              return upOrig;
                            });
                            return updated;
                          });
                        }}
                        style={{marginRight: 6, transform: 'scale(0.9)'}}
                      />
                      <span>
                        {prod.promo ? '🔥 Promoção' : '⭐ Promoção'}
                      </span>
                    </label>
                  </div>

                  {/* Conteúdo Principal do Card */}
                  <div style={{
                    padding: '24px 20px 20px 20px',
                    height: 'calc(100% - 80px)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {editId === prod.id ? (
                      // MODO DE EDIÇÃO MODERNIZADO
                      <div className="edit-form-modern">
                        <div className="edit-form-header">
                          <span>✏️ Editando Produto</span>
                        </div>
                        
                        <form className="edit-form-grid" onSubmit={e => {
                          e.preventDefault();
                          if (!editForm.codigo_barra) {
                            const confirmar = window.confirm('O campo Código de Barras está vazio. Deseja salvar mesmo assim? O produto será vinculado apenas ao ID.');
                            if (!confirmar) return;
                          }
                          const payload = {
                            ...editForm,
                            codigoBarras: editForm.codigo_barra || ''
                          };
                          delete payload.codigo_barra;
                          fetch(`/api/produtos/${prod.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                          })
                            .then(res => res.json())
                            .then(updated => {
                              setProdutos(prev => prev.map(p => p.id === prod.id ? {...p, ...editForm} : p));
                              setProdutosOriginais(prev => (prev || []).map(p => p.id === prod.id ? {...p, ...editForm} : p));
                              setEditId(null);
                              const params = new URLSearchParams(location.search);
                              params.delete('id');
                              navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                            });
                        }}>
                          
                          {/* Nome */}
                          <div className="form-group">
                            <label className="form-label">
                              Nome do Produto
                            </label>
                            <input 
                              className="form-input"
                              value={editForm.nome||''} 
                              onChange={e=>setEditForm({...editForm,nome:e.target.value})} 
                              required 
                            />
                          </div>
                          
                          {/* Descrição */}
                          <div className="form-group">
                            <label className="form-label">
                              Descrição
                            </label>
                            <textarea 
                              className="form-textarea"
                              value={editForm.descricao||''} 
                              onChange={e=>setEditForm({...editForm,descricao:e.target.value})} 
                              required 
                              rows={2}
                            />
                          </div>
                          
                          {/* Grid para campos menores */}
                          <div className="form-grid-2">
                            {/* Unidade */}
                            <div className="form-group">
                              <label className="form-label">
                                Unidade
                              </label>
                              <input 
                                className="form-input"
                                value={editForm.unidade||''} 
                                onChange={e=>setEditForm({...editForm,unidade:e.target.value})} 
                                required 
                              />
                            </div>
                            
                            {/* Moeda */}
                            <div className="form-group">
                              <label className="form-label">
                                Moeda
                              </label>
                              <select 
                                className="form-select"
                                value={editForm.moeda||'real'} 
                                onChange={e=>setEditForm({...editForm,moeda:e.target.value})} 
                                required
                              >
                                <option value="real">💰 Real (R$)</option>
                                <option value="pontos">🎯 Pontos</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Segunda linha do grid */}
                          <div className="form-grid-2">
                            {/* Preço */}
                            <div className="form-group">
                              <label className="form-label">
                                Preço
                              </label>
                              <input 
                                className="form-input"
                                value={editForm.preco||''} 
                                onChange={e=>setEditForm({...editForm,preco:e.target.value})} 
                                required 
                                type="number" 
                                step="0.01"
                              />
                            </div>
                            
                            {/* Estoque */}
                            <div className="form-group">
                              <label className="form-label">
                                Estoque
                              </label>
                              <input 
                                className="form-input"
                                value={editForm.estoque||''} 
                                onChange={e=>setEditForm({...editForm,estoque:e.target.value})} 
                                required 
                                type="number"
                              />
                            </div>
                          </div>
                          
                          {/* Status */}
                          <div className="form-group">
                            <label className="form-label">
                              Status do Produto
                            </label>
                            <select className="form-select" value={editForm.status || 'ativo'}
                              onChange={async e => {
                                const novoStatus = e.target.value;
                                setEditForm({...editForm, status: novoStatus});
                                // Atualiza backend instantaneamente
                                await fetch(`/api/produtos/${prod.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...editForm, status: novoStatus, codigoBarras: editForm.codigo_barra || '' })
                                });
                                setProdutos(prev => prev.map(p => p.id === prod.id ? { ...p, status: novoStatus } : p));
                                setProdutosOriginais(prev => (prev || []).map(p => p.id === prod.id ? { ...p, status: novoStatus } : p));
                              }}
                              required
                            >
                              <option value="ativo">✅ Ativo</option>
                              <option value="inativo">❌ Inativo</option>
                            </select>
                          </div>
                          
                          {/* Código de Barras */}
                          <div className="form-group">
                            <label className="form-label">
                              Código de Barras
                            </label>
                            <input 
                              className="form-input"
                              value={editForm.codigo_barra||''} 
                              onChange={e=>setEditForm({...editForm,codigo_barra:e.target.value})}
                              placeholder="Opcional"
                            />
                          </div>
                          
                          {/* Botões de ação */}
                          <div className="btn-form-actions">
                            <button type="submit" className="btn-form">
                              💾 Salvar Alterações
                            </button>
                            <button type="button" className="btn-form cancelar" onClick={()=>{
                              setEditId(null);
                              const params = new URLSearchParams(location.search);
                              params.delete('id');
                              navigate(location.pathname + (params.toString() ? '?' + params.toString() : ''), { replace: true });
                            }}>
                              ❌ Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      // MODO DE VISUALIZAÇÃO MODERNIZADO
                      <div style={{
                        display:'flex',
                        flexDirection:'column',
                        height:'100%',
                        paddingTop: 20
                      }}>
                        
                        {/* Imagem do Produto com efeito hover */}
                        <div className="produto-imagem-container">
                          {prod.foto ? (
                            <img 
                              src={prod.foto} 
                              alt={prod.nome}
                              className="produto-imagem"
                            />
                          ) : (
                            <div className="produto-sem-imagem">
                              <span>📷</span>
                              <span>Sem imagem</span>
                            </div>
                          )}
                          
                          {/* Overlay sutil */}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.05) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none'
                          }} className="image-overlay" />
                        </div>

                        {/* Preço em Destaque Modernizado - AGORA NA FRENTE */}
                        <div className={`produto-preco ${prod.moeda === 'pontos' ? 'pontos' : ''}`}>
                          {prod.moeda === 'pontos' ? (
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                              <span style={{fontSize: '1.2rem'}}>⭐</span>
                              <span style={{fontSize: '1.1rem', color: '#1f2937', fontWeight: 'bold'}}>P {prod.preco ? prod.preco.toString() : '0'}</span>
                            </div>
                          ) : (
                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                              <span style={{fontSize: '1.2rem'}}>💰</span>
                              <span style={{fontSize: '1.1rem'}}>R$ {prod.preco && !isNaN(prod.preco) ? parseFloat(prod.preco).toFixed(2) : '0.00'}</span>
                            </span>
                          )}
                        </div>

                        {/* Nome do Produto */}
                        <h3 className="produto-nome">{prod.nome}</h3>

                        {/* Grid de Informações Modernizado */}
                        <div className="produto-info-grid">
                          {/* Card Estoque */}
                          <div className={`info-card ${prod.estoque === 0 || prod.estoque === '0' ? 'estoque-esgotado' : ''}`}>
                            <div className="info-card-icon">
                              {(prod.estoque === 0 || prod.estoque === '0') ? '📦' : '✅'}
                            </div>
                            <div className="info-card-title">
                              ESTOQUE
                            </div>
                            <div className="info-card-value">
                              {(prod.estoque === 0 || prod.estoque === '0') ? 'Esgotado' : prod.estoque}
                            </div>
                          </div>
                          
                          {/* Card Unidade */}
                          <div className="info-card unidade">
                            <div className="info-card-icon">📏</div>
                            <div className="info-card-title">
                              UNIDADE
                            </div>
                            <div className="info-card-value">
                              {prod.unidade}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação Modernizados */}
                        <div className="produto-acoes-modern">
                          <button 
                            className="btn-acao"
                            onClick={()=>navigate(`/config-produto/produtos/${prod.id}`)}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          
                          <button 
                            className="btn-acao excluir"
                            onClick={()=>{
                              if(window.confirm('⚠️ Tem certeza que deseja excluir este produto?\\n\\nEsta ação não pode ser desfeita.')){
                                fetch(`/api/produtos/${prod.id}`,{method:'DELETE'})
                                  .then(()=>{
                                    setProdutos(prev => (prev || []).filter(p=>p.id!==prod.id));
                                    setProdutosOriginais(prev => (prev || []).filter(p=>p.id!==prod.id));
                                  });
                              }
                            }}
                          >
                            <span>🗑️</span>
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigProduto;





