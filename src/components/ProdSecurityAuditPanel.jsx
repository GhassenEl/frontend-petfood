import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Download,
  Lock,
  History,
  Shield,
} from 'lucide-react';
import { runProdSecurityAudit, summarizeProdAudit, AUDIT_SEVERITY } from '../utils/prodSecurityAudit';
import { canAccessAuditFeatures } from '../utils/auditSecurityPolicy';
import {
  recordProdAuditRun,
  verifyAuditChain,
  getProdAuditHistory,
  exportProdAuditReport,
} from '../utils/securityAuditTrail';
import { fetchAdminActivityLogs } from '../services/adminService';

const LEVEL_STYLE = {
  [AUDIT_SEVERITY.pass]: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', Icon: CheckCircle2 },
  [AUDIT_SEVERITY.warn]: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', Icon: AlertTriangle },
  [AUDIT_SEVERITY.fail]: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', Icon: XCircle },
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const ProdSecurityAuditPanel = ({ user, id = 'prod-audit', recordRun = true }) => {
  const [context, setContext] = useState({
    chainOk: true,
    chainMessage: 'Vérification en cours…',
    activityLogSource: 'unknown',
    recentAuditRun: false,
  });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(() => getProdAuditHistory());
  const [auditRecorded, setAuditRecorded] = useState(false);

  const allowed = canAccessAuditFeatures(user);

  const loadContext = useCallback(async (andRecord = false) => {
    setLoading(true);
    const chain = await verifyAuditChain();
    const trail = getProdAuditHistory();
    const recent = trail.some((e) => Date.now() - new Date(e.at).getTime() < THIRTY_DAYS_MS);

    let activityLogSource = 'unknown';
    try {
      const { source, demo } = await fetchAdminActivityLogs({ limit: 1 });
      activityLogSource = demo ? 'local' : source || 'server';
    } catch {
      activityLogSource = 'local';
    }

    setContext({
      chainOk: chain.ok,
      chainMessage: chain.message,
      activityLogSource,
      recentAuditRun: recent,
    });
    setHistory(trail);
    setLoading(false);

    if (andRecord && user) {
      const nextChecks = runProdSecurityAudit(user, {
        chainOk: chain.ok,
        chainMessage: chain.message,
        activityLogSource,
        recentAuditRun: recent,
      });
      const nextSummary = summarizeProdAudit(nextChecks);
      await recordProdAuditRun(user, nextSummary, nextChecks);
      setHistory(getProdAuditHistory());
      setAuditRecorded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    loadContext(recordRun && !auditRecorded);
  }, [allowed, recordRun, auditRecorded, loadContext]);

  const checks = useMemo(() => runProdSecurityAudit(user, context), [user, context]);
  const summary = useMemo(() => summarizeProdAudit(checks), [checks]);

  const handleRerun = () => {
    setAuditRecorded(false);
    loadContext(true);
  };

  if (!allowed) {
    return (
      <section id={id} className="ais-panel-wrap" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: 16,
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Lock size={22} color="#64748b" aria-hidden />
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>Audit production verrouillé</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Réservé aux administrateurs avec 2FA active.{' '}
              <Link to="/admin/account-security#2fa" style={{ color: '#7c3aed', fontWeight: 700 }}>
                Activer la 2FA →
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="ais-panel-wrap" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={22} color="#2563eb" aria-hidden />
            Audit sécurité production
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: 999 }}>
              <Shield size={10} style={{ verticalAlign: 'middle' }} /> Protégé
            </span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Checklist TLS, JWT, 2FA, API, intégrité des journaux — exécution journalisée et chaînée.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div className="adm-hub-kpi"><strong>{loading ? '…' : `${summary.score}%`}</strong><span>Score</span></div>
          <div className="adm-hub-kpi"><strong>{summary.passed}</strong><span>OK</span></div>
          <div className="adm-hub-kpi"><strong>{summary.warnings}</strong><span>Avertissements</span></div>
          <div className="adm-hub-kpi"><strong>{summary.failed}</strong><span>Échecs</span></div>
          <button
            type="button"
            onClick={() => exportProdAuditReport(checks, summary, user)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <Download size={14} aria-hidden />
            Exporter JSON
          </button>
          <button
            type="button"
            onClick={handleRerun}
            disabled={loading}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Relancer
          </button>
        </div>
      </div>

      {!context.chainOk && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
          <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {context.chainMessage}
        </div>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {checks.map((check) => {
          const style = LEVEL_STYLE[check.level] || LEVEL_STYLE[AUDIT_SEVERITY.warn];
          const { Icon } = style;
          return (
            <li
              key={check.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 12,
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
            >
              <Icon size={18} color={style.color} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>{check.label}</strong>
                <span style={{ fontSize: 13, color: '#64748b' }}>{check.detail}</span>
              </div>
            </li>
          );
        })}
      </ul>

      {history.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <History size={16} aria-hidden />
            Historique des audits ({history.length})
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
            {history.slice(0, 5).map((entry) => (
              <li
                key={entry.hash}
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span>{new Date(entry.at).toLocaleString('fr-FR')}</span>
                <span>
                  Score <strong>{entry.score}%</strong> — {entry.failed} échec(s)
                </span>
                <code style={{ fontSize: 10, color: '#94a3b8' }}>{entry.hash.slice(0, 12)}…</code>
              </li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0', fontSize: 12 }}>
            <Link to="/admin/activity-logs?module=audit" style={{ color: '#2563eb', fontWeight: 700 }}>
              Voir les entrées dans le journal →
            </Link>
          </p>
        </div>
      )}
    </section>
  );
};

export default ProdSecurityAuditPanel;
