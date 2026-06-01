import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Package, Truck, CreditCard, HelpCircle, Send, Trash2 } from 'lucide-react';
import { getOrders } from '../services/orderService';
import { getMyComplaints, createComplaint, deleteComplaint } from '../services/complaintService';
import './ClientComplaintsPage.css';

const CATEGORIES = [
  { id: 'delivery', label: 'Livraison', icon: Truck, subject: 'Problème de livraison', placeholder: 'Retard, colis endommagé, adresse incorrecte…' },
  { id: 'product', label: 'Produit', icon: Package, subject: 'Problème produit', placeholder: 'Qualité, erreur d’article, produit manquant…' },
  { id: 'payment', label: 'Paiement / facture', icon: CreditCard, subject: 'Paiement ou facture', placeholder: 'Montant incorrect, facture non reçue…' },
  { id: 'other', label: 'Autre', icon: HelpCircle, subject: 'Autre demande', placeholder: 'Décrivez votre situation en détail…' },
];

const STATUS_LABELS = {
  pending: 'En attente',
  in_progress: 'En cours de traitement',
  resolved: 'Résolue',
  rejected: 'Refusée',
};

const complaintId = (c) => c?.id || c?._id;
const orderIdOf = (o) => o?.id || o?._id;

const ClientComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('delivery');
  const [subject, setSubject] = useState(CATEGORIES[0].subject);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setListLoading(true);
    try {
      const [complaintList, orderList] = await Promise.all([
        getMyComplaints(),
        getOrders().catch(() => []),
      ]);
      setComplaints(complaintList);
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch {
      setComplaints([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectCategory = (cat) => {
    setCategory(cat.id);
    setSubject(cat.subject);
    if (!message.trim()) setMessage('');
  };

  const stats = useMemo(() => {
    const pending = complaints.filter((c) => c.status === 'pending').length;
    const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
    const resolved = complaints.filter((c) => c.status === 'resolved').length;
    return { total: complaints.length, pending, inProgress, resolved };
  }, [complaints]);

  const filtered = useMemo(() => {
    if (filter === 'all') return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 20) {
      showToast('Veuillez décrire le problème (au moins 20 caractères).', 'error');
      return;
    }
    setLoading(true);
    try {
      const cat = CATEGORIES.find((c) => c.id === category);
      await createComplaint({
        subject: subject.trim() || cat?.subject,
        message: message.trim(),
        orderId: orderId || undefined,
        category,
      });
      setMessage('');
      setOrderId('');
      setCategory('delivery');
      setSubject(CATEGORIES[0].subject);
      await load();
      showToast('Réclamation envoyée. Notre équipe vous répondra sous 48 h.');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erreur lors de l’envoi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (c) => {
    if (c.status === 'resolved') {
      showToast('Les réclamations résolues ne peuvent pas être supprimées.', 'error');
      return;
    }
    if (!window.confirm('Supprimer cette réclamation ?')) return;
    try {
      await deleteComplaint(complaintId(c));
      await load();
      showToast('Réclamation supprimée.');
    } catch {
      showToast('Impossible de supprimer.', 'error');
    }
  };

  const activeCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const IconCat = activeCat.icon;

  return (
    <div className="cc-page">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero">
        <h1>⚠️ Mes réclamations</h1>
        <p>
          Signalez un problème de commande, livraison ou produit. Vous recevrez une réponse de l’équipe
          PetfoodTN directement sur cette page.
        </p>
      </header>

      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#881337' }}>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#d97706' }}>{stats.pending}</strong>
          <span>En attente</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#2563eb' }}>{stats.inProgress}</strong>
          <span>En cours</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#16a34a' }}>{stats.resolved}</strong>
          <span>Résolues</span>
        </div>
      </div>

      <section className="cc-form-card">
        <h2>
          <IconCat size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Nouvelle réclamation
        </h2>

        <div className="cc-categories">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className={`cc-cat-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => selectCategory(cat)}
              >
                <Icon size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cc-field">
            <label htmlFor="cc-subject">Sujet</label>
            <input
              id="cc-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="cc-field">
            <label htmlFor="cc-order">Commande concernée (optionnel)</label>
            <select id="cc-order" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <option value="">— Aucune commande précise —</option>
              {orders.map((o) => (
                <option key={orderIdOf(o)} value={orderIdOf(o)}>
                  #{String(orderIdOf(o)).slice(-6)} · {o.status} · {o.total} DT ·{' '}
                  {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>

          <div className="cc-field">
            <label htmlFor="cc-message">Description détaillée</label>
            <textarea
              id="cc-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={activeCat.placeholder}
              required
              minLength={20}
              maxLength={2000}
            />
            <div className="cc-char-count">{message.length} / 2000 (min. 20)</div>
          </div>

          <button type="submit" className="cc-submit" disabled={loading}>
            <Send size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {loading ? 'Envoi en cours…' : 'Envoyer la réclamation'}
          </button>
        </form>
      </section>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Historique</h2>
        <div className="cc-filters">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'pending', label: 'En attente' },
            { id: 'in_progress', label: 'En cours' },
            { id: 'resolved', label: 'Résolues' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cc-filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {listLoading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="cc-empty">
          <AlertCircle size={48} style={{ opacity: 0.35, marginBottom: 12 }} />
          <p>Aucune réclamation{filter !== 'all' ? ' pour ce filtre' : ''}.</p>
          {filter === 'all' && (
            <p style={{ fontSize: '0.9rem' }}>
              Besoin d’aide ? Consultez aussi{' '}
              <Link to="/contact" style={{ color: '#ea580c', fontWeight: 700 }}>
                Contact
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="cc-list">
          {filtered.map((c) => {
            const status = c.status || 'pending';
            const catLabel = CATEGORIES.find((x) => c.subject?.includes(x.subject.split(' ')[0]))?.label;
            return (
              <article key={complaintId(c)} className={`cc-card ${status}`}>
                <div className="cc-card-head">
                  <h3>{c.subject}</h3>
                </div>
                <div className="cc-meta">
                  <span className={`cc-badge ${status}`}>{STATUS_LABELS[status] || status}</span>
                  {catLabel && <span className="cc-badge" style={{ background: '#f3f4f6', color: '#374151' }}>{catLabel}</span>}
                  {c.orderId && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Commande #{String(c.orderId).slice(-6)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(c.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="cc-message">{c.message || c.description}</p>
                {c.response ? (
                  <div className="cc-response">
                    <strong>Réponse de l’équipe PetfoodTN</strong>
                    <p>{c.response}</p>
                  </div>
                ) : status === 'pending' ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Votre demande est en file d’attente. Délai moyen de réponse : 24 à 48 h.
                  </p>
                ) : null}
                <div className="cc-actions">
                  {c.orderId && (
                    <Link to="/client-orders" className="cc-btn-ghost" style={{ textDecoration: 'none' }}>
                      Voir mes commandes
                    </Link>
                  )}
                  {status !== 'resolved' && (
                    <button type="button" className="cc-btn-danger" onClick={() => handleDelete(c)}>
                      <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Supprimer
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientComplaintsPage;
