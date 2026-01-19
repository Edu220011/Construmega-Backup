import React from 'react';

function ComprovanteCard({ resgate, onCopiar, onImprimir }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return '#28a745';
      case 'Pendente': return '#ffc107';
      case 'Recusado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aprovado': return '✅';
      case 'Pendente': return '⏳';
      case 'Recusado': return '❌';
      default: return '❓';
    }
  };

  return (
    <div 
      className="comprovante-card"
      style={{
        '--status-color': getStatusColor(resgate.status),
        '--cursor-pointer': resgate.tipo === 'venda' && resgate.status === 'Pendente' && resgate.init_point ? 'pointer' : 'default'
      }}
      onClick={() => {
        if (resgate.tipo === 'venda' && resgate.status === 'Pendente' && resgate.init_point) {
          window.open(resgate.init_point, '_blank');
        }
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      }}
    >

      {/* Cabeçalho com status */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: getStatusColor(resgate.status),
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {getStatusIcon(resgate.status)} {resgate.status}
      </div>

      {/* Número do comprovante */}
      <div style={{
        textAlign: 'center',
        marginTop: '15px',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px',
          fontWeight: 'bold'
        }}>
          {resgate.tipo === 'venda' ? 'PEDIDO DE COMPRA' : 'COMPROVANTE'}
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          background: '#f8f9fa',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '2px dashed #dee2e6',
          display: 'inline-block',
          fontFamily: 'monospace'
        }}>
          {resgate.tipo === 'venda' ? (resgate.comprovante || 'Aguardando Comprovante') : (resgate.comprovante || 'N/A')}
        </div>
      </div>

      {/* Informações do pedido */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>📅 Data:</strong> {resgate.data}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>👤 Cliente:</strong> {resgate.usuarioNome}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>📦 Produtos:</strong>
          <div style={{marginTop:8}}>
            {Array.isArray(resgate.itens) ? (
              <ul style={{margin:0,paddingLeft:18}}>
                {resgate.itens.map((it, idx) => (
                  <li key={idx} style={{fontSize:14}}>{(it.title || it.produtoNome || it.nome || it.produto)} — {it.quantity || it.quantidade || 1}</li>
                ))}
              </ul>
            ) : (
              <div style={{fontSize:14}}>{resgate.produtoNome || resgate.produto} — {resgate.quantidade || 1}</div>
            )}
          </div>
        </div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>💰 Valor Total:</strong> {resgate.tipo === 'resgate' ? `P ${resgate.pontos}` : `R$ ${(resgate.valorProduto * (resgate.quantidade || 1)).toFixed(2)}`}
        </div>
        {resgate.metodoEntrega ? (
          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
            <strong>🚩 Método:</strong> {resgate.metodoEntrega === 'retirada' ? 'Retirada na loja' : 'Entrega'}
          </div>
        ) : null}
        {resgate.localRetirada && (
          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
            <strong>📍 Local:</strong> {resgate.localRetirada}
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopiar(resgate.comprovante);
          }}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          onMouseOver={(e) => e.target.style.background = '#0056b3'}
          onMouseOut={(e) => e.target.style.background = '#007bff'}
        >
          📋 Copiar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onImprimir(resgate);
          }}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          onMouseOver={(e) => e.target.style.background = '#545b62'}
          onMouseOut={(e) => e.target.style.background = '#6c757d'}
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Rodapé com ID do pedido */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #dee2e6',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        Pedido ID: {resgate.id}
      </div>
    </div>
  );
}

export default ComprovanteCard;