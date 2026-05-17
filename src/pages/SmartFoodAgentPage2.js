import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import SmartAgentAvatar from '../components/SmartAgentAvatar';

const SmartFoodAgentPage2 = () => {
  const { user } = useAuth();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerBio, setOwnerBio] = useState('');
  const [ownerDescription, setOwnerDescription] = useState('');

  const [petType, setPetType] = useState('dog');
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petNotes, setPetNotes] = useState('');

  const [goal, setGoal] = useState('maintien');
  const [allergies, setAllergies] = useState('');
  const [activityLevel, setActivityLevel] = useState('moyen');

  const [vaccines, setVaccines] = useState('');
  const [medications, setMedications] = useState('');
  const [accessories, setAccessories] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const assistantTitle = useMemo(() => 'Smart Food Agent IA', []);

  const buildContextPayload = () => {
    const payload = {
      owner: {
        name: ownerName || undefined,
        bio: ownerBio || undefined,
        description: ownerDescription || undefined,
      },
      pets: [
        {
          type: petType,
          name: petName || undefined,
          age: petAge ? Number(petAge) : undefined,
          weightKg: petWeight ? Number(petWeight) : undefined,
          breed: petBreed || undefined,
          notes: petNotes || undefined,
        },
      ],
      nutritionPreferences: {
        goal,
        allergies: allergies || undefined,
        activityLevel,
      },
      vetProfile: {
        vaccines: vaccines || undefined,
        medications: medications || undefined,
        accessories: accessories || undefined,
      },
      avatar: avatarPreviewUrl
        ? {
            previewUrl: avatarPreviewUrl,
          }
        : undefined,
    };

    const strip = (obj) => {
      if (Array.isArray(obj)) return obj.map(strip).filter(Boolean);
      if (!obj || typeof obj !== 'object') return obj;
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === '' || v === null) continue;
        const sv = strip(v);
        if (sv === undefined || sv === '' || sv === null) continue;
        out[k] = sv;
      }
      return Object.keys(out).length ? out : undefined;
    };

    return strip(payload);
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    if (!file) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreviewUrl(url);
  };

  const handleGenerate = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const context = buildContextPayload();

      const msg =
        "Génère un régime alimentaire personnalisé pour mon animal à partir de ce contexte (owner/pets/nutrition/vétérinaire). " +
        "Inclure : routine repas, quantités estimées (si possible), types d'aliments recommandés, accessoires/friandises compatibles. " +
        "Prendre en compte : vaccins, medicaments, allergies, objectif (maintien/perte/prise), niveau d'activité. " +
        "Si une validation vétérinaire est nécessaire, demande explicitement de contacter un vétérinaire et indique quoi vérifier (vaccins/medicaments/doses).";

      const res = await api.post('/chat/message', {
        message: msg,
        context,
      });

      setResult(res.data);
    } catch (e) {
      setError("Impossible de générer le régime pour le moment. Vérifie que le backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  const content = result?.message || result?.content || '';
  const quickReplies = result?.quickReplies || [];
  const products = result?.products || [];

  const needsVet = useMemo(() => {
    const contentLower = String(content).toLowerCase();
    return (
      contentLower.includes('vétérinaire') ||
      contentLower.includes('veterinaire') ||
      contentLower.includes('validation') ||
      contentLower.includes('contact')
    );
  }, [content]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: '28px 18px',
          borderRadius: 26,
          background: 'linear-gradient(135deg, rgba(236,253,245,1) 0%, rgba(209,250,229,1) 100%)',
          border: '1px solid rgba(16,185,129,0.12)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🧑‍⚕️</span>
          <h1 style={{ margin: 0, fontWeight: 900, color: '#065f46' }}>{assistantTitle}</h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontWeight: 600 }}>
          Avatar + profil owner & pets pour générer un régime alimentaire personnalisé. Inclut vaccins, medicaments et accessoires. (Validation véto si nécessaire)
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontWeight: 900, margin: '0 0 12px' }}>Avatar</h2>
          <SmartAgentAvatar
            previewUrl={avatarPreviewUrl}
            onAvatarFile={handleAvatarChange}
            label="Importer image avatar"
          />
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontWeight: 900, margin: '0 0 12px' }}>Profil (Owner + Animal)</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Nom owner</span>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="border rounded-xl px-3 py-2"
                placeholder="Ex: Lina"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Type d’animal</span>
              <select value={petType} onChange={(e) => setPetType(e.target.value)} className="border rounded-xl px-3 py-2">
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="bird">Oiseau</option>
                <option value="fish">Poisson</option>
                <option value="other">Autre</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Nom animal</span>
              <input value={petName} onChange={(e) => setPetName(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: Max" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Âge (années)</span>
              <input value={petAge} onChange={(e) => setPetAge(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: 3" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Poids (kg)</span>
              <input value={petWeight} onChange={(e) => setPetWeight(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: 12" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Race / Breed</span>
              <input value={petBreed} onChange={(e) => setPetBreed(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: Golden Retriever" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Notes animal (santé, comportement…)</span>
              <textarea value={petNotes} onChange={(e) => setPetNotes(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: sensible à l'estomac" rows={3} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Description owner</span>
              <textarea
                value={ownerDescription}
                onChange={(e) => setOwnerDescription(e.target.value)}
                className="border rounded-xl px-3 py-2"
                placeholder="Ex: je veux des repas faciles à préparer"
                rows={2}
              />
            </label>
          </div>

          <div style={{ height: 14 }} />

          <h3 style={{ fontWeight: 900, margin: '0 0 12px' }}>Nutrition (personnalisation)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Objectif</span>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="border rounded-xl px-3 py-2">
                <option value="maintien">Maintien</option>
                <option value="perte">Perte de poids</option>
                <option value="prise">Prise de poids</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Activité</span>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="border rounded-xl px-3 py-2">
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="élevé">Élevé</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Allergies / intolérances</span>
              <input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: poulet, céréales..." />
            </label>
          </div>

          <div style={{ height: 14 }} />

          <h3 style={{ fontWeight: 900, margin: '0 0 12px' }}>Vétérinaire (vaccins / medicaments / accessoires)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Vaccins (texte libre)</span>
              <input value={vaccines} onChange={(e) => setVaccines(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: rage 2024, coryza..." />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Medicaments (si any)</span>
              <input value={medications} onChange={(e) => setMedications(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: anti-inflammatoire, vermifuge..." />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Accessoires (collier/friandises autorisées…)</span>
              <input value={accessories} onChange={(e) => setAccessories(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: friandises sans céréales" />
            </label>
          </div>

          <div style={{ height: 16 }} />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: '12px 18px',
                borderRadius: 16,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #e67e22, #d35400)',
                color: 'white',
                fontWeight: 900,
                boxShadow: '0 10px 30px rgba(211,84,0,0.25)',
              }}
            >
              {loading ? 'Génération...' : 'Générer régime personnalisé'}
            </button>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError('');
              }}
              style={{
                padding: '12px 18px',
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                background: 'white',
                color: '#111827',
                fontWeight: 900,
              }}
            >
              Effacer résultat
            </button>
          </div>

          {error ? (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 14,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#b91c1c',
                fontWeight: 800,
              }}
            >
              {error}
            </div>
          ) : null}

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 24,
                background: 'white',
                borderRadius: 20,
                padding: 18,
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🧠</span>
                <h3 style={{ margin: 0, fontWeight: 800 }}>Résultat IA</h3>
              </div>

              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.55,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: '#374151',
                }}
              >
                {content}
              </pre>

              {needsVet && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    background:
                      'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(245,158,11,0.08))',
                    border: '1px solid rgba(234,179,8,0.25)',
                    borderRadius: 16,
                    color: '#92400e',
                    fontWeight: 700,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 20 }}>🩺</span>
                  <div>
                    <div style={{ marginBottom: 6 }}>Validation vétérinaire recommandée</div>
                    <div style={{ fontWeight: 600, color: '#7c2d12', fontSize: 13 }}>
                      Pour confirmer le régime (vaccins/medicaments/doses), contactez un vétérinaire.
                      Rendez-vous dans la section <strong>Vétérinaire</strong>.
                    </div>
                  </div>
                </div>
              )}

              {quickReplies.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {quickReplies.map((qr, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        background: 'rgba(230,126,34,0.08)',
                        color: '#d35400',
                        border: '1px solid rgba(230,126,34,0.2)',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {qr}
                    </span>
                  ))}
                </div>
              )}

              {products.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Suggestions produits</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {products.slice(0, 6).map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                          background: '#fafafa',
                        }}
                      >
                        <div style={{ fontSize: 18 }}>{p.icon || '📦'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: '#111827' }}>{p.name}</div>
                          {p.reason ? <div style={{ fontSize: 13, color: '#059669', marginTop: 2 }}>{p.reason}</div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SmartFoodAgentPage2;

