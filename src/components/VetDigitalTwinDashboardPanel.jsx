import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ExternalLink, AlertTriangle } from 'lucide-react';
import { DEMO_VET_TWIN_PATIENTS } from '../config/advancedIotPremiumCatalog';

const VetDigitalTwinDashboardPanel = () => (
  <section id="digital-twins" className="vet-twin-panel" style={{
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ede9fe 100%)',
    borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid #c4b5fd',
  }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stethoscope size={20} color="#7c3aed" />
          Tableau de bord jumeaux numériques
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Vue agrégée patients — bien-être, IoT alimentaire et alertes préventives.
        </p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: '#7c3aed', color: '#fff' }}>
        Premium PFE
      </span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
      {DEMO_VET_TWIN_PATIENTS.map((p) => (
        <article key={p.petId} style={{
          background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0',
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>{p.name}</strong>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>{p.wellness}/100</span>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}>{p.species} · IoT {p.iotScore}%</p>
          {p.alert ? (
            <p style={{ margin: 0, fontSize: 11, color: '#b45309', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> {p.alert}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 11, color: '#059669' }}>Aucune alerte</p>
          )}
          <p style={{ margin: '8px 0 0', fontSize: 10, color: '#94a3b8' }}>Dernière visite : {p.lastVisit}</p>
        </article>
      ))}
    </div>

    <Link to="/vet/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
      Dossiers patients complets <ExternalLink size={12} />
    </Link>
  </section>
);

export default VetDigitalTwinDashboardPanel;
