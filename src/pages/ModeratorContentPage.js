import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Trash2, Check, Image, Star } from 'lucide-react';
import {
  fetchModeratorPendingProducts,
  approveModeratorProduct,
  rejectModeratorProduct,
  fetchModeratorInappropriate,
  deleteModeratorContent,
  approveModeratorImage,
} from '../services/moderatorService';
import './ModeratorPages.css';

const ModeratorContentPage = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [inappropriate, setInappropriate] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [prodRes, contentRes] = await Promise.all([
      fetchModeratorPendingProducts(),
      fetchModeratorInappropriate(),
    ]);
    setProducts(prodRes.data.products || []);
    setInappropriate(contentRes.data.items || []);
    setDemo(prodRes.demo || contentRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingProducts = products.filter((p) => p.status === 'pending');
  const imageQueue = products.filter((p) => p.imageFlag);

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Package size={24} /> Gestion du contenu {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Valider les produits, supprimer les contenus inappropriés et vérifier les images.</p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <div className="mod-tabs">
        <button type="button" className={`mod-tab${tab === 'products' ? ' mod-tab--active' : ''}`} onClick={() => setTab('products')}>
          Nouveaux produits ({pendingProducts.length})
        </button>
        <button type="button" className={`mod-tab${tab === 'inappropriate' ? ' mod-tab--active' : ''}`} onClick={() => setTab('inappropriate')}>
          Contenus inappropriés ({inappropriate.filter((i) => i.status === 'open').length})
        </button>
        <button type="button" className={`mod-tab${tab === 'images' ? ' mod-tab--active' : ''}`} onClick={() => setTab('images')}>
          <Image size={14} /> Images ({imageQueue.length})
        </button>
        <Link to="/moderator/reviews" className="mod-btn mod-btn--ghost mod-btn--sm">
          <Star size={14} /> Modérer les avis →
        </Link>
      </div>

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : tab === 'products' && (
          pendingProducts.length === 0 ? <p className="mod-empty">Aucun produit en attente.</p> : (
            <table className="mod-table">
              <thead>
                <tr><th>Produit</th><th>Vendeur</th><th>Prix</th><th>Soumis</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pendingProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.imageUrl} alt="" className="mod-product-thumb" />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.vendorName}</td>
                    <td>{p.price} DT</td>
                    <td>{new Date(p.submittedAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={async () => { await approveModeratorProduct(p.id); setMsg('Produit validé.'); load(); }}>
                        <Check size={14} /> Valider
                      </button>
                      {' '}
                      <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={async () => { await rejectModeratorProduct(p.id); setMsg('Produit refusé.'); load(); }}>
                        <Trash2 size={14} /> Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'inappropriate' && (
          inappropriate.length === 0 ? <p className="mod-empty">Aucun signalement.</p> : (
            inappropriate.map((item) => (
              <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <strong>{item.target}</strong>
                    <span className={`mod-badge mod-badge--${item.status === 'open' ? 'open' : 'resolved'}`} style={{ marginLeft: 8 }}>
                      {item.status}
                    </span>
                    <p style={{ margin: '6px 0', color: '#64748b', fontSize: '0.85rem' }}>{item.content}</p>
                    <small style={{ color: '#94a3b8' }}>Signalé par {item.reporter}</small>
                  </div>
                  {item.status === 'open' && (
                    <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={async () => { await deleteModeratorContent(item.id); setMsg('Contenu supprimé.'); load(); }}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {tab === 'images' && (
          imageQueue.length === 0 ? <p className="mod-empty">Aucune image à vérifier.</p> : (
            <table className="mod-table">
              <thead>
                <tr><th>Image</th><th>Produit</th><th>Alerte</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {imageQueue.map((p) => (
                  <tr key={p.id}>
                    <td><img src={p.imageUrl} alt="" className="mod-product-thumb" style={{ width: 64, height: 64 }} /></td>
                    <td>{p.name}<br /><small>{p.vendorName}</small></td>
                    <td><span className="mod-badge mod-badge--flagged">{p.imageFlag}</span></td>
                    <td>
                      <button type="button" className="mod-btn mod-btn--success mod-btn--sm" onClick={async () => { await approveModeratorImage(p.id); setMsg('Image validée.'); load(); }}>
                        <Check size={14} /> Approuver
                      </button>
                      {' '}
                      <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={async () => { await rejectModeratorProduct(p.id); setMsg('Produit refusé.'); load(); }}>
                        Refuser produit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default ModeratorContentPage;
