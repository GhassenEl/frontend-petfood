import 'package:flutter/material.dart';

import '../models/water_tracking.dart';
import '../utils/species_catalog.dart';

/// Fiche aquarium pour poissons — qualité eau au lieu du bol classique.
class AquariumView extends StatelessWidget {
  const AquariumView({super.key, required this.tracking});

  final WaterTracking tracking;

  @override
  Widget build(BuildContext context) {
    final m = tracking.monitor;
    final temp = m?.waterTempC ?? 24.0;
    final vol = m?.reservoirMl ?? 60000;
    final filterDays = m?.filterDaysLeft ?? 21;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF0C4A6E), Color(0xFF0369A1), Color(0xFF0EA5E9)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF7DD3FC)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🐠', style: TextStyle(fontSize: 28)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      m?.name ?? 'Aquarium ${tracking.petName}',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      'Mode aquarium — qualité eau',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12),
                    ),
                  ],
                ),
              ),
              Icon(m?.online == true ? Icons.wifi : Icons.wifi_off, color: Colors.white70, size: 18),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _metric('${temp.toStringAsFixed(1)}°C', 'Température', temp >= 22 && temp <= 26),
              _metric('${(vol / 1000).toStringAsFixed(0)} L', 'Volume', true),
              _metric('$filterDays j', 'Filtre', filterDays > 7),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(
                  m?.pumpActive == true ? Icons.waves : Icons.pause_circle_outline,
                  color: Colors.white,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    m?.pumpActive == true
                        ? 'Filtration active — surveillez pH et nitrites'
                        : 'Filtration en veille',
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            tracking.hydrationTip ?? SpeciesCatalog.resolve('fish').hydrationTip,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _metric(String value, String label, bool ok) => Column(
        children: [
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11)),
          const SizedBox(height: 4),
          Icon(ok ? Icons.check_circle : Icons.warning_amber, color: ok ? Colors.greenAccent : Colors.amber, size: 16),
        ],
      );
}
