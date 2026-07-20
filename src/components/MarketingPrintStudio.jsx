import React, { useCallback, useMemo, useState } from 'react';
import { Printer, Download, Copy, Check, RefreshCw } from 'lucide-react';
import PetfoodLogo from './PetfoodLogo';
import {
  MARKETING_PRINT_TEMPLATES,
  DEFAULT_PRINT_PROFILE,
} from '../config/marketingPrintCatalog';

const STORAGE_KEY = 'petfoodtn_print_profile_v1';

const QrPlaceholder = ({ url, size = 72 }) => (
  <div className="mkt-print-qr" style={{ width: size, height: size }} title={url}>
    <div className="mkt-print-qr__grid" />
    <span className="mkt-print-qr__label">QR</span>
  </div>
);

const BusinessCardFront = ({ p }) => (
  <div className="mkt-print-card mkt-print-card--front">
    <div className="mkt-print-card__brand">
      <PetfoodLogo size="sm" showTagline={false} />
      <div>
        <strong className="mkt-print-card__brandname">{p.brandName}</strong>
        <span className="mkt-print-card__tag">{p.tagline}</span>
      </div>
    </div>
    <div className="mkt-print-card__person">
      <h3>{p.personName || 'Votre nom'}</h3>
      <p>{p.role}</p>
    </div>
    <div className="mkt-print-card__contacts">
      <span>📞 {p.phone}</span>
      <span>✉️ {p.email}</span>
      <span>🌐 {p.website}</span>
    </div>
  </div>
);

const BusinessCardBack = ({ p }) => (
  <div className="mkt-print-card mkt-print-card--back">
    <QrPlaceholder url={p.qrUrl} size={64} />
    <div className="mkt-print-card__backcopy">
      <p className="mkt-print-card__slogan">{p.slogan}</p>
      <p className="mkt-print-card__addr">{p.address}</p>
      <p className="mkt-print-card__scan">Scannez pour découvrir la plateforme</p>
    </div>
    <div className="mkt-print-card__badges">
      <span>🍽️ Gamelle IoT</span>
      <span>🩺 Vétérinaire</span>
      <span>🛒 Boutique</span>
    </div>
  </div>
);

const FlyerA5 = ({ p }) => (
  <div className="mkt-print-flyer">
    <header className="mkt-print-flyer__hero">
      <PetfoodLogo size="md" showTagline />
      <h2>{p.brandName}</h2>
      <p>{p.tagline}</p>
    </header>
    <section className="mkt-print-flyer__grid">
      <div>
        <h4>🍽️ Gamelle intelligente</h4>
        <p>MQTT · portions pesées · alertes réservoir · app mobile.</p>
      </div>
      <div>
        <h4>🎯 Recommandations IA</h4>
        <p>Nutrition sur mesure pour chien, chat, NAC et oiseaux.</p>
      </div>
      <div>
        <h4>🚚 Livraison Tunisie</h4>
        <p>Tunis, Sousse, Sfax — paiement wallet ou carte.</p>
      </div>
      <div>
        <h4>📱 Application mobile</h4>
        <p>Suivi repas, IoT, commandes et fidélité intégrés.</p>
      </div>
    </section>
    <footer className="mkt-print-flyer__footer">
      <div>
        <strong>{p.personName}</strong> · {p.role}
        <br />
        {p.phone} · {p.email}
      </div>
      <QrPlaceholder url={p.qrUrl} size={80} />
    </footer>
  </div>
);

const RollupBanner = ({ p }) => (
  <div className="mkt-print-rollup">
    <div className="mkt-print-rollup__inner">
      <PetfoodLogo size="lg" variant="light" showTagline />
      <h1>{p.brandName}</h1>
      <p className="mkt-print-rollup__lead">{p.slogan}</p>
      <ul>
        <li>Marketplace alimentation & accessoires</li>
        <li>Gamelle ESP32 connectée + ML comportemental</li>
        <li>Écosystème vétérinaire & traçabilité</li>
      </ul>
      <p className="mkt-print-rollup__cta">{p.website}</p>
    </div>
  </div>
);

const ProductTag = ({ p }) => (
  <div className="mkt-print-tag">
    <strong>{p.brandName}</strong>
    <span>Gamelle intelligente</span>
    <small>{p.website}</small>
  </div>
);

