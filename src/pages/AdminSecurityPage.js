import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, Radar } from 'lucide-react';
import SecurityThreatPanel from '../components/SecurityThreatPanel';
import IntrusionDetectionPanel from '../components/IntrusionDetectionPanel';
import { fetchSecurityStatus } from '../services/securityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminPages.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Shield },
  { id: 'ids', label: 'Détection d\'intrusions', icon: Radar },
  { id: 'antivirus', label: 'Anti-virus / menaces', icon: ShieldAlert },
];

const AdminSecurityPage = () => {
  const [tab, setTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSecurityStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <header className="adm-hero">
        <h1>
          <Shield size={24} />
          Centre de sécurité
        </h1>
        <p>
          Détection d&apos;intrusions (IDS), anti-virus applicatif et journal des menaces —{' '}
          <Link to="/admin/intelligent-security" style={{ color: '#7c3aed', fontWeight: 700 }}>
            Sécurité intelligente (posture, sessions, fraude, JWT) →
          </Link>
          {' · '}
          <Link to="/admin/database-security" style={{ color: '#2563eb', fontWeight: 700 }}>
            Sécurité base de données →
          </Link>
          {' · '}
          <Link to="/admin/system" style={{ color: '#0ea5e9' }}>Configuration globale →</Link>
        </p>
      </header>

      {!loading && status && (
        <div className="adm-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 16 }}>
          <div className="adm-card" style={{ padding: 14 }}>
            <strong>Anti-virus</strong>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
              {status.protection?.antivirus !== false ? 'Actif' : 'Inactif'} — {status.signatureCount ?? 0} signatures
            </p>
          </div>
          <div className="adm-card" style={{ padding: 14 }}>
            <strong>IDS</strong>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
              {status.ids?.enabled !== false ? 'Actif' : 'Inactif'} — {status.ids?.eventsLast24h ?? 0} alertes/24h
            </p>
          </div>
          <div className="adm-card" style={{ padding: 14 }}>
            <strong>Menaces contenu</strong>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status.totalThreats ?? 0} enregistrées</p>
          </div>
        </div>
      )}

      <div className="adm-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`adm-tab ${tab === id ? 'adm-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="adm-card" style={{ marginTop: 16 }}>
          <h2>Protection en place</h2>
          <ul style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#475569', paddingLeft: 20 }}>
            <li><strong>IDS</strong> — scans automatisés, path traversal, injections SQL/XSS, brute-force login, débit anormal</li>
            <li><strong>Anti-virus</strong> — signatures EICAR, scripts, webshells, fichiers exécutables, URLs de phishing</li>
            <li><strong>Scan corps API</strong> — analyse automatique des POST/PUT/PATCH entrants</li>
            <li><strong>Rate limiting</strong> — limitation des tentatives login / inscription</li>
            <li><strong>Base PostgreSQL</strong> — TLS, Prisma ORM, chiffrement au repos, sauvegardes chiffrées —{' '}
              <Link to="/admin/database-security">vue détaillée →</Link>
            </li>
          </ul>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 12 }}>
            Variables serveur : <code>IDS_ENABLED</code>, <code>BLOCK_INTRUSIONS</code>, <code>BLOCK_THREATS</code>
          </p>
        </div>
      )}

      {tab === 'ids' && (
        <div className="adm-card" style={{ marginTop: 16 }}>
          <IntrusionDetectionPanel />
        </div>
      )}

      {tab === 'antivirus' && (
        <div className="adm-card" style={{ marginTop: 16 }}>
          <SecurityThreatPanel />
        </div>
      )}
    </div>
  );
};

export default AdminSecurityPage;
