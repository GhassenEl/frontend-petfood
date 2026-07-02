import 'package:flutter/material.dart';

/// Histogramme 7 jours consommation croquettes (sans dépendance chart).
class FeederWeeklyBars extends StatelessWidget {
  const FeederWeeklyBars({
    super.key,
    required this.gramsByDay,
    required this.dailyTarget,
  });

  final List<int> gramsByDay;
  final int dailyTarget;

  static const _days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  @override
  Widget build(BuildContext context) {
    final data = gramsByDay.length >= 7 ? gramsByDay.sublist(gramsByDay.length - 7) : gramsByDay;
    final maxVal = [dailyTarget, ...data].reduce((a, b) => a > b ? a : b).clamp(1, 9999);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Consommation — 7 jours', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            SizedBox(
              height: 100,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(data.length, (i) {
                  final g = data[i];
                  final h = (g / maxVal * 80).clamp(4.0, 80.0);
                  final over = g > dailyTarget;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text('$g', style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                          const SizedBox(height: 2),
                          Container(
                            height: h,
                            decoration: BoxDecoration(
                              color: over ? const Color(0xFF2563EB) : const Color(0xFF059669),
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(_days[i % _days.length], style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 8),
            Text('Ligne objectif : $dailyTarget g/jour', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }
}
