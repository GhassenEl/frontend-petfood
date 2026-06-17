import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/food_quality.dart';
import '../models/food_quality_ai.dart';

/// Panneau fonctionnalités IA — classification, moisissures, stock, péremption.
class FoodQualityAiPanel extends StatelessWidget {
  const FoodQualityAiPanel({super.key, required this.reading});

  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final cls = _resolveClass(reading);
    final clsColor = Color(cls.colorValue);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Fonctionnalités IA',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        const Text(
          'Classification automatique · Vision moisissures · Stock · Péremption',
          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        const SizedBox(height: 12),
        _ClassificationCard(reading: reading, cls: cls, color: clsColor),
        const SizedBox(height: 10),
        _MoldVisionCard(reading: reading),
        const SizedBox(height: 10),
        _StockCard(reading: reading),
        const SizedBox(height: 10),
        _ExpirationCard(reading: reading),
      ],
    );
  }

  FoodAiClass _resolveClass(FoodQualityReading r) {
    if (r.aiClassification != null) {
      return FoodAiClass.values.firstWhere(
        (c) => c.id == r.aiClassification,
        orElse: () => FoodAiClass.fromScore(r.qualityScore, moldRatio: r.moldPixelRatio ?? 0),
      );
    }
    return FoodAiClass.fromScore(r.qualityScore, moldRatio: r.moldPixelRatio ?? 0);
  }
}

class _ClassificationCard extends StatelessWidget {
  const _ClassificationCard({required this.reading, required this.cls, required this.color});

  final FoodQualityReading reading;
  final FoodAiClass cls;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final conf = ((reading.aiClassificationConfidence ?? 0.85) * 100).round();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.auto_awesome, size: 18, color: Color(0xFF7C3AED)),
                SizedBox(width: 8),
                Text('Classification automatique', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: FoodAiClass.values.map((c) {
                final selected = c.id == cls.id;
                return FilterChip(
                  selected: selected,
                  label: Text(c.label, style: TextStyle(fontSize: 11, color: selected ? Colors.white : null)),
                  selectedColor: Color(c.colorValue),
                  onSelected: null,
                  avatar: selected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                );
              }).toList(),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: color.withValues(alpha: 0.35)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(cls.label, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 15)),
                  Text('Confiance IA : $conf% · Score ${reading.qualityScore}%'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MoldVisionCard extends StatelessWidget {
  const _MoldVisionCard({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final detected = reading.moldDetected ?? ((reading.moldPixelRatio ?? 0) > 0.025);
    final severity = reading.moldSeverity ?? 'none';
    final conf = ((reading.moldConfidence ?? 0.88) * 100).round();
    final pct = ((reading.moldPixelRatio ?? 0) * 100).toStringAsFixed(2);
    final regions = reading.moldRegions ?? 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.camera_alt, size: 18, color: detected ? const Color(0xFFDC2626) : const Color(0xFF059669)),
                const SizedBox(width: 8),
                const Text('Détection moisissures (vision IA)', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 10),
            _AiRow('Statut', detected ? 'Détectée' : 'Aucune'),
            _AiRow('Pixels suspects', '$pct %'),
            _AiRow('Sévérité', _severityLabel(severity)),
            if (regions > 0) _AiRow('Zones analysées', '$regions région(s)'),
            _AiRow('Confiance modèle', '$conf %'),
            if (detected)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text('Analyse CNN sur image ESP32-CAM RGB565', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ),
          ],
        ),
      ),
    );
  }

  String _severityLabel(String s) {
    switch (s) {
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Modérée';
      case 'low':
        return 'Faible';
      default:
        return 'Aucune';
    }
  }
}

class _StockCard extends StatelessWidget {
  const _StockCard({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final level = reading.stockLevelPct ?? 65;
    final conf = ((reading.stockEstimateConfidence ?? 0.85) * 100).round();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.inventory_2, size: 18, color: Color(0xFF2563EB)),
                SizedBox(width: 8),
                Text('Estimation quantité restante', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: level / 100,
              minHeight: 10,
              borderRadius: BorderRadius.circular(6),
              backgroundColor: const Color(0xFFE2E8F0),
              color: level < 25 ? const Color(0xFFDC2626) : const Color(0xFF059669),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('$level % restant', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Confiance $conf %', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              level < 25 ? 'Réapprovisionner le récipient' : 'Estimation par couverture surface vision',
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExpirationCard extends StatelessWidget {
  const _ExpirationCard({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final days = reading.expirationDaysRemaining ?? 14;
    final date = reading.expirationDate ?? DateTime.now().add(Duration(days: days));
    final conf = ((reading.expirationConfidence ?? 0.8) * 100).round();
    final risk = reading.expirationRisk ?? 'low';
    final riskColor = risk == 'high'
        ? const Color(0xFFDC2626)
        : risk == 'medium'
            ? const Color(0xFFD97706)
            : const Color(0xFF059669);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.event, size: 18, color: Color(0xFF7C3AED)),
                SizedBox(width: 8),
                Text('Prédiction date de péremption', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F3FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Text('$days', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED))),
                      const Text('jours', style: TextStyle(fontSize: 11)),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(DateFormat('dd MMM yyyy', 'fr_FR').format(date), style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('Confiance prédiction : $conf %', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      const SizedBox(height: 4),
                      Text(_riskLabel(risk), style: TextStyle(fontSize: 12, color: riskColor, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _riskLabel(String risk) {
    switch (risk) {
      case 'high':
        return 'Risque élevé — consommer ou remplacer rapidement';
      case 'medium':
        return 'Surveiller la date limite';
      default:
        return 'Conservation optimale prévue';
    }
  }
}

class _AiRow extends StatelessWidget {
  const _AiRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}
