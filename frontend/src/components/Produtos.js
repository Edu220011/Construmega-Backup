
import React, { useEffect, useState, memo } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { useNavigate } from 'react-router-dom';

const Loja = memo(({ admin }) => {
  const [produtos, setProdutos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  const filteredProdutos = produtos.filter(p => !p.inativo && (String(p.moeda).toLowerCase() === 'r$' || String(p.moeda).toLowerCase() === 'real'));
  const totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProdutos = filteredProdutos.slice(startIndex, startIndex + itemsPerPage);

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
        {currentProdutos.map(p => (
          <div key={p.id} className="produto-card">
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
              <p className="produto-preco">R$ {Number(p.preco).toFixed(2)}</p>
            </div>
            <button className="produto-botao btn-padrao" onClick={() => navigate(`/produto-venda/${p.id}`)}>Ver detalhes</button>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{display:'flex', justifyContent:'center', marginTop:20}}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-padrao">Anterior</button>
          <span style={{margin:'0 10px'}}>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-padrao">Próxima</button>
        </div>
      )}
    </>
  );
});

export default Loja;
