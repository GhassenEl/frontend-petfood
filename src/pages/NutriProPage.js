import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import { calculatePetCalories, PET_TYPE_LABELS, petAgeYears } from '../utils/petCalorieCalculator';
import { getPets } from '../services/userService';
import { generateNutritionPlan, formatPlanAsText, normalizePet, buildLocalNutritionPlan } from '../services/nutritionPlanService';
import { DEMO_NUTRITION_PETS } from '../utils/clientDemoData';

const NutriProPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [bodyCondition, setBodyCondition] = useState('ideal');
  const [mealCount, setMealCount] = useState('2');
  const [foodPreference, setFoodPreference] = useState('mixte');

  const [vaccines, setVaccines] = useState('');
  const [medications, setMedications] = useState('');
  const [accessories, setAccessories] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [structuredPlan, setStructuredPlan] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [savedPets, setSavedPets] = useState([]);
  const [selectedPetKey, setSelectedPetKey] = useState('manual');

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});

  const assistantTitle = useMemo(() => 'NutriPro', []);

  useEffect(() => {
    getPets()
      .then((list) => setSavedPets(list?.length ? list : DEMO_NUTRITION_PETS))
      .catch(() => setSavedPets(DEMO_NUTRITION_PETS));
  }, []);

  const applyPetToForm = useCallback((pet) => {
    if (!pet) return;
    setPetName(pet.name || '');
    setPetType(String(pet.type || pet.animalType || 'dog').toLowerCase());
    setPetBreed(pet.breed || '');
    const w = pet.weightKg ?? pet.weight;
    if (w != null && w !== '') setPetWeight(String(w));
    const age = pet.ageYears ?? petAgeYears(pet.birthDate);
    if (age != null && !Number.isNaN(age)) setPetAge(String(Math.round(age * 10) / 10));
    if (pet.allergies) {
      setAllergies(Array.isArray(pet.allergies) ? pet.allergies.join(', ') : String(pet.allergies));
    }
    if (pet.notes) setPetNotes(pet.notes);
  }, []);

  const handlePetSelect = (key) => {
    setSelectedPetKey(key);
    if (key === 'manual') return;
    const pet = savedPets.find((p) => String(p.id || p._id) === key);
    if (pet) applyPetToForm(pet);
  };

  const selectedSavedPet = useMemo(
    () => (selectedPetKey !== 'manual' ? savedPets.find((p) => String(p.id || p._id) === selectedPetKey) : null),
    [savedPets, selectedPetKey],
  );

  const ageBand = useMemo(() => {
    const age = Number(petAge || 0);
    if (!age) return 'âge non renseigné';
    if (age < 1) return 'jeune';
    if (age >= 8) return 'senior';
    return 'adulte';
  }, [petAge]);

  const calorieCalc = useMemo(
    () =>
      calculatePetCalories(
        {
          type: petType,
          weight: petWeight,
          name: petName,
        },
        {
          goal,
          activityLevel,
          mealCount: Number(mealCount) || 2,
          ageYears: petAge ? Number(petAge) : null,
          isNeutered: true,
        }
      ),
    [petType, petWeight, petName, goal, activityLevel, mealCount, petAge]
  );

  const portionNote = useMemo(() => {
    if (calorieCalc.supported) {
      return `Besoins estimés : ${calorieCalc.dailyKcal} kcal/jour (~${calorieCalc.dryFoodGramsPerDay} g croquettes), soit ${calorieCalc.gramsPerMeal} g par repas sur ${calorieCalc.mealCount} repas.`;
    }
    if (calorieCalc.needsWeight) return 'Renseignez le poids pour obtenir un calcul calorique précis.';
    return calorieCalc.message || 'Consultez la page Calories par animal pour une estimation.';
  }, [calorieCalc]);

  const localNutritionPlan = useMemo(() => {
    const petLabel = petName || 'votre animal';
    const allergyLine = allergies ? `Éviter strictement : ${allergies}.` : 'Aucune allergie renseignée.';
    const vetFlags = [
      medications ? 'médicaments déclarés' : '',
      vaccines ? 'vaccins à vérifier' : '',
      bodyCondition !== 'ideal' ? 'état corporel à suivre' : '',
    ].filter(Boolean);

    return [
      `Plan NutriPro pour ${petLabel}`,
      `Profil : ${petType}, ${ageBand}${petBreed ? `, ${petBreed}` : ''}${petWeight ? `, ${petWeight} kg` : ''}.`,
      `Objectif : ${goal}. Activité : ${activityLevel}. État corporel : ${bodyCondition}.`,
      portionNote,
      `Routine : ${mealCount || 2} repas/jour, eau fraîche disponible, transition alimentaire progressive sur 7 jours.`,
      `Préférence : ${foodPreference}. ${allergyLine}`,
      petNotes ? `Points de vigilance : ${petNotes}.` : 'Points de vigilance : surveiller appétit, selles, énergie et poids chaque semaine.',
      vetFlags.length
        ? `Validation vétérinaire conseillée : ${vetFlags.join(', ')}.`
        : 'Validation vétérinaire : utile si symptômes, traitement en cours, perte/prise de poids rapide ou changement alimentaire important.',
    ].join('\n');
  }, [activityLevel, ageBand, allergies, bodyCondition, foodPreference, goal, mealCount, medications, petBreed, petName, petNotes, petType, petWeight, portionNote, vaccines]);

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
        bodyCondition,
        mealCount: mealCount ? Number(mealCount) : undefined,
        foodPreference,
      },
      vetProfile: {
        vaccines: vaccines || undefined,
        medications: medications || undefined,
        accessories: accessories || undefined,
      },
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

  const persistPlanToBackend = async (planText, extra = {}) => {
    try {
      await api.post('/nutrition/plans', {
        planText: planText,
        petName: petName || extra.petName,
        petType: petType || extra.petType,
        goal,
        metadata: {
          activityLevel,
          bodyCondition,
          mealCount,
          foodPreference,
          allergies: allergies || undefined,
        },
        source: 'nutripro',
      });
      return true;
    } catch (e) {
      console.error('persistPlanToBackend:', e);
      return false;
    }
  };

  const handleGenerate = async () => {
    setError('');
    setResult(null);
    setStructuredPlan(null);

    if (!petName.trim()) {
      setError('Indiquez le nom de l\'animal.');
      return;
    }
    if (!petWeight || Number(petWeight) <= 0) {
      setError('Renseignez le poids (kg) pour calculer calories et portions.');
      return;
    }

    setLoading(true);

    try {
      const context = buildContextPayload();
      const pet = normalizePet({
        ...(selectedSavedPet || {}),
        id: selectedSavedPet?.id || selectedSavedPet?._id,
        name: petName.trim(),
        type: petType,
        weight: petWeight,
        breed: petBreed,
        ageYears: petAge ? Number(petAge) : undefined,
        notes: petNotes,
        allergies,
      });

      const msg =
        "Génère un plan alimentaire professionnel, concret et personnalisé pour mon animal. " +
        "Structure la réponse en sections courtes : profil, objectif, portions de départ, routine repas, aliments recommandés, aliments à éviter, suivi hebdomadaire, validation vétérinaire. " +
        "Utilise le contexte fourni et complète avec prudence. Ne donne pas de diagnostic médical. " +
        "Si vaccins, médicaments, allergies, poids inhabituel ou symptômes sont mentionnés, recommande une consultation vétérinaire et liste les points à valider.";

      const structured = await generateNutritionPlan({
        pet,
        options: {
          activityLevel,
          goal,
          mealCount: Number(mealCount) || 2,
          bodyCondition,
          isNeutered: true,
        },
        useAi: true,
        aiContext: context,
        aiMessage: msg,
      });

      setStructuredPlan(structured);
      const backendMessage = structured.aiPlan || formatPlanAsText(structured) || localNutritionPlan;

      setResult({
        message: backendMessage,
        localPlan: localNutritionPlan,
        shouldShowVetCTA: !!structured.shouldShowVetCTA,
        products: structured.aiProducts || structured.productRecommendations?.food || [],
        quickReplies: [],
      });
      const saved = await persistPlanToBackend(backendMessage);
      if (saved) setToast({ message: 'Plan généré et sauvegardé dans votre historique', type: 'success' });
      try {
        const ctx = buildContextPayload();
        if (ctx?.nutritionPreferences) {
          localStorage.setItem('nutri:preferences', JSON.stringify(ctx.nutritionPreferences));
          localStorage.setItem('nutripro:preferences', JSON.stringify(ctx.nutritionPreferences));
        }
        if (ctx?.pets && ctx.pets[0]) {
          localStorage.setItem('nutri:pet', JSON.stringify(ctx.pets[0]));
          localStorage.setItem('nutripro:pet', JSON.stringify(ctx.pets[0]));
        }
      } catch (e) {}
    } catch (e) {
      const structured = buildLocalNutritionPlan(
        normalizePet({
          name: petName,
          type: petType,
          weight: petWeight,
          breed: petBreed,
          ageYears: petAge ? Number(petAge) : undefined,
          allergies,
        }),
        { activityLevel, goal, mealCount: Number(mealCount) || 2, bodyCondition }
      );
      setStructuredPlan(structured);
      setResult({
        message: formatPlanAsText(structured) || localNutritionPlan,
        localPlan: localNutritionPlan,
        quickReplies: [],
        products: structured.productRecommendations?.food || [],
      });
      setError("Le backend IA est indisponible. Plan local généré à partir du profil renseigné.");
      await persistPlanToBackend(localNutritionPlan);
    } finally {
      setLoading(false);
    }
  };

  const sendToVet = () => {
    const messageToSend = result?.localPlan || result?.message || localNutritionPlan;
    try {
      sessionStorage.setItem('nutri:message', messageToSend);
      sessionStorage.setItem('nutripro:message', messageToSend);
      const pet = { name: petName, type: petType };
      sessionStorage.setItem('nutri:pet', JSON.stringify(pet));
      sessionStorage.setItem('nutripro:pet', JSON.stringify(pet));
    } catch (e) {}
    const qs = new URLSearchParams({ prefill: 'nutripro' }).toString();
    navigate(`/veterinary?${qs}`);
  };

  const savePlan = async () => {
    try {
      const planText = result?.localPlan || result?.message || localNutritionPlan;
      const ok = await persistPlanToBackend(planText);
      if (ok) {
        setToast({ message: 'Plan sauvegardé dans votre historique', type: 'success' });
        return;
      }
      const plans = JSON.parse(localStorage.getItem('nutripro:plans') || '[]');
      const entry = { id: Date.now(), date: new Date().toISOString(), petName, petType, goal, plan: planText };
      plans.unshift(entry);
      localStorage.setItem('nutripro:plans', JSON.stringify(plans));
      setToast({ message: 'Plan sauvegardé localement', type: 'success' });
    } catch (e) {
      setToast({ message: 'Impossible de sauvegarder le plan', type: 'error' });
    }
  };

  const openHistory = () => navigate('/nutripro-history');

  const content = result?.message || result?.content || '';
  const quickReplies = result?.quickReplies || [];
  const products = result?.products || [];

  const needsVet = useMemo(() => {
    if (result?.shouldShowVetCTA) return true;
    const contentLower = String(content).toLowerCase();
    return (
      contentLower.includes('vétérinaire') ||
      contentLower.includes('veterinaire') ||
      contentLower.includes('validation') ||
      contentLower.includes('contact')
    );
  }, [content, result?.shouldShowVetCTA]);

  // Onboarding UI handlers
  const onboardingNext = (answers = {}) => {
    const next = onboardingStep + 1;
    setOnboardingAnswers((s) => ({ ...s, ...answers }));
    setOnboardingStep(next);
    // apply answers to state when finishing
    if (next === 3) {
      const a = { ...onboardingAnswers, ...answers };
      if (a.goal) setGoal(a.goal);
      if (a.activityLevel) setActivityLevel(a.activityLevel);
      if (a.mealCount) setMealCount(a.mealCount);
      if (a.allergies) setAllergies(a.allergies);
      setToast({ message: "Onboarding terminé — vous pouvez générer le plan", type: 'success' });
    }
  };

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
          <img src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${encodeURIComponent('nutripro-expert')}&backgroundType=gradientLinear&gradientRotation=45&radius=20`} alt="NutriPro avatar" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <h1 style={{ margin: 0, fontWeight: 900, color: '#065f46' }}>{assistantTitle}</h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontWeight: 600 }}>
          Plan nutritionnel professionnel et dynamique pour votre compagnon — guidé par NutriPro et assisté par IA.
        </p>
      </motion.div>

      {/* Onboarding flow */}
      {onboardingStep < 3 ? (
        <div style={{ background: 'white', borderRadius: 14, padding: 18, marginBottom: 18, border: '1px solid rgba(0,0,0,0.04)' }}>
          {onboardingStep === 0 && (
            <div>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Bienvenue — commençons</h3>
              <p style={{ color: '#6b7280' }}>Quelques questions rapides pour personnaliser NutriPro.</p>
              <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <select defaultValue={goal} onChange={(e) => setOnboardingAnswers((s) => ({ ...s, goal: e.target.value }))} style={{ padding: 10, borderRadius: 10 }}>
                  <option value="maintien">Maintien</option>
                  <option value="perte">Perte de poids</option>
                  <option value="prise">Prise de poids</option>
                </select>
                <select defaultValue={activityLevel} onChange={(e) => setOnboardingAnswers((s) => ({ ...s, activityLevel: e.target.value }))} style={{ padding: 10, borderRadius: 10 }}>
                  <option value="faible">Faible activité</option>
                  <option value="moyen">Activité moyenne</option>
                  <option value="élevé">Activité élevée</option>
                </select>
              </label>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => onboardingNext()} style={{ padding: '10px 14px', borderRadius: 10, background: '#10b981', color: 'white', border: 'none' }}>Suivant</button>
              </div>
            </div>
          )}

          {onboardingStep === 1 && (
            <div>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Allergies & repas</h3>
              <p style={{ color: '#6b7280' }}>Indiquez allergies / intolérances et nombre de repas par jour.</p>
              <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input placeholder="Allergies (ex: poulet)" onChange={(e) => setOnboardingAnswers((s) => ({ ...s, allergies: e.target.value }))} style={{ padding: 10, borderRadius: 10 }} />
                <input type="number" min={1} max={6} defaultValue={mealCount} onChange={(e) => setOnboardingAnswers((s) => ({ ...s, mealCount: e.target.value }))} style={{ padding: 10, borderRadius: 10, width: 120 }} />
              </label>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setOnboardingStep(0)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', marginRight: 8 }}>Précédent</button>
                <button onClick={() => onboardingNext()} style={{ padding: '10px 14px', borderRadius: 10, background: '#10b981', color: 'white', border: 'none' }}>Suivant</button>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Prêt</h3>
              <p style={{ color: '#6b7280' }}>Confirmez pour finaliser le profil NutriPro et ouvrir le générateur.</p>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setOnboardingStep(1)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', marginRight: 8 }}>Précédent</button>
                <button onClick={() => onboardingNext(onboardingAnswers)} style={{ padding: '10px 14px', borderRadius: 10, background: '#e67e22', color: 'white', border: 'none' }}>Finaliser & commencer NutriPro</button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 18, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontWeight: 900, margin: '0 0 12px' }}>Profil animal</h2>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Choisir un animal enregistré</span>
            <select
              value={selectedPetKey}
              onChange={(e) => handlePetSelect(e.target.value)}
              className="border rounded-xl px-3 py-2"
            >
              <option value="manual">✏️ Saisie libre (nouvel animal)</option>
              {savedPets.map((p) => (
                <option key={p.id || p._id} value={String(p.id || p._id)}>
                  {PET_TYPE_LABELS[p.type] || p.type} — {p.name}
                </option>
              ))}
            </select>
          </label>

          {/* form fields (same as before) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Nom propriétaire</span>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: Lina" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Type d’animal</span>
              <select value={petType} onChange={(e) => setPetType(e.target.value)} className="border rounded-xl px-3 py-2">
                {Object.entries(PET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
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
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Contraintes du propriétaire</span>
              <textarea value={ownerDescription} onChange={(e) => setOwnerDescription(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: je veux des repas faciles à préparer" rows={2} />
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>État corporel</span>
              <select value={bodyCondition} onChange={(e) => setBodyCondition(e.target.value)} className="border rounded-xl px-3 py-2">
                <option value="maigre">Trop maigre</option>
                <option value="ideal">Idéal</option>
                <option value="surpoids">Surpoids</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Repas par jour</span>
              <input type="number" min="1" max="6" value={mealCount} onChange={(e) => setMealCount(e.target.value)} className="border rounded-xl px-3 py-2" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Type d'alimentation</span>
              <select value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)} className="border rounded-xl px-3 py-2">
                <option value="croquettes">Croquettes</option>
                <option value="pâtée">Pâtée</option>
                <option value="mixte">Mixte</option>
                <option value="spécifique vétérinaire">Spécifique vétérinaire</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Allergies / intolérances</span>
              <input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Ex: poulet, céréales..." />
            </label>
          </div>

          <div style={{ height: 14 }} />

          <h3 style={{ fontWeight: 900, margin: '0 0 12px' }}>Données vétérinaires utiles</h3>
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
            <button type="button" onClick={handleGenerate} disabled={loading} style={{ padding: '12px 18px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #e67e22, #d35400)', color: 'white', fontWeight: 900, boxShadow: '0 10px 30px rgba(211,84,0,0.25)' }}>{loading ? 'Génération...' : 'Générer le plan NutriPro'}</button>

            <button type="button" onClick={() => { setResult(null); setError(''); }} style={{ padding: '12px 18px', borderRadius: 16, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', background: 'white', color: '#111827', fontWeight: 900 }}>Effacer résultat</button>
          </div>

          {error ? (<div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c', fontWeight: 800 }}>{error}</div>) : null}

          {result ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, background: 'white', borderRadius: 20, padding: 18, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🥗</span>
                <h3 style={{ margin: 0, fontWeight: 800 }}>Plan nutritionnel NutriPro</h3>
              </div>

              {result.localPlan && content !== result.localPlan ? (<div style={{ marginBottom: 14, padding: 14, borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#065f46', whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: 14 }}>{result.localPlan}</div>) : null}

              {structuredPlan?.calories?.supported && (
                <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <div style={{ fontWeight: 800, marginBottom: 8, color: '#9a3412' }}>📊 Plan structuré (backend)</div>
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: '#7c2d12' }}>
                    {structuredPlan.calories.dailyKcal} kcal/j · {structuredPlan.calories.dryFoodGramsPerDay} g/jour · {structuredPlan.calories.gramsPerMeal} g × {structuredPlan.calories.mealCount} repas
                  </p>
                  {(structuredPlan.mealPlan || []).length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f' }}>
                      {structuredPlan.mealPlan.map((m) => (
                        <li key={`${m.time}-${m.label}`}>{m.time} — {m.label} : {m.portion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.55, fontFamily: 'inherit', fontSize: 14, color: '#374151' }}>{content}</pre>

              {needsVet && (<div style={{ marginTop: 16, padding: 14, background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(245,158,11,0.08))', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 16, color: '#92400e', fontWeight: 700, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>🩺</span>
                <div>
                  <div style={{ marginBottom: 6 }}>Validation vétérinaire recommandée</div>
                  <div style={{ fontWeight: 600, color: '#7c2d12', fontSize: 13 }}>Pour confirmer le plan nutritionnel (vaccins/médicaments/doses), prenez un rendez-vous ou envoyez une demande au vétérinaire.</div>
                  <button type="button" onClick={() => navigate('/veterinary')} style={{ marginTop: 10, padding: '8px 12px', borderRadius: 12, border: 'none', background: '#e67e22', color: 'white', fontWeight: 900, cursor: 'pointer' }}>Ouvrir consultations & RDV</button>
                </div>
              </div>)}

              {result && (<div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <button type="button" onClick={sendToVet} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#10b981', color: 'white', fontWeight: 900, cursor: 'pointer' }}>Envoyer le plan au vétérinaire</button>
                <button type="button" onClick={() => { try { sessionStorage.setItem('nutri:message', result?.localPlan || result?.message || localNutritionPlan); } catch (e) {} navigate('/veterinary?prefill=nutri'); }} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'white', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>Ouvrir et pré-remplir la demande</button>
              </div>)}

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={savePlan} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#2563eb', color: 'white', fontWeight: 900, cursor: 'pointer' }}>Sauvegarder le plan</button>
                <button onClick={openHistory} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'white', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>Voir historique NutriPro</button>
              </div>

              {quickReplies.length > 0 && (<div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>{quickReplies.map((qr, i) => (<span key={i} style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(230,126,34,0.08)', color: '#d35400', border: '1px solid rgba(230,126,34,0.2)', fontSize: 12, fontWeight: 700 }}>{qr}</span>))}</div>)}

              {products.length > 0 && (<div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Suggestions produits</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {products.slice(0, 6).map((p, idx) => (<div key={idx} style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fafafa' }}>
                        <div style={{ fontSize: 18 }}>{p.icon || '📦'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: '#111827' }}>{p.name}</div>
                          {p.reason ? <div style={{ fontSize: 13, color: '#059669', marginTop: 2 }}>{p.reason}</div> : null}
                        </div>
                      </div>))}
                </div>
              </div>)}
            </motion.div>
          ) : null}
        </div>
      </div>

      {toast.message ? (<Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />) : null}
    </div>
  );
};

export default NutriProPage;
