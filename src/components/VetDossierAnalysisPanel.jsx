import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle } from 'lucide-react';

const SEV_CLASS = { high: 'vetih-alert--high', medium: 'vetih-alert--medium', low: 'vetih-alert--low' };

const VetDossierAnalysisPanel = ({ analysis, loading }) => {
  if (loading) return <p className="vetih-muted">Analyse du dossier…</p>;
  if (!analysis) return <p className="vetih-muted">Aucun dossier sélectionné.</p>;

  return (
    <div className="vetih-panel">
      <p className="vetih-summary">
        <FileText size={16} aria-hidden />
        Détection automatique des antécédents importants, allergies, traitements en cours et facteurs de risque.
      </p>

      <div className="vetih-stats-row">
        <div className="vetih-stat">
          <strong>{analysis.dossierNumber}</strong>
          <span>Dossier</span>
        </div>
        <div className="vetih-stat">
          <strong>{analysis.petName}</strong>
          <span>Patient</span>
        </div>
        <div className="vetih-stat">
          <strong>{analysis.alerts?.length || 0}</strong>
          <span>Alertes</span>
        </div>
      </div>

      <p className="vetih-ai-text">{analysis.aiSummary}</p>

      {(analysis.alerts || []).length > 0 && (
        <>
          <h4><AlertTriangle size={16} aria-hidden /> Alertes dossier</h4>
          <ul className="vetih-list">
            {analysis.alerts.map((a, i) => (
              <li key={i} className={`vetih-card ${SEV_CLASS[a.severity] || ''}`}>
                <strong>{a.label}</strong>
                <p>{a.detail}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {(analysis.importantHistory || []).length > 0 && (
        <>
          <h4>Antécédents clés</h4>
          <ul className="vetih-list vetih-list--compact">
            {analysis.importantHistory.map((h, i) => (
              <li key={i}><strong>{h.label} :</strong> {h.value}</li>
            ))}
          </ul>
        </>
      )}

      {(analysis.riskFactors || []).length > 0 && (
        <>
          <h4>Facteurs de risque</h4>
          <ul className="vetih-chips">
            {analysis.riskFactors.map((r, i) => (
              <li key={i} className="vetih-chip vetih-chip--warn">{r.factor}{r.petName ? ` (${r.petName})` : ''}</li>
            ))}
          </ul>
        </>
      )}

      {(analysis.timelineHighlights || []).length > 0 && (
        <>
          <h4>Chronologie récente</h4>
          <ul className="vetih-timeline">
            {analysis.timelineHighlights.map((t) => (
              <li key={t.id}>
                <time>{new Date(t.date).toLocaleDateString('fr-FR')}</time>
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link to="/vet/medical-dossiers" className="vetih-link">Voir tous les dossiers →</Link>
    </div>
  );
};

export default VetDossierAnalysisPanel;
