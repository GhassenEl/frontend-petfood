/** Service client — tickets, réclamations, retours, assistance. */

import api from '../utils/api';
import { DEMO_SUPPORT_TICKETS, DEMO_SUPPORT_ASSIST_QUEUE } from '../utils/supportDemoData';
import { DEMO_COMPLAINTS } from '../utils/clientDemoData';
import { fetchAdminRefunds } from './refundService';
import { resolveApiCall } from '../utils/liveDataResolver';

const TICKET_KEY = 'petfood_support_tickets';
let memoryTickets = null;

const loadTickets = () => {
  try {
    const raw = localStorage.getItem(TICKET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
};

const getTickets = () => {
  if (!memoryTickets) {
    memoryTickets = loadTickets() || DEMO_SUPPORT_TICKETS.map((t) => ({ ...t }));
    if (!loadTickets()) localStorage.setItem(TICKET_KEY, JSON.stringify(memoryTickets));
  }
  return memoryTickets;
};

const withDemo = async (apiCall, fallback) => resolveApiCall(apiCall, fallback);

export const fetchSupportTickets = () =>
  withDemo(
    () => api.get('/support/tickets').then((r) => r.data),
    () => ({ tickets: [...getTickets()] }),
  );

export const updateSupportTicket = (id, patch) =>
  withDemo(
    () => api.patch(`/support/tickets/${id}`, patch).then((r) => r.data),
    () => {
      const list = getTickets();
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Ticket introuvable');
      list[idx] = { ...list[idx], ...patch };
      memoryTickets = list;
      localStorage.setItem(TICKET_KEY, JSON.stringify(list));
      return list[idx];
    },
  );

export const fetchSupportComplaints = () =>
  withDemo(
    () => api.get('/support/complaints').then((r) => r.data),
    () => ({ complaints: DEMO_COMPLAINTS.filter((c) => c.status !== 'resolved').map((c) => ({ ...c })) }),
  );

export const fetchSupportReturns = async () => {
  const { data, demo } = await fetchAdminRefunds();
  const open = (data.refunds || []).filter(
    (r) => !['refunded', 'cancelled', 'admin_forced'].includes(r.status),
  );
  return { data: { returns: open }, demo };
};

export const fetchSupportAssistQueue = () =>
  withDemo(
    () => api.get('/support/assist').then((r) => r.data),
    () => ({ queue: [...DEMO_SUPPORT_ASSIST_QUEUE] }),
  );
