import React, { useEffect, useMemo, useState } from 'react';
import { Percent, Search, Trash2, CheckSquare, Square } from 'lucide-react';
import api from '../utils/api';

const ANIMAL_LABELS = {
  dog: '🐕 Chien',
  cat: '🐈 Chat',
  bird: '🐦 Oiseau',
  fish: '🐟 Poisson',
  other: '🐾 Autre',
};

const AdminProductPromotions = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [bulkDiscount, setBulkDiscount] = useState('15');
  const [editingDiscount, setEditingDiscount] = useState({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/promotions/products');
      setProducts(data || []);
      setSelected([]);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...products];
    if (filter === 'on_sale') rows = rows.filter((p) => Number(p.discount) > 0);
    if (filter === 'no_sale') rows = rows.filter((p) => !Number(p.discount));
    if (animalFilter !== 'all') rows = rows.filter((p) => p.animalType === animalFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return rows;
  }, [products, filter, animalFilter, search]);

  const stats = useMemo(() => ({
    total: products.length,
    onSale: products.filter((p) => Number(p.discount) > 0).length,
    avgDiscount: (() => {
      const onSale = products.filter((p) => Number(p.discount) > 0);
      if (!onSale.length) return 0;
      return Math.round(onSale.reduce((s, p) => s + Number(p.discount), 0) / onSale.length);
    })(),
  }), [products]);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((p) => p.id));
  };

  const saveOne = async (productId) => {
    const discount = Number(editingDiscount[productId] ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      window.alert('Remise entre 0 et 100 %');
      return;
    }
    setBusy(true);
    try {
      await api.patch(`/promotions/products/${productId}`, { discount });
      await load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement');
    } finally {
      setBusy(false);
    }
  };

  const applyBulk = async () => {
    if (selected.length === 0) {
      window.alert('Sélectionnez au moins un produit');
      return;
    }
    const discount = Number(bulkDiscount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      window.alert('Remise entre 0 et 100 %');
      return;
    }
    setBusy(true);
    try {
      await api.post('/promotions/products/bulk', { productIds: selected, discount });
      await load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur application groupée');
    } finally {
      setBusy(false);
    }
  };

  const clearSelected = async () => {
    const ids = selected.length > 0 ? selected : undefined;
    const msg = ids
      ? `Retirer la promotion de ${ids.length} produit(s) ?`
      : 'Retirer toutes les promotions produits ?';
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      await api.post('/promotions/products/clear', ids ? { productIds: ids } : {});
      await load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={statsRowStyle}>
        <div style={statCardStyle}><strong>{stats.total}</strong><span>Produits</span></div>
        <div style={statCardStyle}><strong>{stats.onSale}</strong><span>En promotion</span></div>
        <div style={statCardStyle}><strong>{stats.avgDiscount}%</strong><span>Remise moyenne</span></div>
      </div>

      <div style={toolbarStyle}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
          <option value="all">Tous les produits</option>
          <option value="on_sale">En promotion</option>
          <option value="no_sale">Prix normal</option>
        </select>
        <select value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)} style={selectStyle}>
          <option value="all">Tous animaux</option>
          {Object.entries(ANIMAL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div style={bulkBarStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
          {selected.length} sélectionné(s)
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            max="100"
            value={bulkDiscount}
            onChange={(e) => setBulkDiscount(e.target.value)}
            style={{ ...inputStyle, width: 72 }}
          />
          <span style={{ fontSize: 13, color: '#6b7280' }}>%</span>
          <button type="button" onClick={applyBulk} disabled={busy} style={primaryBtnStyle}>
            <Percent size={16} /> Appliquer la remise
          </button>
          <button type="button" onClick={clearSelected} disabled={busy} style={dangerBtnStyle}>
            <Trash2 size={16} /> {selected.length ? 'Retirer promo (sélection)' : 'Tout retirer'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div style={emptyStyle}>Aucun produit trouvé.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>
                  <button type="button" onClick={toggleSelectAll} style={iconBtnStyle} title="Tout sélectionner">
                    {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th style={thStyle}>Produit</th>
                <th style={thStyle}>Animal</th>
                <th style={thStyle}>Prix</th>
                <th style={thStyle}>Remise %</th>
                <th style={thStyle}>Prix promo</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const discount = Number(p.discount || 0);
                const editVal = editingDiscount[p.id] ?? String(discount);
                const onSale = discount > 0;
                return (
                  <tr key={p.id}>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => toggleSelect(p.id)} style={iconBtnStyle}>
                        {selected.includes(p.id) ? <CheckSquare size={18} color="#e67e22" /> : <Square size={18} />}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Stock : {p.stock ?? 0}</div>
                    </td>
                    <td style={tdStyle}>{ANIMAL_LABELS[p.animalType] || p.animalType || '—'}</td>
                    <td style={tdStyle}>{Number(p.price).toFixed(2)} DT</td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editVal}
                        onChange={(e) => setEditingDiscount({ ...editingDiscount, [p.id]: e.target.value })}
                        style={{ ...inputStyle, width: 72 }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: onSale ? '#dc2626' : '#374151' }}>
                        {Number(p.finalPrice ?? p.price).toFixed(2)} DT
                      </strong>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        ...pillStyle,
                        background: onSale ? '#fef3c7' : '#f3f4f6',
                        color: onSale ? '#b45309' : '#6b7280',
                      }}>
                        {onSale ? `-${discount}%` : 'Prix normal'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveOne(p.id)}
                        style={smallBtnStyle}
                      >
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
    </div>
  );
};

const statsRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 12,
  marginBottom: 16,
};

const statCardStyle = {
  background: 'white',
  borderRadius: 12,
  padding: '16px 20px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const toolbarStyle = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginBottom: 12,
};

const bulkBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: 12,
  padding: '14px 16px',
  marginBottom: 16,
};

const selectStyle = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  background: 'white',
};

const inputStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 14,
};

const emptyStyle = {
  background: 'white',
  borderRadius: 14,
  padding: 32,
  textAlign: 'center',
  color: '#6b7280',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const thStyle = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#6b7280',
  borderBottom: '1px solid #f3f4f6',
  background: '#fafafa',
};

const tdStyle = {
  padding: '12px 14px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  verticalAlign: 'middle',
};

const pillStyle = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  background: '#e67e22',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};

const dangerBtnStyle = {
  ...primaryBtnStyle,
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
};

const smallBtnStyle = {
  padding: '6px 12px',
  background: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'inline-flex',
  color: '#6b7280',
};

export default AdminProductPromotions;
