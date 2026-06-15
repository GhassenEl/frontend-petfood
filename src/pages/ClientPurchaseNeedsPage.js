import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, PlusCircle, Search, MapPin, Package, CheckCircle2, XCircle, MessageSquare,
} from 'lucide-react';
import api from '../utils/api';
import { logActivity } from '../services/activityLogService';
import {
  listPurchaseNeeds,
  listMyPurchaseNeeds,
  createPurchaseNeed,
  updatePurchaseNeed,
  updatePurchaseNeedResponse,
} from '../services/purchaseNeedService';

const CATEGORIES = [
  { value: 'food', label: 'Alimentation' },
  { value: 'accessories', label: 'Accessoires' },
  { value: 'health', label: 'Santé & soins' },
  { value: 'grooming', label: 'Toilettage' },
  { value: 'other', label: 'Autre' },
];

const ANIMAL_OPTIONS = [
  { value: 'dog', label: '🐕 Chien' },
  { value: 'cat', label: '🐈 Chat' },
  { value: 'bird', label: '🐦 Oiseau' },
  { value: 'rabbit', label: '🐰 Lapin' },
  { value: 'other', label: '🐾 Autre' },
];

const URGENCY = [
  { value: 'low', label: 'Pas pressé' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Urgent' },
];

const emptyForm = {
  title: '',
  description: '',
  category: 'food',
  animalType: 'dog',
  petName: '',
  quantity: '',
  budgetMin: '',
  budgetMax: '',
  city: '',
  region: 'Grand Tunis',
  urgency: 'normal',
};

const panel = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e5e7eb',
  marginBottom: 16,
};

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  boxSizing: 'border-box',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: '#0d9488',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const btnOutline = {
  ...btnPrimary,
  background: 'white',
  color: '#0f766e',
  border: '1px solid #99f6e4',
};

const statusStyle = (status) => {
  if (status === 'open') return { bg: '#ecfdf5', color: '#047857', label: 'Ouverte' };
  if (status === 'fulfilled') return { bg: '#eff6ff', color: '#1d4ed8', label: 'Satisfaite' };
  return { bg: '#f1f5f9', color: '#475569', label: 'Fermée' };
};

