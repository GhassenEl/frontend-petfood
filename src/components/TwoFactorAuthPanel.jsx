import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Key, Copy, CheckCircle2 } from 'lucide-react';

const TwoFactorAuthPanel = ({ enabled: initialEnabled = false }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState('idle');
  const [code, setCode] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  const secret = 'PETF4TN-2FA-DEMO-7XK9';
  const backupCodes = ['A8F2-K9M1', 'B3D7-P4Q6', 'C1E5-R8T2', 'D6G9-S3U7'];

  const toggle = () => {
    if (enabled) {
      setEnabled(false);
      setStep('idle');
      return;
    }
    setStep('setup');
  };

  const verify = () => {
    if (code.length >= 6) {
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

  return (
    <div id="2fa" className="ais-card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="#7c3aed" />
            Authentification à deux facteurs (2FA)
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            TOTP compatible Google Authenticator / Authy — couche supplémentaire après mot de passe BCrypt.
          </p>
        </div>
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
      </div>

      {enabled && step === 'active' && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: '#ecfdf5', color: '#065f46', fontSize: 13 }}>
          <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          2FA active — connexion protégée par code à 6 chiffres.
        </div>
      )}

      {step === 'setup' && !enabled && (
        <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
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
          <div>
            <strong style={{ fontSize: 13 }}>2. Entrez le code TOTP</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
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
        <li>2FA obligatoire recommandée pour admin et vétérinaires</li>
      </ul>
    </div>
  );
};

export default TwoFactorAuthPanel;
