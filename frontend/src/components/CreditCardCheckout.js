import React, { useEffect, useState } from 'react';

function CreditCardCheckout({ preferenceId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditCardInfo, setCreditCardInfo] = useState(null);

  useEffect(() => {
    const loadCreditCardInfo = async () => {
      try {
        console.log('🔄 Carregando informações do cartão de crédito...');
        console.log('PreferenceId:', preferenceId);

        if (!preferenceId) {
          throw new Error('ID da preferência não fornecido');
        }

        // URL do checkout do Mercado Pago para cartão de crédito
        const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
        
        setCreditCardInfo({
          checkoutUrl: checkoutUrl,
          preferenceId: preferenceId
        });

        setLoading(false);
        console.log('✅ Informações do cartão carregadas');

      } catch (err) {
        console.error('❌ Erro ao carregar checkout:', err);
        setError('Erro ao carregar pagamento: ' + err.message);
        setLoading(false);
      }
    };

    loadCreditCardInfo();
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
            🔄 Preparando pagamento com cartão...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
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
          💳 Pagamento com Cartão
        </h3>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 15px 0' }}>
              💎 Cartão de Crédito
            </h4>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Parcele sua compra em até 12x sem juros
            </p>
          </div>

          <button
            onClick={() => {
              console.log('🚀 Abrindo checkout do cartão:', creditCardInfo.checkoutUrl);
              window.open(creditCardInfo.checkoutUrl, '_blank');
            }}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease'
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
            <span style={{ fontSize: '24px' }}>💳</span>
            Pagar com Cartão
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
            💳 Cartões aceitos:
          </strong>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '15px',
            marginBottom: '15px' 
          }}>
            <span style={{ fontSize: '24px' }}>💳</span>
            <span>Visa • MasterCard • Elo • Amex • Hipercard</span>
          </div>
          
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <div style={{ marginBottom: '8px' }}>• Parcele em até 12x sem juros</div>
            <div style={{ marginBottom: '8px' }}>• Aprovação instantânea na maioria dos casos</div>
            <div style={{ marginBottom: '8px' }}>• Ambiente 100% seguro</div>
            <div>• Processamento pelo Mercado Pago</div>
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            padding: '10px',
            background: '#e3f2fd',
            borderRadius: '8px',
            border: '1px solid #90caf9'
          }}>
            <strong style={{ color: '#1976d2' }}>🔒 Segurança garantida!</strong><br/>
            <span style={{ color: '#1976d2', fontSize: '12px' }}>
              Seus dados são protegidos com criptografia de ponta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditCardCheckout;