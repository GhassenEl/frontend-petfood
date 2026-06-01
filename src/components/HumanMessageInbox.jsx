import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import getSocket from '../utils/socketClient';
import { getMessages, sendMessage, getMessagePartners } from '../services/messageService';
import './HumanMessageInbox.css';

const ROLE_EMOJI = { admin: '🛡️', livreur: '🚚', client: '🛒' };

const LIVREUR_QUICK = [
  'Commande livrée avec succès ✅',
  'Retard estimé de 15 minutes',
  'Adresse introuvable — merci de me rappeler',
  'Je suis disponible pour de nouvelles livraisons',
];

const ADMIN_QUICK = [
  'Bonjour, comment puis-je vous aider ?',
  'Votre demande est prise en charge.',
  'Merci pour votre retour, nous revenons vers vous rapidement.',
  'Pouvez-vous préciser le numéro de commande ?',
];

const idOf = (u) => u?.id || u?._id;

const msgId = (m) => m?.id || m?._id;

const senderIdOf = (m) =>
  m.senderId || m.sender?.id || m.sender?.userId || m.sender?._id;

const receiverIdOf = (m) =>
  m.receiverId || m.receiver?.id || m.receiver?.userId || m.receiver?._id;

const senderRoleOf = (m) =>
  m.senderType || m.sender?.role || m.sender?.type;

const partnerIdOf = (m, myId) => {
  const sid = senderIdOf(m);
  const rid = receiverIdOf(m);
  return sid === myId ? rid : sid;
};

