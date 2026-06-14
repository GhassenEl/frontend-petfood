import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Percent, Package, Plus, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import {
  DEMO_ADMIN_REGIONS,
  DEMO_ADMIN_USERS,
  DEMO_ADMIN_VENDORS,
  DEMO_MARKETPLACE_STATS,
  withDemoFallback,
} from '../utils/adminDemoData';
import {
  fetchAdminMarketplaceStats,
  fetchAdminVendors,
  fetchMarketplace,
  registerVendor,
  updateAdminVendor,
} from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';
import { AdminMessageButton } from '../components/AdminMessageButton';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  shopName: '',
  region: 'Tunis',
};

const statusStyle = {
  active: { bg: '#dcfce7', color: '#166534', label: 'Actif' },
  pending: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  suspended: { bg: '#fee2e2', color: '#991b1b', label: 'Suspendu' },
};

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
};

const mergeVendorLists = (apiVendors, vendorUsers, marketplace) => {
  const fromApi = Array.isArray(apiVendors)
    ? apiVendors
    : apiVendors?.vendors || marketplace?.vendors || [];

  if (fromApi.length) return fromApi;

  const usersById = Object.fromEntries(
    vendorUsers.map((u) => [u._id || u.id, u]),
  );

  return DEMO_ADMIN_VENDORS.map((v) => {
    const user = v.userId ? usersById[v.userId] : null;
    return {
      ...v,
      ownerName: v.ownerName || user?.name || '—',
      ownerEmail: v.ownerEmail || user?.email || '—',
      status: user?.isActive === false ? 'suspended' : v.status,
    };
  });
};

const AdminVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [regions, setRegions] = useState(DEMO_ADMIN_REGIONS);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [vendorsRes, statsRes, marketplaceRes, usersRes, regionsRes] = await Promise.all([
        fetchAdminVendors().catch(() => null),
        fetchAdminMarketplaceStats().catch(() => null),
        fetchMarketplace().catch(() => null),
        api.get('/users'),
        api.get('/users/regions').catch(() => ({ data: [] })),
      ]);

      const allUsers = withDemoFallback(usersRes.data || [], DEMO_ADMIN_USERS);
      const vendorUsers = allUsers.filter((u) => u.role === 'vendor');
      const merged = mergeVendorLists(vendorsRes, vendorUsers, marketplaceRes);

      const hasApiVendors = Boolean(
        (Array.isArray(vendorsRes) && vendorsRes.length)
        || vendorsRes?.vendors?.length
        || marketplaceRes?.vendors?.length,
      );

      setVendors(hasApiVendors ? merged : withDemoFallback(merged, DEMO_ADMIN_VENDORS));
      setStats(statsRes || marketplaceRes?.stats || DEMO_MARKETPLACE_STATS);
      setDemoMode(!hasApiVendors);
      setRegions((regionsRes.data || []).length ? regionsRes.data : DEMO_ADMIN_REGIONS);
    } catch (error) {
      console.error('Erreur chargement fournisseurs', error);
      setVendors(DEMO_ADMIN_VENDORS);
      setStats(DEMO_MARKETPLACE_STATS);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredVendors = useMemo(() => vendors.filter((v) => {
    const matchesRegion = regionFilter === 'all' || v.region === regionFilter;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const haystack = `${v.shopName} ${v.ownerName} ${v.ownerEmail} ${v.region || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    return matchesRegion && matchesStatus && matchesSearch;
  }), [vendors, regionFilter, statusFilter, searchTerm]);

  const kpis = useMemo(() => ({
    total: stats?.totalVendors ?? vendors.length,
    active: stats?.activeVendors ?? vendors.filter((v) => v.status === 'active').length,
    revenue: stats?.totalRevenue30d ?? vendors.reduce((s, v) => s + (v.revenue30d || 0), 0),
    commissions: (stats?.totalCommissionsPaid ?? 0) + (stats?.totalCommissionsPending ?? 0)
      || vendors.reduce((s, v) => s + (v.commissionsPaid || 0) + (v.commissionsPending || 0), 0),
  }), [stats, vendors]);

  const openCreate = () => {
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.shopName) {
      setMsg('Nom, email, mot de passe et boutique sont requis.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const userRes = await api.post('/users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'vendor',
        region: formData.region,
      });
      const userId = userRes.data?._id || userRes.data?.id;
      try {
        await registerVendor({ shopName: formData.shopName, region: formData.region, userId });
      } catch {
        /* inscription boutique optionnelle si endpoint indisponible */
      }
      closeModal();
      setMsg(`Fournisseur « ${formData.shopName} » créé.`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Impossible de créer le fournisseur.');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (vendor) => {
    const nextStatus = vendor.status === 'active' ? 'suspended' : 'active';
    setBusy(true);
    try {
      if (vendor.userId) {
        await api.put(`/users/${vendor.userId}`, { isActive: nextStatus === 'active' });
      }
      if (vendor.id && !demoMode) {
        await updateAdminVendor(vendor.id, { status: nextStatus }).catch(() => null);
      }
      setVendors((list) => list.map((v) => (
        v.id === vendor.id ? { ...v, status: nextStatus } : v
      )));
      setMsg(`Statut mis à jour : ${statusStyle[nextStatus]?.label || nextStatus}`);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Mise à jour impossible.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏬</div>
        <p style={{ color: '#64748b' }}>Chargement des fournisseurs marketplace…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '24px 28px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #134e4a 100%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>
              <Store size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Fournisseurs marketplace
            </h1>
            <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
              Gérez les vendeurs partenaires, commissions (~12 %) et performances du catalogue tiers.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {demoMode && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 999,
                background: '#fef9c3', color: '#854d0e',
              }}
              >
                Mode démo
              </span>
            )}
            <button
              type="button"
              onClick={load}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontWeight: 600,
              }}
            >
              <RefreshCw size={16} /> Actualiser
            </button>
            <button
              type="button"
              onClick={openCreate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 10, border: 'none',
                background: '#fff', color: '#0f766e', cursor: 'pointer', fontWeight: 700,
              }}
            >
              <Plus size={16} /> Nouveau fournisseur
            </button>
          </div>
        </div>
      </motion.div>

      {msg && (
        <p style={{
          margin: '0 0 16px', padding: '10px 14px', borderRadius: 10,
          background: msg.includes('Impossible') || msg.includes('requis') ? '#fef2f2' : '#f0fdf4',
          color: msg.includes('Impossible') || msg.includes('requis') ? '#991b1b' : '#166534',
          fontSize: 14, fontWeight: 600,
        }}
        >
          {msg}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}
      >
        {[
          { label: 'Fournisseurs', value: kpis.total, sub: `${kpis.active} actifs`, icon: Store, accent: '#0d9488' },
          { label: 'CA marketplace (30j)', value: formatDT(kpis.revenue), icon: TrendingUp, accent: '#0891b2' },
          { label: 'Commissions totales', value: formatDT(kpis.commissions), icon: Percent, accent: '#6366f1' },
          { label: 'Taux moyen', value: `${((stats?.avgCommissionRate ?? 0.12) * 100).toFixed(0)} %`, icon: Package, accent: '#d97706' },
        ].map((k) => (
          <div key={k.label} style={{ ...card, borderLeft: `4px solid ${k.accent}` }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{k.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{k.value}</p>
            {k.sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Rechercher boutique, contact, région…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1 1 220px', padding: '10px 14px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 14,
            }}
          />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          >
            <option value="all">Toutes régions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendus</option>
          </select>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {filteredVendors.length} résultat{filteredVendors.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: 10 }}>Boutique</th>
              <th style={{ padding: 10 }}>Contact</th>
              <th style={{ padding: 10 }}>Région</th>
              <th style={{ padding: 10 }}>Produits</th>
              <th style={{ padding: 10 }}>CA 30j</th>
              <th style={{ padding: 10 }}>Commissions</th>
              <th style={{ padding: 10 }}>Statut</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((v) => {
              const st = statusStyle[v.status] || statusStyle.pending;
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: 10 }}>
                    <strong>{v.shopName}</strong>
                    {v.rank && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
                        #{v.rank}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 10 }}>
                    <div>{v.ownerName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{v.ownerEmail}</div>
                  </td>
                  <td style={{ padding: 10 }}>{v.region || '—'}</td>
                  <td style={{ padding: 10 }}>
                    {v.productsCount ?? 0}
                    {(v.lowStockCount > 0 || v.outOfStockCount > 0) && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: '#d97706', fontWeight: 700 }}>
                        ⚠ {v.outOfStockCount || 0} rupture
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 10 }}>{formatDT(v.revenue30d ?? 0)}</td>
                  <td style={{ padding: 10 }}>
                    <div>{formatDT(v.commissionsPaid ?? 0)}</div>
                    {(v.commissionsPending > 0) && (
                      <div style={{ fontSize: 11, color: '#d97706' }}>
                        +{formatDT(v.commissionsPending)} en attente
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: st.bg, color: st.color,
                    }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <AdminMessageButton userId={v.userId || v.ownerId} label="Message" compact />
                      <Link
                        to={`/admin/vendors/${v.id}`}
                        style={{
                          padding: '6px 10px', borderRadius: 8, border: '1px solid #99f6e4',
                          background: '#f0fdfa', color: '#0f766e', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Détail
                      </Link>
                      {v.status !== 'pending' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggleStatus(v)}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                            background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {v.status === 'active' ? 'Suspendre' : 'Réactiver'}
                        </button>
                      )}
                      {v.userId && (
                        <Link
                          to={`/admin/users`}
                          style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, alignSelf: 'center' }}
                        >
                          Compte
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredVendors.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: '#94a3b8', margin: 0 }}>
            Aucun fournisseur ne correspond aux filtres.
          </p>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}
        >
          <div style={{ ...card, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800 }}>Nouveau fournisseur</h2>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nom du responsable *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Téléphone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nom de la boutique *</label>
              <input
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Région</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              >
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Mot de passe *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none',
                    background: '#0d9488', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {busy ? 'Création…' : 'Créer le fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorsPage;
