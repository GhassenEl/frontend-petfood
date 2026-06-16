/** Segmentation automatique des clients selon habitudes d'achat (RFM simplifié) */
export const segmentClientsByPurchases = ({ orders = [], users = [] } = {}) => {
  const byEmail = new Map();

  (orders || []).forEach((order) => {
    const email = order.user?.email || order.userEmail || order.email || 'inconnu@client.tn';
    const key = email.toLowerCase();
    const prev = byEmail.get(key) || {
      email,
      name: order.user?.name || email.split('@')[0],
      orderCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
      categories: new Map(),
    };
    prev.orderCount += 1;
    prev.totalSpent += Number(order.total) || 0;
    const date = new Date(order.createdAt || order.date);
    if (!prev.lastOrderAt || date > prev.lastOrderAt) prev.lastOrderAt = date;

    (order.items || []).forEach((item) => {
      const cat = item.productId?.category || item.category || 'autre';
      prev.categories.set(cat, (prev.categories.get(cat) || 0) + (Number(item.quantity) || 1));
    });

    byEmail.set(key, prev);
  });

  const now = Date.now();
  const segments = {
    vip: { id: 'vip', label: 'Clients VIP', color: '#7c3aed', clients: [] },
    loyal: { id: 'loyal', label: 'Fidèles réguliers', color: '#2563eb', clients: [] },
    occasional: { id: 'occasional', label: 'Occasionnels', color: '#0d9488', clients: [] },
    at_risk: { id: 'at_risk', label: 'À risque (inactifs)', color: '#d97706', clients: [] },
    new: { id: 'new', label: 'Nouveaux clients', color: '#059669', clients: [] },
  };

  byEmail.forEach((client) => {
    const daysSinceLast = client.lastOrderAt
      ? Math.ceil((now - client.lastOrderAt.getTime()) / 86400000)
      : 999;
    const avgOrder = client.orderCount ? client.totalSpent / client.orderCount : 0;
    const topCategory = [...client.categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    let segmentId = 'occasional';
    if (client.totalSpent >= 200 && client.orderCount >= 3) segmentId = 'vip';
    else if (client.orderCount >= 3 && daysSinceLast <= 45) segmentId = 'loyal';
    else if (client.orderCount === 1 && daysSinceLast <= 30) segmentId = 'new';
    else if (daysSinceLast > 60 || client.orderCount === 0) segmentId = 'at_risk';
    else if (client.orderCount <= 2) segmentId = 'occasional';

    const profile = {
      ...client,
      avgOrder: Math.round(avgOrder * 100) / 100,
      daysSinceLast,
      topCategory,
      segmentId,
      segmentLabel: segments[segmentId]?.label || segmentId,
    };

    segments[segmentId]?.clients.push(profile);
  });

  (users || [])
    .filter((u) => u.role === 'client')
    .forEach((u) => {
      const key = (u.email || '').toLowerCase();
      if (!byEmail.has(key)) {
        segments.at_risk.clients.push({
          email: u.email,
          name: u.name,
          orderCount: 0,
          totalSpent: 0,
          daysSinceLast: 999,
          topCategory: '—',
          segmentId: 'at_risk',
          segmentLabel: segments.at_risk.label,
        });
      }
    });

  const summary = Object.values(segments).map((s) => ({
    ...s,
    count: s.clients.length,
    revenue: Math.round(s.clients.reduce((a, c) => a + c.totalSpent, 0) * 100) / 100,
  }));

  return { segments: summary, totalClients: byEmail.size };
};

export default segmentClientsByPurchases;
