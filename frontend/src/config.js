const API_URL = process.env.REACT_APP_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : '' // Usar URLs relativas em produção (Nginx proxeia)
);

export default API_URL;
