import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import './utils/security'; // Importar proteções de segurança - DESATIVADO

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
