import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProdSecurityAuditPanel from '../components/ProdSecurityAuditPanel';
import '../pages/AdminIntelligentSecurity.css';
import '../pages/AdminPages.css';

const AdminSecurityAuditPage = () => {
  const { user } = useAuth();

  return (
    <div className="ais-page" style={{ maxWidth: 1140 }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardCheck size={28} color="#2563eb" aria-hidden />
          Audit sécurité production
        </h1>
        <p className="ais-lead">
          Checklist pré-production, export rapport et traçabilité — accès réservé admin avec 2FA.
          {' '}
          <Link to="/admin/security-framework" style={{ color: '#7c3aed', fontWeight: 700 }}>
            Cadre 12 piliers →
          </Link>
          {' · '}
          <Link to="/admin/activity-logs?module=audit" style={{ color: '#2563eb', fontWeight: 700 }}>
            Journal d&apos;activité →
          </Link>
        </p>
      </header>

      <ProdSecurityAuditPanel user={user} id="prod-audit" recordRun />
    </div>
  );
};

export default AdminSecurityAuditPage;
