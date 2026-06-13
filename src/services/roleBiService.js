/** Service BI par rôle métier. */

import api from '../utils/api';
import { getRoleBiDemo } from '../utils/roleBiDemoData';

const API_PATHS = {
  vendor: '/ecosystem/vendor/bi/dashboard',
  moderator: '/ecosystem/moderator/bi/dashboard',
  livreur: '/livreur/bi/dashboard',
};

const normalize = (role, raw) => {
  const demo = getRoleBiDemo(role);
  if (!raw || typeof raw !== 'object') return demo;
  return {
    kpis: raw.kpis?.length ? raw.kpis : demo.kpis,
    trend: raw.trend?.length ? raw.trend : demo.trend,
    breakdown: raw.breakdown?.length ? raw.breakdown : demo.breakdown,
    daily: raw.daily?.length ? raw.daily : demo.daily,
    table: raw.table?.rows?.length ? raw.table : demo.table,
    alerts: raw.alerts?.length ? raw.alerts : demo.alerts,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const fetchRoleBi = async (role, days = 90) => {
  const path = API_PATHS[role];
  if (!path) {
    return { data: getRoleBiDemo(role), demo: true };
  }
  try {
    const { data } = await api.get(`${path}?days=${days}`);
    return { data: normalize(role, data), demo: false };
  } catch {
    return { data: getRoleBiDemo(role), demo: true };
  }
};

export const exportRoleBiCsv = (role, rows, columns) => {
  if (!rows?.length) return;
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((row) =>
    columns.map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(','),
  );
  const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petfoodtn-bi-${role}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
