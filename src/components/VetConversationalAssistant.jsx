import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertTriangle } from 'lucide-react';
import { askVetAssistant } from '../services/vetIntelligenceService';
import { getPetPhoto, PET_LABEL } from '../utils/petAvatars';

const VetConversationalAssistant = ({ pets = [], quickQuestions = [] }) => {
  const [petIndex, setPetIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis l\'assistant vétérinaire PetfoodTN. Posez vos questions courantes (symptômes, vaccins, alimentation) avant de consulter un professionnel. Je ne remplace pas un diagnostic clinique.',
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
      const reply = await askVetAssistant({ message: msg, pet, history });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.message,
          urgent: reply.urgent,
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
          <div key={i} className={`vetintel-msg vetintel-msg--${m.role}`}>
            {m.urgent && (
              <span className="vetintel-urgent"><AlertTriangle size={14} aria-hidden /> Urgent</span>
            )}
            <p>{m.content}</p>
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
          placeholder="Décrivez vos symptômes ou posez une question…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>

      <p className="vetintel-disclaimer">
        Orientation pré-consultation uniquement. En cas d&apos;urgence vitale, appelez un cabinet d&apos;urgences.
      </p>
    </div>
  );
};

export default VetConversationalAssistant;
