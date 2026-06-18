/** Normalise les points de séries pour Recharts (primary / secondary / name / time). */

const pickNum = (...candidates) => {
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

export const normalizeChartPoint = (point = {}) => ({
  name: String(point.name ?? point.label ?? point.day ?? ''),
  primary: pickNum(point.primary, point.count, point.actions, point.value, point.volume, point.rdv),
  secondary: pickNum(point.secondary, point.resolved, point.cases, point.commission, point.consultations),
});

export const normalizeLivePoint = (point = {}) => ({
  time: String(point.time ?? point.label ?? point.t ?? ''),
  primary: pickNum(point.primary, point.count, point.actions, point.value),
  secondary: pickNum(point.secondary, point.resolved, point.cases, point.commission),
});

export const normalizeChartSeries = (series) =>
  (Array.isArray(series) ? series : []).map(normalizeChartPoint).filter((p) => p.name);

export const normalizeLiveSeries = (series) =>
  (Array.isArray(series) ? series : []).map(normalizeLivePoint).filter((p) => p.time);

export const chartSeriesHasValues = (series) =>
  Array.isArray(series)
  && series.some((p) => Number(p?.primary) > 0 || Number(p?.secondary) > 0);

export const liveSeriesHasValues = (series) =>
  Array.isArray(series)
  && series.some((p) => p?.time && (Number(p?.primary) > 0 || Number(p?.secondary) > 0));

/** Utilise la série API si elle contient des valeurs, sinon la démo. */
export const mergeChartSeries = (raw, demoSeries = []) => {
  const mapped = normalizeChartSeries(raw);
  return chartSeriesHasValues(mapped) ? mapped : normalizeChartSeries(demoSeries);
};

export const mergeLiveSeries = (raw, demoSeries = []) => {
  const mapped = normalizeLiveSeries(raw);
  return liveSeriesHasValues(mapped) ? mapped : normalizeLiveSeries(demoSeries);
};
