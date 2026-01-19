import React, { useEffect, useState } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useNavigate } from 'react-router-dom';

function LojaPontuacao() {
  const [produtos, setProdutos] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      .then(data => {
        console.log('Produtos carregados:', data);
        setProdutos(data);
      })
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  const handleCardClick = (p) => {
    navigate(`/produto-pontos/${p.id}`);
  };

  return (
    <>
      <div className="nav-abas nav-abas-produtos" style={{marginTop:24, marginBottom:0, justifyContent:'center'}}>
        <div className="abas-menu abas-menu-produtos">
          <button
            className={"aba" + (window.location.pathname === '/produtos' ? ' ativa' : '')}
            onClick={()=>navigate('/produtos')}
            type="button"
          >Loja</button>
          <button
            className={"aba" + (window.location.pathname === '/loja-pontuacao' ? ' ativa' : '')}
            onClick={()=>navigate('/loja-pontuacao')}
            type="button"
          >Troque Seus Pontos</button>
        </div>
      </div>
      <div className="produtos-grid">
        {produtos.filter(p => !p.inativo && String(p.moeda).toLowerCase() === 'pontos').map(p => (
          <div 
            key={p.id} 
            className="produto-card produto-card-pontos" 
            onClick={()=>handleCardClick(p)} 
            style={{
              cursor:'pointer',
              transform: hoveredCard === p.id ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={() => setHoveredCard(p.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div>
              <div className="produto-imagem">
                {Array.isArray(p.imagens) && p.imagens.length > 0 ? (
                  <CarrosselImagens imagens={p.imagens} altura={100} largura={100} animacao={true} />
                ) : p.imagem ? (
                  <CarrosselImagens imagens={[p.imagem]} altura={100} largura={100} animacao={true} />
                ) : (
                  <div className="produto-sem-foto">Sem foto</div>
                )}
              </div>
              <h3 className="produto-nome">{p.nome}</h3>
              <div className="produto-preco-pontos">
                <span>
                  {p.preco ? `P ${Number(p.preco).toFixed(0)}` : 'Preço não disponível'}
                </span>
              </div>
            </div>
            <button
              className="produto-botao produto-botao-pontos"
              onClick={(e)=>{e.stopPropagation(); handleCardClick(p)}}
            >
              <span className="botao-icone">🎁</span>
              Trocar por Pontos
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default LojaPontuacao;