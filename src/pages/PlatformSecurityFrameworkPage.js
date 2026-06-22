import React from 'react';
import { Link } from 'react-router-dom';
import {
  PLATFORM_SECURITY_PILLARS,
  SECURITY_STATUS,
  countSecurityPillarStats,
  RBAC_ROLE_MATRIX,
  AUDIT_TABLE_DEMO,
} from '../config/platformSecurityFramework';
import '../pages/AdminIntelligentSecurity.css';
import '../pages/AdminPages.css';

const StatusBadge = ({ status }) => {
  const s = SECURITY_STATUS[status] || SECURITY_STATUS.planned;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      color: s.color,
      background: s.bg,
    }}>
      {s.label}
    </span>
  );
};

const PlatformSecurityFrameworkPage = () => {
  const stats = countSecurityPillarStats();

  return (
    <div className="ais-page" style={{ maxWidth: 1140 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 900 }}>
          🛡️ Cadre de sécurité PetfoodTN
        </h1>
        <p className="ais-lead">
          Les 12 piliers du cahier des charges — authentification, RBAC, attaques web, paiement,
          chiffrement, IA fraude, audit, API, cloud, surveillance, blockchain et IA confidentielle.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <div className="adm-hub-kpi"><strong>{stats.pillars}</strong><span>Piliers</span></div>
          <div className="adm-hub-kpi"><strong>{stats.implemented}</strong><span>Contrôles actifs</span></div>
          <div className="adm-hub-kpi"><strong>{stats.partial}</strong><span>En cours</span></div>
          <div className="adm-hub-kpi"><strong>{stats.total}</strong><span>Exigences suivies</span></div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        {PLATFORM_SECURITY_PILLARS.map((pillar) => (
          <section key={pillar.id} className="ais-panel-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>{pillar.icon}</span>
                  {pillar.order}. {pillar.title}
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>{pillar.summary}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={pillar.status} />
                {pillar.route && (
                  <Link to={pillar.route} style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                    Hub →
                  </Link>
                )}
              </div>
            </div>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {pillar.items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14 }}>{item.label}</strong>
                    {item.note && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{item.note}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={item.status} />
                    {item.route && (
                      <Link to={item.route} style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', whiteSpace: 'nowrap' }}>
                        Voir
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {pillar.id === 'rbac' && (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>Matrice RBAC</h3>
                <table className="adm-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Rôle</th>
                      <th>Périmètre</th>
                      <th>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RBAC_ROLE_MATRIX.map((row) => (
                      <tr key={row.role}>
                        <td><strong>{row.label}</strong><br /><code style={{ fontSize: 11 }}>{row.role}</code></td>
                        <td>{row.scope}</td>
                        <td>{row.permissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pillar.id === 'audit' && (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>Exemple table Audit</h3>
                <table className="adm-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Utilisateur</th>
                      <th>Date</th>
                      <th>Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_TABLE_DEMO.map((row, i) => (
                      <tr key={i}>
                        <td><code>{row.action}</code></td>
                        <td>{row.user}</td>
                        <td>{new Date(row.date).toLocaleString('fr-FR')}</td>
                        <td>{row.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ margin: '10px 0 0', fontSize: 12 }}>
                  <Link to="/admin/activity-logs" style={{ color: '#2563eb', fontWeight: 700 }}>Journal complet →</Link>
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
        Stack : React · Node/Express · Prisma/PostgreSQL · Stripe/Konnect · Docker
        {' · '}
        <Link to="/enterprise-features" style={{ color: '#0f766e' }}>Fonctionnalités entreprise</Link>
        {' · '}
        <Link to="/compliance" style={{ color: '#0f766e' }}>Conformité ISO</Link>
      </p>
    </div>
  );
};

export default PlatformSecurityFrameworkPage;
