
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditarUsuario({ tipoUsuarioLogado }) {
    // Função de exclusão de usuário
    async function handleDelete() {
      if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
      setMsg('Excluindo usuário...');
      const res = await fetch(`/usuarios/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMsg('Usuário excluído com sucesso!');
        setTimeout(() => navigate('/gerenciar-clientes'), 1200);
      } else {
        setMsg('Erro ao excluir usuário.');
      }
    }
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', endereco: '', email: '', tipo: '', ativo: true });
  // Hooks de reset de senha DEVEM ficar no topo
  const [senhaReset, setSenhaReset] = useState('');
  const [novaSenhaGerada, setNovaSenhaGerada] = useState('');

  useEffect(() => {
    // Sempre buscar todos e filtrar pelo ID para garantir compatibilidade
    fetch('/usuarios')
      .then(res => res.json())
      .then(lista => {
        const achado = lista.find(u => String(u.id) === String(id));
        if (!achado) setUsuario(null);
        else {
          setUsuario(achado);
          setForm({
            nome: achado.nome || '',
            cpf: achado.cpf || '',
            telefone: achado.telefone || '',
            endereco: achado.endereco || '',
            email: achado.email || '',
            tipo: achado.tipo || '',
            ativo: achado.ativo !== false
          });
        }
      });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMsg('Salvando...');
    const res = await fetch(`/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg('Dados atualizados!');
      setTimeout(() => navigate('/gerenciar-clientes'), 1200);
    } else {
      setMsg('Erro ao salvar.');
    }
  }

  if (usuario === null) return <div style={{textAlign:'center',marginTop:40}}>Usuário não encontrado.</div>;
  if (!usuario) return <div style={{textAlign:'center',marginTop:40}}>Carregando...</div>;

  if (tipoUsuarioLogado !== 'admin' && tipoUsuarioLogado !== 'gerente') {
    return <div style={{color:'#b22',textAlign:'center',marginTop:40}}>Acesso restrito a admins e gerentes.</div>;
  }

  // Função de resetar senha (hooks já declarados no topo)
  // (Removido: declaração duplicada)
  async function handleResetSenha() {
    if (!window.confirm('Deseja realmente resetar a senha deste usuário?')) return;
    setMsg('Resetando senha...');
    // Gera senha aleatória de 8 dígitos
    const novaSenha = senhaReset || Math.random().toString(36).slice(-8);
    const res = await fetch(`/usuarios/${usuario.id}/senha`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: novaSenha })
    });
    if (res.ok) {
      setMsg('Senha resetada com sucesso!');
      setNovaSenhaGerada(novaSenha);
      setSenhaReset('');
      // Salva a senha resetada no localStorage para forçar alteração no próximo login
      localStorage.setItem('senhaResetada', novaSenha);
    } else {
      setMsg('Erro ao resetar senha.');
    }
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
      padding: 40,
      border: '2px solid rgba(102, 126, 234, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <h2 style={{
        textAlign: 'center',
        color: '#2d3748',
        marginBottom: 32,
        fontSize: '2.2rem',
        fontWeight: '700',
        position: 'relative',
        zIndex: 1,
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{
          marginRight: 12,
          fontSize: '2rem',
          filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
        }}>👤</span>
        Editar Usuário
      </h2>

      {/* Card de informações do usuário */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 32,
        border: '2px solid rgba(102, 126, 234, 0.15)',
        position: 'relative',
        zIndex: 1
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#667eea',
          marginBottom: 16,
          textAlign: 'center'
        }}>📋 Informações Atuais</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>🆔 ID:</span> {usuario.id}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>👤 Nome:</span> {usuario.nome}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>📄 CPF:</span> {usuario.cpf}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>📞 Telefone:</span> {usuario.telefone}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>📧 Email:</span> {usuario.email}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>⚡ Permissão:</span> {usuario.tipo}
            </div>
          </div>
        </div>
        
        {usuario.endereco && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginTop: 16
          }}>
            <div style={{fontSize: '1.1rem', color: '#4a5568'}}>
              <span style={{fontWeight: '700', color: '#667eea'}}>📍 Endereço:</span> {usuario.endereco}
            </div>
          </div>
        )}
      </div>
      {/* Formulário modernizado */}
      <form onSubmit={handleSave} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: 20,
        border: '2px solid rgba(102, 126, 234, 0.1)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          color: '#667eea',
          marginBottom: 8,
          textAlign: 'center'
        }}>✏️ Editar Informações</h3>

        <div style={{display: 'grid', gap: 20}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>👤 Nome Completo:</label>
            <input 
              name="nome" 
              placeholder="Nome completo" 
              value={form.nome} 
              onChange={handleChange} 
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
            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📄 CPF:</label>
            <input 
              name="cpf" 
              placeholder="000.000.000-00" 
              value={form.cpf} 
              onChange={handleChange} 
              required 
              maxLength={14}
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
              placeholder="(00) 00000-0000" 
              value={form.telefone} 
              onChange={handleChange} 
              required 
              maxLength={15}
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
            <label style={{fontWeight: '600', color: '#4a5568', fontSize: '1rem'}}>📍 Endereço:</label>
            <input 
              name="endereco" 
              placeholder="Endereço completo" 
              value={form.endereco} 
              onChange={handleChange} 
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
              placeholder="email@exemplo.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
              type="email" 
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
        {/* Seção de Permissões */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
          padding: '24px',
          borderRadius: 16,
          border: '2px solid rgba(46, 125, 50, 0.2)',
          backdropFilter: 'blur(5px)'
        }}>
          <h4 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#2e7d32',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🎯 Tipo de Usuário
          </h4>
          <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
            <button
              type="button"
              onClick={() => setForm({...form, tipo: 'admin'})}
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                border: form.tipo === 'admin' ? '3px solid #4caf50' : '2px solid rgba(76, 175, 80, 0.3)',
                background: form.tipo === 'admin' 
                  ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                  : 'rgba(255, 255, 255, 0.8)',
                color: form.tipo === 'admin' ? '#fff' : '#2e7d32',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: form.tipo === 'admin' 
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (form.tipo !== 'admin') {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (form.tipo !== 'admin') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              👑 Administrador
            </button>
            <button
              type="button"
              onClick={() => setForm({...form, tipo: 'cliente'})}
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                border: form.tipo === 'cliente' ? '3px solid #4caf50' : '2px solid rgba(76, 175, 80, 0.3)',
                background: form.tipo === 'cliente' 
                  ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                  : 'rgba(255, 255, 255, 0.8)',
                color: form.tipo === 'cliente' ? '#fff' : '#2e7d32',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: form.tipo === 'cliente' 
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (form.tipo !== 'cliente') {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (form.tipo !== 'cliente') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              👤 Cliente
            </button>
          </div>
        </div>

        {/* Seção de Status */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
          padding: '24px',
          borderRadius: 16,
          border: '2px solid rgba(244, 67, 54, 0.2)',
          backdropFilter: 'blur(5px)'
        }}>
          <h4 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#d32f2f',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ⚡ Status da Conta
          </h4>
          <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
            <button
              type="button"
              onClick={() => setForm({...form, ativo: true})}
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                border: form.ativo !== false ? '3px solid #4caf50' : '2px solid rgba(76, 175, 80, 0.3)',
                background: form.ativo !== false 
                  ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                  : 'rgba(255, 255, 255, 0.8)',
                color: form.ativo !== false ? '#fff' : '#2e7d32',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: form.ativo !== false 
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (form.ativo === false) {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (form.ativo === false) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.borderColor = 'rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              ✅ Ativo
            </button>
            <button
              type="button"
              onClick={() => setForm({...form, ativo: false})}
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                border: form.ativo === false ? '3px solid #f44336' : '2px solid rgba(244, 67, 54, 0.3)',
                background: form.ativo === false 
                  ? 'linear-gradient(135deg, #f44336, #e57373)' 
                  : 'rgba(255, 255, 255, 0.8)',
                color: form.ativo === false ? '#fff' : '#d32f2f',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: form.ativo === false 
                  ? '0 4px 12px rgba(244, 67, 54, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                if (form.ativo !== false) {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.borderColor = 'rgba(244, 67, 54, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (form.ativo !== false) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.borderColor = 'rgba(244, 67, 54, 0.3)';
                }
              }}
            >
              ❌ Desativado
            </button>
          </div>
        </div>
        {/* Ações principais */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginTop: 8
        }}>
          <button 
            type="submit" 
            style={{
              padding: '16px 32px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
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

          {(tipoUsuarioLogado === 'admin' || tipoUsuarioLogado === 'gerente') && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
              padding: '20px',
              borderRadius: 12,
              border: '2px solid rgba(255, 193, 7, 0.2)',
              backdropFilter: 'blur(5px)'
            }}>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#f57c00',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🔐 Resetar Senha do Usuário
              </h4>
              <div style={{display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap'}}>
                <input 
                  type="text" 
                  placeholder="Digite a nova senha (opcional)" 
                  value={senhaReset} 
                  onChange={e => setSenhaReset(e.target.value)}
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
                  type="button" 
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
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
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
        </div>
        {novaSenhaGerada && (
          <div style={{
            marginTop: 16,
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
            color: '#2e7d32',
            fontWeight: '700',
            fontSize: '1.1rem',
            borderRadius: 12,
            border: '2px solid rgba(46, 125, 50, 0.3)',
            textAlign: 'center',
            backdropFilter: 'blur(5px)'
          }}>
            ✅ Nova senha gerada: <span style={{fontFamily: 'monospace', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 6}}>{novaSenhaGerada}</span>
          </div>
        )}
      </form>
      {/* Botões de navegação e ação */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginTop: 32,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => navigate('/gerenciar-clientes')} 
          style={{
            padding: '14px 28px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(176, 184, 201, 0.8), rgba(144, 160, 184, 0.8))',
            color: '#2d3748',
            border: '2px solid rgba(176, 184, 201, 0.5)',
            fontWeight: '700',
            fontSize: '1.05rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = 'linear-gradient(135deg, rgba(176, 184, 201, 1), rgba(144, 160, 184, 1))';
            e.target.style.boxShadow = '0 4px 12px rgba(176, 184, 201, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'linear-gradient(135deg, rgba(176, 184, 201, 0.8), rgba(144, 160, 184, 0.8))';
            e.target.style.boxShadow = 'none';
          }}
        >
          ⬅️ Voltar para Usuários
        </button>
        
        <button 
          onClick={handleDelete} 
          style={{
            padding: '14px 28px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: '#fff',
            border: 'none',
            fontWeight: '700',
            fontSize: '1.05rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(231, 76, 60, 0.4)';
            e.target.style.background = 'linear-gradient(135deg, #c0392b, #a93226)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
            e.target.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
          }}
        >
          🗑️ Excluir Usuário
        </button>
      </div>
      
      {/* Mensagem de feedback */}
      {msg && (
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: msg.includes('sucesso') 
            ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(76, 175, 80, 0.15))' 
            : 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(229, 115, 115, 0.15))',
          color: msg.includes('sucesso') ? '#2e7d32' : '#d32f2f',
          textAlign: 'center',
          borderRadius: 12,
          border: `2px solid ${msg.includes('sucesso') ? 'rgba(46, 125, 50, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          fontWeight: '600',
          fontSize: '1.05rem',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          {msg.includes('sucesso') ? '✅' : '⚠️'} {msg}
        </div>
      )}
    </div>
  );
}

export default EditarUsuario;
