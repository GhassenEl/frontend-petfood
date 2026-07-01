// Moteur nutrition + hydratation — scores et synergie alimentation/eau.
import '../utils/species_catalog.dart';

class NutritionHydrationEngine {
  static int computeHydrationScore({
    required int todayMl,
    required int targetMl,
    int avg7dMl = 0,
    int filterDaysLeft = 30,
    int reservoirPct = 100,
    bool online = true,
  }) {
    var score = 100;
    final pct = targetMl > 0 ? (todayMl / targetMl) * 100 : 0;

    if (pct < 50) {
      score -= 35;
    } else if (pct < 70) {
      score -= 20;
    } else if (pct < 85) {
      score -= 8;
    }

    if (avg7dMl > 0 && targetMl > 0 && avg7dMl < targetMl * 0.75) score -= 12;
    if (filterDaysLeft <= 3) {
      score -= 15;
    } else if (filterDaysLeft <= 7) {
      score -= 8;
    }
    if (reservoirPct < 20) {
      score -= 15;
    } else if (reservoirPct < 35) {
      score -= 6;
    }
    if (!online) score -= 20;

    return score.clamp(0, 100);
  }

  static int computeNutritionScore({
    required int todayGrams,
    required int dailyTarget,
    int missedMeals = 0,
    bool reservoirLow = false,
  }) {
    var score = 100;
    final adherence = dailyTarget > 0 ? ((todayGrams / dailyTarget) * 100).round() : 0;

    if (adherence < 70) {
      score -= 20;
    } else if (adherence < 85) {
      score -= 10;
    } else if (adherence > 120) {
      score -= 12;
    }

    score -= missedMeals * 12;
    if (reservoirLow) score -= 8;

    return score.clamp(0, 100);
  }

  static NutritionWaterSynergy buildSynergy({
    required String petName,
    required int todayGrams,
    required int dailyTarget,
    required int todayMl,
    required int targetMl,
    String petType = 'dog',
  }) {
    final foodPct = dailyTarget > 0 ? ((todayGrams / dailyTarget) * 100).round() : 0;
    final waterPct = targetMl > 0 ? ((todayMl / targetMl) * 100).round() : 0;
    final ratio = todayGrams > 0 ? (todayMl / todayGrams).round() : 0;
    final species = SpeciesCatalog.resolve(petType);
    final idealRatio = species.idealWaterRatio;

    final tips = <SynergyTip>[];
    String status;
    String message;

    if (species.usesAquarium) {
      status = 'aquarium';
      message = '$petName (aquarium) : surveillez qualité eau et température.';
      tips.add(const SynergyTip(icon: '🐠', text: 'Poissons : pH et nitrites plus critiques que le volume bu.'));
    } else if (foodPct >= 85 && waterPct < 65) {
      status = 'dehydration_risk';
      message = 'Alimentation OK ($foodPct %) mais hydratation insuffisante ($waterPct %).';
      tips.add(const SynergyTip(icon: '💧', text: 'Placez la fontaine pres du distributeur.'));
      tips.add(const SynergyTip(icon: '🍽️', text: 'Croquettes seches = plus de besoin en eau.'));
    } else if (waterPct >= 80 && foodPct < 60) {
      status = 'low_food';
      message = 'Hydratation bonne ($waterPct %) mais ration basse ($foodPct %).';
      tips.add(const SynergyTip(icon: '🩺', text: 'Consultez un veterinaire si baisse d\'appetit.'));
    } else if (foodPct >= 85 && waterPct >= 80) {
      status = 'optimal';
      message = 'Equilibre nutrition/hydratation optimal pour $petName.';
      tips.add(const SynergyTip(icon: '✅', text: 'Maintenez horaires repas + eau fraiche 2x/jour.'));
    } else {
      status = 'balanced';
      message = '$petName : alimentation $foodPct % et hydratation $waterPct %.';
      tips.add(SynergyTip(
        icon: '📊',
        text: 'Ratio eau/nourriture : $ratio ml/g (idéal ~$idealRatio pour ${species.labelFr}).',
      ));
    }

    final combined = ((computeNutritionScore(todayGrams: todayGrams, dailyTarget: dailyTarget) +
                computeHydrationScore(todayMl: todayMl, targetMl: targetMl)) /
            2)
        .round();

    return NutritionWaterSynergy(
      status: status,
      message: message,
      foodPct: foodPct,
      waterPct: waterPct,
      ratio: ratio,
      idealRatio: idealRatio,
      tips: tips,
      combinedScore: combined,
    );
  }
}

class NutritionWaterSynergy {
  const NutritionWaterSynergy({
    required this.status,
    required this.message,
    required this.foodPct,
    required this.waterPct,
    required this.ratio,
    required this.idealRatio,
    required this.tips,
    required this.combinedScore,
  });

  final String status;
  final String message;
  final int foodPct;
  final int waterPct;
  final int ratio;
  final int idealRatio;
  final List<SynergyTip> tips;
  final int combinedScore;
}

class SynergyTip {
  const SynergyTip({required this.icon, required this.text});

  final String icon;
  final String text;
}
