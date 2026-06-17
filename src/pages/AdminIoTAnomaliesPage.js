import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Check, X } from 'lucide-react';
import { validateIncidentProposal } from '../services/incidentMlService';
import { fetchIoTPack } from '../services/iotService';
import { buildIoTAnomalies } from '../utils/iotAnomalyEngine';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminPages.css';

const mapAnomalyToRow = (a) => ({
  id: a.id,
  source: a.type === 'food-quality' || a.type === 'mold' ? 'ESP32-CAM' : a.type === 'humidity' ? 'Capteur HR' : a.type === 'temperature' ? 'Température' : 'IoT',
  device: a.deviceName || '—',
  message: a.message,
  severity: a.severity,
  validated: false,
  at: new Date().toISOString(),
});

const AdminIoTAnomaliesPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [busy, setBusy] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const pack = await fetchIoTPack();
      const detected = (pack.anomalies || buildIoTAnomalies(pack)).map(mapAnomalyToRow);
      setAnomalies((prev) => {
        const validated = prev.filter((a) => a.validated);
        const merged = [...detected, ...validated.filter((v) => !detected.some((d) => d.id === v.id))];
        return merged.slice(0, 30);
      });
    } catch {
      setAnomalies((prev) => (prev.length ? prev : [
        mapAnomalyToRow({
          id: 'iot-a1',
          type: 'food-quality',
          deviceName: 'ESP32-CAM Max',
          message: 'Nourriture altérée — qualité 42 %',
          severity: 'high',
        }),
      ]));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          Détection automatique PetFoodIoT (température, humidité, consommation, ESP32-CAM, MQTT).
          {' '}
          <Link to="/admin/food-quality-cam">ESP32-CAM →</Link>
          {' · '}
          <Link to="/admin/incidents-ml">Incidents ML →</Link>
          {' · '}
          <Link to="/intelligence">Plateforme IA →</Link>
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
        <div className="adm-hub-kpi">
          <strong>{anomalies.filter((a) => a.severity === 'high').length}</strong>
          <span>Critiques</span>
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
