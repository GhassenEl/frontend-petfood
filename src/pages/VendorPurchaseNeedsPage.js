import React, { useCallback, useEffect, useState } from 'react';
import { Megaphone, Send, Search } from 'lucide-react';
import {
  listPurchaseNeeds,
  respondToPurchaseNeed,
} from '../services/purchaseNeedService';
import { logActivity } from '../services/activityLogService';
import './VendorPages.css';

const CATEGORIES = {
  food: 'Alimentation',
  accessories: 'Accessoires',
  health: 'Santé',
  grooming: 'Toilettage',
  other: 'Autre',
};

const VendorPurchaseNeedsPage = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [replyModal, setReplyModal] = useState(null);
  const [replyForm, setReplyForm] = useState({ message: '', proposedPrice: '', productUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'open' };
      if (searchQ.trim()) params.q = searchQ.trim();
      const data = await listPurchaseNeeds(params);
      setNeeds(data || []);
    } catch {
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  }, [searchQ]);

  useEffect(() => { load(); }, [load]);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyModal) return;
    setSubmitting(true);
    try {
      await respondToPurchaseNeed(replyModal.id, {
        message: replyForm.message,
        proposedPrice: replyForm.proposedPrice ? Number(replyForm.proposedPrice) : null,
        productUrl: replyForm.productUrl || null,
      });
      logActivity({
        actorRole: 'vendor',
        action: 'respond_purchase_need',
        target: replyModal.title,
        module: 'vendor',
      });
      setReplyModal(null);
      setReplyForm({ message: '', proposedPrice: '', productUrl: '' });
      load();
      window.alert('Votre proposition a été envoyée au client.');
    } catch (err) {
      window.alert(err.response?.data?.error || 'Envoi impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><Megaphone size={24} /> Besoins d&apos;achat clients</h1>
        <p>Consultez les demandes publiées et proposez vos produits en réponse.</p>
      </header>

      <div className="vnd-card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Rechercher une annonce…"
          style={{ flex: 1, minWidth: 200, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
        />
        <button type="button" className="vnd-btn" onClick={load}><Search size={16} /> Actualiser</button>
      </div>

      {loading ? (
        <p className="vnd-empty">Chargement…</p>
      ) : needs.length === 0 ? (
        <p className="vnd-empty">Aucun besoin d&apos;achat ouvert pour le moment.</p>
      ) : (
        needs.map((need) => (
          <div key={need.id} className="vnd-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>{need.title}</strong>
              <span style={{ fontSize: 13, color: '#64748b' }}>{CATEGORIES[need.category] || need.category}</span>
            </div>
            <p style={{ margin: '8px 0', color: '#475569' }}>{need.description}</p>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              {need.client?.name && <span>Client : {need.client.name} · </span>}
              {need.region && <span>{need.region} · </span>}
              {(need.budgetMin || need.budgetMax) && (
                <span>Budget {need.budgetMin || '—'}–{need.budgetMax || '—'} DT · </span>
              )}
              {need.responseCount} réponse(s)
            </div>
            <button
              type="button"
              className="vnd-btn vnd-btn--primary"
              onClick={() => setReplyModal(need)}
            >
              <Send size={16} /> Proposer une offre
            </button>
          </div>
        ))
      )}

      {replyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setReplyModal(null)}>
          <form onSubmit={submitReply} className="vnd-card" style={{ maxWidth: 480, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Répondre — {replyModal.title}</h2>
            <label style={{ display: 'block', marginBottom: 12 }}>
              Message *
              <textarea required minLength={5} rows={4} value={replyForm.message} onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })} placeholder="Décrivez le produit, disponibilité, délai…" style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              Prix proposé (DT)
              <input type="number" min="0" value={replyForm.proposedPrice} onChange={(e) => setReplyForm({ ...replyForm, proposedPrice: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label style={{ display: 'block', marginBottom: 16 }}>
              Lien produit (optionnel)
              <input value={replyForm.productUrl} onChange={(e) => setReplyForm({ ...replyForm, productUrl: e.target.value })} placeholder="/client-products ou URL" style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={submitting} className="vnd-btn vnd-btn--primary">{submitting ? 'Envoi…' : 'Envoyer'}</button>
              <button type="button" className="vnd-btn" onClick={() => setReplyModal(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendorPurchaseNeedsPage;
