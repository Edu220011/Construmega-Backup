import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PerfilDropdown.css';

function PerfilDropdown({ onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="perfil-dropdown-wrap">
      <button className="perfil-dropdown-btn btn-padrao">Perfil</button>
      <div className="perfil-dropdown-menu">
        <button className="perfil-dropdown-item btn-padrao" onClick={() => navigate('/perfil')}>Ver Dados</button>
        <button className="perfil-dropdown-item btn-padrao" onClick={() => { onLogout(); navigate('/'); }}>Sair da Conta</button>
      </div>
    </div>
  );
}

export default PerfilDropdown;
