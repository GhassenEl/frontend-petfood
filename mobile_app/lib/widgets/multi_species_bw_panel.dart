import 'package:flutter/material.dart';

import '../models/water_tracking.dart';
import '../services/nutrition_hydration_engine.dart';
import '../utils/species_catalog.dart';

/// Panneau noir & blanc — comparaison hydratation tous animaux du foyer.
class MultiSpeciesBwPanel extends StatelessWidget {
  const MultiSpeciesBwPanel({
    super.key,
    required this.pets,
    this.selectedPetId,
    this.onSelectPet,
    this.weightByPetId,
  });

  final List<WaterPetOverview> pets;
  final String? selectedPetId;
  final ValueChanged<String>? onSelectPet;
  final Map<String, double>? weightByPetId;

  @override
  Widget build(BuildContext context) {
    if (pets.isEmpty) return const SizedBox.shrink();

    final rows = [...pets]..sort((a, b) => effectivePct(a).compareTo(effectivePct(b)));
    final avgScore = rows.isEmpty
        ? 0
        : (rows.map((p) => _score(p)).reduce((a, b) => a + b) / rows.length).round();
    final alertCount = rows.where((p) => effectivePct(p) < 50 || p.alert).length;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1A1A1A), width: 2),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('◐', style: TextStyle(fontSize: 22, color: Color(0xFF1A1A1A), height: 1)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Vue noir & blanc — Tous les animaux',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1A1A1A)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${pets.length} espèces · score foyer $avgScore/100${alertCount > 0 ? ' · $alertCount alerte(s)' : ''}',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Moyenne hydratation foyer', style: TextStyle(color: Colors.white70, fontSize: 12)),
                Text('$avgScore/100', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          ...rows.map(_row),
        ],
      ),
    );
  }

  int _score(WaterPetOverview p) => NutritionHydrationEngine.computeHydrationScore(
        todayMl: p.todayMl,
        targetMl: effectiveTarget(p),
      );

  Widget _row(WaterPetOverview p) {
    final species = SpeciesCatalog.resolve(p.type);
    final pct = effectivePct(p);
    final score = _score(p);
    final selected = p.petId == selectedPetId;
    final critical = pct < 50 || p.alert;
    final barShade = pct >= 80
        ? const Color(0xFF1A1A1A)
        : pct >= 50
            ? const Color(0xFF525252)
            : const Color(0xFF9CA3AF);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onSelectPet != null ? () => onSelectPet!(p.petId) : null,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: selected ? const Color(0xFFE5E5E5) : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: critical ? Colors.red.shade700 : (selected ? const Color(0xFF1A1A1A) : const Color(0xFFD4D4D4)),
              width: critical ? 2 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(species.emoji, style: const TextStyle(fontSize: 20)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
                        Text(species.labelFr, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                      ],
                    ),
                  ),
                  if (critical)
                    Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.red.shade700),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('ALERTE', style: TextStyle(fontSize: 9, color: Colors.red.shade700, fontWeight: FontWeight.bold)),
                    ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A1A),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text('$score', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: pct / 100,
                  minHeight: 8,
                  backgroundColor: const Color(0xFFE5E5E5),
                  color: barShade,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                species.usesAquarium
                    ? 'Aquarium · qualité eau'
                    : '${p.todayMl} / ${effectiveTarget(p)} ml · $pct %',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
              ),
            ],
          ),
        ),
      ),
    );
  }

  int effectiveTarget(WaterPetOverview p) {
    if (p.targetMl > 0) return p.targetMl;
    final w = weightByPetId?[p.petId];
    return SpeciesCatalog.estimateTargetMl(p.type, weightKg: w);
  }

  int effectivePct(WaterPetOverview p) {
    final target = effectiveTarget(p);
    if (SpeciesCatalog.resolve(p.type).usesAquarium) return 100;
    if (p.percentOfTarget > 0) return p.percentOfTarget.clamp(0, 100);
    return target > 0 ? ((p.todayMl / target) * 100).round().clamp(0, 100) : 0;
  }
}
