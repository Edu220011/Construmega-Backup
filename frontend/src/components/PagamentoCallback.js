import React from 'react';
import { useNavigate } from 'react-router-dom';

function PagamentoCallback({ tipo }) {
  const navigate = useNavigate();

  const mensagens = {
    sucesso: {
      titulo: 'Pagamento Aprovado!',
      mensagem: 'Seu pagamento foi aprovado com sucesso. Você pode retirar seu produto na loja.',
      cor: '#28a745',
      icone: '✅'
    },
    falha: {
      titulo: 'Pagamento Recusado',
      mensagem: 'O pagamento não foi aprovado. Tente novamente ou entre em contato conosco.',
      cor: '#dc3545',
      icone: '❌'
    },
    pendente: {
      titulo: 'Pagamento Pendente',
      mensagem: 'Seu pagamento está sendo processado. Você será notificado quando for aprovado.',
      cor: '#ffc107',
      icone: '⏳'
    }
  };

  const config = mensagens[tipo] || mensagens.falha;

  return (
    <div style={{
      maxWidth: 600,
      margin: '50px auto',
      padding: '40px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
        {config.icone}
      </div>
      
      <h1 style={{
        color: config.cor,
        fontSize: '2rem',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        {config.titulo}
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '30px',
        lineHeight: '1.5'
      }}>
        {config.mensagem}
      </p>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/produtos')}
          style={{
            background: '#333E8C',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Voltar para Loja
        </button>
        
        <button
          onClick={() => navigate('/meus-resgates')}
          style={{
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Meus Pedidos
        </button>
      </div>
    </div>
  );
}

export default PagamentoCallback;