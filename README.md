# 🏗️ Construmega - Sistema de Loja Online

Sistema completo de e-commerce para materiais de construção com sistema de pontos, pagamentos integrados e painel administrativo.

![Construmega Logo](frontend/public/logo-construmega.png)

## 📋 Sobre o Projeto

O **Construmega** é uma plataforma completa de e-commerce desenvolvida para lojas de materiais de construção, oferecendo:

- 🛒 **Catálogo de produtos** com imagens e descrições
- 👥 **Sistema de usuários** com perfis de cliente e administrador
- 💰 **Sistema de pontos** para fidelização de clientes
- 🛍️ **Carrinho de compras** com checkout completo
- 💳 **Pagamentos integrados** (Mercado Pago - PIX e Cartão)
- 📊 **Painel administrativo** para gestão completa
- 🔒 **Segurança avançada** com hash de senhas e proteções F12
- 📱 **Interface responsiva** para desktop e mobile

## 🚀 Funcionalidades

### Para Clientes
- ✅ Cadastro e login com hash de senhas
- ✅ Navegação por catálogo de produtos
- ✅ Sistema de carrinho de compras
- ✅ Pagamentos via PIX e cartão de crédito
- ✅ Sistema de pontos e resgates
- ✅ Histórico de pedidos e comprovantes
- ✅ Perfil pessoal e alteração de senha

### Para Administradores
- ✅ Gestão completa de produtos (CRUD)
- ✅ Controle de usuários e pontos
- ✅ Gestão de pedidos e status
- ✅ Configurações globais da loja
- ✅ Relatórios e estatísticas
- ✅ Controle de estoque
- ✅ Reset de senhas de usuários

### Segurança
- ✅ Hash bcrypt para senhas
- ✅ Proteções contra DevTools (F12)
- ✅ Rate limiting para prevenir ataques
- ✅ Headers de segurança HTTP
- ✅ Bloqueio de acesso direto a dados sensíveis

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com **Express.js**
- **bcrypt** para hash de senhas
- **Mercado Pago SDK** para pagamentos
- **CORS** e middlewares de segurança
- **File System** para persistência de dados

### Frontend
- **React.js** com hooks
- **React Router** para navegação
- **CSS Modules** para estilização
- **Axios** para requisições HTTP
- **Responsive Design** para mobile

### Infraestrutura
- **Git** para controle de versão
- **GitHub** para hospedagem do código
- **JSON** para armazenamento de dados
- **REST API** para comunicação

## 📁 Estrutura do Projeto

```
Construmega-Backup/
├── backend/                    # Servidor Node.js
│   ├── index.js               # Arquivo principal do servidor
│   ├── package.json           # Dependências backend
│   ├── usuarios.json          # Dados de usuários
│   ├── produtos.json          # Catálogo de produtos
│   ├── pedidos.json           # Histórico de pedidos
│   └── configuracoes.json     # Configurações da loja
├── frontend/                  # Aplicação React
│   ├── public/                # Arquivos estáticos
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── utils/             # Utilitários e segurança
│   │   ├── App.js             # Componente principal
│   │   └── index.js           # Ponto de entrada
│   └── package.json           # Dependências frontend
├── .gitignore                 # Arquivos ignorados pelo Git
├── iniciar-site.bat          # Script de inicialização
└── README.md                  # Esta documentação
```

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git**

### Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Edu220011/Construmega-Backup.git
   cd Construmega-Backup
   ```

2. **Instale as dependências do backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Instale as dependências do frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Execute o script de inicialização:**
   ```bash
   # Volte para a raiz do projeto
   cd ..
   # Execute o script (Windows)
   iniciar-site.bat
   ```

   Ou execute manualmente:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

5. **Acesse a aplicação:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3000

### Credenciais de Acesso

**Administrador:**
- Email: `admin@admin.com`
- Senha: `admin`

**Cliente de exemplo:**
- Use o sistema de cadastro ou dados existentes nos arquivos JSON

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
Crie um arquivo `.env` na pasta `backend/`:
```env
MP_ACCESS_TOKEN=your_mercado_pago_access_token
MP_PUBLIC_KEY=your_mercado_pago_public_key
```

### Configurações da Loja
As configurações podem ser alteradas através do painel administrativo ou editando `backend/configuracoes.json`.

## 🔒 Segurança Implementada

### Proteções Frontend
- Bloqueio de F12 e atalhos de DevTools
- Desabilitação de seleção de texto (exceto em formulários)
- Prevenção de cópia fora de campos editáveis
- Detecção de abertura do DevTools
- Anti-debugging básico

### Proteções Backend
- Hash bcrypt para senhas (salt rounds: 10)
- Rate limiting (100 requests/15min por IP)
- Headers de segurança HTTP
- Detecção de User-Agents suspeitos
- Bloqueio de acesso direto a arquivos JSON

## 📊 API Endpoints

### Autenticação
- `POST /api/login` - Login de usuários
- `POST /login` - Login alternativo

### Usuários
- `GET /usuarios` - Listar usuários
- `POST /usuarios` - Criar usuário
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Excluir usuário

### Produtos
- `GET /produtos` - Listar produtos
- `POST /produtos` - Criar produto
- `PUT /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Excluir produto

### Pedidos
- `GET /pedidos` - Listar pedidos
- `POST /pedidos` - Criar pedido
- `PUT /pedidos/:id` - Atualizar pedido

### Outros
- `GET /resgates` - Resgates de pontos
- `POST /pagamento/criar` - Criar pagamento MP
- `GET /chave/gerar` - Gerar chave PIX

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🚀 Deploy em Produção

### Opção 1: Deploy Automático (Recomendado)

1. **Conecte-se à sua VPS:**
   ```bash
   ssh root@construmega.online
   ```

2. **Execute o script de deploy:**
   ```bash
   wget https://raw.githubusercontent.com/Edu220011/Construmega-Backup/master/deploy-vps.sh
   chmod +x deploy-vps.sh
   sudo ./deploy-vps.sh
   ```

3. **Configure as credenciais do Mercado Pago:**
   ```bash
   nano /var/www/construmega/backend/.env
   ```

4. **Acesse o site:** https://construmega.online

### Opção 2: Deploy Manual

Siga o guia completo em [`DEPLOY_VPS.md`](DEPLOY_VPS.md) para deploy manual passo-a-passo.

### Arquivos de Configuração

- `DEPLOY_VPS.md` - Guia completo de deploy
- `deploy-vps.sh` - Script de deploy automatizado
- `ecosystem.config.js` - Configuração PM2
- `monitor.sh` - Script de monitoramento

### Pós-Deploy

- **Monitoramento:** `./monitor.sh`
- **Logs:** `pm2 logs construmega-backend`
- **Reinício:** `pm2 restart construmega-backend`
- **Atualização:** `git pull && npm run build`

### Credenciais de Produção

**Administrador:**
- Email: `admin@admin.com`
- Senha: `admin`

Configure as variáveis de ambiente do Mercado Pago no arquivo `.env` do backend.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

## 🔄 Atualizações

### v1.0.0 (Atual)
- ✅ Sistema completo funcional
- ✅ Autenticação com hash de senhas
- ✅ Proteções de segurança F12
- ✅ Integração Mercado Pago
- ✅ Painel administrativo completo
- ✅ Interface responsiva

---

**Construmega** - Transformando o jeito de comprar materiais de construção! 🏗️✨