import api from '../utils/api';
import {
  DEMO_PATIENT_CONTEXT,
  DEMO_VET_MEDICAL_DOSSIERS,
  filterVetTimeline,
  withDemoFallback,
} from '../utils/vetDemoData';

const normalizeTimeline = (items = []) =>
  items.map((ev, i) => ({
    id: ev.id || `tl-${i}`,
    type: ev.type || 'consultation',
    date: ev.date || ev.createdAt || ev.visitDate,
    label: ev.label || ev.title || ev.detail || 'Événement clinique',
    detail: ev.detail,
  }));

const buildPastAnalyses = (items = []) =>
  items.map((a, i) => ({
    id: a.id || a._id || `pa-${i}`,
    urgencyClass: a.urgencyClass || 'non_urgent',
    createdAt: a.createdAt || a.date,
    summary: a.summary || a.diagnosis || a.title || 'Analyse clinique',
  }));

const resolveDossier = (raw, ownerId, petName, dossiers = []) => {
  if (raw?.dossier?.id || raw?.dossier?._id) {
    return {
      id: raw.dossier.id || raw.dossier._id,
      dossierNumber: raw.dossier.dossierNumber || raw.dossier.number || '—',
      allergies: raw.dossier.allergies || raw.profile?.pet?.allergies,
    };
  }

  const fromList = dossiers.find(
    (d) =>
      d.petName === petName &&
      (d.owner?.id === ownerId || d.ownerId === ownerId)
  );
  if (fromList) {
    return {
      id: fromList.id || fromList._id,
      dossierNumber: fromList.dossierNumber || '—',
      allergies: fromList.allergies,
    };
  }

  const pet = raw?.profile?.pet;
  if (pet?.allergies || raw?.dossierId) {
    return {
      id: raw.dossierId || null,
      dossierNumber: raw.dossierNumber || 'Dossier en cours',
      allergies: pet?.allergies,
    };
  }

  return null;
};

const mergePatientContext = (mlCtx, vetCtx, timeline, dossiers, ownerId, petName) => {
  const mergedTimeline = normalizeTimeline([
    ...(mlCtx?.timeline || []),
    ...(timeline || []),
  ]);

  const uniqueTimeline = mergedTimeline.filter(
    (ev, idx, arr) => arr.findIndex((x) => x.id === ev.id) === idx
  );

  const pastAnalyses = buildPastAnalyses(mlCtx?.pastAnalyses || []);

  const profile = mlCtx?.profile || (vetCtx ? {
    pet: {
      id: vetCtx.pet?.id,
      name: vetCtx.pet?.name || petName,
      type: vetCtx.pet?.type,
      breed: vetCtx.pet?.breed,
      weightKg: vetCtx.pet?.weight ?? vetCtx.pet?.weightKg,
      allergies: vetCtx.allergies,
      chronicConditions: vetCtx.chronicConditions,
      currentDiet: vetCtx.diet,
    },
  } : null);

  const dossier = resolveDossier(
    { ...mlCtx, profile, dossier: mlCtx?.dossier },
    ownerId,
    petName,
    dossiers
  );

  return {
    profile,
    dossier,
    timeline: uniqueTimeline,
    pastAnalyses,
    vaccinesDue: vetCtx?.vaccinesDue || [],
  };
};

/**
 * Charge le contexte patient (dossier, timeline, analyses) depuis le backend.
 */
export const fetchVetPatientContext = async ({ ownerId, petName, petId }) => {
  if (!ownerId || !petName) return null;

  const params = { ownerId, petName, ...(petId ? { petId } : {}) };

  const [mlRes, vetRes, tlRes, dossiersRes] = await Promise.allSettled([
    api.get('/ml/vet/clinical/patient-context', { params }),
    api.get('/vet/clinical/patient-context', { params }),
    api.get('/vet/clinical/timeline', { params }),
    api.get('/vet/medical-dossiers'),
  ]);

  const mlCtx = mlRes.status === 'fulfilled' ? mlRes.value.data : null;
  const vetCtx = vetRes.status === 'fulfilled' ? vetRes.value.data : null;
  const timeline = tlRes.status === 'fulfilled' ? tlRes.value.data : [];
  const dossiers = withDemoFallback(
    dossiersRes.status === 'fulfilled' ? dossiersRes.value.data : [],
    DEMO_VET_MEDICAL_DOSSIERS
  );

  const merged = mergePatientContext(mlCtx, vetCtx, timeline, dossiers, ownerId, petName);

  const hasData =
    merged.dossier ||
    merged.timeline.length > 0 ||
    merged.pastAnalyses.length > 0 ||
    merged.profile?.pet;

  if (hasData) return merged;

  const demo = { ...DEMO_PATIENT_CONTEXT };
  const demoDossier = DEMO_VET_MEDICAL_DOSSIERS.find((d) => d.petName === petName);
  if (demoDossier) {
    demo.dossier = {
      id: demoDossier.id || demoDossier._id,
      dossierNumber: demoDossier.dossierNumber,
      allergies: demoDossier.allergies,
    };
  }
  demo.timeline = filterVetTimeline(demo.timeline, ownerId, petName);
  return demo;
};
