import { analyzeSentimentNlp } from './hybridNlpEngine';
import { emotionMeta } from '../constants/ownerEmotions';

const EMOTION_FROM_SENTIMENT = {
  positive: 'satisfied',
  negative: 'frustrated',
  neutral: 'neutral',
};

/** Payload NLP compact pour ChatNlpInsight (mode local / fallback). */
export const buildLocalChatNlp = (text = '', role = 'visitor') => {
  const sentiment = analyzeSentimentNlp(text);
  const emotion = EMOTION_FROM_SENTIMENT[sentiment.label] || 'neutral';
  const meta = emotionMeta(emotion);

  return {
    emotion,
    emotionLabel: meta.label,
    emotionEmoji: meta.emoji,
    sentiment: sentiment.label,
    modelLabel: role === 'vendor' ? 'NLP vendeur (local)' : 'NLP lexique',
    confidence: sentiment.confidence,
    keywords: {
      positive: (sentiment.positiveHits || []).slice(0, 4),
      negative: (sentiment.negativeHits || []).slice(0, 4),
    },
    topTerms: (sentiment.words?.topWords || []).slice(0, 5).map((w) => ({ word: w.word, count: w.count })),
    anomaly: { detected: false },
  };
};

export default { buildLocalChatNlp };
