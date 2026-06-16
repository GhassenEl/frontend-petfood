import {
  detectReviewAnomalies,
  detectContentAnomalies,
} from './contentAnomalyDetector';

export const MODERATION_ACTIONS = {
  allow: 'allow',
  flag: 'flag',
  hide: 'hide',
  reject: 'reject',
};

/** Filtrage intelligent : offensant, spam, inapproprié */
export const moderateContent = (text = '', context = {}) => {
  const reviewAnomaly = detectReviewAnomalies({
    comment: text,
    rating: context.rating,
  });
  const contentAnomaly = detectContentAnomalies(text);

  const flags = [...(reviewAnomaly.flags || []), ...(contentAnomaly.flags || [])];
  const score = (reviewAnomaly.score || 0) + (contentAnomaly.score || 0);
  const suspicious = reviewAnomaly.suspicious || contentAnomaly.suspicious;

  let action = MODERATION_ACTIONS.allow;
  if (score >= 8 || flags.some((f) => f.type === 'inappropriate')) {
    action = MODERATION_ACTIONS.reject;
  } else if (score >= 5 || suspicious) {
    action = MODERATION_ACTIONS.hide;
  } else if (score >= 3) {
    action = MODERATION_ACTIONS.flag;
  }

  const categories = [...new Set(flags.map((f) => f.type))];

  return {
    text: String(text).slice(0, 500),
    suspicious,
    score,
    action,
    categories,
    flags,
    summary:
      reviewAnomaly.summary !== 'Avis conforme'
        ? reviewAnomaly.summary
        : contentAnomaly.summary,
    reviewAnomaly,
    contentAnomaly,
  };
};

export const moderateBatch = (items = []) =>
  (items || []).map((item) => {
    const text = item.comment || item.content || item.message || '';
    const result = moderateContent(text, { rating: item.rating });
    return {
      id: item._id || item.id,
      source: item,
      ...result,
    };
  });

export default moderateContent;
