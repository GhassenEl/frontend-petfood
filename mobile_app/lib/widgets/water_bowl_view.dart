import 'package:flutter/material.dart';
import '../models/water_tracking.dart';
import '../utils/species_catalog.dart';

class WaterBowlView extends StatelessWidget {
  const WaterBowlView({super.key, required this.tracking, this.isLive = true});

  final WaterTracking tracking;
  final bool isLive;

  @override
  Widget build(BuildContext context) {
    final monitor = tracking.monitor;
    final capacity = monitor?.reservoirCapacityMl ?? 1500;
    final level = monitor?.reservoirMl ?? ((tracking.pct / 100) * capacity).round();
    final fillPct = monitor?.reservoirPct ?? tracking.pct.clamp(0, 100);
    final online = monitor?.online ?? isLive;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFE0F2FE), Color(0xFFF0F9FF)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBAE6FD)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${SpeciesCatalog.emoji(tracking.petType)} ${monitor?.name ?? 'Fontaine connectee'}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  Icon(online ? Icons.wifi : Icons.wifi_off, size: 16, color: online ? const Color(0xFF0EA5E9) : Colors.grey),
                  const SizedBox(width: 4),
                  Text(online ? 'LIVE' : 'Hors ligne', style: TextStyle(fontSize: 12, color: online ? const Color(0xFF0EA5E9) : Colors.grey)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 140,
            child: Stack(
              alignment: Alignment.bottomCenter,
              children: [
                Container(
                  width: 160,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(80)),
                    border: Border.all(color: const Color(0xFF7DD3FC), width: 3),
                  ),
                  child: Align(
                    alignment: Alignment.bottomCenter,
                    child: FractionallySizedBox(
                      heightFactor: fillPct / 100,
                      widthFactor: 1,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              const Color(0xFF38BDF8).withValues(alpha: 0.5),
                              const Color(0xFF0EA5E9),
                            ],
                          ),
                          borderRadius: const BorderRadius.vertical(bottom: Radius.circular(77)),
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  child: Text('$fillPct%', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0369A1))),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _stat('${tracking.todayMl} ml', 'Aujourd\'hui'),
              _stat('${monitor?.waterTempC?.toStringAsFixed(1) ?? '—'} °C', 'Temperature'),
              _stat('$level / $capacity ml', 'Reservoir'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Column(
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
        ],
      );
}
