import { detectFraudSignals } from './fraudDetectionEngine';
import { detectBehaviorAnomalies, detectContentAnomalies } from './contentAnomalyDetector';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Détecte activités suspectes pour la modération. */
export const detectSuspiciousActivities = ({
  users = [],
  orders = [],
  posts = [],
  reviews = [],
  events = [],
} = {}) => {
  const incidents = [];

  const fraudAlerts = detectFraudSignals({ orders, events });
  fraudAlerts.forEach((a) => {
    incidents.push({
      id: a.id,
      type: 'fraudulent_order',
      severity: a.severity,
      title: a.title,
      detail: a.detail,
      score: a.score,
      suggestedAction: a.suggestedAction,
    });
  });

  const byDay = new Map();
  (users || []).forEach((u) => {
    const day = String(u.createdAt || '').slice(0, 10);
    if (day) byDay.set(day, (byDay.get(day) || 0) + 1);
  });
  byDay.forEach((count, day) => {
    if (count >= 5) {
      incidents.push({
        id: `mass-signup-${day}`,
        type: 'mass_accounts',
        severity: 'high',
        title: 'Création massive de comptes',
        detail: `${count} comptes créés le ${day}`,
        score: 85,
        suggestedAction: 'Vérifier les inscriptions et activer CAPTCHA',
      });
    }
  });

  const contentMap = new Map();
  (posts || []).forEach((p) => {
    const key = normalize(p.content || p.text || '').slice(0, 80);
    if (key.length >= 20) contentMap.set(key, (contentMap.get(key) || 0) + 1);
  });
  (reviews || []).forEach((r) => {
    const key = normalize(r.comment || '').slice(0, 80);
    if (key.length >= 15) contentMap.set(key, (contentMap.get(key) || 0) + 1);
  });
  contentMap.forEach((count, text) => {
    if (count >= 3) {
      incidents.push({
        id: `repeat-${text.slice(0, 20)}`,
        type: 'repetitive_posts',
        severity: 'medium',
        title: 'Publications répétitives',
        detail: `Contenu dupliqué ${count} fois : « ${text.slice(0, 60)}… »`,
        score: 72,
        suggestedAction: 'Investiguer comptes liés et limiter le spam',
      });
    }
  });

  const behavior = detectBehaviorAnomalies(
    events.length
      ? events
      : [
          { type: 'review_burst', count: 6 },
          { type: 'refund_abuse', count: 3 },
        ],
  );
  if (behavior.suspicious) {
    behavior.flags.forEach((f, i) => {
      incidents.push({
        id: `behavior-${i}`,
        type: 'behavior_anomaly',
        severity: behavior.severity,
        title: 'Comportement inhabituel',
        detail: f.reason,
        score: 60 + f.weight * 5,
        suggestedAction: 'Analyser le profil utilisateur concerné',
      });
    });
  }

  (posts || []).concat(reviews.map((r) => ({ content: r.comment }))).forEach((item, i) => {
    const anomaly = detectContentAnomalies(item.content || item.text || '');
    if (anomaly.suspicious && anomaly.flags.some((f) => f.type === 'advertising')) {
      incidents.push({
        id: `ad-abuse-${i}`,
        type: 'advertising',
        severity: anomaly.severity,
        title: 'Publicité abusive',
        detail: anomaly.summary,
        score: 55 + anomaly.score * 3,
        suggestedAction: 'Masquer le contenu et avertir l\'utilisateur',
      });
    }
  });

  return incidents
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);
};

export default detectSuspiciousActivities;
