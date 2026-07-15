import 'dart:math';

import '../models/models.dart';

class AiAdvice {
  AiAdvice({
    required this.headline,
    required this.summary,
    required this.predictedMarathon,
    required this.tips,
    required this.nextSession,
    required this.riskLevel,
    required this.generatedAt,
  });

  final String headline;
  final String summary;
  final String predictedMarathon;
  final List<String> tips;
  final String nextSession;
  final String riskLevel;
  final DateTime generatedAt;

  Map<String, dynamic> toJson() => {
        'headline': headline,
        'summary': summary,
        'predictedMarathon': predictedMarathon,
        'tips': tips,
        'nextSession': nextSession,
        'riskLevel': riskLevel,
        'generatedAt': generatedAt.toIso8601String(),
      };

  factory AiAdvice.fromJson(Map<String, dynamic> json) => AiAdvice(
        headline: json['headline'] as String,
        summary: json['summary'] as String,
        predictedMarathon: json['predictedMarathon'] as String,
        tips: (json['tips'] as List).cast<String>(),
        nextSession: json['nextSession'] as String,
        riskLevel: json['riskLevel'] as String,
        generatedAt: DateTime.parse(json['generatedAt'] as String),
      );
}

/// Coach IA local (règles + estimation Riegel) — pas d’API externe.
class AiCoach {
  static AiAdvice analyze({
    required List<RunEntry> runs,
    required AthleteProfile profile,
    required Random rng,
  }) {
    final weekStart = DateTime.now().subtract(
      Duration(days: DateTime.now().weekday - 1),
    );
    final day0 = DateTime(weekStart.year, weekStart.month, weekStart.day);
    final weekKm = runs
        .where((r) => !r.date.isBefore(day0))
        .fold(0.0, (a, r) => a + r.distanceKm);
    final recent = runs.take(5).toList();
    final longRuns = runs.where((r) => r.distanceKm >= 16).length;

    final prediction = _predictMarathon(runs);
    final loadRatio = weekKm / max(profile.weeklyGoalKm, 1);
    final risk = loadRatio > 1.15
        ? 'Élevé'
        : loadRatio < 0.45
            ? 'Sous-entraînement'
            : 'Maîtrisé';

    final tips = <String>[
      if (weekKm < profile.weeklyGoalKm * 0.6)
        'Augmente progressivement le volume (+10 % max / semaine).'
      else if (weekKm > profile.weeklyGoalKm * 1.1)
        'Réduis légèrement le volume : risque de surcharge.'
      else
        'Volume hebdo aligné avec ton objectif — excellent.',
      if (longRuns < 2)
        'Planifie une sortie longue (≥ 18 km) ce week-end.'
      else
        'Tes sorties longues sont régulières : garde 1 jour de récup.',
      if (recent.any((r) => r.type.toLowerCase().contains('fraction')))
        'Après le fractionné, privilégie une séance facile demain.'
      else
        'Ajoute une séance de VMA (ex. 6x800m) cette semaine.',
      'Hydratation : 500 ml dans l’heure qui suit chaque run.',
      'Sommeil cible : 7h30–8h pour assimiler la charge.',
    ];

    final nextSession = switch (rng.nextInt(3)) {
      0 => 'Endurance 10 km · allure conversationnelle',
      1 => 'Fractionné 8x400m · récup 90s · échauffement 15 min',
      _ => 'Sortie longue 20 km · dernier 3 km un peu plus vite',
    };

    final headline = prediction != null
        ? 'Estimation marathon : $prediction'
        : 'Construisons ta base aérobie';

    final summary = recent.isEmpty
        ? 'Aucune course récente. Commence par 3 sorties faciles cette semaine pour activer le coach.'
        : 'Sur ${recent.length} sorties récentes (${weekKm.toStringAsFixed(0)} km cette semaine), '
            'ton profil vise ${profile.targetMarathon}. '
            'Charge actuelle : $risk.';

    return AiAdvice(
      headline: headline,
      summary: summary,
      predictedMarathon: prediction ?? 'Données insuffisantes',
      tips: tips.take(4).toList(),
      nextSession: nextSession,
      riskLevel: risk,
      generatedAt: DateTime.now(),
    );
  }

  /// Formule de Riegel à partir de la meilleure perf récente ≥ 8 km.
  static String? _predictMarathon(List<RunEntry> runs) {
    final candidates = runs.where((r) => r.distanceKm >= 8).toList();
    if (candidates.isEmpty) return null;
    candidates.sort((a, b) {
      final pa = a.duration.inSeconds / a.distanceKm;
      final pb = b.duration.inSeconds / b.distanceKm;
      return pa.compareTo(pb);
    });
    final best = candidates.first;
    const marathonKm = 42.195;
    final t2 = best.duration.inSeconds *
        pow(marathonKm / best.distanceKm, 1.06);
    final total = Duration(seconds: t2.round());
    final h = total.inHours;
    final m = total.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = total.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }
}
