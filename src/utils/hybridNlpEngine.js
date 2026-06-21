import { moderateContent } from './autoModerationFilter';
import { detectContentAnomalies, detectReviewAnomalies } from './contentAnomalyDetector';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const POSITIVE = [
  'excellent', 'super', 'parfait', 'adore', 'genial', 'merveilleux', 'top', 'satisfait',
  'rapide', 'qualite', 'recommande', 'content', 'heureux', 'formidable', 'magnifique',
];
const NEGATIVE = [
  'mauvais', 'nul', 'horrible', 'decevant', 'frustr', 'deçu', 'catastrophe', 'refuse',
  'retard', 'arnaque', 'dechire', 'plainte', 'insatisfait', 'deçue', 'colere',
];
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'est', 'a', 'au', 'en', 'pour',
  'mon', 'ma', 'mes', 'je', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'ce', 'cette',
]);

/** Tokenisation simple + fréquences */
export const analyzeWords = (text = '') => {
  const raw = String(text).trim();
  const tokens = normalize(raw)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq = {};
  tokens.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });

  const matchedPositive = POSITIVE.filter((w) => normalize(raw).includes(w));
  const matchedNegative = NEGATIVE.filter((w) => normalize(raw).includes(w));

  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));

  return {
    tokenCount: tokens.length,
    uniqueWords: Object.keys(freq).length,
    topWords,
    positiveHits: matchedPositive,
    negativeHits: matchedNegative,
    polarityScore: matchedPositive.length - matchedNegative.length,
  };
};

/** Couche NLP règles + lexique */
export const analyzeSentimentNlp = (text = '') => {
  const words = analyzeWords(text);
  const { polarityScore, positiveHits, negativeHits } = words;

  let label = 'neutral';
  let confidence = 0.55;
  if (polarityScore >= 2) {
    label = 'positive';
    confidence = Math.min(0.95, 0.6 + polarityScore * 0.08);
  } else if (polarityScore <= -2) {
    label = 'negative';
    confidence = Math.min(0.95, 0.6 + Math.abs(polarityScore) * 0.08);
  } else if (polarityScore === 1) {
    label = 'positive';
    confidence = 0.62;
  } else if (polarityScore === -1) {
    label = 'negative';
    confidence = 0.62;
  }

  return {
    label,
    confidence: Math.round(confidence * 1000) / 1000,
    method: 'nlp_lexicon',
    positiveHits,
    negativeHits,
    words,
  };
};

/** Fusion hybride NLP + deep learning (scores API ou heuristique dense) */
export const fuseHybridSentiment = (nlpResult, dlResult = null) => {
  if (!dlResult) {
    return { ...nlpResult, hybridScore: nlpResult.confidence, source: 'nlp_only' };
  }

  const dlLabel = dlResult.sentiment || dlResult.label || dlResult.emotion || 'neutral';
  const dlScore = Number(dlResult.confidence ?? dlResult.score ?? 0.7);
  const nlpWeight = 0.35;
  const dlWeight = 0.65;

  const labelVotes = { positive: 0, negative: 0, neutral: 0 };
  labelVotes[nlpResult.label] = (labelVotes[nlpResult.label] || 0) + nlpWeight;
  const dlNorm = ['happy', 'satisfied', 'positive'].includes(dlLabel)
    ? 'positive'
    : ['frustrated', 'disappointed', 'negative'].includes(dlLabel)
      ? 'negative'
      : 'neutral';
  labelVotes[dlNorm] = (labelVotes[dlNorm] || 0) + dlWeight;

  const fusedLabel = Object.entries(labelVotes).sort((a, b) => b[1] - a[1])[0][0];
  const hybridScore = Math.round((nlpResult.confidence * nlpWeight + dlScore * dlWeight) * 1000) / 1000;

  return {
    label: fusedLabel,
    confidence: hybridScore,
    source: 'hybrid_nlp_dl',
    nlp: nlpResult,
    deepLearning: {
      label: dlNorm,
      raw: dlLabel,
      confidence: dlScore,
      model: dlResult.model || dlResult.method || 'bert_multilingual',
      stars: dlResult.stars,
    },
  };
};

/** Filtrage hybride complet : modération + sentiment + anomalies */
export const runHybridContentFilter = (text = '', context = {}) => {
  const moderation = moderateContent(text, context);
  const anomaly = context.rating != null
    ? detectReviewAnomalies({ comment: text, rating: context.rating })
    : detectContentAnomalies(text);
  const sentiment = analyzeSentimentNlp(text);
  const words = sentiment.words;

  const hybridScore = Math.round(
    (moderation.score || 0) * 0.4
    + (anomaly.score || 0) * 0.35
    + (sentiment.label === 'negative' ? 2 : 0) * 0.25,
  );

  let decision = 'allow';
  if (moderation.action === 'reject' || anomaly.severity === 'high') decision = 'block';
  else if (moderation.action === 'hide' || anomaly.suspicious) decision = 'review';
  else if (moderation.action === 'flag' || sentiment.label === 'negative') decision = 'flag';

  return {
    decision,
    hybridScore,
    safe: decision === 'allow',
    blocked: decision === 'block',
    sentiment,
    words,
    moderation,
    anomaly,
    summary: moderation.summary || anomaly.summary || 'Contenu analysé',
    layers: {
      nlpRules: moderation.flags?.length || 0,
      anomalyFlags: anomaly.flags?.length || 0,
      sentiment: sentiment.label,
    },
  };
};

export default {
  analyzeWords,
  analyzeSentimentNlp,
  fuseHybridSentiment,
  runHybridContentFilter,
};
