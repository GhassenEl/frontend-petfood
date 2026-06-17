import api from '../utils/api';
import { downloadCsv, downloadJson, downloadExcel } from '../utils/dataImportExport';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_USERS,
  withDemoFallback,
} from '../utils/adminDemoData';

const REPORT_TYPES = {
  sales: {
    label: 'Rapport ventes',
    description: 'Commandes, CA et statuts — export CSV.',
    filename: 'petfoodtn-rapport-ventes',
  },
  iot: {
    label: 'Rapport IoT',
    description: 'Alertes qualité ESP32-CAM et capteurs chaîne du froid.',
    filename: 'petfoodtn-rapport-iot',
  },
  vet: {
    label: 'Rapport vétérinaire',
    description: 'Consultations, alertes alimentaires et dossiers cliniques.',
    filename: 'petfoodtn-rapport-veterinaire',
  },
  satisfaction: {
    label: 'Satisfaction client',
    description: 'Avis, notes service et réclamations.',
    filename: 'petfoodtn-satisfaction',
  },
  users: {
    label: 'Utilisateurs actifs',
    description: 'Liste des comptes par rôle et statut.',
    filename: 'petfoodtn-utilisateurs',
  },
};

export const getReportCatalog = () => REPORT_TYPES;

export async function exportSalesReport() {
  try {
    const res = await api.get('/orders');
    const orders = withDemoFallback(res.data || [], DEMO_ADMIN_ORDERS);
    const rows = orders.map((o) => ({
      id: o._id || o.id,
      total: o.total,
      status: o.status,
      payment: o.paymentMethod || o.payment || '—',
      createdAt: o.createdAt,
    }));
    downloadCsv(`${REPORT_TYPES.sales.filename}.csv`, ['id', 'total', 'status', 'payment', 'createdAt'], rows);
    return { ok: true, count: rows.length, format: 'csv' };
  } catch {
    return exportSalesReportDemo();
  }
}

function exportSalesReportDemo() {
  const rows = DEMO_ADMIN_ORDERS.map((o) => ({
    id: o._id || o.id,
    total: o.total,
    status: o.status,
    payment: o.paymentMethod || 'carte',
    createdAt: o.createdAt,
  }));
  downloadCsv(`${REPORT_TYPES.sales.filename}.csv`, ['id', 'total', 'status', 'payment', 'createdAt'], rows);
  return { ok: true, count: rows.length, format: 'csv', mode: 'demo' };
}

export async function exportIotReport() {
  const rows = [
    { device: 'ESP32-CAM Max', score: 42, alert: 'Nourriture altérée', temp: 31, humidity: 72, at: new Date().toISOString() },
    { device: 'Capteur entrepôt Sousse', score: 88, alert: '—', temp: 18, humidity: 55, at: new Date().toISOString() },
    { device: 'Véhicule livraison #12', score: 91, alert: '—', temp: 4, humidity: 48, at: new Date().toISOString() },
  ];
  downloadCsv(`${REPORT_TYPES.iot.filename}.csv`, ['device', 'score', 'alert', 'temp', 'humidity', 'at'], rows);
  return { ok: true, count: rows.length, format: 'csv', mode: 'demo' };
}

export async function exportVetReport() {
  const rows = [
    { vet: 'Dr. Ben Ali', pet: 'Max', type: 'Alerte IoT aliment', status: 'notifié', at: new Date().toISOString() },
    { vet: 'Dr. Trabelsi', pet: 'Luna', type: 'Consultation', status: 'planifié', at: new Date().toISOString() },
  ];
  downloadCsv(`${REPORT_TYPES.vet.filename}.csv`, ['vet', 'pet', 'type', 'status', 'at'], rows);
  return { ok: true, count: rows.length, format: 'csv', mode: 'demo' };
}

