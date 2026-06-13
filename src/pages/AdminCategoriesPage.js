import React, { useCallback, useEffect, useState } from 'react';
import { Tags, Plus, Trash2 } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import './AdminPages.css';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ value: '', label: '' });
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchCategories();
    setCategories(Array.isArray(data) ? data : (data?.categories || []));
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.value || !form.label) return;
    await createCategory({ value: form.value.toLowerCase().replace(/\s+/g, '_'), label: form.label });
    setForm({ value: '', label: '' });
    setMsg('Catégorie ajoutée.');
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Tags size={24} /> Catégories produits {demo && <span className="adm-demo-pill">Mode démo</span>}</h1>
        <p>Gérer les catégories du catalogue — appliquées aux produits admin, client et vendeur.</p>
      </header>
      {msg && <p className="adm-msg">{msg}</p>}

      <div className="adm-card">
        <h2>Ajouter une catégorie</h2>
        <form onSubmit={add} className="adm-form-grid">
          <label>Code<input required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="ex: hygiene" /></label>
          <label>Libellé<input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="ex: 🧴 Hygiène" /></label>
        </form>
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" style={{ marginTop: 12 }} onClick={add}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="adm-card">
        {loading ? <p>Chargement…</p> : (
          <table className="adm-table">
            <thead><tr><th>Code</th><th>Libellé</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id || c.value}>
                  <td style={{ fontFamily: 'monospace' }}>{c.value}</td>
                  <td>
                    <input
                      value={c.label}
                      onChange={(e) => setCategories((list) => list.map((x) => ((x.id || x.value) === (c.id || c.value) ? { ...x, label: e.target.value } : x)))}
                      onBlur={() => updateCategory(c.id || c.value, { label: c.label })}
                      style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', width: '100%' }}
                    />
                  </td>
                  <td><span className="adm-badge adm-badge--active">{c.active !== false ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => remove(c.id || c.value)}>
                      <Trash2 size={14} />
                    </button>
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

export default AdminCategoriesPage;
