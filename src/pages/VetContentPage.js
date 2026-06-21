import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import './VetContentPage.css';

const STORAGE_KEY = 'petfood_vet_content';

const DEFAULT_ARTICLES = [
  { id: 'a1', title: 'Prévention parasites printemps', category: 'conseil', status: 'published', updatedAt: new Date().toISOString() },
  { id: 'a2', title: 'Alimentation chiot — guide propriétaire', category: 'nutrition', status: 'draft', updatedAt: new Date().toISOString() },
];

const VetContentPage = () => {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'conseil', body: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      setArticles(stored?.length ? stored : DEFAULT_ARTICLES);
    } catch {
      setArticles(DEFAULT_ARTICLES);
    }
  }, []);

  const persist = useCallback((list) => {
    setArticles(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const saveArticle = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const item = {
      id: `a-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      body: form.body,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    persist([item, ...articles]);
    setForm({ title: '', category: 'conseil', body: '' });
    setMsg('Contenu enregistré en brouillon.');
    setTimeout(() => setMsg(''), 3000);
  };

  const publish = (id) => {
    persist(articles.map((a) => (a.id === id ? { ...a, status: 'published', updatedAt: new Date().toISOString() } : a)));
    setMsg('Article publié.');
    setTimeout(() => setMsg(''), 3000);
  };

  const remove = (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    persist(articles.filter((a) => a.id !== id));
  };

  return (
    <div className="vetcontent-page">
      <header className="vetcontent-hero">
        <h1><FileText size={24} /> Gestion du contenu</h1>
        <p>Articles conseils, fiches nutrition et informations clinique pour vos clients.</p>
      </header>

      {msg && <p className="vetcontent-msg">{msg}</p>}

      <form className="vetcontent-form" onSubmit={saveArticle}>
        <h3><Plus size={16} /> Nouveau contenu</h3>
        <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="conseil">Conseil santé</option>
          <option value="nutrition">Nutrition</option>
          <option value="prevention">Prévention</option>
          <option value="faq">FAQ</option>
        </select>
        <textarea rows={4} placeholder="Contenu…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button type="submit" className="vetcontent-btn"><Save size={14} /> Enregistrer brouillon</button>
      </form>

      <section className="vetcontent-list">
        <h3>Mes contenus ({articles.length})</h3>
        {articles.map((a) => (
          <article key={a.id} className="vetcontent-item">
            <div>
              <strong>{a.title}</strong>
              <span className={`vetcontent-badge vetcontent-badge--${a.status}`}>{a.status === 'published' ? 'Publié' : 'Brouillon'}</span>
              <p>{a.category} · {new Date(a.updatedAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="vetcontent-actions">
              {a.status !== 'published' && (
                <button type="button" onClick={() => publish(a.id)}>Publier</button>
              )}
              <button type="button" className="vetcontent-del" onClick={() => remove(a.id)}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default VetContentPage;
