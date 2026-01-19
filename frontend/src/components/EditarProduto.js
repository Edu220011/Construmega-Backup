
import React, { useState, useEffect } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useParams, useNavigate } from 'react-router-dom';
import BarcodeReader from './BarcodeReader';


function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [imagens, setImagens] = useState([]); // para preview local
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBarcode, setShowBarcode] = useState(false);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useEffect para carregar o produto
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/produtos/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Produto não encontrado');
          return res.json();
        })
        .then(produto => {
          setForm(produto);
          setImagens(produto.imagens || []);
          setLoading(false);
        })
        .catch(err => {
          setErro(err.message || 'Erro ao carregar produto');
          setLoading(false);
        });
    }
  }, [id]);


  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid rgba(102, 126, 234, 0.2)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        color: '#6b7280',
        fontSize: '1rem',
        fontWeight: '500'
      }}>Carregando produto...</p>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
  
  if (erro) return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      borderRadius: 20,
      padding: 32,
      border: '2px solid rgba(239, 68, 68, 0.2)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: 16
      }}>⚠️</div>
      <h3 style={{
        color: '#dc2626',
        margin: '0 0 12px 0',
        fontSize: '1.2rem',
        fontWeight: '700'
      }}>Erro ao carregar produto</h3>
      <p style={{
        color: '#7f1d1d',
        margin: '0 0 20px 0'
      }}>{erro}</p>
      <button 
        onClick={() => navigate('/config-produto/produtos')}
        style={{
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        ← Voltar ao Painel
      </button>
    </div>
  );
  if (!form) return null;

  function handleSubmit(e) {
    e.preventDefault();
    console.log('submit');
    setErro("");
    // Suporte a múltiplas imagens
    fetch(`/api/produtos/${id}` , {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        preco: Number(form.preco),
        moeda: form.moeda,
        codigoBarras: form.codigoBarras,
        inativo: form.inativo === true,
        imagens: imagens // array de urls/base64
      })
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.erro || 'Erro ao salvar produto.');
        }
        return res.json();
      })
      .then(() => navigate('/config-produto/produtos'))
      .catch(err => setErro(err.message || 'Erro ao salvar produto.'));
  }

  return (
    <div style={{
      maxWidth: isMobile ? '95%' : 800,
      margin: '20px auto',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(102, 126, 234, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header moderno */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: isMobile ? '24px 20px' : '32px 40px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Padrão decorativo */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'rotate(45deg)'
        }} />
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? '1.4rem' : '1.8rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              ✏️ Editando Produto
            </h1>
            <p style={{
              margin: 0,
              opacity: 0.9,
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '500'
            }}>
              ID: {id} • Atualize as informações do produto
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 20px',
            borderRadius: 16,
            fontSize: '0.9rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '1.2rem', marginBottom: 4}}>📋</div>
            <div>Formulário</div>
          </div>
        </div>
      </div>
      {/* Conteúdo do formulário */}
      <div style={{padding: isMobile ? '20px' : '40px'}}>
        {erro && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            color: '#dc2626',
            padding: '16px 20px',
            borderRadius: 12,
            marginBottom: 24,
            border: '2px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontWeight: '600'
          }}>
            <span style={{fontSize: '1.2rem'}}>⚠️</span>
            {erro}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gap: 28
        }}>
          
          {/* Seção: Informações Básicas */}
          <div style={{
            background: 'rgba(102, 126, 234, 0.03)',
            padding: '24px',
            borderRadius: 16,
            border: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#667eea',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📝 Informações Básicas
            </h3>
            
            {/* Nome do produto */}
            <div style={{marginBottom: 20}}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '0.95rem',
                marginBottom: 8
              }}>
                Nome do Produto *
              </label>
              <input 
                name="nome" 
                value={form.nome || ''} 
                onChange={e=>setForm({...form, nome:e.target.value})} 
                required 
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  background: '#fff',
                  color: '#2d3748',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
            
            {/* Grid para campos menores */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: 20
            }}>
              {/* Preço */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  marginBottom: 8
                }}>
                  Preço *
                </label>
                <input 
                  name="preco" 
                  value={form.preco || ''} 
                  onChange={e=>setForm({...form, preco:e.target.value})} 
                  required 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '2px solid rgba(76, 175, 80, 0.2)',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#fff',
                    color: '#2d3748',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4caf50';
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              
              {/* Moeda */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  marginBottom: 8
                }}>
                  Tipo de Moeda *
                </label>
                <select 
                  name="moeda" 
                  value={form.moeda || 'real'} 
                  onChange={e=>setForm({...form, moeda:e.target.value})} 
                  required 
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '2px solid rgba(76, 175, 80, 0.2)',
                    fontSize: '1rem',
                    background: '#fff',
                    color: '#2d3748',
                    cursor: 'pointer',
                    fontWeight: '500',
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
            </div>
          </div>
          
          {/* Seção: Identificação */}
          <div style={{
            background: 'rgba(255, 152, 0, 0.03)',
            padding: '24px',
            borderRadius: 16,
            border: '2px solid rgba(255, 152, 0, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#ff9800',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🔢 Identificação
            </h3>
            
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '0.95rem',
                marginBottom: 8
              }}>
                Código de Barras *
              </label>
              <div style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'flex-end'}}>
                <input 
                  name="codigoBarras" 
                  value={form.codigoBarras || ''} 
                  onChange={e=>setForm({...form, codigoBarras:e.target.value})} 
                  required 
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '2px solid rgba(255, 152, 0, 0.2)',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#fff',
                    color: '#2d3748',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9800';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
                <button 
                  type="button" 
                  onClick={()=>setShowBarcode(true)} 
                  style={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 20px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(255, 152, 0, 0.3)';
                  }}
                >
                  📷 Ler Código
                </button>
              </div>
              
              {showBarcode && (
                <div style={{
                  marginTop: 20,
                  padding: '20px',
                  background: 'rgba(255, 152, 0, 0.1)',
                  borderRadius: 12,
                  border: '2px solid rgba(255, 152, 0, 0.2)'
                }}>
                  <BarcodeReader onDetected={codigo => {
                    setForm({...form, codigoBarras: codigo});
                    setShowBarcode(false);
                  }} />
                  <button 
                    type="button" 
                    onClick={()=>setShowBarcode(false)} 
                    style={{
                      marginTop: 12,
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Seção: Imagens do Produto */}
          <div style={{
            background: 'rgba(156, 39, 176, 0.03)',
            padding: '24px',
            borderRadius: 16,
            border: '2px solid rgba(156, 39, 176, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#9c27b0',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📷 Galeria de Imagens
            </h3>
            
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '0.95rem',
                marginBottom: 12
              }}>
                Selecionar Imagens
              </label>
              
              <div style={{
                border: '2px dashed rgba(156, 39, 176, 0.3)',
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(156, 39, 176, 0.02)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    Promise.all(files.map(file => {
                      return new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = ev => resolve(ev.target.result);
                        reader.readAsDataURL(file);
                      });
                    })).then(imgs => {
                      setImagens(imgs);
                      setForm(f => ({...f, imagens: imgs}));
                    });
                  }} 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                
                <div style={{pointerEvents: 'none'}}>
                  <div style={{fontSize: '3rem', marginBottom: 12}}>📸</div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontWeight: '600',
                    color: '#9c27b0',
                    fontSize: '1.1rem'
                  }}>
                    Clique para selecionar imagens
                  </p>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '0.9rem'
                  }}>
                    Ou arraste e solte aqui • Múltiplas imagens suportadas
                  </p>
                </div>
              </div>
              
              {isMobile && (
                <div style={{marginTop: 16}}>
                  <label 
                    htmlFor="cameraEditarProdutoInput" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      color: '#9c27b0',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      fontSize: '0.95rem'
                    }}
                  >
                    📷 Tirar foto com câmera
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    id="cameraEditarProdutoInput" 
                    style={{display: 'none'}} 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const newImagens = [...imagens, ev.target.result];
                          setImagens(newImagens);
                          setForm(f => ({...f, imagens: newImagens}));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>
              )}
              
              {/* Preview das imagens */}
              {imagens.length > 0 && (
                <div style={{marginTop: 20}}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    color: '#9c27b0',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Preview das Imagens ({imagens.length})
                  </h4>
                  <div style={{
                    background: 'rgba(156, 39, 176, 0.05)',
                    padding: '16px',
                    borderRadius: 12,
                    border: '1px solid rgba(156, 39, 176, 0.1)'
                  }}>
                    <CarrosselImagens imagens={imagens} altura={isMobile ? 100 : 140} largura={isMobile ? 100 : 140} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Seção: Configurações */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.03)',
            padding: '24px',
            borderRadius: 16,
            border: '2px solid rgba(239, 68, 68, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#ef4444',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              ⚙️ Configurações do Produto
            </h3>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '16px 20px',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: 12,
              border: '2px solid rgba(239, 68, 68, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <input 
                type="checkbox" 
                checked={form.inativo === true} 
                onChange={e=>setForm({...form, inativo: e.target.checked})}
                style={{
                  transform: 'scale(1.2)',
                  accentColor: '#ef4444'
                }}
              />
              <div>
                <div style={{
                  fontWeight: '600',
                  color: '#ef4444',
                  fontSize: '1rem',
                  marginBottom: 4
                }}>
                  ❌ Produto Inativo
                </div>
                <div style={{
                  color: '#7f1d1d',
                  fontSize: '0.85rem'
                }}>
                  Marque para desabilitar este produto no catálogo
                </div>
              </div>
            </label>
          </div>
          
          {/* Botões de ação */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16,
            marginTop: 20,
            padding: '24px 0 8px 0'
          }}>
            <button 
              type="submit" 
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px 24px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span style={{fontSize: '1.2rem'}}>💾</span>
              Salvar Alterações
            </button>
            
            <button 
              type="button" 
              onClick={()=>navigate('/config-produto/produtos')} 
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px 24px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(107, 114, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(107, 114, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(107, 114, 128, 0.3)';
              }}
            >
              <span style={{fontSize: '1.2rem'}}>←</span>
              Voltar ao Painel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarProduto;
