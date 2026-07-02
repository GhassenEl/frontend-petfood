import { ROLE_PIPELINE_META } from './recommendationDemoData';

const STEP_LABELS = {
  content_based: 'Filtrage contenu',
  collaborative_filtering: 'Filtrage collaboratif',
  review_nlp_filter: 'NLP avis',
  hybrid_blend: 'Fusion hybride',
  profile: 'Profil contenu',
  similar: 'Utilisateurs similaires',
  content: 'Filtrage contenu',
  collab: 'Filtrage collaboratif',
  fusion: 'Fusion hybride',
  nlp: 'NLP avis',
};

const DEFAULT_WEIGHTS = { content: 0.55, collaborative: 0.45 };

/** Normalise la réponse API / pipeline pour l'UI (évite crash si pipeline incomplet). */
export const normalizeRecommendationPack = (pack, role = 'client') => {
  if (!pack) return null;

  const normalizedRole = role === 'veterinarian' ? 'vet' : role;
  const meta = ROLE_PIPELINE_META[normalizedRole] || ROLE_PIPELINE_META.client;
  const weights = pack.pipeline?.weights || {
    content: meta.contentWeight ?? DEFAULT_WEIGHTS.content,
    collaborative: meta.collabWeight ?? DEFAULT_WEIGHTS.collaborative,
  };

  const rawSteps = pack.pipeline?.steps || [];
  const steps = rawSteps.map((step, idx) => {
    if (typeof step === 'string') {
      return {
        id: step,
        label: STEP_LABELS[step] || step,
        status: 'done',
      };
    }
    return {
      id: step.id || `step-${idx}`,
      label: step.label || STEP_LABELS[step.id] || 'Étape',
      status: step.status || 'done',
      detail: step.detail,
      weight: step.weight,
    };
  });

  if (!steps.length) {
    steps.push(
      { id: 'content', label: 'Filtrage contenu', status: 'done', weight: weights.content },
      { id: 'collab', label: 'Filtrage collaboratif', status: 'done', weight: weights.collaborative },
      { id: 'fusion', label: 'Fusion hybride', status: 'done' },
    );
  }

  return {
    ...pack,
    role: pack.role || normalizedRole,
    recommendations: Array.isArray(pack.recommendations) ? pack.recommendations : [],
    similarUsers: pack.similarUsers || pack.similarClients || [],
    pipeline: { weights, steps },
    meta,
  };
};

export default normalizeRecommendationPack;
