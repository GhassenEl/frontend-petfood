import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { fetchPharmacyCatalog } from '../services/vetMedicationService';
import { summarizePharmacyStock } from '../utils/vetPharmacyAlerts';
import {
  DEMO_VET_CONTACT_REQUESTS,
  DEMO_VET_UNASSIGNED,
  DEMO_VET_VACCINATIONS,
  withDemoFallback,
} from '../utils/vetDemoData';

const emptyOverview = {
  pharmacy: { ruptures: 0, lowStock: 0, expiry: 0, alerts: [] },
  vaccinesOverdue: 0,
  vaccinesSoon: 0,
  contactPending: 0,
  unassigned: 0,
  alerts: [],
};

const useVetClinicalOverview = () => {
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [catalog, vaccinesRes, contactRes, unassignedRes] = await Promise.all([
        fetchPharmacyCatalog(),
        api.get('/vet/vaccinations').catch(() => ({ data: null })),
        api.get('/vet/contact-requests').catch(() => ({ data: null })),
        api.get('/vet/appointments/unassigned').catch(() => ({ data: null })),
      ]);

      const pharmacy = summarizePharmacyStock(catalog);
      const vaccines = withDemoFallback(vaccinesRes.data, DEMO_VET_VACCINATIONS);
      const contacts = withDemoFallback(contactRes.data, DEMO_VET_CONTACT_REQUESTS);
      const unassignedList = withDemoFallback(unassignedRes.data, DEMO_VET_UNASSIGNED);

      const now = new Date();
      const in30 = new Date(Date.now() + 30 * 86400000);
      const vaccinesOverdue = vaccines.filter((v) => v.nextDue && new Date(v.nextDue) < now).length;
      const vaccinesSoon = vaccines.filter(
        (v) => v.nextDue && new Date(v.nextDue) >= now && new Date(v.nextDue) <= in30
      ).length;
      const contactPending = contacts.filter((r) => r.status === 'pending').length;
      const unassigned = unassignedList.length;

      const alerts = [
        ...pharmacy.alerts.slice(0, 4),
        vaccinesOverdue > 0
          ? { id: 'vac-overdue', level: 'warning', message: `${vaccinesOverdue} vaccin(s) en retard`, link: '/vet/vaccinations', label: 'Vaccins' }
          : null,
        vaccinesSoon > 0
          ? { id: 'vac-soon', level: 'info', message: `${vaccinesSoon} rappel(s) sous 30 j`, link: '/vet/vaccinations', label: 'Rappels' }
          : null,
        contactPending > 0
          ? { id: 'contact-pending', level: 'info', message: `${contactPending} demande(s) contact`, link: '/vet/contact-requests', label: 'Contact' }
          : null,
        unassigned > 0
          ? { id: 'unassigned', level: 'critical', message: `${unassigned} RDV non assigné(s)`, link: '/vet/calendar', label: 'Pool RDV' }
          : null,
      ].filter(Boolean);

      setOverview({
        pharmacy,
        vaccinesOverdue,
        vaccinesSoon,
        contactPending,
        unassigned,
        alerts,
      });
    } catch {
      setOverview(emptyOverview);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { overview, loading, refresh };
};

export default useVetClinicalOverview;
