const STORAGE_KEY = 'petfood_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const DELAY_BASE_MS = 1500;

const read = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
};

const write = (data) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

export const recordLoginFailure = () => {
  const state = read();
  const count = state.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  write({ count, lockedUntil });
  return { count, lockedUntil, requiresCaptcha: count >= 3 };
};

export const clearLoginAttempts = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const getLoginAttemptState = () => {
  const state = read();
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    return {
      locked: true,
      count: state.count,
      lockedUntil: state.lockedUntil,
      remainingMs: state.lockedUntil - Date.now(),
      requiresCaptcha: true,
    };
  }
  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    write({ count: 0, lockedUntil: 0 });
    return { locked: false, count: 0, requiresCaptcha: false };
  }
  return {
    locked: false,
    count: state.count,
    requiresCaptcha: state.count >= 3,
  };
};

export const getLoginDelayMs = () => {
  const { count } = getLoginAttemptState();
  if (count <= 1) return 0;
  return Math.min(DELAY_BASE_MS * count, 8000);
};

export const formatLockoutRemaining = (ms) => {
  const mins = Math.ceil(ms / 60000);
  return mins <= 1 ? '1 minute' : `${mins} minutes`;
};

export default getLoginAttemptState;
