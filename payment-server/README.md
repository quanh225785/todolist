# Payment Server (SePay integration)

This small Node microservice demonstrates how to integrate SePay securely.

Setup

1. Copy `.env.example` to `.env` and fill your SePay credentials.

2. Install and run:

```bash
cd payment-server
npm install
npm start
```

3. POST to `/api/payment/init` with JSON body:

```json
{
  "order_invoice_number": "DH123",
  "order_amount": 10000,
  "order_description": "Thanh toan",
  "success_url": "https://yourapp.com/pay/success",
  "error_url": "https://yourapp.com/pay/error",
  "cancel_url": "https://yourapp.com/pay/cancel"
}
```

The server returns `{ checkoutURL, fields }` where `fields` are hidden inputs to POST to `checkoutURL`.

Security: keep merchant_id/secret_key in environment/secret store and DO NOT expose to frontend.
