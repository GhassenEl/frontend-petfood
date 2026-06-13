import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { fetchProductPacks } from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';

const CART_KEY = 'petfood_cart';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
};

const addPackToCart = (pack) => {
  const existing = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const merged = [...existing];
  for (const it of pack.items || []) {
    const idx = merged.findIndex((x) => x.id === it.productId || x.productId === it.productId);
    const row = {
      id: it.productId,
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity || 1,
      imageUrl: it.imageUrl,
    };
    if (idx >= 0) merged[idx].quantity = Number(merged[idx].quantity || 1) + row.quantity;
    else merged.push(row);
    window.dispatchEvent(new CustomEvent('addToCart', { detail: row }));
  }
  localStorage.setItem(CART_KEY, JSON.stringify(merged));
};

const ClientProductPacksPage = () => {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchProductPacks({ petId: petId || undefined, activityLevel });
      setData(d);
      setMsg('');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur chargement des packs');
    } finally {
      setLoading(false);
    }
  }, [petId, activityLevel]);

  useEffect(() => {
    api.get('/pets').then((r) => {
      const list = r.data || [];
      setPets(list);
      if (!petId && list[0]?.id) setPetId(list[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const suggested = data?.suggestedPackType;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontWeight: 800 }}>
        <Package size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Packs automatiques
      </h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Packs générés selon le profil de votre animal : chiot, chaton, senior ou sportif (-8 % sur le bundle).
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        {pets.length > 0 && (
          <select value={petId} onChange={(e) => setPetId(e.target.value)} style={{ padding: 10, borderRadius: 8 }}>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        )}
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          style={{ padding: 10, borderRadius: 8 }}
          title="Niveau d'activité (pour pack sportif)"
        >
          <option value="low">Activité faible</option>
          <option value="moderate">Activité normale</option>
          <option value="high">Très actif / sport</option>
        </select>
        {data?.pet && (
          <span style={{ fontSize: 14, color: '#475569' }}>
            {data.pet.name} — {data.pet.ageYears != null ? `${data.pet.ageYears} an(s)` : 'âge non renseigné'}
          </span>
        )}
      </div>

      {msg && <p style={{ color: '#b91c1c' }}>{msg}</p>}
      {loading && <p style={{ color: '#94a3b8' }}>Génération des packs…</p>}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {(data?.packs || []).map((pack) => (
          <article
            key={pack.packType}
            style={{
              ...card,
              border: pack.isSuggested ? '2px solid #0d9488' : '1px solid #e2e8f0',
              position: 'relative',
            }}
          >
            {pack.isSuggested && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  background: '#ccfbf1',
                  color: '#0f766e',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                <Sparkles size={12} style={{ verticalAlign: 'middle' }} /> Recommandé
              </span>
            )}
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>
              {pack.icon} {pack.label}
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>{pack.description}</p>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13 }}>
              {(pack.items || []).map((it) => (
                <li key={it.productId} style={{ marginBottom: 4 }}>
                  {it.name} × {it.quantity} — {formatDT(it.price)}
                </li>
              ))}
            </ul>
            <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
              Total pack : {formatDT(pack.totalPrice)}
              <span style={{ fontSize: 12, color: '#16a34a', marginLeft: 8 }}>
                (-{pack.savingsPercent}% économie)
              </span>
            </p>
            {pack.tips?.[0] && (
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', fontStyle: 'italic' }}>
                {pack.tips[0]}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                addPackToCart(pack);
                setMsg(`Pack « ${pack.label} » ajouté au panier`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#0d9488',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ShoppingCart size={16} /> Ajouter le pack au panier
            </button>
          </article>
        ))}
      </div>

      {!loading && suggested && (
        <p style={{ marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Pack suggéré pour votre animal : <strong>{suggested}</strong>
        </p>
      )}

      <p style={{ marginTop: 24 }}>
        <Link to="/client-ecosystem">← Écosystème IA</Link>
        {' · '}
        <Link to="/checkout">Voir le panier</Link>
      </p>
    </div>
  );
};

export default ClientProductPacksPage;
