import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return; // Skip if not authenticated
    
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Notifications fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/count');
      setUnreadCount(res.data?.unread || 0);
    } catch (error) {
      console.error('Unread count error', error);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark read error', error);
    }
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((n) => !n.read)) {
      await markAsRead(n.id, n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'message':
        return '💬';
      case 'complaint':
        return '⚠️';
      case 'review':
        return '⭐';
      case 'new_order':
        return '📦';
      case 'new_complaint':
        return '⚠️';
      case 'new_review':
        return '⭐';
      case 'admin_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '12px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(230,126,34,0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <React.Fragment>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: '360px',
              maxHeight: '480px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeInUp 0.2s ease',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                🔔 Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e67e22',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tout lire
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {loading ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>🐾</span>
                  <p style={{ color: '#999', marginTop: '12px' }}>
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    onClick={() => markAsRead(n.id, n.link)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #f5f5f5',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      background: n.read
                        ? 'white'
                        : 'rgba(230,126,34,0.04)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(230,126,34,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.read
                        ? 'white'
                        : 'rgba(230,126,34,0.04)';
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>
                      {getIcon(n.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: n.read ? 500 : 700,
                          color: '#333',
                          lineHeight: 1.4,
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: '0.75rem',
                          color: '#888',
                          lineHeight: 1.3,
                        }}
                      >
                        {n.description}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '0.7rem',
                          color: '#aaa',
                        }}
                      >
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })
                          : ''}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#e67e22',
                          flexShrink: 0,
                          marginTop: '6px',
                        }}
                      ></span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default NotificationBell;
