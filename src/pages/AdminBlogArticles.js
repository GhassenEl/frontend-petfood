import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { BLOG_CATEGORIES } from '../constants/productCategories';
import {
  getAdminBlogArticles,
  createBlogArticle,
  updateBlogArticle,
  deleteBlogArticle,
} from '../services/blogArticleService';

const emptyForm = {
  title: '',
  category: 'Guide',
  excerpt: '',
  body: '',
  readMin: 5,
  isPublished: true,
};

const AdminBlogArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setArticles(await getAdminBlogArticles());
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les articles.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (article) => {
    setEditing(article);
    setForm({
      title: article.title || '',
      category: article.category || 'Guide',
      excerpt: article.excerpt || '',
      body: article.body || '',
      readMin: article.readMin ?? 5,
      isPublished: article.isPublished !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        readMin: Number(form.readMin) || 5,
      };
      if (editing) {
        await updateBlogArticle(editing.id || editing._id, payload);
      } else {
        await createBlogArticle(payload);
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Supprimer « ${article.title} » ?`)) return;
    try {
      await deleteBlogArticle(article.id || article._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  };

  const togglePublish = async (article) => {
    try {
      await updateBlogArticle(article.id || article._id, {
        isPublished: !article.isPublished,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Mise à jour impossible.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          borderRadius: 18,
          padding: 24,
          marginBottom: 24,
          border: '1px solid #bfdbfe',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={28} color="#2563eb" />
            Articles blog nutrition
          </h1>
          <p style={{ margin: 0, color: '#64748b', maxWidth: 520 }}>
            Publiez des articles visibles par les clients dans Mes avis → Nutrition &amp; Blog.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          Nouvel article
        </button>
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginBottom: 16, fontWeight: 600 }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.length === 0 && (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
              Aucun article. Créez le premier ou lancez{' '}
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                node scripts/seed-blog-articles.js
              </code>{' '}
              dans le backend.
            </p>
          )}
          {articles.map((article) => (
            <article
              key={article.id || article._id}
              style={{
                background: 'white',
                borderRadius: 14,
                padding: 18,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 20,
                        background: '#dbeafe',
                        color: '#1e40af',
                      }}
                    >
                      {article.category}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 20,
                        background: article.isPublished ? '#dcfce7' : '#f3f4f6',
                        color: article.isPublished ? '#166534' : '#6b7280',
                      }}
                    >
                      {article.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{article.readMin} min</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>{article.title}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{article.excerpt}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button
                    type="button"
                    title={article.isPublished ? 'Dépublier' : 'Publier'}
                    onClick={() => togglePublish(article)}
                    style={iconBtn}
                  >
                    {article.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button type="button" title="Modifier" onClick={() => openEdit(article)} style={iconBtn}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" title="Supprimer" onClick={() => handleDelete(article)} style={{ ...iconBtn, background: '#fef2f2' }}>
                    <Trash2 size={16} color="#dc2626" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>
              {editing ? 'Modifier l’article' : 'Nouvel article'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                required
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={inputStyle}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={60}
                  placeholder="Durée lecture (min)"
                  value={form.readMin}
                  onChange={(e) => setForm({ ...form, readMin: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <textarea
                required
                rows={2}
                placeholder="Extrait (résumé court)"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                style={inputStyle}
              />
              <textarea
                required
                rows={8}
                placeholder="Contenu de l’article"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                style={inputStyle}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Publier immédiatement (visible côté client)
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} style={saveBtn}>
                  {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const iconBtn = {
  padding: 10,
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#f9fafb',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
};

const modalStyle = {
  background: 'white',
  borderRadius: 18,
  padding: 24,
  width: 560,
  maxWidth: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const cancelBtn = {
  padding: '10px 18px',
  background: '#f3f4f6',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

const saveBtn = {
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

export default AdminBlogArticles;
