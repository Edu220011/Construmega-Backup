import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = memo(({ setAdmin, setCliente, setAba }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    console.log('Tentando login com:', loginEmail, loginSenha);
    
    // Fazer requisição para a nova rota de login
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        senha: loginSenha
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('🔍 Login Response:', data);
      if (data.sucesso) {
        // Armazenar token no localStorage
        localStorage.setItem('token', data.token);
        console.log('📁 Token salvo:', data.token);
        
        if (data.usuario.tipo === 'admin') {
          console.log('🔥 DEFININDO ADMIN = TRUE');
          localStorage.setItem('admin', 'true'); // Salvar PRIMEIRO no localStorage
          setAdmin(true); // Depois definir o estado
          console.log('💾 localStorage admin salvo como: true');
          setCliente(data.usuario);
          console.log('👤 Cliente definido:', data.usuario);
        } else {
          console.log('👥 Usuário comum, admin = false');
          localStorage.removeItem('admin'); // Remover PRIMEIRO
          setAdmin(false); // Depois definir o estado
          setCliente(data.usuario);
        }
        setAba('produtos');
        
        // Se senha padrão, redireciona para alteração de senha
        if (data.usuario.senha === '12345678') {
          navigate('/alterar-senha');
        } else {
          navigate('/');
        }
      } else {
        setAdmin(false);
        setCliente(null);
        alert(data.erro || 'Login inválido!');
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Verifique sua conexão.');
      setLoading(false);
    });
  }

  // Aplica máscara de CPF permitindo apenas números
  function handleLoginEmailChange(e) {
    let v = e.target.value;
    // Remove tudo que não for número
    let onlyNum = v.replace(/\D/g, '');
    // Limita a 11 dígitos
    if (onlyNum.length > 11) onlyNum = onlyNum.slice(0, 11);
    
    // Aplica máscara de CPF
    if (onlyNum.length > 9) {
      v = onlyNum.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (onlyNum.length > 6) {
      v = onlyNum.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (onlyNum.length > 3) {
      v = onlyNum.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
      v = onlyNum;
    }
    
    setLoginEmail(v);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: 0,
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 6px 32px #0001, 0 1.5px 6px #333E8C22',
        padding: 32,
        margin: 24,
        border: '1.5px solid #e9ecf3',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#1D2A5A',
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 10,
          fontSize: 28,
        }}>
          Login
        </h2>
        <h3 style={{
          textAlign: 'center',
          color: '#2F4059',
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 24,
          marginTop: 0,
        }}>
          Acesse sua conta
        </h3>
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:18}}>
          <input
            name="email"
            type="text"
            placeholder="CPF (000.000.000-00)"
            value={loginEmail}
            onChange={handleLoginEmailChange}
            required
            style={{padding:'8px',borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2,width:'100%'}}
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
          />
          <input
            name="senha"
            type={showSenha ? "text" : "password"}
            placeholder="Senha"
            value={loginSenha}
            onChange={e => setLoginSenha(e.target.value)}
            required
            style={{padding:'8px',borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,background:'#f6f8fa',color:'#3D3D47',marginBottom:2,width:'100%'}}
          />
          <label style={{fontSize:14, color:'#4A4A4A',display:'flex',alignItems:'center',gap:6,marginLeft:2}}>
            <input type="checkbox" style={{accentColor:'#2d3a4b'}} /> Lembrar-me no próximo login
          </label>
          <button 
            type="button" 
            onClick={() => setShowSenha(s => !s)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: '#f6f8fa',
              color: '#333',
              border: '1.5px solid #e9ecf3',
              fontWeight: '500',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              ':hover': {
                background: '#e9ecf3'
              }
            }}
            title={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showSenha ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12C1 12 2.64 8.29 6.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C23 12 21.36 15.71 17.94 17.94M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ocultar senha
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Mostrar senha
              </>
            )}
          </button>
          <button type="submit" disabled={loading} style={{
            padding: '12px 0',
            borderRadius: 8,
            background: loading ? '#ccc' : 'linear-gradient(90deg, #333E8C 0%, #1D2A5A 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            fontSize: 18,
            letterSpacing: 1,
            boxShadow: '0 2px 12px #333E8C44',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
            transition: 'background .2s'
          }}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div style={{marginTop:28,textAlign:'center',fontSize:14,color:'#888',lineHeight:1.7}}>
          <b>Clientes:</b> use o CPF (000.000.000-00) cadastrado<br/>
          <span style={{fontSize:12}}>Se não possui conta, registre-se!</span>
        </div>
      </div>
    </div>
  );
});

export default Login;
