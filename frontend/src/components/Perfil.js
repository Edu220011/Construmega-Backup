import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil({ cliente, setCliente }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(cliente || {});
  const [msg, setMsg] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigate = useNavigate();

  if (!cliente) {
    navigate('/login');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMsg('Salvando...');

    try {
      // Primeiro, salvar os dados pessoais
      const res = await fetch(`/usuarios/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        setMsg('Erro ao salvar dados pessoais.');
        return;
      }

      // Se há alteração de senha, validar e salvar
      if (novaSenha) {
        if (novaSenha !== confirmarSenha) {
          setMsg('As senhas não coincidem.');
          return;
        }

        if (novaSenha.length < 6) {
          setMsg('A nova senha deve ter pelo menos 6 caracteres.');
          return;
        }

        const senhaRes = await fetch(`/usuarios/${cliente.id}/alterar-senha`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senhaAtual,
            novaSenha
          })
        });

        if (!senhaRes.ok) {
          const errorData = await senhaRes.json();
          setMsg(errorData.erro || 'Erro ao alterar senha.');
          return;
        }
      }

      setMsg('Dados atualizados com sucesso!');
      setCliente({ ...cliente, ...form });
      setEditando(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      setMsg('Erro ao salvar dados.');
    }
  }

  // Função para formatar CPF
  function formatCPF(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  }

  // Função para formatar telefone
  function formatTelefone(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    value = value.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    return value.slice(0, 15);
  }

  function handleChangeFormatted(e) {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    setForm({ ...form, [name]: formattedValue });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 250,
        height: 250,
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header com Avatar */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '4px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{
              fontSize: '48px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>
              👤
            </span>
          </div>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginBottom: 8
          }}>
            Meu Perfil
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem',
            margin: 0
          }}>
            {editando ? 'Edite suas informações pessoais' : 'Visualize suas informações pessoais'}
          </p>
        </div>

        {/* Card Principal */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Header do Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px 32px',
            color: '#fff'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: '1.8rem' }}>📋</span>
              {editando ? 'Editar Informações' : 'Informações Pessoais'}
            </h2>
          </div>

          {/* Conteúdo */}
          <div style={{ padding: '32px' }}>
            {!editando ? (
              <>
                {/* Grid de Informações */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 24,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🏷️</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Nome
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.nome}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        CPF
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.cpf}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📧</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Email
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.email}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>📞</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Telefone
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.telefone}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease',
                    gridColumn: 'span 2'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🏠</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Endereço
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.endereco}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>⭐</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Pontos
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.pontos || 0} pontos
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: 16,
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      <span style={{
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Tipo
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                    </div>
                  </div>
                </div>

                {/* Botão Editar */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setEditando(true)}
                    style={{
                      padding: '16px 32px',
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✏️</span>
                    Editar Perfil
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Formulário de Edição */}
                <form onSubmit={handleSave} style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 24
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <label style={{
                      fontWeight: '600',
                      color: '#4a5568',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>👤</span>
                      Nome Completo
                    </label>
                    <input
                      name="nome"
                      placeholder="Digite seu nome completo"
                      value={form.nome}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#2d3748',
                        outline: 'none'
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

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <label style={{
                      fontWeight: '600',
                      color: '#4a5568',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>📋</span>
                      CPF
                    </label>
                    <input
                      name="cpf"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={handleChangeFormatted}
                      required
                      maxLength={14}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#2d3748',
                        outline: 'none'
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

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <label style={{
                      fontWeight: '600',
                      color: '#4a5568',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>📧</span>
                      Email
                    </label>
                    <input
                      name="email"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      type="email"
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#2d3748',
                        outline: 'none'
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

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <label style={{
                      fontWeight: '600',
                      color: '#4a5568',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>📞</span>
                      Telefone
                    </label>
                    <input
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={form.telefone}
                      onChange={handleChangeFormatted}
                      required
                      maxLength={15}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#2d3748',
                        outline: 'none'
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

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    gridColumn: 'span 2'
                  }}>
                    <label style={{
                      fontWeight: '600',
                      color: '#4a5568',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>🏠</span>
                      Endereço
                    </label>
                    <input
                      name="endereco"
                      placeholder="Digite seu endereço completo"
                      value={form.endereco}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#2d3748',
                        outline: 'none'
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

                  {/* Seção de Alteração de Senha */}
                  <div style={{
                    gridColumn: 'span 2',
                    marginTop: 24,
                    padding: '24px',
                    background: 'rgba(102, 126, 234, 0.03)',
                    borderRadius: 16,
                    border: '2px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <h3 style={{
                      margin: '0 0 20px 0',
                      color: '#4a5568',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>🔒</span>
                      Alterar Senha (Opcional)
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: 16
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <label style={{
                          fontWeight: '600',
                          color: '#4a5568',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span>🔑</span>
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          placeholder="Digite sua senha atual"
                          value={senhaAtual}
                          onChange={(e) => setSenhaAtual(e.target.value)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748',
                            outline: 'none'
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

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <label style={{
                          fontWeight: '600',
                          color: '#4a5568',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span>🆕</span>
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          placeholder="Digite a nova senha"
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748',
                            outline: 'none'
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

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <label style={{
                          fontWeight: '600',
                          color: '#4a5568',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span>✅</span>
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          placeholder="Confirme a nova senha"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#2d3748',
                            outline: 'none'
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

                    <div style={{
                      marginTop: 16,
                      fontSize: '0.85rem',
                      color: '#718096',
                      lineHeight: 1.4
                    }}>
                      <strong>Dicas para uma senha segura:</strong> Use pelo menos 6 caracteres, combine letras maiúsculas, minúsculas, números e símbolos.
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div style={{
                    gridColumn: 'span 2',
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'center',
                    marginTop: 24
                  }}>
                    <button
                      type="submit"
                      style={{
                        padding: '14px 28px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 6px 20px rgba(72, 187, 120, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                        e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.3)';
                      }}
                    >
                      <span>💾</span>
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(false);
                        setForm(cliente);
                        setSenhaAtual('');
                        setNovaSenha('');
                        setConfirmarSenha('');
                      }}
                      style={{
                        padding: '14px 28px',
                        borderRadius: 12,
                        background: 'rgba(176, 184, 201, 0.2)',
                        color: '#4a5568',
                        border: '2px solid rgba(176, 184, 201, 0.3)',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(176, 184, 201, 0.3)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(176, 184, 201, 0.2)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>❌</span>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Mensagem de Status */}
            {msg && (
              <div style={{
                marginTop: 24,
                textAlign: 'center',
                color: msg.includes('sucesso') ? '#38a169' : '#e53e3e',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '16px 24px',
                background: msg.includes('sucesso')
                  ? 'rgba(72, 187, 120, 0.1)'
                  : 'rgba(229, 62, 62, 0.1)',
                borderRadius: 12,
                border: `2px solid ${msg.includes('sucesso') ? 'rgba(72, 187, 120, 0.2)' : 'rgba(229, 62, 62, 0.2)'}`,
                animation: 'fadeInUp 0.3s ease-out'
              }}>
                {msg.includes('sucesso') ? '✅' : '❌'} {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
