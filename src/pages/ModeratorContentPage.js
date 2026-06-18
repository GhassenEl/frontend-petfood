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
import { detectContentAnomalies } from '../utils/contentAnomalyDetector';
import './ModeratorPages.css';

const PRODUCT_IMG_FALLBACK = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop';

const ProductThumb = ({ src, alt, className }) => (
  <img
    src={src || PRODUCT_IMG_FALLBACK}
    alt={alt}
    className={className}
    onError={(e) => { e.currentTarget.src = PRODUCT_IMG_FALLBACK; }}
  />
);

const MSG_TIMEOUT_MS = 4000;

const ModeratorContentPage = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [inappropriate, setInappropriate] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [busyId, setBusyId] = useState(null);

  const showMsg = useCallback((text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, contentRes] = await Promise.all([
        fetchModeratorPendingProducts(),
        fetchModeratorInappropriate(),
      ]);
      setProducts(prodRes.data.products || []);
      setInappropriate(contentRes.data.items || []);
      setDemo(prodRes.demo || contentRes.demo);
    } catch (err) {
      setProducts([]);
      setInappropriate([]);
      showMsg(err?.message || 'Impossible de charger les données.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMsg]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!msg) return undefined;
    const timer = setTimeout(() => setMsg(''), MSG_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [msg]);

  const runAction = async (id, action, { confirmText, successText }) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(id);
    try {
      await action(id);
      showMsg(successText);
      await load();
    } catch (err) {
      showMsg(err?.message || 'Action impossible.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const pendingProducts = products.filter((p) => p.status === 'pending');
  const imageQueue = products.filter((p) => p.imageFlag);
  const openReports = inappropriate.filter((i) => i.status === 'open').length;
  const anomalyFlags = inappropriate.map((item) => ({
    item,
    anomaly: detectContentAnomalies(item.content),
  })).filter((x) => x.anomaly.suspicious);

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Package size={24} /> Gestion du contenu {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Valider les produits, supprimer les contenus inappropriés et vérifier les images.</p>
      </header>

      {msg && (
        <p
          className={`mod-feedback mod-feedback--${msgType === 'error' ? 'error' : 'success'}`}
          role="status"
        >
          {msg}
        </p>
      )}

      {anomalyFlags.length > 0 && (
        <p className="mod-feedback mod-feedback--error" role="status">
           {anomalyFlags.length} contenu(s) signalé(s) automatiquement (langage inapproprié / spam)
        </p>
      )}

      <div className="mod-tabs" role="tablist" aria-label="Sections modération contenu">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'products'}
          className={`mod-tab${tab === 'products' ? ' mod-tab--active' : ''}`}
          onClick={() => setTab('products')}
        >
          Nouveaux produits ({pendingProducts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'inappropriate'}
          className={`mod-tab${tab === 'inappropriate' ? ' mod-tab--active' : ''}`}
          onClick={() => setTab('inappropriate')}
        >
          Contenus inappropriés ({openReports})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'images'}
          className={`mod-tab${tab === 'images' ? ' mod-tab--active' : ''}`}
          onClick={() => setTab('images')}
        >
          <Image size={14} /> Images ({imageQueue.length})
        </button>
        <Link to="/moderator/reviews" className="mod-btn mod-btn--ghost mod-btn--sm">
          <Star size={14} /> Modérer les avis →
        </Link>
      </div>

      <div className="mod-card">
        {loading ? (
          <p className="mod-empty">Chargement…</p>
        ) : (
          <>
            {tab === 'products' && (
              pendingProducts.length === 0 ? (
                <p className="mod-empty">Aucun produit en attente.</p>
              ) : (
                <table className="mod-table">
                  <thead>
                    <tr><th>Produit</th><th>Vendeur</th><th>Prix</th><th>Soumis</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="mod-product-row">
                            <ProductThumb src={p.imageUrl} alt={p.name} className="mod-product-thumb" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.vendorName}</td>
                        <td>{p.price} DT</td>
                        <td>{new Date(p.submittedAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <button
                            type="button"
                            className="mod-btn mod-btn--primary mod-btn--sm"
                            disabled={busyId === p.id}
                            onClick={() => runAction(p.id, approveModeratorProduct, { successText: 'Produit validé.' })}
                          >
                            <Check size={14} /> Valider
                          </button>
                          {' '}
                          <button
                            type="button"
                            className="mod-btn mod-btn--danger mod-btn--sm"
                            disabled={busyId === p.id}
                            onClick={() => runAction(p.id, rejectModeratorProduct, {
                              confirmText: `Refuser le produit « ${p.name} » ?`,
                              successText: 'Produit refusé.',
                            })}
                          >
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
              inappropriate.length === 0 ? (
                <p className="mod-empty">Aucun signalement.</p>
              ) : (
                inappropriate.map((item) => (
                  <div key={item.id} className="mod-flag-item">
                    <div className="mod-flag-item__row">
                      <div>
                        <strong>{item.target}</strong>
                        <span className={`mod-badge mod-badge--${item.status === 'open' ? 'open' : 'resolved'} mod-flag-item__status`}>
                          {item.status}
                        </span>
                        <p className="mod-flag-item__content">{item.content}</p>
                        {(() => {
                          const a = detectContentAnomalies(item.content);
                          return a.suspicious ? (
                            <p className="mod-feedback mod-feedback--error" style={{ marginTop: 8, padding: '6px 10px', fontSize: '0.78rem' }}>
                              🤖 Anomalie auto · {a.summary}
                            </p>
                          ) : null;
                        })()}
                        <small className="mod-flag-item__meta">Signalé par {item.reporter}</small>
                      </div>
                      {item.status === 'open' && (
                        <button
                          type="button"
                          className="mod-btn mod-btn--danger mod-btn--sm"
                          disabled={busyId === item.id}
                          onClick={() => runAction(item.id, deleteModeratorContent, {
                            confirmText: `Supprimer le contenu signalé « ${item.target} » ?`,
                            successText: 'Contenu supprimé.',
                          })}
                        >
                          <Trash2 size={14} /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {tab === 'images' && (
              imageQueue.length === 0 ? (
                <p className="mod-empty">Aucune image à vérifier.</p>
              ) : (
                <table className="mod-table">
                  <thead>
                    <tr><th>Image</th><th>Produit</th><th>Alerte</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {imageQueue.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <ProductThumb src={p.imageUrl} alt={p.name} className="mod-product-thumb mod-product-thumb--lg" />
                        </td>
                        <td>{p.name}<br /><small className="mod-flag-item__meta">{p.vendorName}</small></td>
                        <td><span className="mod-badge mod-badge--flagged">{p.imageFlag}</span></td>
                        <td>
                          <button
                            type="button"
                            className="mod-btn mod-btn--success mod-btn--sm"
                            disabled={busyId === p.id}
                            onClick={() => runAction(p.id, approveModeratorImage, { successText: 'Image validée.' })}
                          >
                            <Check size={14} /> Approuver
                          </button>
                          {' '}
                          <button
                            type="button"
                            className="mod-btn mod-btn--danger mod-btn--sm"
                            disabled={busyId === p.id}
                            onClick={() => runAction(p.id, rejectModeratorProduct, {
                              confirmText: `Refuser le produit « ${p.name} » à cause de l'image ?`,
                              successText: 'Produit refusé.',
                            })}
                          >
                            Refuser produit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModeratorContentPage;
