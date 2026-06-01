import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, Copy, Check } from 'lucide-react';
import {
  getLoyaltyAccount,
  redeemLoyaltyPoints,
  getPersonalizedOffers,
} from '../services/loyaltyService';
import { getPromoPrice, getEffectiveDiscount } from '../utils/productDetails';

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const ClientLoyaltyPage = () => {
  const [account, setAccount] = useState(null);
  const [offers, setOffers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState('');
  const [copied, setCopied] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [acc, off] = await Promise.all([getLoyaltyAccount(), getPersonalizedOffers()]);
      setAccount(acc);
      setOffers(off);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRedeem = async (tierId) => {
    setRedeeming(tierId);
    try {
      const voucher = await redeemLoyaltyPoints(tierId);
      window.alert(`Bon créé : ${voucher.code}\nUtilisez-le au checkout (valable 60 jours).`);
      load();
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Échange impossible');
    } finally {
      setRedeeming('');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Chargement…</div>;

  const points = account?.points ?? offers?.points ?? 0;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: 24, background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>🎁 Fidélité PetfoodTN</h1>
        <p style={{ margin: 0, color: '#92400e' }}>1 point = 1 DT dépensé (commande livrée). Échangez vos points contre des bons.</p>
        <div style={{ marginTop: 20, fontSize: 42, fontWeight: 900, color: '#b45309' }}>{points} pts</div>
        {account?.nextTier && (
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#78350f' }}>
            Plus que {account.nextTier.pointsCost - points} pts pour « {account.nextTier.label} »
          </p>
        )}
      </div>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Échanger mes points</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {(account?.tiers || []).map((tier) => (
            <div key={tier.id} style={card}>
              <Gift size={24} color="#e67e22" />
              <h3 style={{ margin: '10px 0 4px', fontSize: 16 }}>{tier.label}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{tier.pointsCost} points</p>
              <button
                type="button"
                disabled={points < tier.pointsCost || redeeming === tier.id}
                onClick={() => handleRedeem(tier.id)}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  cursor: points >= tier.pointsCost ? 'pointer' : 'not-allowed',
                  background: points >= tier.pointsCost ? '#e67e22' : '#e5e7eb',
                  color: points >= tier.pointsCost ? 'white' : '#9ca3af',
                }}
              >
                {redeeming === tier.id ? '…' : 'Échanger'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {(account?.vouchers?.length > 0 || offers?.vouchers?.length > 0) && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Mes bons d&apos;achat</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(account?.vouchers || offers?.vouchers || []).map((v) => (
              <div key={v.id || v.code} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <code style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{v.code}</code>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                    {v.discountType === 'fixed' ? `${v.discountValue} DT` : `${v.discountValue} %`} de réduction
                    {v.expiresAt && ` · expire ${new Date(v.expiresAt).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
                <button type="button" onClick={() => copyCode(v.code)} style={copyBtn}>
                  {copied === v.code ? <Check size={16} /> : <Copy size={16} />}
                  Copier
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} /> Offres pour vous
        </h2>
        {(offers?.promos || []).length === 0 ? (
          <div style={{ ...card, color: '#94a3b8' }}>Aucune promo active pour le moment.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {offers.promos.map((p) => (
              <div key={p.id || p.code} style={{ ...card, borderLeft: '4px solid #e67e22' }}>
                <strong>{p.code}</strong>
                {p.highlight && <p style={{ fontSize: 12, color: '#059669', margin: '4px 0' }}>{p.highlight}</p>}
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#374151' }}>
                  {p.discountType === 'fixed' ? `${p.discountValue} DT` : `${p.discountValue} %`} — {p.label || 'Promo'}
                </p>
                {p.minOrderAmount > 0 && (
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Min. {p.minOrderAmount} DT</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {(offers?.products || []).length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Produits recommandés (promos)</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {offers.products.map((p) => {
              const id = p.id || p._id;
              const discount = getEffectiveDiscount(p);
              return (
                <Link key={id} to="/client-products" style={{ ...card, textDecoration: 'none', color: 'inherit' }}>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <p style={{ margin: '6px 0 0', color: '#059669', fontWeight: 800 }}>
                    {getPromoPrice(p).toFixed(2)} DT
                    {discount > 0 && <span style={{ color: '#ef4444', marginLeft: 6, fontSize: 12 }}>-{discount}%</span>}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {account?.ledger?.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Historique points</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {account.ledger.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: 14,
                }}
              >
                <span>{row.reason}</span>
                <strong style={{ color: row.points >= 0 ? '#059669' : '#ef4444' }}>
                  {row.points >= 0 ? '+' : ''}{row.points}
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const copyBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  background: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
};

export default ClientLoyaltyPage;
