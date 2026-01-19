import React, { useEffect, useState } from 'react';

function PixCheckout({ preferenceId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pixInfo, setPixInfo] = useState(null);

  useEffect(() => {
    const loadPixInfo = async () => {
      try {
        console.log('🔄 Carregando informações do PIX...');
        console.log('PreferenceId:', preferenceId);

        if (!preferenceId) {
          throw new Error('ID da preferência não fornecido');
        }

        // Buscar informações do PIX diretamente do Mercado Pago
        const pixUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
        
        setPixInfo({
          pixUrl: pixUrl,
          preferenceId: preferenceId
        });

        setLoading(false);
        console.log('✅ Informações do PIX carregadas');

      } catch (err) {
        console.error('❌ Erro ao carregar PIX:', err);
        setError('Erro ao carregar pagamento PIX: ' + err.message);
        setLoading(false);
      }
    };

    loadPixInfo();
  }, [preferenceId]);

  if (loading) {
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
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            🔄 Preparando pagamento PIX...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
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
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ fontSize: '18px', color: 'red', marginBottom: '20px' }}>
            ❌ Erro ao carregar pagamento
          </div>
          <div style={{ marginBottom: '20px' }}>{error}</div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

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
        padding: '20px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h3 style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#333',
          fontSize: '24px'
        }}>
          💰 Pagamento via PIX
        </h3>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: '#e8f5e8', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#2d5a2d', margin: '0 0 15px 0' }}>
              🎯 PIX Instantâneo
            </h4>
            <p style={{ margin: 0, color: '#4a6741' }}>
              Clique no botão abaixo para abrir o pagamento PIX no Mercado Pago
            </p>
          </div>

          <button
            onClick={() => {
              console.log('🚀 Abrindo PIX no Mercado Pago:', pixInfo.pixUrl);
              window.open(pixInfo.pixUrl, '_blank');
            }}
            style={{
              padding: '16px 32px',
              background: '#00a8ff',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(0,168,255,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#0088cc';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#00a8ff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '24px' }}>💳</span>
            Pagar com PIX
          </button>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#333', display: 'block', marginBottom: '10px' }}>
            📱 Como pagar com PIX:
          </strong>
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <div style={{ marginBottom: '8px' }}>• Abra o app do seu banco</div>
            <div style={{ marginBottom: '8px' }}>• Escolha a opção PIX</div>
            <div style={{ marginBottom: '8px' }}>• Escaneie o QR Code ou copie o código PIX</div>
            <div style={{ marginBottom: '8px' }}>• Confirme o pagamento</div>
            <div>• O pedido será processado automaticamente</div>
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            padding: '10px',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <strong style={{ color: '#856404' }}>⚡ PIX é instantâneo!</strong><br/>
            <span style={{ color: '#856404', fontSize: '12px' }}>
              Seu pagamento será confirmado em segundos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PixCheckout;