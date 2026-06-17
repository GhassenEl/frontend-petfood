import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import getSocket from '../utils/socketClient';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './NotificationBell.css';

const DISMISS_KEY = (userId) => `petfood_dismissed_notifs_${userId}`;

const TYPE_LABELS = {
  order: 'Commande',
  new_order: 'Nouvelle commande',
  livreur_new_order: 'Nouvelle course',
  livreur_shipped: 'Livraison',
  message: 'Message',
  admin_message: 'Message',
  complaint: 'Réclamation',
  new_complaint: 'Réclamation',
  review: 'Avis',
  new_review: 'Avis client',
  vet_appointment: 'Rendez-vous',
  vet_contact: 'Demande contact',
  vet_consultation: 'Consultation',
  leave_status: 'Congés',
  leave_request: 'Demande congé',
  iot_food_quality: 'Qualité alimentaire IoT',
};

const ROLE_LABELS = {
  admin: 'Administration',
  client: 'Espace client',
  livreur: 'Espace livreur',
  vet: 'Espace vétérinaire',
};

const loadDismissed = (userId) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY(userId)) || '[]'));
  } catch {
    return new Set();
  }
};

const saveDismissed = (userId, set) => {
  try {
    localStorage.setItem(DISMISS_KEY(userId), JSON.stringify([...set].slice(-200)));
  } catch {
    /* ignore */
  }
};

const getBody = (n) => {
  const raw = n?.description || n?.message || n?.body || '';
  return String(raw).replace(/\s+/g, ' ').trim();
};

const getTitle = (n) => {
  const t = n?.title?.trim();
  if (t) return t;
  return TYPE_LABELS[n?.type] || 'Notification';
};

const getIcon = (type) => {
  switch (type) {
    case 'order':
    case 'new_order':
    case 'livreur_new_order':
      return '📦';
    case 'livreur_shipped':
      return '🚚';
    case 'message':
    case 'admin_message':
      return '💬';
    case 'complaint':
    case 'new_complaint':
      return '⚠️';
    case 'review':
    case 'new_review':
      return '⭐';
    case 'vet_appointment':
      return '📅';
    case 'vet_contact':
      return '📩';
    case 'vet_consultation':
      return '🩺';
    case 'leave_status':
    case 'leave_request':
      return '🏖️';
    case 'iot_food_quality':
      return '📷';
    default:
      return '🔔';
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Aujourd'hui · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Hier · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [panelStyle, setPanelStyle] = useState({});
  const dismissedRef = useRef(new Set());
  const triggerRef = useRef(null);

  const userId = user?.id || user?._id;
  const role = user?.role;
  const pollMs = role === 'livreur' || role === 'vet' ? 15000 : 30000;

  const applyDismissed = useCallback(
    (list) => {
      if (!userId) return list;
      return (list || []).map((n) => ({
        ...n,
        read: n.read || dismissedRef.current.has(n.id),
      }));
    },
    [userId]
  );

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const notifs = applyDismissed(res.data || []);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Notifications fetch error', error);
    } finally {
      setLoading(false);
    }
  }, [user, applyDismissed]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/count');
      setUnreadCount(res.data?.unread || 0);
    } catch (error) {
      console.error('Unread count error', error);
    }
  }, [user]);

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = Math.min(420, window.innerWidth - 24);
    let left = rect.right - panelWidth;
    left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
    const top = rect.bottom + 10;
    setPanelStyle({ top, left, width: panelWidth });
  }, []);

  useEffect(() => {
    if (!user || !userId) return;

    dismissedRef.current = loadDismissed(userId);
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, pollMs);
    const socket = getSocket();

    const onConnect = () => {
      socket.emit('join', { userId, role });
    };

    const onNotificationNew = (payload) => {
      if (!payload?.id && !payload?.title) return;
      setToast(payload);
      setTimeout(() => setToast(null), 6000);
      fetchNotifications();
      fetchUnreadCount();
    };

    if (socket.connected) onConnect();
    else socket.on('connect', onConnect);

    socket.on('notification:new', onNotificationNew);

    const onFoodQualityAlert = (event) => {
      const payload = event?.detail;
      if (!payload?.title) return;
      onNotificationNew(payload);
    };
    window.addEventListener('petfood:food-quality-alert', onFoodQualityAlert);

    return () => {
      clearInterval(interval);
      socket.off('connect', onConnect);
      socket.off('notification:new', onNotificationNew);
      window.removeEventListener('petfood:food-quality-alert', onFoodQualityAlert);
    };
  }, [user, userId, role, pollMs, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
      updatePanelPosition();
      window.addEventListener('resize', updatePanelPosition);
      window.addEventListener('scroll', updatePanelPosition, true);
      return () => {
        window.removeEventListener('resize', updatePanelPosition);
        window.removeEventListener('scroll', updatePanelPosition, true);
      };
    }
    return undefined;
  }, [open, fetchNotifications, updatePanelPosition]);

  const markAsRead = async (id, link) => {
    if (!id) return;
    dismissedRef.current.add(id);
    if (userId) saveDismissed(userId, dismissedRef.current);

    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Mark read error', error);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      dismissedRef.current.add(n.id);
    }
    if (userId) saveDismissed(userId, dismissedRef.current);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    for (const n of unread) {
      try {
        await api.put(`/notifications/${n.id}/read`);
      } catch {
        /* ignore */
      }
    }
  };

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div className="notif-root">
      {toast && portalTarget && createPortal(
        <div className="notif-toast" role="status">
          <p className="notif-toast-title">
            {getIcon(toast.type)} {getTitle(toast)}
          </p>
          {getBody(toast) && <p className="notif-toast-desc">{getBody(toast)}</p>}
        </div>,
        portalTarget
      )}

      <button
        ref={triggerRef}
        type="button"
        className="notif-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ''}`}
        aria-expanded={open}
      >
        <span className="notif-trigger-icon" aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && portalTarget && createPortal(
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="notif-panel" style={panelStyle} role="dialog" aria-label="Notifications">
            <div className="notif-panel-header">
              <div>
                <h3 className="notif-panel-title">🔔 Notifications</h3>
                <p className="notif-panel-sub">
                  {ROLE_LABELS[role] || 'Mon espace'}
                  {unreadCount > 0 ? ` · ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''}
                </p>
              </div>
              {unreadCount > 0 && (
                <button type="button" className="notif-mark-all" onClick={markAllRead}>
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="notif-list">
              {loading ? (
                <div className="notif-loading">Chargement…</div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">🐾</div>
                  <p>Aucune notification pour le moment</p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const body = getBody(n);
                  return (
                    <button
                      key={n.id || i}
                      type="button"
                      className={`notif-item ${n.read ? 'notif-item--read' : 'notif-item--unread'}`}
                      onClick={() => markAsRead(n.id, n.link)}
                    >
                      <span className="notif-item-icon">{getIcon(n.type)}</span>
                      <span className="notif-item-body">
                        <span className="notif-item-type">{TYPE_LABELS[n.type] || 'Info'}</span>
                        <p className="notif-item-title">{getTitle(n)}</p>
                        {body && <p className="notif-item-desc">{body}</p>}
                        <p className="notif-item-time">{formatTime(n.createdAt)}</p>
                      </span>
                      {!n.read && <span className="notif-unread-dot" aria-hidden />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>,
        portalTarget
      )}
    </div>
  );
};

export default NotificationBell;
