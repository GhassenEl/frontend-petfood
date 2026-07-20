import 'package:flutter/material.dart';

/// Balance HX711 — poids en gamelle et dernière portion servie.
class FeederScaleCard extends StatelessWidget {
  const FeederScaleCard({
    super.key,
    required this.foodGrams,
    this.lastPortionGrams,
    this.animalPresent = false,
  });

  final double? foodGrams;
  final double? lastPortionGrams;
  final bool animalPresent;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFFF8FAFC),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.scale, color: Color(0xFF2563EB)),
                SizedBox(width: 8),
                Text(
                  'Balance HX711 intégrée',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Mesure en temps réel le poids dans la gamelle et vérifie chaque portion servie.',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _metric(
                    label: 'Poids gamelle',
                    value: foodGrams != null ? '${foodGrams!.toStringAsFixed(1)} g' : '—',
                    icon: Icons.restaurant,
                    color: const Color(0xFF059669),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _metric(
                    label: 'Dernière portion',
                    value: lastPortionGrams != null ? '${lastPortionGrams!.toStringAsFixed(0)} g' : '—',
                    icon: Icons.check_circle_outline,
                    color: const Color(0xFF7C3AED),
                  ),
                ),
              ],
            ),
            if (animalPresent) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.pets, size: 16, color: Color(0xFF059669)),
                    SizedBox(width: 6),
                    Text('Animal détecté (IR)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _metric({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
