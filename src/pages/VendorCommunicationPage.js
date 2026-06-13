import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Star, Bell, Send } from 'lucide-react';
import {
  fetchVendorReviews,
  replyVendorReview,
  fetchVendorClientMessages,
  sendVendorClientMessage,
  fetchVendorNotifications,
  markVendorNotificationRead,
} from '../services/vendorService';
import './VendorPages.css';

const VendorCommunicationPage = () => {
  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [threads, setThreads] = useState([]);
  const [conversations, setConversations] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [msgText, setMsgText] = useState('');
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [revRes, msgRes, notifRes] = await Promise.all([
      fetchVendorReviews(),
      fetchVendorClientMessages(),
      fetchVendorNotifications(),
    ]);
    setReviews(revRes.data.reviews || []);
    setThreads(msgRes.data.threads || []);
    setConversations(msgRes.data.conversations || {});
    setNotifications(notifRes.data.notifications || []);
    setDemo(revRes.demo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedClient && threads.length) {
      setSelectedClient(threads[0].clientId);
    }
  }, [threads, selectedClient]);

  const submitReviewReply = async (id) => {
    const text = replyText[id];
    if (!text?.trim()) return;
    await replyVendorReview(id, text.trim());
    setReplyText((prev) => ({ ...prev, [id]: '' }));
    load();
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedClient) return;
    await sendVendorClientMessage(selectedClient, msgText.trim());
    setMsgText('');
    load();
  };

  const chat = selectedClient ? (conversations[selectedClient] || []) : [];
  const activeThread = threads.find((t) => t.clientId === selectedClient);

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><MessageCircle size={24} /> Communication {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Répondre aux avis, messagerie clients et notifications vendeur.</p>
      </header>

      <div className="vnd-tabs">
        {[
          { id: 'reviews', label: '⭐ Avis clients' },
          { id: 'messages', label: '💬 Messagerie' },
          { id: 'notifications', label: '🔔 Notifications' },
        ].map((t) => (
          <button key={t.id} type="button" className={`vnd-tab ${tab === t.id ? 'vnd-tab--active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="vnd-empty">Chargement…</p> : (
        <>
          {tab === 'reviews' && (
            <div className="vnd-card">
              <h2>Répondre aux avis clients</h2>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{r.clientName}</strong>
                    <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ margin: '6px 0', color: '#475569' }}>{r.productName}</p>
                  <p style={{ margin: '0 0 8px' }}>&ldquo;{r.comment}&rdquo;</p>
                  {r.vendorReply ? (
                    <p style={{ background: '#f0fdfa', padding: 10, borderRadius: 8, fontSize: '0.875rem' }}>
                      <strong>Votre réponse :</strong> {r.vendorReply}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        placeholder="Votre réponse au client…"
                        value={replyText[r.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                        style={{ flex: 1, minWidth: 200, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                      <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => submitReviewReply(r.id)}>
                        <Send size={14} /> Répondre
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'messages' && (
            <div className="vnd-msg-layout">
              <div className="vnd-msg-list">
                {threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`vnd-msg-item ${selectedClient === t.clientId ? 'vnd-msg-item--active' : ''} ${t.unread ? 'vnd-msg-item--unread' : ''}`}
                    onClick={() => setSelectedClient(t.clientId)}
                  >
                    <strong>{t.clientName}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{t.lastMessage}</p>
                  </button>
                ))}
              </div>
              <div className="vnd-msg-chat">
                <div style={{ padding: 12, borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>
                  {activeThread?.clientName || 'Sélectionnez une conversation'}
                </div>
                <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {chat.map((m) => (
                    <div key={m.id} className={`vnd-msg-bubble vnd-msg-bubble--${m.from}`}>{m.text}</div>
                  ))}
                </div>
                {selectedClient && (
                  <div className="vnd-msg-input">
                    <input value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Écrire au client…" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                    <button type="button" className="vnd-btn vnd-btn--primary" onClick={sendMessage}><Send size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="vnd-card">
              <h2><Bell size={18} /> Recevoir des notifications</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notifications.map((n) => (
                  <li key={n.id} style={{
                    padding: '12px 0', borderBottom: '1px solid #f1f5f9',
                    opacity: n.read ? 0.6 : 1, fontWeight: n.read ? 400 : 600,
                  }}
                  >
                    <span style={{ marginRight: 8 }}>{n.type === 'order' ? '📦' : n.type === 'review' ? '⭐' : '↩️'}</span>
                    {n.text}
                    <small style={{ display: 'block', color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.at).toLocaleString('fr-FR')}
                      {!n.read && (
                        <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" style={{ marginLeft: 8 }} onClick={() => markVendorNotificationRead(n.id).then(load)}>
                          Marquer lu
                        </button>
                      )}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorCommunicationPage;
