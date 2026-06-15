import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Cpu, RefreshCw, Sparkles, Zap, MessageSquareText, BarChart3, Bot, ListChecks,
} from 'lucide-react';
import AdminAiCopilot from '../components/AdminAiCopilot';
import AdminMLInsights from '../components/AdminMLInsights';
import AdminSalesForecast from '../components/AdminSalesForecast';
import AdminTopProductsAI from '../components/AdminTopProductsAI';
import { fetchAdminAdvancedPack, analyzeNlpText } from '../services/advancedAiService';
import { DEMO_ADMIN_ADVANCED_AI } from '../utils/adminDemoData';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const TABS = [
  { id: 'copilot', label: 'Copilote IA', icon: Bot },
  { id: 'forecast', label: 'Prévisions ML', icon: BarChart3 },
  { id: 'automations', label: 'Automatisations', icon: ListChecks },
  { id: 'nlp', label: 'NLP & Sentiment', icon: MessageSquareText },
];

const PRIORITY_COLORS = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const AdminAdvancedAiPage = () => {
  const [tab, setTab] = useState('copilot');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nlpInput, setNlpInput] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [nlpBusy, setNlpBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAdvancedPack();
      setPack(data?.capabilities ? data : DEMO_ADMIN_ADVANCED_AI);
    } catch {
      setPack(DEMO_ADMIN_ADVANCED_AI);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const runNlp = async () => {
    const text = nlpInput.trim();
    if (!text) return;
    setNlpBusy(true);
    try {
      const res = await analyzeNlpText(text);
      setNlpResult(res);
    } catch {
      setNlpResult({
        sentiment: text.match(/mauvais|nul|retard|plainte/i) ? 'negative' : 'positive',
        score: 0.72,
        themes: ['analyse locale'],
        intent: 'feedback',
        mode: 'fallback',
      });
    } finally {
      setNlpBusy(false);
    }
  };

  const d = pack || DEMO_ADMIN_ADVANCED_AI;

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement IA avancée…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{
        ...card,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #6d28d9)',
        color: '#fff',
        border: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Brain size={28} /> IA avancée — Centre de commande
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14, maxWidth: 640 }}>
              Copilote Groq, prévisions XGBoost, actions automatiques, NLP et top produits — intelligence opérationnelle unifiée.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {d.mode === 'demo' && <DemoModePill />}
            {d.groqPowered && <span style={pill}><Sparkles size={12} /> Groq</span>}
            {d.pythonPowered && <span style={pill}><Cpu size={12} /> XGBoost</span>}
            <button type="button" onClick={load} style={btnLight}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
        {d.insight && (
          <p style={{ margin: '16px 0 0', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', fontSize: 14 }}>
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {d.insight}
          </p>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {Object.entries(d.kpis || {}).map(([k, v]) => (
          <div key={k} style={{ ...card, textAlign: 'center', padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#4c1d95' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
              {{
                ordersToday: 'Commandes',
                pendingOrders: 'En attente',
                churnRiskClients: 'Risque churn',
                nlpAlerts: 'Alertes NLP',
                stockAlerts: 'Alertes stock',
                complaintQueue: 'Réclamations',
              }[k] || k}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10,
              border: tab === id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              background: tab === id ? '#f5f3ff' : '#fff',
              color: tab === id ? '#6d28d9' : '#475569',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'copilot' && <AdminAiCopilot pack={d} />}

      {tab === 'forecast' && (
        <>
          <AdminSalesForecast />
          <AdminMLInsights />
          <AdminTopProductsAI />
        </>
      )}

      {tab === 'automations' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>Actions automatiques recommandées</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(d.autoActions || []).map((a) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, border: '1px solid #e2e8f0', background: '#fafafa',
              }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                  color: PRIORITY_COLORS[a.priority] || '#64748b',
                  minWidth: 56,
                }}
                >
                  {a.priority}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{a.label}</span>
                <Link to={a.link} style={{ color: '#7c3aed', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Exécuter →
                </Link>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to="/admin/incidents-ml" style={navLink}>Incidents ML</Link>
            <Link to="/admin/stock-bi" style={navLink}>Stock BI</Link>
            <Link to="/admin/crm" style={navLink}>CRM ML</Link>
            <Link to="/admin/ml-agent" style={navLink}>Agent ML classique</Link>
          </div>
        </div>
      )}

      {tab === 'nlp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontWeight: 800 }}>Analyseur NLP en direct</h3>
            <textarea
              value={nlpInput}
              onChange={(e) => setNlpInput(e.target.value)}
              placeholder="Collez un avis client, une réclamation ou un message…"
              rows={4}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
            <button type="button" onClick={runNlp} disabled={nlpBusy} style={{
              marginTop: 10, padding: '10px 16px', borderRadius: 10, border: 'none',
              background: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}
            >
              {nlpBusy ? 'Analyse…' : 'Analyser le texte'}
            </button>
            {nlpResult && (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#f5f3ff', fontSize: 13 }}>
                <p><strong>Sentiment :</strong> {nlpResult.sentiment || nlpResult.label || '—'}</p>
                {nlpResult.score != null && <p><strong>Score :</strong> {(nlpResult.score * 100).toFixed(0)}%</p>}
                {nlpResult.intent && <p><strong>Intention :</strong> {nlpResult.intent}</p>}
                {nlpResult.themes?.length > 0 && <p><strong>Thèmes :</strong> {nlpResult.themes.join(', ')}</p>}
              </div>
            )}
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontWeight: 800 }}>Synthèse NLP plateforme</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14 }}>
              <li style={li}>Taux positif : {((d.nlpSummary?.positiveRate || 0) * 100).toFixed(0)}%</li>
              <li style={li}>Échantillons analysés : {d.nlpSummary?.samplesAnalyzed ?? '—'}</li>
              <li style={li}>Signaux fraude : {d.nlpSummary?.fraudSignals ?? 0}</li>
              {(d.nlpSummary?.negativeThemes || []).map((t) => (
                <li key={t} style={li}>Thème négatif : {t}</li>
              ))}
            </ul>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(d.capabilities || []).map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{c.label}</span>
                  <span style={{
                    color: c.status === 'active' ? '#059669' : c.status === 'offline' ? '#dc2626' : '#d97706',
                    fontWeight: 700,
                  }}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/admin/nlp-models" style={{ ...navLink, display: 'inline-block', marginTop: 16 }}>
              Configurer les modèles NLP →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const pill = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 700 };
const btnLight = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const navLink = { color: '#7c3aed', fontWeight: 700, fontSize: 13, textDecoration: 'none', padding: '8px 14px', borderRadius: 8, background: '#f5f3ff' };
const li = { padding: '8px 0', borderBottom: '1px solid #f1f5f9' };

export default AdminAdvancedAiPage;
