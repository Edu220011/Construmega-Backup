require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

console.log('Token:', process.env.MP_ACCESS_TOKEN ? 'OK' : 'MISSING');

try {
  const config = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
  });
  console.log('MercadoPagoConfig created');

  const preference = new Preference(config);
  console.log('Preference client created:', !!preference);

  // Teste com payment_types como no exemplo do usuário
  const testPreference = {
    items: [{
      title: 'Teste PIX',
      unit_price: 10.00,
      quantity: 1,
      currency_id: 'BRL'
    }],
    payment_methods: {
      installments: null,
      excluded_payment_methods: [],
      payment_types: [{ "id": "pix" }]
    },
    back_urls: {
      success: "http://localhost:3000/success",
      pending: "http://localhost:3000/pending", 
      failure: "http://localhost:3000/failure"
    },
    notification_url: 'http://localhost:3001/pagamento/webhook'
  };

  console.log('Tentando criar preferência de teste...');
  preference.create({ body: testPreference })
    .then(response => {
      console.log('Sucesso! Response:', response);
    })
    .catch(error => {
      console.error('Erro:', error.message);
      console.error('Detalhes:', error);
    });

} catch (error) {
  console.error('Erro na configuração:', error);
}