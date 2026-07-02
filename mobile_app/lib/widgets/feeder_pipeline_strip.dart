import 'package:flutter/material.dart';

/// Chaîne capteurs ESP32 — IR → Servo → Moteur → HX711 → HC-SR04.
class FeederPipelineStrip extends StatelessWidget {
  const FeederPipelineStrip({
    super.key,
    this.isOnline = true,
    this.animalPresent = false,
    this.lastWeightG,
  });

  final bool isOnline;
  final bool animalPresent;
  final double? lastWeightG;

  @override
  Widget build(BuildContext context) {
    final steps = [
      _Step('👀', 'IR', animalPresent ? 'Animal détecté' : 'En veille', animalPresent),
      _Step('⚙️', 'Servo', 'Trappe', isOnline),
      _Step('🔩', 'Moteur', 'Vis doseuse', isOnline),
      _Step('⚖️', 'HX711', lastWeightG != null ? '${lastWeightG!.toStringAsFixed(0)} g' : 'Balance', isOnline),
      _Step('📡', 'HC-SR04', 'Réservoir', isOnline),
    ];

    return Card(
      color: const Color(0xFFF8FAFC),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var i = 0; i < steps.length; i++) ...[
                _buildStep(steps[i]),
                if (i < steps.length - 1)
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(Icons.arrow_forward, size: 16, color: Color(0xFF94A3B8)),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep(_Step s) => Container(
        width: 88,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: s.active ? const Color(0xFF6EE7B7) : const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Text(s.emoji, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 4),
            Text(s.label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: s.active ? const Color(0xFF059669) : const Color(0xFF334155))),
            Text(s.desc, textAlign: TextAlign.center, style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
          ],
        ),
      );
}

class _Step {
  const _Step(this.emoji, this.label, this.desc, this.active);
  final String emoji;
  final String label;
  final String desc;
  final bool active;
}
