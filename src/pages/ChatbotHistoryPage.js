import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Camera, MessageSquare, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatNlpInsight from '../components/ChatNlpInsight';
import {
  analyzeChatImage,
  fetchAdminChatHistory,
  fetchEnrichedChatHistory,
} from '../services/chatHistoryService';
import './ChatbotHistoryPage.css';

const ROLE_LABELS = {
  client: 'Client',
  admin: 'Administration',
  vet: 'Vétérinaire',
  livreur: 'Livreur',
  vendor: 'Vendeur',
  moderator: 'Modérateur',
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
};

const parseImageHint = (msg) => {
  if (msg.imageMeta?.hint) return msg.imageMeta.hint;
  if (msg.content?.startsWith('[petfood:image]')) {
    try {
      return JSON.parse(msg.content.replace('[petfood:image]', '')).hint;
    } catch {
      return null;
    }
  }
  return null;
};

const getImagePreviewSrc = (msg) => {
  const raw =
    msg.imagePreview ||
    msg.imageMeta?.imagePreview ||
    msg.imageMeta?.preview ||
    null;
  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('data:image')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return null;
};

const ChatbotHistoryPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'client';
  const isAdmin = role === 'admin';

  const [pack, setPack] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [imageHint, setImageHint] = useState('');
  const [petName, setPetName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin && !selectedUserId) {
        const overview = await fetchAdminChatHistory();
        setAdminUsers(overview.users || []);
        if (overview.pack) setPack(overview.pack);
        else setPack(null);
      } else if (isAdmin && selectedUserId) {
        const overview = await fetchAdminChatHistory(selectedUserId);
        setPack(overview.pack);
      } else {
        const data = await fetchEnrichedChatHistory();
        setPack(data);
      }
    } catch {
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredMessages = useMemo(() => {
    const list = pack?.messages || [];
    if (filter === 'text') return list.filter((m) => m.messageType === 'text');
    if (filter === 'image') return list.filter((m) => m.messageType === 'image');
    return list;
  }, [pack?.messages, filter]);

  const runImageAnalysis = async () => {
    if (!imageHint.trim() && !imageFile) return;
    setUploading(true);
    try {
      let imageBase64;
      let imagePreview;
      if (imageFile) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imagePreview = String(imageBase64).slice(0, 16000);
      }
      await analyzeChatImage({
        petName: petName || undefined,
        imageHint: imageHint.trim() || (imageFile ? `Photo ${imageFile.name}` : undefined),
        imageBase64,
        imagePreview,
      });
      setImageHint('');
      setImageFile(null);
      setLocalPreview('');
      await load();
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  const onImageFileChange = (file) => {
    setImageFile(file || null);
    if (!file) {
      setLocalPreview('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLocalPreview(reader.result);
    reader.readAsDataURL(file);
  };

  if (loading && !pack) {
    return <div className="chat-hist-page chat-hist-empty">Chargement de l&apos;historique chatbot…</div>;
  }

  return (
    <div className="chat-hist-page">
      <header className="chat-hist-hero">
        <h1>📜 Historique chatbot</h1>
        <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>
          Analyse NLP des textes et interprétation des images — espace {ROLE_LABELS[role] || role}.
          {pack?.demo && ' · Données démo'}
        </p>
        {pack?.stats && (
          <div className="chat-hist-stats">
            <span className="chat-hist-stat">{pack.stats.total} messages</span>
            <span className="chat-hist-stat">{pack.stats.textCount ?? 0} textes analysés</span>
            <span className="chat-hist-stat">{pack.stats.imageCount ?? 0} images chat</span>
            <span className="chat-hist-stat">{pack.stats.imageAnalysisCount ?? 0} analyses stockées</span>
          </div>
        )}
        <button
          type="button"
          onClick={load}
          style={{
            marginTop: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </header>

      {isAdmin && (
        <div className="chat-hist-admin-select">
          <label htmlFor="chat-hist-user">Consulter l&apos;historique de :</label>
          <select
            id="chat-hist-user"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">— Sélectionner un utilisateur —</option>
            {adminUsers.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>
                {u.name || u.email} ({u.role})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="chat-hist-filters">
        {[
          { id: 'all', label: 'Tout' },
          { id: 'text', label: 'Textes (NLP)' },
          { id: 'image', label: 'Images' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chat-hist-filter-btn${filter === f.id ? ' chat-hist-filter-btn--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!isAdmin || selectedUserId ? (
        <>
          <section>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18 }}>
              <MessageSquare size={20} /> Timeline conversation
            </h2>
            {filteredMessages.length === 0 ? (
              <p className="chat-hist-empty">Aucun message. Utilisez le chatbot flottant pour démarrer.</p>
            ) : (
              <div className="chat-hist-timeline">
                {filteredMessages.map((msg) => (
                  <article
                    key={msg.id}
                    className={`chat-hist-msg chat-hist-msg--${msg.role}${
                      msg.messageType === 'image' ? ' chat-hist-msg--image' : ''
                    }`}
                  >
                    <div className="chat-hist-meta">
                      <span className="chat-hist-role">{msg.role === 'user' ? 'Vous' : 'Assistant'}</span>
                      {msg.messageType === 'image' && (
                        <span style={{ color: '#7c3aed', fontWeight: 700 }}>📷 Image</span>
                      )}
                      {msg.messageType === 'text' && msg.role === 'user' && (
                        <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Brain size={12} /> NLP
                        </span>
                      )}
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                    {msg.messageType === 'image' && msg.role === 'user' ? (
                      <div className="chat-hist-image-block">
                        {getImagePreviewSrc(msg) ? (
                          <img
                            src={getImagePreviewSrc(msg)}
                            alt={parseImageHint(msg) || 'Photo animal'}
                            className="chat-hist-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div className="chat-hist-thumb chat-hist-thumb--placeholder" aria-hidden>
                            📷
                          </div>
                        )}
                        <p className="chat-hist-content">
                          {parseImageHint(msg) || 'Photo envoyée pour analyse'}
                          {msg.imageMeta?.petName ? ` — ${msg.imageMeta.petName}` : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="chat-hist-content">{msg.content}</p>
                    )}
                    {msg.nlp && <ChatNlpInsight nlp={msg.nlp} />}
                  </article>
                ))}
              </div>
            )}
          </section>

          {(pack?.imageAnalyses?.length > 0 || filter !== 'text') && (
            <section style={{ marginTop: 28 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18 }}>
                <Camera size={20} /> Analyses images (IA)
              </h2>
              <div className="chat-hist-images-grid">
                {(pack?.imageAnalyses || []).map((item) => (
                  <div key={item.id} className="chat-hist-image-card">
                    <h3>{item.petName || 'Animal'}</h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
                      {formatDate(item.createdAt)}
                    </p>
                    {item.results?.breed?.label && (
                      <p style={{ margin: '4px 0', fontSize: 13 }}>
                        Race : <strong>{item.results.breed.label}</strong>
                      </p>
                    )}
                    {item.results?.coat?.notes && (
                      <p style={{ margin: '4px 0', fontSize: 13 }}>Pelage : {item.results.coat.notes}</p>
                    )}
                    {item.results?.overweight?.label && (
                      <p style={{ margin: '4px 0', fontSize: 13 }}>{item.results.overweight.label}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isAdmin && (
            <section className="chat-hist-upload">
              <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Nouvelle analyse image</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Décrivez la photo de votre animal (race, symptômes visibles, corpulence…).
              </p>
              <input
                type="text"
                placeholder="Nom de l'animal (optionnel)"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Ex : chat roux, pelage terne, yeux larmoyants"
                value={imageHint}
                onChange={(e) => setImageHint(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageFileChange(e.target.files?.[0])}
              />
              {localPreview && (
                <img src={localPreview} alt="Aperçu" className="chat-hist-thumb" style={{ marginTop: 10 }} />
              )}
              <button
                type="button"
                className="chat-hist-upload-btn"
                disabled={uploading || (!imageHint.trim() && !imageFile)}
                onClick={runImageAnalysis}
              >
                {uploading ? 'Analyse…' : 'Analyser et enregistrer'}
              </button>
            </section>
          )}
        </>
      ) : (
        <p className="chat-hist-empty">Sélectionnez un utilisateur pour consulter son historique chatbot.</p>
      )}

      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link to={role === 'client' ? '/client-products' : '/admin/dashboard'}>← Retour</Link>
      </p>
    </div>
  );
};

export default ChatbotHistoryPage;
