import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, MapPin, PlusCircle, Tag, Heart, Eye, CheckCircle2, Copy, RefreshCw,
} from 'lucide-react';
import api from '../utils/api';
import { SPECIES_MAP } from '../utils/animalSpecies';
import {
  listFoundMeReports,
  listMyFoundMeReports,
  lookupFoundMeTag,
  createFoundMeReport,
  getFoundMeMatches,
  markFoundMeReunited,
} from '../services/foundMeService';

const ANIMAL_OPTIONS = [
  { value: 'dog', label: '🐕 Chien' },
  { value: 'cat', label: '🐈 Chat' },
  { value: 'bird', label: '🐦 Oiseau' },
  { value: 'rabbit', label: '🐰 Lapin' },
  { value: 'hamster', label: '🐹 Hamster' },
  { value: 'fish', label: '🐟 Poisson' },
  { value: 'other', label: '🐾 Autre' },
];

const emptyForm = {
  reportType: 'lost',
  petId: '',
  petName: '',
  animalType: 'dog',
  breed: '',
  color: '',
  distinctiveMarks: '',
  description: '',
  photoUrl: '',
  location: '',
  region: 'Grand Tunis',
  contactPhone: '',
  rewardOffered: '',
};

const typeBadge = (type) =>
  type === 'lost'
    ? { bg: '#fef2f2', color: '#b91c1c', label: 'Perdu' }
    : { bg: '#ecfdf5', color: '#047857', label: 'Trouvé' };

