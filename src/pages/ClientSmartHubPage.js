import React, { useState } from 'react';
import { Link2, Bell, Brain, ShoppingBag, Trophy, Mic, Sparkles } from 'lucide-react';
import BlockchainTraceHubPanel from '../components/BlockchainTraceHubPanel';
import SmartNotificationsHubPanel from '../components/SmartNotificationsHubPanel';
import ExpertSystemPanel from '../components/ExpertSystemPanel';
import MarketplaceIntelligenceHubPanel from '../components/MarketplaceIntelligenceHubPanel';
import GamificationHubPanel from '../components/GamificationHubPanel';
import VoiceAssistantPanel from '../components/VoiceAssistantPanel';
import { countUnreadSmartNotifications } from '../utils/smartNotificationsHubEngine';
import './ClientSmartHub.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Sparkles },
  { id: 'blockchain', label: 'Blockchain', icon: Link2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'expert', label: 'Système expert', icon: Brain },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'gamification', label: 'Gamification', icon: Trophy },
  { id: 'voice', label: 'Vocal IA', icon: Mic },
];

const MODULE_CARDS = [
  { id: 'blockchain', icon: '🔗', title: 'Traçabilité blockchain', desc: 'Origine exacte des croquettes, historique livraisons infalsifiable.', tab: 'blockchain' },
  { id: 'notifications', icon: '🔔', title: 'Smart Notifications', desc: 'Repas, vaccins, rupture stock, aliment détérioré.', tab: 'notifications' },
  { id: 'expert', icon: '🧠', title: 'Système expert', desc: 'Régime adapté — ex. chat 8 ans obèse.', tab: 'expert' },
  { id: 'marketplace', icon: '🛒', title: 'Marketplace IA', desc: 'Comparaison prix, alternatives, promos perso.', tab: 'marketplace' },
  { id: 'gamification', icon: '🏆', title: 'Gamification', desc: 'Points fidélité, badges, récompenses achats.', tab: 'gamification' },
  { id: 'voice', icon: '🎙️', title: 'Assistant vocal', desc: '« Montre-moi les croquettes pour mon chien ».', tab: 'voice' },
];

const ClientSmartHubPage = () => {
  const [tab, setTab] = useState('overview');
  const notifUnread = countUnreadSmartNotifications();

  return (
    <div className="shub-page">
      <header className="shub-hero">
        <p className="shub-hero__eyebrow">PetfoodTN Smart</p>
        <h1>Hub intelligent client</h1>
        <p>
          Blockchain, notifications intelligentes, système expert nutrition, marketplace IA,
          gamification et assistant vocal — unifiés en un seul espace.
        </p>
        <div className="shub-hero__stats">
          <div><strong>6</strong><span>Modules</span></div>
          <div><strong>{notifUnread}</strong><span>Alertes</span></div>
          <div><strong>IA</strong><span>Règles + vocal</span></div>
        </div>
      </header>

      <div className="shub-tabs" role="tablist" aria-label="Modules hub intelligent">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`shub-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} aria-hidden />
            {label}
            {id === 'notifications' && notifUnread > 0 && (
              <span className="shub-tab-badge">{notifUnread}</span>
            )}
          </button>
        ))}
      </div>

      <div className="shub-content" role="tabpanel">
        {tab === 'overview' && (
          <div className="shub-overview-grid">
            {MODULE_CARDS.map((m) => (
              <button
                key={m.id}
                type="button"
                className="shub-overview-card"
                onClick={() => setTab(m.tab)}
              >
                <span className="shub-overview-card__icon" aria-hidden>{m.icon}</span>
                <strong>{m.title}</strong>
                <p>{m.desc}</p>
              </button>
            ))}
          </div>
        )}
        {tab === 'blockchain' && <BlockchainTraceHubPanel />}
        {tab === 'notifications' && <SmartNotificationsHubPanel />}
        {tab === 'expert' && <ExpertSystemPanel />}
        {tab === 'marketplace' && <MarketplaceIntelligenceHubPanel />}
        {tab === 'gamification' && <GamificationHubPanel />}
        {tab === 'voice' && <VoiceAssistantPanel />}
      </div>
    </div>
  );
};

export default ClientSmartHubPage;
