import api from './api';

export const createStripeIntent = async (amount) => {
  const res = await api.post('/stripe/create-payment-intent', {
    amount,
    currency: 'tnd',
  });
  return res.data;
};

export const confirmStripeCardPayment = async ({
  stripe,
  elements,
  clientSecret,
  stripeDemo,
  billingName,
  billingPhone,
}) => {
  if (stripeDemo) {
    return { ok: true, demo: true };
  }
  if (!stripe || !elements || !clientSecret) {
    return { ok: false, error: 'Paiement par carte indisponible (Stripe non prêt).' };
  }
  const cardEl = elements.getElement('CardElement');
  if (!cardEl) {
    return { ok: false, error: 'Saisissez les informations de carte.' };
  }
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardEl,
      billing_details: {
        name: billingName || 'Client PetfoodTN',
        phone: billingPhone || undefined,
      },
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (paymentIntent?.status === 'succeeded') {
    return { ok: true };
  }
  return {
    ok: false,
    error: `Paiement incomplet (statut : ${paymentIntent?.status || 'inconnu'}).`,
  };
};

export const processPayPalPayment = async (amount) => {
  const created = await api.post('/payments/paypal/create-order', { amount });
  const orderId = created.data?.orderId;
  if (!orderId) {
    return { ok: false, error: 'Création de commande PayPal impossible.' };
  }
  const captured = await api.post('/payments/paypal/capture-order', { orderId });
  if (captured.data?.success) {
    return { ok: true, demo: !!captured.data.demo };
  }
  return { ok: false, error: 'Capture PayPal échouée.' };
};

/** Paiements en ligne tunisiens (Flouci, Konnect, Paymee, D17) — mode démo si API indisponible */
export const processTunisianPayment = async (provider, amount, phone) => {
  try {
    const { data } = await api.post('/payments/tunisia/charge', {
      provider,
      amount,
      phone: phone || undefined,
      currency: 'TND',
    });
    if (data?.success || data?.status === 'paid') {
      return { ok: true, demo: !!data.demo, reference: data.reference };
    }
    return { ok: false, error: data?.error || 'Paiement refusé.' };
  } catch {
    return {
      ok: true,
      demo: true,
      reference: `DEMO-${provider.toUpperCase()}-${Date.now().toString(36)}`,
    };
  }
};
