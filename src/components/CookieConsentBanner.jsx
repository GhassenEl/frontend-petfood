import React, { useCallback, useEffect, useState } from 'react';
import { Cookie, Settings2, ShieldCheck } from 'lucide-react';
import {
  acceptAllCookies,
  COOKIE_CATEGORIES,
  getCookieConsent,
  rejectNonEssentialCookies,
  saveCookieConsent,
  shouldShowCookieBanner,
} from '../utils/cookieConsent';
import './CookieConsentBanner.css';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(getCookieConsent().categories);

  const refresh = useCallback(() => {
    setVisible(shouldShowCookieBanner());
    setPrefs(getCookieConsent().categories);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('petfood:cookie-consent', onUpdate);
    return () => window.removeEventListener('petfood:cookie-consent', onUpdate);
  }, [refresh]);

  const emitUpdate = () => {
    window.dispatchEvent(new Event('petfood:cookie-consent'));
    setVisible(false);
    setShowPrefs(false);
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    emitUpdate();
  };

  const handleReject = () => {
    rejectNonEssentialCookies();
    emitUpdate();
  };

  const handleSavePrefs = () => {
    saveCookieConsent(prefs);
    emitUpdate();
  };

  const togglePref = (id) => {
    if (COOKIE_CATEGORIES[id]?.required) return;
    setPrefs((p) => ({ ...p, [id]: !p[id] }));
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent__panel">
        <div className="cookie-consent__header">
          <Cookie size={22} aria-hidden />
          <div>
            <h2 id="cookie-consent-title">Cookies & confidentialité</h2>
            <p>
              PetfoodTN utilise des cookies essentiels et, avec votre accord, des cookies de préférences,
              analytique et marketing. Consultez notre{' '}
              <a href="/compliance" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.
            </p>
          </div>
        </div>

        {showPrefs && (
          <div className="cookie-consent__prefs">
            {Object.values(COOKIE_CATEGORIES).map((cat) => (
              <label key={cat.id} className="cookie-consent__pref-row">
                <input
                  type="checkbox"
                  checked={!!prefs[cat.id]}
                  disabled={cat.required}
                  onChange={() => togglePref(cat.id)}
                />
                <span>
                  <strong>{cat.label}</strong>
                  <small>{cat.description}</small>
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="cookie-consent__actions">
          <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={handleReject}>
            Refuser non essentiels
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--outline"
            onClick={() => setShowPrefs((v) => !v)}
          >
            <Settings2 size={16} aria-hidden />
            {showPrefs ? 'Masquer' : 'Personnaliser'}
          </button>
          <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={handleAcceptAll}>
            <ShieldCheck size={16} aria-hidden />
            Tout accepter
          </button>
          {showPrefs && (
            <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={handleSavePrefs}>
              Enregistrer mes choix
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
