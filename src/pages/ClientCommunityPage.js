import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Gift, RefreshCw } from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadCommunityPack } from '../services/communityService';
import CommunityFeed from '../components/CommunityFeed';
import CommunityPostForm from '../components/CommunityPostForm';
import UserReputationPanel from '../components/UserReputationPanel';
import SmartLoyaltyRewardsPanel from '../components/SmartLoyaltyRewardsPanel';
import './ClientCommunity.css';

const TABS = [
  { id: 'feed', label: 'Réseau social', icon: Users },
  { id: 'reputation', label: 'Réputation', icon: Trophy },
  { id: 'loyalty', label: 'Fidélité IA', icon: Gift },
];

const ClientCommunityPage = () => {
  const [tab, setTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadCommunityPack());
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

  const handlePosted = () => load();

  if (loading && !pack) {
    return <div className="comm-page"><p className="comm-loading">Chargement…</p></div>;
  }

  return (
    <div className="comm-page">
      <h1>
        <Users size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Communauté PetFoodTN
      </h1>
      <p className="comm-lead">
        Réseau social des propriétaires : photos, conseils, expériences et avis produits.
        Réputation basée sur la qualité de vos contributions et récompenses fidélité personnalisées par l&apos;IA.
      </p>

      <div className="comm-toolbar">
        <div className="comm-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`comm-tab${tab === id ? ' comm-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="comm-btn comm-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'feed' && (
        <>
          <CommunityPostForm onPosted={handlePosted} />
          <CommunityFeed posts={pack?.posts || []} />
        </>
      )}

      {tab === 'reputation' && (
        <UserReputationPanel
          myReputation={pack?.myReputation}
          leaderboard={pack?.leaderboard}
        />
      )}

      {tab === 'loyalty' && (
        <>
          <SmartLoyaltyRewardsPanel
            smartRewards={pack?.smartRewards}
            points={pack?.loyalty?.points ?? 0}
          />
          <p className="comm-footer-link">
            <Link to="/client-loyalty">Voir l&apos;historique complet des points →</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default ClientCommunityPage;
