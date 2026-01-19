import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

function AdicionarPontos() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [pontos, setPontos] = useState('');
  const [msg, setMsg] = useState('');
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscaRef = useRef(null);

  // Fecha a lista de resultados ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (buscaRef.current && !buscaRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca usuários por nome ou email
  const buscarUsuarios = async (termo) => {
    if (!termo || termo.length < 1) {
      setUsuariosEncontrados([]);
      setMostrarResultados(false);
      return;
    }
    try {
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
        setUsuariosEncontrados(filtrados);
        setMostrarResultados(filtrados.length > 0);
      } else {
        setUsuariosEncontrados([]);
        setMostrarResultados(false);
      }
    } catch {
      setUsuariosEncontrados([]);
      setMostrarResultados(false);
    }
  };

  // Seleciona um usuário da lista de busca
  const selecionarUsuario = (user) => {
    setId(user.id);
    setUsuario(user);
    setBusca('');
    setUsuariosEncontrados([]);
    setMostrarResultados(false);
    setMsg('');
  };

  async function buscarUsuario() {
    setMsg('');
    if (!id) {
      setUsuario(null);
      return;
    }
    const res = await fetch('/usuarios');
    const lista = await res.json();
    const user = lista.find(u => String(u.id) === String(id));
    if (user) setUsuario(user);
    else {
      setUsuario(null);
      setMsg('Usuário não encontrado.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    if (!usuario) return setMsg('Busque um usuário válido.');
    if (!pontos || isNaN(Number(pontos))) return setMsg('Informe a quantidade de pontos.');
    // Atualiza pontos do usuário (mock local, precisa de backend real para produção)
    try {
      const res = await fetch(`/usuarios/${usuario.id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos: Number(pontos) })
      });
      if (!res.ok) throw new Error('Erro ao adicionar pontos');
      const data = await res.json();
      setUsuario({ ...usuario, pontos: data.pontos });
      setMsg('Pontos adicionados com sucesso!');
    } catch {
      setMsg('Erro ao adicionar pontos.');
    }
  }

  return (
    <div style={{maxWidth:420,margin:'40px auto',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32}}>
      <button
        onClick={() => navigate('/gerenciar-clientes')}
        style={{marginBottom:18,background:'#333E8C',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:'bold',fontSize:15,cursor:'pointer',boxShadow:'0 2px 8px #333e8c33'}}
      >
        ← Voltar para Usuários
      </button>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:18,fontSize:28}}>Adicionar Pontos</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        {/* Campo de busca por nome/email */}
        <div style={{position:'relative'}} ref={buscaRef}>
          <label style={{fontWeight:'bold',display:'block',marginBottom:4}}>Buscar usuário por nome ou email:</label>
          <input 
            type="text" 
            value={busca} 
            onChange={e => { 
              setBusca(e.target.value); 
              buscarUsuarios(e.target.value);
            }} 
            placeholder="Digite nome, email, CPF ou ID..."
            style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%'}} 
          />
          {mostrarResultados && usuariosEncontrados.length > 0 && (
            <div style={{
              position:'absolute',
              top:'100%',
              left:0,
              right:0,
              background:'#fff',
              border:'1px solid #ccc',
              borderRadius:6,
              boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
              maxHeight:200,
              overflowY:'auto',
              zIndex:1000,
              marginTop:2
            }}>
              {usuariosEncontrados.map(user => (
                <div
                  key={user.id}
                  onClick={() => selecionarUsuario(user)}
                  style={{
                    padding:12,
                    cursor:'pointer',
                    borderBottom: usuariosEncontrados.indexOf(user) < usuariosEncontrados.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                >
                  <div style={{fontWeight:'bold', marginBottom:2}}>{user.nome}</div>
                  <div style={{fontSize:12,color:'#666'}}>{user.email} - ID: {user.id}</div>
                </div>
              ))}
            </div>
          )}
          {mostrarResultados && usuariosEncontrados.length === 0 && busca.length >= 1 && (
            <div style={{
              position:'absolute',
              top:'100%',
              left:0,
              right:0,
              background:'#fff',
              border:'1px solid #ccc',
              borderRadius:6,
              boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
              zIndex:1000,
              marginTop:2,
              padding:12,
              textAlign:'center',
              color:'#666',
              fontSize:14
            }}>
              Nenhum usuário encontrado
            </div>
          )}
        </div>

        <label style={{fontWeight:'bold'}}>ID do Usuário:
          <input type="text" value={id} onChange={e=>{setId(e.target.value); setUsuario(null); setMsg('');}} onBlur={buscarUsuario} style={{marginLeft:8,padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%'}} required />
        </label>
        {usuario && (
          <div style={{background:'#f6f8fa',padding:12,borderRadius:8,marginBottom:8}}>
            <b>Nome:</b> {usuario.nome}<br/>
            <b>Email:</b> {usuario.email}<br/>
            <b>Pontos atuais:</b> {usuario.pontos ?? 0}
          </div>
        )}
        <label style={{fontWeight:'bold'}}>Adicionar Pontos:
          <input type="number" value={pontos} onChange={e=>setPontos(e.target.value)} style={{marginLeft:8,padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%'}} required />
        </label>
        <button type="submit" style={{padding:'12px 0',borderRadius:8,background:'#333E8C',color:'#fff',border:'none',fontWeight:'bold',fontSize:18,marginTop:8,cursor:'pointer'}}>Salvar</button>
      </form>
      {msg && <div style={{marginTop:16,textAlign:'center',color:msg.includes('sucesso') ? '#2d8a4b' : '#b22',fontWeight:'bold'}}>{msg}</div>}
    </div>
  );
}

export default AdicionarPontos;
