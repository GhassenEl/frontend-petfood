import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { askVisitorAssistant } from '../services/visitorIntelligenceHubService';

const VisitorConversationalAssistant = ({ quickQuestions = [] }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je réponds à vos questions sur les produits, la nutrition, les commandes et les rendez-vous vétérinaires. Créez un compte pour accéder à la boutique complète.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = String(text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const reply = await askVisitorAssistant(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.message,
          quickReplies: reply.quickReplies,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vis-intel-chat">
      <div className="vis-intel-quick">
        {quickQuestions.map((q) => (
          <button key={q} type="button" onClick={() => send(q)}>{q}</button>
        ))}
      </div>
      <div className="vis-intel-messages">
        {messages.map((m, i) => (
          <div key={i} className={`vis-intel-msg vis-intel-msg--${m.role}`}>
            <p>{m.content}</p>
            {(m.quickReplies || []).length > 0 && (
              <div className="vis-intel-quick" style={{ marginTop: 8 }}>
                {m.quickReplies.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)}>{q}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="vis-intel-muted">Réponse en cours…</p>}
        <div ref={bottomRef} />
      </div>
      <form className="vis-intel-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>
      <p className="vis-intel-disclaimer">
        Mode visiteur — <Link to="/register">Créer un compte</Link> pour commander et prendre RDV véto.
      </p>
    </div>
  );
};

export default VisitorConversationalAssistant;
