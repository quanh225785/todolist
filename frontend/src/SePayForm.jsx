import React, { useState } from 'react';

export default function SePayForm() {
  const [checkoutURL, setCheckoutURL] = useState(null);
  const [fields, setFields] = useState(null);
  const [loading, setLoading] = useState(false);

  const SERVER = import.meta.env.VITE_SEPAY_SERVER || '';
  const API = SERVER ? `${SERVER.replace(/\/+$/,'')}/api/payment/init` : '/api/payment/init';

  const initPayment = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_invoice_number: `DH${Date.now()}`,
          order_amount: 10000,
          order_description: 'Thanh toan demo',
          success_url: window.location.origin + '/pay/success',
          error_url: window.location.origin + '/pay/error',
          cancel_url: window.location.origin + '/pay/cancel'
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        setCheckoutURL(data.checkoutURL);
        setFields(data.fields);
      } else {
        console.error('init payment failed', data);
        alert('Payment init failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={initPayment} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">
        {loading ? 'Loading...' : 'Thanh toán demo (SePay)'}
      </button>

      {checkoutURL && fields && (
        <form action={checkoutURL} method="POST" style={{ marginTop: 10 }}>
          {Object.keys(fields).map((k) => (
            <input key={k} type="hidden" name={k} value={fields[k]} />
          ))}
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Mở trang thanh toán</button>
        </form>
      )}
    </div>
  );
}