export async function exportSatisfactionReport() {
  try {
    const [reviewsRes, complaintsRes] = await Promise.all([
      api.get('/reviews').catch(() => ({ data: [] })),
      api.get('/complaints/all').catch(() => ({ data: [] })),
    ]);
    const reviews = reviewsRes.data || [];
    const complaints = complaintsRes.data || [];
    downloadJson(`${REPORT_TYPES.satisfaction.filename}.json`, { reviews, complaints });
    return { ok: true, count: reviews.length + complaints.length, format: 'json' };
  } catch {
    downloadJson(`${REPORT_TYPES.satisfaction.filename}.json`, { reviews: [], complaints: [], mode: 'demo' });
    return { ok: true, format: 'json', mode: 'demo' };
  }
}

export async function exportUsersReport() {
  try {
    const res = await api.get('/users');
    const users = withDemoFallback(res.data || [], DEMO_ADMIN_USERS);
    const rows = users.map((u) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.isActive !== false,
    }));
    downloadCsv(`${REPORT_TYPES.users.filename}.csv`, ['id', 'name', 'email', 'role', 'active'], rows);
    return { ok: true, count: rows.length, format: 'csv' };
  } catch {
    const rows = DEMO_ADMIN_USERS.map((u) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.isActive !== false,
    }));
    downloadCsv(`${REPORT_TYPES.users.filename}.csv`, ['id', 'name', 'email', 'role', 'active'], rows);
    return { ok: true, count: rows.length, format: 'csv', mode: 'demo' };
  }
}

export async function exportSalesReportExcel() {
  try {
    const res = await api.get('/orders');
    const orders = withDemoFallback(res.data || [], DEMO_ADMIN_ORDERS);
    const rows = orders.map((o) => ({
      id: o._id || o.id,
      total: o.total,
      status: o.status,
      payment: o.paymentMethod || o.payment || '—',
      createdAt: o.createdAt,
    }));
    const headers = ['id', 'total', 'status', 'payment', 'createdAt'];
    downloadExcel(`${REPORT_TYPES.sales.filename}.xls`, headers, rows, 'Ventes');
    return { ok: true, count: rows.length, format: 'excel' };
  } catch {
    const rows = DEMO_ADMIN_ORDERS.map((o) => ({
      id: o._id || o.id,
      total: o.total,
      status: o.status,
      payment: o.paymentMethod || 'carte',
      createdAt: o.createdAt,
    }));
    downloadExcel(`${REPORT_TYPES.sales.filename}.xls`, ['id', 'total', 'status', 'payment', 'createdAt'], rows, 'Ventes');
    return { ok: true, count: rows.length, format: 'excel', mode: 'demo' };
  }
}

export async function exportSatisfactionReportExcel() {
  const rows = [
    { theme: 'Qualité produit', avg: 4.6, count: 128, sentiment: 'positif' },
    { theme: 'Livraison', avg: 4.2, count: 95, sentiment: 'positif' },
    { theme: 'Emballage', avg: 4.4, count: 67, sentiment: 'positif' },
    { theme: 'Service client', avg: 3.9, count: 42, sentiment: 'neutre' },
  ];
  downloadExcel(`${REPORT_TYPES.satisfaction.filename}.xls`, ['theme', 'avg', 'count', 'sentiment'], rows, 'Satisfaction');
  return { ok: true, count: rows.length, format: 'excel', mode: 'demo' };
}

export const exportReport = (type, format = 'csv') => {
  if (format === 'excel') {
    switch (type) {
      case 'sales': return exportSalesReportExcel();
      case 'satisfaction': return exportSatisfactionReportExcel();
      default: return exportSalesReportExcel();
    }
  }
  switch (type) {
    case 'sales': return exportSalesReport();
    case 'iot': return exportIotReport();
    case 'vet': return exportVetReport();
    case 'satisfaction': return exportSatisfactionReport();
    case 'users': return exportUsersReport();
    default: return exportSalesReport();
  }
};

export default { getReportCatalog, exportReport };
