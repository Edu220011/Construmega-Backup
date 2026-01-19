import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CriarUsuario({ admin = false, cliente, setAdmin, setCliente }) {
  const [formCriar, setFormCriar] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', tipo: 'cliente'
  });
  const [criando, setCriando] = useState(false);
  const navigate = useNavigate();

  // Verificar se é administrador
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
        if (data.erro) {
          alert('Erro: ' + data.erro);
        } else {
          alert('Usuário criado com sucesso!');
          // Resetar formulário
          setFormCriar({
            nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', tipo: 'cliente'
          });
        }
        setCriando(false);
      })
      .catch(err => {
        console.error('Erro ao criar usuário:', err);
        alert('Erro ao criar usuário');
        setCriando(false);
      });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => navigate('/gerenciar-clientes')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Voltar
            </button>
          </div>

          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '800',
            textAlign: 'center'
          }}>
            ➕ Criar Novo Usuário
          </h1>
          <p style={{
            margin: 0,
            textAlign: 'center',
            opacity: 0.9,
            fontSize: '16px'
          }}>
            Cadastre um novo usuário no sistema da Construmega
          </p>
        </div>

        {/* Formulário */}
        <div style={{
          padding: '48px 32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                name="nome"
                placeholder="Nome completo *"
                value={formCriar.nome}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              <input
                name="email"
                type="email"
                placeholder="Email *"
                value={formCriar.email}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              <input
                name="senha"
                type="password"
                placeholder="Senha *"
                value={formCriar.senha}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              <input
                name="cpf"
                placeholder="CPF"
                value={formCriar.cpf}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                name="telefone"
                placeholder="Telefone"
                value={formCriar.telefone}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              <input
                name="endereco"
                placeholder="Endereço"
                value={formCriar.endereco}
                onChange={handleCriarChange}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              <div style={{ marginTop: '8px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  Tipo de Usuário *
                </label>
                <select
                  name="tipo"
                  value={formCriar.tipo}
                  onChange={handleCriarChange}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="cliente">👤 CLIENTE</option>
                  <option value="pedreiro">🔨 PEDREIRO</option>
                  <option value="vendedor">💼 VENDEDOR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginTop: '40px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={criarUsuario}
              disabled={criando}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: criando ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '16px',
                cursor: criando ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: criando ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.3)',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!criando) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!criando) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {criando ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Criando...
                </>
              ) : (
                <>
                  ✅ Criar Usuário
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/gerenciar-clientes')}
              disabled={criando}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: '2px solid #d1d5db',
                background: '#ffffff',
                color: '#6b7280',
                fontWeight: '600',
                fontSize: '16px',
                cursor: criando ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!criando) {
                  e.target.style.background = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (!criando) {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
            >
              📋 Ver Usuários
            </button>
          </div>
        </div>
      </div>

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

export default CriarUsuario;