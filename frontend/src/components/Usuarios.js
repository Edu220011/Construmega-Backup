
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

// Hook para buscar dados da empresa (endereço e telefone)
function useEmpresaConfig() {
  const [empresa, setEmpresa] = useState(null);
  useEffect(() => {
    apiFetch('/configuracoes')
      .then(res => res.json())
      .then(data => setEmpresa(data));
  }, []);
  return empresa;
}

function Usuarios({ setCliente, setAdmin }) {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    email: '',
    senha: '',
    senha2: ''
  });
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [validacoes, setValidacoes] = useState({
    nome: true,
    cpf: true,
    telefone: true,
    endereco: true,
    email: true,
    senha: true,
    senha2: true
  });

  const empresaConfig = useEmpresaConfig();

  // Validação de força da senha
  const validarForcaSenha = (senha) => {
    if (senha.length < 6) return { forca: 0, texto: 'Muito fraca' };
    if (senha.length < 8) return { forca: 1, texto: 'Fraca' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(senha)) return { forca: 2, texto: 'Média' };
    if (senha.length >= 10 && /(?=.*[!@#$%^&*])/.test(senha)) return { forca: 4, texto: 'Muito forte' };
    return { forca: 3, texto: 'Forte' };
  };

  const forcaSenha = validarForcaSenha(form.senha);

  function handleChange(e) {
    const { name, value } = e.target;
    let valorFormatado = value;

    if (name === 'cpf') {
      // Remove tudo que não for número
      let v = value.replace(/\D/g, '');
      // Limita a 11 dígitos
      v = v.slice(0, 11);
      // Formata para 000.000.000-00
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      valorFormatado = v;
    } else if (name === 'telefone') {
      // Remove tudo que não for número
      let v = value.replace(/\D/g, '');
      // Limita a 11 dígitos
      v = v.slice(0, 11);
      // Formata para (00) 00000-0000
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      valorFormatado = v;
    }

    setForm({ ...form, [name]: valorFormatado });

    // Validação em tempo real
    setValidacoes(prev => ({
      ...prev,
      [name]: validarCampo(name, valorFormatado)
    }));
  }

  function validarCampo(nome, valor) {
    switch (nome) {
      case 'nome':
        return valor.length >= 3;
      case 'cpf':
        return validarCPF(valor);
      case 'telefone':
        return valor.replace(/\D/g, '').length >= 10;
      case 'endereco':
        return valor.length >= 5;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
      case 'senha':
        return valor.length >= 6;
      case 'senha2':
        return valor === form.senha && valor.length > 0;
      default:
        return true;
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

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setCarregando(true);

    // Validação final
    const camposInvalidos = Object.entries(validacoes).filter(([key, valido]) => !valido);
    if (camposInvalidos.length > 0) {
      setErro('Preencha todos os campos corretamente.');
      setCarregando(false);
      return;
    }

    if (form.senha !== form.senha2) {
      setErro('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    // Sempre registra como cliente
    const dados = {
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone,
      endereco: form.endereco,
      email: form.email,
      senha: form.senha,
      tipo: 'cliente'
    };

    fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao registrar.');
        return res.json();
      })
      .then((novoUsuario) => {
        setSucesso(true);
        setForm({ nome: '', cpf: '', telefone: '', endereco: '', email: '', senha: '', senha2: '' });
        setValidacoes({ nome: true, cpf: true, telefone: true, endereco: true, email: true, senha: true, senha2: true });
        // Atualiza o login global para o novo usuário registrado
        if (setCliente) setCliente(novoUsuario);
        if (setAdmin) setAdmin(false);
      })
      .catch(() => setErro('Não foi possível registrar. Tente outro email ou CPF.'))
      .finally(() => setCarregando(false));
  }

  const CampoInput = ({ name, placeholder, type = 'text', required = true, maxLength, pattern, inputMode, autoComplete, icone }) => {
    const isValid = validacoes[name];
    const hasValue = form[name].length > 0;

    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          borderRadius: '12px',
          border: `2px solid ${hasValue ? (isValid ? '#10b981' : '#ef4444') : '#e5e7eb'}`,
          background: '#ffffff',
          transition: 'all 0.2s ease',
          boxShadow: hasValue && !isValid ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
        }}>
          {icone && <span style={{ marginRight: '12px', color: '#6b7280', fontSize: '18px' }}>{icone}</span>}
          <input
            name={name}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            required={required}
            type={type}
            maxLength={maxLength}
            pattern={pattern}
            inputMode={inputMode}
            autoComplete={autoComplete}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'transparent'
            }}
          />
          {hasValue && (
            <span style={{
              fontSize: '14px',
              color: isValid ? '#10b981' : '#ef4444',
              fontWeight: '500'
            }}>
              {isValid ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elemento decorativo */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            CONSTRUMEGA
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: '0 0 4px 0',
            fontWeight: '500'
          }}>
            Crie sua conta
          </p>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
          }}>
            Junte-se a nós e tenha acesso a promoções exclusivas
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Seção: Informações Pessoais */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👤 Informações Pessoais
            </h3>

            <CampoInput
              name="nome"
              placeholder="Nome completo"
              icone="👤"
            />

            <div style={{ marginTop: '16px' }}>
              <CampoInput
                name="cpf"
                placeholder="CPF (000.000.000-00)"
                maxLength={14}
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                inputMode="numeric"
                autoComplete="off"
                icone="🆔"
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <CampoInput
                name="telefone"
                placeholder="Telefone"
                maxLength={15}
                pattern="\(\d{2}\) \d{5}-\d{4}"
                inputMode="numeric"
                autoComplete="off"
                icone="📱"
              />
            </div>
          </div>

          {/* Seção: Endereço e Contato */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📍 Endereço & Contato
            </h3>

            <CampoInput
              name="endereco"
              placeholder="Endereço completo"
              icone="🏠"
            />

            <div style={{ marginTop: '16px' }}>
              <CampoInput
                name="email"
                placeholder="E-mail"
                type="email"
                autoComplete="email"
                icone="✉️"
              />
            </div>
          </div>

          {/* Seção: Segurança */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔒 Segurança
            </h3>

            <CampoInput
              name="senha"
              placeholder="Senha (mínimo 6 caracteres)"
              type="password"
              autoComplete="new-password"
              icone="🔑"
            />

            {/* Indicador de força da senha */}
            {form.senha && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: forcaSenha.forca === 0 ? '#fef2f2' :
                           forcaSenha.forca === 1 ? '#fef3c7' :
                           forcaSenha.forca === 2 ? '#fef3c7' :
                           forcaSenha.forca === 3 ? '#d1fae5' : '#d1fae5',
                border: `1px solid ${forcaSenha.forca === 0 ? '#fca5a5' :
                                   forcaSenha.forca === 1 ? '#fbbf24' :
                                   forcaSenha.forca === 2 ? '#fbbf24' :
                                   forcaSenha.forca === 3 ? '#34d399' : '#34d399'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: forcaSenha.forca === 0 ? '#dc2626' :
                         forcaSenha.forca === 1 ? '#d97706' :
                         forcaSenha.forca === 2 ? '#d97706' :
                         forcaSenha.forca === 3 ? '#059669' : '#059669'
                }}>
                  {forcaSenha.texto}
                </span>
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(forcaSenha.forca / 4) * 100}%`,
                    height: '100%',
                    background: forcaSenha.forca === 0 ? '#ef4444' :
                               forcaSenha.forca === 1 ? '#f59e0b' :
                               forcaSenha.forca === 2 ? '#f59e0b' :
                               forcaSenha.forca === 3 ? '#10b981' : '#10b981',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <CampoInput
                name="senha2"
                placeholder="Confirme a senha"
                type="password"
                autoComplete="new-password"
                icone="🔒"
              />
            </div>
          </div>

          {/* Botão de cadastro */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              marginTop: '24px',
              padding: '16px 24px',
              borderRadius: '12px',
              background: carregando ?
                'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)' :
                'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              letterSpacing: '0.5px',
              boxShadow: carregando ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)',
              cursor: carregando ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {carregando ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Criando conta...
              </>
            ) : (
              <>
                <span>🚀</span>
                Criar Conta
              </>
            )}
          </button>
        </form>

        {/* Mensagens de feedback */}
        {sucesso && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <div>
              <p style={{ margin: 0, fontWeight: '600', color: '#065f46' }}>
                Conta criada com sucesso!
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#047857' }}>
                Faça login para acessar sua conta.
              </p>
            </div>
          </div>
        )}

        {erro && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <p style={{ margin: 0, fontWeight: '600', color: '#dc2626' }}>
                Erro no cadastro
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#b91c1c' }}>
                {erro}
              </p>
            </div>
          </div>
        )}

        {/* Informações da empresa */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          borderRadius: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569',
            textAlign: 'center'
          }}>
            📞 Entre em contato
          </h4>
          <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
            <div><strong>Endereço:</strong> {empresaConfig?.endereco || 'Não informado'}</div>
            <div><strong>Telefone:</strong> {empresaConfig?.telefoneEmpresa || 'Não informado'}</div>
          </div>
        </div>
      </div>

      {/* CSS para animação de loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Usuarios;
