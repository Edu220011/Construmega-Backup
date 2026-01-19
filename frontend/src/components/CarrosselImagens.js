import React, { useState, memo } from 'react';
import './CarrosselImagens.css';

const CarrosselImagens = memo(({ imagens = [], altura = 120, largura = 120, animacao = true }) => {
  const [atual, setAtual] = useState(0);
  const [throttled, setThrottled] = useState(false);
  if (!imagens.length) return <div style={{width: largura, height: altura, background: '#eee', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Sem foto</div>;

  const avancar = () => {
    if (throttled) return;
    setThrottled(true);
    setAtual((atual + 1) % imagens.length);
    setTimeout(() => setThrottled(false), 300);
  };
  const voltar = () => {
    if (throttled) return;
    setThrottled(true);
    setAtual((atual - 1 + imagens.length) % imagens.length);
    setTimeout(() => setThrottled(false), 300);
  };

  return (
    <div className={animacao ? 'carrossel-animado' : ''} style={{position:'relative',width:largura,height:altura,overflow:'hidden',borderRadius:12,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 6px #333e8c22'}}>
      <img src={imagens[atual]} alt={`Foto ${atual+1}`} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',transition: animacao ? 'opacity .5s' : 'none'}} loading="lazy" />
      {imagens.length > 1 && (
        <>
          <button onClick={voltar} className="carrossel-btn carrossel-btn-esq" aria-label="Anterior">&#8592;</button>
          <button onClick={avancar} className="carrossel-btn carrossel-btn-dir" aria-label="Próxima">&#8594;</button>
          <div className="carrossel-indicadores">
            {imagens.map((_, i) => (
              <span key={i} className={i === atual ? 'ativo' : ''}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default CarrosselImagens;
