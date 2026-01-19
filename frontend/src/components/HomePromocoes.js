import React, { useEffect, useState } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useNavigate } from 'react-router-dom';
import './HomePromocoes.css';

function HomePromocoes({ empresaConfig }) {
  const [promos, setPromos] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      // Mostrar apenas produtos marcados como promo na página inicial
      .then(data => setPromos(data.filter(p => p.promo).slice(0, 10)));
  }, []);

  return (
    <div>
      {empresaConfig && empresaConfig.telaInicial ? (
        <>
          <div style={{
            maxWidth: 800,
            margin: '48px auto',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 32,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
            padding: '48px 40px',
            color: '#2d3748',
            fontSize: 28,
            fontWeight: 700,
            textAlign: 'center',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            letterSpacing: 0.5,
            lineHeight: 1.6,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%)',
              zIndex: 0,
              pointerEvents: 'none',
              borderRadius: 32
            }} />
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
            <span style={{
              position:'relative',
              zIndex:1,
              display:'block',
              whiteSpace:'pre-line',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>{empresaConfig.telaInicial}</span>
          </div>
          {/* Aviso do campo Promoções */}
          <div style={{
            maxWidth: 700,
            margin: '32px auto 0',
            background: 'linear-gradient(90deg, #e0e7ff 60%, #bfcfff 100%)',
            borderRadius: 16,
            boxShadow: '0 2px 12px #333e8c22',
            padding: '18px 28px',
            color: '#1a2540',
            fontSize: 18,
            fontWeight: 500,
            textAlign: 'center',
            border: '1.5px solid #333E8C',
            letterSpacing: 0.2,
            lineHeight: 1.5,
            marginBottom: 18
          }}>
            <span role="img" aria-label="destaque">✨</span> Confira os produtos em destaque abaixo! Aproveite novidades e ofertas.
          </div>
        </>
      ) : (
        <>
          <p>Bem-vindo ao hub da loja! Veja amostras, produtos e cadastre-se para comprar.</p>
          {/* Aviso do campo Promoções */}
          <div style={{
            maxWidth: 700,
            margin: '32px auto 0',
            background: 'linear-gradient(90deg, #e0e7ff 60%, #bfcfff 100%)',
            borderRadius: 16,
            boxShadow: '0 2px 12px #333e8c22',
            padding: '18px 28px',
            color: '#1a2540',
            fontSize: 18,
            fontWeight: 500,
            textAlign: 'center',
            border: '1.5px solid #333E8C',
            letterSpacing: 0.2,
            lineHeight: 1.5,
            marginBottom: 18
          }}>
            <span role="img" aria-label="destaque">✨</span> Confira os produtos em destaque abaixo! Aproveite novidades e ofertas.
          </div>
        </>
      )}
      {promos.length > 0 && (
        <div style={{
          maxWidth: 900,
          margin: '32px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          padding: '16px 0',
        }}>
          {promos.map(prod => (
            <div
              key={prod.id}
              className="promo-card-home"
            >
              <div style={{marginBottom:12,position:'relative',width:120,height:120,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{position:'absolute',top:8,right:8,zIndex:2,background:'#333E8C',color:'#fff',fontWeight:'bold',padding:'2px 10px',borderRadius:8,fontSize:13,letterSpacing:1,boxShadow:'0 2px 8px #333e8c33',opacity:0.95}}>PROMOÇÃO</div>
                {Array.isArray(prod.imagens) && prod.imagens.length > 0 ? (
                  <CarrosselImagens imagens={prod.imagens} altura={120} largura={120} animacao={true} />
                ) : prod.imagem ? (
                  <CarrosselImagens imagens={[prod.imagem]} altura={120} largura={120} animacao={true} />
                ) : (
                  <span style={{color:'#bbb',display:'flex',alignItems:'center',justifyContent:'center',width:120,height:120,background:'#fff',borderRadius:12,boxShadow:'0 1px 6px #ffd66633'}}>Sem foto</span>
                )}
              </div>
              <h3 style={{margin:'8px 0 4px',fontSize:20,color:'#333E8C'}}>{prod.nome}</h3>
              <div style={{fontWeight:'bold',fontSize:18,color:'#1D2A5A',marginBottom:6}}>
                {prod.moeda === 'pontos' ? `${prod.preco} pontos` : `R$ ${Number(prod.preco).toFixed(2)}`}
              </div>
              <div style={{fontSize:14,color:'#555',marginBottom:8}}>{prod.descricao}</div>
              <div style={{fontSize:13,color:'#888'}}>Estoque: {prod.estoque ?? 'N/A'}</div>
              <button
                className="promo-card-home-btn"
                onClick={() => navigate(`/produto-pontos/${prod.id}`)}
              >Ver</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePromocoes;