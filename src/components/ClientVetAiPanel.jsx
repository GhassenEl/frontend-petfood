import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Pill, Activity } from 'lucide-react';
import { sendVetHealthAssist } from '../services/chatService';
import { getPetPhoto, PET_EMOJI, PET_LABEL } from '../utils/petAvatars';

const MODES = [
  {
    id: 'diagnostic',
    label: 'Diagnostic',
    icon: Stethoscope,
    color: '#0ea5e9',
    prompt: (pet, text) =>
      `Aide-moi à analyser les symptômes de mon ${PET_LABEL[pet?.type] || 'animal'} ${pet?.name ? pet.name : ''} : ${text}. Propose un diagnostic préliminaire et indique si une consultation urgente est nécessaire.`,
  },
  {
    id: 'ordonnance',
    label: 'Ordonnance',
    icon: Pill,
    color: '#8b5cf6',
    prompt: (pet, text) =>
      `Pour mon ${PET_LABEL[pet?.type] || 'animal'} ${pet?.name || ''}, contexte : ${text}. Explique quels types de traitements ou médicaments un vétérinaire pourrait prescrire et les précautions à respecter.`,
  },
  {
    id: 'suivi',
    label: 'Suivi',
    icon: Activity,
    color: '#059669',
    prompt: (pet, text) =>
      `Plan de suivi pour mon ${PET_LABEL[pet?.type] || 'animal'} ${pet?.name || ''} : ${text}. Indique les signes à surveiller, la fréquence des contrôles et quand reconsulter.`,
  },
];

const card = {
  background: 'white',
  borderRadius: 18,
  padding: 20,
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const DIAGNOSTIC_EXAMPLES = [
  'Mon chien vomit depuis 2 jours, fièvre, refuse de manger',
  'Mon chat se gratte beaucoup avec des rougeurs sur le ventre',
  'Mon chien boite sur la patte arrière droite depuis hier',
];

const ClientVetAiPanel = ({ selectedPet, prescriptions = [], consultations = [] }) => {
  const [mode, setMode] = useState('diagnostic');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  const runAssist = async (e) => {
    e?.preventDefault();
    if (!symptoms.trim()) {
      setError('Décrivez les symptômes ou votre question.');
      return;
    }
    setError('');
    setLoading(true);
    setReply('');

    const modeConfig = MODES.find((m) => m.id === mode);
    const message = modeConfig.prompt(selectedPet, symptoms.trim());

    try {
      const data = await sendVetHealthAssist({
        message,
        mode,
        pet: selectedPet,
      });
      setReply(data.message || data.content || 'Réponse indisponible.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Assistant indisponible. Réessayez ou contactez un vétérinaire.');
    } finally {
      setLoading(false);
    }
  };

  const openFullAssistant = () => {
    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>🩺 Assistant santé vétérinaire</h2>
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
          Orientation préliminaire — ne remplace pas un diagnostic vétérinaire. En cas d&apos;urgence, contactez un cabinet.
        </p>

        {selectedPet ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
            padding: 12, background: '#f0f9ff', borderRadius: 14,
          }}>
            <img
              src={getPetPhoto(selectedPet.type || selectedPet.animalType)}
              alt=""
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 800 }}>{selectedPet.name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {PET_EMOJI[selectedPet.type]} {PET_LABEL[selectedPet.type] || selectedPet.type}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#92400e', background: '#fffbeb', padding: 12, borderRadius: 12, marginBottom: 16 }}>
            Sélectionnez un animal ci-dessus pour personnaliser l&apos;analyse.
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: `2px solid ${active ? m.color : '#e5e7eb'}`,
                  background: active ? `${m.color}14` : 'white',
                  color: active ? m.color : '#374151',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} /> {m.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={runAssist}>
          {mode === 'diagnostic' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {DIAGNOSTIC_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setSymptoms(ex)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: '1px solid #bae6fd',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={
              mode === 'diagnostic'
                ? 'Ex: Mon chat vomit depuis 2 jours, mange moins, est fatigué…'
                : mode === 'ordonnance'
                  ? 'Ex: Infection cutanée légère, antibiotique prescrit la semaine dernière…'
                  : 'Ex: Opération récente, contrôle dans 10 jours, surveiller la cicatrisation…'
            }
            style={{
              width: '100%',
              minHeight: 100,
              padding: 14,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>{error}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: '#0ea5e9',
                color: 'white',
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Analyse…' : `Lancer ${MODES.find((m) => m.id === mode)?.label}`}
            </button>
            <button
              type="button"
              onClick={openFullAssistant}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: '2px solid #10b981',
                background: 'white',
                color: '#059669',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Ouvrir l&apos;assistant complet
            </button>
          </div>
        </form>

        {reply && (
          <div style={{
            marginTop: 16,
            padding: 16,
            background: '#f8fafc',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            fontSize: 14,
            lineHeight: 1.65,
            color: '#334155',
            whiteSpace: 'pre-wrap',
          }}>
            {reply}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>💊 Ordonnances vétérinaires</h3>
          {prescriptions.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              Aucune ordonnance. Elles apparaîtront après validation par le vétérinaire.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151' }}>
              {prescriptions.slice(0, 3).map((rx) => (
                <li key={rx.id || rx._id} style={{ marginBottom: 6 }}>
                  {rx.petName} — {new Date(rx.createdAt).toLocaleDateString('fr-FR')}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={card}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>🔬 Consultations & analyses</h3>
          {consultations.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              Aucun compte-rendu publié pour le moment.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151' }}>
              {consultations.slice(0, 3).map((c) => (
                <li key={c.id || c._id} style={{ marginBottom: 6 }}>
                  {c.petName} — {c.diagnosis ? c.diagnosis.slice(0, 40) : 'Consultation'}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={card}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>📁 Dossier médical</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
            Historique clinique signé par votre vétérinaire.
          </p>
          <Link
            to="/medical-dossier"
            style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#ecfdf5',
              color: '#047857',
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Voir mes dossiers →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientVetAiPanel;
