import { computeWeightTrend } from './adaptiveNutritionEngine';
import { parsePetAllergies, parsePetHealthFlags } from './petNutritionRecommender';

/** Détection précoce des risques santé (habitudes alimentaires + carnet médical) */
export const detectEarlyHealthRisks = ({
  pet = {},
  weightHistory = [],
  orders = [],
  medicalRecord = {},
  feedingLogs = [],
} = {}) => {
  const risks = [];
  const petName = pet.name || 'Animal';
  const weightTrend = computeWeightTrend(weightHistory);
  const healthFlags = parsePetHealthFlags(pet);
  const allergies = parsePetAllergies(pet);

  if (weightTrend.trend === 'gain' && weightTrend.deltaPct > 5) {
    risks.push({
      id: 'weight-gain',
      severity: 'medium',
      title: 'Prise de poids rapide',
      detail: `${petName} : +${weightTrend.deltaKg} kg récemment — risque surpoids / articulations.`,
      action: 'Réduire les portions et privilégier une formule light.',
      source: 'historique poids',
    });
  }

  if (weightTrend.trend === 'loss' && weightTrend.deltaPct < -5) {
    risks.push({
      id: 'weight-loss',
      severity: 'high',
      title: 'Perte de poids inexpliquée',
      detail: `${petName} : ${weightTrend.deltaKg} kg — consultez un vétérinaire si persistant.`,
      action: 'RDV vétérinaire recommandé.',
      source: 'historique poids',
    });
  }

  const petOrders = (orders || []).filter((o) =>
    (o.items || []).some((it) => {
      const n = it.productId?.name || it.name || '';
      return n.toLowerCase().includes(petName.toLowerCase()) || true;
    }),
  );

  const orderFrequency = petOrders.length;
  if (orderFrequency >= 5) {
    const croquetteOrders = petOrders.filter((o) =>
      (o.items || []).some((it) => /croquette|nourriture/i.test(it.productId?.name || it.name || '')),
    );
    if (croquetteOrders.length >= 4) {
      risks.push({
        id: 'feeding-burst',
        severity: 'low',
        title: 'Achats alimentaires fréquents',
        detail: 'Plusieurs commandes croquettes récentes — vérifiez les portions quotidiennes.',
        action: 'Activer le réapprovisionnement intelligent pour lisser les achats.',
        source: 'habitudes alimentaires',
      });
    }
  }

  if (allergies.length) {
    const conflictOrder = (orders || []).find((o) =>
      (o.items || []).some((it) => {
        const hay = `${it.productId?.name || it.name || ''}`.toLowerCase();
        return allergies.some((a) => hay.includes(a));
      }),
    );
    if (conflictOrder) {
      risks.push({
        id: 'allergy-conflict',
        severity: 'high',
        title: 'Allergie vs alimentation',
        detail: `Produit contenant un allergène déclaré (${allergies.join(', ')}) dans l'historique d'achats.`,
        action: 'Changer de formule hypoallergénique.',
        source: 'carnet médical + commandes',
      });
    }
  }

  healthFlags.forEach((flag) => {
    risks.push({
      id: `health-${flag.key}`,
      severity: 'medium',
      title: flag.label,
      detail: `Condition suivie dans le carnet — adapter l'alimentation avec votre vétérinaire.`,
      action: 'Consulter le dossier médical.',
      source: 'carnet médical',
    });
  });

  (medicalRecord.vaccines || []).forEach((v) => {
    if (v.urgency === 'overdue' || v.status === 'overdue') {
      risks.push({
        id: `vac-${v.id}`,
        severity: 'medium',
        title: 'Vaccin en retard',
        detail: `${v.vaccineType || v.title} — ${petName}.`,
        action: 'Prendre rendez-vous vétérinaire.',
        source: 'carnet vaccinal',
      });
    }
  });

  if ((feedingLogs || []).length >= 3) {
    const skipped = feedingLogs.filter((l) => l.skipped || l.grams === 0).length;
    if (skipped >= 2) {
      risks.push({
        id: 'irregular-feeding',
        severity: 'low',
        title: 'Repas irréguliers',
        detail: 'Plusieurs repas manqués détectés (distributeur / journal).',
        action: 'Vérifier appétit et routine.',
        source: 'habitudes alimentaires',
      });
    }
  }

  if (pet.type === 'cat' && weightTrend.trend === 'gain') {
    risks.push({
      id: 'cat-indoor-weight',
      severity: 'low',
      title: 'Chat d\'intérieur — sédentarité',
      detail: 'Surveillez l\'apport calorique et l\'hydratation (pâtée).',
      action: 'Enrichissement environnemental + contrôle portions.',
      source: 'profil + poids',
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return risks.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
};

export default detectEarlyHealthRisks;
