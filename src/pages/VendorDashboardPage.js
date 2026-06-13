import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Store, TrendingUp, Package, AlertTriangle, Brain, RefreshCw,
  ShoppingCart, Percent, Award, Box, BarChart3,
} from 'lucide-react';
import { fetchAdminVendor, fetchVendorDashboard, registerVendor } from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';
import { getDemoAdminVendorDetail, getDemoVendorDashboard } from '../utils/vendorDemoData';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const h3 = { margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0f172a' };

const Badge = ({ label, bg = '#eef2ff', color = '#4338ca' }) => (
  <span style={{
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

const trendIcon = (t) => (t === 'up' ? '↑' : t === 'down' ? '↓' : '→');

const priorityColor = (p) => (p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#64748b');

const VendorDashboardPage = ({ vendorId = null, adminPreview = false }) => {
  const [dash, setDash] = useState(null);
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
  }, [vendorId, adminPreview]);

  const chartData = useMemo(
    () => (dash?.salesTrend || []).map((s) => ({
      name: s.label,
      revenue: s.revenue,
      orders: s.orders,
    })),
    [dash?.salesTrend],
  );

  const kpis = dash?.kpis || {};
  const ml = dash?.mlAgent;
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
          {dash.region || 'Tunisie'}
          {' · '}
          Commission {(dash.commissionRate * 100).toFixed(0)} %
          {kpis.marketplaceRank ? ` · Rang marketplace #${kpis.marketplaceRank}/${kpis.marketplaceTotal}` : ''}
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {isDemoShop && <Badge label="Mode démo" bg="#fef9c3" color="#854d0e" />}
          {ml?.groqPowered && <Badge label="Groq BI" bg="#ecfdf5" color="#059669" />}
          {ml?.pythonPowered && <Badge label="XGBoost" />}
          {ml?.mlPowered && <Badge label="Agent ML vendeur" bg="#f0fdfa" color="#0d9488" />}
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

      {ml && (
        <div style={{ ...card, border: '1px solid #99f6e4', background: 'linear-gradient(180deg, #f0fdfa 0%, #fff 40%)' }}>
          <h3 style={{ ...h3, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={20} color="#0d9488" />
            Agent BI / ML vendeur
          </h3>
          {ml.summary && (
            <p style={{ margin: '0 0 12px', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: '#134e4a' }}>
              {ml.summary}
            </p>
          )}
          {ml.tip && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#0f766e', fontWeight: 600 }}>{ml.tip}</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Prévision CA mois prochain</p>
              <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800 }}>
                {formatDT(ml.forecast?.nextMonthRevenue ?? 0)}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                {ml.forecast?.model || 'trend_linear_v1'}
                {ml.forecast?.confidence ? ` · confiance ${Math.round(ml.forecast.confidence * 100)} %` : ''}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Taux conversion (proxy)</p>
              <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800 }}>{kpis.conversionRate ?? 0} %</p>
            </div>
          </div>
          {ml.actionHints?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>Actions recommandées</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ml.actionHints.map((h, i) => (
                  <span
                    key={`${h.type}-${i}`}
                    style={{
                      fontSize: 12, padding: '6px 12px', borderRadius: 999,
                      background: '#fff', border: `1px solid ${priorityColor(h.priority)}33`,
                      color: priorityColor(h.priority), fontWeight: 600,
                    }}
                  >
                    {h.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(ml.stockAlerts?.length > 0) && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#b45309' }}>
                <AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> Alertes stock ML
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f' }}>
                {ml.stockAlerts.slice(0, 5).map((a) => (
                  <li key={a.productId}>
                    <strong>{a.name}</strong> — stock {a.stock} — {a.action}
                    {' '}
                    (risque {(a.riskScore * 100).toFixed(0)} %)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { to: '/vendor/products', label: '🏷️ Gérer produits' },
          { to: '/vendor/orders', label: '📦 Commandes' },
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

      <>
          {(dash.productPerformance?.length > 0) && (
            <div style={card}>
              <h3 style={h3}><Award size={18} style={{ verticalAlign: 'middle' }} /> Produits les plus vendus (30 j)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: 8 }}>#</th>
                    <th style={{ padding: 8 }}>Produit</th>
                    <th style={{ padding: 8 }}>Unités</th>
                    <th style={{ padding: 8 }}>CA</th>
                    <th style={{ padding: 8 }}>Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.productPerformance.slice(0, 5).map((p, i) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: 8, fontWeight: 800, color: i === 0 ? '#d97706' : '#64748b' }}>{i + 1}</td>
                      <td style={{ padding: 8 }}>{p.name}</td>
                      <td style={{ padding: 8 }}>{p.unitsSold}</td>
                      <td style={{ padding: 8 }}>{formatDT(p.revenue)}</td>
                      <td style={{ padding: 8 }}>{trendIcon(p.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: '12px 0 0' }}>
                <Link to="/vendor/products" style={{ color: '#0d9488', fontWeight: 600 }}>Gérer le catalogue →</Link>
              </p>
            </div>
          )}

          <div style={card}>
            <h3 style={h3}>Tendance des ventes (6 mois)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} DT`, 'CA']} />
                  <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} name="CA" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#94a3b8', margin: 0 }}>Pas encore assez d’historique.</p>
            )}
          </div>

          {ml?.productDemand?.length > 0 && (
            <div style={card}>
              <h3 style={h3}>
                <Package size={18} style={{ verticalAlign: 'middle' }} /> Demande prévue (mois prochain)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: 8 }}>Produit</th>
                      <th style={{ padding: 8 }}>Qté prévue</th>
                      <th style={{ padding: 8 }}>Mois dernier</th>
                      <th style={{ padding: 8 }}>Tendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ml.productDemand.slice(0, 8).map((row) => (
                      <tr key={row.productId} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: 8 }}>{row.productName}</td>
                        <td style={{ padding: 8 }}>{row.predictedUnitsNextMonth}</td>
                        <td style={{ padding: 8 }}>{row.lastMonthUnits}</td>
                        <td style={{ padding: 8 }}>{trendIcon(row.trend)} {row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={card}>
            <h3 style={h3}><ShoppingCart size={18} style={{ verticalAlign: 'middle' }} /> Commandes récentes</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: 8 }}>Commande</th>
                    <th style={{ padding: 8 }}>Total</th>
                    <th style={{ padding: 8 }}>Commission</th>
                    <th style={{ padding: 8 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(dash.recentOrders || []).slice(0, 5).map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: 8 }}>{c.orderId || c.id}</td>
                      <td style={{ padding: 8 }}>{formatDT(c.total ?? 0)}</td>
                      <td style={{ padding: 8 }}>{formatDT(c.commission ?? 0)}</td>
                      <td style={{ padding: 8 }}>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin: '12px 0 0' }}>
              <Link to="/vendor/orders" style={{ color: '#0d9488', fontWeight: 600 }}>Gérer toutes les commandes →</Link>
            </p>
          </div>
      </>
    </div>
  );
};

export default VendorDashboardPage;
