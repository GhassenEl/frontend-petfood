import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store, TrendingUp, RefreshCw,
  ShoppingCart, Percent, Award, Box, BarChart3,
} from 'lucide-react';import { fetchAdminVendor, fetchVendorDashboard, registerVendor } from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';
import { getDemoAdminVendorDetail, getDemoVendorDashboard } from '../utils/vendorDemoData';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import VendorBiPanel from '../components/VendorBiPanel';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const Badge = ({ label, bg = '#eef2ff', color = '#4338ca' }) => (  <span style={{
    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
    background: bg, color,
  }}
  >
    {label}
  </span>
);

const Kpi = ({ label, value, sub, icon: Icon, accent }) => (
  <div style={{
    ...card,
    marginBottom: 0,
    borderLeft: accent ? `4px solid ${accent}` : undefined,
  }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{label}</p>
      {Icon && <Icon size={18} color={accent || '#94a3b8'} />}
    </div>
    <p style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 0', color: '#0f172a' }}>{value}</p>
    {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{sub}</p>}
  </div>
);

const VendorDashboardPage = ({ vendorId = null, adminPreview = false }) => {  const [dash, setDash] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [region, setRegion] = useState('Tunis');
  const [demoMode, setDemoMode] = useState(false);

  const load = () => {
    setLoading(true);
    const fetcher = adminPreview && vendorId
      ? fetchAdminVendor(vendorId)
      : fetchVendorDashboard();

    fetcher
      .then((d) => {
        setDash(d);
        setDemoMode(d?.id === 'demo_vendor' || /démo|demo/i.test(d?.shopName || ''));
        setErr('');
      })
      .catch(() => {
        const demo = adminPreview && vendorId
          ? getDemoAdminVendorDetail(vendorId)
          : getDemoVendorDashboard();
        if (!demo) {
          setErr('Fournisseur introuvable');
          setDash(null);
        } else {
          setDash(demo);
          setDemoMode(true);
          setErr('');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 20000);
    return () => window.clearInterval(id);
  }, [vendorId, adminPreview]);

  usePlatformRefresh(load);

  const kpis = dash?.kpis || {};
  const isDemoShop = demoMode || dash?.id === 'demo_vendor' || /démo|demo/i.test(dash?.shopName || '');

  if (err && !dash) {
    if (adminPreview) {
      return <p style={{ padding: 24, color: '#64748b' }}>{err || 'Fournisseur introuvable.'}</p>;
    }
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontWeight: 800 }}>Devenir vendeur PetfoodTN</h1>
        <div style={card}>
          <p>Créez votre animalerie sur la marketplace (commission plateforme ~12 %).</p>
          <input
            placeholder="Nom de la boutique"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <input
            placeholder="Région"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <button
            type="button"
            onClick={() =>
              registerVendor({ shopName, region }).then(() => {
                setErr('');
                load();
              })
            }
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Créer ma boutique
          </button>
        </div>
      </div>
    );
  }

  if (loading && !dash) {
    return <p style={{ padding: 24, color: '#64748b' }}>Chargement du tableau de bord…</p>;
  }

  if (!dash) return null;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 45%, #134e4a 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>
          <Store size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {dash.shopName}
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Commission {(dash.commissionRate * 100).toFixed(0)} %
          {kpis.marketplaceRank ? ` · Rang marketplace #${kpis.marketplaceRank}/${kpis.marketplaceTotal}` : ''}
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {isDemoShop && <Badge label="Mode démo" bg="#fef9c3" color="#854d0e" />}
          <button
            type="button"
            onClick={load}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </motion.div>

      {!adminPreview && (
        <RealtimeStatsCharts role="vendor" detailLink={null} hideBreakdown hideMonthly />
      )}

      {!adminPreview && <VendorBiPanel />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}
      >
        <Kpi
          label="CA 7 jours"
          value={formatDT(kpis.revenue7d ?? 0)}
          icon={TrendingUp}
          accent="#0d9488"
        />
        <Kpi
          label="CA 30 jours"
          value={formatDT(kpis.revenue30d ?? dash.totalSales ?? 0)}
          sub={`${kpis.revenueGrowthPct >= 0 ? '+' : ''}${kpis.revenueGrowthPct ?? 0} % vs mois préc.`}
          icon={BarChart3}
          accent="#0891b2"
        />
        <Kpi
          label="Commandes (30j)"
          value={kpis.orders30d ?? '—'}
          sub={kpis.avgBasket30d ? `Panier moy. ${formatDT(kpis.avgBasket30d)}` : null}
          icon={ShoppingCart}
          accent="#6366f1"
        />
        <Kpi
          label="Commissions payées"
          value={formatDT(kpis.paidCommissions ?? dash.paidCommissions ?? 0)}
          icon={Percent}
          accent="#16a34a"
        />
        <Kpi
          label="En attente"
          value={formatDT(dash.pendingCommissions ?? kpis.pendingCommissions ?? 0)}
          icon={Award}
          accent="#d97706"
        />
        <Kpi
          label="Stock critique"
          value={(kpis.lowStockCount ?? 0) + (kpis.outOfStockCount ?? 0)}
          sub={`${kpis.activeProducts ?? dash.products?.length ?? 0} produits actifs`}
          icon={Box}
          accent="#dc2626"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { to: '/vendor/products', label: '🏷️ Gérer produits' },
          { to: '/vendor/orders', label: '📦 Commandes' },
          { to: '/vendor/sales', label: '📜 Historique ventes' },
          { to: '/vendor/returns', label: '↩️ Retours' },
          { to: '/vendor/communication', label: '💬 Communication' },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              padding: '8px 14px', borderRadius: 10, textDecoration: 'none', fontWeight: 600,
              background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontSize: 13,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboardPage;