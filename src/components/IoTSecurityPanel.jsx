import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Key, Lock } from 'lucide-react';
import IoTPrivacyConsentPanel from './IoTPrivacyConsentPanel';
import { IOT_SECURITY_PILLARS } from '../config/iotSecurityCatalog';
import {
  fetchIoTSecurityPack,
  rotateDeviceKey,
  revokeIoTDevice,
} from '../services/iotSecurityService';
import {
  getIoTSecurityPreferences,
  setMqttTlsEnabled,
  setEncryptTelemetry,
  setBlockUnknownDevices,
  setLocalProcessingOnly,
  setTwoFactorPairing,
} from '../utils/privacyPreferences';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './IoTSecurityPanel.css';

const scoreColor = (s) => (s >= 80 ? '#34d399' : s >= 60 ? '#fbbf24' : '#f87171');

const IoTSecurityPanel = () => {
  const [pack, setPack] = useState(null);
  const [secPrefs, setSecPrefs] = useState(getIoTSecurityPreferences);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchIoTSecurityPack());
      setSecPrefs(getIoTSecurityPreferences());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load);

  const onPref = (setter) => (e) => {
    setSecPrefs(setter(e.target.checked));
    load();
  };

  const handleRotate = async (deviceId) => {
    setBusy(deviceId);
    setFeedback(null);
    try {
      const res = await rotateDeviceKey(deviceId);
      setFeedback({ type: 'ok', text: `Clé renouvelée — ${res.keyPreview || 'nouvelle clé générée'}` });
      await load();
    } catch {
      setFeedback({ type: 'error', text: 'Échec de la rotation de clé.' });
    } finally {
      setBusy(null);
    }
  };

  const handleRevoke = async (deviceId, name) => {
    if (!window.confirm(`Révoquer l'accès de « ${name} » ? L'appareil sera déconnecté.`)) return;
    setBusy(`revoke-${deviceId}`);
    try {
      await revokeIoTDevice(deviceId);
      setFeedback({ type: 'ok', text: `Appareil « ${name} » révoqué.` });
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loading || !pack) {
    return <p className="iot-muted">Chargement sécurité IoT…</p>;
  }

  const activeProfiles = pack.deviceProfiles.filter((p) => !p.revoked);

  return (
    <div className="iot-sec-panel">
      <div className="iot-sec-hero">
        <div>
          <h3><Shield size={20} /> Sécurité IoT PetfoodTN</h3>
          <p>
            Authentification appareils, MQTT TLS, intégrité firmware, confidentialité caméra
            et journal d&apos;audit — aligné ISO 27001.
          </p>
          <Link to="/politique-confidentialite" style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 700 }}>
            Politique confidentialité &amp; IoT →
          </Link>
        </div>
        <div className="iot-sec-score-ring">
          <strong style={{ color: scoreColor(pack.overallScore) }}>{pack.overallScore}</strong>
          <span>Score sécurité</span>
        </div>
      </div>

      {feedback && (
        <div className={`iot-sec-feedback iot-sec-feedback--${feedback.type === 'ok' ? 'ok' : ''}`}>
          {feedback.text}
        </div>
      )}

      <div className="iot-sec-pillars">
        {IOT_SECURITY_PILLARS.map((p) => (
          <div key={p.id} className="iot-sec-pillar">
            <span>{p.icon}</span>
            <strong>{p.label}</strong>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="iot-sec-threats">
        <h4><AlertTriangle size={16} color="#dc2626" /> Menaces détectées ({pack.threats.length})</h4>
        {pack.threats.length === 0 ? (
          <p className="iot-sec-empty">Aucune menace active — parc IoT conforme.</p>
        ) : (
          pack.threats.map((t) => (
            <div key={t.id} className={`iot-sec-threat iot-sec-threat--${t.severity}`}>
              <div>
                <strong>{t.deviceName}</strong>
                <small> — {t.message}</small>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="iot-sec-devices">
        <h4><Key size={16} /> Sécurité par appareil</h4>
        <table className="iot-sec-table">
          <thead>
            <tr>
              <th>Appareil</th>
              <th>Clé</th>
              <th>TLS</th>
              <th>Firmware</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeProfiles.map((p) => (
              <tr key={p.deviceId}>
                <td><strong>{p.deviceName}</strong></td>
                <td>
                  <code style={{ fontSize: 11 }}>{p.deviceKeyMasked}</code>
                  <br />
                  <small style={{ color: '#94a3b8' }}>{p.keyAgeDays}j</small>
                </td>
                <td>
                  <span className={`iot-sec-badge${p.tlsEnabled ? ' iot-sec-badge--ok' : ' iot-sec-badge--bad'}`}>
                    {p.tlsEnabled ? 'TLS' : 'Non chiffré'}
                  </span>
                </td>
                <td>
                  <span className={`iot-sec-badge${p.firmwareSigned ? ' iot-sec-badge--ok' : ' iot-sec-badge--warn'}`}>
                    {p.firmwareSigned ? 'Signé' : 'Non vérifié'}
                  </span>
                </td>
                <td>
                  <strong style={{ color: scoreColor(p.score) }}>{p.score}</strong>
                </td>
                <td>
                  <div className="iot-sec-actions">
                    <button
                      type="button"
                      className="iot-sec-btn"
                      disabled={busy === p.deviceId}
                      onClick={() => handleRotate(p.deviceId)}
                    >
                      {busy === p.deviceId ? '…' : 'Rotation clé'}
                    </button>
                    <button
                      type="button"
                      className="iot-sec-btn iot-sec-btn--danger"
                      disabled={busy === `revoke-${p.deviceId}`}
                      onClick={() => handleRevoke(p.deviceId, p.deviceName)}
                    >
                      Révoquer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="iot-sec-grid2">
        <div className="iot-sec-checklist">
          <h4><Lock size={16} /> Checklist conformité ({pack.pillarsPassed}/{pack.pillarsTotal})</h4>
          {pack.checklist.map((c) => (
            <div key={c.id} className="iot-sec-check">
              <span className="iot-sec-check__icon">{c.passed ? '✅' : c.critical ? '❌' : '⚠️'}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        <div className="iot-sec-prefs">
          <h4>Paramètres de sécurité</h4>
          <p>Chiffrement, pairing et filtrage des appareils inconnus.</p>
          <label className="iot-sec-pref-row">
            <input type="checkbox" checked={secPrefs.mqttTlsEnabled} onChange={onPref(setMqttTlsEnabled)} />
            <span>
              <strong>MQTT over TLS (port 8883)</strong>
              <small>Chiffre toutes les communications broker ↔ appareils</small>
            </span>
          </label>
          <label className="iot-sec-pref-row">
            <input type="checkbox" checked={secPrefs.encryptTelemetry} onChange={onPref(setEncryptTelemetry)} />
            <span>
              <strong>Chiffrer la télémétrie au repos</strong>
              <small>Données capteurs stockées avec AES-256</small>
            </span>
          </label>
          <label className="iot-sec-pref-row">
            <input type="checkbox" checked={secPrefs.blockUnknownDevices} onChange={onPref(setBlockUnknownDevices)} />
            <span>
              <strong>Bloquer appareils non enregistrés</strong>
              <small>Rejette les tentatives de pairing inconnues ({pack.intrusionAttempts} bloquées)</small>
            </span>
          </label>
          <label className="iot-sec-pref-row">
            <input type="checkbox" checked={secPrefs.localProcessingOnly} onChange={onPref(setLocalProcessingOnly)} />
            <span>
              <strong>Traitement IA local (ESP32)</strong>
              <small>Analyse qualité sur l&apos;appareil — images non envoyées au cloud</small>
            </span>
          </label>
          <label className="iot-sec-pref-row">
            <input type="checkbox" checked={secPrefs.twoFactorPairing} onChange={onPref(setTwoFactorPairing)} />
            <span>
              <strong>Pairing 2FA</strong>
              <small>Code de confirmation mobile requis pour nouveaux appareils</small>
            </span>
          </label>
        </div>
      </div>

      <IoTPrivacyConsentPanel />

      <div className="iot-sec-audit">
        <h4>Journal d&apos;audit sécurité</h4>
        {pack.auditLog.map((e) => (
          <div
            key={e.id}
            className={`iot-sec-audit-item${e.level === 'warning' ? ' iot-sec-audit-item--warning' : ''}`}
          >
            <time>{new Date(e.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
            <div>
              <strong>{e.device}</strong> — {e.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IoTSecurityPanel;
