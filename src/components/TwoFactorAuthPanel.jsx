import React, { useEffect, useState } from 'react';
import { ShieldCheck, Smartphone, Key, Copy, CheckCircle2, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import {
  getUserStorageKey,
  is2FAEnabled,
  set2FAEnabled,
  get2FARecord,
} from '../utils/twoFactorPolicy';

const CHANNELS = [
  { id: 'totp', label: 'Application (TOTP)', icon: Smartphone, detail: 'Google Authenticator, Authy' },
  { id: 'email', label: 'Email', icon: Mail, detail: 'Code à 6 chiffres par email' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, detail: 'Code par SMS au numéro enregistré' },
];

const TwoFactorAuthPanel = ({ user, mandatory = false }) => {
  const userId = getUserStorageKey(user);
  const [enabled, setEnabled] = useState(() => is2FAEnabled(userId));
  const [channel, setChannel] = useState(() => get2FARecord(userId)?.channel || 'totp');
  const [step, setStep] = useState(() => (is2FAEnabled(userId) ? 'active' : 'idle'));
  const [code, setCode] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  const secret = 'PETF4TN-2FA-DEMO-7XK9';
  const backupCodes = ['A8F2-K9M1', 'B3D7-P4Q6', 'C1E5-R8T2', 'D6G9-S3U7'];

  useEffect(() => {
    if (!userId) return;
    const on = is2FAEnabled(userId);
    setEnabled(on);
    setChannel(get2FARecord(userId)?.channel || 'totp');
    setStep(on ? 'active' : 'idle');
  }, [userId]);

  const toggle = () => {
    if (enabled) {
      if (mandatory) return;
      set2FAEnabled(userId, false);
      setEnabled(false);
      setStep('idle');
      return;
    }
    setStep('setup');
  };

  const verify = () => {
    if (code.length >= 6 && userId) {
      set2FAEnabled(userId, true, { channel });
      setEnabled(true);
      setStep('active');
      setCode('');
    }
  };

  const copySecret = () => {
    navigator.clipboard?.writeText(secret).then(() => {
      setCopyMsg('Secret copié');
      setTimeout(() => setCopyMsg(''), 2000);
    });
  };

  const activeChannel = CHANNELS.find((c) => c.id === channel) || CHANNELS[0];
  const canDisable = enabled && !mandatory;

  return (
    <div id="2fa" className="ais-card" style={{ marginTop: 16 }}>
      {mandatory && !enabled && (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 10,
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#9a3412',
            fontSize: 13,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
          <span>
            <strong>2FA obligatoire</strong> pour votre rôle. Activez-la ci-dessous pour accéder au reste de la plateforme.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="#7c3aed" />
            Authentification à deux facteurs (2FA)
            {mandatory && (
              <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309', background: '#fffbeb', padding: '2px 8px', borderRadius: 999 }}>
                Obligatoire
              </span>
            )}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            TOTP, email ou SMS — couche supplémentaire après mot de passe BCrypt.
          </p>
        </div>
        {(canDisable || !enabled) && (
          <button
            type="button"
            onClick={toggle}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer',
              background: enabled ? '#fef2f2' : '#ecfdf5', color: enabled ? '#b91c1c' : '#047857',
            }}
          >
            {enabled ? 'Désactiver 2FA' : 'Activer 2FA'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {CHANNELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => !enabled && setChannel(id)}
            disabled={enabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${channel === id ? '#7c3aed' : '#e2e8f0'}`,
              background: channel === id ? '#f5f3ff' : '#fff',
              fontWeight: 600,
              fontSize: 12,
              cursor: enabled ? 'default' : 'pointer',
              opacity: enabled && channel !== id ? 0.6 : 1,
              color: channel === id ? '#5b21b6' : '#475569',
            }}
          >
            <Icon size={14} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {enabled && step === 'active' && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: '#ecfdf5', color: '#065f46', fontSize: 13 }}>
          <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          2FA active via {activeChannel.label} — connexion protégée.
          {mandatory && ' Accès plateforme débloqué.'}
        </div>
      )}

      {step === 'setup' && !enabled && (
        <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
          {channel === 'totp' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Smartphone size={32} color="#64748b" />
              <div>
                <strong style={{ fontSize: 13 }}>1. Scannez le QR ou saisissez le secret</strong>
                <p style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 12, color: '#0f766e' }}>
                  {secret}
                  <button type="button" onClick={copySecret} style={{ marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Copy size={12} />
                  </button>
                </p>
                {copyMsg && <span style={{ fontSize: 11, color: '#059669' }}>{copyMsg}</span>}
              </div>
            </div>
          )}
          {(channel === 'email' || channel === 'sms') && (
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Un code à 6 chiffres sera envoyé par {channel === 'email' ? 'email' : 'SMS'} à l&apos;adresse enregistrée sur votre compte.
            </p>
          )}
          <div>
            <strong style={{ fontSize: 13 }}>2. Entrez le code reçu</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                aria-label="Code 2FA"
                style={{ width: 120, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'monospace', letterSpacing: 4 }}
              />
              <button type="button" onClick={verify} disabled={code.length < 6} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Vérifier
              </button>
            </div>
          </div>
          <div>
            <strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={14} /> Codes de secours
            </strong>
            <p style={{ margin: '6px 0', fontSize: 12, color: '#64748b' }}>Conservez-les en lieu sûr (usage unique).</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {backupCodes.map((c) => (
                <code key={c} style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 11 }}>{c}</code>
              ))}
            </div>
          </div>
        </div>
      )}

      <ul style={{ margin: '14px 0 0', paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
        <li>BCrypt (cost 12) pour le hachage des mots de passe côté serveur</li>
        <li>JWT access + refresh avec rotation automatique</li>
        <li>2FA obligatoire pour admin, gestionnaire stock, vétérinaire, livreur et modérateur</li>
      </ul>
    </div>
  );
};

export default TwoFactorAuthPanel;
