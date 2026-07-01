import '../models/food_quality.dart';
import '../models/food_quality_ai.dart';

/// Module IA mobile — classification, moisissures, stock, péremption.
class FoodQualityAiEngine {
  /// Analyse complète à partir des métriques ESP32-CAM.
  static FoodAiInsights analyze({
    required int qualityScore,
    required double moldPixelRatio,
    required double insectPixelRatio,
    required double temperatureC,
    required double humidityPct,
    required int stockLevelPct,
    required double colorShiftScore,
  }) {
    final classification = FoodAiClass.fromScore(qualityScore, moldRatio: moldPixelRatio);
    final classConfidence = _classificationConfidence(qualityScore, moldPixelRatio);

    final moldVision = _detectMoldVision(moldPixelRatio, colorShiftScore);
    final stock = _estimateStock(stockLevelPct, moldPixelRatio);
    final expiration = _predictExpiration(
      qualityScore: qualityScore,
      moldPixelRatio: moldPixelRatio,
      temperatureC: temperatureC,
      humidityPct: humidityPct,
      classification: classification,
    );

    return FoodAiInsights(
      classification: classification,
      classificationConfidence: classConfidence,
      moldVision: moldVision,
      stockEstimation: stock,
      expiration: expiration,
    );
  }

  static FoodQualityReading enrich(FoodQualityReading reading) {
    final mold = reading.moldPixelRatio ?? 0;
    final colorShift = _colorShiftFromRgb(reading.avgR, reading.avgG, reading.avgB);
    final insights = analyze(
      qualityScore: reading.qualityScore,
      moldPixelRatio: mold,
      insectPixelRatio: reading.insectPixelRatio ?? 0,
      temperatureC: reading.temperatureC ?? 22,
      humidityPct: reading.humidityPct ?? 45,
      stockLevelPct: reading.stockLevelPct ?? 65,
      colorShiftScore: colorShift,
    );

    final cls = insights.classification;
    final exp = insights.expiration;
    final moldV = insights.moldVision;

    return FoodQualityReading(
      quality: reading.quality,
      qualityScore: reading.qualityScore,
      state: cls.id == FoodAiClass.degraded.id ? cls.label : reading.state,
      label: cls.label,
      temperatureC: reading.temperatureC,
      humidityPct: reading.humidityPct,
      stockLevelPct: insights.stockEstimation.levelPct,
      moldPixelRatio: reading.moldPixelRatio,
      insectPixelRatio: reading.insectPixelRatio,
      avgR: reading.avgR,
      avgG: reading.avgG,
      avgB: reading.avgB,
      isCritical: reading.isCritical,
      isNonConforme: reading.isNonConforme,
      anomalyDetected: reading.anomalyDetected || moldV.detected,
      recommendedAction: _actionForClass(cls, exp.daysRemaining),
      aiSummary: _buildSummary(cls, insights),
      analyzedAt: reading.analyzedAt,
      aiClassification: cls.id,
      aiClassificationLabel: cls.label,
      aiClassificationConfidence: insights.classificationConfidence,
      moldDetected: moldV.detected,
      moldSeverity: moldV.severity,
      moldConfidence: moldV.confidence,
      moldRegions: moldV.regions,
      stockEstimateConfidence: insights.stockEstimation.confidence,
      expirationDate: exp.estimatedDate,
      expirationDaysRemaining: exp.daysRemaining,
      expirationConfidence: exp.confidence,
      expirationRisk: exp.riskLevel,
    );
  }

  static double _classificationConfidence(int score, double mold) {
    var c = 0.78 + (score / 100) * 0.15;
    if (mold > 0.08) c += 0.05;
    if (score >= 75 || score < 50) c += 0.04;
    return c.clamp(0.72, 0.97);
  }

