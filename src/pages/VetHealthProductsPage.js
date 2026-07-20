import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Handshake } from 'lucide-react';
import {
  fetchHealthSubtypes,
  fetchPartnerVendors,
  fetchVetHealthCollaborations,
  publishHealthProduct,
} from '../services/vetHealthProductsService';
import { formatDT } from '../utils/formatCurrency';
import './VetPages.css';

const emptyForm = () => ({
  name: '',
  healthSubtype: 'antiparasitaire',
  vendorId: '',
  price: '',
  stock: '20',
  animalType: 'dog',
  description: '',
  collaborationNote: '',
  imageUrl: '',
});

const statusLabel = (s) => {
  if (s === 'approved') return { text: 'Publié (vendeur OK)', color: '#059669' };
  if (s === 'rejected') return { text: 'Refusé par vendeur', color: '#dc2626' };
  if (s === 'pending_vendor') return { text: 'En attente vendeur', color: '#d97706' };
  return { text: s || '—', color: '#64748b' };
};

const VetHealthProductsPage = () => {
  const [subtypes, setSubtypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [st, vd, list] = await Promise.all([
      fetchHealthSubtypes(),
      fetchPartnerVendors(),
      fetchVetHealthCollaborations(),
    ]);
    setSubtypes(st);
    setVendors(vd);
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    try {
      await publishHealthProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setMsg('Produit de santé proposé au vendeur. Il doit valider pour publication.');
      setForm(emptyForm());
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Publication impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vet-page" style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Handshake size={26} color="#059669" /> Produits de santé — collab vendeurs
        </h1>
        <p style={{ margin: '8px 0 0', color: '#64748b', maxWidth: 640 }}>
          Publiez avec un vendeur partenaire : antiparasitaires, vermifuges, vitamines, soins dentaires,
          désinfectants, lingettes et nettoyants oreilles/yeux. Le vendeur valide avant mise en boutique.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="vet-btn vet-btn--primary"
            onClick={() => setShowForm((v) => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: '#059669', color: 'white', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Nouveau produit santé
          </button>
          <button
            type="button"
            onClick={load}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
              background: 'white', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
          <Link to="/vet/pharmacy" style={{ alignSelf: 'center', color: '#0369a1', fontWeight: 700 }}>
            → Pharmacie clinique
          </Link>
        </div>
      </header>

      {msg && (
        <div style={{ padding: 12, borderRadius: 10, background: '#ecfdf5', color: '#047857', marginBottom: 14, fontWeight: 600 }}>
          {msg}
        </div>
      )}
      {error && (
        <div style={{ padding: 12, borderRadius: 10, background: '#fef2f2', color: '#b91c1c', marginBottom: 14, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={onSubmit}
          style={{
            background: 'white', padding: 20, borderRadius: 14,
            border: '1px solid #e2e8f0', marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Publier avec un vendeur</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Nom *
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Vermifuge chat comprimés"
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </label>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Type santé *
              <select
                required
                value={form.healthSubtype}
                onChange={(e) => setForm((f) => ({ ...f, healthSubtype: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              >
                {subtypes.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Vendeur partenaire *
              <select
                required
                value={form.vendorId}
                onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              >
                <option value="">— Choisir —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.shopName}{v.region ? ` (${v.region})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Espèce
              <select
                value={form.animalType}
                onChange={(e) => setForm((f) => ({ ...f, animalType: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              >
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="bird">Oiseau</option>
                <option value="rabbit">Lapin / NAC</option>
                <option value="other">Multi / autre</option>
              </select>
            </label>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Prix (TND) *
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </label>
            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Stock initial
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </label>
          </div>
          <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginTop: 12 }}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </label>
          <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginTop: 12 }}>
            Note collaboration (vendeur)
            <input
              value={form.collaborationNote}
              onChange={(e) => setForm((f) => ({ ...f, collaborationNote: e.target.value }))}
              placeholder="Ex: Stock pharmacie partenaire Tunis, lot à valider"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </label>
          {!vendors.length && (
            <p style={{ color: '#b45309', fontSize: 13, marginTop: 12 }}>
              Aucun vendeur actif. Un admin doit d’abord approuver une boutique marketplace.
            </p>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={busy || !vendors.length}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#059669', color: 'white', fontWeight: 800, cursor: 'pointer',
                opacity: busy || !vendors.length ? 0.6 : 1,
              }}
            >
              {busy ? 'Publication…' : 'Proposer au vendeur'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <section style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 800 }}>
          Collaborations ({items.length})
        </div>
        {loading ? (
          <p style={{ padding: 20, color: '#94a3b8' }}>Chargement…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: 20, color: '#94a3b8' }}>
            Aucune publication encore. Créez un produit de santé avec un vendeur partenaire.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Produit</th>
                  <th style={{ padding: 12 }}>Type</th>
                  <th style={{ padding: 12 }}>Vendeur</th>
                  <th style={{ padding: 12 }}>Prix</th>
                  <th style={{ padding: 12 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const st = statusLabel(it.moderationStatus);
                  const subtypeLabel = subtypes.find((s) => s.id === it.healthSubtype)?.label || it.healthSubtype;
                  return (
                    <tr key={it.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 12, fontWeight: 700 }}>{it.product?.name || '—'}</td>
                      <td style={{ padding: 12 }}>{subtypeLabel}</td>
                      <td style={{ padding: 12 }}>{it.vendor?.shopName || '—'}</td>
                      <td style={{ padding: 12 }}>{formatDT(it.price ?? it.product?.price)}</td>
                      <td style={{ padding: 12, color: st.color, fontWeight: 700 }}>{st.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default VetHealthProductsPage;
