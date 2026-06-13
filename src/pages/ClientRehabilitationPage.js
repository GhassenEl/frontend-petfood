import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Brain, Calendar, ChevronRight, PawPrint } from 'lucide-react';
import {
  fetchRehabOverview,
  fetchRehabMlAdvice,
  applyAdoption,
} from '../services/ecosystemService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const speciesEmoji = { dog: '🐶', cat: '🐱', other: '🐾' };

const ClientRehabilitationPage = () => {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adoptMsg, setAdoptMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await fetchRehabOverview({ scaredOnly: 'true' });
      setData(overview);
      const first = overview.programs?.[0];
      if (first) {
        const id = first.shelterAnimalId || first.animal?.id;
        setSelectedId((prev) => prev || id);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) return;
    fetchRehabMlAdvice(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selectedId]);

  const handleAdoptInterest = async (animalId, name) => {
    setAdoptMsg('');
    try {
      await applyAdoption({
        shelterAnimalId: animalId,
        message: `Je souhaite adopter ${name} après sa réhabilitation — foyer calme et patient.`,
      });
      setAdoptMsg('Demande envoyée — le refuge vous recontactera quand l’animal sera prêt.');
    } catch (e) {
      setAdoptMsg(e.response?.data?.error || 'Demande impossible');
    }
  };

  const programs = data?.programs || [];
  const program = detail?.program;
  const phases = data?.phases || [];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 40%, #ea580c 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Heart size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Réhabilitation — animaux abandonnés
        </h1>
        <p style={{ margin: 0, opacity: 0.92, maxWidth: 640 }}>
          Suivi des soins et traitements pour compagnons effrayés ou traumatisés : confiance, désensibilisation,
          socialisation douce, puis adoption responsable.
        </p>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement des programmes…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>Module indisponible.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
            <Kpi label="En réhabilitation" value={data.kpis?.inRehab} />
            <Kpi label="Prêts adoption" value={data.kpis?.readyForAdoption} />
            <Kpi label="Progression moy." value={`${data.kpis?.avgProgress ?? 0} %`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 1.4fr', gap: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Animaux en programme</h3>
              {programs.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Aucun animal en réhabilitation pour le moment.</p>
              ) : (
                programs.map((p) => {
                  const a = p.animal || {};
                  const id = p.shelterAnimalId || a.id;
                  const active = selectedId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: 10,
                        padding: 14,
                        borderRadius: 12,
                        border: active ? '2px solid #ea580c' : '1px solid #e2e8f0',
                        background: active ? '#fff7ed' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {speciesEmoji[a.species] || '🐾'} {a.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {p.fearLabel || `Peur niveau ${a.fearLevel}`} · {p.progressPercent} %
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          height: 6,
                          borderRadius: 4,
                          background: '#f1f5f9',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${p.progressPercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #f97316, #ea580c)',
                          }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {program && (
              <div>
                <div style={card}>
                  <h2 style={{ margin: '0 0 8px' }}>
                    {speciesEmoji[program.animal?.species]} {program.animal?.name}
                  </h2>
                  <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 14 }}>
                    {program.animal?.shelter?.name} — {program.animal?.traumaNotes || program.animal?.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    <Badge icon={<Shield size={14} />} text={program.fearLabel} color="#fef3c7" />
                    <Badge text={`Phase : ${program.phaseLabel}`} color="#ffedd5" />
                    <Badge text={`Objectif ${program.targetWeeks} sem.`} color="#f0fdf4" />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Parcours réhabilitation</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {phases.map((ph) => {
                        const done = phases.findIndex((x) => x.id === program.phase) >= ph.order - 1;
                        return (
                          <span
                            key={ph.id}
                            style={{
                              fontSize: 11,
                              padding: '4px 8px',
                              borderRadius: 8,
                              background: done ? '#fed7aa' : '#f1f5f9',
                              color: done ? '#9a3412' : '#94a3b8',
                              fontWeight: 600,
                            }}
                          >
                            {ph.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {detail?.aiSummary && (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Brain size={16} color="#7c3aed" /> Plan IA bienveillant
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {detail.aiSummary}
                      </p>
                    </div>
                  )}

                  {detail?.carePlan?.length > 0 && (
                    <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
                      {detail.carePlan.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleAdoptInterest(program.shelterAnimalId || program.animal?.id, program.animal?.name)
                    }
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <PawPrint size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Manifester mon intérêt pour l’adoption
                  </button>
                  {adoptMsg && <p style={{ marginTop: 10, fontSize: 13, color: '#059669' }}>{adoptMsg}</p>}
                </div>

                <div style={card}>
                  <h3 style={{ margin: '0 0 12px' }}>Traitements & séances</h3>
                  {(program.treatments || []).length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>Aucun traitement enregistré.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {program.treatments.map((t) => (
                        <li
                          key={t.id}
                          style={{
                            padding: '12px 0',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{t.icon || '💚'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{t.title}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{t.typeLabel}</div>
                            {t.completedAt ? (
                              <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                                <Calendar size={12} style={{ verticalAlign: 'middle' }} /> Réalisé le{' '}
                                {new Date(t.completedAt).toLocaleDateString('fr-FR')}
                                {t.performedBy ? ` — ${t.performedBy}` : ''}
                              </div>
                            ) : t.scheduledAt ? (
                              <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
                                Prévu le {new Date(t.scheduledAt).toLocaleDateString('fr-FR')}
                              </div>
                            ) : null}
                            {t.notes && <p style={{ margin: '4px 0 0', fontSize: 12 }}>{t.notes}</p>}
                          </div>
                          {t.completedAt && (
                            <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                              +{t.progressDelta}%
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <p style={{ marginTop: 20, fontSize: 13 }}>
            <Link to="/client-ecosystem" style={{ color: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={14} /> Retour refuges & écosystème
            </Link>
          </p>
        </>
      )}
    </div>
  );
};

const Kpi = ({ label, value }) => (
  <div style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800 }}>{value ?? '—'}</div>
  </div>
);

const Badge = ({ icon, text, color }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 10px',
      borderRadius: 999,
      background: color,
      fontSize: 12,
      fontWeight: 600,
    }}
  >
    {icon}
    {text}
  </span>
);

export default ClientRehabilitationPage;
