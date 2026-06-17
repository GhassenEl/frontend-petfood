import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Check, X } from 'lucide-react';
import { validateIncidentProposal } from '../services/incidentMlService';
import { simulateEsp32CamReading } from '../utils/foodQualityEngine';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminPages.css';

const DEMO_IOT_ANOMALIES = [
  {
    id: 'iot-a1',
    source: 'ESP32-CAM',
    device: 'Récipient Max',
    message: 'Nourriture altérée — qualité 42 %',
    severity: 'high',
    validated: false,
    at: new Date().toISOString(),
  },
  {
    id: 'iot-a2',
    source: 'Chaîne du froid',
    device: 'Entrepôt Tunis',
    message: 'Température seuil dépassé — 8 °C',
    severity: 'medium',
    validated: true,
    at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'iot-a3',
    source: 'Livraison',
    device: 'Véhicule #12',
    message: 'Humidité anormale en transit — 78 %',
    severity: 'medium',
    validated: false,
    at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const AdminIoTAnomaliesPage = () => {
  const [anomalies, setAnomalies] = useState(DEMO_IOT_ANOMALIES);
  const [busy, setBusy] = useState(null);

  const refresh = useCallback(() => {
    const reading = simulateEsp32CamReading('deteriorated');
    if (reading.isNonConforme) {
      setAnomalies((prev) => {
        const exists = prev.some((a) => a.source === 'ESP32-CAM' && !a.validated);
        if (exists) return prev;
        return [{
          id: `iot-live-${Date.now()}`,
          source: 'ESP32-CAM',
          device: 'Récipient Max',
          message: `Qualité ${reading.qualityScore} % — ${reading.state}`,
          severity: 'high',
          validated: false,
          at: reading.analyzedAt,
        }, ...prev];
      });
    }
  }, []);

  usePlatformRefresh(refresh);

  const validate = async (id, approved) => {
    setBusy(id);
    try {
      await validateIncidentProposal(id, { approved, response: approved ? 'Anomalie IoT confirmée' : 'Faux positif IoT' }).catch(() => null);
    } finally {
      setAnomalies((prev) => prev.map((a) => (
        a.id === id ? { ...a, validated: approved, status: approved ? 'approved' : 'rejected' } : a
      )));
      setBusy(null);
    }
  };

  const pending = anomalies.filter((a) => !a.validated);

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Radar size={24} /> Anomalies IoT — validation IA</h1>
        <p>
          Détection automatique des anomalies PetFoodIoT (ESP32-CAM, capteurs, livraison).
          {' '}
          <Link to="/admin/food-quality-cam">ESP32-CAM →</Link>
          {' · '}
          <Link to="/admin/incidents-ml">Incidents ML →</Link>
        </p>
      </header>

      <div className="adm-hub-kpis">
        <div className="adm-hub-kpi adm-hub-kpi--warn">
          <strong>{pending.length}</strong>
          <span>À valider</span>
        </div>
        <div className="adm-hub-kpi">
          <strong>{anomalies.length}</strong>
          <span>Total alertes</span>
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Appareil</th>
              <th>Message</th>
              <th>Sévérité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id}>
                <td>{a.source}</td>
                <td>{a.device}</td>
                <td>{a.message}</td>
                <td>
                  <span className={`adm-badge adm-badge--${a.severity === 'high' ? 'danger' : 'warn'}`}>
                    {a.severity}
                  </span>
                </td>
                <td>{a.validated ? (a.status === 'rejected' ? 'Rejetée' : 'Validée') : 'En attente'}</td>
                <td>
                  {!a.validated && (
                    <div className="adm-export-row">
                      <button
                        type="button"
                        className="adm-btn adm-btn--primary adm-btn--sm"
                        disabled={busy === a.id}
                        onClick={() => validate(a.id, true)}
                      >
                        <Check size={14} /> Valider
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--ghost adm-btn--sm"
                        disabled={busy === a.id}
                        onClick={() => validate(a.id, false)}
                      >
                        <X size={14} /> Rejeter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIoTAnomaliesPage;