const FoundMePage = () => {
  const [tab, setTab] = useState('browse');
  const [reports, setReports] = useState([]);
  const [mine, setMine] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterAnimal, setFilterAnimal] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagResult, setTagResult] = useState(null);
  const [tagError, setTagError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [matches, setMatches] = useState([]);
  const [copied, setCopied] = useState('');

  const loadBrowse = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'active' };
      if (filterType !== 'all') params.type = filterType;
      if (filterAnimal !== 'all') params.animalType = filterAnimal;
      if (searchQ.trim()) params.q = searchQ.trim();
      const data = await listFoundMeReports(params);
      setReports(data || []);
    } catch (e) {
      console.error(e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterAnimal, searchQ]);

  const loadMine = useCallback(async () => {
    try {
      const data = await listMyFoundMeReports();
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

  const openCreate = (reportType) => {
    setForm({ ...emptyForm, reportType });
    setShowForm(true);
  };

  const onPetSelect = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) {
      setForm((f) => ({ ...f, petId: '' }));
      return;
    }
    setForm((f) => ({
      ...f,
      petId: pet.id,
      petName: pet.name,
      animalType: pet.type || f.animalType,
      breed: pet.breed || f.breed,
    }));
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createFoundMeReport({
        ...form,
        petId: form.petId || undefined,
      });
      setShowForm(false);
      setForm(emptyForm);
      await loadMine();
      await loadBrowse();
      setTab('mine');
      window.alert(`Signalement publié. Code Find Me : ${created.tagCode}`);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Publication impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const searchTag = async () => {
    setTagError('');
    setTagResult(null);
    const code = tagInput.trim().toUpperCase();
    if (!code) return;
    try {
      const data = await lookupFoundMeTag(code);
      setTagResult(data);
    } catch (err) {
      setTagError(err.response?.data?.error || 'Code introuvable');
    }
  };

  const openDetail = async (report) => {
    setSelected(report);
    setMatches([]);
    try {
      const data = await getFoundMeMatches(report.id);
      setMatches(data?.matches || []);
    } catch {
      setMatches([]);
    }
  };

  const reunite = async (report) => {
    if (!window.confirm('Marquer cet animal comme retrouvé / réuni ?')) return;
    try {
      await markFoundMeReunited(report.id);
      setSelected(null);
      loadBrowse();
      loadMine();
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur');
    }
  };

  const copyTag = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const list = tab === 'mine' ? mine : reports;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: 28,
          padding: '36px 24px',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #ecfdf5 100%)',
          borderRadius: 24,
          border: '1px solid #fecaca',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: '#9f1239' }}>
          🔍 Find Me
        </h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Signalez un animal perdu ou trouvé, recevez un code à mettre sur le collier, et laissez la communauté vous aider à le retrouver.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'browse', label: 'Alertes actives' },
          { id: 'mine', label: 'Mes signalements' },
          { id: 'tag', label: 'Recherche par code' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: tab === t.id ? '2px solid #e11d48' : '1px solid #e5e7eb',
              background: tab === t.id ? '#fff1f2' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => openCreate('lost')} style={btnPrimary}>
          <PlusCircle size={16} /> Animal perdu
        </button>
        <button type="button" onClick={() => openCreate('found')} style={{ ...btnPrimary, background: '#059669' }}>
          <PlusCircle size={16} /> Animal trouvé
        </button>
      </div>

      {tab === 'tag' && (
        <div style={panel}>
          <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={20} /> Code sur collier (Found Me)
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 0 }}>
            Saisissez le code imprimé sur la médaille (ex. FM-DEMO01).
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.toUpperCase())}
              placeholder="FM-XXXXXX"
              style={{ ...input, flex: 1, minWidth: 200 }}
            />
            <button type="button" onClick={searchTag} style={btnPrimary}>
              <Search size={16} /> Rechercher
            </button>
          </div>
          {tagError && <p style={{ color: '#dc2626', fontSize: 14 }}>{tagError}</p>}
          {tagResult && (
            <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
              <strong>{tagResult.petName}</strong> — {SPECIES_MAP[tagResult.animalType]?.label || tagResult.animalType}
              <span style={{ ...typeBadge(tagResult.reportType), marginLeft: 8, padding: '2px 8px', borderRadius: 8, fontSize: 12 }}>
                {typeBadge(tagResult.reportType).label}
              </span>
              <p style={{ margin: '8px 0', fontSize: 14 }}>{tagResult.location}</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>{tagResult.contactHint}</p>
              <button type="button" style={btnOutline} onClick={() => openDetail(tagResult)}>
                Voir la fiche complète
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'browse' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['all', 'lost', 'found'].map((f) => (
              <button key={f} type="button" onClick={() => setFilterType(f)} style={chip(filterType === f)}>
                {f === 'all' ? 'Tous' : f === 'lost' ? 'Perdus' : 'Trouvés'}
              </button>
            ))}
            {ANIMAL_OPTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setFilterAnimal(filterAnimal === a.value ? 'all' : a.value)}
                style={chip(filterAnimal === a.value)}
              >
                {a.label}
              </button>
            ))}
            <input
              type="search"
              placeholder="Nom, lieu, code…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ ...input, flex: 1, minWidth: 180 }}
            />
            <button type="button" onClick={loadBrowse} style={btnOutline} title="Actualiser">
              <RefreshCw size={16} />
            </button>
          </div>
        </>
      )}

      {tab !== 'tag' && (
        <>
          {loading && tab === 'browse' ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
          ) : list.length === 0 ? (
            <div style={panel}>
              <p style={{ margin: 0, color: '#64748b' }}>Aucun signalement pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {list.map((r) => {
                const b = typeBadge(r.reportType);
                return (
                  <motion.div
                    key={r.id}
                    layout
                    style={{
                      background: 'white',
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                    }}
                  >
                    {r.photoUrl && (
                      <img src={r.photoUrl} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <strong style={{ fontSize: 17 }}>{r.petName}</strong>
                        <span style={{ background: b.bg, color: b.color, fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 8 }}>
                          {b.label}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0', fontSize: 13, color: '#64748b' }}>
                        {SPECIES_MAP[r.animalType]?.label || r.animalType}
                        {r.breed ? ` · ${r.breed}` : ''}
                      </p>
                      <p style={{ margin: '0 0 8px', fontSize: 13, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <MapPin size={14} /> {r.location}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <code style={{ fontSize: 12, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>{r.tagCode}</code>
                        <button type="button" onClick={() => copyTag(r.tagCode)} style={iconBtn} title="Copier">
                          {copied === r.tagCode ? <CheckCircle2 size={14} color="#059669" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <button type="button" onClick={() => openDetail(r)} style={{ ...btnOutline, width: '100%' }}>
                        <Eye size={14} /> Correspondances
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div style={overlay}>
          <div style={{ ...panel, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>
              {form.reportType === 'lost' ? '🆘 Signaler un animal perdu' : '✅ Signaler un animal trouvé'}
            </h2>
            <form onSubmit={submitReport}>
              {form.reportType === 'lost' && pets.length > 0 && (
                <label style={label}>
                  Lier à mon animal
                  <select value={form.petId} onChange={(e) => onPetSelect(e.target.value)} style={input}>
                    <option value="">— Manuel —</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </label>
              )}
              <label style={label}>
                Nom / description
                <input required value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} style={input} />
              </label>
              <label style={label}>
                Espèce
                <select value={form.animalType} onChange={(e) => setForm({ ...form, animalType: e.target.value })} style={input}>
                  {ANIMAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label style={label}>Race <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} style={input} /></label>
              <label style={label}>Couleur <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={input} /></label>
              <label style={label}>Signes distinctifs <input value={form.distinctiveMarks} onChange={(e) => setForm({ ...form, distinctiveMarks: e.target.value })} style={input} /></label>
              <label style={label}>
                Lieu {form.reportType === 'lost' ? 'vu pour la dernière fois' : 'où trouvé'}
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={input} />
              </label>
              <label style={label}>Détails <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...input, minHeight: 72 }} /></label>
              <label style={label}>Photo (URL) <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} style={input} /></label>
              <label style={label}>Téléphone contact <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} style={input} /></label>
              {form.reportType === 'lost' && (
                <label style={label}>Récompense (optionnel) <input value={form.rewardOffered} onChange={(e) => setForm({ ...form, rewardOffered: e.target.value })} style={input} /></label>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  Publier l&apos;alerte
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={btnOutline}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={{ ...panel, maxWidth: 480, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{selected.petName}</h2>
            <p style={{ fontSize: 14 }}>Code : <strong>{selected.tagCode}</strong></p>
            <p style={{ fontSize: 14, color: '#475569' }}>{selected.description}</p>
            {selected.reporter && (
              <p style={{ fontSize: 14 }}>
                <Heart size={14} style={{ verticalAlign: 'middle' }} /> Contact : {selected.reporter.phone || selected.reporter.email || selected.reporter.name}
              </p>
            )}
            <h4 style={{ marginBottom: 8 }}>Correspondances possibles</h4>
            {matches.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucune pour l&apos;instant — partagez le code {selected.tagCode}</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {matches.map((m) => (
                  <li key={m.report.id} style={{ padding: 10, background: '#f8fafc', borderRadius: 10, marginBottom: 8, fontSize: 13 }}>
                    <strong>{m.report.petName}</strong> ({typeBadge(m.report.reportType).label}) — score {m.score}%
                    <br />
                    {m.reasons.join(' · ')}
                    <br />
                    <span style={{ color: '#64748b' }}>{m.report.location}</span>
                  </li>
                ))}
              </ul>
            )}
            {selected.status === 'active' && (
              <button type="button" onClick={() => reunite(selected)} style={{ ...btnPrimary, marginTop: 12, width: '100%' }}>
                <CheckCircle2 size={16} /> Animal retrouvé
              </button>
            )}
            <button type="button" onClick={() => setSelected(null)} style={{ ...btnOutline, marginTop: 8, width: '100%' }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const chip = (active) => ({
  padding: '8px 14px',
  borderRadius: 20,
  border: active ? '2px solid #e11d48' : '1px solid #e5e7eb',
  background: active ? '#fff1f2' : 'white',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
});

const panel = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  border: '1px solid #e5e7eb',
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  marginTop: 6,
  boxSizing: 'border-box',
};

const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 };

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  background: '#e11d48',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14,
};

const btnOutline = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 16px',
  background: 'white',
  color: '#334155',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
};

const iconBtn = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: 4,
};

export default FoundMePage;
