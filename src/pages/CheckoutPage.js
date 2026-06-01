import React, { useState, useEffect, useCallback } from 'react';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, Lock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getStripePromise } from '../utils/stripeLoader';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import PaymentMethodDetails from '../components/PaymentMethodDetails';
import {
  isStripeCardMethod,
  isOnlinePayment,
  isWalletPayment,
  getPaymentLabel,
  DEFAULT_BANK_TRANSFER,
} from '../constants/paymentMethods';
import {
  createStripeIntent,
  confirmStripeCardPayment,
  processPayPalPayment,
} from '../utils/onlinePayment';
import { getWallet } from '../services/walletService';

const CART_STORAGE_KEY = 'petfood_cart';

const CheckoutForm = ({ cart: cartProp, totalCart: totalCartProp, onPlaceOrder, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [storedCart, setStoredCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentNote, setPaymentNote] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeDemo, setStripeDemo] = useState(false);
  const [bankTransfer, setBankTransfer] = useState(DEFAULT_BANK_TRANSFER);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [promoInput, setPromoInput] = useState(() => {
    try {
      return sessionStorage.getItem('petfood_checkout_promo') || '';
    } catch {
      return '';
    }
  });
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const cart = Array.isArray(cartProp) && cartProp.length > 0 ? cartProp : storedCart;
  const computedSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const subtotal = Number(Number(totalCartProp ?? computedSubtotal).toFixed(2));
  const promoDiscount = Number(promoApplied?.discount || 0);
  const totalCart = Number(Math.max(0, subtotal - promoDiscount).toFixed(2));
  const closeCheckout = onClose || (() => navigate('/client-products'));

  const loadPaymentConfig = useCallback(async () => {
    try {
      const res = await api.get('/payments/config');
      if (res.data?.bankTransfer) setBankTransfer(res.data.bankTransfer);
    } catch {
      /* config optionnelle */
    }
  }, []);

  const refreshStripeIntent = useCallback(async () => {
    if (!isStripeCardMethod(paymentMethod) || totalCart <= 0) {
      setClientSecret(null);
      return;
    }
    try {
      const data = await createStripeIntent(totalCart);
      setClientSecret(data.clientSecret);
      setStripeDemo(!!data.demo);
    } catch (error) {
      console.error('Payment intent error:', error);
      setClientSecret(null);
      setStripeDemo(false);
    }
  }, [paymentMethod, totalCart]);

  useEffect(() => {
    loadPaymentConfig();
    getWallet().then((w) => setWalletBalance(w?.balance ?? 0)).catch(() => setWalletBalance(0));
    try {
      const prefill = sessionStorage.getItem('petfood_checkout_promo');
      if (prefill) {
        sessionStorage.removeItem('petfood_checkout_promo');
        setPromoInput(prefill);
      }
    } catch { /* ignore */ }
  }, [loadPaymentConfig]);

  useEffect(() => {
    refreshStripeIntent();
  }, [refreshStripeIntent]);

  useEffect(() => {
    if (!promoApplied?.code) return;
    const revalidate = async () => {
      try {
        const { data } = await api.post('/promotions/validate', {
          code: promoApplied.code,
          subtotal,
        });
        setPromoApplied(data);
        setPromoError('');
      } catch {
        setPromoApplied(null);
        setPromoError('Le code promo n\'est plus valide pour ce panier');
      }
    };
    revalidate();
  }, [subtotal]);

  const applyPromoCode = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const { data } = await api.post('/promotions/validate', { code, subtotal });
      setPromoApplied(data);
      setPromoInput(data.code);
    } catch (error) {
      setPromoApplied(null);
      setPromoError(error.response?.data?.error || 'Code promo invalide');
    } finally {
      setPromoLoading(false);
    }
  };

  const clearPromo = () => {
    setPromoApplied(null);
    setPromoInput('');
    setPromoError('');
  };

  const runOnlinePayment = async () => {
    if (isStripeCardMethod(paymentMethod)) {
      const result = await confirmStripeCardPayment({
        stripe,
        elements,
        clientSecret,
        stripeDemo,
        billingName: address,
        billingPhone: phone,
      });
      if (!result.ok) {
        window.alert(result.error);
        return false;
      }
      return true;
    }
    if (paymentMethod === 'paypal') {
      const result = await processPayPalPayment(totalCart);
      if (!result.ok) {
        window.alert(result.error);
        return false;
      }
      return true;
    }
    return false;
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

    let paidOnline = false;

    try {
      if (isWalletPayment(paymentMethod)) {
        if ((walletBalance ?? 0) < totalCart) {
          window.alert('Solde portefeuille insuffisant. Rechargez ci-dessous.');
          setPaymentStatus('error');
          setLoading(false);
          return;
        }
        paidOnline = true;
      } else if (isOnlinePayment(paymentMethod)) {
        paidOnline = await runOnlinePayment();
        if (!paidOnline) {
          setPaymentStatus('error');
          setLoading(false);
          return;
        }
        setPaymentStatus('succeeded');
      }

      const orderPayload = {
        paymentMethod,
        paymentNote: paymentNote || undefined,
        address,
        phone,
        promoCode: promoApplied?.code || undefined,
        items: cart.map((item) => ({
          productId: item.productId || item._id || item.id,
          quantity: Math.max(1, Number(item.quantity || 1)),
          price: Number(item.price || 0),
        })),
        total: totalCart,
        paid: paidOnline,
      };

      const result = onPlaceOrder
        ? await onPlaceOrder(orderPayload)
        : (await api.post('/orders', orderPayload)).data;

      const invoiceId = result?.invoice?._id || result?.invoice?.id;
      if (paidOnline && invoiceId && !isWalletPayment(paymentMethod)) {
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
  const stripeReady = stripeDemo || (stripe && clientSecret);
  const onlineBlocked =
    isStripeCardMethod(paymentMethod) && !stripeDemo && !stripeReady;
  const walletBlocked =
    isWalletPayment(paymentMethod) && totalCart > 0 && (walletBalance ?? 0) < totalCart;

  if (paymentStatus === 'succeeded') {
    const offlineMsg = !isOnlinePayment(paymentMethod) && !isWalletPayment(paymentMethod)
      ? ' Votre facture reste à régler selon la méthode choisie (voir Mes factures).'
      : '';
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
          Commande confirmée !
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Total {totalCart.toFixed(2)} DT — {getPaymentLabel(paymentMethod)}.{offlineMsg}
        </p>
        <button
          type="button"
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
    <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '28px' }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            margin: '0 0 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <Lock size={28} color="#27ae60" /> Paiement
        </h1>
        <p style={{ color: '#888', margin: 0 }}>
          Total :{' '}
          <strong style={{ color: '#e67e22', fontSize: '20px' }}>{totalCart.toFixed(2)} DT</strong>
          {promoDiscount > 0 && (
            <span style={{ marginLeft: 8, fontSize: 14, color: '#15803d' }}>
              (économie {promoDiscount.toFixed(2)} DT)
            </span>
          )}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={sectionStyle}
      >
        <h3 style={sectionTitleStyle}>
          <Truck size={18} color="#e67e22" /> Livraison
        </h3>
        <input
          type="text"
          placeholder="Adresse complète de livraison"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={inputFieldStyle}
          required
        />
        <input
          type="tel"
          placeholder="Téléphone de contact"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ ...inputFieldStyle, marginBottom: 0 }}
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={sectionStyle}
      >
        <h3 style={sectionTitleStyle}>🛍️ Résumé ({itemCount} article{itemCount > 1 ? 's' : ''})</h3>
        {cart.map((item) => (
          <div
            key={item._id || item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>{item.name}</span>
              <span style={{ color: '#888', marginLeft: '8px' }}>x{item.quantity}</span>
            </div>
            <span style={{ fontWeight: 700, color: '#27ae60' }}>
              {(item.price * item.quantity).toFixed(2)} DT
            </span>
          </div>
        ))}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e5e7eb' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={16} color="#e67e22" /> Code promo
          </h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Ex. CHAT10"
              style={{ ...inputFieldStyle, flex: 1, minWidth: 140, marginBottom: 0 }}
              disabled={!!promoApplied}
            />
            {promoApplied ? (
              <button type="button" onClick={clearPromo} style={cancelBtnStyle}>
                Retirer
              </button>
            ) : (
              <button
                type="button"
                onClick={applyPromoCode}
                disabled={promoLoading || !promoInput.trim()}
                style={{
                  ...confirmBtnStyle,
                  padding: '12px 20px',
                  opacity: promoLoading || !promoInput.trim() ? 0.6 : 1,
                }}
              >
                {promoLoading ? '…' : 'Appliquer'}
              </button>
            )}
          </div>
          {promoError && (
            <p style={{ margin: '8px 0 0', color: '#dc2626', fontSize: 13 }}>{promoError}</p>
          )}
          {promoApplied && (
            <p style={{ margin: '8px 0 0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
              ✓ {promoApplied.label || promoApplied.code} — −{promoDiscount.toFixed(2)} DT
            </p>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#6b7280', fontSize: 14 }}>
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} DT</span>
        </div>
        {promoDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: '#15803d', fontSize: 14 }}>
            <span>Réduction promo</span>
            <span>−{promoDiscount.toFixed(2)} DT</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 800,
            fontSize: '18px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '2px solid #e5e7eb',
          }}
        >
          <span>Total :</span>
          <span style={{ color: '#e67e22' }}>{totalCart.toFixed(2)} DT</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={sectionStyle}
      >
        <h3 style={sectionTitleStyle}>
          <CreditCard size={18} color="#e67e22" /> Méthode de paiement
        </h3>
        <PaymentMethodPicker
          value={paymentMethod}
          onChange={(id) => {
            setPaymentMethod(id);
            setPaymentNote('');
          }}
        />
        <div style={{ marginTop: '16px' }}>
          <PaymentMethodDetails
            method={paymentMethod}
            bankTransfer={bankTransfer}
            paymentNote={paymentNote}
            onPaymentNoteChange={setPaymentNote}
            stripeReady={stripeReady}
            stripeDemo={stripeDemo}
            walletBalance={walletBalance}
            onWalletBalanceChange={setWalletBalance}
            amountDue={totalCart}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
      >
        <button type="button" onClick={closeCheckout} style={cancelBtnStyle}>
          Annuler
        </button>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || !address || !phone || onlineBlocked || walletBlocked}
          style={{
            ...confirmBtnStyle,
            background: loading || onlineBlocked || walletBlocked ? '#9ca3af' : confirmBtnStyle.background,
            cursor: loading || onlineBlocked ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Traitement…' : `✅ Confirmer (${totalCart.toFixed(2)} DT)`}
        </button>
      </motion.div>
    </div>
  );
};

const CheckoutPage = (props) => (
  <Elements stripe={getStripePromise()}>
    <CheckoutForm {...props} />
  </Elements>
);

const sectionStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '18px',
  marginBottom: '20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const sectionTitleStyle = {
  margin: '0 0 16px',
  fontSize: '16px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const inputFieldStyle = {
  width: '100%',
  padding: '14px 16px',
  marginBottom: '12px',
  borderRadius: '12px',
  border: '2px solid #e5e7eb',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

const cancelBtnStyle = {
  padding: '14px 28px',
  background: '#f3f4f6',
  color: '#555',
  border: 'none',
  borderRadius: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '15px',
};

const confirmBtnStyle = {
  padding: '14px 32px',
  background: 'linear-gradient(135deg, #e67e22, #d35400)',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  fontWeight: 700,
  fontSize: '15px',
  boxShadow: '0 8px 20px rgba(230,126,34,0.3)',
};

export default CheckoutPage;
