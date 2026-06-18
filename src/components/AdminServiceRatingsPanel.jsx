import React, { useEffect, useMemo, useState } from 'react';
import { Star, Trash2, Truck, Stethoscope, MapPin, Search } from 'lucide-react';
import {
  getServiceRatings,
  deleteServiceRating,
  getServiceRatingStats,
} from '../services/serviceRatingService';
import '../pages/ClientComplaintsPage.css';

const ratingId = (r) => r?.id || r?._id;
const userOf = (r) => r?.user || r?.userId;

const AdminServiceRatingsPanel = ({ showToast, variant = 'admin' }) => {
  const isModerator = variant === 'moderator';
  const [tab, setTab] = useState(isModerator ? 'veterinary' : 'delivery');
  const [ratings, setRatings] = useState([]);
  const [regionStats, setRegionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([
        getServiceRatings(),
        getServiceRatingStats('delivery'),
      ]);
      setRatings(Array.isArray(list) ? list : []);
      setRegionStats(Array.isArray(stats) ? stats : []);
    } catch {
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const list = ratings.filter((r) => r.type === tab);
    if (!list.length) return { total: 0, average: '—', five: 0 };
    const sum = list.reduce((a, r) => a + (r.rating || 0), 0);
    return {
      total: list.length,
      average: (sum / list.length).toFixed(1),
      five: list.filter((r) => r.rating === 5).length,
    };
  }, [ratings, tab]);

  const filtered = useMemo(() => {
    let list = ratings.filter((r) => r.type === tab);
    if (filter !== 'all') {
      const n = Number(filter.replace('star-', ''));
      list = list.filter((r) => r.rating === n);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const u = userOf(r);
      const hay = [
        u?.name,
        u?.email,
        r.comment,
        r.region,
        r.order?.region,
        r.orderId,
        r.appointmentId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [ratings, tab, filter, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette note de service ?')) return;
    try {
      await deleteServiceRating(id);
      await load();
      showToast('Note de service supprimée.');
    } catch {
      showToast('Suppression impossible.', 'error');
    }
  };

  const typeLabel = tab === 'delivery' ? 'Livraison' : 'Vétérinaire';
  const TypeIcon = tab === 'delivery' ? Truck : Stethoscope;

  return (
    <div>
      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#1e3a8a' }}>{stats.total}</strong>
          <span>Notes {typeLabel.toLowerCase()}</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#f59e0b' }}>{stats.average}</strong>
          <span>Moyenne</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#16a34a' }}>{stats.five}</strong>
          <span>5 étoiles</span>
        </div>
        {tab === 'delivery' && !isModerator && regionStats.length > 0 && (
          <div className="cc-stat">
            <strong style={{ color: '#7c3aed' }}>{regionStats.length}</strong>
            <span>Régions notées</span>
          </div>
        )}
      </div>

      <div className="cc-categories" style={{ marginBottom: 16 }}>
        {(isModerator
          ? [{ id: 'veterinary', label: '🩺 Service vétérinaire' }]
          : [
            { id: 'delivery', label: '🚚 Livraison par région' },
            { id: 'veterinary', label: '🩺 Service vétérinaire' },
          ]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`cc-cat-btn ${tab === id ? 'active' : ''}`}
            onClick={() => { setTab(id); setFilter('all'); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="cc-search">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Rechercher par client, région, commentaire…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="cc-search-count">{filtered.length} résultat(s)</span>
      </div>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Modération</h2>
        <div className="cc-filters">
          <button type="button" className={`cc-filter-btn reviews ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Tous
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              className={`cc-filter-btn reviews ${filter === `star-${n}` ? 'active' : ''}`}
              onClick={() => setFilter(`star-${n}`)}
            >
              {n} ★
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="cc-empty">
          <TypeIcon size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucune note{search ? ' pour cette recherche' : ''}.</p>
        </div>
      ) : (
        <div className="cc-list">
          {filtered.map((r) => {
            const u = userOf(r);
            return (
              <article key={ratingId(r)} className="cc-card review">
                <div className="cc-card-head">
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TypeIcon size={18} />
                      {typeLabel}
                      {r.region && (
                        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                          <MapPin size={14} style={{ verticalAlign: 'middle' }} /> {r.region}
                        </span>
                      )}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} fill={i <= r.rating ? '#f59e0b' : 'none'} color={i <= r.rating ? '#f59e0b' : '#d1d5db'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="cc-meta">
                  <span className="cc-client-chip">{u?.name || 'Client'} · {u?.email || '—'}</span>
                  {r.orderId && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Commande #{String(r.orderId).slice(-6)}
                    </span>
                  )}
                  {r.appointmentId && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      RDV #{String(r.appointmentId).slice(-6)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(r.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {r.comment && <p className="cc-message">{r.comment}</p>}
                <div className="cc-actions">
                  <button type="button" className="cc-btn-danger" onClick={() => handleDelete(ratingId(r))}>
                    <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminServiceRatingsPanel;
