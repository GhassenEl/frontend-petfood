import React, { useMemo, useState } from 'react';
import { Download, Share2, QrCode, Copy, Check } from 'lucide-react';
import PetfoodLogo from './PetfoodLogo';
import { downloadVCard } from '../config/afterHoursAgent';
import { PETBOT } from '../config/petBotConfig';
import './DigitalBusinessCard.css';

/**
 * Carte de visite digitale — partageable + export vCard.
 */
const DigitalBusinessCard = ({
  profile = {},
  showAgent = false,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const card = useMemo(() => {
    if (showAgent) {
      return {
        personName: PETBOT.displayName,
        role: PETBOT.title,
        brandName: 'PetfoodTN',
        tagline: 'Avatar conseiller unique',
        phone: '+216 71 000 101',
        email: 'petbot@petfood.tn',
        website: typeof window !== 'undefined' ? `${window.location.origin}/support-agent` : 'https://petfood.tn',
        address: 'Voix · Panier · RDV · Suivi · FR/AR/EN',
        photoUrl: PETBOT.photoUrl,
        slogan: 'Toujours là pour vos animaux.',
      };
    }
    return {
      personName: profile.personName || profile.name || 'Votre nom',
      role: profile.role || profile.title || 'Membre PetfoodTN',
      brandName: profile.brandName || 'PetfoodTN',
      tagline: profile.tagline || 'Plateforme animaux Tunisie',
      phone: profile.phone || '',
      email: profile.email || '',
      website: profile.website || (typeof window !== 'undefined' ? window.location.origin : ''),
      address: profile.address || '',
      photoUrl: profile.photoUrl || profile.avatarUrl || '',
      slogan: profile.slogan || 'Nutrition · Santé · Livraison',
    };
  }, [profile, showAgent]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return card.website;
    const params = new URLSearchParams({
      n: card.personName,
      r: card.role,
      e: card.email || '',
      p: card.phone || '',
    });
    return `${window.location.origin}/carte-visite?${params.toString()}`;
  }, [card]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.personName} — ${card.brandName}`,
          text: `${card.role} · ${card.phone} · ${card.email}`,
          url: shareUrl,
        });
      } catch {
        /* cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className={`dbc ${compact ? 'dbc--compact' : ''}`}>
      <div className="dbc-card">
        <div className="dbc-card__top">
          <PetfoodLogo size="sm" showTagline={false} />
          <span className="dbc-card__brand">{card.brandName}</span>
        </div>
        <div className="dbc-card__body">
          <div className="dbc-card__photo-wrap">
            {card.photoUrl ? (
              <img src={card.photoUrl} alt={card.personName} className="dbc-card__photo" />
            ) : (
              <div className="dbc-card__photo dbc-card__photo--placeholder">
                {(card.personName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            {showAgent && <span className="dbc-card__live">IA · hors horaires</span>}
          </div>
          <div className="dbc-card__info">
            <h3>{card.personName}</h3>
            <p className="dbc-card__role">{card.role}</p>
            <p className="dbc-card__tag">{card.tagline}</p>
            <ul className="dbc-card__contacts">
              {card.phone && <li>📞 {card.phone}</li>}
              {card.email && <li>✉️ {card.email}</li>}
              {card.website && <li>🌐 {card.website.replace(/^https?:\/\//, '')}</li>}
              {card.address && <li>📍 {card.address}</li>}
            </ul>
            <p className="dbc-card__slogan">{card.slogan}</p>
          </div>
        </div>
        <div className="dbc-card__qr" title={shareUrl}>
          <QrCode size={28} />
          <span>Lien partage</span>
        </div>
      </div>

      <div className="dbc-actions">
        <button type="button" className="dbc-btn dbc-btn--primary" onClick={() => downloadVCard(card)}>
          <Download size={16} /> vCard (.vcf)
        </button>
        <button type="button" className="dbc-btn" onClick={shareNative}>
          <Share2 size={16} /> Partager
        </button>
        <button type="button" className="dbc-btn" onClick={copyLink}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copié' : 'Copier le lien'}
        </button>
      </div>
    </div>
  );
};

export default DigitalBusinessCard;
