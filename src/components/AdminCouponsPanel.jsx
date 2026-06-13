import React, { useEffect, useState } from 'react';
import { Tag, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../utils/api';
import { DEMO_ADMIN_COUPONS, withDemoFallback } from '../utils/adminDemoData';

const emptyForm = {
  code: '',
  label: '',
  type: 'percent',
  value: '10',
  minOrder: '50',
  maxUses: '100',
  expiresAt: '',
};

const AdminCouponsPanel = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(withDemoFallback(data, DEMO_ADMIN_COUPONS));
    } catch {
      setCoupons(DEMO_ADMIN_COUPONS);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (coupon) => {
    const next = !coupon.active;
    try {
      await api.patch(`/admin/coupons/${coupon.id}`, { active: next });
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: next } : c)));
    } catch {
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: next } : c)));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      window.alert('Code obligatoire');
      return;
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      label: form.label.trim() || form.code.trim(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || 100,
      expiresAt: form.expiresAt || '2026-12-31',
      active: true,
      usedCount: 0,
    };
    try {
      const { data } = await api.post('/admin/coupons', payload);
      setCoupons((prev) => [data, ...prev]);
    } catch {
      setCoupons((prev) => [{ ...payload, id: `cp-${Date.now()}` }, ...prev]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  if (loading) return <p style={{ color: '#64748b' }}>Chargement coupons…</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <p style={{ margin: 0, color: '#64748b' }}>
          {coupons.filter((c) => c.active).length} coupon(s) actif(s) · utilisables au checkout client
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nouveau coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#f8fafc', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <label style={labelStyle}>
              Code *
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={inputStyle} placeholder="PETFOOD10" />
            </label>
            <label style={labelStyle}>
              Libellé
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (DT)</option>
              </select>
            </label>
            <label style={labelStyle}>
              Valeur
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Commande min. (DT)
              <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Utilisations max
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Expiration
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Créer le coupon</button>
        </form>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {coupons.map((c) => (
          <div
            key={c.id}
            style={{
              background: 'white',
              borderRadius: 14,
              padding: '16px 18px',
              border: `1px solid ${c.active ? '#bbf7d0' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} color="#e67e22" /> {c.code}
              </p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{c.label}</p>
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                {c.type === 'percent' ? `${c.value} %` : `${c.value} DT`} · min. {c.minOrder} DT · {c.usedCount}/{c.maxUses} utilisations
                {c.expiresAt && ` · expire ${new Date(c.expiresAt).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <button type="button" onClick={() => toggleActive(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title={c.active ? 'Désactiver' : 'Activer'}>
              {c.active ? <ToggleRight size={32} color="#059669" /> : <ToggleLeft size={32} color="#94a3b8" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 };
const inputStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 4 };

export default AdminCouponsPanel;
