import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Pencil, Plus, RefreshCw, TrendingDown, Truck } from 'lucide-react';
import {
  adjustAdminStock,
  bulkReorderAdminStock,
  fetchAdminStockMovements,
  fetchAdminStockOverview,
  updateAdminStockThresholds,
} from '../services/adminStockService';
import {
  DEMO_ADMIN_STOCK_MOVEMENTS,
  buildStockAlerts,
  mergeAdminStock,
  withDemoFallback,
} from '../utils/adminDemoData';

const AdminStockPage = () => {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState({ total: 0, ruptures: 0, low: 0, value: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ adjustment: '', reason: '' });

  const [thresholdTarget, setThresholdTarget] = useState(null);
  const [thresholdForm, setThresholdForm] = useState({
    minStock: '',
    maxStock: '',
    reorderQty: '',
    location: '',
    sku: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await fetchAdminStockOverview();
      setItems(overview.items?.length ? overview.items : mergeAdminStock([]));
      setStats(overview.stats || {
        total: overview.items?.length || 0,
        ruptures: 0,
        low: 0,
        value: 0,
      });
    } catch {
      setItems(mergeAdminStock([]));
      setStats({ total: 0, ruptures: 0, low: 0, value: 0 });
    }

    try {
      const mv = await fetchAdminStockMovements(50);
      setMovements(withDemoFallback(mv, DEMO_ADMIN_STOCK_MOVEMENTS));
    } catch {
      setMovements(DEMO_ADMIN_STOCK_MOVEMENTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const alerts = useMemo(() => buildStockAlerts(items), [items]);

  const filtered = useMemo(() => {
    let rows = [...items];
    if (filter === 'low') rows = rows.filter((p) => p.stock <= p.minStock);
    if (filter === 'ok') rows = rows.filter((p) => p.stock > p.minStock);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }
    return rows;
  }, [items, filter, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const openAdjust = (product) => {
    setAdjustTarget(product);
    setAdjustForm({ adjustment: '', reason: '' });
  };

  const openThresholds = (product) => {
    setThresholdTarget(product);
    setThresholdForm({
      minStock: String(product.minStock ?? ''),
      maxStock: String(product.maxStock ?? ''),
      reorderQty: String(product.reorderQty ?? ''),
      location: product.location || '',
      sku: product.sku || '',
    });
  };

  const handleAdjust = async (event) => {
    event.preventDefault();
    const adjustment = Number(adjustForm.adjustment);
    if (!adjustTarget || !Number.isFinite(adjustment) || adjustment === 0) {
      window.alert('Entrez un ajustement différent de 0');
      return;
    }
    setBusy(true);
    try {
      await adjustAdminStock(adjustTarget.id, {
        adjustment,
        reason: adjustForm.reason || 'Ajustement manuel',
      });
      setAdjustTarget(null);
      await load();
      window.alert('Stock mis à jour');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur ajustement stock');
    } finally {
      setBusy(false);
    }
  };

  const handleThresholds = async (event) => {
    event.preventDefault();
    if (!thresholdTarget) return;
    setBusy(true);
    try {
      await updateAdminStockThresholds(thresholdTarget.id, {
        minStock: Number(thresholdForm.minStock),
        maxStock: Number(thresholdForm.maxStock),
        reorderQty: Number(thresholdForm.reorderQty),
        location: thresholdForm.location,
        sku: thresholdForm.sku,
      });
      setThresholdTarget(null);
      await load();
      window.alert('Seuils enregistrés');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur mise à jour seuils');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkReorder = async (ids = []) => {
    const targets = ids.length ? ids : alerts.map((a) => a.productId);
    if (!targets.length) {
      window.alert('Aucun produit à réapprovisionner');
      return;
    }
    if (!window.confirm(`Réapprovisionner ${targets.length} produit(s) en stock bas ?`)) return;

    setBusy(true);
    try {
      const result = await bulkReorderAdminStock(targets);
      await load();
      setSelectedIds([]);
      window.alert(result.summary || 'Réapprovisionnement terminé');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur réapprovisionnement');
    } finally {
      setBusy(false);
    }
  };

  const quickAdjust = async (product, delta) => {
    setBusy(true);
    try {
      await adjustAdminStock(product.id, {
        adjustment: delta,
        reason: delta > 0 ? 'Entrée rapide' : 'Sortie rapide',
      });
      await load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur ajustement');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement stock…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={28} /> Gestion avancée du stock
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
            Ajustements, seuils, réapprovisionnement et historique des mouvements
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleBulkReorder()}
            disabled={busy || alerts.length === 0}
            className="btn btn-outline"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', opacity: alerts.length ? 1 : 0.6 }}
          >
            <Truck size={16} /> Réappro. alertes ({alerts.length})
          </button>
          <button type="button" onClick={load} disabled={busy} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi value={stats.total} label="Références" />
        <Kpi value={stats.ruptures} label="Ruptures" warn />
        <Kpi value={stats.low} label="Stock bas" warn />
        <Kpi value={`${Number(stats.value || 0).toFixed(0)} DT`} label="Valeur estimée" />
      </div>

      {selectedIds.length > 0 && (
        <div style={{ ...card, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>{selectedIds.length} sélectionné(s)</span>
          <button type="button" onClick={() => handleBulkReorder(selectedIds)} disabled={busy} style={actionBtn('#059669')}>
            <Truck size={14} /> Réapprovisionner la sélection
          </button>
          <button type="button" onClick={() => setSelectedIds([])} style={actionBtn('#64748b')}>
            Annuler sélection
          </button>
        </div>
      )}

      {alerts.length > 0 && (
        <section style={{ ...card, marginBottom: 24, borderLeft: '4px solid #ef4444' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#dc2626" /> Alertes rupture / stock bas ({alerts.length})
          </h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {alerts.map((a) => (
              <div
                key={a.productId}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: a.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${a.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <span>
                  <strong>{a.name}</strong> — {a.message}
                </span>
                <span style={{ color: '#64748b' }}>
                  Réappro suggéré : {a.reorderSuggested} u. · ~{a.daysOfStock} j restants
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Rechercher produit ou SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', minWidth: 220 }}
        />
        {[
          { id: 'all', label: 'Tous' },
          { id: 'low', label: 'Stock bas / rupture' },
          { id: 'ok', label: 'OK' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              background: filter === f.id ? '#2563eb' : '#f1f5f9',
              color: filter === f.id ? 'white' : '#475569',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ ...card, overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: 12 }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </th>
              {['Produit', 'SKU', 'Stock', 'Min', 'Max', 'Vélocité/j', 'Emplacement', 'Statut', 'Actions'].map((h) => (
                <th key={h} style={{ padding: 12, color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = p.stock <= 0 ? 'Rupture' : p.stock <= p.minStock ? 'Bas' : 'OK';
              const statusColor = p.stock <= 0 ? '#dc2626' : p.stock <= p.minStock ? '#d97706' : '#059669';
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 12 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      aria-label={`Sélectionner ${p.name}`}
                    />
                  </td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: 12, color: '#64748b' }}>{p.sku}</td>
                  <td style={{ padding: 12, fontWeight: 800, color: statusColor }}>{p.stock}</td>
                  <td style={{ padding: 12 }}>{p.minStock}</td>
                  <td style={{ padding: 12 }}>{p.maxStock}</td>
                  <td style={{ padding: 12 }}>{p.velocityPerDay}</td>
                  <td style={{ padding: 12 }}>{p.location}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${statusColor}22`, color: statusColor }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" disabled={busy} onClick={() => quickAdjust(p, 1)} title="+1" style={iconBtn}>+1</button>
                      <button type="button" disabled={busy} onClick={() => quickAdjust(p, -1)} title="-1" style={iconBtn}>-1</button>
                      <button type="button" disabled={busy} onClick={() => openAdjust(p)} title="Ajuster" style={iconBtn}>
                        <Plus size={14} />
                      </button>
                      <button type="button" disabled={busy} onClick={() => openThresholds(p)} title="Seuils" style={iconBtn}>
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Aucun produit trouvé</p>
        )}
      </div>

      <section style={card}>
        <h2 style={{ margin: '0 0 14px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingDown size={18} /> Mouvements récents
        </h2>
        {movements.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucun mouvement enregistré</p>
        ) : (
          movements.map((m) => (
            <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
              <strong>{m.productName}</strong>
              <span style={{ marginLeft: 8, color: m.qty < 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                {m.qty > 0 ? '+' : ''}{m.qty}
              </span>
              <span style={{ marginLeft: 8, color: '#64748b' }}>
                {m.reason} · {new Date(m.date).toLocaleString('fr-FR')} · {m.user}
              </span>
            </div>
          ))
        )}
      </section>

      {adjustTarget && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 12px' }}>Ajuster le stock</h2>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
              <strong>{adjustTarget.name}</strong> — stock actuel : {adjustTarget.stock}
            </p>
            <form onSubmit={handleAdjust}>
              <input
                required
                type="number"
                placeholder="Ajustement (+/-)"
                value={adjustForm.adjustment}
                onChange={(e) => setAdjustForm({ ...adjustForm, adjustment: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Raison (réception, vente, inventaire…)"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                style={{ ...inputStyle, marginTop: 10 }}
              />
              {adjustForm.adjustment && (
                <p style={{ fontSize: 13, color: '#475569', marginTop: 10 }}>
                  Nouveau stock : {Math.max(0, Number(adjustTarget.stock) + Number(adjustForm.adjustment || 0))}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setAdjustTarget(null)} style={actionBtn('#94a3b8')}>Annuler</button>
                <button type="submit" disabled={busy} style={actionBtn('#2563eb')}>Appliquer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {thresholdTarget && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 12px' }}>Seuils & emplacement</h2>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
              <strong>{thresholdTarget.name}</strong>
            </p>
            <form onSubmit={handleThresholds}>
              {[
                { key: 'minStock', label: 'Stock minimum' },
                { key: 'maxStock', label: 'Stock maximum' },
                { key: 'reorderQty', label: 'Qté réappro' },
                { key: 'location', label: 'Emplacement', type: 'text' },
                { key: 'sku', label: 'SKU', type: 'text' },
              ].map((field) => (
                <label key={field.key} style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                  {field.label}
                  <input
                    type={field.type || 'number'}
                    value={thresholdForm[field.key]}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, [field.key]: e.target.value })}
                    style={{ ...inputStyle, marginTop: 4 }}
                  />
                </label>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setThresholdTarget(null)} style={actionBtn('#94a3b8')}>Annuler</button>
                <button type="submit" disabled={busy} style={actionBtn('#2563eb')}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Kpi = ({ value, label, warn }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: warn ? '4px solid #ef4444' : '4px solid #2563eb' }}>
    <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: warn ? '#dc2626' : '#1e293b' }}>{value}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{label}</p>
  </div>
);

const card = { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
const modalStyle = { background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' };
const actionBtn = (bg) => ({
  padding: '8px 14px',
  borderRadius: 10,
  border: 'none',
  background: bg,
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
});
const iconBtn = {
  padding: '4px 8px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
};

export default AdminStockPage;
