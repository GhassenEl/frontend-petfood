import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DigitalBusinessCard from '../components/DigitalBusinessCard';
import PetBotAvatar from '../components/PetBotAvatar';
import { useAuth } from '../contexts/AuthContext';
import { PETBOT } from '../config/petBotConfig';

/**
 * /carte-visite — carte digitale
 * /support-agent — PetBot (avatar unique)
 */
const DigitalCardPage = ({ mode = 'card' }) => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const isAgent = mode === 'agent';

  const profile = useMemo(() => {
    if (isAgent) return null;
    return {
      personName: params.get('n') || user?.name || 'Membre PetfoodTN',
      role: params.get('r') || (user?.role === 'vet' ? 'Vétérinaire' : user?.role === 'vendor' ? 'Vendeur' : 'Client PetfoodTN'),
      email: params.get('e') || user?.email || '',
      phone: params.get('p') || user?.phone || '',
      address: user?.address || '',
      photoUrl: user?.avatarUrl || user?.photo || '',
      brandName: 'PetfoodTN',
    };
  }, [params, user, isAgent]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0fdfa,#f8fafc)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#134e4a' }}>
          {isAgent ? 'PetBot — conseiller virtuel' : 'Carte de visite digitale'}
        </h1>
        <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>
          {isAgent
            ? `${PETBOT.displayName} vous aide en temps réel : voix, panier, RDV toilettage, suivi commande.`
            : 'Partagez votre carte, exportez un fichier vCard, ou scannez le lien.'}
        </p>
        <DigitalBusinessCard profile={profile || {}} showAgent={isAgent} />
        {isAgent && (
          <p style={{ marginTop: 20, fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
            PetBot s’ouvre automatiquement — texte, micro ou photo.
          </p>
        )}
      </div>
      {isAgent && <PetBotAvatar autoOpen forceOpen />}
    </div>
  );
};

export default DigitalCardPage;
