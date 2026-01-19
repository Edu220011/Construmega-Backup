import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function AdicionarPontosForm() {
    const navigate = useNavigate();
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [pontos, setPontos] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(false);
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
      setVerificando(true);
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
    } finally {
      setVerificando(false);
    }
  };

  // Verifica o ID e busca o nome do usuário
  const verificarId = async (idBusca) => {
    setNome('');
    setMsg('');
    if (!idBusca) return;
    setVerificando(true);
    try {
      const res = await fetch('/usuarios');
      if (res.ok) {
        const lista = await res.json();
        const usuario = lista.find(u => u.id === idBusca);
        if (usuario) {
          setNome(usuario.nome);
        } else {
          setNome('');
          setMsg('ID não encontrado!');
        }
      } else {
        setMsg('Erro ao buscar usuários.');
      }
    } catch {
      setMsg('Erro de conexão com o servidor.');
    }
    setVerificando(false);
  };

  // Seleciona um usuário da lista de busca
  const selecionarUsuario = (usuario) => {
    setId(usuario.id);
    setNome(usuario.nome);
    setBusca('');
    setUsuariosEncontrados([]);
    setMostrarResultados(false);
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!id || !pontos || isNaN(Number(pontos))) {
      setMsg('Preencha um ID válido e uma quantidade numérica de pontos.');
      return;
    }
    if (!nome) {
      setMsg('ID não encontrado!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/usuarios/${id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos: Number(pontos) })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(`Pontos adicionados! Total: ${data.pontos ?? 'atualizado'}`);
        setId('');
        setNome('');
        setPontos('');
      } else {
        setMsg('Erro ao adicionar pontos. Verifique o ID.');
      }
    } catch {
      setMsg('Erro de conexão com o servidor.');
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'48px auto',background:'#fff',borderRadius:16,boxShadow:'0 4px 24px #0002',padding:32}}>
      <button className="btn-padrao" onClick={()=>navigate('/gerenciar-clientes')} style={{marginBottom:18}}>← Voltar para Usuários</button>
      <h2 style={{textAlign:'center',color:'#1D2A5A',fontWeight:800,letterSpacing:1,fontSize:26,marginBottom:24}}>Adicionar Pontos</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        {/* Campo de busca por nome/email */}
        <div style={{position:'relative'}} ref={buscaRef}>
          <input
            type="text"
            placeholder="Buscar usuário por nome, email, CPF ou ID"
            value={busca}
            onChange={e => { 
              setBusca(e.target.value); 
              buscarUsuarios(e.target.value);
            }}
            style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16,width:'100%'}}
          />
          {verificando && (
            <div style={{
              position:'absolute',
              right:12,
              top:'50%',
              transform:'translateY(-50%)',
              fontSize:14,
              color:'#666'
            }}>
              Buscando...
            </div>
          )}
          {mostrarResultados && usuariosEncontrados.length > 0 && (
            <div style={{
              position:'absolute',
              top:'100%',
              left:0,
              right:0,
              background:'#fff',
              border:'1px solid #e9ecf3',
              borderRadius:8,
              boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
              maxHeight:200,
              overflowY:'auto',
              zIndex:1000,
              marginTop:4
            }}>
              {usuariosEncontrados.map(usuario => (
                <div
                  key={usuario.id}
                  onClick={() => selecionarUsuario(usuario)}
                  style={{
                    padding:12,
                    cursor:'pointer',
                    borderBottom: usuariosEncontrados.indexOf(usuario) < usuariosEncontrados.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                >
                  <div style={{fontWeight:'bold', marginBottom:2}}>{usuario.nome}</div>
                  <div style={{fontSize:12,color:'#666'}}>{usuario.email} - ID: {usuario.id}</div>
                </div>
              ))}
            </div>
          )}
          {mostrarResultados && usuariosEncontrados.length === 0 && busca.length >= 1 && !verificando && (
            <div style={{
              position:'absolute',
              top:'100%',
              left:0,
              right:0,
              background:'#fff',
              border:'1px solid #e9ecf3',
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

        <input
          type="text"
          placeholder="ID do usuário"
          value={id}
          onChange={e => { setId(e.target.value); setNome(''); setMsg(''); }}
          onBlur={handleIdBlur}
          required
          style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16}}
        />
        {verificando && <span style={{color:'#888',fontSize:13}}>Verificando ID...</span>}
        {nome && <span style={{color:'#2d8a4b',fontWeight:'bold',fontSize:15}}>Usuário: {nome}</span>}
        <input
          type="number"
          placeholder="Quantidade de pontos"
          value={pontos}
          onChange={e => setPontos(e.target.value)}
          required
          min={1}
          style={{padding:12,borderRadius:8,border:'1.5px solid #e9ecf3',fontSize:16}}
        />
        <button className="btn-padrao" type="submit" disabled={loading} style={{fontSize:18}}>
          {loading ? 'Adicionando...' : 'Adicionar Pontos'}
        </button>
      </form>
      {msg && <div style={{marginTop:18,textAlign:'center',color:msg.startsWith('Pontos')?'#2d8a4b':'#b22',fontWeight:'bold'}}>{msg}</div>}
    </div>
  );
}

export default AdicionarPontosForm;
