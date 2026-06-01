import React, { useState, useEffect, useCallback } from 'react';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';
import { getStripePromise } from '../utils/stripeLoader';
import PaymentMethodPicker from './PaymentMethodPicker';
import PaymentMethodDetails from './PaymentMethodDetails';
import {
  getPaymentLabel,
  isStripeCardMethod,
  isOnlinePayment,
  DEFAULT_BANK_TRANSFER,
} from '../constants/paymentMethods';
import {
  createStripeIntent,
  confirmStripeCardPayment,
  processPayPalPayment,
} from '../utils/onlinePayment';

const InvoicePayForm = ({ invoice, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const amount = Number(invoice.amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(
    invoice.paymentMethod && invoice.paymentMethod !== 'cash' ? invoice.paymentMethod : 'card'
  );
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeDemo, setStripeDemo] = useState(false);
  const [bankTransfer, setBankTransfer] = useState(DEFAULT_BANK_TRANSFER);

  const refreshStripeIntent = useCallback(async () => {
    if (!isStripeCardMethod(paymentMethod) || amount <= 0) {
      setClientSecret(null);
      return;
    }
    try {
      const data = await createStripeIntent(amount);
      setClientSecret(data.clientSecret);
      setStripeDemo(!!data.demo);
    } catch {
      setClientSecret(null);
      setStripeDemo(false);
    }
  }, [paymentMethod, amount]);

  useEffect(() => {
    api.get('/payments/config').then((res) => {
      if (res.data?.bankTransfer) setBankTransfer(res.data.bankTransfer);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    refreshStripeIntent();
  }, [refreshStripeIntent]);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (isOnlinePayment(paymentMethod)) {
        if (isStripeCardMethod(paymentMethod)) {
          const result = await confirmStripeCardPayment({
            stripe,
            elements,
            clientSecret,
            stripeDemo,
            billingName: 'Client PetfoodTN',
          });
          if (!result.ok) {
            window.alert(result.error);
            setLoading(false);
            return;
          }
        } else if (paymentMethod === 'paypal') {
          const result = await processPayPalPayment(amount);
          if (!result.ok) {
            window.alert(result.error);
            setLoading(false);
            return;
          }
        }
      }

      await api.post(`/invoices/${invoice._id}/pay`, {
        paymentMethod,
        paymentNote: paymentNote || undefined,
      });
      onSuccess();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const stripeReady = stripeDemo || (stripe && clientSecret);
  const onlineBlocked =
    isStripeCardMethod(paymentMethod) && !stripeDemo && !stripeReady;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Payer la facture #{invoice._id?.slice(-6)}</h3>
      <p style={{ color: '#6b7280' }}>
        Montant : <strong>{amount} DT</strong>
        {invoice.paymentMethod && (
          <> — méthode commande : {getPaymentLabel(invoice.paymentMethod)}</>
        )}
      </p>

      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} layout="grid" />

      <div style={{ marginTop: '16px', marginBottom: '20px' }}>
        <PaymentMethodDetails
          method={paymentMethod}
          bankTransfer={bankTransfer}
          paymentNote={paymentNote}
          onPaymentNoteChange={setPaymentNote}
          stripeReady={stripeReady}
          stripeDemo={stripeDemo}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 18px',
            background: '#e5e7eb',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || onlineBlocked}
          style={{
            padding: '12px 18px',
            background: loading || onlineBlocked ? '#9ca3af' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: loading || onlineBlocked ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Traitement…' : 'Confirmer le paiement'}
        </button>
      </div>
    </div>
  );
};

const InvoicePayModal = ({ invoice, onSuccess, onCancel }) => {
  if (!invoice) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '18px',
          padding: '24px',
          width: '520px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Elements stripe={getStripePromise()}>
          <InvoicePayForm invoice={invoice} onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </div>
    </div>
  );
};

export default InvoicePayModal;
