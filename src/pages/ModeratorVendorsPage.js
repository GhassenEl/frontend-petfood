import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Check, Shield, UserX, MessageCircle } from 'lucide-react';
import {
  fetchModeratorVendors,
  approveModeratorVendor,
  verifyModeratorVendor,
  suspendModeratorVendor,
} from '../services/moderatorService';
import { moderatorMessageUrl } from '../components/AdminMessageButton';
import { DEMO_ADMIN_REGIONS } from '../utils/adminDemoData';
import './ModeratorPages.css';

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Validé',
  suspended: 'Suspendu',
  active: 'Actif',
};

const ModeratorVendorsPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [regionFilter, setRegionFilter] = useState('all');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchModeratorVendors();
    setVendors(data.vendors || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const regions = useMemo(() => {
    const fromVendors = [...new Set(vendors.map((v) => v.region).filter(Boolean))];
    return fromVendors.length ? fromVendors : DEMO_ADMIN_REGIONS;
  }, [vendors]);

  const filtered = vendors.filter((v) => {
    if (regionFilter !== 'all' && v.region !== regionFilter) return false;
    if (tab === 'pending') return v.applicationStatus === 'pending';
    if (tab === 'active') return v.applicationStatus === 'approved' || v.status === 'active';
    if (tab === 'suspended') return v.applicationStatus === 'suspended' || v.status === 'suspended';
    return true;
  });

  const act = async (fn, id) => {
    await fn(id);
    setMsg('Action enregistrée.');
    load();
  };

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Store size={24} /> Gestion des vendeurs {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Valider les inscriptions, vérifier les informations commerciales et suspendre les vendeurs.</p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <div className="mod-tabs">
        <button type="button" className={`mod-tab${tab === 'pending' ? ' mod-tab--active' : ''}`} onClick={() => setTab('pending')}>
          Demandes ({vendors.filter((v) => v.applicationStatus === 'pending').length})
        </button>
        <button type="button" className={`mod-tab${tab === 'active' ? ' mod-tab--active' : ''}`} onClick={() => setTab('active')}>Actifs</button>
        <button type="button" className={`mod-tab${tab === 'suspended' ? ' mod-tab--active' : ''}`} onClick={() => setTab('suspended')}>Suspendus</button>
        <button type="button" className={`mod-tab${tab === 'all' ? ' mod-tab--active' : ''}`} onClick={() => setTab('all')}>Tous</button>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}
          aria-label="Filtrer par région"
        >
          <option value="all">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : filtered.length === 0 ? (
          <p className="mod-empty">Aucun vendeur dans cette catégorie.</p>
        ) : (
          <table className="mod-table">
            <thead>
              <tr><th>Boutique</th><th>Propriétaire</th><th>Infos commerciales</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.shopName}</strong><br />
                    <small style={{ color: '#94a3b8' }}>{v.region}</small>
                  </td>
                  <td>
                    {v.ownerName}<br />
                    <small style={{ color: '#94a3b8' }}>{v.ownerEmail}</small>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    SIRET/MF : {v.commercialInfo?.siret || '—'}<br />
                    {v.commercialInfo?.address}<br />
                    {v.commercialInfo?.verified ? '✅ Vérifié' : '⏳ Non vérifié'}
                  </td>
                  <td>
                    <span className={`mod-badge mod-badge--${v.applicationStatus || v.status}`}>
                      {STATUS_LABELS[v.applicationStatus] || STATUS_LABELS[v.status] || v.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {(v.userId || v.ownerId) && (
                      <button
                        type="button"
                        className="mod-btn mod-btn--ghost mod-btn--sm"
                        onClick={() => navigate(moderatorMessageUrl(v.userId || v.ownerId, 'vendor'))}
                        title="Message direct"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                    )}
                    {' '}
                    {v.applicationStatus === 'pending' && (
                      <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={() => act(approveModeratorVendor, v.id)}>
                        <Check size={14} /> Valider
                      </button>
                    )}
                    {v.commercialInfo && !v.commercialInfo.verified && v.applicationStatus !== 'pending' && (
                      <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => act(verifyModeratorVendor, v.id)}>
                        <Shield size={14} /> Vérifier
                      </button>
                    )}
                    {v.applicationStatus !== 'suspended' && v.status !== 'suspended' && v.applicationStatus !== 'pending' && (
                      <>
                        {' '}
                        <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={() => act(suspendModeratorVendor, v.id)}>
                          <UserX size={14} /> Suspendre
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ModeratorVendorsPage;
