const STORAGE_KEY = 'petfoodtn_n8n_tasks_v1';

export const N8N_WORKFLOW_CATALOG = [
  {
    id: 'wf-feeding-reminder',
    name: 'Rappel distribution nourriture',
    icon: '🍽️',
    trigger: 'schedule',
    schedule: 'Tous les jours 08:00',
    description: 'Vérifie le niveau du distributeur ESP32 et envoie une notification si le bol est bas.',
    n8nNode: 'Cron → HTTP IoT → IF niveau < 20% → Email/Push',
    category: 'iot',
  },
  {
    id: 'wf-order-followup',
    name: 'Suivi commande automatique',
    icon: '📦',
    trigger: 'event',
    schedule: 'À la création de commande',
    description: 'Envoie un SMS/email à J+1 si la commande est encore en préparation.',
    n8nNode: 'Webhook commande → Wait 24h → IF statut → Notification',
    category: 'commerce',
  },
  {
    id: 'wf-vaccine-reminder',
    name: 'Rappel vaccins animal',
    icon: '💉',
    trigger: 'schedule',
    schedule: 'Hebdomadaire lundi 09:00',
    description: 'Croise le dossier médical et rappelle les vaccins à échéance sous 14 jours.',
    n8nNode: 'Cron → API dossier → Filter échéance → Calendrier',
    category: 'sante',
  },
  {
    id: 'wf-sentiment-alert',
    name: 'Alerte sentiment négatif',
    icon: '💬',
    trigger: 'webhook',
    schedule: 'À chaque nouvel avis / commentaire',
    description: 'Pipeline NLP hybride : si sentiment négatif ou anomalie, crée une tâche modération.',
    n8nNode: 'Webhook avis → NLP hybrid → IF negative → Slack + Tâche',
    category: 'nlp',
  },
  {
    id: 'wf-anomaly-scan',
    name: 'Scan anomalies contenu',
    icon: '🛡️',
    trigger: 'webhook',
    schedule: 'Temps réel (messages, réclamations)',
    description: 'Filtre hybride spam / contenu inapproprié / avis suspects avant publication.',
    n8nNode: 'Webhook texte → Hybrid filter → IF block → Queue review',
    category: 'security',
  },
  {
    id: 'wf-restock-predict',
    name: 'Réapprovisionnement prédictif',
    icon: '🔄',
    trigger: 'schedule',
    schedule: 'Dimanche 18:00',
    description: 'Analyse consommation croquettes + historique achats → suggestion panier auto.',
    n8nNode: 'Cron → ML stock → Generate cart → Notify user',
    category: 'commerce',
  },
];

export const DEMO_TASK_LOG = [
  {
    id: 'log-1',
    workflowId: 'wf-feeding-reminder',
    status: 'success',
    message: 'Bowl à 18% — notification push envoyée',
    at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log-2',
    workflowId: 'wf-sentiment-alert',
    status: 'success',
    message: 'Avis analysé — sentiment neutre, aucune action',
    at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log-3',
    workflowId: 'wf-anomaly-scan',
    status: 'flagged',
    message: 'Lien externe détecté — file modération',
    at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const defaultState = () => ({
  enabled: Object.fromEntries(N8N_WORKFLOW_CATALOG.map((w) => [w.id, true])),
  log: [...DEMO_TASK_LOG],
  lastRun: {},
});

const readState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      enabled: { ...defaultState().enabled, ...(parsed.enabled || {}) },
    };
  } catch {
    return defaultState();
  }
};

const writeState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

export const getUserWorkflows = () => {
  const state = readState();
  return N8N_WORKFLOW_CATALOG.map((wf) => ({
    ...wf,
    enabled: state.enabled[wf.id] !== false,
    lastRun: state.lastRun[wf.id] || null,
  }));
};

export const getTaskLog = (limit = 20) => {
  const state = readState();
  return (state.log || []).slice(0, limit);
};

export const toggleWorkflow = (workflowId, enabled) => {
  const state = readState();
  state.enabled[workflowId] = enabled;
  writeState(state);
  return getUserWorkflows();
};

export const appendTaskLog = (entry) => {
  const state = readState();
  state.log = [{ ...entry, id: `log-${Date.now()}`, at: new Date().toISOString() }, ...(state.log || [])].slice(0, 50);
  if (entry.workflowId) state.lastRun[entry.workflowId] = new Date().toISOString();
  writeState(state);
};

/** Vérifie si n8n répond (via proxy Vite /n8n-health) */
export const checkN8nConnection = async () => {
  const webhookBase = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

  if (!webhookBase) {
    return { connected: false, mode: 'demo', message: 'VITE_N8N_WEBHOOK_URL non configuré' };
  }

  if (!webhookBase.startsWith('/')) {
    return { connected: true, mode: 'remote', message: 'Webhook distant configuré' };
  }

  try {
    const res = await fetch('/n8n-health', { method: 'GET', signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return { connected: true, mode: 'n8n', message: 'n8n connecté' };
    }
  } catch {
    /* n8n down */
  }

  return {
    connected: false,
    mode: 'proxy',
    message: 'n8n non démarré — npm run n8n:up',
  };
};

/** Déclenche un workflow n8n (webhook via proxy Vite ou URL directe) */
export const triggerWorkflow = async (workflowId, payload = {}) => {
  const wf = N8N_WORKFLOW_CATALOG.find((w) => w.id === workflowId);
  if (!wf) throw new Error('Workflow inconnu');

  const webhookBase = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
  const body = {
    workflowId,
    workflowName: wf.name,
    triggeredAt: new Date().toISOString(),
    source: 'petfoodtn_frontend',
    ...payload,
  };

  let mode = 'demo';
  let httpOk = false;

  if (webhookBase) {
    const url = `${webhookBase.replace(/\/$/, '')}/${workflowId}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      httpOk = res.ok || res.status === 404;
      mode = webhookBase.startsWith('/') ? 'n8n_proxy' : 'n8n';
    } catch {
      mode = 'demo_fallback';
    }
  }

  const status = workflowId.includes('anomaly') ? 'flagged' : 'success';
  let message;
  if (!webhookBase) {
    message = `Workflow « ${wf.name} » simulé (configurez VITE_N8N_WEBHOOK_URL)`;
  } else if (mode === 'demo_fallback') {
    message = `« ${wf.name} » — n8n injoignable, exécution simulée (npm run n8n:up)`;
  } else if (httpOk) {
    message = `Workflow n8n « ${wf.name} » déclenché`;
  } else {
    message = `Webhook envoyé — créez le workflow « ${workflowId} » dans n8n`;
  }

  appendTaskLog({ workflowId, status, message });
  return { ok: true, workflowId, message, mode, httpOk };
};

export const getAutomationStats = () => {
  const workflows = getUserWorkflows();
  const log = getTaskLog(50);
  return {
    activeCount: workflows.filter((w) => w.enabled).length,
    totalWorkflows: workflows.length,
    runsToday: log.filter((l) => {
      const d = new Date(l.at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    flaggedCount: log.filter((l) => l.status === 'flagged').length,
  };
};

export default {
  getUserWorkflows,
  getTaskLog,
  toggleWorkflow,
  triggerWorkflow,
  getAutomationStats,
  checkN8nConnection,
  N8N_WORKFLOW_CATALOG,
};
