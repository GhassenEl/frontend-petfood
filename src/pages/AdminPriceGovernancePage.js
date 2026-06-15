import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Clock, History, Percent, RefreshCw, Save, Shield, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  fetchPriceGovernancePack,
  updatePricePolicy,
  updateProductPriceAdmin,
  approvePriceChange,
  rejectPriceChange,
  bulkUpdatePrices,
  verifyAllPrices,
  importPrices,
} from '../services/priceGovernanceService';
import { DEMO_PRICE_GOVERNANCE_PACK } from '../utils/adminDemoData';
import DemoModePill from '../components/DemoModePill';
import AdminImportExportBar from '../components/AdminImportExportBar';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import {
  downloadCsv, downloadJson, parseCsv, readFileText, boolFromCsv, numFromCsv,
} from '../utils/dataImportExport';
import './AdminPages.css';

const PRICE_CSV_HEADERS = ['productId', 'productName', 'price', 'discount', 'category', 'animalType', 'priceVerified', 'priceStatus'];

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
  { id: 'catalog', label: 'Catalogue', icon: BadgeCheck },
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'policy', label: 'Politique', icon: Shield },
];

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const statusStyle = {
  ok: { bg: '#ecfdf5', color: '#047857', label: 'Conforme' },
  high_discount: { bg: '#fef3c7', color: '#b45309', label: 'Remise élevée' },
  out_of_bounds: { bg: '#fef2f2', color: '#b91c1c', label: 'Hors bornes' },
};