const isMine = (m, myId, myRole) => {
  const sid = senderIdOf(m);
  if (sid && myId) return sid === myId;
  return senderRoleOf(m) === myRole;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const formatDateSep = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const buildConversations = (messages, myId, usersById) => {
  const map = new Map();

  for (const msg of messages) {
    const partnerId = partnerIdOf(msg, myId);
    if (!partnerId) continue;

    const existing = map.get(partnerId) || {
      partnerId,
      messages: [],
      unread: 0,
      lastAt: null,
    };
    existing.messages.push(msg);
    if (!msg.isRead && receiverIdOf(msg) === myId) existing.unread += 1;
    const at = new Date(msg.createdAt || 0).getTime();
    if (!existing.lastAt || at > existing.lastAt) {
      existing.lastAt = at;
      existing.lastMessage = msg.message;
    }
    map.set(partnerId, existing);
  }

  return [...map.values()]
    .sort((a, b) => b.lastAt - a.lastAt)
    .map((conv) => {
      const user = usersById.get(conv.partnerId);
      return {
        ...conv,
        name: user?.name || (conv.partnerId === 'admin' || conv.partnerId === 'demo_admin' ? 'Administration' : 'Utilisateur'),
        role: user?.role || (conv.partnerId === 'demo_admin' ? 'admin' : 'client'),
        region: user?.region,
      };
    });
};

const HumanMessageInbox = ({ mode = 'admin' }) => {
  const { user } = useAuth();
  const myId = idOf(user);
  const myRole = user?.role;

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(mode === 'livreur' ? 'admin' : '');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
  const knownIds = useRef(new Set());

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(idOf(u), u));
    map.set('admin', { id: 'admin', name: 'Administration', role: 'admin' });
    map.set('demo_admin', { id: 'demo_admin', name: 'Administration', role: 'admin' });
    return map;
  }, [users]);

  const load = useCallback(async () => {
    try {
      const msgData = await getMessages();
      const list = Array.isArray(msgData) ? msgData : [];
      setMessages(list);
      list.forEach((m) => knownIds.current.add(msgId(m)));
      if (mode === 'admin') {
        setSelectedId((prev) => {
          if (prev) return prev;
          if (list.length) return partnerIdOf(list[list.length - 1], myId) || '';
          return '';
        });
      }
    } catch (err) {
      console.error('Messages load error', err);
    } finally {
      setLoading(false);
    }
  }, [mode, myId]);

  useEffect(() => {
    load();
    if (mode === 'admin') {
      getMessagePartners().then(setUsers).catch(console.error);
    }
  }, [load, mode]);

  useEffect(() => {
    if (!myId) return;
    const socket = getSocket();
    const onConnect = () => {
      setConnected(true);
      socket.emit('join', { userId: myId, role: myRole });
    };
    const onDisconnect = () => setConnected(false);

    const onNew = (payload) => {
      if (!payload) return;
      const id = msgId(payload);
      if (id && knownIds.current.has(id)) return;
      if (id) knownIds.current.add(id);
      setMessages((prev) => {
        if (prev.some((m) => msgId(m) === id)) return prev;
        return [...prev, payload].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:new', onNew);

    const poll = setInterval(load, 45000);

    return () => {
      clearInterval(poll);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message:new', onNew);
    };
  }, [myId, myRole, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedId]);

  const conversations = useMemo(
    () => buildConversations(messages, myId, usersById),
    [messages, myId, usersById]
  );

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (roleFilter !== 'all') list = list.filter((c) => c.role === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.region || '').toLowerCase().includes(q) ||
          (c.lastMessage || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, roleFilter, search]);

  const threadMessages = useMemo(() => {
    if (mode === 'livreur') {
      return messages.filter((m) => {
        const sid = senderIdOf(m);
        const rid = receiverIdOf(m);
        return sid === myId || rid === myId;
      });
    }
    if (!selectedId) return [];
    return messages.filter((m) => partnerIdOf(m, myId) === selectedId);
  }, [messages, mode, myId, selectedId]);

  const selectedConv = conversations.find((c) => c.partnerId === selectedId);

  const handleSend = async (text) => {
    const body = (text ?? draft).trim();
    if (!body || sending) return;
    const receiverId = mode === 'livreur' ? 'admin' : selectedId;
    if (!receiverId) return;

    setSending(true);
    try {
      const created = await sendMessage(receiverId, body);
      const id = msgId(created);
      if (id) knownIds.current.add(id);
      setMessages((prev) => {
        if (prev.some((m) => msgId(m) === id)) return prev;
        return [...prev, created].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
      setDraft('');
      if (mode === 'admin' && !selectedId) {
        setSelectedId(receiverIdOf(created) === myId ? senderIdOf(created) : receiverIdOf(created));
      }
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = mode === 'livreur' ? LIVREUR_QUICK : ADMIN_QUICK;

  const renderMessages = () => {
    if (!threadMessages.length) {
      return (
        <div className="hmi-empty">
          <div className="hmi-empty-icon">💬</div>
          <p>Aucun message pour l&apos;instant.</p>
          <p style={{ fontSize: '0.85rem' }}>Envoyez le premier message ci-dessous.</p>
        </div>
      );
    }

    let lastDate = '';
    return threadMessages.map((msg) => {
      const dateSep = formatDateSep(msg.createdAt);
      const showSep = dateSep !== lastDate;
      lastDate = dateSep;
      const mine = isMine(msg, myId, myRole);

      return (
        <React.Fragment key={msgId(msg) || msg.createdAt}>
          {showSep && <div className="hmi-date-sep">{dateSep}</div>}
          <div className={`hmi-bubble ${mine ? 'hmi-bubble--mine' : 'hmi-bubble--theirs'}`}>
            {msg.message}
            <div className="hmi-bubble-meta">{formatTime(msg.createdAt)}</div>
          </div>
        </React.Fragment>
      );
    });
  };

  if (loading) {
    return (
      <div className="hmi-root">
        <div className="hmi-empty">
          <div className="hmi-empty-icon" style={{ animation: 'float 2s ease-in-out infinite' }}>💬</div>
          <p>Chargement des messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hmi-root">
      <div className="hmi-header">
        <h1>💬 Messages</h1>
        <p>
          {mode === 'livreur'
            ? 'Contactez l\'administration en temps réel pour signaler un problème ou une livraison.'
            : 'Conversations avec clients et livreurs — réponses en direct.'}
        </p>
      </div>

      <div className={`hmi-layout ${mode === 'livreur' ? 'hmi-layout--single' : ''}`}>
        {mode === 'admin' && (
          <aside className="hmi-sidebar">
            <div className="hmi-sidebar-tools">
              <input
                className="hmi-search"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="hmi-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tous les contacts</option>
                <option value="client">Clients</option>
                <option value="livreur">Livreurs</option>
              </select>
            </div>
            <div className="hmi-conv-list">
              {filteredConversations.length === 0 ? (
                <p style={{ padding: 16, color: '#9ca3af', fontSize: '0.85rem' }}>
                  Aucune conversation. Choisissez un contact ou envoyez un message.
                </p>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    type="button"
                    className={`hmi-conv-item ${selectedId === conv.partnerId ? 'active' : ''}`}
                    onClick={() => setSelectedId(conv.partnerId)}
                  >
                    <div className={`hmi-avatar hmi-avatar--${conv.role}`}>
                      {ROLE_EMOJI[conv.role] || '👤'}
                    </div>
                    <div className="hmi-conv-body">
                      <div className="hmi-conv-top">
                        <span className="hmi-conv-name">{conv.name}</span>
                        <span className="hmi-conv-time">{formatTime(conv.lastAt)}</span>
                      </div>
                      <div className="hmi-conv-top">
                        <span className="hmi-conv-preview">{conv.lastMessage || '—'}</span>
                        {conv.unread > 0 && <span className="hmi-badge">{conv.unread}</span>}
                      </div>
                      <span className="hmi-role-tag">{conv.role}</span>
                    </div>
                  </button>
                ))
              )}
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9' }}>
                <select
                  className="hmi-filter"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">+ Nouveau contact</option>
                  {users.map((u) => (
                    <option key={idOf(u)} value={idOf(u)}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>
        )}

        <section className="hmi-thread">
          <div className="hmi-thread-header">
            <div>
              <h2 className="hmi-thread-title">
                {mode === 'livreur'
                  ? '🛡️ Administration PetfoodTN'
                  : selectedConv
                    ? `${ROLE_EMOJI[selectedConv.role] || '👤'} ${selectedConv.name}`
                    : 'Sélectionnez une conversation'}
              </h2>
              {mode === 'admin' && selectedConv?.region && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                  Région : {selectedConv.region}
                </p>
              )}
            </div>
            <span className="hmi-status">
              <span className="hmi-status-dot" style={{ background: connected ? '#10b981' : '#9ca3af' }} />
              {connected ? 'En ligne' : 'Reconnexion…'}
            </span>
          </div>

          <div className="hmi-messages">
            {renderMessages()}
            <div ref={bottomRef} />
          </div>

          {(mode === 'livreur' || selectedId) && (
            <div className="hmi-compose">
              <div className="hmi-quick-replies">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="hmi-quick-btn"
                    onClick={() => handleSend(q)}
                    disabled={sending}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="hmi-compose-row">
                <textarea
                  className="hmi-textarea"
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Écrivez votre message… (Entrée pour envoyer)"
                  disabled={sending}
                />
                <button
                  type="button"
                  className="hmi-send-btn"
                  onClick={() => handleSend()}
                  disabled={sending || !draft.trim()}
                >
                  <Send size={18} />
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {mode === 'admin' && !selectedId && (
            <div className="hmi-empty">
              <MessageCircle size={48} color="#d1d5db" />
              <p>Choisissez une conversation ou un nouveau contact pour commencer.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HumanMessageInbox;
