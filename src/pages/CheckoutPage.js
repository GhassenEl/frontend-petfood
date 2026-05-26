import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_demo');
const CART_STORAGE_KEY = 'petfood_cart';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
      padding: '12px',
    },
    invalid: { color: '#9e2146' },
  },
};

const readStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const CheckoutForm = ({ cart: cartProp, totalCart: totalCartProp, onPlaceOrder, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [storedCart, setStoredCart] = useState(readStoredCart);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeDemo, setStripeDemo] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, succeeded, error
  const cart = Array.isArray(cartProp) && cartProp.length > 0 ? cartProp : storedCart;
  const computedTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const totalCart = Number(Number(totalCartProp ?? computedTotal).toFixed(2));
  const closeCheckout = onClose || (() => navigate('/client-products'));

  useEffect(() => {
    if (paymentMethod === 'card' && totalCart > 0) {
      createPaymentIntent();
    }
  }, [paymentMethod, totalCart]);

  const createPaymentIntent = async () => {
    try {
      const res = await api.post('/stripe/create-payment-intent', {
        amount: totalCart,
        currency: 'tnd'
      });
      setClientSecret(res.data.clientSecret);
      setStripeDemo(!!res.data.demo);
    } catch (error) {
      console.error('Payment intent error:', error);
      setClientSecret(null);
      setStripeDemo(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      window.alert('Votre panier est vide');
      navigate('/client-products');
      return;
    }

    if (!address || !phone) {
      window.alert('Veuillez remplir l\'adresse et le téléphone');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    let cardPaid = false;

    try {
      if (paymentMethod === 'card') {
        if (stripeDemo) {
          cardPaid = true;
          setPaymentStatus('succeeded');
        } else if (stripe && elements && clientSecret) {
          const cardEl = elements.getElement(CardElement);
          if (!cardEl) {
            window.alert('Saisissez les informations de carte ou réessayez.');
            setPaymentStatus('error');
            setLoading(false);
            return;
          }
          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardEl,
              billing_details: {
                name: address,
                phone: phone,
              },
            }
          });

          if (error) {
            setPaymentStatus('error');
            window.alert(error.message);
            setLoading(false);
            return;
          }

          if (paymentIntent?.status === 'succeeded') {
            cardPaid = true;
            setPaymentStatus('succeeded');
          } else {
            setPaymentStatus('error');
            window.alert(`Paiement incomplet (statut : ${paymentIntent?.status || 'inconnu'}).`);
            setLoading(false);
            return;
          }
        } else {
          setPaymentStatus('error');
          window.alert('Paiement par carte indisponible (clé Stripe ou intent manquant).');
          setLoading(false);
          return;
        }
      }

      const orderPayload = {
        paymentMethod,
        address,
        phone,
        items: cart.map((item) => ({
          productId: item.productId || item._id || item.id,
          quantity: Math.max(1, Number(item.quantity || 1)),
          price: Number(item.price || 0),
        })),

        total: totalCart,
        paid: cardPaid
      };

      const result = onPlaceOrder
        ? await onPlaceOrder(orderPayload)
        : (await api.post('/orders', orderPayload)).data;

      const invoiceId = result?.invoice?._id || result?.invoice?.id;
      if (cardPaid && invoiceId) {
        await api.post(`/invoices/${invoiceId}/pay`, { paymentMethod });
      }

      localStorage.removeItem(CART_STORAGE_KEY);
      setStoredCart([]);
      window.dispatchEvent(new CustomEvent('petfood:clear-cart'));
      setPaymentStatus('succeeded');

    } catch (error) {
      setPaymentStatus('error');
      window.alert(error.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart.reduce((s, i) => s + Number(i.quantity || 1), 0);

  if (paymentStatus === 'succeeded') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(39,174,96,0.3)',
          }}
        >
          <CheckCircle size={40} color="white" />
        </motion.div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#27ae60', margin: '0 0 12px' }}>
          Paiement réussi !
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Votre commande de {totalCart.toFixed(2)} DT a été confirmée.
        </p>
        <button
          onClick={closeCheckout}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #e67e22, #d35400)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Continuer mes achats
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Lock size={28} color="#27ae60" /> Paiement sécurisé
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Total: <strong style={{ color: '#e67e22', fontSize: '20px' }}>{totalCart.toFixed(2)} DT</strong></p>
      </motion.div>

      {/* Delivery Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '18px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#e67e22" /> Livraison
        </h3>
        <input
          type="text"
          placeholder="Adresse complète de livraison"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            marginBottom: '12px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#e67e22'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          required
        />
        <input
          type="tel"
          placeholder="Téléphone de contact"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#e67e22'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          required
        />
      </motion.div>

      {/* Cart Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '18px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
          🛍️ Résumé ({itemCount} article{itemCount > 1 ? 's' : ''})
        </h3>
        {cart.map(item => (
          <div key={item._id || item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>{item.name}</span>
              <span style={{ color: '#888', marginLeft: '8px' }}>x{item.quantity}</span>
            </div>
            <span style={{ fontWeight: 700, color: '#27ae60' }}>{(item.price * item.quantity).toFixed(2)} DT</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
          <span>Total:</span>
          <span style={{ color: '#e67e22' }}>{totalCart.toFixed(2)} DT</span>
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '18px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#e67e22" /> Méthode de paiement
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'card', label: '💳 Carte bancaire', icon: <CreditCard size={16} /> },
            { id: 'cash', label: '💵 Contre remboursement', icon: <Truck size={16} /> },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '14px',
                borderRadius: '14px',
                border: paymentMethod === method.id ? '2px solid #e67e22' : '2px solid #e5e7eb',
                background: paymentMethod === method.id ? 'rgba(230,126,34,0.05)' : 'white',
                cursor: 'pointer',
                fontWeight: paymentMethod === method.id ? 700 : 500,
                color: paymentMethod === method.id ? '#e67e22' : '#555',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {method.icon} {method.label}
            </button>
          ))}
        </div>

        {paymentMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              padding: '20px',
              background: '#fafafa',
              borderRadius: '14px',
              border: '2px solid #e5e7eb',
            }}
          >
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
              <Lock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Paiement sécurisé par Stripe
            </div>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
      >
        <button
          onClick={closeCheckout}
          style={{
            padding: '14px 28px',
            background: '#f3f4f6',
            color: '#555',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Annuler
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading || !address || !phone || (paymentMethod === 'card' && !stripeDemo && (!stripe || !clientSecret))}
          style={{
            padding: '14px 32px',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #e67e22, #d35400)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            boxShadow: loading ? 'none' : '0 8px 20px rgba(230,126,34,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Traitement...
            </>
          ) : (
            <>✅ Confirmer ({totalCart.toFixed(2)} DT)</>
          )}
        </button>
      </motion.div>
    </div>
  );
};

const CheckoutPage = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default CheckoutPage;
