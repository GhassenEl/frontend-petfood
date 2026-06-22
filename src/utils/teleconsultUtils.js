import { isOnlineVisit } from '../constants/visitModes';

const JOIN_WINDOW_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 55 * 60 * 1000;

export const TELECONSULT_PREP_CHECKLIST = [
  'Préparez une pièce calme et bien éclairée pour votre animal',
  'Testez caméra et micro (Chrome ou Edge recommandé)',
  'Ayez le carnet de vaccination et la liste des symptômes sous la main',
  'Pour les chats : laissez une serviette ou cachette à portée de main',
  'Connexion stable (Wi‑Fi ou 4G) — fermez les applications gourmandes',
];

export const TELECONSULT_STATUS = {
  pending: { label: 'En attente', bg: '#fef3c7', color: '#b45309' },
  scheduled: { label: 'Planifié', bg: '#e0f2fe', color: '#0369a1' },
  confirmed: { label: 'Confirmé', bg: '#dcfce7', color: '#166534' },
  completed: { label: 'Terminé', bg: '#f1f5f9', color: '#64748b' },
  cancelled: { label: 'Annulé', bg: '#fee2e2', color: '#b91c1c' },
};

export const getSessionId = (session) => session?.id || session?._id;

export const getSessionDate = (session) => {
  const raw = session?.date || session?.scheduledAt || session?.dueDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatSessionDateTime = (session) => {
  const d = getSessionDate(session);
  if (!d) return 'Date à confirmer';
  return d.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const sortSessionsByDate = (sessions = [], direction = 'asc') => {
  const sorted = [...sessions].sort((a, b) => {
    const da = getSessionDate(a)?.getTime() ?? 0;
    const db = getSessionDate(b)?.getTime() ?? 0;
    return direction === 'asc' ? da - db : db - da;
  });
  return sorted;
};

export const splitTeleconsultSessions = (sessions = []) => {
  const upcoming = [];
  const past = [];
  sessions.forEach((s) => {
    const timing = getTeleconsultTiming(s);
    if (['past', 'cancelled'].includes(timing.phase) || s.status === 'completed' || s.status === 'cancelled') {
      past.push(s);
    } else {
      upcoming.push(s);
    }
  });
  return {
    upcoming: sortSessionsByDate(upcoming, 'asc'),
    past: sortSessionsByDate(past, 'desc'),
  };
};

export const getTeleconsultTiming = (session, now = new Date()) => {
  if (session?.status === 'cancelled') {
    return { phase: 'cancelled', minutesUntil: null, label: 'Consultation annulée', canJoin: false };
  }
  if (session?.status === 'completed') {
    return { phase: 'past', minutesUntil: null, label: 'Consultation terminée', canJoin: false };
  }

  const start = getSessionDate(session);
  if (!start) {
    return { phase: 'unknown', minutesUntil: null, label: 'Horaire à confirmer', canJoin: !!session?.meetingLink };
  }

  const startMs = start.getTime();
  const nowMs = now.getTime();
  const endMs = startMs + SESSION_DURATION_MS;
  const minutesUntil = Math.round((startMs - nowMs) / 60000);

  if (nowMs > endMs) {
    return { phase: 'past', minutesUntil, label: 'Séance passée', canJoin: false };
  }

  if (nowMs >= startMs - JOIN_WINDOW_MS && nowMs <= endMs) {
    if (nowMs < startMs) {
      return {
        phase: 'joinable',
        minutesUntil,
        label: minutesUntil <= 1 ? 'La salle ouvre maintenant' : `Ouverture dans ${minutesUntil} min`,
        canJoin: !!session?.meetingLink,
      };
    }
    return {
      phase: 'live',
      minutesUntil: 0,
      label: 'Consultation en cours — rejoignez la salle',
      canJoin: !!session?.meetingLink,
    };
  }

  if (minutesUntil < 60) {
    return {
      phase: 'upcoming',
      minutesUntil,
      label: `Dans ${minutesUntil} min`,
      canJoin: false,
    };
  }

  const hours = Math.floor(minutesUntil / 60);
  const mins = minutesUntil % 60;
  return {
    phase: 'upcoming',
    minutesUntil,
    label: mins ? `Dans ${hours} h ${mins} min` : `Dans ${hours} h`,
    canJoin: false,
  };
};

export const getNextSession = (sessions = []) => {
  const { upcoming } = splitTeleconsultSessions(sessions);
  return upcoming[0] || null;
};

export const countJoinableSessions = (sessions = [], now = new Date()) =>
  sessions.filter((s) => getTeleconsultTiming(s, now).canJoin).length;

export const filterOnlineSessions = (list = []) => list.filter((item) => isOnlineVisit(item));

export const copyMeetingLink = async (link) => {
  if (!link || typeof navigator === 'undefined') return false;
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    return false;
  }
};

export const enrichDemoTeleconsult = (session) => ({
  ...session,
  meetingLink:
    session.meetingLink
    || (session.status === 'confirmed' ? 'https://meet.google.com/lookup/petfoodtn-demo' : undefined),
});
