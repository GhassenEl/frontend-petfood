import {
  analyzeSentimentNlp,
  fuseHybridSentiment,
  runHybridContentFilter,
  analyzeWords,
} from '../utils/hybridNlpEngine';
import { postNlpAnalyze, postAnalyzeComment } from './mlService';

/** Analyse hybride NLP + deep learning avec fallback local */
export async function runHybridAnalysis(text = '', context = {}) {
  const trimmed = String(text).trim();
  const nlpLocal = analyzeSentimentNlp(trimmed);
  const filterLocal = runHybridContentFilter(trimmed, context);
  const words = analyzeWords(trimmed);

  let dlResult = null;
  let apiSource = 'local';

  try {
    const [nlpApi, sentimentApi] = await Promise.allSettled([
      postNlpAnalyze(trimmed),
      postAnalyzeComment({ comment: trimmed, rating: context.rating }),
    ]);

    if (nlpApi.status === 'fulfilled' && nlpApi.value) {
      dlResult = nlpApi.value.analysis || nlpApi.value;
      apiSource = 'ml_nlp_api';
    } else if (sentimentApi.status === 'fulfilled' && sentimentApi.value) {
      dlResult = sentimentApi.value;
      apiSource = 'ml_sentiment_api';
    }
  } catch {
    /* fallback local */
  }

  const sentiment = fuseHybridSentiment(nlpLocal, dlResult);

  return {
    text: trimmed.slice(0, 500),
    sentiment,
    words,
    filter: filterLocal,
    anomalies: filterLocal.anomaly,
    moderation: filterLocal.moderation,
    decision: filterLocal.decision,
    hybridScore: filterLocal.hybridScore,
    source: dlResult ? apiSource : 'local_hybrid',
    analyzedAt: new Date().toISOString(),
  };
}

export default { runHybridAnalysis };