  static MoldVisionResult _detectMoldVision(double moldRatio, double colorShift) {
    final pct = moldRatio * 100;
    final detected = moldRatio > 0.025 || (colorShift > 28 && moldRatio > 0.015);
    String severity = 'none';
    if (moldRatio > 0.12) {
      severity = 'high';
    } else if (moldRatio > 0.06) {
      severity = 'medium';
    } else if (detected) {
      severity = 'low';
    }
    final confidence = detected
        ? (0.82 + moldRatio * 0.8).clamp(0.75, 0.96)
        : (0.88 - moldRatio * 2).clamp(0.80, 0.94);
    final regions = detected ? (1 + (moldRatio * 20).round()).clamp(1, 8) : 0;
    return MoldVisionResult(
      detected: detected,
      pixelRatioPct: double.parse(pct.toStringAsFixed(2)),
      severity: severity,
      confidence: double.parse(confidence.toStringAsFixed(2)),
      regions: regions,
    );
  }

  static StockEstimation _estimateStock(int levelPct, double moldRatio) {
    final adjusted = (levelPct * (1 - moldRatio * 0.3)).round().clamp(5, 95);
    final confidence = (0.85 - moldRatio * 0.5).clamp(0.70, 0.92);
    String label;
    if (adjusted < 20) {
      label = 'Récipient presque vide';
    } else if (adjusted < 40) {
      label = 'Stock faible — réapprovisionner';
    } else {
      label = 'Niveau suffisant';
    }
    return StockEstimation(
      levelPct: adjusted,
      confidence: double.parse(confidence.toStringAsFixed(2)),
      label: label,
    );
  }

  static ExpirationPrediction _predictExpiration({
    required int qualityScore,
    required double moldPixelRatio,
    required double temperatureC,
    required double humidityPct,
    required FoodAiClass classification,
  }) {
    var baseDays = 21;
    if (classification == FoodAiClass.acceptable) {
      baseDays = 10;
    } else if (classification == FoodAiClass.degraded) {
      baseDays = 2;
    }

    if (temperatureC > 26) baseDays -= 4;
    if (humidityPct > 65) baseDays -= 3;
    if (moldPixelRatio > 0.06) baseDays -= 5;
    if (qualityScore >= 85) baseDays += 3;

    final days = baseDays.clamp(1, 30);
    final date = DateTime.now().add(Duration(days: days));

    String risk = 'low';
    if (days <= 3 || classification == FoodAiClass.degraded) {
      risk = 'high';
    } else if (days <= 10) {
      risk = 'medium';
    }

    final confidence = (0.75 + (qualityScore / 200) - moldPixelRatio).clamp(0.68, 0.93);

    return ExpirationPrediction(
      estimatedDate: date,
      daysRemaining: days,
      confidence: double.parse(confidence.toStringAsFixed(2)),
      riskLevel: risk,
    );
  }

  static double _colorShiftFromRgb(int? r, int? g, int? b) {
    if (r == null || g == null) return 0;
    return ((g - r * 0.3).abs() + (165 - r).abs()) / 3;
  }

  static String _actionForClass(FoodAiClass cls, int daysLeft) {
    if (cls == FoodAiClass.degraded) return 'Remplacer l\'aliment immédiatement';
    if (daysLeft <= 3) return 'Consommer ou remplacer sous 3 jours';
    if (cls == FoodAiClass.acceptable) return 'Surveiller et ventiler le bac';
    return 'Aucune action — conservation OK';
  }

  static String _buildSummary(FoodAiClass cls, FoodAiInsights insights) {
    final mold = insights.moldVision;
    final exp = insights.expiration;
    final moldTxt = mold.detected ? 'Moisissure IA : ${mold.severity} (${mold.pixelRatioPct}%). ' : '';
    return 'IA : ${cls.label} (${(insights.classificationConfidence * 100).round()}%). '
        '$moldTxt'
        'Péremption ~${exp.daysRemaining} j (${(exp.confidence * 100).round()}% confiance).';
  }
}
