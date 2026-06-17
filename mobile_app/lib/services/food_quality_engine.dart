import '../models/food_quality.dart';
import 'food_quality_ai_engine.dart';

/// Moteur démo aligné sur le frontend PetFoodTN (ESP32-CAM).
class FoodQualityEngine {
  static int _scenarioIndex = 0;

  static FoodQualityReading analyze({
    double avgR = 140,
    double avgG = 110,
    double avgB = 70,
    double moldPixelRatio = 0,
    double insectPixelRatio = 0,
    double temperatureC = 22,
    double humidityPct = 45,
    int stockLevelPct = 65,
  }) {
    var score = 92;

    if (temperatureC > 28) {
      score -= 35;
    } else if (temperatureC > 25) {
      score -= 18;
    } else if (temperatureC > 22) {
      score -= 8;
    }

    if (humidityPct > 70) {
      score -= 30;
    } else if (humidityPct > 60) {
      score -= 15;
    }

    if (moldPixelRatio > 0.12) {
      score -= 40;
    } else if (moldPixelRatio > 0.06) {
      score -= 22;
    } else if (moldPixelRatio > 0.03) {
      score -= 10;
    }

    if (insectPixelRatio > 0.025) {
      score -= 35;
    } else if (insectPixelRatio > 0.012) {
      score -= 18;
    }

    score = score.clamp(0, 100);

    String quality = 'good';
    if (score < 40) {
      quality = 'critical';
    } else if (score < 50) {
      quality = 'bad';
    } else if (score < 75) {
      quality = 'warning';
    }

    final isCritical = score < 40;
    final isNonConforme = score < 50;
    final anomalyDetected = moldPixelRatio > 0.04 || insectPixelRatio > 0.008 || temperatureC > 26;

    String state;
    if (isNonConforme && !isCritical) {
      state = 'Nourriture non conforme';
    } else if (quality == 'good') {
      state = 'Bon';
    } else if (quality == 'warning') {
      state = 'Limite';
    } else {
      state = 'Aliment altéré';
    }

    final action = isCritical || quality == 'bad'
        ? 'Remplacer l\'aliment'
        : quality == 'warning'
            ? 'Surveiller et ventiler le bac'
            : 'Aucune action';

    return FoodQualityAiEngine.enrich(FoodQualityReading(
      quality: quality,
      qualityScore: score,
      state: state,
      label: quality,
      temperatureC: temperatureC,
      humidityPct: humidityPct,
      stockLevelPct: stockLevelPct,
      moldPixelRatio: moldPixelRatio,
      insectPixelRatio: insectPixelRatio,
      avgR: avgR.round(),
      avgG: avgG.round(),
      avgB: avgB.round(),
      isCritical: isCritical,
      isNonConforme: isNonConforme,
      anomalyDetected: anomalyDetected,
      recommendedAction: action,
      aiSummary: isNonConforme
          ? 'Anomalie IA — $state ($score%). $action.'
          : 'Qualité $state ($score%) — stock $stockLevelPct %.',
      analyzedAt: DateTime.now(),
    ));
  }

  static FoodQualityReading simulate([String? scenario]) {
    const scenarios = [
      {'name': 'good', 'r': 165.0, 'g': 120.0, 'b': 75.0, 'mold': 0.01, 'insect': 0.0, 't': 20.0, 'h': 42.0, 'stock': 65},
      {'name': 'warning', 'r': 130.0, 'g': 135.0, 'b': 80.0, 'mold': 0.05, 'insect': 0.005, 't': 26.0, 'h': 62.0, 'stock': 38},
      {'name': 'deteriorated', 'r': 98.0, 'g': 138.0, 'b': 74.0, 'mold': 0.08, 'insect': 0.012, 't': 26.0, 'h': 64.0, 'stock': 30},
      {'name': 'critical', 'r': 75.0, 'g': 160.0, 'b': 65.0, 'mold': 0.18, 'insect': 0.032, 't': 31.0, 'h': 78.0, 'stock': 15},
    ];

    Map<String, dynamic> base;
    if (scenario != null) {
      base = scenarios.firstWhere((s) => s['name'] == scenario, orElse: () => scenarios[0]);
    } else {
      base = scenarios[_scenarioIndex % scenarios.length];
      _scenarioIndex++;
    }

    var reading = analyze(
      avgR: base['r'] as double,
      avgG: base['g'] as double,
      avgB: base['b'] as double,
      moldPixelRatio: base['mold'] as double,
      insectPixelRatio: base['insect'] as double,
      temperatureC: base['t'] as double,
      humidityPct: base['h'] as double,
      stockLevelPct: base['stock'] as int,
    );

    if (scenario == 'deteriorated') {
      reading = FoodQualityAiEngine.enrich(FoodQualityReading(
        quality: 'bad',
        qualityScore: 42,
        state: 'Nourriture non conforme',
        label: 'Mauvaise',
        temperatureC: reading.temperatureC,
        humidityPct: reading.humidityPct,
        stockLevelPct: reading.stockLevelPct,
        moldPixelRatio: reading.moldPixelRatio,
        insectPixelRatio: reading.insectPixelRatio,
        avgR: reading.avgR,
        avgG: reading.avgG,
        avgB: reading.avgB,
        isCritical: false,
        isNonConforme: true,
        anomalyDetected: true,
        recommendedAction: 'Remplacer l\'aliment',
        aiSummary: 'Anomalie IA détectée — nourriture dégradée (42%).',
        analyzedAt: DateTime.now(),
      ));
    }

    return reading;
  }

  static FoodQualityState demoState() {
    final history = [
      simulate('good'),
      simulate('warning'),
      simulate('deteriorated'),
    ];
    return FoodQualityState(
      mode: 'demo',
      current: history.first,
      history: history,
      device: FoodQualityDevice(
        id: 'demo-esp32cam-1',
        name: 'ESP32-CAM — Récipient Max',
        petName: 'Max',
        model: 'ESP32-CAM + DHT11 + OLED',
      ),
    );
  }
}
