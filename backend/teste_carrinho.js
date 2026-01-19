require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

console.log('🔍 Testando configuração completa de pagamento carrinho...');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

// Simular exatamente o que o carrinho está enviando
const carrinhoRequest = {
  items: [{
    title: "1", // Nome do produto (como vem do log)
    unit_price: 1,
    quantity: 1,
    currency_id: 'BRL'
  }],
  payer: {
    name: 'Teste Eduardo',
    email: 'dudu@gmail.com'
  },
  back_urls: {
    success: 'http://localhost:3000/pagamento/sucesso',
    failure: 'http://localhost:3000/pagamento/falha',
    pending: 'http://localhost:3000/pagamento/pendente'
  },
  external_reference: `carrinho_913136_${Date.now()}`,
  payment_methods: {
    excluded_payment_methods: [
      { id: "visa" },
      { id: "master" },
      { id: "amex" },
      { id: "diners" },
      { id: "elo" },
      { id: "hipercard" }
    ],
    excluded_payment_types: [
      { id: "credit_card" },
      { id: "debit_card" }
    ],
    installments: 1,
    default_installments: 1
  },
  notification_url: 'http://localhost:3001/pagamento/webhook'
};

console.log('🧪 Testando com configuração idêntica ao carrinho...');
console.log('Configuração:', JSON.stringify(carrinhoRequest, null, 2));

preference.create({ body: carrinhoRequest })
  .then(response => {
    console.log('✅ Preferência criada com sucesso!');
    console.log('ID:', response.id);
    console.log('Init Point:', response.init_point);
    console.log('Status da resposta:', response.api_response?.status || 'N/A');
  })
  .catch(error => {
    console.error('❌ Erro ao criar preferência:', error);
    console.error('Mensagem:', error.message);
    console.error('Status:', error.status);
    console.error('Erro:', error.error);
    if (error.cause) {
      console.error('Causa:', error.cause);
    }
  });