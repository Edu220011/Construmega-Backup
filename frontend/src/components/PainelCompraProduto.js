import React, { useState } from 'react';
import CarrosselImagens from './CarrosselImagens';
import { adicionarItemCarrinhoUsuario } from '../utils/carrinhoUtils';

function PainelCompraProduto({ produto, onTrocar, pontosUsuario, isVendaReal = false, cliente }) {
  const [quantidade, setQuantidade] = useState(1);
  if (!produto) return null;
  
  // Debug: Mostrar dados do produto no console
  console.log('PainelCompraProduto recebeu produto:', {
    id: produto.id,
    nome: produto.nome,
    temImagem: !!produto.imagem,
    temImagens: !!produto.imagens,
    imagensArray: produto.imagens,
    imagemUnica: produto.imagem ? produto.imagem.substring(0, 100) : 'nenhuma'
  });
  
  const moeda = isVendaReal ? 'R$' : 'Pontos';
  const precoFormatado = isVendaReal ? Number(produto.preco).toFixed(2) : Number(produto.preco).toFixed(0);
  const precoTotal = isVendaReal ? (Number(produto.preco) * quantidade).toFixed(2) : (Number(produto.preco) * quantidade).toFixed(0);
  const temSaldo = isVendaReal ? !!cliente : pontosUsuario >= produto.preco * quantidade;
  const estoqueDisponivel = produto.estoque ?? 0;
  const textoBotao = isVendaReal ? `Adicionar ${quantidade} ao Carrinho - R$ ${precoTotal}` : `Trocar ${quantidade} unidade${quantidade > 1 ? 's' : ''} por ${precoTotal} ${moeda}`;

  // Preparar array de imagens - prioridade: imagens array > imagem única
  let imagensParaMostrar = [];
  if (Array.isArray(produto.imagens) && produto.imagens.length > 0) {
    imagensParaMostrar = produto.imagens.filter(img => img && String(img).trim().length > 0);
  }
  if (imagensParaMostrar.length === 0 && produto.imagem && String(produto.imagem).trim().length > 0) {
    imagensParaMostrar = [produto.imagem];
  }

  const aumentarQuantidade = () => {
    if (quantidade < estoqueDisponivel) {
      setQuantidade(quantidade + 1);
    }
  };

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  };

  const handleTrocarComQuantidade = () => {
    if (!cliente) {
      alert(isVendaReal ? 'Você precisa estar logado para adicionar ao carrinho.' : 'Você precisa estar logado para resgatar pontos.');
      return;
    }

    if (isVendaReal) {
      // Adicionar ao carrinho do usuário
      const itemCarrinho = {
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        quantidade: quantidade,
        imagem: produto.imagem,
        imagens: produto.imagens || []
      };

      // Usar função utilitária para adicionar ao carrinho do usuário
      adicionarItemCarrinhoUsuario(cliente.id, itemCarrinho);

      alert(`${quantidade} unidade(s) de ${produto.nome} adicionada(s) ao carrinho!`);
    } else {
      // Para resgate de pontos, chamar onTrocar
      if (onTrocar) {
        onTrocar(quantidade);
      }
    }
  };
  return (
    <>
      <div className="painel-compra" style={{maxWidth:800,margin:'32px auto 0',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px #0001',padding:32,display:'flex',gap:32,alignItems:'center',justifyContent:'center'}}>
        <div style={{flex:'0 0 400px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {imagensParaMostrar.length > 0 ? (
            <CarrosselImagens imagens={imagensParaMostrar} altura={380} largura={380} animacao={true} />
          ) : (
            <div style={{width:380,height:380,display:'flex',alignItems:'center',justifyContent:'center',background:'#f6f8fa',borderRadius:18,color:'#999',fontSize:24,border:'2px dashed #ccc',flexDirection:'column',gap:12}}>
              <div style={{fontSize:64}}>📸</div>
              <div>Nenhuma imagem disponível</div>
            </div>
          )}
        </div>
        <div style={{flex:1,minWidth:220}}>
          <h2 style={{color:'#1D2A5A',fontWeight:800,letterSpacing:1,marginBottom:18,fontSize:32}}>{produto.nome}</h2>
          <div style={{fontSize:22,marginBottom:16}}><b>Preço unitário:</b> <span style={{color:'#333E8C'}}>{moeda} {precoFormatado}</span></div>
          <div style={{fontSize:18,marginBottom:10}}><b>Estoque:</b> {estoqueDisponivel}</div>
          {!isVendaReal && (
            <div style={{fontSize:18,marginBottom:16}}><b>Seus pontos:</b> P {pontosUsuario}</div>
          )}
          <div style={{fontSize:18,marginBottom:16}}>
            <b>Quantidade:</b>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
              <button 
                onClick={diminuirQuantidade} 
                disabled={quantidade <= 1}
                style={{
                  width:40,height:40,borderRadius:8,border:'2px solid #ddd',background:'#fff',color:'#333',fontSize:20,fontWeight:'bold',cursor:quantidade > 1 ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center'
                }}
              >
                -
              </button>
              <span style={{fontSize:24,fontWeight:'bold',minWidth:50,textAlign:'center'}}>{quantidade}</span>
              <button 
                onClick={aumentarQuantidade} 
                disabled={quantidade >= estoqueDisponivel}
                style={{
                  width:40,height:40,borderRadius:8,border:'2px solid #ddd',background:'#fff',color:'#333',fontSize:20,fontWeight:'bold',cursor:quantidade < estoqueDisponivel ? 'pointer' : 'not-allowed',display:'flex',alignItems:'center',justifyContent:'center'
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{fontSize:20,marginBottom:16}}><b>Total:</b> <span style={{color:'#333E8C'}}>{moeda} {precoTotal}</span></div>
          <button
            className="produto-botao produto-botao-pontos"
            style={{width:'100%',padding:'16px 0',fontSize:20,background:temSaldo?'#333E8C':'#bbb',color:'#fff',border:'none',borderRadius:8,cursor:temSaldo?'pointer':'not-allowed',fontWeight:'bold'}}
            onClick={temSaldo?handleTrocarComQuantidade:undefined}
            disabled={!temSaldo}
          >
            {textoBotao}
          </button>
        </div>
      </div>
      {produto.descricao && (
        <div style={{maxWidth:800,margin:'32px auto 0',background:'#fff',borderRadius:18,boxShadow:'0 2px 12px #0001',padding:'24px 32px',textAlign:'center',fontSize:18,color:'#444'}}>
          <b>Descrição:</b><br />
          <span>{produto.descricao}</span>
        </div>
      )}
    </>
  );
}

export default PainelCompraProduto;
