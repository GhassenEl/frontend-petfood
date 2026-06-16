import api from './httpClient';
import { getVaccineReminders } from './vaccineReminderService';
import { getAppointments, getPrescriptions } from './vetService';
import { buildPetHealthReminders } from '../utils/petHealthReminders';

export async function getPetHealthReminders() {
  try {
    const { data } = await api.get('/pets/health-reminders');
    if (Array.isArray(data) && data.length) return data;
  } catch {
    /* fallback local */
  }

  try {
    const [vaccines, appointments, prescriptions] = await Promise.all([
      getVaccineReminders().catch(() => []),
      getAppointments().catch(() => []),
      getPrescriptions().catch(() => []),
    ]);
    return buildPetHealthReminders({ vaccines, appointments, prescriptions });
  } catch {
    const { buildDemoPetHealthReminders } = await import('../utils/petHealthReminders');
    return buildDemoPetHealthReminders();
  }
}

export default getPetHealthReminders;
