import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getWallet, topUpWallet } from '../services/walletService';
import { createStripeIntent, processPayPalPayment } from '../utils/onlinePayment';
import './ClientComplaintsPage.css';
import './ClientServicesPage.css';

const TOPUP_AMOUNTS = [20, 50, 100, 200];

const ClientWalletPage = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState(50);
  const [payMethod, setPayMethod] = useState('demo');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getWallet();
      setWallet(data);
    } catch {
      setWallet({ balance: 0, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTopUp = async () => {
    if (topUpAmount < 5) {
      showToast('Montant minimum : 5 DT', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (payMethod === 'stripe') {
        await createStripeIntent(topUpAmount);
      } else if (payMethod === 'paypal') {
        const result = await processPayPalPayment(topUpAmount);
        if (!result.ok) {
          showToast(result.error || 'PayPal échoué', 'error');
          return;
        }
      }
      await topUpWallet(topUpAmount, payMethod);
      await load();
      showToast(`${topUpAmount} DT ajoutés à votre portefeuille.`);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Recharge échouée', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cc-page cc-page--services">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--wallet">
        <h1>👛 Portefeuille électronique</h1>
        <p>
          Rechargez votre solde et payez vos réservations (toilettage, pension, dressage)
          en un clic. Utilisable aussi pour vos prochains achats.
        </p>
      </header>

      <div className="cc-wallet-balance">
        <span>Solde disponible</span>
        <strong>{loading ? '…' : `${(wallet.balance || 0).toFixed(2)} DT`}</strong>
      </div>

      <section className="cc-form-card">
        <h2>
          <Plus size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Recharger le portefeuille
        </h2>

        <div className="cc-categories" style={{ marginBottom: 16 }}>
          {TOPUP_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              className={`cc-cat-btn ${topUpAmount === amt ? 'active' : ''}`}
              onClick={() => setTopUpAmount(amt)}
            >
              {amt} DT
            </button>
          ))}
        </div>

        <div className="cc-field">
          <label>Montant personnalisé (DT)</label>
          <input
            type="number"
            min={5}
            max={500}
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(Number(e.target.value))}
          />
        </div>

        <div className="cc-field">
          <label>Mode de paiement</label>
          <div className="cc-pay-methods">
            {[
              { id: 'demo', label: 'Démo instantanée' },
              { id: 'stripe', label: 'Carte bancaire' },
              { id: 'paypal', label: 'PayPal' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`cc-pay-method ${payMethod === m.id ? 'active' : ''}`}
                onClick={() => setPayMethod(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="cc-submit services" onClick={handleTopUp} disabled={submitting}>
          <Wallet size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {submitting ? 'Recharge…' : `Recharger ${topUpAmount} DT`}
        </button>
      </section>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Historique</h2>
        <Link to="/client-services" style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
          Réserver un service →
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : !wallet.transactions?.length ? (
        <div className="cc-empty">
          <Wallet size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucune transaction.</p>
        </div>
      ) : (
        <div className="cc-tx-list">
          {wallet.transactions.map((tx) => (
            <div key={tx.id} className={`cc-tx-row ${tx.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {tx.type === 'credit' ? (
                  <ArrowUpCircle size={20} color="#16a34a" />
                ) : (
                  <ArrowDownCircle size={20} color="#dc2626" />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tx.reason}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(tx.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
              <strong>{tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} DT</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientWalletPage;
