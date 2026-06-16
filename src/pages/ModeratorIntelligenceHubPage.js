import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield, LayoutDashboard, AlertTriangle, MessageSquareOff,
  TrendingUp, Activity, FileWarning, RefreshCw, Bot, FileCheck,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadModeratorIntelligencePack } from '../services/moderatorIntelligenceService';
import ModeratorSmartDashboardPanel from '../components/ModeratorSmartDashboardPanel';
import ModeratorFakeReviewPanel from '../components/ModeratorFakeReviewPanel';
import AutoModerationPanel from '../components/AutoModerationPanel';
import ModeratorReputationPanel from '../components/ModeratorReputationPanel';
import FraudDetectionPanel from '../components/FraudDetectionPanel';
import ModeratorComplaintClassificationPanel from '../components/ModeratorComplaintClassificationPanel';
import ModeratorAiGeneratedReviewPanel from '../components/ModeratorAiGeneratedReviewPanel';
import ModeratorContentQualityPanel from '../components/ModeratorContentQualityPanel';
import './ModeratorIntelligenceHub.css';
import './AdminIntelligentSecurity.css';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'fake-reviews', label: 'Faux avis', icon: AlertTriangle },
  { id: 'ai-reviews', label: 'Avis IA', icon: Bot },
  { id: 'content-quality', label: 'Qualité contenu', icon: FileCheck },
  { id: 'moderation', label: 'Modération auto', icon: MessageSquareOff },
  { id: 'reputation', label: 'Réputation', icon: TrendingUp },
  { id: 'activity', label: 'Activités suspectes', icon: Activity },
  { id: 'complaints', label: 'Réclamations IA', icon: FileWarning },
];

const TAB_IDS = TABS.map((t) => t.id);

const ModeratorIntelligenceHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    TAB_IDS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'dashboard',
  );
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadModeratorIntelligencePack());
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

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TAB_IDS.includes(t)) setTab(t);
  }, [searchParams]);

  usePlatformRefresh(load, [load]);

  return (
    <div className="modi-page">
      <h1>
        <Shield size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Intelligence modération
      </h1>
      <p className="modi-lead">
        Détection des faux avis et avis générés par IA, analyse qualité du contenu en temps réel,
        modération automatique, réputation, activités suspectes et classification des réclamations.
      </p>

      <div className="modi-toolbar">
        <div className="modi-tabs" role="tablist" aria-label="Intelligence modération">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`modi-tab${tab === id ? ' modi-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="modi-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'dashboard' && (
        <ModeratorSmartDashboardPanel
          stats={pack?.stats}
          liveFeed={pack?.liveFeed}
          loading={loading}
        />
      )}

      {tab === 'fake-reviews' && (
        <ModeratorFakeReviewPanel items={pack?.fakeReviews} loading={loading} />
      )}

      {tab === 'ai-reviews' && (
        <ModeratorAiGeneratedReviewPanel items={pack?.aiGeneratedReviews} loading={loading} />
      )}

      {tab === 'content-quality' && (
        <ModeratorContentQualityPanel items={pack?.contentQualityItems} loading={loading} />
      )}

      {tab === 'moderation' && (
        <>
          <p className="modi-summary">
            Détection automatique : spam, insultes, contenus inappropriés, publicités abusives.
          </p>
          <AutoModerationPanel queue={pack?.moderationQueue} loading={loading} />
          <p className="modi-footer">
            <Link to="/moderator/content">Modération contenu manuelle →</Link>
          </p>
        </>
      )}

      {tab === 'reputation' && (
        <ModeratorReputationPanel
          reputation={pack?.reputation}
          watchlist={pack?.userWatchlist}
          loading={loading}
        />
      )}

      {tab === 'activity' && (
        <>
          <p className="modi-summary">
            Comptes massifs, commandes frauduleuses, publications répétitives et comportements anormaux.
          </p>
          <FraudDetectionPanel
            alerts={pack?.suspiciousActivities}
            behavior={{ suspicious: (pack?.suspiciousActivities?.length || 0) > 0 }}
            loading={loading}
          />
        </>
      )}

      {tab === 'complaints' && (
        <ModeratorComplaintClassificationPanel
          items={pack?.classifiedComplaints}
          breakdown={pack?.categoryBreakdown}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ModeratorIntelligenceHubPage;
