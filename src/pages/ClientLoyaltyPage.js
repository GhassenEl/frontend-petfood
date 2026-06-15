import React, { useEffect, useState } from 'react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getLoyaltyAccount, getPersonalizedOffers } from '../services/loyaltyService';
import { DEMO_LOYALTY, DEMO_LOYALTY_OFFERS } from '../utils/clientDemoData';
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

  const load = async () => {
    setLoading(true);
    try {
      const [acc, off] = await Promise.all([getLoyaltyAccount(), getPersonalizedOffers()]);
      setAccount(acc?.points != null ? acc : DEMO_LOYALTY);
      setOffers(off?.products?.length ? off : DEMO_LOYALTY_OFFERS);
    } catch (err) {
      setAccount(DEMO_LOYALTY);
      setOffers(DEMO_LOYALTY_OFFERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  usePlatformRefresh(load);

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Chargement…</div>;

  const points = account?.points ?? offers?.points ?? 0;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: 24, background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>🎁 Fidélité PetfoodTN</h1>
        <p style={{ margin: 0, color: '#92400e' }}>
          1 point = 1 DT dépensé (commande livrée). Cumulez des points à chaque achat.
        </p>
        <div style={{ marginTop: 20, fontSize: 42, fontWeight: 900, color: '#b45309' }}>{points} pts</div>
      </div>

      {(offers?.products || []).length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} /> Produits en solde
          </h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {offers.products.map((p) => {
              const id = p.id || p._id;
              const discount = getEffectiveDiscount(p);
              return (
                <Link key={id} to="/client-products" style={{ ...card, textDecoration: 'none', color: 'inherit' }}>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <p style={{ margin: '6px 0 0', color: '#059669', fontWeight: 800 }}>
                    {getPromoPrice(p).toFixed(2)} DT
                    {discount > 0 && (
                      <span style={{ color: '#ef4444', marginLeft: 6, fontSize: 12 }}>-{discount}%</span>
                    )}
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

export default ClientLoyaltyPage;
