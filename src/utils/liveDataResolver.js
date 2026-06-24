import { allowDemoFallback, isStrictLiveMode } from '../config/liveDataPolicy';

/** Liste API : retourne la liste live ou le jeu démo si autorisé. */
export const withDemoFallback = (data, demo) => {
  if (Array.isArray(data) && data.length > 0) return data;
  return allowDemoFallback() ? demo : [];
};

/** Objet stats : conserve les données live si elles existent, sinon démo si autorisé. */
export const withDemoObject = (data, demo, isLive = (d) => d != null && Object.keys(d).length > 0) => {
  if (isLive(data)) return data;
  return allowDemoFallback() ? demo : (data ?? {});
};

/** Appel API unifié — retourne { data, demo }. */
export const resolveApiCall = async (apiCall, fallbackFn) => {
  try {
    const data = await apiCall();
    if (isStrictLiveMode()) return { data, demo: false };
    const fallback = typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
    const isEmptyList = Array.isArray(data) && data.length === 0;
    const useDemo = isEmptyList && allowDemoFallback();
    return {
      data: useDemo ? fallback : data,
      demo: useDemo,
    };
  } catch (err) {
    if (isStrictLiveMode()) throw err;
    const fallback = typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
    return { data: fallback, demo: true };
  }
};

/** Fusionne une série graphique : préfère live, sinon démo si autorisé. */
export const mergeChartSeries = (liveSeries, demoSeries) => {
  if (Array.isArray(liveSeries) && liveSeries.length > 0) return liveSeries;
  return allowDemoFallback() ? demoSeries : [];
};

/** Fusionne un objet de graphiques BI champ par champ. */
export const mergeBiCharts = (liveCharts, demoCharts) => {
  if (!liveCharts) return allowDemoFallback() ? demoCharts : {};
  if (!allowDemoFallback()) return liveCharts;
  const out = { ...demoCharts };
  Object.keys(liveCharts).forEach((key) => {
    const live = liveCharts[key];
    if (Array.isArray(live) && live.length > 0) out[key] = live;
    else if (live != null && !Array.isArray(live)) out[key] = live;
  });
  return out;
};

export { allowDemoFallback, isStrictLiveMode } from '../config/liveDataPolicy';
