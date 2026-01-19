import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ListaUsuarios({ admin = false, cliente, setAdmin, setCliente }) {
  const [novoModal, setNovoModal] = useState(false);
  const navigate = useNavigate();
  // Botão Adicionar Pontos para admin
  const renderAdicionarPontos = () => (
    admin ? (
      <button
        type="button"
        className="btn-padrao"
        style={{marginBottom:24}}
        onClick={()=> navigate('/adicionar-pontos')}
      >
        Adicionar Pontos
      </button>
    ) : null
  );
  // ...restante do componente permanece igual
    const [novoMsg, setNovoMsg] = useState('');


    function handleNovoChange(e) {
      const { name, value } = e.target;
      if (name === 'cpf') {
        let v = value.replace(/\D/g, '');
        v = v.slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        setNovoForm({ ...novoForm, cpf: v });
      } else if (name === 'telefone') {
        let v = value.replace(/\D/g, '');
        v = v.slice(0, 11);
        if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1)$2');
        setNovoForm({ ...novoForm, telefone: v });
      } else {
        setNovoForm({ ...novoForm, [name]: value });
      }
    }

    function validarCPF(cpf) {
      cpf = cpf.replace(/\D/g, '');
      if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
      let soma = 0, resto;
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i-1]) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) return false;
      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i-1]) * (12 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[10])) return false;
      return true;
    }

    async function handleNovoSubmit(e) {
      e.preventDefault();
      setNovoMsg('');
      if (novoForm.senha !== novoForm.senha2) {
        setNovoMsg('As senhas não coincidem.');
        return;
      }
      if (!validarCPF(novoForm.cpf)) {
        setNovoMsg('CPF inválido.');
        return;
      }
      // O campo tipo define a permissão: 'admin' ou 'cliente'
      const dados = { nome: novoForm.nome, cpf: novoForm.cpf, telefone: novoForm.telefone, endereco: novoForm.endereco, email: novoForm.email, senha: novoForm.senha, tipo: novoForm.tipo };
      const res = await fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      if (res.ok) {
        setNovoMsg('Usuário cadastrado com sucesso!');
        setNovoForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'cliente' });
        setTimeout(()=>{ setNovoModal(false); setNovoMsg(''); }, 1200);
        fetch('/usuarios').then(res=>res.json()).then(setUsuarios);
      } else {
        setNovoMsg('Erro ao cadastrar. Tente outro email ou CPF.');
      }
    }
  const [usuarios, setUsuarios] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('nome');
  const [filtro, setFiltro] = useState('');
  // Estado para o formulário de novo usuário
  const [novoForm, setNovoForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'cliente' });
  // Estados para edição e senha do usuário selecionado
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', tipo: 'gerente' });
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');

  // Atualiza o form sempre que o usuário selecionado mudar
  useEffect(() => {
    if (detalhe) {
      const u = usuarios.find(x => x.id === detalhe);
      if (u) setForm({
        nome: u.nome || '',
        cpf: u.cpf || '',
        telefone: u.telefone || '',
        endereco: u.endereco || '',
        email: u.email || '',
        tipo: u.tipo || 'gerente',
        id: u.id
      });
    }
  }, [detalhe, usuarios]);

  useEffect(() => {
    fetch('/usuarios')
      .then(res => res.json())
      .then(setUsuarios);
  }, []);

  const usuariosFiltrados = usuarios.filter(u => {
    if (!filtro) return true;
    const valor = (u[tipoFiltro] || '').toString().toLowerCase();
    return valor.includes(filtro.toLowerCase());
  });

  return (
    <div style={{
      maxWidth: 1200,
      minHeight: '80vh',
      margin: '32px auto',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
      padding: '48px 56px',
      position: 'relative',
      border: '2px solid rgba(102, 126, 234, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Header principal modernizado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
        position: 'relative',
        zIndex: 1,
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <h2 style={{
            color: '#2d3748',
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            👥 Gerenciar Usuários
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          {renderAdicionarPontos()}
          <button 
            onClick={() => navigate('/gerenciar-clientes')}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
            }}
          >
            👥 Gerenciar Clientes
          </button>
          <button 
            onClick={() => navigate('/criar-usuario')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
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
            ➕ Criar Usuário
          </button>
          <button 
            onClick={() => setNovoModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
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
            ➕ Novo Usuário
          </button>
        </div>
      </div>
            {/* Painel completo modernizado para novo usuário */}
            {novoModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflow: 'auto'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 24,
                  padding: '48px 56px',
                  width: '100%',
                  maxWidth: '600px',
                  maxHeight: '95vh',
                  overflowY: 'auto',
                  position: 'relative',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  animation: 'fadeInUp 0.4s ease'
                }}>
                  {/* Botão de fechar modernizado */}
                  <button 
                    onClick={() => {setNovoModal(false); setNovoMsg(''); setNovoForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'cliente' });}} 
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 24,
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(229, 115, 115, 0.15))',
                      border: '2px solid rgba(244, 67, 54, 0.3)',
                      borderRadius: 50,
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      color: '#f44336',
                      cursor: 'pointer',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(5px)'
                    }} 
                    title="Fechar"
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.25), rgba(229, 115, 115, 0.25))';
                      e.target.style.transform = 'scale(1.1) rotate(90deg)';
                      e.target.style.borderColor = 'rgba(244, 67, 54, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(229, 115, 115, 0.15))';
                      e.target.style.transform = 'scale(1) rotate(0deg)';
                      e.target.style.borderColor = 'rgba(244, 67, 54, 0.3)';
                    }}
                  >
                    ✕
                  </button>
                  
                  {/* Header principal do painel */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: 40,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      border: '4px solid rgba(255, 255, 255, 0.9)'
                    }}>
                      👥
                    </div>
                    <h1 style={{
                      color: '#2d3748',
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      margin: '40px 0 12px 0',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: 'none'
                    }}>
                      Cadastrar Novo Usuário
                    </h1>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '1.1rem',
                      margin: 0,
                      fontWeight: '500',
                      lineHeight: 1.5
                    }}>
                      Preencha todos os campos para criar uma nova conta de usuário no sistema
                    </p>
                  </div>
                  
                  {/* Formulário principal */}
                  <form onSubmit={handleNovoSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 28
                  }}>
                    {/* Seção de dados pessoais */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      padding: '32px',
                      borderRadius: 20,
                      border: '2px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <h3 style={{
                        color: '#667eea',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        margin: '0 0 24px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        👤 Informações Pessoais
                      </h3>
                      
                      <div style={{display: 'grid', gap: 20}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                          <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Nome Completo *</label>
                          <input 
                            name="nome" 
                            placeholder="Digite o nome completo do usuário" 
                            value={novoForm.nome} 
                            onChange={handleNovoChange} 
                            required 
                            style={{
                              padding: '16px 20px',
                              borderRadius: 12,
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              fontSize: '1.05rem',
                              transition: 'all 0.3s ease',
                              background: 'rgba(255, 255, 255, 0.95)',
                              color: '#2d3748',
                              fontWeight: '500'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                              e.target.style.background = '#fff';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            }}
                          />
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>CPF *</label>
                            <input 
                              name="cpf" 
                              placeholder="000.000.000-00" 
                              value={novoForm.cpf} 
                              onChange={handleNovoChange} 
                              required 
                              maxLength={14}
                              inputMode="numeric" 
                              pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" 
                              autoComplete="off"
                              style={{
                                padding: '16px 20px',
                                borderRadius: 12,
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#2d3748',
                                fontWeight: '500'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                e.target.style.background = '#fff';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                              }}
                            />
                          </div>
                          
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Telefone *</label>
                            <input 
                              name="telefone" 
                              placeholder="(00) 00000-0000" 
                              value={novoForm.telefone} 
                              onChange={handleNovoChange} 
                              required 
                              maxLength={14}
                              inputMode="numeric" 
                              pattern="\\(\\d{2}\\)\\d{5}-\\d{4}" 
                              autoComplete="off"
                              style={{
                                padding: '16px 20px',
                                borderRadius: 12,
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#2d3748',
                                fontWeight: '500'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                e.target.style.background = '#fff';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seção de contato e endereço */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(129, 199, 132, 0.05) 100%)',
                      padding: '32px',
                      borderRadius: 20,
                      border: '2px solid rgba(76, 175, 80, 0.1)'
                    }}>
                      <h3 style={{
                        color: '#4caf50',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        margin: '0 0 24px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        📧 Contato e Endereço
                      </h3>
                      
                      <div style={{display: 'grid', gap: 20}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                          <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Email *</label>
                          <input 
                            name="email" 
                            placeholder="usuario@exemplo.com" 
                            value={novoForm.email} 
                            onChange={handleNovoChange} 
                            required 
                            type="email"
                            style={{
                              padding: '16px 20px',
                              borderRadius: 12,
                              border: '2px solid rgba(76, 175, 80, 0.2)',
                              fontSize: '1.05rem',
                              transition: 'all 0.3s ease',
                              background: 'rgba(255, 255, 255, 0.95)',
                              color: '#2d3748',
                              fontWeight: '500'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4caf50';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                              e.target.style.background = '#fff';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            }}
                          />
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                          <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Endereço Completo *</label>
                          <input 
                            name="endereco" 
                            placeholder="Rua, número, bairro, cidade - Estado" 
                            value={novoForm.endereco} 
                            onChange={handleNovoChange} 
                            required 
                            style={{
                              padding: '16px 20px',
                              borderRadius: 12,
                              border: '2px solid rgba(76, 175, 80, 0.2)',
                              fontSize: '1.05rem',
                              transition: 'all 0.3s ease',
                              background: 'rgba(255, 255, 255, 0.95)',
                              color: '#2d3748',
                              fontWeight: '500'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4caf50';
                              e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                              e.target.style.background = '#fff';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(76, 175, 80, 0.2)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Seção de segurança */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)',
                      padding: '32px',
                      borderRadius: 20,
                      border: '2px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <h3 style={{
                        color: '#ff9800',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        margin: '0 0 24px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        🔐 Segurança e Permissões
                      </h3>
                      
                      <div style={{display: 'grid', gap: 20}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Senha *</label>
                            <input 
                              name="senha" 
                              placeholder="Crie uma senha segura" 
                              value={novoForm.senha} 
                              onChange={handleNovoChange} 
                              required 
                              type="password"
                              style={{
                                padding: '16px 20px',
                                borderRadius: 12,
                                border: '2px solid rgba(255, 152, 0, 0.2)',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#2d3748',
                                fontWeight: '500'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#ff9800';
                                e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                                e.target.style.background = '#fff';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                              }}
                            />
                          </div>
                          
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Confirmar Senha *</label>
                            <input 
                              name="senha2" 
                              placeholder="Confirme a senha" 
                              value={novoForm.senha2} 
                              onChange={handleNovoChange} 
                              required 
                              type="password"
                              style={{
                                padding: '16px 20px',
                                borderRadius: 12,
                                border: '2px solid rgba(255, 152, 0, 0.2)',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#2d3748',
                                fontWeight: '500'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#ff9800';
                                e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                                e.target.style.background = '#fff';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                          <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>Tipo de Usuário *</label>
                          <select 
                            name="tipo" 
                            value={novoForm.tipo} 
                            onChange={handleNovoChange}
                            style={{
                              padding: '16px 20px',
                              borderRadius: 12,
                              border: '2px solid rgba(255, 152, 0, 0.2)',
                              fontSize: '1.05rem',
                              fontWeight: '600',
                              background: 'rgba(255, 255, 255, 0.95)',
                              color: '#2d3748',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#ff9800';
                              e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(255, 152, 0, 0.2)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="cliente">👤 Cliente (Usuário Padrão)</option>
                            <option value="admin">👑 Administrador (Acesso Total)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 12
                    }}>
                      <button 
                        type="button"
                        onClick={() => {setNovoModal(false); setNovoMsg(''); setNovoForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '', tipo: 'cliente' });}}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(156, 163, 175, 0.1) 100%)',
                          color: '#6b7280',
                          border: '2px solid rgba(107, 114, 128, 0.3)',
                          borderRadius: 12,
                          padding: '16px 24px',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(156, 163, 175, 0.15) 100%)';
                          e.target.style.borderColor = 'rgba(107, 114, 128, 0.4)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(156, 163, 175, 0.1) 100%)';
                          e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        ❌ Cancelar
                      </button>
                      
                      <button 
                        type="submit" 
                        style={{
                          flex: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 12,
                          padding: '16px 32px',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-3px)';
                          e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        ✨ Cadastrar Usuário
                      </button>
                    </div>
                  </form>
                  
                  {/* Mensagem de feedback */}
                  {novoMsg && (
                    <div style={{
                      marginTop: 24,
                      padding: '20px 24px',
                      background: novoMsg.includes('sucesso') 
                        ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)' 
                        : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 115, 115, 0.1) 100%)',
                      color: novoMsg.includes('sucesso') ? '#2e7d32' : '#d32f2f',
                      textAlign: 'center',
                      borderRadius: 16,
                      border: `2px solid ${novoMsg.includes('sucesso') ? 'rgba(46, 125, 50, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      animation: 'fadeInUp 0.3s ease'
                    }}>
                      {novoMsg.includes('sucesso') ? '🎉' : '⚠️'} {novoMsg}
                    </div>
                  )}
                </div>
              </div>
            )}
      {/* Sistema de busca modernizado */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
        zIndex: 200
      }}>
        <button
          onClick={() => setMostrarBusca(f => !f)}
          style={{
            background: mostrarBusca 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))',
            color: mostrarBusca ? '#fff' : '#667eea',
            fontSize: '1.2rem',
            border: mostrarBusca ? 'none' : '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: mostrarBusca 
              ? '0 4px 16px rgba(102, 126, 234, 0.3)' 
              : '0 2px 8px rgba(102, 126, 234, 0.1)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          title="Pesquisar usuários"
          onMouseEnter={(e) => {
            if (!mostrarBusca) {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!mostrarBusca) {
              e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          🔍 {mostrarBusca ? 'Ocultar Busca' : 'Buscar'}
        </button>
        {mostrarBusca && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            left: 0,
            marginBottom: 12,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
            padding: '20px 24px',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'fadeInDown 0.3s ease',
            zIndex: 300
          }}>
            <select 
              value={tipoFiltro} 
              onChange={e => setTipoFiltro(e.target.value)} 
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid rgba(102, 126, 234, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#2d3748',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="nome">👤 Nome</option>
              <option value="cpf">📄 CPF</option>
              <option value="telefone">📞 Telefone</option>
              <option value="endereco">📍 Endereço</option>
              <option value="email">📧 Email</option>
              <option value="tipo">🎯 Permissão</option>
            </select>
            <input
              type="text"
              placeholder={`🔎 Pesquisar por ${tipoFiltro}...`}
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '12px 18px',
                borderRadius: 10,
                border: '2px solid rgba(102, 126, 234, 0.2)',
                fontSize: '1.05rem',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#2d3748',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
              autoFocus
            />
          </div>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        filter: detalhe ? 'blur(3px)' : 'none',
        pointerEvents: detalhe ? 'none' : 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        {usuariosFiltrados.length === 0 && (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '1.2rem',
            fontWeight: '500',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            border: '2px dashed rgba(102, 126, 234, 0.2)'
          }}>
            🔍 Nenhum usuário encontrado.
          </div>
        )}
        {usuariosFiltrados.map(u => (
          <div 
            key={u.id} 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              backdropFilter: 'blur(15px)',
              borderRadius: 20,
              padding: '28px 32px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.18)';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.12)';
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
            }}
            onClick={() => setDetalhe(u.id)}
          >
            {/* Elemento decorativo */}
            <div style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            
            {/* Header do card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#fff',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  {u.tipo === 'admin' ? '👑' : '👤'}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#2d3748',
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    {u.nome}
                  </h3>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#667eea',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {u.tipo}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#4caf50',
                  background: 'rgba(76, 175, 80, 0.1)',
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  ⭐ {typeof u.pontos === 'number' ? u.pontos : 0}P
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  background: 'rgba(107, 114, 128, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontFamily: 'monospace'
                }}>
                  ID: {u.id}
                </span>
              </div>
            </div>
            
            {/* Informações do usuário */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontSize: '0.9rem'
            }}>
              <div style={{
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{color: '#667eea', fontWeight: '600'}}>📞</span>
                {u.telefone || 'N/A'}
              </div>
              <div style={{
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{color: '#667eea', fontWeight: '600'}}>📧</span>
                {u.email?.substring(0, 15)}...
              </div>
            </div>
            
            {/* Status e botão de ação */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 8,
              paddingTop: 16,
              borderTop: '2px solid rgba(102, 126, 234, 0.1)'
            }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: u.ativo !== false ? '#4caf50' : '#f44336',
                background: u.ativo !== false ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                padding: '4px 10px',
                borderRadius: 8,
                border: `1px solid ${u.ativo !== false ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`
              }}>
                {u.ativo !== false ? '✅ Ativo' : '❌ Inativo'}
              </span>
              
              <a 
                href={`/usuario/editar/${u.id}`} 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.2)';
                }}
              >
                ✏️ Editar
              </a>
            </div>
          </div>
        ))}
      </div>
      {/* Modal modernizado de detalhes/edição do usuário */}
      {detalhe && (() => {
        const u = usuarios.find(x => x.id === detalhe);
        if (!u || !form) return null;
        const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
        const handleSave = async e => {
          e.preventDefault();
          setMsg('Salvando...');
          const usuarioAtual = usuarios.find(x => x.id === u.id);
          const payload = { ...form, tipo: (form.tipo || usuarioAtual?.tipo || 'gerente') };
          const res = await fetch(`/usuarios/${u.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            setMsg('Dados atualizados!');
            setEdit(false);
            // Atualiza lista e mantém painel aberto
            fetch('/usuarios')
              .then(res => res.json())
              .then(novosUsuarios => {
                setUsuarios(novosUsuarios);
                // Mantém o detalhe aberto para o mesmo usuário atualizado
                setDetalhe(u.id);
              });
          } else {
            setMsg('Erro ao salvar.');
          }
        };
        const handleResetSenha = async () => {
          if (!window.confirm('Deseja realmente resetar a senha deste usuário?')) return;
          setMsg('Resetando senha...');
          // Gera senha aleatória de 8 dígitos
          const novaSenha = senha || Math.random().toString(36).slice(-8);
          const res = await fetch(`/usuarios/${u.id}/senha`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: novaSenha })
          });
          if (res.ok) {
            setMsg(`Senha resetada! Nova senha: ${novaSenha}`);
            setSenha('');
          } else {
            setMsg('Erro ao resetar senha.');
          }
        };
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: '40px 48px',
              minWidth: 500,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
              border: '2px solid rgba(102, 126, 234, 0.1)',
              animation: 'fadeInDown 0.3s ease'
            }}>
              {/* Botão de fechar modernizado */}
              <button 
                onClick={() => {setDetalhe(null); setEdit(false); setMsg('');}} 
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '2px solid rgba(244, 67, 54, 0.2)',
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  color: '#f44336',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }} 
                title="Fechar"
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(244, 67, 54, 0.2)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(244, 67, 54, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
              
              {/* Header do modal */}
              <div style={{
                textAlign: 'center',
                marginBottom: 32
              }}>
                <h2 style={{
                  color: '#2d3748',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {edit ? '✏️ Editar Usuário' : '👤 Detalhes do Usuário'}
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  margin: '8px 0 0 0',
                  fontWeight: '500'
                }}>
                  {edit ? 'Modifique os dados do usuário' : `ID: ${u.id} • ${u.tipo === 'admin' ? '👑 Administrador' : '👤 Cliente'}`}
                </p>
              </div>
              
              {edit ? (
                /* Modo de edição */
                <form onSubmit={handleSave} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20
                }}>
                  <div style={{display: 'grid', gap: 20}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                      <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>👤 Nome Completo:</label>
                      <input 
                        name="nome" 
                        value={form.nome} 
                        onChange={handleChange} 
                        placeholder="Nome completo" 
                        required 
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#2d3748'
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
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📄 CPF:</label>
                        <input 
                          name="cpf" 
                          value={form.cpf} 
                          onChange={handleChange} 
                          placeholder="000.000.000-00" 
                          required 
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748'
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
                      
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📞 Telefone:</label>
                        <input 
                          name="telefone" 
                          value={form.telefone} 
                          onChange={handleChange} 
                          placeholder="(00) 00000-0000" 
                          required 
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748'
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
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📍 Endereço:</label>
                        <input 
                          name="endereco" 
                          value={form.endereco} 
                          onChange={handleChange} 
                          placeholder="Endereço completo" 
                          required 
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748'
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
                      
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📧 Email:</label>
                        <input 
                          name="email" 
                          value={form.email} 
                          onChange={handleChange} 
                          placeholder="email@exemplo.com" 
                          required 
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748'
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
                    </div>
                    
                    {/* Configurações avançadas */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      padding: '20px',
                      borderRadius: 16,
                      border: '2px solid rgba(46, 125, 50, 0.2)'
                    }}>
                      <h4 style={{
                        color: '#2e7d32',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        ⚙️ Configurações Avançadas
                      </h4>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                          <label style={{fontWeight: '600', color: '#2e7d32', fontSize: '1rem'}}>🎯 Tipo de Usuário:</label>
                          <select 
                            name="tipo" 
                            value={form.tipo} 
                            onChange={handleChange}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 10,
                              border: '2px solid rgba(46, 125, 50, 0.2)',
                              fontSize: '1rem',
                              fontWeight: '500',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: '#2d3748',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="admin">👑 Administrador</option>
                            <option value="cliente">👤 Cliente</option>
                          </select>
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                          <label style={{fontWeight: '600', color: '#2e7d32', fontSize: '1rem'}}>⚡ Status da Conta:</label>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: 10,
                            border: '1px solid rgba(46, 125, 50, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.7)'}>
                            <input 
                              type="checkbox" 
                              name="ativo" 
                              checked={form.ativo !== false} 
                              onChange={e => setForm({...form, ativo: e.target.checked})} 
                              style={{
                                width: 20,
                                height: 20,
                                accentColor: '#4caf50',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{color: '#2e7d32'}}>
                              {form.ativo !== false ? '✅ Conta Ativa' : '❌ Conta Desativada'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de salvar */}
                  <button 
                    type="submit" 
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      marginTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
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
                    💾 Salvar Alterações
                  </button>
                </form>
              ) : (
                /* Modo de visualização */
                <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                  {/* Grid de informações do usuário */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 16
                  }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>👤</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Nome</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700'}}>{u.nome}</div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>📄</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>CPF</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700'}}>{u.cpf}</div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>📞</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Telefone</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700'}}>{u.telefone}</div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>📧</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700', wordBreak: 'break-word'}}>{u.email}</div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>🎯</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Tipo</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700'}}>
                          {u.tipo === 'admin' ? '👑 Administrador' : '👤 Cliente'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: u.ativo !== false ? '#4caf50' : '#f44336'
                      }}>{u.ativo !== false ? '✅' : '❌'}</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Status</div>
                        <div style={{
                          fontSize: '1.1rem', 
                          color: u.ativo !== false ? '#4caf50' : '#f44336', 
                          fontWeight: '700'
                        }}>
                          {u.ativo !== false ? 'Ativo' : 'Desativado'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {u.endereco && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        color: '#667eea'
                      }}>📍</div>
                      <div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Endereço</div>
                        <div style={{fontSize: '1.1rem', color: '#2d3748', fontWeight: '700'}}>{u.endereco}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Seção de ações administrativas */}
                  {admin && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      padding: '24px',
                      borderRadius: 16,
                      border: '2px solid rgba(255, 193, 7, 0.2)'
                    }}>
                      <h4 style={{
                        color: '#f57c00',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        🔐 Resetar Senha do Usuário
                      </h4>
                      <div style={{display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap'}}>
                        <input 
                          type="text" 
                          placeholder="Nova senha (deixe vazio para gerar automaticamente)" 
                          value={senha} 
                          onChange={e => setSenha(e.target.value)}
                          style={{
                            flex: 1,
                            minWidth: 200,
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '2px solid rgba(255, 152, 0, 0.3)',
                            fontSize: '1rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748'
                          }}
                        />
                        <button 
                          onClick={handleResetSenha} 
                          style={{
                            background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.3)';
                          }}
                        >
                          🔄 Resetar Senha
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Botão de edição */}
                  <button 
                    onClick={() => setEdit(true)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
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
                    ✏️ Editar Usuário
                  </button>
                </div>
              )}
              
              {/* Mensagem de feedback */}
              {msg && (
                <div style={{
                  marginTop: 20,
                  padding: '16px 20px',
                  background: msg.includes('atualizados') || msg.includes('resetada') 
                    ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(76, 175, 80, 0.15))' 
                    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(229, 115, 115, 0.15))',
                  color: msg.includes('atualizados') || msg.includes('resetada') ? '#2e7d32' : '#d32f2f',
                  textAlign: 'center',
                  borderRadius: 12,
                  border: `2px solid ${msg.includes('atualizados') || msg.includes('resetada') ? 'rgba(46, 125, 50, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                  fontWeight: '600',
                  fontSize: '1rem',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  {msg.includes('atualizados') || msg.includes('resetada') ? '✅' : '⚠️'} {msg}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ListaUsuarios;