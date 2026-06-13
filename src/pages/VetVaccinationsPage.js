import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { DEMO_VET_VACCINATIONS, withDemoFallback } from '../utils/vetDemoData';

const statusStyle = (status, nextDue) => {
  const overdue = nextDue && new Date(nextDue) < new Date();
  if (overdue || status === 'overdue') return { bg: '#fef2f2', color: '#b91c1c', label: 'En retard' };
  if (status === 'up_to_date') return { bg: '#dcfce7', color: '#166534', label: 'À jour' };
  return { bg: '#fef3c7', color: '#92400e', label: 'À planifier' };
};

const VetVaccinationsPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/vet/vaccinations')
      .then(({ data }) => setVaccines(withDemoFallback(data, DEMO_VET_VACCINATIONS)))
      .catch(() => setVaccines(DEMO_VET_VACCINATIONS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (filter === 'overdue') {
      return vaccines.filter((v) => v.nextDue && new Date(v.nextDue) < now);
    }
    if (filter === 'soon') {
      return vaccines.filter((v) => v.nextDue && new Date(v.nextDue) >= now && new Date(v.nextDue) <= in30);
    }
    return vaccines;
  }, [vaccines, filter]);

  const stats = useMemo(() => {
    const now = new Date();
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return {
      total: vaccines.length,
      overdue: vaccines.filter((v) => v.nextDue && new Date(v.nextDue) < now).length,
      soon: vaccines.filter((v) => v.nextDue && new Date(v.nextDue) >= now && new Date(v.nextDue) <= in30).length,
    };
  }, [vaccines]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>💉 Vaccinations & rappels</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Suivi des vaccins administrés — synchronisés depuis les dossiers médicaux signés.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="En retard" value={stats.overdue} color="#b91c1c" />
        <StatCard label="30 prochains jours" value={stats.soon} color="#d97706" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'overdue', label: 'En retard' },
          { key: 'soon', label: 'Bientôt dus' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              background: filter === f.key ? '#0ea5e9' : '#f1f5f9',
              color: filter === f.key ? 'white' : '#475569',
            }}
          >
            {f.label}
          </button>
        ))}
        <Link to="/vet/medical-dossiers" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
          + Vacciner via dossier médical
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
          Aucun vaccin enregistré. Ajoutez une entrée « Vaccination » dans un dossier patient et signez-la.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((v) => {
            const st = statusStyle(v.status, v.nextDue);
            return (
              <div
                key={v.id}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong>{v.petName}</strong> · {v.vaccineType}
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                    {v.owner?.name || 'Client'} · {v.animalType}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    Administré : {new Date(v.dateAdministered).toLocaleDateString('fr-FR')}
                    {v.nextDue ? ` · Prochain : ${new Date(v.nextDue).toLocaleDateString('fr-FR')}` : ''}
                    {v.batchNumber ? ` · Lot ${v.batchNumber}` : ''}
                  </p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color = '#0ea5e9' }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
  </div>
);

export default VetVaccinationsPage;
