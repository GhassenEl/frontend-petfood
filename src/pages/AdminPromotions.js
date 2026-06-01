import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, ToggleLeft, ToggleRight, Trash2, Pencil, Package } from 'lucide-react';
import api from '../utils/api';
import AdminProductPromotions from './AdminProductPromotions';

const emptyForm = {
  code: '',
  label: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '0',
  maxDiscount: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
};

const formatDiscount = (promo) => {
  if (promo.discountType === 'fixed') {
    return `${Number(promo.discountValue).toFixed(2)} DT`;
  }
  return `${Number(promo.discountValue)} %`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const AdminPromotions = () => {
  const [tab, setTab] = useState('products');
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/promotions');
      setPromos(data || []);
    } catch (error) {
      console.error(error);
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'codes') load();
  }, [tab]);

  const filtered = useMemo(() => {
    if (filter === 'active') return promos.filter((p) => p.isActive);
    if (filter === 'inactive') return promos.filter((p) => !p.isActive);
    return promos;
  }, [promos, filter]);

  const stats = useMemo(() => ({
    total: promos.length,
    active: promos.filter((p) => p.isActive).length,
    uses: promos.reduce((sum, p) => sum + Number(p.usedCount || 0), 0),
  }), [promos]);

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setFormData({
      code: promo.code || '',
      label: promo.label || '',
      discountType: promo.discountType || 'percent',
      discountValue: String(promo.discountValue ?? ''),
      minOrderAmount: String(promo.minOrderAmount ?? 0),
      maxDiscount: promo.maxDiscount != null ? String(promo.maxDiscount) : '',
      maxUses: promo.maxUses != null ? String(promo.maxUses) : '',
      validFrom: promo.validFrom ? promo.validFrom.slice(0, 10) : '',
      validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : '',
      isActive: promo.isActive !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount || 0),
      maxDiscount: formData.maxDiscount !== '' ? Number(formData.maxDiscount) : null,
      maxUses: formData.maxUses !== '' ? Number(formData.maxUses) : null,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
    };

    try {
      if (editing) {
        await api.put(`/promotions/${editing.id}`, payload);
      } else {
        await api.post('/promotions', payload);
      }
      closeModal();
      load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement');
    }
  };

  const handleToggle = async (promo) => {
    try {
      await api.patch(`/promotions/${promo.id}/toggle`);
      load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (promo) => {
    if (!window.confirm(`Supprimer le code ${promo.code} ?`)) return;
    try {
      await api.delete(`/promotions/${promo.id}`);
      load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={heroStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag size={28} color="#e67e22" /> Promotions
            </h1>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Gérez les remises sur les produits (soldes) et les codes promo au checkout.
            </p>
          </div>
          {tab === 'codes' && (
            <button type="button" onClick={openCreate} style={primaryBtnStyle}>
              <Plus size={18} /> Nouveau code
            </button>
          )}
        </div>
      </motion.div>

      <div style={tabBarStyle}>
        <button
          type="button"
          onClick={() => setTab('products')}
          style={{ ...tabBtnStyle, ...(tab === 'products' ? tabBtnActiveStyle : {}) }}
        >
          <Package size={16} /> Promotions produits
        </button>
        <button
          type="button"
          onClick={() => setTab('codes')}
          style={{ ...tabBtnStyle, ...(tab === 'codes' ? tabBtnActiveStyle : {}) }}
        >
          <Tag size={16} /> Codes promo
        </button>
      </div>

      {tab === 'products' ? (
        <AdminProductPromotions />
      ) : (
        <>
      <div style={statsRowStyle}>
        <div style={statCardStyle}><strong>{stats.total}</strong><span>Codes</span></div>
        <div style={statCardStyle}><strong>{stats.active}</strong><span>Actifs</span></div>
        <div style={statCardStyle}><strong>{stats.uses}</strong><span>Utilisations</span></div>
      </div>

      <div style={filterBarStyle}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div style={cardStyle}>Aucun code promo. Créez-en un pour vos campagnes.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Libellé</th>
                <th style={thStyle}>Réduction</th>
                <th style={thStyle}>Min. commande</th>
                <th style={thStyle}>Validité</th>
                <th style={thStyle}>Utilisations</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((promo) => (
                <tr key={promo.id}>
                  <td style={tdStyle}>
                    <code style={codeBadgeStyle}>{promo.code}</code>
                  </td>
                  <td style={tdStyle}>{promo.label || '—'}</td>
                  <td style={tdStyle}>{formatDiscount(promo)}</td>
                  <td style={tdStyle}>{Number(promo.minOrderAmount || 0).toFixed(2)} DT</td>
                  <td style={tdStyle}>
                    {formatDate(promo.validFrom)} → {formatDate(promo.validUntil)}
                  </td>
                  <td style={tdStyle}>
                    {promo.usedCount || 0}
                    {promo.maxUses != null ? ` / ${promo.maxUses}` : ''}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      ...statusPillStyle,
                      color: promo.isActive ? '#15803d' : '#9ca3af',
                      background: promo.isActive ? '#dcfce7' : '#f3f4f6',
                    }}>
                      {promo.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => openEdit(promo)} style={iconBtnStyle} title="Modifier">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => handleToggle(promo)} style={iconBtnStyle} title="Activer / désactiver">
                        {promo.isActive ? <ToggleRight size={18} color="#15803d" /> : <ToggleLeft size={18} color="#9ca3af" />}
                      </button>
                      <button type="button" onClick={() => handleDelete(promo)} style={{ ...iconBtnStyle, color: '#dc2626' }} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && tab === 'codes' && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>
              {editing ? 'Modifier le code promo' : 'Nouveau code promo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={formGridStyle}>
                <label style={labelStyle}>
                  Code *
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    style={inputStyle}
                    placeholder="CHAT10"
                    required
                  />
                </label>
                <label style={labelStyle}>
                  Libellé
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    style={inputStyle}
                    placeholder="Promo chats — 10 %"
                  />
                </label>
                <label style={labelStyle}>
                  Type
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DT)</option>
                  </select>
                </label>
                <label style={labelStyle}>
                  Valeur *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={formData.discountType === 'percent' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </label>
                <label style={labelStyle}>
                  Montant min. commande (DT)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={inputStyle}
                  />
                </label>
                {formData.discountType === 'percent' && (
                  <label style={labelStyle}>
                    Plafond réduction (DT)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      style={inputStyle}
                      placeholder="Optionnel"
                    />
                  </label>
                )}
                <label style={labelStyle}>
                  Limite d&apos;utilisations
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    style={inputStyle}
                    placeholder="Illimité"
                  />
                </label>
                <label style={labelStyle}>
                  Début validité
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  Fin validité
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    style={inputStyle}
                  />
                </label>
              </div>
              <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Code actif
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={closeModal} style={secondaryBtnStyle}>Annuler</button>
                <button type="submit" style={primaryBtnStyle}>{editing ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

const heroStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
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

const filterBarStyle = { marginBottom: 16 };

const tabBarStyle = {
  display: 'flex',
  gap: 8,
  marginBottom: 20,
  flexWrap: 'wrap',
};

const tabBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 18px',
  borderRadius: 12,
  border: '2px solid #e5e7eb',
  background: 'white',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  color: '#6b7280',
};

const tabBtnActiveStyle = {
  borderColor: '#e67e22',
  background: '#fff7ed',
  color: '#c2410c',
};

const selectStyle = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
};

const cardStyle = {
  background: 'white',
  borderRadius: 14,
  padding: 32,
  textAlign: 'center',
  color: '#6b7280',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
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
  padding: '14px 16px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#6b7280',
  borderBottom: '1px solid #f3f4f6',
  background: '#fafafa',
};

const tdStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  verticalAlign: 'middle',
};

const codeBadgeStyle = {
  background: '#fff7ed',
  color: '#c2410c',
  padding: '4px 10px',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 13,
};

const statusPillStyle = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #e67e22, #d35400)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '12px 20px',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const iconBtnStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '6px 8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: 16,
};

const modalStyle = {
  background: 'white',
  borderRadius: 18,
  padding: 28,
  width: '100%',
  maxWidth: 640,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  fontWeight: 400,
};

export default AdminPromotions;
