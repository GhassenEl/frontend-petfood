import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Stethoscope, HelpCircle, Star } from 'lucide-react';
import VisitorLayout from '../layouts/VisitorLayout';
import { MARKETING_FAQ, MARKETING_TESTIMONIALS, MARKETING_PARTNERS } from '../config/marketingContent';
import { SERVICE_RATE_CARDS } from '../utils/clientDemoData';
import './VisitorPages.css';

const NUTRITION_TIPS = [
  {
    icon: '🐕',
    title: 'Chien',
    tips: [
      { h: 'Protéines', t: 'Minimum 25 % de protéines animales. Évitez chocolat, oignon et raisin (toxiques).' },
      { h: 'Hydratation', t: '50 à 80 ml d\'eau par kg et par jour. Eau fraîche renouvelée 2×/jour.' },
      { h: 'Races tunisiennes', t: 'Le Sloughi (lévrier arabe) a besoin d\'énergie élevée et d\'exercice quotidien.' },
    ],
  },
  {
    icon: '🐈',
    title: 'Chat',
    tips: [
      { h: 'Carnivore strict', t: 'Au moins 26 % de protéines animales et taurine essentielle.' },
      { h: 'Hydratation', t: 'Fontaine à eau recommandée — les chats boivent peu naturellement.' },
      { h: 'Chat maghrébin', t: 'Race locale adaptée au climat — pâtée + croquettes de qualité.' },
    ],
  },
  {
    icon: '🐦',
    title: 'Oiseau',
    tips: [
      { h: 'Graines', t: 'Mélange mil, alpiste, lin + fruits sans pépins et légumes frais.' },
      { h: 'Calcium', t: 'Bloc minéral ou coquille d\'huître pour perruches et colombes.' },
    ],
  },
  {
    icon: '🐰',
    title: 'NAC & autres',
    tips: [
      { h: 'Lapin', t: 'Foin à volonté + granulés limités. Légumes verts en quantité modérée.' },
      { h: 'Reptiles', t: 'Alimentation spécifique + UV et calcium — consultez un vétérinaire NAC.' },
    ],
  },
];

const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

const vetServices = SERVICE_RATE_CARDS.filter(
  (s) => ['veterinary', 'dental_cleaning', 'rehabilitation'].includes(s.type),
);

const vetPartners = MARKETING_PARTNERS.filter(
  (p) => p.type?.includes('Santé') || p.type?.includes('Vétérinaire') || p.type?.includes('Refuge'),
);

const VisitorInfoPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'nutrition');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['nutrition', 'vet', 'faq', 'reviews'].includes(t)) setTab(t);
  }, [searchParams]);

  return (
    <VisitorLayout>
      <div className="vis-page">
        <header className="vis-hero">
          <h1><BookOpen size={26} /> Informations & contenu</h1>
          <p>Conseils nutritionnels, services vétérinaires, FAQ et avis clients — accès libre.</p>
        </header>

        <div className="vis-tabs">
          <button type="button" className={`vis-tab${tab === 'nutrition' ? ' vis-tab--active' : ''}`} onClick={() => setTab('nutrition')}>
            🥗 Conseils nutrition
          </button>
          <button type="button" className={`vis-tab${tab === 'vet' ? ' vis-tab--active' : ''}`} onClick={() => setTab('vet')}>
            <Stethoscope size={14} /> Services véto
          </button>
          <button type="button" className={`vis-tab${tab === 'faq' ? ' vis-tab--active' : ''}`} onClick={() => setTab('faq')}>
            <HelpCircle size={14} /> FAQ
          </button>
          <button type="button" className={`vis-tab${tab === 'reviews' ? ' vis-tab--active' : ''}`} onClick={() => setTab('reviews')}>
            <Star size={14} /> Avis clients
          </button>
        </div>

        {tab === 'nutrition' && (
          <div className="vis-card">
            <h2>Conseils nutritionnels par espèce</h2>
            {NUTRITION_TIPS.map((block) => (
              <div key={block.title} style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 10px', color: '#0c4a6e' }}>{block.icon} {block.title}</h3>
                {block.tips.map((tip) => (
                  <div key={tip.h} className="vis-tip-card">
                    <h4>{tip.h}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{tip.t}</p>
                  </div>
                ))}
              </div>
            ))}
            <Link to="/visitor/tools" className="vis-btn vis-btn--primary">
              Simuler une recommandation nutritionnelle →
            </Link>
          </div>
        )}

        {tab === 'vet' && (
          <div className="vis-card">
            <h2>Services vétérinaires & partenaires</h2>
            <p style={{ color: '#64748b', marginBottom: 16, fontSize: '0.9rem' }}>
              Découvrez les soins disponibles sur PetfoodTN. La réservation nécessite un compte client.
            </p>
            {vetServices.map((svc) => (
              <div key={svc.type} className="vis-vet-card">
                <span className="vis-vet-card__icon">{svc.icon}</span>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>{svc.label}</h4>
                  <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '0.85rem' }}>{svc.description}</p>
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>
                    {svc.basePrice > 0 ? `À partir de ${svc.basePrice} DT` : 'Gratuit / don'}
                  </span>
                  {svc.avgRating && (
                    <span style={{ marginLeft: 10, color: '#f59e0b', fontSize: '0.85rem' }}>
                      ★ {svc.avgRating} ({svc.reviewCount} avis)
                    </span>
                  )}
                </div>
              </div>
            ))}
            <h3 style={{ margin: '20px 0 12px', color: '#0c4a6e' }}>Cliniques & refuges partenaires</h3>
            {vetPartners.map((p) => (
              <div key={p.id} className="vis-vet-card">
                <span className="vis-vet-card__icon">{p.icon}</span>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>{p.name}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                    {p.type} · {p.city} — {p.description}
                  </p>
                </div>
              </div>
            ))}
            <div className="vis-cta-banner">
              <span>Réservez un RDV vétérinaire après inscription.</span>
              <Link to="/register" className="vis-btn vis-btn--primary">Créer un compte</Link>
            </div>
          </div>
        )}

        {tab === 'faq' && (
          <div className="vis-card vis-faq">
            <h2>Questions fréquentes</h2>
            {MARKETING_FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="vis-card">
            <h2>Avis clients ({MARKETING_TESTIMONIALS.length})</h2>
            {MARKETING_TESTIMONIALS.map((t) => (
              <div key={t.id} className="vis-review">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.5rem' }}>{t.petEmoji}</span>
                  <span className="vis-review__stars">{renderStars(t.rating)}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontStyle: 'italic', color: '#334155' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  {t.name} · {t.city} · {t.service}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </VisitorLayout>
  );
};

export default VisitorInfoPage;
