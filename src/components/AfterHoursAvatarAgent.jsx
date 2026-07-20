import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle } from 'lucide-react';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import {
  AFTER_HOURS_AGENT,
  getSupportOpenStatus,
  buildAfterHoursReply,
} from '../config/afterHoursAgent';
import { sendMessage, sendPublicMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import './AfterHoursAvatarAgent.css';

/**
 * Agent IA avatarisée (personne réelle) — hors horaires.
 * Messages texte + vocal (STT/TTS), animation « en train de parler ».
 */
const AfterHoursAvatarAgent = ({ forceShow = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const status = getSupportOpenStatus();
  const afterHours = forceShow || !status.isOpen;

  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const greeted = useRef(false);

  const speak = useCallback((text) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, ''));
    u.lang = AFTER_HOURS_AGENT.voiceLang;
    u.rate = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const pushAssistant = useCallback((content, quickReplies = []) => {
    setMessages((prev) => [...prev, { role: 'assistant', content, quickReplies }]);
    if (voiceOn) speak(content);
  }, [speak, voiceOn]);

  useEffect(() => {
    if (!open || greeted.current) return;
    greeted.current = true;
    const greet = afterHours ? AFTER_HOURS_AGENT.greetingClosed : AFTER_HOURS_AGENT.greetingOpen;
    pushAssistant(greet, ['Urgence animale', 'Ma commande', 'Boutique', 'Parler en vocal']);
  }, [open, afterHours, pushAssistant]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const handleUserText = async (raw) => {
    const text = String(raw || '').trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    if (/parler en vocal|micro|voix/i.test(text)) {
      setVoiceOn(true);
      pushAssistant('Micro activé. Appuyez sur le bouton micro et parlez — je vous répondrai à voix haute.', []);
      return;
    }
    if (/ouvrir mes commandes|ma commande/i.test(text)) {
      navigate('/client-orders');
      pushAssistant('J’ouvre vos commandes.', []);
      return;
    }
    if (/voir la boutique|boutique|kits/i.test(text)) {
      navigate('/client-products');
      pushAssistant('Voici la boutique PetfoodTN.', []);
      return;
    }
    if (/bilan nutritionnel|rdv/i.test(text)) {
      navigate('/veterinary?prefill=bilan');
      pushAssistant('Formulaire bilan nutritionnel ouvert.', []);
      return;
    }

    setLoading(true);
    try {
      let replyText = '';
      let quick = [];
      if (user?.token || user?.id) {
        const data = await sendMessage(text, {
          type: 'after_hours_agent',
          agentId: AFTER_HOURS_AGENT.id,
          afterHours,
        });
        replyText = data?.content || data?.message || data?.reply || '';
      } else {
        const data = await sendPublicMessage(text, { agent: AFTER_HOURS_AGENT.id });
        replyText = data?.content || data?.message || data?.reply || '';
      }
      if (!replyText) {
        const local = buildAfterHoursReply(text);
        replyText = local.content;
        quick = local.quickReplies || [];
      }
      pushAssistant(replyText, quick);
    } catch {
      const local = buildAfterHoursReply(text);
      pushAssistant(local.content, local.quickReplies || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTextRef = useRef(handleUserText);
  handleUserTextRef.current = handleUserText;

  const onVoiceResult = useCallback((payload) => {
    const text =
      typeof payload === 'string'
        ? payload
        : payload?.transcript || payload?.text || '';
    if (text) handleUserTextRef.current(text);
  }, []);

  const { supported, listening, start, stop } = useVoiceAssistant({
    mode: 'chat',
    lang: AFTER_HOURS_AGENT.voiceLang,
    onTranscript: onVoiceResult,
    onResult: onVoiceResult,
  });

  if (!afterHours && !forceShow) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          className={`aha-fab ${speaking ? 'aha-fab--talking' : ''}`}
          onClick={() => setOpen(true)}
          aria-label={`Ouvrir l’assistante ${AFTER_HOURS_AGENT.displayName}`}
        >
          <img src={AFTER_HOURS_AGENT.photoUrl} alt="" className="aha-fab__photo" />
          <span className="aha-fab__badge">Hors horaires</span>
          <span className="aha-fab__pulse" />
        </button>
      )}

      {open && (
        <div className="aha-panel" role="dialog" aria-label="Conseillère IA hors horaires">
          <header className="aha-panel__header">
            <div className={`aha-avatar ${speaking ? 'aha-avatar--talking' : ''}`}>
              <img src={AFTER_HOURS_AGENT.photoUrl} alt={AFTER_HOURS_AGENT.displayName} />
              {speaking && <span className="aha-avatar__wave" />}
            </div>
            <div className="aha-panel__meta">
              <strong>{AFTER_HOURS_AGENT.displayName}</strong>
              <span>{AFTER_HOURS_AGENT.title} · IA avatarisée</span>
              <em>{status.reason}</em>
            </div>
            <div className="aha-panel__tools">
              <button
                type="button"
                title={voiceOn ? 'Couper la voix' : 'Activer la voix'}
                onClick={() => {
                  setVoiceOn((v) => !v);
                  if (voiceOn && window.speechSynthesis) window.speechSynthesis.cancel();
                  setSpeaking(false);
                }}
              >
                {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="aha-panel__messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`aha-msg aha-msg--${m.role}`}>
                {m.role === 'assistant' && (
                  <img src={AFTER_HOURS_AGENT.photoUrl} alt="" className="aha-msg__face" />
                )}
                <div className="aha-msg__bubble">
                  <p>{m.content}</p>
                  {m.quickReplies?.length > 0 && (
                    <div className="aha-msg__quick">
                      {m.quickReplies.map((q) => (
                        <button key={q} type="button" onClick={() => handleUserText(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="aha-typing">Sara écrit…</div>}
          </div>

          <form
            className="aha-panel__form"
            onSubmit={(e) => {
              e.preventDefault();
              handleUserText(input);
            }}
          >
            <button
              type="button"
              className={`aha-mic ${listening ? 'aha-mic--on' : ''}`}
              disabled={!supported}
              title={supported ? 'Message vocal' : 'Vocal non supporté sur ce navigateur'}
              onClick={() => (listening ? stop() : start())}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un message ou parler…"
              aria-label="Message texte"
            />
            <button type="submit" className="aha-send" disabled={!input.trim() || loading}>
              <MessageCircle size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AfterHoursAvatarAgent;
