import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Stethoscope,
  FileText,
  Syringe,
  RefreshCw,
  Clock,
  Users,
  Pill,
  FolderOpen,
  MessageSquare,
  PackageX,
  UtensilsCrossed,
  Brain,
  Activity,
  Target,
} from 'lucide-react';
import api from '../utils/api';
import { fetchPharmacyCatalog } from '../services/vetMedicationService';
import { summarizePharmacyStock } from '../utils/vetPharmacyAlerts';
import { notifyNewPharmacyAlerts } from '../services/vetPharmacyNotificationService';
import { withDemoDashboard, DEMO_VET_BI } from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import VetAiBiChartsPanel from '../components/VetAiBiChartsPanel';
import RecommendationPipelinePanel from '../components/RecommendationPipelinePanel';
import './VetPages.css';

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
    unassignedCount = 0,
    clinicStats = {},
    clinic = {},
    weekStats = {},
  } = data || {};

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
    { label: 'Patients actifs', value: clinicStats.activePatients ?? 0, icon: '🐾' },
    { label: 'Vaccins en retard', value: pharmacySummary.vaccinesOverdue ?? clinicStats.vaccinesDueSoon ?? 0, icon: '💉' },
    { label: 'Demandes contact', value: pendingContactRequests, icon: '📩' },
  ];

  const quickActions = [
    { to: '/vet/calendar', icon: Calendar, label: 'Calendrier', desc: 'Planning RDV' },
    { to: '/vet/availability', icon: Clock, label: 'Disponibilité', desc: 'Horaires & créneaux' },
    { to: '/vet/medical-dossiers', icon: FolderOpen, label: 'Dossiers', desc: 'DMP patients' },
    { to: '/vet/vaccinations', icon: Syringe, label: 'Vaccinations', desc: 'Rappels & suivi' },
    { to: '/vet/prescriptions', icon: Pill, label: 'Ordonnances', desc: 'Prescriptions' },
    { to: '/vet/pharmacy', icon: Stethoscope, label: 'Pharmacie', desc: 'Stock médicaments' },
    { to: '/vet/clinic', icon: FileText, label: 'Ma clinique', desc: 'Profil & alertes' },
    { to: '/vet/nutrition', icon: UtensilsCrossed, label: 'Conseils nutrition', desc: 'Plans alimentaires' },
    { to: '/vet/recommendations', icon: Target, label: 'Recommandations IA', desc: 'Contenu + similaires' },
    { to: '/vet/ml-agent', icon: Brain, label: 'Agents IA', desc: 'ML & diagnostic' },
    { to: '/vet/bi', icon: Activity, label: 'Dashboard BI', desc: 'Courbes & analytics' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
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

      <RecommendationPipelinePanel role="vet" limit={4} compact hubLink="/vet/recommendations" />

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

      <VetAiBiChartsPanel
        weekChart={data?.weekChart || []}
        statusChart={data?.statusChart || []}
        biData={DEMO_VET_BI}
      />

      <div
        style={{
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
          {clinic.acceptsHomeVisit && '🏠 Visites à domicile activées'}
        </span>
        <Link to="/vet/clinic" style={linkStyle}>Ma clinique →</Link>
      </div>
    </div>
  );
};

const linkStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#0ea5e9',
  textDecoration: 'none',
};

export default VetDashboard;
