import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileDown, Utensils, Stethoscope } from 'lucide-react';
import api from '../utils/api';
import { getVetClinicalReport, getVetNutritionRecommendation } from '../services/vetService';
import { exportVetClinicalReportPdf, exportDossierFromReport } from '../utils/vetClinicalReportPdf';
import { exportMedicalDossierPdf } from '../utils/medicalDossierPdf';

const typeIcon = {
  appointment: '📅',
  consultation: '🩺',
  prescription: '💊',
  dossier: '📁',
  vaccine: '💉',
};

const VetHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const [timeline, setTimeline] = useState([]);
  const [legacy, setLegacy] = useState({
    appointments: [],
    consultations: [],
    prescriptions: [],
    records: [],
    dossierEntries: [],
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [nutrition, setNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [petName, setPetName] = useState(() => searchParams.get('petName') || '');
  const [ownerId, setOwnerId] = useState(() => searchParams.get('ownerId') || '');
  const [view, setView] = useState('consultations');

  useEffect(() => {
    api.get('/vet/clients').then(({ data }) => setClients(data || [])).catch(() => setClients([]));
  }, []);

  const fetchHistory = async (opts = {}) => {
    setLoading(true);
    const pet = opts.petName ?? petName;
    const owner = opts.ownerId ?? ownerId;
    try {
      const params = {};
      if (pet) params.petName = pet;
      if (owner) params.ownerId = owner;
      const [histRes, tlRes] = await Promise.all([
        api.get('/vet/history', { params }),
        pet && owner
          ? api.get('/vet/clinical/timeline', { params: { petName: pet, ownerId: owner } })
          : Promise.resolve({ data: [] }),
      ]);
      setLegacy(histRes.data);
      setTimeline(tlRes.data || []);
    } catch (error) {
      console.error('History error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNutrition = async (opts = {}) => {
    const pet = opts.petName ?? petName;
    const owner = opts.ownerId ?? ownerId;
    if (!pet || !owner) {
      setNutrition(null);
      return;
    }
    setNutritionLoading(true);
    try {
      const data = await getVetNutritionRecommendation(owner, pet);
      setNutrition(data);
    } catch {
      setNutrition(null);
    } finally {
      setNutritionLoading(false);
    }
  };

  useEffect(() => {
    const pet = searchParams.get('petName') || '';
    const owner = searchParams.get('ownerId') || '';
    if (pet) setPetName(pet);
    if (owner) setOwnerId(owner);
    fetchHistory({ petName: pet, ownerId: owner });
    fetchNutrition({ petName: pet, ownerId: owner });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedClient = useMemo(
    () => clients.find((c) => (c.id || c._id) === ownerId),
    [clients, ownerId]
  );

  const petOptions = useMemo(() => {
    if (!selectedClient?.pets?.length) return [];
    return selectedClient.pets.map((p) => p.name).filter(Boolean);
  }, [selectedClient]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
    fetchNutrition();
  };

  const handleClientChange = (id) => {
    setOwnerId(id);
    const client = clients.find((c) => (c.id || c._id) === id);
    const firstPet = client?.pets?.[0]?.name || '';
    setPetName(firstPet);
  };

  const handleExportReport = async () => {
    if (!ownerId || !petName) {
      window.alert('Sélectionnez un client et un animal.');
      return;
    }
    setExporting(true);
    try {
      const report = await getVetClinicalReport(ownerId, petName);
      exportVetClinicalReportPdf(report);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Export rapport impossible.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDossier = async () => {
    if (!ownerId || !petName) {
      window.alert('Sélectionnez un client et un animal.');
      return;
    }
    setExporting(true);
    try {
      const report = await getVetClinicalReport(ownerId, petName);
      if (exportDossierFromReport(report)) return;
      const list = await api.get('/vet/medical-dossiers');
      const match = (list.data || []).find(
        (d) => d.ownerId === ownerId && d.petName === petName
      );
      if (match?.id) {
        const { data: dossier } = await api.get(`/vet/medical-dossiers/${match.id}`);
        exportMedicalDossierPdf(dossier);
      } else {
        window.alert('Aucun dossier médical pour cet animal.');
      }
    } catch {
      window.alert('Export dossier impossible.');
    } finally {
      setExporting(false);
    }
  };

  const consultations = legacy.consultations || [];

  if (loading && timeline.length === 0 && !consultations.length) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>📜 Historique des consultations</h1>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: 20 }}>
        Parcours clinique, export PDF du dossier et recommandations nutritionnelles par patient.
      </p>

      <form
        onSubmit={handleSearch}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginBottom: 16,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Client
          <select
            value={ownerId}
            onChange={(e) => handleClientChange(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
          >
            <option value="">— Tous les clients —</option>
            {clients.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Animal
          {petOptions.length > 0 ? (
            <select
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
            >
              <option value="">— Choisir —</option>
              {petOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          ) : (
            <input
              placeholder="Nom de l'animal"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb' }}
            />
          )}
        </label>

        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>
          Filtrer
        </button>
      </form>

      {ownerId && petName && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={exporting}
            onClick={handleExportReport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FileDown size={16} />
            {exporting ? 'Export…' : 'Rapport PDF complet'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={exporting}
            onClick={handleExportDossier}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FileDown size={16} />
            Dossier médical PDF
          </button>
          <Link
            to={`/vet/medical-dossiers?q=${encodeURIComponent(petName)}`}
            className="btn btn-outline"
            style={{ fontSize: 13, textDecoration: 'none' }}
          >
            📁 Dossier en ligne
          </Link>
          <Link to="/vet/calendar" className="btn btn-outline" style={{ fontSize: 13, textDecoration: 'none' }}>
            📅 Agenda
          </Link>
        </div>
      )}

      {ownerId && petName && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            border: '1px solid #a7f3d0',
          }}
        >
          <h2 style={{ margin: '0 0 10px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Utensils size={18} color="#059669" />
            Recommandation nutritionnelle — {petName}
          </h2>
          {nutritionLoading ? (
            <p style={{ margin: 0, color: '#64748b' }}>Analyse nutrition…</p>
          ) : nutrition ? (
            <>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: '#065f46', lineHeight: 1.55 }}>
                {nutrition.summary}
              </p>
              {nutrition.calories?.supported && (
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#047857' }}>
                  🔥 {nutrition.calories.dailyKcal} kcal/j · ~{nutrition.calories.dryFoodGramsPerDay} g croquettes
                </p>
              )}
              {(nutrition.nutritionPlans || []).slice(0, 1).map((plan) => (
                <details key={plan.id} style={{ marginTop: 8, fontSize: 13, color: '#334155' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Plan NutriPro enregistré</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', fontFamily: 'inherit' }}>
                    {(plan.planText || '').slice(0, 800)}
                  </pre>
                </details>
              ))}
              {(nutrition.productRecommendations?.food || []).length > 0 && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#475569' }}>
                  Produits suggérés :{' '}
                  {nutrition.productRecommendations.food.map((f) => f.name).join(', ')}
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, color: '#64748b' }}>Aucune donnée nutrition disponible.</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'consultations', label: 'Consultations' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'lists', label: 'Toutes listes' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            style={tabStyle(view === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'consultations' && (
        consultations.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 14, color: '#94a3b8' }}>
            <Stethoscope size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ margin: 0 }}>
              {ownerId && petName
                ? 'Aucune consultation pour cet animal.'
                : 'Sélectionnez un client et un animal.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {consultations.map((c) => (
              <article
                key={c.id}
                style={{
                  background: 'white',
                  padding: 18,
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>
                    {c.diagnosis || 'Consultation'}
                  </strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date(c.updatedAt || c.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
                  Statut : {c.status || '—'}
                  {c.vet?.name ? ` · Dr. ${c.vet.name}` : ''}
                </p>
                {c.symptoms && (
                  <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                    <strong>Symptômes :</strong> {c.symptoms}
                  </p>
                )}
                {c.clinicalExam && (
                  <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                    <strong>Examen :</strong> {c.clinicalExam}
                  </p>
                )}
                {c.analysis && (
                  <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                    <strong>Analyse :</strong> {c.analysis}
                  </p>
                )}
                {c.recommendations && (
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#059669' }}>
                    <strong>Recommandations :</strong> {c.recommendations}
                  </p>
                )}
                {c.appointmentId && (
                  <Link
                    to={`/vet/appointments/${c.appointmentId}`}
                    style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 700, color: '#0ea5e9' }}
                  >
                    Ouvrir la fiche RDV →
                  </Link>
                )}
              </article>
            ))}
          </div>
        )
      )}

      {view === 'timeline' &&
        (timeline.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 14, color: '#94a3b8' }}>
            <p style={{ margin: 0 }}>
              {ownerId && petName
                ? 'Aucun événement dans la timeline.'
                : 'Sélectionnez un client et un animal.'}
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {timeline.map((ev) => (
              <div key={ev.id} style={{ marginBottom: 16, paddingLeft: 20, borderLeft: '3px solid #0ea5e9' }}>
                <span style={{ fontSize: 18 }}>{typeIcon[ev.type] || '•'}</span>
                <strong style={{ marginLeft: 8 }}>{ev.label}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  {new Date(ev.date).toLocaleString('fr-FR')}
                  {ev.signed ? ' · Signé' : ''}
                </p>
                {ev.detail && <p style={{ margin: '4px 0 0', fontSize: 13 }}>{String(ev.detail).slice(0, 200)}</p>}
              </div>
            ))}
          </div>
        ))}

      {view === 'lists' && (
        <>
          {[
            { key: 'consultations', label: 'Consultations', items: legacy.consultations, dateField: 'updatedAt' },
            { key: 'dossierEntries', label: 'Dossier médical', items: legacy.dossierEntries || [], dateField: 'visitDate' },
            { key: 'prescriptions', label: 'Ordonnances', items: legacy.prescriptions, dateField: 'createdAt' },
            { key: 'appointments', label: 'RDV', items: legacy.appointments, dateField: 'date' },
          ].map((section) => (
            <div key={section.key} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.1rem' }}>
                {section.label} ({section.items.length})
              </h2>
              {section.items.length === 0 ? (
                <p style={{ color: '#888' }}>Aucun élément.</p>
              ) : (
                section.items.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'white',
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 8,
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <strong>{item.petName || item.dossier?.petName || '—'}</strong>
                    <span style={{ marginLeft: 8, fontSize: '0.85rem', color: '#666' }}>
                      {item[section.dateField]
                        ? new Date(item[section.dateField]).toLocaleDateString('fr-FR')
                        : ''}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                      {item.title || item.diagnosis || item.status || '—'}
                    </p>
                  </div>
                ))
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const tabStyle = (active) => ({
  padding: '6px 14px',
  borderRadius: '20px',
  border: active ? '2px solid #0ea5e9' : '1px solid #ddd',
  background: active ? '#e0f2fe' : 'white',
  cursor: 'pointer',
  fontWeight: 600,
});

export default VetHistoryPage;
