import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import SignaturePad from '../components/SignaturePad';
import { exportMedicalDossierPdf } from '../utils/medicalDossierPdf';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: 'white',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  marginBottom: '16px',
};

const emptyEntry = {
  entryType: 'consultation',
  title: '',
  symptoms: '',
  clinicalExam: '',
  diagnosis: '',
  treatment: '',
  medications: '',
  recommendations: '',
  weight: '',
  temperature: '',
  vaccineType: '',
  batchNumber: '',
  nextDue: '',
};

const entryTypeLabels = {
  consultation: 'Consultation',
  vaccination: 'Vaccination',
  surgery: 'Chirurgie',
  exam: 'Examen',
  note: 'Note clinique',
};

const VetMedicalDossierDetailPage = () => {
  const { id } = useParams();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryForm, setEntryForm] = useState(emptyEntry);
  const [saving, setSaving] = useState(false);
  const [signEntryId, setSignEntryId] = useState(null);
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/vet/medical-dossiers/${id}`);
      setDossier(data);
    } catch {
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const handleIdentitySave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = Object.fromEntries(fd.entries());
    try {
      const { data } = await api.patch(`/vet/medical-dossiers/${id}`, patch);
      setDossier((d) => ({ ...d, ...data }));
      window.alert('Identité patient mise à jour.');
    } catch {
      window.alert('Erreur mise à jour.');
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.title.trim()) {
      window.alert('Titre requis.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post(`/vet/medical-dossiers/${id}/entries`, entryForm);
      setDossier((d) => ({ ...d, entries: [data, ...(d.entries || [])] }));
      setEntryForm(emptyEntry);
    } catch {
      window.alert('Erreur ajout entrée.');
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!signature) {
      window.alert('Dessinez votre signature.');
      return;
    }
    setSigning(true);
    try {
      const { data } = await api.post(`/vet/medical-dossiers/entries/${signEntryId}/sign`, {
        signature,
      });
      setDossier((d) => ({
        ...d,
        entries: (d.entries || []).map((e) => (e.id === signEntryId ? data : e)),
      }));
      setSignEntryId(null);
      setSignature('');
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur signature.');
    } finally {
      setSigning(false);
    }
  };

  const handleUpdateEntry = async (entryId, patch) => {
    try {
      const { data } = await api.patch(`/vet/medical-dossiers/entries/${entryId}`, patch);
      setDossier((d) => ({
        ...d,
        entries: (d.entries || []).map((e) => (e.id === entryId ? data : e)),
      }));
      setEditingEntry(null);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur modification');
    }
  };

  const handleVerify = async (entryId) => {
    try {
      const { data } = await api.get(`/vet/medical-dossiers/entries/${entryId}/verify`);
      setVerifyResult({ entryId, ...data });
    } catch {
      setVerifyResult({ entryId, valid: false, reason: 'Erreur vérification' });
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  if (!dossier) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Dossier introuvable.</p>
        <Link to="/vet/medical-dossiers">← Retour</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <Link to="/vet/medical-dossiers" style={{ color: '#0ea5e9', fontSize: '0.9rem' }}>
        ← Dossiers médicaux
      </Link>

      <header style={{ ...card, background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', marginTop: '12px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>
          {dossier.dossierNumber}
        </p>
        <h1 style={{ margin: '4px 0 8px' }}>🐾 {dossier.petName}</h1>
        <p style={{ margin: 0, color: '#475569' }}>
          Propriétaire : {dossier.owner?.name} · {dossier.owner?.email}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          {dossier.animalType}
          {dossier.breed ? ` · ${dossier.breed}` : ''}
          {dossier.identificationNumber ? ` · ID ${dossier.identificationNumber}` : ''}
        </p>
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: 10 }}
          onClick={() => exportMedicalDossierPdf(dossier)}
        >
          📄 Exporter PDF dossier
        </button>
      </header>

      <section style={card}>
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Identité & antécédents</h2>
        <form onSubmit={handleIdentitySave}>
          <div
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            }}
          >
            {[
              ['breed', 'Race'],
              ['sex', 'Sexe'],
              ['identificationNumber', 'N° identification'],
              ['bloodType', 'Groupe sanguin'],
              ['allergies', 'Allergies'],
              ['chronicDiseases', 'Maladies chroniques'],
              ['diet', 'Régime actuel'],
            ].map(([name, label]) => (
              <label key={name} style={{ fontSize: '0.85rem' }}>
                {label}
                <input
                  name={name}
                  defaultValue={dossier[name] || ''}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-outline" style={{ marginTop: '12px' }}>
            Enregistrer identité
          </button>
        </form>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>+ Nouvelle entrée clinique</h2>
        <form onSubmit={handleAddEntry}>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
            <select
              value={entryForm.entryType}
              onChange={(e) => setEntryForm((f) => ({ ...f, entryType: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px' }}
            >
              {Object.entries(entryTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <input
              placeholder="Titre *"
              value={entryForm.title}
              onChange={(e) => setEntryForm((f) => ({ ...f, title: e.target.value }))}
              required
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          {entryForm.entryType === 'vaccination' && (
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr 1fr', marginTop: 10 }}>
              <input
                placeholder="Type vaccin *"
                value={entryForm.vaccineType}
                onChange={(e) => setEntryForm((f) => ({ ...f, vaccineType: e.target.value }))}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input
                placeholder="N° lot"
                value={entryForm.batchNumber}
                onChange={(e) => setEntryForm((f) => ({ ...f, batchNumber: e.target.value }))}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input
                type="date"
                value={entryForm.nextDue}
                onChange={(e) => setEntryForm((f) => ({ ...f, nextDue: e.target.value }))}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          )}
          {[
            ['symptoms', 'Symptômes'],
            ['clinicalExam', 'Examen clinique'],
            ['diagnosis', 'Diagnostic'],
            ['treatment', 'Traitement'],
            ['medications', 'Médicaments (JSON ou texte)'],
            ['recommendations', 'Recommandations'],
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'block', marginTop: '10px', fontSize: '0.9rem' }}>
              {label}
              <textarea
                value={entryForm[key]}
                onChange={(e) => setEntryForm((f) => ({ ...f, [key]: e.target.value }))}
                rows={2}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </label>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input
              type="number"
              step="0.1"
              placeholder="Poids kg"
              value={entryForm.weight}
              onChange={(e) => setEntryForm((f) => ({ ...f, weight: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Temp. °C"
              value={entryForm.temperature}
              onChange={(e) => setEntryForm((f) => ({ ...f, temperature: e.target.value }))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Ajouter au dossier'}
          </button>
        </form>
      </section>

      <h2 style={{ fontSize: '1.1rem' }}>Historique ({dossier.entries?.length || 0})</h2>
      {(dossier.entries || []).length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucune entrée pour l&apos;instant.</p>
      ) : (
        dossier.entries.map((entry) => (
          <article
            key={entry.id}
            style={{
              ...card,
              borderLeft: entry.isSigned ? '4px solid #22c55e' : '4px solid #f59e0b',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {entryTypeLabels[entry.entryType] || entry.entryType} ·{' '}
                  {new Date(entry.visitDate).toLocaleDateString('fr-FR')}
                </span>
                <h3 style={{ margin: '4px 0' }}>{entry.title}</h3>
              </div>
              {entry.isSigned ? (
                <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.85rem' }}>✓ Signé</span>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    onClick={() => setEditingEntry(entry.id)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    onClick={() => {
                      setSignEntryId(entry.id);
                      setSignature('');
                    }}
                  >
                    Signer
                  </button>
                </div>
              )}
            </div>

            {editingEntry === entry.id && !entry.isSigned && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  handleUpdateEntry(entry.id, Object.fromEntries(fd.entries()));
                }}
                style={{ marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 10 }}
              >
                <input name="title" defaultValue={entry.title} style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
                <textarea name="diagnosis" defaultValue={entry.diagnosis || ''} rows={2} placeholder="Diagnostic" style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
                <textarea name="treatment" defaultValue={entry.treatment || ''} rows={2} placeholder="Traitement" style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>Enregistrer</button>
                  <button type="button" className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => setEditingEntry(null)}>Annuler</button>
                </div>
              </form>
            )}

            {entry.symptoms && <p><strong>Symptômes :</strong> {entry.symptoms}</p>}
            {entry.diagnosis && <p><strong>Diagnostic :</strong> {entry.diagnosis}</p>}
            {entry.treatment && <p><strong>Traitement :</strong> {entry.treatment}</p>}
            {entry.medications && <p><strong>Médicaments :</strong> {entry.medications}</p>}

            {entry.isSigned && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '14px',
                  background: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#166534' }}>
                  Signé par {entry.signer?.name || 'Vétérinaire'} le{' '}
                  {new Date(entry.signedAt).toLocaleString('fr-FR')}
                </p>
                {entry.vetSignatureImage && (
                  <img
                    src={entry.vetSignatureImage}
                    alt="Signature vétérinaire"
                    style={{ maxHeight: '60px', background: 'white', padding: '4px', borderRadius: '6px' }}
                  />
                )}
                <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-all' }}>
                  Empreinte : {entry.signatureHash?.slice(0, 24)}…
                </p>
                <button
                  type="button"
                  onClick={() => handleVerify(entry.id)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Vérifier l&apos;intégrité
                </button>
                {verifyResult?.entryId === entry.id && (
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: '0.85rem',
                      color: verifyResult.valid ? '#166534' : '#b91c1c',
                    }}
                  >
                    {verifyResult.valid ? '✓ Signature valide — document non altéré' : '✗ Signature invalide'}
                  </p>
                )}
              </div>
            )}
          </article>
        ))
      )}

      {signEntryId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setSignEntryId(null)}
        >
          <div
            style={{ ...card, maxWidth: '480px', width: '100%', margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Signature numérique vétérinaire</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Votre signature scelle l&apos;entrée avec une empreinte SHA-256. Une fois signée, l&apos;entrée
              ne peut plus être modifiée.
            </p>
            <SignaturePad onChange={setSignature} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="btn btn-primary" onClick={handleSign} disabled={signing}>
                {signing ? 'Signature…' : 'Confirmer et signer'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setSignEntryId(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetMedicalDossierDetailPage;
