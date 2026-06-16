import api from '../utils/api';
import { detectContentAnomalies, detectReviewAnomalies } from '../utils/contentAnomalyDetector';
import { moderateContent } from '../utils/autoModerationFilter';

/** Scan texte utilisateur — API backend avec fallback heuristique local. */
export async function scanUserContent(text = '', context = {}) {
  try {
    const { data } = await api.post('/security/scan', { text, context });
    if (data) {
      return {
        safe: data.safe !== false && !data.blocked,
        blocked: Boolean(data.blocked),
        threats: data.threats || data.matches || [],
        summary: data.summary || data.message || '',
        source: 'api',
      };
    }
  } catch {
    /* fallback local */
  }

  const moderation = moderateContent(text, context);
  const anomaly = context.rating != null
    ? detectReviewAnomalies({ comment: text, rating: context.rating })
    : detectContentAnomalies(text);

  return {
    safe: !moderation.suspicious || moderation.action === 'allow',
    blocked: moderation.action === 'reject',
    action: moderation.action,
    threats: moderation.flags || anomaly.flags || [],
    summary: moderation.summary || anomaly.summary,
    score: moderation.score,
    source: 'local',
  };
}

/** Bloque la soumission si contenu dangereux — retourne { allowed, scan }. */
export async function assertContentSafe(text, context = {}) {
  const scan = await scanUserContent(text, context);
  const allowed = scan.safe && !scan.blocked;
  return { allowed, scan };
}

export default scanUserContent;
