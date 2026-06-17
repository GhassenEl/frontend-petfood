import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, Key, MessageSquareOff, LayoutDashboard, Users, ShieldCheck } from 'lucide-react';
import FraudDetectionPanel from '../components/FraudDetectionPanel';
import JwtAuthSecurityPanel from '../components/JwtAuthSecurityPanel';
import TwoFactorAuthPanel from '../components/TwoFactorAuthPanel';
import AutoModerationPanel from '../components/AutoModerationPanel';
import PlatformSecurityOverviewPanel from '../components/PlatformSecurityOverviewPanel';
import AdminActiveSessionsPanel from '../components/AdminActiveSessionsPanel';
import { loadPlatformSecurityPack } from '../services/platformSecurityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminIntelligentSecurity.css';

const TABS = [
  { id: 'overview', label: 'Posture sécurité', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions actives', icon: Users },
  { id: 'fraud', label: 'Détection fraude', icon: CreditCard },
  { id: 'jwt', label: 'Authentification JWT', icon: Key },
  { id: '2fa', label: '2FA', icon: ShieldCheck },
  { id: 'moderation', label: 'Modération auto', icon: MessageSquareOff },
];

const AdminIntelligentSecurityPage = () => {
  const [tab, setTab] = useState('overview');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadPlatformSecurityPack());
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

  const intel = pack?.intelligent;

  return (
    <div className="ais-page">
      <h1>
        <Shield size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Sécurité intelligente
      </h1>
      <p className="ais-lead">
        Posture sécurité, sessions actives, fraude, JWT multi-rôles et filtrage automatique des contenus.
        {' '}
        <Link to="/admin/security" style={{ color: '#7c3aed', fontWeight: 700 }}>
          Centre IDS / anti-virus →
        </Link>
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
        {tab === 'overview' && (
          <PlatformSecurityOverviewPanel pack={pack} loading={loading} />
        )}

        {tab === 'sessions' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Sessions actives</h2>
            <p className="ais-lead" style={{ marginBottom: 12 }}>
              Surveillance des connexions — révoquez les sessions suspectes.
            </p>
            <AdminActiveSessionsPanel sessions={pack?.activeSessions} loading={loading} />
          </>
        )}

        {tab === 'fraud' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Transactions suspectes</h2>
            <FraudDetectionPanel
              alerts={intel?.fraudAlerts}
              behavior={intel?.behavior}
              loading={loading}
            />
          </>
        )}

        {tab === 'jwt' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Authentification sécurisée</h2>
            <JwtAuthSecurityPanel jwt={intel?.jwt} loading={loading} />
          </>
        )}

        {tab === '2fa' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Authentification à deux facteurs</h2>
            <TwoFactorAuthPanel enabled={intel?.twoFactorEnabled} />
          </>
        )}

        {tab === 'moderation' && (
          <>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Modération automatique</h2>
            <p className="ais-lead" style={{ marginBottom: 12 }}>
              Commentaires offensants, spam et contenus inappropriés — file d&apos;attente IA.
            </p>
            <AutoModerationPanel queue={intel?.moderationQueue} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminIntelligentSecurityPage;
