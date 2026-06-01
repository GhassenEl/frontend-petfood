import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { exportMedicalDossierPdf } from '../utils/medicalDossierPdf';
import ClientPrescriptionCard from '../components/ClientPrescriptionCard';
import ClientVaccineRemindersPanel from '../components/ClientVaccineRemindersPanel';

const animalEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const ClientMedicalDossierPage = () => {
  const [dossiers, setDossiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    api
      .get('/veterinary/my/dossiers')
      .then(({ data }) => setDossiers(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openDossier = async (id) => {
    setLoading(true);
    setVerifyResult(null);
    try {
      const { data } = await api.get(`/veterinary/my/dossiers/${id}`);
      setSelected(data);
    } catch {
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (entryId) => {
    try {
      const { data } = await api.get(`/veterinary/my/dossiers/entries/${entryId}/verify`);
      setVerifyResult({ entryId, ...data });
    } catch {
      setVerifyResult({ entryId, valid: false });
    }
  };

  if (loading && !selected && dossiers.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  }

  if (selected) {
    return (
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => setSelected(null)}
          style={{
            border: 'none',
            background: 'none',
            color: '#0ea5e9',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: 0,
          }}
        >
          ← Mes dossiers
        </button>

        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            borderRadius: '14px',
            padding: '20px',
            marginTop: '12px',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
            Dossier médical numérique · {selected.dossierNumber}
          </p>
          <h1 style={{ margin: '4px 0' }}>
            {animalEmoji[selected.animalType] || '🐾'} {selected.petName}
          </h1>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 8 }}
            onClick={() => exportMedicalDossierPdf(selected)}
          >
            📄 Exporter PDF
          </button>
          {selected.allergies && (
            <p style={{ margin: '8px 0 0', color: '#b45309', fontSize: '0.9rem' }}>
              ⚠️ Allergies : {selected.allergies}
            </p>
          )}
          {selected.creator?.name && (
            <p style={{ margin: '8px 0 0', color: '#0369a1', fontSize: '0.9rem' }}>
              🩺 Vétérinaire référent : Dr. {selected.creator.name}
            </p>
          )}
        </div>

        {/* Rappels vaccins */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 12px', fontWeight: 800 }}>
            💉 Rappels vaccins — {selected.petName}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 14 }}>
            Prochaines échéances vaccinales pour cet animal.
          </p>
          <ClientVaccineRemindersPanel petName={selected.petName} compact />
        </section>

        {/* Ordonnances */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 12px', fontWeight: 800 }}>
            💊 Ordonnances — {selected.petName}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 14 }}>
            Prescriptions délivrées par votre vétérinaire pour cet animal.
          </p>
          {(selected.prescriptions || []).length === 0 ? (
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 14,
                padding: 18,
                color: '#94a3b8',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              Aucune ordonnance enregistrée. Elles apparaîtront ici après une consultation validée.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selected.prescriptions.map((rx) => (
                <ClientPrescriptionCard key={rx.id || rx._id} prescription={rx} />
              ))}
            </div>
          )}
        </section>

        <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px', fontWeight: 800 }}>📋 Historique clinique</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
          Documents signés électroniquement par votre vétérinaire. Vous pouvez vérifier l&apos;intégrité
          de chaque entrée.
        </p>

        {(selected.entries || []).length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucune entrée dans ce dossier.</p>
        ) : (
          selected.entries.map((entry) => (
            <article
              key={entry.id}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderLeft: entry.isSigned ? '4px solid #22c55e' : '4px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 4px' }}>{entry.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                {new Date(entry.visitDate).toLocaleDateString('fr-FR')}
                {entry.isSigned ? ' · ✓ Signé' : ' · Brouillon'}
              </p>
              {entry.diagnosis && <p style={{ marginTop: '8px' }}><strong>Diagnostic :</strong> {entry.diagnosis}</p>}
              {entry.treatment && <p><strong>Traitement :</strong> {entry.treatment}</p>}
              {entry.isSigned && entry.vetSignatureImage && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0 0 6px' }}>
                    {entry.signer?.name} — {new Date(entry.signedAt).toLocaleString('fr-FR')}
                  </p>
                  <img
                    src={entry.vetSignatureImage}
                    alt="Signature"
                    style={{ maxHeight: '50px', background: '#f8fafc', padding: '4px', borderRadius: '6px' }}
                  />
                  <button
                    type="button"
                    onClick={() => verify(entry.id)}
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Vérifier authenticité
                  </button>
                  {verifyResult?.entryId === entry.id && (
                    <p style={{ color: verifyResult.valid ? '#166534' : '#b91c1c', fontSize: '0.85rem' }}>
                      {verifyResult.valid ? 'Document authentique' : 'Vérification échouée'}
                    </p>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>📁 Dossiers médicaux de mes animaux</h1>
      <p style={{ color: '#64748b' }}>
        Consultez l&apos;historique clinique signé par votre vétérinaire.
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 12px', fontWeight: 800 }}>💉 Rappels vaccins</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 14 }}>
          Suivez les échéances vaccinales de tous vos animaux.
        </p>
        <ClientVaccineRemindersPanel />
      </section>

      {dossiers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <p>Aucun dossier médical pour le moment.</p>
          <Link to="/veterinary" style={{ color: '#0ea5e9' }}>
            Prendre rendez-vous vétérinaire
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {dossiers.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => openDossier(d.id)}
              style={{
                textAlign: 'left',
                background: 'white',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{animalEmoji[d.animalType] || '🐾'}</span>
              <h3 style={{ margin: '8px 0 4px' }}>{d.petName}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{d.dossierNumber}</p>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#0ea5e9' }}>
                {d.entryCount || 0} entrée(s) · {d.signedCount || 0} signée(s)
                {(d.prescriptionCount || 0) > 0 ? ` · ${d.prescriptionCount} ordonnance(s)` : ''}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientMedicalDossierPage;
