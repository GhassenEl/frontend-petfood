import React, { useState } from 'react';
import { Key, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

const CATEGORY_LABELS = {
  database: 'Base de données',
  auth: 'Authentification',
  payment: 'Paiement',
  mail: 'Email',
  cicd: 'CI/CD',
};

const DevOpsEnvSecretsPanel = ({ items = [] }) => {
  const [copied, setCopied] = useState('');

  const copyCmd = (cmd) => {
    navigator.clipboard?.writeText(cmd).then(() => {
      setCopied(cmd);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <>
      <div className="devops-secrets-grid">
        {items.map((item) => (
          <article key={item.key} className={`devops-secret${item.configured ? '' : ' devops-secret--missing'}`}>
            <div className="devops-secret__head">
              <Key size={16} aria-hidden />
              <strong>{item.label}</strong>
              {item.configured ? (
                <CheckCircle2 size={16} color="#059669" aria-label="Configuré" />
              ) : (
                <AlertTriangle size={16} color="#d97706" aria-label="À configurer" />
              )}
            </div>
            <code>{item.key}</code>
            <p>
              {CATEGORY_LABELS[item.category] || item.category}
              {item.rotationDays ? ` · rotation ${item.rotationDays}j` : ''}
            </p>
          </article>
        ))}
      </div>
      <div className="devops-card devops-card--code" style={{ marginTop: 16 }}>
        <h3>Secrets Docker &amp; production</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px' }}>
          Ne jamais committer les <code>.env</code> — utiliser Render env groups, GitHub Secrets ou fichiers Docker secrets.
        </p>
        <pre>{`# Exemple docker-compose (secrets)
secrets:
  db_password:
    file: ./secrets/db_password.txt

# Render : Environment → Secret Files
# GitHub : Settings → Secrets → Actions`}</pre>
      </div>
      <p className="devops-section__hint" style={{ marginTop: 12 }}>
        Audit : <code>npm run devops:prod:audit</code>
        {' '}
        <button type="button" className="devops-copy-inline" onClick={() => copyCmd('npm run devops:prod:audit')}>
          <Copy size={12} /> {copied === 'npm run devops:prod:audit' ? 'Copié' : 'Copier'}
        </button>
      </p>
    </>
  );
};

export default DevOpsEnvSecretsPanel;
