import 'package:flutter/material.dart';

/// Visualisation gamelle + réservoir (miroir web FeederLiveBowl).
class FeederBowlViewport extends StatelessWidget {
  const FeederBowlViewport({
    super.key,
    required this.petName,
    required this.reservoirPercent,
    required this.todayGrams,
    required this.dailyTarget,
    this.isLowFood = false,
    this.animalPresent = false,
    this.isOnline = true,
  });

  final String petName;
  final double? reservoirPercent;
  final int todayGrams;
  final int dailyTarget;
  final bool isLowFood;
  final bool animalPresent;
  final bool isOnline;

  @override
  Widget build(BuildContext context) {
    final pct = (reservoirPercent ?? 42).clamp(8.0, 92.0);
    final adherence = dailyTarget > 0 ? ((todayGrams / dailyTarget) * 100).round().clamp(0, 100) : 0;
    final kibbleColors = isLowFood
        ? [const Color(0xFFFCD34D), const Color(0xFFB45309)]
        : [const Color(0xFFD4A574), const Color(0xFF8B6914)];

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: const Color(0xFF0F172A),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isOnline ? const Color(0xFF22C55E) : Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  isOnline ? 'NOURRITURE LIVE' : 'DISTRIBUTEUR OFFLINE',
                  style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                if (animalPresent) ...[
                  const Spacer(),
                  const Text('Animal détecté', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 11)),
                ],
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      Container(
                        height: 120,
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFCBD5E1), width: 3),
                          borderRadius: BorderRadius.circular(0, 0, 80, 80),
                        ),
                        child: Align(
                          alignment: Alignment.bottomCenter,
                          child: FractionallySizedBox(
                            heightFactor: pct / 100,
                            child: Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: kibbleColors,
                                ),
                                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(72)),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text('$petName · ${reservoirPercent?.toStringAsFixed(0) ?? '—'} %', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _tag('$todayGrams g aujourd\'hui'),
                      const SizedBox(height: 6),
                      _tag('Objectif $dailyTarget g'),
                      const SizedBox(height: 6),
                      _tag('$adherence % adhérence'),
                      if (isLowFood) ...[
                        const SizedBox(height: 8),
                        const Row(
                          children: [
                            Icon(Icons.warning_amber, size: 14, color: Color(0xFFB45309)),
                            SizedBox(width: 4),
                            Text('Recharge recommandée', style: TextStyle(fontSize: 11, color: Color(0xFFB45309), fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tag(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      );
}
