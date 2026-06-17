import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Stethoscope,
  FileText,
  Syringe,
  Bell,
  RefreshCw,
  ChevronRight,
  Clock,
  Users,
  Pill,
  FolderOpen,
  MessageSquare,
  Brain,
  PackageX,
} from 'lucide-react';
import api from '../utils/api';
import { fetchPharmacyCatalog } from '../services/vetMedicationService';
import { summarizePharmacyStock } from '../utils/vetPharmacyAlerts';
import { notifyNewPharmacyAlerts } from '../services/vetPharmacyNotificationService';
import { visitModeBadge } from '../constants/visitModes';
import VetDashboardCharts from '../components/VetDashboardCharts';
import VetDigitalTwinDashboardPanel from '../components/VetDigitalTwinDashboardPanel';
import VetClinicalAlertsBar from '../components/VetClinicalAlertsBar';
import RealtimeStatsCharts from '../components/RealtimeStatsCharts';
import { DEMO_VET_BI, withDemoDashboard, buildDemoVetWeekChart } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './VetPages.css';

const STATUS_LABELS = {
  scheduled: 'Planifié',
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const apptId = (a) => a?.id || a?._id;

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatDay = (date) =>
  new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

const VetDashboard = () => {
  const [data, setData] = useState(null);
  const [pharmacySummary, setPharmacySummary] = useState({ ruptures: 0, lowStock: 0, expiry: 0, vaccinesOverdue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [{ data: dash }, catalog, vaccinesRes] = await Promise.all([
        api.get('/vet/dashboard'),
        fetchPharmacyCatalog(),
        api.get('/vet/vaccinations').catch(() => ({ data: null })),
      ]);
      setData(withDemoDashboard(dash));
      const summary = summarizePharmacyStock(catalog);
      const vaccines = vaccinesRes.data || [];
      const now = new Date();
      const vaccinesOverdue = vaccines.filter((v) => v.nextDue && new Date(v.nextDue) < now).length;
      setPharmacySummary({ ...summary, vaccinesOverdue });
      notifyNewPharmacyAlerts(summary.alerts);
    } catch (error) {
      console.error('Vet dashboard error:', error);
      setData(withDemoDashboard(null));
      setPharmacySummary({ ruptures: 1, lowStock: 2, expiry: 1, vaccinesOverdue: 1, alerts: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = window.setInterval(() => fetchData(true), 12000);
    return () => window.clearInterval(id);
  }, [fetchData]);

  usePlatformRefresh(() => fetchData(true));

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>🩺</div>
        <p style={{ color: '#64748b' }}>Chargement du tableau de bord…</p>
      </div>
    );
  }

  const {
    todayAppointments = 0,
    pendingAppointments = 0,
    pendingContactRequests = 0,
    totalConsultations = 0,
    totalPrescriptions = 0,
    todayList = [],
    clinicalAlerts = [],
    unassignedCount = 0,
    clinicStats = {},
    clinic = {},
    upcomingAppointments = [],
    unassignedPreview = [],
    draftEntries = [],
    weekStats = {},
    weekChart = [],
    statusChart = [],
  } = data || {};

  const chartWeek = weekChart?.length ? weekChart : buildDemoVetWeekChart();
  const chartStatus = statusChart?.length ? statusChart : [
    { name: 'Planifié', value: pendingAppointments },
    { name: 'Terminé', value: weekStats.completedAppointments ?? 0 },
    { name: 'Consultations', value: weekStats.consultations ?? 0 },
  ];

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const primaryKpis = [
    {
      label: "RDV aujourd'hui",
      value: todayAppointments,
      icon: Calendar,
      color: '#0ea5e9',
      bg: '#e0f2fe',
      link: '/vet/calendar',
    },
    {
      label: 'En attente',
      value: pendingAppointments,
      icon: Clock,
      color: '#f59e0b',
      bg: '#fef3c7',
      link: '/vet/calendar',
    },
    {
      label: 'Non assignés',
      value: unassignedCount,
      icon: Users,
      color: '#ef4444',
      bg: '#fef2f2',
      link: '/vet/calendar',
      highlight: unassignedCount > 0,
    },
    {
      label: 'Demandes contact',
      value: pendingContactRequests,
      icon: MessageSquare,
      color: '#8b5cf6',
      bg: '#ede9fe',
      link: '/vet/contact-requests',
    },
    {
      label: 'Ruptures pharmacie',
      value: pharmacySummary.ruptures ?? data?.pharmacySummary?.ruptures ?? 0,
      icon: PackageX,
      color: '#dc2626',
      bg: '#fef2f2',
      link: '/vet/pharmacy',
      highlight: (pharmacySummary.ruptures ?? 0) > 0,
    },
  ];

  const secondaryKpis = [
    { label: 'Consultations (semaine)', value: weekStats.consultations ?? 0, icon: '🩺' },
    { label: 'Ordonnances (semaine)', value: weekStats.prescriptions ?? 0, icon: '💊' },
    { label: 'RDV terminés (semaine)', value: weekStats.completedAppointments ?? 0, icon: '✅' },
    { label: 'Dossiers actifs', value: clinicStats.dossiersCount ?? 0, icon: '📁' },
    { label: 'Entrées signées', value: clinicStats.signedEntriesCount ?? 0, icon: '✍️' },
    { label: 'Vaccins en retard', value: pharmacySummary.vaccinesOverdue ?? data?.pharmacySummary?.expiry ?? clinicStats.vaccinesDueSoon ?? 0, icon: '💉' },
    { label: 'Demandes contact', value: pendingContactRequests, icon: '📩' },
  ];

  const quickActions = [
    { to: '/vet/intelligence', icon: Brain, label: 'Intelligence IA', desc: 'Diagnostic, dossier, CR…' },
    { to: '/vet/calendar', icon: Calendar, label: 'Calendrier', desc: 'Planning RDV' },
    { to: '/vet/availability', icon: Clock, label: 'Disponibilité', desc: 'Horaires & créneaux' },
    { to: '/vet/medical-dossiers', icon: FolderOpen, label: 'Dossiers', desc: 'DMP patients' },
    { to: '/vet/vaccinations', icon: Syringe, label: 'Vaccinations', desc: 'Rappels & suivi' },
    { to: '/vet/prescriptions', icon: Pill, label: 'Ordonnances', desc: 'Prescriptions' },
    { to: '/vet/pharmacy', icon: Stethoscope, label: 'Pharmacie', desc: 'Stock médicaments' },
    { to: '/vet/clinic', icon: FileText, label: 'Ma clinique', desc: 'Profil cabinet' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #0ea5e9 100%)',
          borderRadius: 24,
          padding: '28px 32px',
          marginBottom: 24,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.08 }}>🩺</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85, textTransform: 'capitalize' }}>{todayLabel}</p>
            <h1 style={{ margin: '6px 0 4px', fontSize: '1.75rem', fontWeight: 800 }}>
              {clinic.clinicName || 'Espace vétérinaire'}
            </h1>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
              {clinic.region ? `${clinic.region} · ` : ''}
              {clinicStats.activePatients ?? 0} patients actifs · {totalConsultations} consultations au total
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 12,
              color: 'white',
              fontWeight: 600,
              cursor: refreshing ? 'wait' : 'pointer',
              fontSize: 13,
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
        </div>
      </motion.header>

      <VetClinicalAlertsBar />

      {/* KPIs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {primaryKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={kpi.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: '18px 20px',
                    boxShadow: kpi.highlight ? '0 0 0 2px #fecaca' : '0 2px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={kpi.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: kpi.color }}>{kpi.value}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{kpi.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats semaine + clinique */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          marginBottom: 24,
          background: '#f8fafc',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #e2e8f0',
        }}
      >
        {secondaryKpis.map((s) => (
          <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#334155' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <VetDigitalTwinDashboardPanel />

      <RealtimeStatsCharts role="vet" />

      <VetDashboardCharts
        weekChart={chartWeek}
        statusChart={chartStatus}
        casesByMonth={DEMO_VET_BI.casesByMonth}
        animalDistribution={DEMO_VET_BI.animalDistribution}
      />

      {/* Actions rapides */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Accès rapide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: 'white',
                  borderRadius: 14,
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f1f5f9',
                }}
              >
                <Icon size={20} color="#0ea5e9" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{action.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Aperçu BI clinique */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Synthèse clinique (BI)</h2>
          <Link to="/vet/bi" style={linkStyle}>Dashboard BI →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>📦 Réapprovisionnements</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
              {DEMO_VET_BI.recentImports.slice(0, 3).map((imp) => (
                <li key={imp.id} style={{ padding: '6px 0', borderBottom: '1px solid #f8fafc', color: '#475569' }}>
                  <strong>{imp.pharmacy}</strong> — {imp.itemsCount} art. · {new Date(imp.createdAt).toLocaleDateString('fr-FR')}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>🔗 Référentiel maladie</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
              {DEMO_VET_BI.diseaseTreatments.slice(0, 3).map((row) => (
                <li key={row.id} style={{ padding: '6px 0', borderBottom: '1px solid #f8fafc', color: '#475569' }}>
                  <strong>{row.disease}</strong> → {row.medication}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>🩺 Derniers cas cliniques</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
              {DEMO_VET_BI.casesWithMeds.slice(0, 3).map((c) => (
                <li key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #f8fafc', color: '#475569' }}>
                  <strong>{c.petName}</strong> ({c.animalType}) — {c.diagnosis}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* RDV du jour */}
        <Section
          title="Rendez-vous du jour"
          icon={<Calendar size={18} color="#0ea5e9" />}
          action={<Link to="/vet/calendar" style={linkStyle}>Voir tout</Link>}
        >
          {todayList.length === 0 ? (
            <EmptyState emoji="☀️" text="Aucun RDV aujourd'hui — profitez-en pour les dossiers en attente." />
          ) : (
            todayList.map((appt) => {
              const badge = visitModeBadge(appt);
              return (
                <ApptRow
                  key={apptId(appt)}
                  to={`/vet/appointments/${apptId(appt)}`}
                  petName={appt.petName}
                  sub={`${appt.owner?.name || 'Client'} · ${formatTime(appt.date)}`}
                  status={STATUS_LABELS[appt.status] || appt.status}
                  badge={badge}
                />
              );
            })
          )}
        </Section>

        {/* Prochains RDV */}
        <Section
          title="7 prochains jours"
          icon={<Clock size={18} color="#6366f1" />}
          action={<Link to="/vet/calendar" style={linkStyle}>Calendrier</Link>}
        >
          {upcomingAppointments.length === 0 ? (
            <EmptyState emoji="📅" text="Pas de RDV planifiés cette semaine." />
          ) : (
            upcomingAppointments.map((appt) => (
              <ApptRow
                key={apptId(appt)}
                to={`/vet/appointments/${apptId(appt)}`}
                petName={appt.petName}
                sub={`${formatDay(appt.date)} · ${formatTime(appt.date)}`}
                status={STATUS_LABELS[appt.status] || appt.status}
                badge={visitModeBadge(appt)}
              />
            ))
          )}
        </Section>

        {/* RDV non assignés */}
        {unassignedCount > 0 && (
          <Section
            title={`RDV à prendre en charge (${unassignedCount})`}
            icon={<Users size={18} color="#ef4444" />}
            highlight
          >
            {unassignedPreview.map((appt) => (
              <ApptRow
                key={apptId(appt)}
                to={`/vet/appointments/${apptId(appt)}`}
                petName={appt.petName}
                sub={`${appt.owner?.name || 'Client'} · ${formatDay(appt.date)} ${formatTime(appt.date)}`}
                status="À assigner"
                badge={{ label: '⏳ Pool', bg: '#fef2f2', color: '#b91c1c' }}
              />
            ))}
            {unassignedCount > unassignedPreview.length && (
              <Link to="/vet/calendar" style={{ ...linkStyle, display: 'block', marginTop: 8, textAlign: 'center' }}>
                + {unassignedCount - unassignedPreview.length} autres →
              </Link>
            )}
          </Section>
        )}

        {/* Entrées à signer */}
        {draftEntries.length > 0 && (
          <Section
            title="Dossiers — à signer"
            icon={<FileText size={18} color="#f59e0b" />}
            action={<Link to="/vet/medical-dossiers" style={linkStyle}>Dossiers</Link>}
          >
            {draftEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/vet/medical-dossiers/${entry.dossier?.id}`}
                style={rowStyle}
              >
                <div>
                  <strong style={{ fontSize: 14 }}>{entry.title}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                    {entry.dossier?.petName} · {entry.dossier?.dossierNumber}
                  </p>
                </div>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                  Brouillon
                </span>
              </Link>
            ))}
          </Section>
        )}
      </div>

      {/* Alertes cliniques */}
      {clinicalAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 24,
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #fcd34d',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="#b45309" /> Alertes cliniques
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clinicalAlerts.slice(0, 8).map((a, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 13,
                  borderLeft: `3px solid ${a.level === 'critical' ? '#ef4444' : a.level === 'warning' ? '#f59e0b' : '#0ea5e9'}`,
                }}
              >
                {a.link ? (
                  <Link to={a.link} style={{ color: '#92400e', fontWeight: 600, textDecoration: 'none' }}>
                    {a.message} <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                  </Link>
                ) : (
                  a.message
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bandeau résumé bas */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'white',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <span>💊 {totalPrescriptions} ordonnances au total</span>
        <span>🩺 {totalConsultations} consultations enregistrées</span>
        <span>
          {clinic.acceptsHomeVisit && '🏠 Domicile '}
          {clinic.acceptsTeleconsult && '📹 Téléconsult '}
          {clinic.acceptsHomeVisit || clinic.acceptsTeleconsult ? 'activés' : ''}
        </span>
        <Link to="/vet/bi" style={linkStyle}>Dashboard BI →</Link>
      </div>
    </div>
  );
};

const Section = ({ title, icon, action, highlight, children }) => (
  <div
    style={{
      background: 'white',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      border: highlight ? '1px solid #fecaca' : '1px solid #f1f5f9',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h2>
      {action}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
  </div>
);

const ApptRow = ({ to, petName, sub, status, badge }) => (
  <Link to={to} style={rowStyle}>
    <div style={{ minWidth: 0 }}>
      <strong style={{ fontSize: 14 }}>{petName}</strong>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
      {badge && (
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: badge.bg, color: badge.color, fontWeight: 700 }}>
          {badge.label}
        </span>
      )}
      <span style={{ fontSize: 11, color: '#64748b' }}>{status}</span>
    </div>
  </Link>
);

const EmptyState = ({ emoji, text }) => (
  <p style={{ margin: 0, padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
    {emoji} {text}
  </p>
);

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 12,
  background: '#f8fafc',
  textDecoration: 'none',
  color: 'inherit',
  border: '1px solid #f1f5f9',
};

const linkStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#0ea5e9',
  textDecoration: 'none',
};

export default VetDashboard;
