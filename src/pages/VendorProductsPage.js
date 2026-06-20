import React, { useCallback, useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2, Tag, FolderOpen } from 'lucide-react';
import { formatDT } from '../utils/formatCurrency';
import { resolveNaturalProductImage } from '../utils/productImages';
import SafeImage from '../components/SafeImage';
import { PLATFORM_IMAGES } from '../utils/platformImages';
import {
  fetchVendorCatalog,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  updateVendorStock,
  createVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
} from '../services/vendorService';
import AdminImageUpload from '../components/AdminImageUpload';
import './VendorPages.css';

const ProductThumb = ({ product }) => (
  <SafeImage
    src={resolveNaturalProductImage(product)}
    fallback={PLATFORM_IMAGES.productDefault}
    product={product}
    alt=""
    className="vnd-product-img"
  />
);

const emptyProduct = {
  name: '', categoryId: '', price: '', stock: '', description: '', imageUrl: '', promotionPercent: 0,
};

const emptyCategory = { label: '', icon: '📦' };

const stockBadge = (stock) => {
  const n = Number(stock);
  if (n <= 0) return <span className="vnd-badge vnd-badge--out">Rupture</span>;
  if (n < 5) return <span className="vnd-badge vnd-badge--low">Stock bas</span>;
  return null;
};

const VendorProductsPage = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [catForm, setCatForm] = useState(emptyCategory);
  const [editingCat, setEditingCat] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVendorCatalog();
    setProducts(data.products || []);
    setCategories(data.categories || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label || '—';

  const saveProduct = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      promotionPercent: Number(form.promotionPercent) || 0,
    };
    if (editing) {
      await updateVendorProduct(editing, body);
      setMsg('Produit modifié.');
    } else {
      await createVendorProduct(body);
      setMsg('Produit ajouté.');
    }
    setForm(emptyProduct);
    setEditing(null);
    load();
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      categoryId: p.categoryId || '',
      price: p.price,
      stock: p.stock,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      promotionPercent: p.promotionPercent || 0,
    });
    setTab('products');
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await deleteVendorProduct(id);
    setMsg('Produit supprimé.');
    load();
  };

  const quickStock = async (id, stock) => {
    await updateVendorStock(id, stock);
    load();
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (editingCat) {
      await updateVendorCategory(editingCat, catForm);
      setMsg('Catégorie modifiée.');
    } else {
      await createVendorCategory(catForm);
      setMsg('Catégorie ajoutée.');
    }
    setCatForm(emptyCategory);
    setEditingCat(null);
    load();
  };

  const removeCategory = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    await deleteVendorCategory(id);
    load();
  };

  const promoProducts = products.filter((p) => Number(p.promotionPercent) > 0);

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><Package size={24} /> Gestion des produits {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Ajouter, modifier, catégoriser, photos, stocks et promotions de votre catalogue.</p>
      </header>

      <div className="vnd-tabs">
        {[
          { id: 'products', label: '🏷️ Produits' },
          { id: 'categories', label: '📁 Catégories' },
          { id: 'promotions', label: '🏷️ Promotions' },
          { id: 'stocks', label: '📦 Stocks' },
        ].map((t) => (
          <button key={t.id} type="button" className={`vnd-tab ${tab === t.id ? 'vnd-tab--active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <p style={{ color: '#0d9488', fontWeight: 600, marginBottom: 12 }}>{msg}</p>}

      {tab === 'products' && (
        <>
          <div className="vnd-card">
            <h2>{editing ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
            <form onSubmit={saveProduct}>
              <div className="vnd-form-grid">
                <label>Nom *
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>Catégorie
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </label>
                <label>Prix (DT) *
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </label>
                <label>Stock *
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </label>
                <label>Promotion (%)
                  <input type="number" min="0" max="90" value={form.promotionPercent} onChange={(e) => setForm({ ...form, promotionPercent: e.target.value })} />
                </label>
                <AdminImageUpload
                  label="Photo produit"
                  folder="products"
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                />
              </div>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
              </label>
              <div className="vnd-form-actions">
                <button type="submit" className="vnd-btn vnd-btn--primary"><Plus size={16} /> {editing ? 'Enregistrer' : 'Ajouter'}</button>
                {editing && (
                  <button type="button" className="vnd-btn vnd-btn--ghost" onClick={() => { setEditing(null); setForm(emptyProduct); }}>Annuler</button>
                )}
              </div>
            </form>
          </div>

          <div className="vnd-card">
            <h2>Catalogue ({products.length})</h2>
            {loading ? <p className="vnd-empty">Chargement…</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table className="vnd-table">
                  <thead>
                    <tr>
                      <th>Photo</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Promo</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td><ProductThumb product={p} /></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{catLabel(p.categoryId)}</td>
                        <td>{formatDT(p.price, { decimals: 0 })}</td>
                        <td>{p.stock} {stockBadge(p.stock)}</td>
                        <td>{p.promotionPercent ? `-${p.promotionPercent}%` : '—'}</td>
                        <td>
                          <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => startEdit(p)}><Pencil size={14} /></button>
                          {' '}
                          <button type="button" className="vnd-btn vnd-btn--danger vnd-btn--sm" onClick={() => removeProduct(p.id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'categories' && (
        <div className="vnd-card">
          <h2><FolderOpen size={18} /> Gérer les catégories</h2>
          <form onSubmit={saveCategory} style={{ marginBottom: 20 }}>
            <div className="vnd-form-grid">
              <label>Nom
                <input required value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} />
              </label>
              <label>Icône
                <input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
              </label>
            </div>
            <button type="submit" className="vnd-btn vnd-btn--primary">{editingCat ? 'Modifier' : 'Ajouter'} catégorie</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map((c) => (
              <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{c.icon} {c.label}</span>
                <span>
                  <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => { setEditingCat(c.id); setCatForm({ label: c.label, icon: c.icon }); }}>Modifier</button>
                  {' '}
                  <button type="button" className="vnd-btn vnd-btn--danger vnd-btn--sm" onClick={() => removeCategory(c.id)}>Supprimer</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'promotions' && (
        <div className="vnd-card">
          <h2><Tag size={18} /> Définir les promotions</h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Modifiez le pourcentage promo depuis l&apos;onglet Produits ou ci-dessous.</p>
          {promoProducts.length === 0 ? <p className="vnd-empty">Aucune promotion active.</p> : (
            <table className="vnd-table">
              <thead><tr><th>Produit</th><th>Prix</th><th>Promo</th><th>Prix promo</th><th>Action</th></tr></thead>
              <tbody>
                {promoProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{formatDT(p.price, { decimals: 0 })}</td>
                    <td>-{p.promotionPercent}%</td>
                    <td>{formatDT(p.price * (1 - p.promotionPercent / 100), { decimals: 2 })}</td>
                    <td><button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => startEdit(p)}>Modifier</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'stocks' && (
        <div className="vnd-card">
          <h2>Mettre à jour les stocks</h2>
          <table className="vnd-table">
            <thead><tr><th>Produit</th><th>Stock actuel</th><th>Mise à jour rapide</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name} {stockBadge(p.stock)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <input type="number" min="0" defaultValue={p.stock} style={{ width: 72, marginRight: 8, padding: 6, borderRadius: 6, border: '1px solid #e2e8f0' }}
                      onBlur={(e) => { if (Number(e.target.value) !== p.stock) quickStock(p.id, e.target.value); }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;
