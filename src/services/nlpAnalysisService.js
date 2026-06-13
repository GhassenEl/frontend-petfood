import { postNlpAnalyze } from './mlService';

export const analyzeText = (text) =>
  postNlpAnalyze(text).then((res) => res.analysis);

export default { analyzeText };
