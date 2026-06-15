import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Pause, Play, Plus } from 'lucide-react';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
} from '../services/ecosystemService';
import { getProducts } from '../services/productService';
import { DEMO_SUBSCRIPTIONS } from '../utils/clientDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ClientSubscriptionsPage = () => {
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: 1, frequencyDays: 30, petName: '' });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, prodList] = await Promise.all([
        fetchSubscriptions(),
        getProducts().catch(() => []),
      ]);
      const list = subRes?.subscriptions;
      setSubs(Array.isArray(list) && list.length ? list : DEMO_SUBSCRIPTIONS);
      setProducts(Array.isArray(prodList) ? prodList : []);
    } catch {
      setSubs(DEMO_SUBSCRIPTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const croquetteProducts = products.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return name.includes('croquette') || name.includes('pâtée') || cat.includes('aliment');
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      showToast('Choisissez un produit.');
      return;
    }
    setBusy(true);
    try {
      await createSubscription({
        productId: form.productId,
        quantity: Number(form.quantity) || 1,
        frequencyDays: Number(form.frequencyDays) || 30,
        petName: form.petName.trim() || undefined,
      });
      setShowForm(false);
      setForm({ productId: '', quantity: 1, frequencyDays: 30, petName: '' });
      showToast('Abonnement activé — livraison automatique programmée.');
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setBusy(false);
    }
  };

  const togglePause = async (sub) => {
    const next = sub.status === 'active' ? 'paused' : 'active';
    setBusy(true);
    try {
      await updateSubscription(sub.id, { status: next });
      showToast(next === 'paused' ? 'Abonnement mis en pause.' : 'Abonnement réactivé.');
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ ...card, marginBottom: 24, background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
          <RefreshCw size={26} /> Auto-réapprovisionnement
        </h1>
        <p style={{ margin: 0, color: '#0f766e', fontSize: 15 }}>
          Commandez automatiquement vos croquettes habituelles tous les 30 jours — −10 % sur chaque livraison.
        </p>
      </div>

      {toast && (
        <div style={{ ...card, marginBottom: 16, background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: '#0d9488',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nouvel abonnement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ ...card, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800 }}>Programmer un réappro</h2>
          <label style={labelStyle}>
            Produit
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              style={inputStyle}
              required
            >
              <option value="">— Choisir —</option>
              {(croquetteProducts.length ? croquetteProducts : products).slice(0, 30).map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name} — {Number(p.price || 0).toFixed(2)} DT
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              Quantité
              <input
                type="number"
                min={1}
                max={10}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Fréquence (jours)
              <select
                value={form.frequencyDays}
                onChange={(e) => setForm((f) => ({ ...f, frequencyDays: e.target.value }))}
                style={inputStyle}
              >
                <option value={14}>Tous les 14 jours</option>
                <option value={30}>Tous les 30 jours</option>
                <option value={45}>Tous les 45 jours</option>
                <option value={60}>Tous les 60 jours</option>
              </select>
            </label>
          </div>
          <label style={labelStyle}>
            Animal (optionnel)
            <input
              type="text"
              placeholder="Ex. Max"
              value={form.petName}
              onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={busy} style={btnPrimary}>Activer l&apos;abonnement</button>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button>
          </div>
        </form>
      )}

      {subs.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8' }}>
          Aucun abonnement actif.{' '}
          <Link to="/client-products" style={{ color: '#0d9488' }}>Parcourir la boutique</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {subs.map((s) => (
            <div key={s.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>
                    {s.product?.name || 'Produit'}
                  </h3>
                  <p style={{ margin: '0 0 4px', fontSize: 14, color: '#64748b' }}>
                    {s.quantity} × tous les {s.frequencyDays} jours
                    {s.petName ? ` · ${s.petName}` : ''}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: '#0d9488', fontWeight: 600 }}>
                    Prochaine livraison : {formatDate(s.nextDeliveryAt)}
                    {s.discountPercent ? ` · −${s.discountPercent} %` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: s.status === 'active' ? '#d1fae5' : '#fef3c7',
                    color: s.status === 'active' ? '#065f46' : '#92400e',
                  }}>
                    {s.status === 'active' ? 'Actif' : 'En pause'}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePause(s)}
                    disabled={busy}
                    style={btnIcon}
                    title={s.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                  >
                    {s.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 14, color: '#334155' };
const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontSize: 14,
  boxSizing: 'border-box',
};
const btnPrimary = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#0d9488',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};
const btnSecondary = {
  padding: '10px 18px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
const btnIcon = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

export default ClientSubscriptionsPage;
