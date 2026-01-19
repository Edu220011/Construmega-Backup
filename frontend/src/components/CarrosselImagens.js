import React, { useState, memo } from 'react';
import './CarrosselImagens.css';

const CarrosselImagens = memo(({ imagens = [], altura = 120, largura = 120, animacao = true }) => {
  const [atual, setAtual] = useState(0);
  const [throttled, setThrottled] = useState(false);
  const [erroImagem, setErroImagem] = useState(false);
  
  // Filtrar imagens vazias e nulas
  const imagensFiltradas = imagens.filter(img => img && String(img).trim().length > 0);
  
  console.log('CarrosselImagens recebeu:', {
    totalImagens: imagens.length,
    imagensFiltradas: imagensFiltradas.length,
    altura,
    largura,
    primeiraimagem: imagens[0] ? imagens[0].substring(0, 100) : 'nenhuma'
  });
  
  if (!imagensFiltradas.length || erroImagem) {
    return (
      <div style={{
        width: largura, 
        height: altura, 
        background: '#f0f0f0', 
        borderRadius: 12, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#999', 
        fontSize: '2rem',
        border: '2px dashed #ccc'
      }}>
        📸
      </div>
    );
  }

  const avancar = () => {
    if (throttled) return;
    setThrottled(true);
    setAtual((atual + 1) % imagensFiltradas.length);
    setTimeout(() => setThrottled(false), 300);
  };
  const voltar = () => {
    if (throttled) return;
    setThrottled(true);
    setAtual((atual - 1 + imagensFiltradas.length) % imagensFiltradas.length);
    setTimeout(() => setThrottled(false), 300);
  };

  return (
    <div className={animacao ? 'carrossel-animado' : ''} style={{position:'relative',width:largura,height:altura,overflow:'hidden',borderRadius:12,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 6px #333e8c22',border:'1px solid #eee'}}>
      <img 
        src={imagensFiltradas[atual]} 
        alt={`Foto ${atual+1}`} 
        style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',transition: animacao ? 'opacity .5s' : 'none'}} 
        loading="lazy"
        onError={() => {
          console.error('Erro ao carregar imagem:', imagensFiltradas[atual]);
          setErroImagem(true);
        }}
        onLoad={() => {
          console.log('Imagem carregada com sucesso:', imagensFiltradas[atual]);
        }}
      />
      {imagensFiltradas.length > 1 && (
        <>
          <button onClick={voltar} className="carrossel-btn carrossel-btn-esq" aria-label="Anterior">&#8592;</button>
          <button onClick={avancar} className="carrossel-btn carrossel-btn-dir" aria-label="Próxima">&#8594;</button>
          <div className="carrossel-indicadores">
            {imagensFiltradas.map((_, i) => (
              <span key={i} className={i === atual ? 'ativo' : ''} onClick={() => setAtual(i)} style={{cursor: 'pointer'}}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default CarrosselImagens;
