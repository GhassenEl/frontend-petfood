import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertTriangle, Phone } from 'lucide-react';
import { askVetAssistant } from '../services/vetIntelligenceService';
import { getPetPhoto, PET_LABEL } from '../utils/petAvatars';
import { DEMO_HOME_CLINIC } from '../utils/vetEmergencyAfterHours';

const VetConversationalAssistant = forwardRef(({
  pets = [],
  quickQuestions = [],
  region = '',
  clinic = DEMO_HOME_CLINIC,
  nearbyVets = null,
}, ref) => {
  const [petIndex, setPetIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis l\'assistant vétérinaire PetfoodTN. Posez vos questions courantes (symptômes, vaccins, alimentation). En cas d\'urgence ou si le cabinet est fermé, je vous donne le numéro du cabinet, les vétérinaires d\'astreinte selon votre région, et des suggestions IA. Je ne remplace pas un diagnostic clinique.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const pet = pets[petIndex] || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = String(text || input).trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const reply = await askVetAssistant({
        message: msg,
        pet,
        history,
        region,
        clinic,
        nearbyVets,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.message,
          urgent: reply.urgent,
          clinicClosed: reply.clinicClosed,
          contacts: reply.contacts,
          shouldShowVetCTA: reply.shouldShowVetCTA,
          quickReplies: reply.quickReplies,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erreur de connexion. Réessayez ou consultez un vétérinaire.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    ask: (text) => send(text),
  }));

  return (
    <div className="vetintel-chat">
      <div className="vetintel-chat__toolbar">
        {pets.length > 0 && (
          <label className="vetintel-select">
            <span>Animal</span>
            <select value={petIndex} onChange={(e) => setPetIndex(Number(e.target.value))}>
              {pets.map((p, i) => (
                <option key={p.id || i} value={i}>{p.name}</option>
              ))}
            </select>
          </label>
        )}
        {pet && (
          <div className="vetintel-pet-chip">
            <img src={getPetPhoto(pet.type)} alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
            <span>{pet.name} · {PET_LABEL[pet.type] || pet.type}</span>
          </div>
        )}
      </div>

      <div className="vetintel-quick">
        {quickQuestions.map((q) => (
          <button key={q} type="button" className="vetintel-quick-btn" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="vetintel-messages">
        {messages.map((m, i) => (
          <div key={`${m.role}-${i}`} className={`vetintel-msg vetintel-msg--${m.role}`}>
            {m.urgent && (
              <span className="vetintel-urgent"><AlertTriangle size={14} aria-hidden /> Urgent</span>
            )}
            {m.clinicClosed && (
              <span className="vetintel-closed-badge">Cabinet fermé</span>
            )}
            <p className="vetintel-msg__text">{m.content}</p>
            {(m.contacts || []).length > 0 && (
              <div className="vetintel-contacts">
                {m.contacts.slice(0, 6).map((c) => (
                  <a
                    key={`${c.phone}-${c.name}`}
                    className="vetintel-contact-chip"
                    href={`tel:${c.phone}`}
                  >
                    <Phone size={14} aria-hidden />
                    <span>
                      <strong>{c.label}</strong>
                      <br />
                      {c.name} · {c.phone}
                    </span>
                  </a>
                ))}
              </div>
            )}
            {m.shouldShowVetCTA && m.role === 'assistant' && (
              <div className="vetintel-cta-row">
                <Link to="/veterinary">Prendre RDV →</Link>
                <Link to="/client-teleconsult">Téléconsultation →</Link>
              </div>
            )}
            {(m.quickReplies || []).length > 0 && (
              <div className="vetintel-quick" style={{ marginTop: 8 }}>
                {m.quickReplies.map((q) => (
                  <button key={q} type="button" className="vetintel-quick-btn" onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="vetintel-muted">L&apos;assistant réfléchit…</p>}
        <div ref={bottomRef} />
      </div>

      <form
        className="vetintel-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex. urgence, cabinet fermé, saignement…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>

      <p className="vetintel-disclaimer">
        Orientation pré-consultation uniquement. En urgence vitale, appelez immédiatement le numéro d&apos;astreinte.
      </p>
    </div>
  );
});

VetConversationalAssistant.displayName = 'VetConversationalAssistant';

export default VetConversationalAssistant;
