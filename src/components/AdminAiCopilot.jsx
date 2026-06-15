import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Sparkles } from 'lucide-react';
import { postAdminCopilot } from '../services/advancedAiService';

const QUICK = [
  'Quelles actions prioritaires cette semaine ?',
  'Analyse le risque churn et propose un plan CRM',
  'Quels produits réapprovisionner en urgence ?',
  'Synthèse des alertes fraude et commandes à risque',
  'Opportunités promo basées sur les top ventes',
];

const AdminAiCopilot = ({ pack }) => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Bonjour ! Je suis votre copilote IA admin. Posez-moi des questions sur les ventes, le stock, le churn, les réclamations ou les partenariats — je m\'appuie sur les données plateforme en temps réel.',
    suggestions: QUICK.slice(0, 3),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = useCallback(async (text) => {
    const msg = String(text || '').trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await postAdminCopilot(msg, { kpis: pack?.kpis });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.message || 'Pas de réponse.',
        suggestions: res.suggestions || [],
        groqPowered: res.groqPowered,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Copilote indisponible. Consultez les onglets Prévisions ML et Automatisations.',
        suggestions: [],
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [loading, pack?.kpis]);

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Bot size={24} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Copilote IA admin (Groq)</h3>
        {pack?.groqPowered && (
          <span style={badge}><Sparkles size={12} /> Groq actif</span>
        )}
      </div>

      <div style={chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...bubble, ...(m.role === 'user' ? userBubble : assistantBubble) }}>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: 14 }}>{m.content}</div>
            {m.suggestions?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {m.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} style={chipBtn}>{s}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ ...bubble, ...assistantBubble, opacity: 0.7 }}>Analyse en cours…</div>}
        <div ref={endRef} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} style={chipBtn}>{q}</button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex. : Quel est le plan d'action pour réduire le churn ?"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14 }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={sendBtn}>
          <Send size={16} />
        </button>
      </form>

      <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8' }}>
        Liens utiles :{' '}
        <Link to="/admin/ml-agent" style={link}>Agent ML</Link>
        {' · '}
        <Link to="/admin/incidents-ml" style={link}>Incidents ML</Link>
        {' · '}
        <Link to="/admin/nlp-models" style={link}>Modèles NLP</Link>
      </p>
    </div>
  );
};

const card = { background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };
const chatBox = { maxHeight: 400, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 };
const bubble = { padding: '12px 14px', borderRadius: 12, maxWidth: '92%' };
const userBubble = { alignSelf: 'flex-end', background: '#ede9fe', color: '#4c1d95' };
const assistantBubble = { alignSelf: 'flex-start', background: '#f8fafc', border: '1px solid #e2e8f0' };
const badge = { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '4px 10px', borderRadius: 999 };
const chipBtn = { padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#475569' };
const sendBtn = { padding: '10px 16px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const link = { color: '#7c3aed', fontWeight: 600, textDecoration: 'none' };

export default AdminAiCopilot;
