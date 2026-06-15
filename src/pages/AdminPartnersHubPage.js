import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Handshake, Heart, MapPin, Package, Plus, RefreshCw, Store, Stethoscope, Truck,
} from 'lucide-react';
import {
  fetchPartnersOverview,
  createSupplySupplier,
  updateSupplySupplier,
  upsertShelter,
  upsertRelayPoint,
} from '../services/adminPartnersService';
import { DEMO_PARTNERS_OVERVIEW } from '../utils/adminDemoData';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Handshake },
  { id: 'suppliers', label: 'Fournisseurs B2B', icon: Truck },
  { id: 'partnerships', label: 'Partenariats', icon: Heart },
];

const CATEGORY_LABELS = {
  alimentation: 'Alimentation',
  pharmacie: 'Pharmacie',
  accessoires: 'Accessoires',
  hygiene: 'Hygiène',
  autre: 'Autre',
};

const RELAY_TYPES = {
  pet_shop: 'Animalerie',
  vet_clinic: 'Clinique vétérinaire',
  pharmacy: 'Pharmacie',
  other: 'Autre',
};

const emptySupplier = {
  name: '',
  category: 'alimentation',
  contactName: '',
  email: '',
  phone: '',
  region: 'Tunis',
  leadTimeDays: 5,
  minOrderDt: 100,
  contractRef: '',
  notes: '',
};

const emptyShelter = { name: '', region: 'Tunis', phone: '', email: '' };
const emptyRelay = { name: '', type: 'pet_shop', region: 'Tunis', city: '', address: '' };

const Kpi = ({ icon: Icon, label, value, color = '#0f172a' }) => (
  <div style={{ ...card, borderTop: `3px solid ${color}`, textAlign: 'center' }}>
    <Icon size={22} color={color} style={{ marginBottom: 8 }} />
    <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{label}</div>
  </div>
);

