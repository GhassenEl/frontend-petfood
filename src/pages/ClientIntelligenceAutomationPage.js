import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HybridNlpPanel from '../components/HybridNlpPanel';
import N8nTaskManagerPanel from '../components/N8nTaskManagerPanel';
import CommentSentimentPanel from '../components/CommentSentimentPanel';
import './ClientIntelligenceAutomation.css';

const TABS = [
  { id: 'hybrid', label: '🧠 Filtrage hybride' },
  { id: 'sentiment', label: '💬 Sentiments' },
  { id: 'n8n', label: '⚡ Automatisations n8n' },
];

const ClientIntelligenceAutomationPage = () => {
  const [tab, setTab] = useState('hybrid');

  return (
    <div className="cia-page">
      <header className="cia-hero">
        <h1>Intelligence &amp; automatisations</h1>
        <p>
          Filtrage hybride NLP + deep learning, analyse des mots et des sentiments, détection d&apos;anomalies
          et gestionnaire de tâches n8n pour vos rappels, commandes et alertes.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/client-reviews" style={linkBtn}>Mes avis</Link>
          <Link to="/client-advanced-ai" style={linkBtn}>IA avancée</Link>
          <Link to="/client-ml-agent" style={linkBtn}>Agent ML</Link>
        </div>
      </header>

      <nav className="cia-tabs" aria-label="Sections intelligence">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`cia-tab${tab === t.id ? ' cia-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'hybrid' && <HybridNlpPanel />}
      {tab === 'sentiment' && (
        <div className="cia-panel">
          <h2 className="cia-panel__title">Analyse des sentiments — vos commentaires</h2>
          <p className="cia-panel__desc">
            Synthèse BERT multilingue + mots-clés sur vos avis produits, services et réclamations.
          </p>
          <CommentSentimentPanel variant="client" />
        </div>
      )}
      {tab === 'n8n' && <N8nTaskManagerPanel />}
    </div>
  );
};

const linkBtn = {
  padding: '8px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};

export default ClientIntelligenceAutomationPage;
