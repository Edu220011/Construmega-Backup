import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AlterarSenha({ cliente, setCliente }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  if (!cliente) {
    navigate('/login');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (novaSenha.length < 8) {
      setMsg('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setMsg('Salvando...');
    const res = await fetch(`/usuarios/${cliente.id}/senha`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: novaSenha })
    });
    if (res.ok) {
      setMsg('Senha alterada com sucesso!');
      setCliente({ ...cliente, senha: novaSenha });
      setTimeout(() => navigate('/'), 1200);
    } else {
      setMsg('Erro ao alterar senha.');
    }
  }

  return (
    <div style={{maxWidth:400,margin:'32px auto',background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #0002',padding:24}}>
      <h2 style={{textAlign:'center',color:'#2d3a4b'}}>Alterar Senha</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
        <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required style={{padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        <button type="submit" style={{padding:10,borderRadius:4,background:'#2d3a4b',color:'#fff',border:'none',fontWeight:'bold'}}>Salvar Nova Senha</button>
      </form>
      {msg && <div style={{marginTop:18,color: msg.includes('sucesso') ? '#2d8a4b' : '#b22',textAlign:'center'}}>{msg}</div>}
    </div>
  );
}

export default AlterarSenha;