const AdminPartnersHubPage = () => {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [shelterForm, setShelterForm] = useState(emptyShelter);
  const [showRelayModal, setShowRelayModal] = useState(false);
  const [relayForm, setRelayForm] = useState(emptyRelay);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const overview = await fetchPartnersOverview();
      setData(overview?.counts ? overview : DEMO_PARTNERS_OVERVIEW);
    } catch {
      setData(DEMO_PARTNERS_OVERVIEW);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const d = data || DEMO_PARTNERS_OVERVIEW;
  const isDemo = d.mode === 'demo';

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      if (isDemo) {
        setMsg('Mode démo : fournisseur simulé ajouté localement.');
        setData((prev) => ({
          ...prev,
          supplySuppliers: [
            ...(prev.supplySuppliers || []),
            { ...supplierForm, id: `sup-demo-${Date.now()}`, rating: 4, isActive: true },
          ],
          counts: { ...prev.counts, supplySuppliers: (prev.counts?.supplySuppliers || 0) + 1 },
        }));
      } else {
        await createSupplySupplier(supplierForm);
        await load();
        setMsg('Fournisseur créé avec succès.');
      }
      setShowSupplierModal(false);
      setSupplierForm(emptySupplier);
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSupplier = async (row) => {
    if (isDemo) {
      setData((prev) => ({
        ...prev,
        supplySuppliers: prev.supplySuppliers.map((s) =>
          s.id === row.id ? { ...s, isActive: !s.isActive } : s,
        ),
      }));
      return;
    }
    try {
      await updateSupplySupplier(row.id, { isActive: !row.isActive });
      await load();
    } catch {
      setMsg('Impossible de mettre à jour le fournisseur.');
    }
  };

  const handleShelter = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isDemo) {
        setData((prev) => ({
          ...prev,
          shelters: [...(prev.shelters || []), { ...shelterForm, id: `sh-${Date.now()}`, animalsCount: 0, isActive: true }],
          counts: { ...prev.counts, shelters: (prev.counts?.shelters || 0) + 1 },
        }));
      } else {
        await upsertShelter(shelterForm);
        await load();
      }
      setShowShelterModal(false);
      setShelterForm(emptyShelter);
      setMsg('Refuge enregistré.');
    } catch {
      setMsg('Erreur enregistrement refuge.');
    } finally {
      setBusy(false);
    }
  };

  const handleRelay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isDemo) {
        setData((prev) => ({
          ...prev,
          relayPoints: [...(prev.relayPoints || []), { ...relayForm, id: `relay-${Date.now()}`, isActive: true }],
          counts: { ...prev.counts, relayPoints: (prev.counts?.relayPoints || 0) + 1 },
        }));
      } else {
        await upsertRelayPoint(relayForm);
        await load();
      }
      setShowRelayModal(false);
      setRelayForm(emptyRelay);
      setMsg('Point relais enregistré.');
    } catch {
      setMsg('Erreur enregistrement point relais.');
    } finally {
      setBusy(false);
    }
  };

  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
  const thStyle = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 700 };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9' };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement des partenaires…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{
        ...card,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #0f766e, #115e59)',
        color: '#fff',
        border: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Handshake size={28} /> Fournisseurs & partenariats
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
              Grossistes B2B, marketplace vendeurs, refuges, points relais, vétérinaires et pet care — hub unifié.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDemo && <DemoModePill />}
            <Link
              to="/admin/vendors"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              <Store size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Marketplace vendeurs
            </Link>
            <button
              type="button"
              onClick={load}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
      </header>

      {msg && (
        <div style={{ ...card, marginBottom: 16, background: '#ecfdf5', borderColor: '#6ee7b7', color: '#065f46' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: tab === id ? '2px solid #0f766e' : '1px solid #e2e8f0',
              background: tab === id ? '#f0fdfa' : '#fff',
              color: tab === id ? '#0f766e' : '#475569',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
            <Kpi icon={Truck} label="Fournisseurs B2B" value={d.counts?.supplySuppliers ?? 0} color="#0f766e" />
            <Kpi icon={Store} label="Vendeurs marketplace" value={d.counts?.marketplaceVendors ?? 0} color="#2563eb" />
            <Kpi icon={Heart} label="Refuges" value={d.counts?.shelters ?? 0} color="#db2777" />
            <Kpi icon={MapPin} label="Points relais" value={d.counts?.relayPoints ?? 0} color="#7c3aed" />
            <Kpi icon={Stethoscope} label="Vétérinaires" value={d.counts?.vetPartners ?? 0} color="#059669" />
            <Kpi icon={Building2} label="Pet care" value={d.counts?.petCareProviders ?? 0} color="#d97706" />
            <Kpi icon={Package} label="Candidatures en attente" value={d.counts?.pendingApplications ?? 0} color="#dc2626" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Top fournisseurs B2B</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Région</th>
                    <th style={thStyle}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.supplySuppliers || []).slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td style={tdStyle}>{s.name}</td>
                      <td style={tdStyle}>{s.region}</td>
                      <td style={tdStyle}>{s.rating ? `${s.rating}/5` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Partenaires vétérinaires</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Clinique</th>
                    <th style={thStyle}>Région</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.vetPartners || []).slice(0, 5).map((v) => (
                    <tr key={v.id}>
                      <td style={tdStyle}>{v.name}</td>
                      <td style={tdStyle}>{v.clinic || v.address || '—'}</td>
                      <td style={tdStyle}>{v.region || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link to="/admin/vets" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#0f766e', fontWeight: 700 }}>
                Gérer les vétérinaires →
              </Link>
            </div>
          </div>
        </>
      )}

      {tab === 'suppliers' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Fournisseurs grossistes (B2B)</h2>
            <button
              type="button"
              onClick={() => setShowSupplierModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#0f766e',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Nouveau fournisseur
            </button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Région</th>
                <th style={thStyle}>Délai (j)</th>
                <th style={thStyle}>Min. commande</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(d.supplySuppliers || []).map((s) => (
                <tr key={s.id}>
                  <td style={tdStyle}><strong>{s.name}</strong></td>
                  <td style={tdStyle}>{CATEGORY_LABELS[s.category] || s.category}</td>
                  <td style={tdStyle}>{s.contactName || s.email || '—'}</td>
                  <td style={tdStyle}>{s.region}</td>
                  <td style={tdStyle}>{s.leadTimeDays ?? '—'}</td>
                  <td style={tdStyle}>{s.minOrderDt ? `${s.minOrderDt} DT` : '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: s.isActive !== false ? '#dcfce7' : '#fee2e2',
                      color: s.isActive !== false ? '#166534' : '#991b1b',
                    }}
                    >
                      {s.isActive !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => toggleSupplier(s)}
                      style={{ fontSize: 12, color: '#0f766e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      {s.isActive !== false ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'partnerships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Refuges & associations</h3>
              <button type="button" onClick={() => setShowShelterModal(true)} style={{ background: '#db2777', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} style={{ verticalAlign: 'middle' }} /> Ajouter
              </button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Région</th>
                  <th style={thStyle}>Animaux</th>
                  <th style={thStyle}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(d.shelters || []).map((s) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.region}</td>
                    <td style={tdStyle}>{s.animalsCount ?? 0}</td>
                    <td style={tdStyle}>{s.isActive !== false ? 'Actif' : 'Inactif'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Points relais partenaires</h3>
              <button type="button" onClick={() => setShowRelayModal(true)} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} style={{ verticalAlign: 'middle' }} /> Ajouter
              </button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Région</th>
                  <th style={thStyle}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(d.relayPoints || []).map((r) => (
                  <tr key={r.id}>
                    <td style={tdStyle}>{r.name}</td>
                    <td style={tdStyle}>{RELAY_TYPES[r.type] || r.type}</td>
                    <td style={tdStyle}>{r.region || r.city}</td>
                    <td style={tdStyle}>{r.isActive !== false ? 'Actif' : 'Inactif'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stethoscope size={18} color="#059669" /> Vétérinaires partenaires
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {(d.vetPartners || []).map((v) => (
                  <li key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <strong>{v.name}</strong>
                    <span style={{ color: '#64748b', display: 'block' }}>{v.clinic || v.address} — {v.region}</span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/vets" style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>Voir tout →</Link>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="#d97706" /> Pet care (toilettage, promenade…)
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {(d.petCareProviders || []).map((p) => (
                  <li key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <strong>{p.displayName}</strong>
                    <span style={{ color: '#64748b', display: 'block' }}>
                      {p.types} — {p.region}
                      {p.certified ? ' · Certifié' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleCreateSupplier} style={{ ...card, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px' }}>Nouveau fournisseur B2B</h3>
            {['name', 'contactName', 'email', 'phone', 'region', 'contractRef'].map((field) => (
              <label key={field} style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                {field === 'name' ? 'Raison sociale' : field === 'contactName' ? 'Contact' : field === 'contractRef' ? 'Réf. contrat' : field.charAt(0).toUpperCase() + field.slice(1)}
                <input
                  required={field === 'name'}
                  value={supplierForm[field]}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </label>
            ))}
            <label style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              Catégorie
              <select
                value={supplierForm.category}
                onChange={(e) => setSupplierForm((f) => ({ ...f, category: e.target.value }))}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ flex: 1, fontSize: 13 }}>
                Délai (jours)
                <input type="number" min={1} value={supplierForm.leadTimeDays} onChange={(e) => setSupplierForm((f) => ({ ...f, leadTimeDays: Number(e.target.value) }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </label>
              <label style={{ flex: 1, fontSize: 13 }}>
                Min. commande (DT)
                <input type="number" min={0} value={supplierForm.minOrderDt} onChange={(e) => setSupplierForm((f) => ({ ...f, minOrderDt: Number(e.target.value) }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setShowSupplierModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" disabled={busy} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{busy ? '…' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      {showShelterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleShelter} style={{ ...card, width: '100%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 16px' }}>Nouveau refuge partenaire</h3>
            {['name', 'region', 'phone', 'email'].map((field) => (
              <label key={field} style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
                <input required={field === 'name'} value={shelterForm[field]} onChange={(e) => setShelterForm((f) => ({ ...f, [field]: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </label>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setShowShelterModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" disabled={busy} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#db2777', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {showRelayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleRelay} style={{ ...card, width: '100%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 16px' }}>Nouveau point relais</h3>
            <label style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              Nom
              <input required value={relayForm.name} onChange={(e) => setRelayForm((f) => ({ ...f, name: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </label>
            <label style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              Type
              <select value={relayForm.type} onChange={(e) => setRelayForm((f) => ({ ...f, type: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {Object.entries(RELAY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            {['region', 'city', 'address'].map((field) => (
              <label key={field} style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                {field === 'address' ? 'Adresse' : field.charAt(0).toUpperCase() + field.slice(1)}
                <input value={relayForm[field]} onChange={(e) => setRelayForm((f) => ({ ...f, [field]: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </label>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setShowRelayModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" disabled={busy} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPartnersHubPage;
