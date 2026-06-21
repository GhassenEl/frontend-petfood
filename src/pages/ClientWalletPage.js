import React, { useEffect, useState } from 'react';
import { Wallet, Plus, CreditCard } from 'lucide-react';
import { getWallet, topUpWallet } from '../services/walletService';
import { getPaymentLabel } from '../constants/paymentMethods';
import './ClientWalletPage.css';

const DEMO_WALLET = {
  balance: 45.5,
  currency: 'DT',
  transactions: [
    { id: 't1', type: 'topup', amount: 50, method: 'stripe', date: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 't2', type: 'payment', amount: -32.4, method: 'wallet', date: new Date(Date.now() - 86400000 * 3).toISOString(), label: 'Commande #7821' },
    { id: 't3', type: 'topup', amount: 30, method: 'paypal', date: new Date(Date.now() - 86400000).toISOString() },
  ],
};

const ClientWalletPage = () => {
  const [wallet, setWallet] = useState(DEMO_WALLET);
  const [topUp, setTopUp] = useState(20);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getWallet()
      .then((data) => { if (data?.balance != null) setWallet(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTopUp = async (method) => {
    try {
      const res = await topUpWallet(topUp, method);
      setWallet((w) => ({
        ...w,
        balance: res?.balance ?? w.balance + topUp,
        transactions: [{ id: `t-${Date.now()}`, type: 'topup', amount: topUp, method, date: new Date().toISOString() }, ...(w.transactions || [])],
      }));
      setMsg(`+${topUp} DT crédités via ${getPaymentLabel(method)}`);
    } catch {
      setWallet((w) => ({
        ...w,
        balance: w.balance + topUp,
        transactions: [{ id: `t-${Date.now()}`, type: 'topup', amount: topUp, method, date: new Date().toISOString() }, ...(w.transactions || [])],
      }));
      setMsg(`+${topUp} DT crédités (mode démo)`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="cwallet-page"><p>Chargement…</p></div>;

  return (
    <div className="cwallet-page">
      <header className="cwallet-hero">
        <h1><Wallet size={28} /> Portefeuille électronique</h1>
        <p>Stripe, PayPal, carte bancaire et virement — solde utilisable au checkout.</p>
      </header>

      <div className="cwallet-balance">
        <span>Solde disponible</span>
        <strong>{wallet.balance?.toFixed(2)} {wallet.currency || 'DT'}</strong>
      </div>

      {msg && <p className="cwallet-msg">{msg}</p>}

      <section className="cwallet-topup">
        <h3><Plus size={16} /> Recharger</h3>
        <div className="cwallet-row">
          <input type="number" min={5} step={5} value={topUp} onChange={(e) => setTopUp(Number(e.target.value))} /> DT
        </div>
        <div className="cwallet-methods">
          {['stripe', 'paypal', 'card', 'transfer'].map((m) => (
            <button key={m} type="button" onClick={() => handleTopUp(m)}>
              <CreditCard size={14} /> {getPaymentLabel(m)}
            </button>
          ))}
        </div>
      </section>

      <section className="cwallet-history">
        <h3>Historique</h3>
        <ul>
          {(wallet.transactions || []).map((t) => (
            <li key={t.id}>
              <span>{t.type === 'topup' ? '➕' : '💳'}</span>
              <div>
                <strong>{t.label || (t.type === 'topup' ? 'Recharge' : 'Paiement')}</strong>
                <small>{getPaymentLabel(t.method)} · {new Date(t.date).toLocaleDateString('fr-FR')}</small>
              </div>
              <span className={t.amount > 0 ? 'cwallet-plus' : 'cwallet-minus'}>
                {t.amount > 0 ? '+' : ''}{t.amount} DT
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ClientWalletPage;
