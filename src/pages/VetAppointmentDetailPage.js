import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { isHomeVisit, isOnlineVisit, visitModeLabel } from '../constants/visitModes';
import TeleconsultMeetPanel from '../components/TeleconsultMeetPanel';
import MedicationFormFields from '../components/MedicationFormFields';
import { emptyMedicationRow, serializeMedications, validateMedications } from '../utils/medications';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const emptyConsultation = {
  symptoms: '',
  clinicalExam: '',
  analysis: '',
  diagnosis: '',
  recommendations: '',
  status: 'draft',
};

const card = {
  background: 'white',
  borderRadius: 14,
  padding: 20,
  marginBottom: 20,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const VetAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [consultation, setConsultation] = useState(emptyConsultation);
  const [prescription, setPrescription] = useState({
    medications: [emptyMedicationRow()],
    instructions: '',
  });
  const [patientCtx, setPatientCtx] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const ownerId = appointment?.ownerId?.id || appointment?.ownerId || appointment?.owner?.id;
  const petWeight = patientCtx?.pet?.weight;

  const loadPatientData = async (appt) => {
    const oid = appt?.ownerId?.id || appt?.ownerId || appt?.owner?.id;
    if (!oid || !appt?.petName) return;
    try {
      const [ctxRes, tlRes] = await Promise.all([
        api.get('/vet/clinical/patient-context', { params: { ownerId: oid, petName: appt.petName } }),
        api.get('/vet/clinical/timeline', { params: { ownerId: oid, petName: appt.petName } }),
      ]);
      setPatientCtx(ctxRes.data);
      setTimeline(tlRes.data || []);
    } catch {
      /* ignore */
    }
  };

  const fetchData = async () => {
    try {
      const [apptsRes, consultsRes] = await Promise.all([
        api.get('/vet/appointments'),
        api.get('/vet/consultations'),
      ]);
      const appt = (apptsRes.data || []).find((a) => (a.id || a._id) === id);
      setAppointment(appt || null);
      if (appt) await loadPatientData(appt);
      const existing = (consultsRes.data || []).find((c) => c.appointmentId === id);
      if (existing) {
        setConsultation({
          symptoms: existing.symptoms || '',
          clinicalExam: existing.clinicalExam || '',
          analysis: existing.analysis || '',
          diagnosis: existing.diagnosis || '',
          recommendations: existing.recommendations || '',
          status: existing.status || 'draft',
          id: existing.id,
        });
      }
    } catch (error) {
      console.error('Appointment detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  usePlatformRefresh(fetchData);

  const claimAppt = async () => {
    try {
      const { data } = await api.put(`/vet/appointments/${id}/claim`);
      setAppointment(data);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur prise en charge');
    }
  };

  const confirmAppt = async () => {
    try {
      const { data } = await api.put(`/vet/appointments/${id}/confirm`);
      setAppointment(data);
    } catch {
      window.alert('Erreur confirmation');
    }
  };

  const runAiAnalysis = async () => {
    if (!consultation.symptoms?.trim()) {
      window.alert('Renseignez les symptômes avant l\'analyse clinique.');
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await api.post('/ml/vet/clinical/analyze', {
        ownerId,
        petName: appointment.petName,
        animalType: appointment.animalType,
        symptoms: consultation.symptoms,
      });
      if (data.diagnosticHypotheses?.[0]) {
        setConsultation((prev) => ({
          ...prev,
          diagnosis: prev.diagnosis || data.diagnosticHypotheses.map((h) => h.condition).join(' ; '),
          recommendations: prev.recommendations || data.clinicalNotes || '',
        }));
      }
      if (data.recommendedMedications?.length) {
        setPrescription((prev) => ({
          ...prev,
          medications: data.recommendedMedications.map((m) => ({
            name: m.name,
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || '',
            quantity: m.quantity || '',
          })),
          instructions: data.dietPlan?.summary || prev.instructions,
        }));
      }
    } catch {
      window.alert('Analyse clinique indisponible');
    } finally {
      setAiLoading(false);
    }
  };

  const saveConsultation = async () => {
    if (!appointment) return null;
    setSaving(true);
    try {
      const payload = {
        appointmentId: id,
        ownerId,
        petName: appointment.petName,
        animalType: appointment.animalType,
        ...consultation,
      };
      if (consultation.id) {
        await api.put(`/vet/consultations/${consultation.id}`, consultation);
        return consultation.id;
      }
      const { data } = await api.post('/vet/consultations', payload);
      setConsultation((prev) => ({ ...prev, id: data.id }));
      return data.id;
    } catch {
      window.alert('Erreur enregistrement');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const finalizeAndPrescribe = async () => {
    await saveConsultation();
    const meds = serializeMedications(prescription.medications);
    const errors = validateMedications(meds);
    if (errors.length) {
      window.alert(errors.join('\n'));
      return;
    }
    if (!meds.length) {
      window.alert('Ajoutez au moins un médicament.');
      return;
    }
    try {
      const { data } = await api.post('/vet/prescriptions', {
        consultationId: consultation.id || null,
        ownerId,
        petName: appointment.petName,
        medications: meds,
        instructions: prescription.instructions,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      let msg = 'Ordonnance créée.';
      if (data.stock?.warnings?.length) {
        msg += `\n⚠ Stock : ${data.stock.warnings.map((w) => w.message).join('; ')}`;
      }
      window.alert(msg);
      setPrescription({ medications: [emptyMedicationRow()], instructions: '' });
    } catch {
      window.alert('Erreur création ordonnance');
    }
  };

  const finalizeToDossier = async () => {
    const consultId = consultation.id || (await saveConsultation());
    if (!consultId) return;
    try {
      const { data } = await api.post(`/vet/consultations/${consultId}/archive-dossier`);
      window.alert('Consultation archivée dans le dossier médical.');
      navigate(`/vet/medical-dossiers/${data.dossier?.id || data.dossier?._id}`);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur archivage dossier');
    }
  };

  const openDossier = async () => {
    try {
      const { data } = await api.post('/vet/medical-dossiers', {
        ownerId,
        petName: appointment.petName,
      });
      navigate(`/vet/medical-dossiers/${data.id || data._id}`);
    } catch {
      window.alert('Erreur ouverture dossier');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  if (!appointment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Rendez-vous introuvable.</p>
        <Link to="/vet/calendar">Retour au calendrier</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <Link to="/vet/calendar" style={{ color: '#0ea5e9' }}>← Calendrier</Link>
      <h1 style={{ margin: '16px 0 8px' }}>🩺 Consultation — {appointment.petName}</h1>
      <p style={{ color: '#666' }}>
        {appointment.animalType} · {new Date(appointment.date).toLocaleString('fr-FR')} ·{' '}
        {appointment.owner?.name || 'Client'}
        {petWeight ? ` · ${petWeight} kg` : ''}
        {' · '}{visitModeLabel(appointment.visitMode || (isHomeVisit(appointment) ? 'home' : 'cabinet'))}
      </p>
      {isHomeVisit(appointment) && appointment.homeAddress && (
        <div style={{ ...card, background: '#fffbeb', border: '1px solid #fcd34d', padding: '14px 18px' }}>
          <strong>🏠 Visite à domicile</strong>
          <p style={{ margin: '8px 0 0', color: '#78350f' }}>{appointment.homeAddress}</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(appointment.homeAddress)}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ marginTop: 10, display: 'inline-block' }}
          >
            Itinéraire Google Maps
          </a>
        </div>
      )}

      {!appointment.vetId && (
        <div style={{ ...card, background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <strong>RDV non assigné</strong>
          <button type="button" className="btn btn-primary" style={{ marginLeft: 12 }} onClick={claimAppt}>
            Prendre en charge
          </button>
        </div>
      )}

      {(patientCtx?.allergies || patientCtx?.vaccinesDue?.length > 0) && (
        <div style={{ ...card, background: '#fef2f2', border: '1px solid #fecaca' }}>
          {patientCtx.allergies && <p style={{ margin: '0 0 6px' }}>⚠️ Allergies : {patientCtx.allergies}</p>}
          {patientCtx.vaccinesDue?.length > 0 && (
            <p style={{ margin: 0 }}>💉 Vaccins en retard : {patientCtx.vaccinesDue.map((v) => v.type).join(', ')}</p>
          )}
        </div>
      )}

      {isOnlineVisit(appointment) && (
        <TeleconsultMeetPanel appointment={appointment} />
      )}

      <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }}>
        {appointment.status === 'scheduled' && appointment.vetId && (
          <button type="button" className="btn btn-primary" onClick={confirmAppt}>Confirmer RDV</button>
        )}
        {appointment.meetingLink && !isOnlineVisit(appointment) && (
          <a href={appointment.meetingLink} target="_blank" rel="noreferrer" className="btn btn-outline">
            Visio (Meet)
          </a>
        )}
        <button type="button" className="btn btn-outline" onClick={runAiAnalysis} disabled={aiLoading}>
          {aiLoading ? 'Analyse…' : '🔬 Analyse clinique'}
        </button>
        <button type="button" className="btn btn-outline" onClick={openDossier}>📁 Dossier médical</button>
        <button type="button" className="btn btn-primary" onClick={finalizeToDossier}>
          📋 Archiver au dossier
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          {appointment.notes && (
            <div style={{ ...card, background: '#f8fafc' }}>
              <strong>Notes client :</strong> {appointment.notes}
            </div>
          )}

          <section style={card}>
            <h2 style={{ marginTop: 0 }}>1. Examen & diagnostic</h2>
            {['symptoms', 'clinicalExam', 'analysis', 'diagnosis', 'recommendations'].map((field) => (
              <div key={field} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>
                  {field === 'symptoms' ? 'Symptômes' : field === 'clinicalExam' ? 'Examen clinique' : field === 'analysis' ? 'Analyse' : field === 'diagnosis' ? 'Diagnostic' : 'Recommandations'}
                </label>
                <textarea
                  rows={2}
                  value={consultation[field]}
                  onChange={(e) => setConsultation((prev) => ({ ...prev, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={async () => {
              const ok = await saveConsultation();
              if (ok) window.alert('Consultation enregistrée');
            }} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer consultation'}
            </button>
          </section>

          <section style={card}>
            <h2 style={{ marginTop: 0 }}>2. Ordonnance</h2>
            <MedicationFormFields
              medications={prescription.medications}
              onChange={(medications) => setPrescription((prev) => ({ ...prev, medications }))}
              petWeightKg={petWeight}
              animalType={appointment.animalType}
              diagnosis={consultation.diagnosis}
            />
            <div style={{ margin: '16px 0 12px' }}>
              <label style={{ fontWeight: 600 }}>Instructions & régime</label>
              <textarea
                rows={2}
                value={prescription.instructions}
                onChange={(e) => setPrescription((prev) => ({ ...prev, instructions: e.target.value }))}
                style={{ width: '100%', marginTop: 6, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={finalizeAndPrescribe}>
              Valider ordonnance & déduire stock
            </button>
          </section>
        </div>

        <aside>
          <div style={card}>
            <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Timeline patient</h3>
            {timeline.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Aucun historique.</p>
            ) : (
              timeline.slice(0, 8).map((ev) => (
                <div key={ev.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                    {new Date(ev.date).toLocaleDateString('fr-FR')}
                  </p>
                  <strong style={{ fontSize: 13 }}>{ev.label}</strong>
                  {ev.signed && <span style={{ fontSize: 11, color: '#059669' }}> ✓</span>}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VetAppointmentDetailPage;
