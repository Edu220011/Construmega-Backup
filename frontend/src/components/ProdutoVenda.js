import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PainelCompraProduto from './PainelCompraProduto';
import { apiFetch } from '../utils/api';

// Hook para buscar dados da empresa (endereço)
function useEmpresaConfig() {
  const [empresa, setEmpresa] = useState(null);
  useEffect(() => {
    apiFetch('/configuracoes')
      .then(res => res.json())
      .then(data => setEmpresa(data));
  }, []);
  return empresa;
}

function ProdutoVenda({ cliente }) {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const empresaConfig = useEmpresaConfig();

  useEffect(() => {
    fetch('/produtos')
      .then(res => res.json())
      .then(produtos => {
        const prod = produtos.find(p => String(p.id) === String(id) && (String(p.moeda).toLowerCase() === 'real' || String(p.moeda).toLowerCase() === 'r$'));
        if (!prod) setErro('Produto não encontrado ou não é para venda.');
        else setProduto(prod);
      });
  }, [id]);

  async function handleComprar(quantidade = 1) {
    // Esta função agora é chamada pelo PainelCompraProduto
    // A lógica de adicionar ao carrinho está lá
  }

  if (erro) return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
      padding: 40,
      textAlign: 'center',
      border: '2px solid #ef4444'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderRadius: '50%',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
      }}>🙁</div>
      <h3 style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.5rem', marginBottom: 16 }}>Ops! Algo deu errado</h3>
      <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>{erro}</p>
    </div>
  );
  if (!produto) return (
    <div style={{
      maxWidth: 500,
      margin: '80px auto',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      padding: 40,
      textAlign: 'center',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '50%',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
        animation: 'spin 2s linear infinite'
      }}>🔄</div>
      <h3 style={{ color: '#334155', fontWeight: 700, fontSize: '1.5rem', marginBottom: 16 }}>Carregando produto...</h3>
      <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Aguarde enquanto buscamos as informações do produto.</p>
    </div>
  );

  return (
    <div>
      <button
        onClick={() => navigate('/produtos')}
        style={{
          margin: '32px auto 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#ffffff',
          border: '2px solid transparent',
          borderRadius: 16,
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🔙</span>
        Voltar para Loja
      </button>
      <PainelCompraProduto produto={produto} onTrocar={handleComprar} pontosUsuario={cliente?.pontos ?? 0} isVendaReal={true} cliente={cliente} />
      <div style={{
        maxWidth: 900,
        margin: '40px auto 0',
        background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)',
        padding: '32px',
        textAlign: 'center',
        fontSize: '1.125rem',
        color: '#92400e',
        border: '2px solid #f59e0b',
        fontWeight: 600,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elemento decorativo */}
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 20
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>🏪</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#92400e',
              margin: 0
            }}>Retirada na Loja</h3>
          </div>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #f59e0b',
            lineHeight: 1.6
          }}>
            <div style={{ marginBottom: 12 }}>📦 Todos os produtos comprados deverão ser retirados na loja.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem' }}>📍</span>
              <strong>Endereço:</strong>
              <span style={{ color: '#1e293b', fontWeight: 800, marginLeft: 8 }}>
                {empresaConfig?.endereco || 'Endereço não cadastrado.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Permite atualização global dos pontos do usuário após resgate
if (typeof window !== 'undefined') {
  window.setCliente = undefined;
}
export default function ProdutoVendaWrapper(props) {
  // Permite que ProdutoVenda acesse setCliente globalmente
  if (typeof window !== 'undefined' && props.setCliente) {
    window.setCliente = props.setCliente;
  }
  return <ProdutoVenda {...props} />;
}