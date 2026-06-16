/** Analyse prédictive des stocks — prévision ruptures */
export const predictStockOutages = ({ stockItems = [], orders = [] } = {}) => {
  const velocityFromOrders = new Map();

  (orders || []).forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = item.productId?.name || item.name || '';
      const key = item.productId?._id || item.productId?.id || name;
      velocityFromOrders.set(key, (velocityFromOrders.get(key) || 0) + (Number(item.quantity) || 1));
    });
  });

  const orderSpanDays = 30;
  const predictions = (stockItems || []).map((item) => {
    const id = item.id || item._id;
    const stock = Number(item.stock ?? 0);
    const minStock = Number(item.minStock ?? 10);
    const velocity = Number(item.velocityPerDay) || (velocityFromOrders.get(id) || velocityFromOrders.get(item.name) || 0) / orderSpanDays || 0.5;

    const daysUntilEmpty = velocity > 0 ? Math.floor(stock / velocity) : stock === 0 ? 0 : 999;
    const daysUntilMin = velocity > 0 ? Math.max(0, Math.floor((stock - minStock) / velocity)) : 999;
    const predictedOutDate = new Date(Date.now() + daysUntilEmpty * 86400000);

    let urgency = 'ok';
    if (stock <= 0) urgency = 'critical';
    else if (daysUntilEmpty <= 3) urgency = 'critical';
    else if (daysUntilEmpty <= 7 || stock <= minStock) urgency = 'high';
    else if (daysUntilEmpty <= 14) urgency = 'medium';

    const reorderQty = item.reorderQty ?? Math.max(minStock * 2, 20);

    return {
      productId: id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock,
      minStock,
      velocityPerDay: Math.round(velocity * 100) / 100,
      daysUntilEmpty,
      daysUntilMin,
      predictedOutDate: predictedOutDate.toISOString().slice(0, 10),
      urgency,
      reorderSuggested: reorderQty,
      aiSummary:
        stock <= 0
          ? 'Rupture actuelle — réapprovisionnement urgent.'
          : daysUntilEmpty <= 7
            ? `Rupture prévue dans ~${daysUntilEmpty} j (${predictedOutDate.toLocaleDateString('fr-FR')}).`
            : `Stock suffisant pour ~${daysUntilEmpty} j au rythme actuel.`,
    };
  });

  return predictions.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, ok: 3 };
    return (order[a.urgency] ?? 9) - (order[b.urgency] ?? 9);
  });
};

export default predictStockOutages;
