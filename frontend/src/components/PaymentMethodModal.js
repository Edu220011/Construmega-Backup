import React from 'react';

function PaymentMethodModal({ onSelectPayment, onClose, pagamentoCartao = true, pagamentoPix = true }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: '5px'
          }}
        >
          ×
        </button>

        <h3 style={{
          textAlign: 'center',
          marginBottom: '25px',
          color: '#333',
          fontSize: '24px'
        }}>
          💳 Escolha sua forma de pagamento
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {(!pagamentoPix && !pagamentoCartao) ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Nenhum método de pagamento disponível
              </div>
              <div style={{ fontSize: '14px' }}>
                Entre em contato com o administrador para habilitar métodos de pagamento.
              </div>
            </div>
          ) : (
            <>
              {/* PIX */}
              {pagamentoPix && (
                <button
                  onClick={() => onSelectPayment('pix')}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #00D4AA 0%, #00B894 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 212, 170, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 170, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 212, 170, 0.3)';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                      ⚡ PIX Instantâneo
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      Aprovação imediata • Sem taxas
                    </div>
                  </div>
                  <span style={{ fontSize: '24px' }}>📱</span>
                </button>
              )}

              {/* Cartão de Crédito */}
              {pagamentoCartao && (
                <button
                  onClick={() => onSelectPayment('creditcard')}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                      💳 Cartão de Crédito
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      Parcele em até 12x • Visa, Master, Elo
                    </div>
                  </div>
                  <span style={{ fontSize: '24px' }}>💎</span>
                </button>
              )}
            </>
          )}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>🔒 Pagamento 100% seguro</strong><br/>
          Processado pelo Mercado Pago com criptografia de ponta
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodModal;