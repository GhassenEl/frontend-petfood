import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IdCard, Syringe, FileText, Shield, AlertTriangle, CheckCircle2, Download,
} from 'lucide-react';
import { fetchPetPassports, fetchPetPassport } from '../services/ecosystemService';
import { exportMedicalDossierPdf } from '../utils/medicalDossierPdf';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const statusStyle = {
  up_to_date: { bg: '#ecfdf5', color: '#047857', label: 'À jour' },
  due_soon: { bg: '#fef3c7', color: '#b45309', label: 'Bientôt' },
  overdue: { bg: '#fef2f2', color: '#b91c1c', label: 'En retard' },
};

const ClientPetPassportPage = () => {
  const { petId: routePetId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [passport, setPassport] = useState(null);
  const [tab, setTab] = useState('identity');
  const [loading, setLoading] = useState(true);

  const loadPassport = useCallback(async (id) => {
    setLoading(true);
    try {
      setPassport(await fetchPetPassport(id));
    } catch {
      setPassport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPetPassports()
      .then((d) => {
        const passports = d.passports || [];
        setList(passports);
        const id = routePetId || passports[0]?.petId;
        if (id) loadPassport(id);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [routePetId, loadPassport]);

  const id = passport?.identity;

  const exportPdf = () => {
    if (!passport) return;
    exportMedicalDossierPdf({
      dossierNumber: id.dossierNumber || id.passportNumber,
      petName: id.name,
      animalType: id.type,
      breed: id.breed,
      allergies: id.allergies,
      creator: id.vetReferent ? { name: id.vetReferent } : null,
      entries: passport.medicalHistory,
    });
  };

  if (loading && !passport) {
    return <p style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Chargement du passeport…</p>;
  }

  if (!passport && list.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Aucun animal enregistré.</p>
        <Link to="/client-profile">Ajouter un animal dans mon profil →</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 920, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 20,
          padding: '24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.85, letterSpacing: 1 }}>PASSEPORT NUMÉRIQUE</p>
            <h1 style={{ margin: '6px 0', fontSize: 26, fontWeight: 800 }}>
              <IdCard size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              {id ? `${id.emoji} ${id.name}` : 'Mon animal'}
            </h1>
            {id?.passportNumber && (
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>{id.passportNumber}</p>
            )}
          </div>
          {passport?.verification?.code && (
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, opacity: 0.9 }}>Vérification</div>
              <div style={{ fontWeight: 800, letterSpacing: 2, fontSize: 13 }}>{passport.verification.code}</div>
            </div>
          )}
        </div>
      </motion.div>

      {list.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {list.map((p) => (
            <button
              key={p.petId}
              type="button"
              onClick={() => {
                navigate(`/client-pet-passport/${p.petId}`);
                loadPassport(p.petId);
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: routePetId === p.petId || id?.petId === p.petId ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                background: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {p.emoji} {p.name}
              {p.vaccinesAlert && ' ⚠️'}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <TabBtn active={tab === 'identity'} onClick={() => setTab('identity')} icon={<IdCard size={16} />} label="Identité" />
        <TabBtn active={tab === 'vaccines'} onClick={() => setTab('vaccines')} icon={<Syringe size={16} />} label="Vaccins" />
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')} icon={<FileText size={16} />} label="Historique médical" />
        <button type="button" onClick={exportPdf} style={{ marginLeft: 'auto', ...tabBtnStyle(false) }}>
          <Download size={16} /> PDF
        </button>
      </div>

      {passport?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
          <MiniKpi label="Vaccins" value={passport.summary.vaccinesTotal} warn={passport.summary.vaccinesOverdue > 0} />
          <MiniKpi label="À jour" value={passport.summary.vaccinesTotal - passport.summary.vaccinesOverdue - passport.summary.vaccinesDueSoon} />
          <MiniKpi label="Consultations" value={passport.summary.medicalEntries} />
          <MiniKpi label="Signées" value={passport.summary.signedEntries} />
        </div>
      )}

      {tab === 'identity' && id && (
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Identité de l&apos;animal</h2>
          <GridRow label="Espèce" value={id.typeLabel} />
          <GridRow label="Race" value={id.breed} />
          <GridRow label="Sexe" value={id.sex === 'male' ? 'Mâle' : id.sex === 'female' ? 'Femelle' : id.sex} />
          <GridRow label="Couleur" value={id.color} />
          <GridRow label="Naissance" value={id.birthDate ? new Date(id.birthDate).toLocaleDateString('fr-FR') : '—'} />
          <GridRow label="Âge" value={id.age} />
          <GridRow label="Poids" value={id.weightKg != null ? `${id.weightKg} kg` : '—'} />
          <GridRow label="Puce électronique" value={id.microchipId} mono />
          <GridRow label="Propriétaire" value={id.ownerName} />
          {id.allergies && (
            <p style={{ marginTop: 12, padding: 12, background: '#fff7ed', borderRadius: 10, color: '#9a3412' }}>
              <AlertTriangle size={16} style={{ verticalAlign: 'middle' }} /> Allergies : {id.allergies}
            </p>
          )}
          {id.vetReferent && (
            <p style={{ marginTop: 8, color: '#0369a1' }}>
              <Shield size={14} style={{ verticalAlign: 'middle' }} /> Vétérinaire référent : {id.vetReferent}
            </p>
          )}
        </div>
      )}

      {tab === 'vaccines' && (
        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Carnet de vaccination</h2>
          {(passport?.vaccines || []).length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Aucun vaccin enregistré.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: 8 }}>Vaccin</th>
                  <th>Date</th>
                  <th>Prochain rappel</th>
                  <th>Lot</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {passport.vaccines.map((v) => {
                  const st = statusStyle[v.status] || statusStyle.up_to_date;
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{v.vaccineType}</td>
                      <td>{v.dateAdministered ? new Date(v.dateAdministered).toLocaleDateString('fr-FR') : '—'}</td>
                      <td>{v.nextDue ? new Date(v.nextDue).toLocaleDateString('fr-FR') : '—'}</td>
                      <td style={{ fontSize: 12 }}>{v.batchNumber || '—'}</td>
                      <td>
                        <span style={{ padding: '4px 8px', borderRadius: 8, background: st.bg, color: st.color, fontSize: 12, fontWeight: 700 }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Historique médical</h2>
          {(passport?.medicalHistory || []).length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Aucune entrée médicale.</p>
          ) : (
            passport.medicalHistory.map((e) => (
              <div
                key={e.id}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  borderLeft: e.isSigned ? '4px solid #10b981' : '4px solid #94a3b8',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <strong>{e.title}</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {e.visitDate ? new Date(e.visitDate).toLocaleDateString('fr-FR') : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{e.entryType}</div>
                {e.diagnosis && <p style={{ margin: '8px 0 0' }}>Diagnostic : {e.diagnosis}</p>}
                {e.treatment && <p style={{ margin: '4px 0 0' }}>Traitement : {e.treatment}</p>}
                {e.isSigned && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#059669' }}>
                    <CheckCircle2 size={12} style={{ verticalAlign: 'middle' }} /> Signé
                    {e.signedBy ? ` — ${e.signedBy}` : ''}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <p style={{ fontSize: 13 }}>
        <Link to="/medical-dossier" style={{ color: '#0ea5e9', marginRight: 16 }}>
          Dossier médical complet →
        </Link>
        <Link to="/veterinary" style={{ color: '#0ea5e9' }}>
          Prendre RDV vétérinaire →
        </Link>
      </p>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} style={tabBtnStyle(active)}>
    {icon} {label}
  </button>
);

const tabBtnStyle = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 10,
  border: active ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
  background: active ? '#eff6ff' : '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
});

const GridRow = ({ label, value, mono }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, marginBottom: 8, fontSize: 14 }}>
    <span style={{ color: '#64748b' }}>{label}</span>
    <span style={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
  </div>
);

const MiniKpi = ({ label, value, warn }) => (
  <div style={{ ...card, marginBottom: 0, textAlign: 'center', padding: 12 }}>
    <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: warn ? '#dc2626' : '#1e293b' }}>{value}</div>
  </div>
);

export default ClientPetPassportPage;
