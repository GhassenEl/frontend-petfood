import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Stethoscope, Cpu, ArrowRight } from 'lucide-react';

const SEV_COLOR = {
  high: '#dc2626',
  critical: '#dc2626',
  medium: '#d97706',
  low: '#2563eb',
};

const DomainCard = ({ icon: Icon, title, color, linkTo, linkLabel, children }) => (
  <article className="bi-domain-card" style={{ borderTopColor: color }}>
    <header className="bi-domain-card__head">
      <Icon size={18} color={color} aria-hidden />
      <h3>{title}</h3>
      {linkTo && (
        <Link to={linkTo} className="bi-domain-card__link">
          {linkLabel} <ArrowRight size={12} aria-hidden />
        </Link>
      )}
    </header>
    {children}
  </article>
);

const KpiMini = ({ label, value }) => (
  <div className="bi-domain-kpi">
    <span>{label}</span>
    <strong>{value ?? '—'}</strong>
  </div>
);

const BiPlatformSnapshotPanel = ({ snapshot, loading, compact = false }) => {
  if (loading && !snapshot) {
    return <p className="bi-loading">Chargement vet · IoT · audience…</p>;
  }
  if (!snapshot) {
    return <p className="bi-empty">Données plateforme indisponibles.</p>;
  }

  const { audience, vet, iot } = snapshot;

  return (
    <div className={`bi-domain-grid${compact ? ' bi-domain-grid--compact' : ''}`}>
      <DomainCard
        icon={Radio}
        title="Audience live"
        color="#059669"
        linkTo="/admin/live-audience"
        linkLabel="Détail"
      >
        <div className="bi-domain-kpi-row">
          <KpiMini label="En ligne" value={audience.onlineTotal} />
          <KpiMini label="Visiteurs" value={audience.visitors} />
          <KpiMini label="Clients" value={audience.clients} />
          <KpiMini label="Vétos connectés" value={audience.vets} />
        </div>
        {!compact && audience.sessions?.length > 0 && (
          <ul className="bi-domain-list">
            {audience.sessions.map((s) => (
              <li key={s.sessionId || `${s.role}-${s.path}`}>
                <span className="bi-domain-pill">{s.role || '—'}</span>
                <span>{s.region || s.city || '—'}</span>
                <span className="bi-domain-muted">{s.path || '/'}</span>
              </li>
            ))}
          </ul>
        )}
      </DomainCard>

      <DomainCard
        icon={Stethoscope}
        title="Clinique vétérinaire"
        color="#7c3aed"
        linkTo="/admin/veterinary"
        linkLabel="Dossiers"
      >
        <div className="bi-domain-kpi-row">
          <KpiMini label="Fiches actives" value={vet.activeCases} />
          <KpiMini label="RDV à venir" value={vet.upcomingAppointments} />
          <KpiMini label="Suivis ≤ 14 j" value={vet.followUpsDue} />
          <KpiMini label="Partenaires vet" value={vet.vetPartners} />
        </div>
        {!compact && vet.recentRecords?.length > 0 && (
          <ul className="bi-domain-list">
            {vet.recentRecords.map((r) => (
              <li key={r._id || r.id}>
                <strong>{r.petName || '—'}</strong>
                <span className="bi-domain-muted">{r.diagnosis || r.treatment || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </DomainCard>

      <DomainCard
        icon={Cpu}
        title="IoT & capteurs"
        color="#0d9488"
        linkTo="/admin/iot-anomalies"
        linkLabel="Anomalies"
      >
        <div className="bi-domain-kpi-row">
          <KpiMini label="Appareils" value={`${iot.devicesOnline}/${iot.devicesTotal}`} />
          <KpiMini label="Score santé" value={iot.healthScore != null ? `${iot.healthScore}%` : '—'} />
          <KpiMini label="Alertes" value={iot.alerts} />
          <KpiMini label="Critiques" value={iot.criticalAlerts} />
        </div>
        {!compact && iot.topAnomalies?.length > 0 && (
          <ul className="bi-domain-list">
            {iot.topAnomalies.map((a) => (
              <li key={a.id}>
                <span style={{ color: SEV_COLOR[a.severity] || '#64748b', fontWeight: 700, fontSize: 11 }}>
                  {a.severity?.toUpperCase()}
                </span>
                <span>{a.deviceName || a.type}</span>
                <span className="bi-domain-muted">{a.message}</span>
              </li>
            ))}
          </ul>
        )}
      </DomainCard>
    </div>
  );
};

export default BiPlatformSnapshotPanel;
