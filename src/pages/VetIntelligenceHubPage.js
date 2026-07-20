import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Brain, Stethoscope, FileText, Pill, Bell, TrendingUp, Bot, Utensils, RefreshCw, PawPrint,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import DemoModePill from '../components/DemoModePill';
import { loadVetIntelligenceHubPack } from '../services/vetIntelligenceHubService';
import VetDiagnosticAssistantPanel from '../components/VetDiagnosticAssistantPanel';
import VetDossierAnalysisPanel from '../components/VetDossierAnalysisPanel';
import VetPrescriptionAssistantPanel from '../components/VetPrescriptionAssistantPanel';
import VetPredictiveFollowUpPanel from '../components/VetPredictiveFollowUpPanel';
import VetHealthEvolutionPanel from '../components/VetHealthEvolutionPanel';
import VetClinicalAssistantPanel from '../components/VetClinicalAssistantPanel';
import VetPathologyNutritionPanel from '../components/VetPathologyNutritionPanel';
import VetAnimalDetectionPanel from '../components/VetAnimalDetectionPanel';
import './VetIntelligenceHub.css';

const TABS = [
  { id: 'detection', label: 'Détection animal', icon: PawPrint },
  { id: 'diagnostic', label: 'Diagnostic', icon: Stethoscope },
  { id: 'dossier', label: 'Dossier médical', icon: FileText },
  { id: 'prescription', label: 'Ordonnances', icon: Pill },
  { id: 'followup', label: 'Suivi prédictif', icon: Bell },
  { id: 'evolution', label: 'Évolution santé', icon: TrendingUp },
  { id: 'assistant', label: 'Assistant CR', icon: Bot },
  { id: 'nutrition', label: 'Nutrition patho.', icon: Utensils },
];

const TAB_IDS = TABS.map((t) => t.id);

const VetIntelligenceHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    TAB_IDS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'diagnostic',
  );
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadVetIntelligenceHubPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TAB_IDS.includes(t)) setTab(t);
  }, [searchParams]);

  usePlatformRefresh(load, [load]);

  const stats = pack?.stats || {};

  return (
    <div className="vetih-page">
      <h1>
        <Brain size={26} aria-hidden />
        Intelligence clinique vétérinaire
      </h1>
      <p className="vetih-lead">
        Assistant diagnostic, détection espèce ML, analyse dossier, ordonnances assistées dynamiques, suivi prédictif, courbes de santé,
        rédaction de comptes rendus et nutrition pathologique — hub IA unifié pour la clinique.
      </p>

      {pack?.mode === 'demo' && <DemoModePill />}

      <div className="vetih-stats-bar">
        <div className="vetih-stat-bar">
          <strong>{stats.patientsMonitored ?? '—'}</strong>
          <span>Patients suivis</span>
        </div>
        <div className="vetih-stat-bar">
          <strong>{stats.highPriorityFollowUp ?? 0}</strong>
          <span>Suivis prioritaires</span>
        </div>
        <div className="vetih-stat-bar">
          <strong>{stats.dossierAlerts ?? 0}</strong>
          <span>Alertes dossier</span>
        </div>
      </div>

      <div className="vetih-toolbar">
        <div className="vetih-tabs" role="tablist" aria-label="Intelligence vétérinaire">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`vetih-tab${tab === id ? ' vetih-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} aria-hidden /> {label}
              {id === 'followup' && (pack?.followUp?.stats?.highPriority || 0) > 0 && (
                <span className="vetih-tab-badge">{pack.followUp.stats.highPriority}</span>
              )}
            </button>
          ))}
        </div>
        <button type="button" className="vetih-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'detection' && (
        <VetAnimalDetectionPanel patients={pack?.patients} loading={loading} />
      )}

      {tab === 'diagnostic' && (
        <VetDiagnosticAssistantPanel
          patients={pack?.patients}
          demo={pack?.diagnosticDemo}
          loading={loading}
        />
      )}

      {tab === 'dossier' && (
        <VetDossierAnalysisPanel analysis={pack?.dossierAnalysis} loading={loading} />
      )}

      {tab === 'prescription' && (
        <VetPrescriptionAssistantPanel
          patients={pack?.patients}
          demo={pack?.prescriptionDemo}
          loading={loading}
        />
      )}

      {tab === 'followup' && (
        <VetPredictiveFollowUpPanel followUp={pack?.followUp} loading={loading} />
      )}

      {tab === 'evolution' && (
        <VetHealthEvolutionPanel
          evolution={pack?.healthEvolution}
          patients={pack?.patients}
          loading={loading}
        />
      )}

      {tab === 'assistant' && (
        <VetClinicalAssistantPanel
          patients={pack?.patients}
          quickPrompts={pack?.quickPrompts}
          loading={loading}
        />
      )}

      {tab === 'nutrition' && (
        <VetPathologyNutritionPanel
          patients={pack?.patients}
          demo={pack?.nutritionDemo}
          dossier={pack?.dossier}
          loading={loading}
        />
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
        Modules détaillés :{' '}
        <Link to="/vet/diagnostics">Détection précoce</Link>
        {' · '}
        <Link to="/vet/medication-recommendations">Médicaments</Link>
        {' · '}
        <Link to="/vet/nutrition">Nutrition</Link>
        {' · '}
        <Link to="/vet/ml-agent">Agents ML</Link>
      </p>
    </div>
  );
};

export default VetIntelligenceHubPage;