const ClientPurchaseNeedsPage = () => {
  const [tab, setTab] = useState('browse');
  const [needs, setNeeds] = useState([]);
  const [mine, setMine] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadBrowse = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'open' };
      if (filterCategory !== 'all') params.category = filterCategory;
      if (searchQ.trim()) params.q = searchQ.trim();
      const data = await listPurchaseNeeds(params);
      setNeeds(data || []);
    } catch {
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQ]);

  const loadMine = useCallback(async () => {
    try {
      const data = await listMyPurchaseNeeds();
      setMine(data || []);
    } catch {
      setMine([]);
    }
  }, []);

  useEffect(() => {
    api.get('/pets').then((r) => setPets(r.data || [])).catch(() => setPets([]));
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    if (tab === 'browse') loadBrowse();
  }, [tab, loadBrowse]);

  const onPetSelect = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) {
      setForm((f) => ({ ...f, petName: '' }));
      return;
    }
    setForm((f) => ({
      ...f,
      petName: pet.name,
      animalType: pet.type || f.animalType,
    }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createPurchaseNeed({
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
      });
      logActivity({
        actorRole: 'client',
        action: 'publish_purchase_need',
        target: created.title,
        module: 'boutique',
      });
      setShowForm(false);
      setForm(emptyForm);
      await loadMine();
      setTab('mine');
      window.alert('Votre besoin d\'achat a été publié. Les vendeurs peuvent vous proposer des offres.');
    } catch (err) {
      window.alert(err.response?.data?.error || 'Publication impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const closeNeed = async (id) => {
    if (!window.confirm('Fermer cette annonce ?')) return;
    await updatePurchaseNeed(id, { status: 'closed' });
    loadMine();
    if (selected?.id === id) setSelected(null);
  };

  const handleResponseStatus = async (needId, responseId, status) => {
    await updatePurchaseNeedResponse(needId, responseId, status);
    const updated = await listMyPurchaseNeeds();
    setMine(updated);
    const found = updated.find((n) => n.id === needId);
    if (found) setSelected(found);
  };

  const openDetail = (need) => setSelected(need);

  const chip = (active) => ({
    padding: '8px 14px',
    borderRadius: 20,
    border: active ? '2px solid #0d9488' : '1px solid #e5e7eb',
    background: active ? '#f0fdfa' : 'white',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  });

  const renderCard = (need, showResponses = false) => {
    const st = statusStyle(need.status);
    return (
      <div key={need.id} style={{ ...panel, cursor: 'pointer' }} onClick={() => openDetail(need)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 16 }}>{need.title}</strong>
          <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            {st.label}
          </span>
        </div>
        <p style={{ margin: '8px 0', color: '#475569', fontSize: 14 }}>{need.description.slice(0, 160)}{need.description.length > 160 ? '…' : ''}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: '#64748b' }}>
          <span><Package size={12} style={{ verticalAlign: 'middle' }} /> {CATEGORIES.find((c) => c.value === need.category)?.label || need.category}</span>
          {need.region && <span><MapPin size={12} /> {need.region}</span>}
          {(need.budgetMin || need.budgetMax) && (
            <span>Budget : {need.budgetMin || '—'} – {need.budgetMax || '—'} DT</span>
          )}
          <span><MessageSquare size={12} /> {need.responseCount || 0} réponse(s)</span>
        </div>
        {showResponses && need.responses?.length > 0 && (
          <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }} onClick={(e) => e.stopPropagation()}>
            {need.responses.map((r) => (
              <div key={r.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <strong>{r.vendorName}</strong>
                {r.proposedPrice != null && <span style={{ marginLeft: 8, color: '#0d9488' }}>{r.proposedPrice} DT</span>}
                <p style={{ margin: '6px 0', fontSize: 14 }}>{r.message}</p>
                {need.status === 'open' && r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" style={{ ...btnPrimary, padding: '6px 12px', fontSize: 13 }} onClick={() => handleResponseStatus(need.id, r.id, 'accepted')}>
                      <CheckCircle2 size={14} /> Accepter
                    </button>
                    <button type="button" style={{ ...btnOutline, padding: '6px 12px', fontSize: 13 }} onClick={() => handleResponseStatus(need.id, r.id, 'rejected')}>
                      <XCircle size={14} /> Refuser
                    </button>
                  </div>
                )}
                {r.status !== 'pending' && (
                  <span style={{ fontSize: 12, color: r.status === 'accepted' ? '#047857' : '#94a3b8' }}>
                    {r.status === 'accepted' ? 'Offre acceptée' : 'Offre refusée'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 32px' }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: '#0f766e' }}>
          <Megaphone size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Besoins d&apos;achat
        </h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Publiez ce que vous cherchez pour votre animal — les vendeurs PetfoodTN vous proposeront des produits adaptés.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'browse', label: 'Annonces ouvertes' },
          { id: 'mine', label: 'Mes publications' },
        ].map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={chip(tab === t.id)}>
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => setShowForm(true)} style={btnPrimary}>
          <PlusCircle size={16} /> Publier un besoin
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitForm} style={panel}>
          <h3 style={{ marginTop: 0 }}>Nouvelle publication</h3>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Titre *
            <input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex. Croquettes sans céréales chiot 12 kg" style={{ ...input, marginTop: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Description détaillée *
            <textarea required minLength={10} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Marque souhaitée, contraintes (allergies), délai…" style={{ ...input, marginTop: 6, resize: 'vertical' }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <label>
              Catégorie
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...input, marginTop: 6 }}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label>
              Animal
              <select value={form.animalType} onChange={(e) => setForm({ ...form, animalType: e.target.value })} style={{ ...input, marginTop: 6 }}>
                {ANIMAL_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </label>
            <label>
              Compagnon (optionnel)
              <select value={form.petName} onChange={(e) => onPetSelect(e.target.value)} style={{ ...input, marginTop: 6 }}>
                <option value="">— Choisir —</option>
                {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Urgence
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} style={{ ...input, marginTop: 6 }}>
                {URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
            <label>Quantité<input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="1 sac, 2 boîtes…" style={{ ...input, marginTop: 6 }} /></label>
            <label>Budget min (DT)<input type="number" min="0" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} style={{ ...input, marginTop: 6 }} /></label>
            <label>Budget max (DT)<input type="number" min="0" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} style={{ ...input, marginTop: 6 }} /></label>
            <label>Région<input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={{ ...input, marginTop: 6 }} /></label>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" disabled={submitting} style={btnPrimary}>{submitting ? 'Publication…' : 'Publier'}</button>
            <button type="button" style={btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {tab === 'browse' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <button type="button" style={chip(filterCategory === 'all')} onClick={() => setFilterCategory('all')}>Toutes</button>
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" style={chip(filterCategory === c.value)} onClick={() => setFilterCategory(c.value)}>{c.label}</button>
            ))}
            <div style={{ flex: 1, minWidth: 200, display: 'flex', gap: 8 }}>
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher…" style={input} />
              <button type="button" onClick={loadBrowse} style={btnOutline}><Search size={16} /></button>
            </div>
          </div>
          {loading ? <p>Chargement…</p> : needs.length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucune annonce ouverte pour le moment. Soyez le premier à publier un besoin !</p>
          ) : needs.map((n) => renderCard(n))}
        </>
      )}

      {tab === 'mine' && (
        mine.length === 0 ? (
          <p style={{ color: '#64748b' }}>Vous n&apos;avez pas encore publié de besoin d&apos;achat.</p>
        ) : mine.map((n) => (
          <div key={n.id}>
            {renderCard(n, true)}
            {n.status === 'open' && (
              <button type="button" style={{ ...btnOutline, marginBottom: 16 }} onClick={() => closeNeed(n.id)}>Fermer l&apos;annonce</button>
            )}
          </div>
        ))
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setSelected(null)}>
          <div style={{ ...panel, maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
            <p>{selected.description}</p>
            <button type="button" style={btnOutline} onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPurchaseNeedsPage;
