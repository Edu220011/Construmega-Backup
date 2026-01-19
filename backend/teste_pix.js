require('dotenv').config();
console.log('🔍 Testando criação de preferência PIX específica...');

const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

const pixPreference = {
  items: [{
    title: 'Teste PIX',
    unit_price: 10.00,
    quantity: 1,
    currency_id: 'BRL'
  }],
  payer: {
    name: 'João Silva',
    email: 'joao@teste.com'
  },
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
    installments: 1
  },
  purpose: 'wallet_purchase'
};

console.log('🧪 Testando preferência PIX...');
console.log('Configuração:', JSON.stringify(pixPreference, null, 2));

preference.create({ body: pixPreference })
  .then(response => {
    console.log('✅ Preferência PIX criada com sucesso!');
    console.log('ID:', response.id);
    console.log('Init Point:', response.init_point);
    console.log('Sandbox Init Point:', response.sandbox_init_point);
    
    console.log('\n🔗 Teste no navegador:');
    console.log('Produção:', response.init_point);
    console.log('Sandbox:', response.sandbox_init_point);
    
    console.log('\n📋 Métodos de pagamento configurados:');
    console.log('Excluídos:', response.payment_methods.excluded_payment_methods);
    console.log('Tipos excluídos:', response.payment_methods.excluded_payment_types);
  })
  .catch(error => {
    console.error('❌ Erro ao criar preferência:', error);
    if (error.cause) {
      console.error('Detalhes do erro:', error.cause);
    }
  });