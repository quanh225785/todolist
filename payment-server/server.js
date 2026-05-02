require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { SePayPgClient } = require('sepay-pg-node-sdk');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

if (!process.env.SEPAY_MERCHANT_ID || !process.env.SEPAY_SECRET_KEY) {
  console.warn('Warning: SEPAY_MERCHANT_ID or SEPAY_SECRET_KEY not set in env. Server will start but API calls may fail.');
}

const client = new SePayPgClient({
  env: process.env.SEPAY_ENV || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY,
});

// POST /api/payment/init
// body: { order_invoice_number, order_amount, order_description, success_url, error_url, cancel_url }
app.post('/api/payment/init', async (req, res) => {
  try {
    const {
      order_invoice_number,
      order_amount,
      order_description,
      success_url,
      error_url,
      cancel_url,
      payment_method = 'BANK_TRANSFER',
      operation = 'PURCHASE'
    } = req.body;

    if (!order_invoice_number || !order_amount) {
      return res.status(400).json({ error: 'order_invoice_number and order_amount required' });
    }

    const checkoutURL = client.checkout.initCheckoutUrl();
    const fields = client.checkout.initOneTimePaymentFields({
      operation,
      payment_method,
      order_invoice_number,
      order_amount,
      currency: 'VND',
      order_description,
      success_url,
      error_url,
      cancel_url,
    });

    return res.json({ checkoutURL, fields });
  } catch (err) {
    console.error('init payment error', err?.message || err);
    return res.status(500).json({ error: 'init_failed' });
  }
});

// Webhook endpoint stub - verify signature per SePay docs
app.post('/api/payment/webhook', (req, res) => {
  // TODO: verify signature/timestamp using SEPAY_SECRET_KEY
  // Process payment notification, update DB, etc.
  console.log('webhook received', req.body);
  res.status(200).send('ok');
});

app.listen(PORT, () => console.log(`Payment server listening on ${PORT}`));
