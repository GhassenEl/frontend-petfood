import React, { useCallback, useEffect, useState } from 'react';
import { Camera, Stethoscope, ShieldCheck } from 'lucide-react';
import { isCategoryAllowed } from '../utils/cookieConsent';
import {
  getIoTPrivacyPreferences,
  setCameraCaptureEnabled,
  setVetAlertSharingEnabled,
} from '../utils/privacyPreferences';
import './IoTPrivacyConsentPanel.css';

const IoTPrivacyConsentPanel = () => {
  const [prefs, setPrefs] = useState(getIoTPrivacyPreferences);
  const preferencesAllowed = isCategoryAllowed('preferences');

  const refresh = useCallback(() => setPrefs(getIoTPrivacyPreferences()), []);

  useEffect(() => {
    window.addEventListener('petfood:cookie-consent', refresh);
    window.addEventListener('petfood:privacy-preferences', refresh);
    return () => {
      window.removeEventListener('petfood:cookie-consent', refresh);
      window.removeEventListener('petfood:privacy-preferences', refresh);
    };
  }, [refresh]);

  const onCamera = (e) => {
    setPrefs(setCameraCaptureEnabled(e.target.checked));
  };

  const onVet = (e) => {
    setPrefs(setVetAlertSharingEnabled(e.target.checked));
  };

  if (!preferencesAllowed) {
    return (
      <section className="iot-privacy-panel iot-privacy-panel--blocked" role="region" aria-labelledby="iot-privacy-title">
        <h3 id="iot-privacy-title"><ShieldCheck size={18} /> Confidentialité IoT</h3>
        <p>
          Activez les cookies <strong>Préférences</strong> dans la bannière cookies pour configurer la caméra ESP32-CAM
          et le partage vétérinaire.
        </p>
      </section>
    );
  }

  return (
    <section className="iot-privacy-panel" role="region" aria-labelledby="iot-privacy-title">
      <h3 id="iot-privacy-title"><ShieldCheck size={18} /> Vos choix — caméra &amp; partage</h3>
      <p className="iot-privacy-panel__hint">
        Aucune capture ni alerte vétérinaire sans votre accord explicite ci-dessous.
      </p>
      <label className="iot-privacy-panel__row">
        <input
          type="checkbox"
          checked={prefs.cameraCaptureEnabled}
          onChange={onCamera}
        />
        <span>
          <Camera size={16} aria-hidden />
          <strong>Autoriser la capture ESP32-CAM</strong>
          <small>Images périodiques du bac à croquettes pour analyse qualité (30 min).</small>
        </span>
      </label>
      <label className="iot-privacy-panel__row">
        <input
          type="checkbox"
          checked={prefs.vetAlertSharingEnabled}
          onChange={onVet}
        />
        <span>
          <Stethoscope size={16} aria-hidden />
          <strong>Partager les alertes IoT avec mon vétérinaire</strong>
          <small>En cas de qualité alimentaire dégradée — désactivé par défaut.</small>
        </span>
      </label>
    </section>
  );
};

export default IoTPrivacyConsentPanel;
