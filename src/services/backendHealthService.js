import api from '../utils/api';
import { isStrictLiveMode } from '../config/liveDataPolicy';

const HEALTH_TIMEOUT_MS = 8000;

/** Sonde GET /health — utilisée pour le bandeau live et les dashboards ops. */
export const pingBackendHealth = async () => {
  const started = Date.now();
  try {
    const { data, status } = await api.get('/health', { timeout: HEALTH_TIMEOUT_MS });
    return {
      ok: status >= 200 && status < 300,
      latencyMs: Date.now() - started,
      payload: data,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: err?.response?.data?.error || err?.message || 'API indisponible',
      checkedAt: new Date().toISOString(),
      strictLive: isStrictLiveMode(),
    };
  }
};

export default { pingBackendHealth };
