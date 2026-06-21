const EXTRAS_KEY = 'petfood_profile_extras';
const PREFS_KEY = 'petfood_profile_prefs';
const AVATAR_KEY = 'petfood_profile_avatar';

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function userKey(email, role) {
  return `${(email || 'anonymous').toLowerCase()}::${role || 'client'}`;
}

export function getProfileExtras(email, role) {
  const all = safeParse(localStorage.getItem(EXTRAS_KEY), {});
  return all[userKey(email, role)] || {};
}

export function saveProfileExtras(email, role, extras) {
  const all = safeParse(localStorage.getItem(EXTRAS_KEY), {});
  all[userKey(email, role)] = { ...extras };
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
}

export function getProfilePrefs(email, role) {
  const all = safeParse(localStorage.getItem(PREFS_KEY), {});
  return all[userKey(email, role)] || null;
}

export function saveProfilePrefs(email, role, prefs) {
  const all = safeParse(localStorage.getItem(PREFS_KEY), {});
  all[userKey(email, role)] = { ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(all));
}

export function getStoredAvatar(email) {
  const all = safeParse(localStorage.getItem(AVATAR_KEY), {});
  return all[(email || '').toLowerCase()] || '';
}

export function saveStoredAvatar(email, url) {
  const all = safeParse(localStorage.getItem(AVATAR_KEY), {});
  if (url) {
    all[(email || '').toLowerCase()] = url;
  } else {
    delete all[(email || '').toLowerCase()];
  }
  localStorage.setItem(AVATAR_KEY, JSON.stringify(all));
}

export function computeProfileCompletion(profile, extras, config) {
  const checks = [
    Boolean(profile?.name?.trim()),
    Boolean(profile?.phone?.trim()),
    Boolean(profile?.region?.trim()),
    Boolean(profile?.address?.trim()),
  ];
  (config?.extraFields || []).forEach((f) => {
    checks.push(Boolean(String(extras?.[f.key] || '').trim()));
  });
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
