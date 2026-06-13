import React, { useCallback, useEffect, useState } from 'react';
import { Store, Check, Shield, UserX } from 'lucide-react';
import {
  fetchModeratorVendors,
  approveModeratorVendor,
  verifyModeratorVendor,
  suspendModeratorVendor,
} from '../services/moderatorService';
import './ModeratorPages.css';

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Validé',
  suspended: 'Suspendu',
  active: 'Actif',
};

const ModeratorVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchModeratorVendors();
    setVendors(data.vendors || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vendors.filter((v) => {
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
