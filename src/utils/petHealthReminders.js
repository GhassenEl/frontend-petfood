import { isOnlineVisit } from '../constants/visitModes';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const daysAgo = (n) => daysFromNow(-n);

const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const urgencyFromDue = (dueDate) => {
  const due = parseDate(dueDate);
  if (!due) return 'unknown';
  const diff = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'overdue';
  if (diff <= 7) return 'soon';
  if (diff <= 30) return 'upcoming';
  return 'ok';
};

const URGENCY_ORDER = { overdue: 0, soon: 1, upcoming: 2, ok: 3, unknown: 4 };

export const buildPetHealthReminders = ({ vaccines = [], appointments = [], prescriptions = [] } = {}) => {
  const reminders = [];

  (vaccines || []).forEach((v) => {
    const due = v.nextDue || v.dueDate;
    reminders.push({
      id: v.id || `vac-${v.petName}-${v.vaccineType}`,
      type: 'vaccine',
      category: 'Vaccination',
      icon: '💉',
      petName: v.petName,
      title: v.vaccineType || v.title || 'Vaccin',
      dueDate: due,
      urgency: v.urgency || urgencyFromDue(due),
      notify: true,
    });
  });

  (appointments || []).forEach((a) => {
    if (['cancelled', 'completed'].includes(a.status)) return;
    const due = a.date || a.scheduledAt || a.startAt;
    reminders.push({
      id: a.id || a._id || `rdv-${due}`,
      type: 'appointment',
      category: isOnlineVisit(a) ? 'Téléconsultation' : 'Rendez-vous',
      icon: isOnlineVisit(a) ? '📹' : '🩺',
      petName: a.petName,
      title: a.reason || a.type || 'Consultation vétérinaire',
      dueDate: due,
      urgency: urgencyFromDue(due),
      notify: true,
      meetingLink: a.meetingLink,
      online: isOnlineVisit(a),
    });
  });

  (prescriptions || []).forEach((rx) => {
    const renew = rx.renewalDate || rx.expiresAt || rx.validUntil;
    if (!renew) return;
    reminders.push({
      id: rx.id || rx._id || `rx-${renew}`,
      type: 'treatment',
      category: 'Traitement',
      icon: '💊',
      petName: rx.petName,
      title: rx.medication || rx.title || 'Renouvellement ordonnance',
      dueDate: renew,
      urgency: urgencyFromDue(renew),
      notify: true,
    });
  });

  // Vermifuges — dérivés des vaccins ou planifiés localement si absent
  const dewormBase = (vaccines || []).filter((v) => v.petName);
  const seenPets = new Set();
  dewormBase.forEach((v) => {
    if (seenPets.has(v.petName)) return;
    seenPets.add(v.petName);
    const last = parseDate(v.dateAdministered || v.lastDose);
    const next = last ? new Date(last.getTime() + 90 * 86400000).toISOString() : daysFromNow(14);
    reminders.push({
      id: `verm-${v.petName}`,
      type: 'deworming',
      category: 'Vermifuge',
      icon: '🪱',
      petName: v.petName,
      title: 'Vermifuge / antiparasitaire interne',
      dueDate: next,
      urgency: urgencyFromDue(next),
      notify: true,
    });
  });

  return reminders.sort(
    (a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9),
  );
};

export const buildDemoPetHealthReminders = () =>
  buildPetHealthReminders({
    vaccines: [
      { id: 'dv1', petName: 'Max', vaccineType: 'Rage', nextDue: daysFromNow(5), urgency: 'soon' },
      { id: 'dv2', petName: 'Luna', vaccineType: 'Typhus / Coryza', nextDue: daysAgo(3), urgency: 'overdue' },
    ],
    appointments: [
      {
        id: 'rdv-tel-1',
        petName: 'Max',
        reason: 'Contrôle post-vaccination',
        date: daysFromNow(2),
        status: 'confirmed',
        visitMode: 'online',
        type: 'veterinary_teleconsultation',
        meetingLink: 'https://meet.google.com/demo-petfoodtn',
      },
      {
        id: 'rdv-2',
        petName: 'Luna',
        reason: 'Consultation annuelle',
        date: daysFromNow(18),
        status: 'pending',
        visitMode: 'clinic',
      },
    ],
    prescriptions: [
      {
        id: 'rx1',
        petName: 'Max',
        medication: 'Antiparasitaire externe',
        renewalDate: daysFromNow(10),
      },
    ],
  });

export default buildPetHealthReminders;
