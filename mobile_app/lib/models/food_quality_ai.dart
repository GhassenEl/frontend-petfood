/// Classification IA automatique des aliments.
enum FoodAiClass {
  fresh('fresh', 'Nourriture fraîche', 0xFF059669),
  acceptable('acceptable', 'Nourriture acceptable', 0xFFD97706),
  degraded('degraded', 'Nourriture dégradée', 0xFFDC2626);

  const FoodAiClass(this.id, this.label, this.colorValue);
  final String id;
  final String label;
  final int colorValue;

  static FoodAiClass fromScore(int score, {double moldRatio = 0}) {
    if (score < 50 || moldRatio > 0.1) return FoodAiClass.degraded;
    if (score < 75 || moldRatio > 0.04) return FoodAiClass.acceptable;
    return FoodAiClass.fresh;
  }
}

class MoldVisionResult {
  const MoldVisionResult({
    required this.detected,
    required this.pixelRatioPct,
    required this.severity,
    required this.confidence,
    this.regions = 0,
  });

  final bool detected;
  final double pixelRatioPct;
  final String severity;
  final double confidence;
  final int regions;

  String get label => detected ? 'Moisissure détectée (vision IA)' : 'Aucune moisissure détectée';
}

class StockEstimation {
  const StockEstimation({
    required this.levelPct,
    required this.confidence,
    required this.label,
  });

  final int levelPct;
  final double confidence;
  final String label;
}

class ExpirationPrediction {
  const ExpirationPrediction({
    required this.estimatedDate,
    required this.daysRemaining,
    required this.confidence,
    required this.riskLevel,
  });

  final DateTime estimatedDate;
  final int daysRemaining;
  final double confidence;
  final String riskLevel;

  String get riskLabel {
    switch (riskLevel) {
      case 'high':
        return 'Risque élevé — consommer rapidement';
      case 'medium':
        return 'Surveiller la date limite';
      default:
        return 'Conservation optimale';
    }
  }
}

class FoodAiInsights {
  const FoodAiInsights({
    required this.classification,
    required this.classificationConfidence,
    required this.moldVision,
    required this.stockEstimation,
    required this.expiration,
  });

  final FoodAiClass classification;
  final double classificationConfidence;
  final MoldVisionResult moldVision;
  final StockEstimation stockEstimation;
  final ExpirationPrediction expiration;
}
