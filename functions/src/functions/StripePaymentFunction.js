const { app } = require('@azure/functions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stored the key in Azure Function App > Configuration

// Invocation URL (DEV Env.): "http://localhost:7071/api/createPayment?amount=1234"
app.http('createPayment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const amount = request.query.get('amount');  // Gets value of amount from URL
      context.log("Payment request recieved of amount: $" + `${amount}`);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd"
      });
      // context.log(paymentIntent);

      return {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientSecret: paymentIntent.client_secret // Used to then continue the payment process as soon as user enters their card info.
        })
      }
    } catch (e) {
      //context.log(e);
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 500,
          body: 'Internal Server Error',
        })
      };
    }
  }
});
