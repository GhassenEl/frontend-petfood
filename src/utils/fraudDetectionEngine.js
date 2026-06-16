const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Transactions suspectes et comportements anormaux */
export const detectFraudSignals = ({ orders = [], events = [] } = {}) => {
  const alerts = [];
  const byUser = new Map();
  const byIp = new Map();

  (orders || []).forEach((order) => {
    const total = Number(order.total) || 0;
    const userKey = order.user?.email || order.userId || order.phone || 'unknown';
    const prev = byUser.get(userKey) || { count: 0, total: 0, lastAt: 0 };
    prev.count += 1;
    prev.total += total;
    prev.lastAt = new Date(order.createdAt || Date.now()).getTime();
    byUser.set(userKey, prev);

    if (total >= 500) {
      alerts.push({
        id: `fraud-amt-${order._id || order.id}`,
        type: 'transaction',
        severity: total >= 1000 ? 'critical' : 'high',
        title: 'Montant atypique',
        detail: `Commande ${total.toFixed(2)} DT — seuil dépassé`,
        orderId: order._id || order.id,
        score: total >= 1000 ? 92 : 78,
        suggestedAction: 'Vérifier identité et moyen de paiement',
      });
    }

    if (order.paymentMethod === 'wallet' && total > 300) {
      alerts.push({
        id: `fraud-wallet-${order._id || order.id}`,
        type: 'payment',
        severity: 'medium',
        title: 'Paiement portefeuille élevé',
        detail: `${total.toFixed(2)} DT via wallet`,
        orderId: order._id || order.id,
        score: 65,
        suggestedAction: 'Contrôle solde et historique client',
      });
    }
  });

  byUser.forEach((stats, userKey) => {
    if (stats.count >= 4 && stats.total > 600) {
      alerts.push({
        id: `fraud-burst-${userKey}`,
        type: 'behavior',
        severity: 'high',
        title: 'Rafale de commandes',
        detail: `${stats.count} commandes récentes pour ${userKey}`,
        score: 81,
        suggestedAction: 'Analyser le profil et limiter temporairement',
      });
    }
  });

  (events || []).forEach((ev) => {
    if (normalize(ev.type || '').includes('login_fail')) {
      alerts.push({
        id: `fraud-login-${ev.id || Date.now()}`,
        type: 'auth',
        severity: 'medium',
        title: 'Tentatives de connexion suspectes',
        detail: ev.detail || 'Multiples échecs login',
        score: 70,
        suggestedAction: 'Activer CAPTCHA / verrouillage compte',
      });
    }
  });

  return alerts.sort((a, b) => (b.score || 0) - (a.score || 0));
};

export default detectFraudSignals;
