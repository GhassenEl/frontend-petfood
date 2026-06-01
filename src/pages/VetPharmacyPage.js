import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const VetPharmacyPage = () => {
  const [medications, setMedications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/vet/pharmacy/medications'),
      api.get('/vet/pharmacy/stock-alerts'),
    ])
      .then(([meds, al]) => {
        setMedications(meds.data || []);
        setAlerts(al.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement pharmacie…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>💊 Pharmacie clinique</h1>
      <p style={{ color: '#64748b' }}>
        Stock, alertes et catalogue utilisé pour les ordonnances.{' '}
        <Link to="/vet/bi" style={{ color: '#0ea5e9' }}>Dashboard BI →</Link>
      </p>

      {alerts.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <strong style={{ color: '#b45309' }}>⚠ Alertes stock ({alerts.length})</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {alerts.map((a) => (
              <li key={a.id || a.name} style={{ fontSize: 14 }}>
                {a.name} — {a.stockQty} {a.unit} (minimum {a.minStock})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: 12 }}>Médicament</th>
              <th style={{ padding: 12 }}>Stock</th>
              <th style={{ padding: 12 }}>Min</th>
              <th style={{ padding: 12 }}>Unité</th>
              <th style={{ padding: 12 }}>Pharmacie</th>
              <th style={{ padding: 12 }}>Protocoles BI</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6', background: m.lowStock ? '#fffbeb' : 'transparent' }}>
                <td style={{ padding: 12 }}><strong>{m.name}</strong></td>
                <td style={{ padding: 12, color: m.lowStock ? '#b45309' : '#059669', fontWeight: 700 }}>{m.stockQty}</td>
                <td style={{ padding: 12 }}>{m.minStock}</td>
                <td style={{ padding: 12 }}>{m.unit}</td>
                <td style={{ padding: 12 }}>{m.pharmacy || '—'}</td>
                <td style={{ padding: 12, fontSize: 12, color: '#64748b' }}>
                  {(m.treatments || []).map((t) => t.disease).filter(Boolean).join(', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VetPharmacyPage;