const Kpi = ({ icon: Icon, label, value, color = '#0f172a', sub }) => (
  <div style={{ ...card, borderTop: `3px solid ${color}` }}>
    <Icon size={20} color={color} />
    <div style={{ fontSize: 28, fontWeight: 900, color, marginTop: 8 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
  </div>
);

const AdminPriceGovernancePage = () => {
  const [tab, setTab] = useState('overview');
  const [pack, setPack] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [editPrices, setEditPrices] = useState({});
  const [bulkMode, setBulkMode] = useState('percent');
  const [bulkValue, setBulkValue] = useState('5');
  const [selected, setSelected] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchPriceGovernancePack();
      setPack(data);
      setPolicy(data.policy);
    } catch {
      setPack(DEMO_PRICE_GOVERNANCE_PACK);
      setPolicy(DEMO_PRICE_GOVERNANCE_PACK.policy);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const isDemo = pack?.mode === 'demo';
  const d = pack || DEMO_PRICE_GOVERNANCE_PACK;

  const filteredProducts = useMemo(() => {
    const rows = d.products || [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((p) => p.name?.toLowerCase().includes(q));
  }, [d.products, search]);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3500);
  };

  const savePolicy = async () => {
    setBusy(true);
    try {
      const { data } = await updatePricePolicy(policy);
      setPolicy(data);
      flash('Politique tarifaire enregistrée.');
      await load();
    } catch {
      flash('Erreur enregistrement politique.');
    } finally {
      setBusy(false);
    }
  };

  const saveProductPrice = async (productId) => {
    const price = Number(editPrices[productId]);
    if (!Number.isFinite(price) || price <= 0) {
      window.alert('Prix invalide');
      return;
    }
    setBusy(true);
    try {
      if (isDemo) {
        setPack((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === productId ? { ...p, price, priceVerified: true, priceVerifiedAt: new Date().toISOString() } : p,
          ),
        }));
        flash('Prix mis à jour (démo).');
      } else {
        await updateProductPriceAdmin(productId, { price, reason: 'Ajustement admin' });
        await load();
        flash('Prix mis à jour et journalisé.');
      }
    } catch (err) {
      flash(err?.response?.data?.error || 'Erreur mise à jour prix.');
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (id) => {
    setBusy(true);
    try {
      if (isDemo) {
        const row = d.pending.find((p) => p.id === id);
        if (row) {
          setPack((prev) => ({
            ...prev,
            pending: prev.pending.filter((p) => p.id !== id),
            history: [{ ...row, status: 'applied', actorName: 'Admin', appliedAt: new Date().toISOString() }, ...prev.history],
            products: prev.products.map((p) =>
              p.id === row.productId ? { ...p, price: row.newPrice, priceVerified: true, priceVerifiedAt: new Date().toISOString() } : p,
            ),
            stats: { ...prev.stats, pendingApprovals: prev.stats.pendingApprovals - 1 },
          }));
        }
        flash('Changement de prix approuvé.');
      } else {
        await approvePriceChange(id);
        await load();
        flash('Changement approuvé et appliqué.');
      }
    } catch {
      flash('Erreur approbation.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Motif du rejet (optionnel)') || '';
    setBusy(true);
    try {
      if (isDemo) {
        setPack((prev) => ({
          ...prev,
          pending: prev.pending.filter((p) => p.id !== id),
          stats: { ...prev.stats, pendingApprovals: Math.max(0, prev.stats.pendingApprovals - 1) },
        }));
        flash('Demande rejetée.');
      } else {
        await rejectPriceChange(id, reason);
        await load();
        flash('Demande rejetée.');
      }
    } catch {
      flash('Erreur rejet.');
    } finally {
      setBusy(false);
    }
  };

  const handleBulk = async () => {
    if (!window.confirm(`Appliquer une mise à jour groupée (${bulkMode} : ${bulkValue}) ?`)) return;
    setBusy(true);
    try {
      if (isDemo) {
        flash('Mise à jour groupée simulée en mode démo.');
      } else {
        await bulkUpdatePrices({
          productIds: selected.length ? selected : undefined,
          mode: bulkMode,
          value: Number(bulkValue),
          reason: 'Mise à jour groupée admin',
        });
        await load();
        flash('Mise à jour groupée appliquée.');
      }
    } catch {
      flash('Erreur mise à jour groupée.');
    } finally {
      setBusy(false);
    }
  };

  const exportPriceJson = () => {
    downloadJson(`petfoodtn-prix-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      policy: d.policy,
      products: d.products,
      history: d.history,
    });
    flash('Export JSON téléchargé.');
  };

  const exportPriceCsv = () => {
    const rows = (d.products || []).map((p) => ({
      productId: p.id,
      productName: p.name,
      price: p.price,
      discount: p.discount,
      category: p.category,
      animalType: p.animalType,
      priceVerified: p.priceVerified,
      priceStatus: p.priceStatus,
    }));
    downloadCsv(`petfoodtn-prix-${new Date().toISOString().slice(0, 10)}.csv`, PRICE_CSV_HEADERS, rows);
    flash('Export CSV téléchargé.');
  };

  const handlePriceImport = async (file) => {
    setBusy(true);
    try {
      const text = await readFileText(file);
      let rows;
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        rows = parsed.products || parsed.rows || parsed;
      } else {
        rows = parseCsv(text).map((r) => ({
          productId: r.productid || r.product_id || r.id,
          price: numFromCsv(r.price),
          discount: r.discount !== '' ? numFromCsv(r.discount) : undefined,
          reason: r.reason || 'Import CSV admin',
        }));
      }
      if (!rows?.length) {
        flash('Fichier vide ou format invalide.');
        return;
      }
      if (isDemo) {
        setPack((prev) => ({
          ...prev,
          products: prev.products.map((p) => {
            const row = rows.find((r) => (r.productId || r.productid) === p.id);
            if (!row) return p;
            return { ...p, price: Number(row.price), discount: row.discount ?? p.discount, priceVerified: true, priceVerifiedAt: new Date().toISOString() };
          }),
        }));
        flash(`${rows.length} prix importés (démo).`);
      } else {
        const result = await importPrices(rows);
        await load();
        flash(`${result.imported} prix importés${result.errors ? `, ${result.errors} erreurs` : ''}.`);
      }
    } catch (err) {
      flash(err?.response?.data?.error || 'Erreur import prix.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyAll = async () => {
    setBusy(true);
    try {
      if (isDemo) {
        const now = new Date().toISOString();
        setPack((prev) => ({
          ...prev,
          policy: { ...prev.policy, lastGlobalVerificationAt: now },
          products: prev.products.map((p) => ({ ...p, priceVerified: true, priceVerifiedAt: now })),
          stats: { ...prev.stats, verifiedPrices: prev.products.length, credibilityScore: 100, lastGlobalVerificationAt: now },
        }));
        setPolicy((p) => ({ ...p, lastGlobalVerificationAt: now }));
        flash('Tous les prix marqués comme vérifiés.');
      } else {
        await verifyAllPrices();
        await load();
        flash('Vérification globale effectuée.');
      }
    } catch {
      flash('Erreur vérification globale.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !policy) {
    return <div className="adm-page"><p>Chargement de la gouvernance tarifaire…</p></div>;
  }

  return (
    <div className="adm-page" style={{ maxWidth: 1180 }}>
      <header className="adm-hero">
        <h1>
          <Shield size={24} />
          Gouvernance des prix
          {isDemo && <DemoModePill />}
        </h1>
        <p>
          Contrôle centralisé des tarifs, validation des changements vendeurs, historique des mises à jour
          et badge « prix vérifié » pour renforcer la crédibilité de la plateforme.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={load} disabled={busy}>
            <RefreshCw size={15} /> Actualiser
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleVerifyAll} disabled={busy}>
            <BadgeCheck size={15} /> Vérifier tous les prix
          </button>
          <Link to="/admin/products" className="adm-btn adm-btn--ghost" style={{ textDecoration: 'none' }}>
            Catalogue produits →
          </Link>
        </div>
        <AdminImportExportBar
          label="Catalogue prix"
          disabled={busy}
          onExportJson={exportPriceJson}
          onExportCsv={exportPriceCsv}
          onImport={handlePriceImport}
        />
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi icon={TrendingUp} label="Score crédibilité" value={`${d.stats?.credibilityScore ?? 0}%`} color="#0d9488" />
        <Kpi icon={BadgeCheck} label="Prix vérifiés" value={d.stats?.verifiedPrices ?? 0} color="#2563eb" sub={`/${d.stats?.totalProducts ?? 0} produits`} />
        <Kpi icon={Clock} label="En attente" value={d.stats?.pendingApprovals ?? 0} color="#d97706" />
        <Kpi icon={AlertTriangle} label="Anomalies" value={(d.stats?.outOfBounds ?? 0) + (d.stats?.highDiscounts ?? 0)} color="#dc2626" />
      </div>

      <div className="adm-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`adm-tab ${tab === id ? 'adm-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
            {id === 'pending' && (d.pending?.length > 0) && (
              <span style={{ marginLeft: 6, background: '#fef3c7', color: '#b45309', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>
                {d.pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="adm-card">
            <h2>Crédibilité & transparence</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 0 }}>
              Les clients voient un badge <strong>Prix vérifié</strong> lorsque l&apos;admin a validé le tarif affiché.
              Dernière vérification globale :{' '}
              {d.stats?.lastGlobalVerificationAt
                ? new Date(d.stats.lastGlobalVerificationAt).toLocaleString('fr-FR')
                : '—'}
            </p>
            <div className="adm-toggle-group">
              <label className="adm-toggle">
                <input
                  type="checkbox"
                  checked={!!policy.showVerifiedBadgeToClients}
                  onChange={(e) => setPolicy((p) => ({ ...p, showVerifiedBadgeToClients: e.target.checked }))}
                />
                Afficher le badge « prix vérifié » aux clients
              </label>
              <label className="adm-toggle">
                <input
                  type="checkbox"
                  checked={!!policy.requireVendorPriceApproval}
                  onChange={(e) => setPolicy((p) => ({ ...p, requireVendorPriceApproval: e.target.checked }))}
                />
                Validation admin obligatoire pour les vendeurs
              </label>
            </div>
            <button type="button" className="adm-btn adm-btn--primary" style={{ marginTop: 12 }} onClick={savePolicy} disabled={busy}>
              <Save size={15} /> Enregistrer
            </button>
          </div>

          {(d.pending || []).length > 0 && (
            <div className="adm-card">
              <h2>Demandes vendeurs récentes</h2>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Vendeur</th>
                    <th>Ancien → Nouveau</th>
                    <th>Variation</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.pending.slice(0, 5).map((row) => (
                    <tr key={row.id}>
                      <td>{row.productName}</td>
                      <td>{row.vendorName}</td>
                      <td>{row.oldPrice} → <strong>{row.newPrice} DT</strong></td>
                      <td style={{ color: row.changePct > 15 ? '#dc2626' : '#047857', fontWeight: 700 }}>
                        {row.changePct > 0 ? '+' : ''}{row.changePct}%
                      </td>
                      <td>
                        <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => handleApprove(row.id)} disabled={busy}>Approuver</button>
                        {' '}
                        <button type="button" className="adm-btn adm-btn--sm" onClick={() => handleReject(row.id)} disabled={busy}>Rejeter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <div className="adm-card">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
            <input
              placeholder="Rechercher un produit…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <select value={bulkMode} onChange={(e) => setBulkMode(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <option value="percent">% variation</option>
              <option value="fixed">+/- DT fixe</option>
              <option value="set">Prix fixe</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              style={{ width: 90, padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <button type="button" className="adm-btn adm-btn--primary" onClick={handleBulk} disabled={busy}>
              <Percent size={14} /> Mise à jour groupée{selected.length ? ` (${selected.length})` : ' (tout)'}
            </button>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={() => setSelected(selected.length === filteredProducts.length ? [] : filteredProducts.map((p) => p.id))}
                  />
                </th>
                <th>Produit</th>
                <th>Prix (DT)</th>
                <th>Remise</th>
                <th>Statut</th>
                <th>Vérifié</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const st = statusStyle[p.priceStatus] || statusStyle.ok;
                return (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => setSelected((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrices[p.id] ?? p.price}
                        onChange={(e) => setEditPrices((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        style={{ width: 90, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                    </td>
                    <td>{p.discount > 0 ? `-${p.discount}%` : '—'}</td>
                    <td>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </td>
                    <td>
                      {p.priceVerified ? (
                        <span style={{ color: '#047857', fontSize: 12, fontWeight: 600 }}>
                          ✓ {p.priceVerifiedAt ? new Date(p.priceVerifiedAt).toLocaleDateString('fr-FR') : 'Oui'}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>Non</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => saveProductPrice(p.id)} disabled={busy}>
                        Enregistrer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pending' && (
        <div className="adm-card">
          {(d.pending || []).length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucune demande de changement de prix en attente.</p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Vendeur</th>
                  <th>Motif</th>
                  <th>Ancien → Nouveau</th>
                  <th>Variation</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.pending.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString('fr-FR')}</td>
                    <td>{row.productName}</td>
                    <td>{row.vendorName}</td>
                    <td>{row.reason || '—'}</td>
                    <td>{row.oldPrice} → <strong>{row.newPrice} DT</strong></td>
                    <td style={{ color: Math.abs(row.changePct) > policy.maxPriceIncreasePercent ? '#dc2626' : '#0f172a', fontWeight: 700 }}>
                      {row.changePct > 0 ? '+' : ''}{row.changePct}%
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => handleApprove(row.id)} disabled={busy}>Approuver</button>
                      {' '}
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => handleReject(row.id)} disabled={busy}>Rejeter</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Source</th>
                <th>Ancien → Nouveau</th>
                <th>Variation</th>
                <th>Acteur</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {(d.history || []).map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.appliedAt || row.createdAt).toLocaleString('fr-FR')}</td>
                  <td>{row.productName}</td>
                  <td>{row.source === 'admin' ? 'Admin' : row.source === 'vendor' ? 'Vendeur' : row.source}</td>
                  <td>{row.oldPrice} → <strong>{row.newPrice} DT</strong></td>
                  <td>{row.changePct > 0 ? '+' : ''}{row.changePct}%</td>
                  <td>{row.actorName || '—'}</td>
                  <td>{row.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'policy' && (
        <div className="adm-card">
          <h2>Règles de contrôle tarifaire</h2>
          <div className="adm-form-grid">
            <label>
              Hausse max autorisée (%)
              <input type="number" min="0" max="100" value={policy.maxPriceIncreasePercent} onChange={(e) => setPolicy((p) => ({ ...p, maxPriceIncreasePercent: Number(e.target.value) }))} />
            </label>
            <label>
              Remise max (%)
              <input type="number" min="0" max="100" value={policy.maxDiscountPercent} onChange={(e) => setPolicy((p) => ({ ...p, maxDiscountPercent: Number(e.target.value) }))} />
            </label>
            <label>
              Prix minimum (DT)
              <input type="number" min="0" step="0.01" value={policy.minProductPrice} onChange={(e) => setPolicy((p) => ({ ...p, minProductPrice: Number(e.target.value) }))} />
            </label>
            <label>
              Prix maximum (DT)
              <input type="number" min="1" value={policy.maxProductPrice} onChange={(e) => setPolicy((p) => ({ ...p, maxProductPrice: Number(e.target.value) }))} />
            </label>
            <label>
              Délai entre mises à jour (h)
              <input type="number" min="0" value={policy.priceUpdateCooldownHours} onChange={(e) => setPolicy((p) => ({ ...p, priceUpdateCooldownHours: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="adm-toggle-group" style={{ marginTop: 16 }}>
            <label className="adm-toggle">
              <input type="checkbox" checked={!!policy.requireVendorPriceApproval} onChange={(e) => setPolicy((p) => ({ ...p, requireVendorPriceApproval: e.target.checked }))} />
              Validation admin pour changements vendeurs
            </label>
            <label className="adm-toggle">
              <input type="checkbox" checked={!!policy.autoRejectSuspiciousPrices} onChange={(e) => setPolicy((p) => ({ ...p, autoRejectSuspiciousPrices: e.target.checked }))} />
              Rejet auto des prix suspects
            </label>
            <label className="adm-toggle">
              <input type="checkbox" checked={!!policy.showVerifiedBadgeToClients} onChange={(e) => setPolicy((p) => ({ ...p, showVerifiedBadgeToClients: e.target.checked }))} />
              Badge « prix vérifié » visible clients
            </label>
          </div>
          <button type="button" className="adm-btn adm-btn--primary" style={{ marginTop: 16 }} onClick={savePolicy} disabled={busy}>
            <Save size={16} /> Enregistrer la politique
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPriceGovernancePage;
