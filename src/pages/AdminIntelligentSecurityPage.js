import React, { useCallback, useEffect, useState } from 'react';
import { Shield, CreditCard, Key, MessageSquareOff } from 'lucide-react';
import FraudDetectionPanel from '../components/FraudDetectionPanel';
import JwtAuthSecurityPanel from '../components/JwtAuthSecurityPanel';
import AutoModerationPanel from '../components/AutoModerationPanel';
import { loadIntelligentSecurityPack } from '../services/intelligentSecurityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminIntelligentSecurity.css';

const TABS = [
  { id: 'fraud', label: 'Détection de fraude', icon: CreditCard },
  { id: 'jwt', label: 'Authentification JWT', icon: Key },
  { id: 'moderation', label: 'Modération automatique', icon: MessageSquareOff },
];

const AdminIntelligentSecurityPage = () => {
  const [tab, setTab] = useState('fraud');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadIntelligentSecurityPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  return (
    <div className="ais-page">
      <h1>
        <Shield size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Sécurité intelligente
      </h1>
      <p className="ais-lead">
        Fraude, authentification JWT multi-rôles et filtrage automatique des contenus offensants ou spam.
      </p>

      <div className="ais-tabs" role="tablist" aria-label="Sécurité intelligente">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`ais-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="ais-panel-wrap" role="tabpanel">
        {tab === 'fraud' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Transactions suspectes</h2>
            <FraudDetectionPanel
              alerts={pack?.fraudAlerts}
              behavior={pack?.behavior}
              loading={loading}
            />
          </>
        )}

        {tab === 'jwt' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Authentification sécurisée</h2>
            <JwtAuthSecurityPanel jwt={pack?.jwt} loading={loading} />
          </>
        )}

        {tab === 'moderation' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Modération automatique</h2>
            <p className="ais-lead" style={{ marginBottom: 12 }}>
              Commentaires offensants, spam et contenus inappropriés — file d&apos;attente IA.
            </p>
            <AutoModerationPanel queue={pack?.moderationQueue} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminIntelligentSecurityPage;