const MarketingPrintStudio = ({ defaults = DEFAULT_PRINT_PROFILE, title = 'Studio print & cartes de visite', storageKey = STORAGE_KEY }) => {
  const [templateId, setTemplateId] = useState('business-card');
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const template = useMemo(
    () => MARKETING_PRINT_TEMPLATES.find((t) => t.id === templateId) || MARKETING_PRINT_TEMPLATES[0],
    [templateId],
  );

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));

  const saveProfile = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  }, [profile, storageKey]);

  const resetProfile = () => {
    setProfile({ ...defaults });
    localStorage.removeItem(storageKey);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportHtml = () => {
    const area = document.getElementById('mkt-print-export-area');
    if (!area) return;
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${template.label} — ${profile.brandName}</title>`,
        '<link rel="stylesheet" href="/static/css/print-fallback.css">',
        '<style>body{font-family:Segoe UI,sans-serif;padding:24px;background:#f1f5f9}',
        '.mkt-print-card{width:85mm;height:55mm;display:inline-block;margin:8px;border-radius:8px;overflow:hidden}',
        '</style></head><body>',
        area.innerHTML,
        '</body></html>'].join(''),
      { type: 'text/html' },
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `petfoodtn-${templateId}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyContacts = async () => {
    const text = [
      profile.personName,
      profile.role,
      profile.phone,
      profile.email,
      profile.website,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const renderPreview = () => {
    switch (templateId) {
      case 'flyer-a5':
        return <FlyerA5 p={profile} />;
      case 'rollup':
        return <RollupBanner p={profile} />;
      case 'product-tag':
        return <ProductTag p={profile} />;
      default:
        return (
          <div className="mkt-print-cards-row">
            <BusinessCardFront p={profile} />
            <BusinessCardBack p={profile} />
          </div>
        );
    }
  };

  return (
    <div className="mkt-print-studio">
      <div className="mkt-print-studio__head">
        <div>
          <h2>{title}</h2>
          <p className="mkt-lead">
            Créez cartes de visite, flyers et supports salon — personnalisez, imprimez ou exportez.
          </p>
        </div>
        <div className="mkt-print-studio__actions">
          <button type="button" className="mkt-btn-ghost" onClick={copyContacts}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copié' : 'Copier contacts'}
          </button>
          <button type="button" className="mkt-btn-ghost" onClick={exportHtml}>
            <Download size={16} /> Export HTML
          </button>
          <button type="button" className="mkt-btn-ghost" onClick={handlePrint}>
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>

      <div className="mkt-print-template-grid">
        {MARKETING_PRINT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mkt-print-template${templateId === t.id ? ' mkt-print-template--active' : ''}`}
            onClick={() => setTemplateId(t.id)}
          >
            <span className="mkt-print-template__icon">{t.icon}</span>
            <strong>{t.label}</strong>
            <span className="mkt-print-template__fmt">{t.format}</span>
            <p>{t.description}</p>
          </button>
        ))}
      </div>

      <div className="mkt-print-layout">
        <form className="mkt-print-form mkt-panel" onSubmit={(e) => e.preventDefault()}>
          <h3>Identité & contacts</h3>
          {[
            ['brandName', 'Marque / enseigne'],
            ['tagline', 'Accroche'],
            ['personName', 'Nom complet'],
            ['role', 'Fonction'],
            ['phone', 'Téléphone'],
            ['email', 'Email'],
            ['website', 'Site web'],
            ['address', 'Adresse / villes'],
            ['slogan', 'Message verso / flyer'],
            ['qrUrl', 'URL QR code'],
          ].map(([key, label]) => (
            <label key={key} className="mkt-print-field">
              <span>{label}</span>
              <input
                type="text"
                value={profile[key] || ''}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
          <div className="mkt-print-form__btns">
            <button type="button" className="mkt-btn-ghost" onClick={saveProfile}>
              {saved ? 'Enregistré ✓' : 'Enregistrer le profil'}
            </button>
            <button type="button" className="mkt-btn-ghost" onClick={resetProfile}>
              <RefreshCw size={14} /> Réinitialiser
            </button>
          </div>
        </form>

        <div className="mkt-print-preview-wrap">
          <div className="mkt-print-preview__label">
            Aperçu — {template.label} ({template.format})
          </div>
          <div id="mkt-print-export-area" className={`mkt-print-preview mkt-print-preview--${templateId}`}>
            {renderPreview()}
          </div>
          <p className="mkt-print-hint">
            Conseil impression : papier 300 g/m² pour cartes · marges 3 mm · activer « graphiques d&apos;arrière-plan ».
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingPrintStudio;
