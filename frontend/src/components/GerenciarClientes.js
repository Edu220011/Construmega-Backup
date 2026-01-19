import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function GerenciarClientes({ admin = false, cliente, setAdmin, setCliente }) {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', email: ''
  });
  const [modalCriar, setModalCriar] = useState(false);
  const [formCriar, setFormCriar] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', tipo: 'cliente'
  });
  const [criando, setCriando] = useState(false);
  const [mostrarAdmins, setMostrarAdmins] = useState(false);
  const [usuarioPontos, setUsuarioPontos] = useState(null);
  const [pontosParaAdicionar, setPontosParaAdicionar] = useState('');
  const [adicionandoPontos, setAdicionandoPontos] = useState(false);
  const [totalPontos, setTotalPontos] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState('clientes');
  const [buscaPontos, setBuscaPontos] = useState('');
  const [usuariosEncontradosPontos, setUsuariosEncontradosPontos] = useState([]);
  const [mostrarResultadosPontos, setMostrarResultadosPontos] = useState(false);
  const [buscandoPontos, setBuscandoPontos] = useState(false);
  const buscaPontosRef = useRef(null);
  const navigate = useNavigate();

  // Carregar clientes
  useEffect(() => {
    carregarClientes();
  }, [mostrarAdmins]);

  // Verificar hash da URL para definir aba ativa
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'add-pontos') {
      setAbaAtiva('add-pontos');
    } else {
      setAbaAtiva('clientes');
    }
  }, []);

  // Atualizar hash da URL quando aba muda
  useEffect(() => {
    if (abaAtiva === 'add-pontos') {
      window.location.hash = 'add-pontos';
    } else {
      window.location.hash = '';
    }
  }, [abaAtiva]);

  // Fecha a lista de resultados ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (buscaPontosRef.current && !buscaPontosRef.current.contains(event.target)) {
        setMostrarResultadosPontos(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca usuários por nome ou email para adicionar pontos
  const buscarUsuariosPontos = async (termo) => {
    if (!termo || termo.length < 1) {
      setUsuariosEncontradosPontos([]);
      setMostrarResultadosPontos(false);
      return;
    }
    try {
      setBuscandoPontos(true);
      const res = await fetch('/usuarios');
      if (res.ok) {
        const lista = await res.json();
        const termoLimpo = termo.toLowerCase().replace(/[^\w]/g, ''); // Remove caracteres especiais para busca
        const filtrados = lista.filter(u => 
          u.nome.toLowerCase().includes(termo.toLowerCase()) || 
          u.email.toLowerCase().includes(termo.toLowerCase()) ||
          (u.cpf && u.cpf.replace(/[^\d]/g, '').includes(termoLimpo)) || // Busca por CPF removendo formatação
          (u.id && u.id.toString().includes(termo)) // Busca por ID
        ).slice(0, 10); // Limita a 10 resultados
        setUsuariosEncontradosPontos(filtrados);
        setMostrarResultadosPontos(filtrados.length > 0);
      } else {
        setUsuariosEncontradosPontos([]);
        setMostrarResultadosPontos(false);
      }
    } catch {
      setUsuariosEncontradosPontos([]);
      setMostrarResultadosPontos(false);
    } finally {
      setBuscandoPontos(false);
    }
  };

  // Seleciona um usuário da lista de busca para adicionar pontos
  const selecionarUsuarioPontos = (usuario) => {
    setUsuarioPontos(usuario);
    setBuscaPontos('');
    setUsuariosEncontradosPontos([]);
    setMostrarResultadosPontos(false);
  };

  // Carregar clientes
  const carregarClientes = () => {
    setCarregando(true);
    fetch('/usuarios')
      .then(res => res.json())
      .then(data => {
        // Filtrar usuários baseado na configuração mostrarAdmins
        let usuariosFiltrados;
        if (mostrarAdmins) {
          // Mostrar clientes E administradores
          usuariosFiltrados = data.filter(user => user.tipo === 'cliente' || user.tipo === 'admin');
        } else {
          // Mostrar apenas clientes (excluindo admins, pedreiros e vendedores)
          usuariosFiltrados = data.filter(user => user.tipo === 'cliente');
        }
        setClientes(usuariosFiltrados);
        
        // Calcular total de pontos
        const pontosTotais = usuariosFiltrados.reduce((total, user) => {
          return total + (user.pontos || 0);
        }, 0);
        setTotalPontos(pontosTotais);
        
        setCarregando(false);
      })
      .catch(err => {
        console.error('Erro ao carregar usuários:', err);
        setCarregando(false);
      });
  }

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpf.includes(filtro.replace(/\D/g, ''))
  );

  function abrirModalEditar(cliente) {
    setClienteEditando(cliente);
    setFormEditar({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      email: cliente.email
    });
    setModalEditar(true);
  }

  function fecharModalEditar() {
    setModalEditar(false);
    setClienteEditando(null);
    setFormEditar({ nome: '', cpf: '', telefone: '', endereco: '', email: '' });
  }

  function handleEditarChange(e) {
    const { name, value } = e.target;
    if (name === 'cpf') {
      let v = value.replace(/\D/g, '');
      v = v.slice(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      setFormEditar({ ...formEditar, cpf: v });
    } else if (name === 'telefone') {
      let v = value.replace(/\D/g, '');
      v = v.slice(0, 11);
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1)$2');
      setFormEditar({ ...formEditar, telefone: v });
    } else {
      setFormEditar({ ...formEditar, [name]: value });
    }
  }

  function salvarEdicao() {
    fetch(`/usuarios/${clienteEditando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEditar)
    })
      .then(res => res.json())
      .then(() => {
        carregarClientes();
        fecharModalEditar();
      })
      .catch(err => console.error('Erro ao editar cliente:', err));
  }

  function handleCriarChange(e) {
    const { name, value } = e.target;
    if (name === 'cpf') {
      let v = value.replace(/\D/g, '');
      v = v.slice(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      setFormCriar({ ...formCriar, cpf: v });
    } else if (name === 'telefone') {
      let v = value.replace(/\D/g, '');
      v = v.slice(0, 11);
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1)$2');
      setFormCriar({ ...formCriar, telefone: v });
    } else {
      setFormCriar({ ...formCriar, [name]: value });
    }
  }

  function criarUsuario() {
    if (!formCriar.nome || !formCriar.email || !formCriar.senha) {
      alert('Nome, email e senha são obrigatórios!');
      return;
    }

    setCriando(true);
    fetch('/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formCriar)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Erro: ' + data.error);
        } else {
          carregarClientes();
          fecharModalCriar();
          alert('Usuário criado com sucesso!');
        }
        setCriando(false);
      })
      .catch(err => {
        console.error('Erro ao criar usuário:', err);
        alert('Erro ao criar usuário');
        setCriando(false);
      });
  }

  function fecharModalCriar() {
    setModalCriar(false);
    setFormCriar({
      nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', tipo: 'cliente'
    });
  }

  function adicionarPontos() {
    if (!pontosParaAdicionar || isNaN(Number(pontosParaAdicionar)) || Number(pontosParaAdicionar) <= 0) {
      alert('Digite uma quantidade válida de pontos!');
      return;
    }

    setAdicionandoPontos(true);
    fetch(`/usuarios/${usuarioPontos.id}/pontos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pontos: Number(pontosParaAdicionar)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          alert(`Pontos adicionados com sucesso! ${usuarioPontos.nome} recebeu ${pontosParaAdicionar} pontos.`);
          setUsuarioPontos(null);
          setPontosParaAdicionar('');
          // Recarregar lista para atualizar dados
          carregarClientes();
        } else {
          alert('Erro: ' + (data.erro || 'Erro ao adicionar pontos'));
        }
        setAdicionandoPontos(false);
      })
      .catch(err => {
        console.error('Erro ao adicionar pontos:', err);
        alert('Erro ao adicionar pontos');
        setAdicionandoPontos(false);
      });
  }

  function excluirCliente(id) {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      fetch(`/usuarios/${id}`, {
        method: 'DELETE'
      })
        .then(() => carregarClientes())
        .catch(err => console.error('Erro ao excluir cliente:', err));
    }
  }

  if (!admin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>🚫 Acesso Negado</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-padrao"
            style={{ width: '100%' }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px',
          color: '#ffffff'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '800',
            textAlign: 'center'
          }}>
            👥 Gerenciar {mostrarAdmins ? 'Usuários' : 'Clientes'}
          </h1>
          <p style={{
            margin: 0,
            textAlign: 'center',
            opacity: 0.9,
            fontSize: '16px'
          }}>
            {mostrarAdmins 
              ? 'Gerencie os clientes e administradores da Construmega'
              : 'Gerencie os clientes da Construmega (usuários do tipo Cliente)'
            }
          </p>

          {/* Contador de usuários */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
                {clientes.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {mostrarAdmins ? 'Total de Usuários' : 'Clientes Ativos'}
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
                {totalPontos.toLocaleString()}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                🎯 Total de Pontos
              </div>
            </div>

            {mostrarAdmins && (
              <>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {clientes.filter(u => u.tipo === 'cliente').length}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    👤 Clientes
                  </div>
                </div>

                <div style={{
                  background: 'rgba(124, 58, 237, 0.2)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {clientes.filter(u => u.tipo === 'admin').length}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    👑 Admins
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navegação por Abas */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 32px'
        }}>
          <div style={{
            display: 'flex',
            gap: '0'
          }}>
            <button
              onClick={() => setAbaAtiva('clientes')}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: abaAtiva === 'clientes' ? '#ffffff' : 'transparent',
                color: abaAtiva === 'clientes' ? '#1f2937' : '#6b7280',
                fontSize: '16px',
                fontWeight: abaAtiva === 'clientes' ? '600' : '500',
                borderBottom: abaAtiva === 'clientes' ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👥 Gerenciar Clientes
            </button>
            <button
              onClick={() => setAbaAtiva('add-pontos')}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: abaAtiva === 'add-pontos' ? '#ffffff' : 'transparent',
                color: abaAtiva === 'add-pontos' ? '#1f2937' : '#6b7280',
                fontSize: '16px',
                fontWeight: abaAtiva === 'add-pontos' ? '600' : '500',
                borderBottom: abaAtiva === 'add-pontos' ? '3px solid #f59e0b' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🎯 Adicionar Pontos
            </button>
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        <div style={{
          display: abaAtiva === 'add-pontos' ? 'block' : 'none'
        }}>
          {/* Aba Adicionar Pontos */}
          <div style={{ padding: '32px' }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  🎯 Adicionar Pontos aos Usuários
                </h2>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '16px'
                }}>
                  Selecione um usuário e adicione pontos à sua conta
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  Buscar Usuário por Nome ou Email *
                </label>
                <div style={{position:'relative'}} ref={buscaPontosRef}>
                  <input
                    type="text"
                    placeholder="Digite nome, email, CPF ou ID do usuário..."
                    value={buscaPontos}
                    onChange={e => { 
                      setBuscaPontos(e.target.value); 
                      buscarUsuariosPontos(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#ffffff',
                      marginBottom: '16px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  {buscandoPontos && (
                    <div style={{
                      position:'absolute',
                      right:20,
                      top:'50%',
                      transform:'translateY(-50%)',
                      fontSize:14,
                      color:'#666'
                    }}>
                      Buscando...
                    </div>
                  )}
                  {mostrarResultadosPontos && usuariosEncontradosPontos.length > 0 && (
                    <div style={{
                      position:'absolute',
                      top:'100%',
                      left:0,
                      right:0,
                      background:'#fff',
                      border:'1px solid #e5e7eb',
                      borderRadius:8,
                      boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                      maxHeight:200,
                      overflowY:'auto',
                      zIndex:1000,
                      marginTop:4
                    }}>
                      {usuariosEncontradosPontos.map(usuario => (
                        <div
                          key={usuario.id}
                          onClick={() => selecionarUsuarioPontos(usuario)}
                          style={{
                            padding:12,
                            cursor:'pointer',
                            borderBottom: usuariosEncontradosPontos.indexOf(usuario) < usuariosEncontradosPontos.length - 1 ? '1px solid #f0f0f0' : 'none',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                        >
                          <div style={{fontWeight:'bold', marginBottom:2}}>{usuario.nome}</div>
                          <div style={{fontSize:12,color:'#666'}}>{usuario.email} - ID: {usuario.id} - Pontos: {usuario.pontos || 0}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {mostrarResultadosPontos && usuariosEncontradosPontos.length === 0 && buscaPontos.length >= 1 && !buscandoPontos && (
                    <div style={{
                      position:'absolute',
                      top:'100%',
                      left:0,
                      right:0,
                      background:'#fff',
                      border:'1px solid #e5e7eb',
                      borderRadius:8,
                      boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                      zIndex:1000,
                      marginTop:4,
                      padding:12,
                      textAlign:'center',
                      color:'#666',
                      fontSize:14
                    }}>
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              </div>

              {usuarioPontos && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Informações do Usuário
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <strong>Nome:</strong> {usuarioPontos.nome}
                    </div>
                    <div>
                      <strong>Email:</strong> {usuarioPontos.email}
                    </div>
                    <div>
                      <strong>ID:</strong> {usuarioPontos.id}
                    </div>
                    <div>
                      <strong>Pontos atuais:</strong> {usuarioPontos.pontos || 0}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  Quantidade de Pontos *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Digite a quantidade de pontos"
                  value={pontosParaAdicionar}
                  onChange={(e) => setPontosParaAdicionar(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setAbaAtiva('clientes')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ← Voltar para Clientes
                </button>
                <button
                  onClick={adicionarPontos}
                  disabled={adicionandoPontos || !usuarioPontos}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: adicionandoPontos ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    fontWeight: '600',
                    cursor: adicionandoPontos || !usuarioPontos ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '16px'
                  }}
                >
                  {adicionandoPontos ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Adicionando...
                    </>
                  ) : (
                    '🎯 Adicionar Pontos'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: abaAtiva === 'clientes' ? 'block' : 'none'
        }}>
          {/* Seção de Gerenciamento de Pontos */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🎯 Gerenciamento de Pontos
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#78350f',
                    fontSize: '14px'
                  }}>
                    Gerencie os pontos dos usuários de forma centralizada
                  </p>
                </div>
                <button
                  onClick={() => setAbaAtiva('add-pontos')}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  ➕ Adicionar Pontos
                </button>
              </div>
            </div>

            {/* Barra de ferramentas */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Campo de busca */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Toggle para mostrar admins */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                👑 Mostrar Admins:
              </label>
              <button
                onClick={() => setMostrarAdmins(!mostrarAdmins)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: mostrarAdmins 
                    ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' 
                    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  color: mostrarAdmins ? '#ffffff' : '#6b7280',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {mostrarAdmins ? '✅ Sim' : '❌ Não'}
              </button>
            </div>

            {/* Botões de ação */}
            <button
              onClick={() => navigate('/criar-usuario')}
              className="btn-padrao"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none'
              }}
            >
              📄 Página Criar Usuário
            </button>

            <button
              onClick={carregarClientes}
              className="btn-padrao"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '32px' }}>

          {/* Estatísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                👥 {clientes.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total de Clientes
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                📧 {clientesFiltrados.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Clientes Encontrados
              </div>
            </div>
          </div>

          {/* Loading */}
          {carregando && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              Carregando clientes...
            </div>
          )}

          {/* Lista de clientes */}
          {!carregando && (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {clientesFiltrados.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #e5e7eb'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Nenhum cliente encontrado
                  </div>
                  <div>
                    {filtro ? 'Tente ajustar os filtros de busca.' : 'Ainda não há clientes cadastrados.'}
                  </div>
                </div>
              ) : (
                clientesFiltrados.map((cliente, index) => (
                  <div key={cliente.id} style={{
                    position: 'relative',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'}
                  >
                    {/* Indicador numérico */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '16px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      border: '2px solid #ffffff'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '16px',
                      alignItems: 'start'
                    }}>
                      {/* Informações do cliente */}
                      <div>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {cliente.nome}
                        </h3>

                        <div style={{
                          marginBottom: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: cliente.tipo === 'admin' 
                            ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' 
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff'
                        }}>
                          {cliente.tipo === 'admin' ? '👑 Admin' : '👤 Cliente'}
                        </div>

                        {/* Contador de Pontos */}
                        <div style={{
                          marginBottom: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                        }}>
                          🎯 {cliente.pontos || 0} Pontos
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <div>
                            <strong>CPF:</strong> {cliente.cpf}
                          </div>
                          <div>
                            <strong>Email:</strong> {cliente.email}
                          </div>
                          <div>
                            <strong>Telefone:</strong> {cliente.telefone}
                          </div>
                          <div>
                            <strong>Endereço:</strong> {cliente.endereco}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => abrirModalEditar(cliente)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          onClick={() => excluirCliente(cliente.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
        {/* </>
      )} */}
        </div>

      {/* Modal de edição */}
      {modalEditar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              ✏️ Editar Cliente
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                name="nome"
                placeholder="Nome completo"
                value={formEditar.nome}
                onChange={handleEditarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="cpf"
                placeholder="CPF"
                value={formEditar.cpf}
                onChange={handleEditarChange}
                maxLength={14}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="telefone"
                placeholder="Telefone"
                value={formEditar.telefone}
                onChange={handleEditarChange}
                maxLength={15}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="endereco"
                placeholder="Endereço"
                value={formEditar.endereco}
                onChange={handleEditarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="email"
                placeholder="Email"
                value={formEditar.email}
                onChange={handleEditarChange}
                type="email"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={salvarEdicao}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                💾 Salvar
              </button>

              <button
                onClick={fecharModalEditar}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Usuário */}
      {modalCriar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
          }}
          onClick={fecharModalCriar}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: '20px',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#1f2937',
              fontSize: '24px',
              fontWeight: '800',
              textAlign: 'center'
            }}>
              ➕ Criar Novo Usuário
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                name="nome"
                placeholder="Nome completo *"
                value={formCriar.nome}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="email"
                type="email"
                placeholder="Email *"
                value={formCriar.email}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="senha"
                type="password"
                placeholder="Senha *"
                value={formCriar.senha}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="cpf"
                placeholder="CPF"
                value={formCriar.cpf}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="telefone"
                placeholder="Telefone"
                value={formCriar.telefone}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <input
                name="endereco"
                placeholder="Endereço"
                value={formCriar.endereco}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />

              <select
                name="tipo"
                value={formCriar.tipo}
                onChange={handleCriarChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                <option value="cliente">👤 CLIENTE</option>
                <option value="pedreiro">🔨 PEDREIRO</option>
                <option value="vendedor">💼 VENDEDOR</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={criarUsuario}
                disabled={criando}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: criando ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: criando ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {criando ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Criando...
                  </>
                ) : (
                  '✅ Criar Usuário'
                )}
              </button>

              <button
                onClick={fecharModalCriar}
                disabled={criando}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#6b7280',
                  fontWeight: '600',
                  cursor: criando ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animação */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GerenciarClientes;