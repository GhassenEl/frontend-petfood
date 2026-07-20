import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';

/// Historique d'alimentation filtrable (distributions, alertes, capteurs).
class FeederHistoryPanel extends StatelessWidget {
  const FeederHistoryPanel({
    super.key,
    required this.logs,
    required this.filter,
    required this.onFilterChanged,
    this.todayGrams = 0,
    this.weekGrams = 0,
    this.dispenseCount = 0,
  });

  final List<FeederLog> logs;
  final String filter;
  final ValueChanged<String> onFilterChanged;
  final int todayGrams;
  final int weekGrams;
  final int dispenseCount;

  static const filters = [
    ('all', 'Tout'),
    ('dispense', 'Distributions'),
    ('alert', 'Alertes'),
    ('refill', 'Recharges'),
  ];

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM HH:mm', 'fr_FR');
    final filtered = filter == 'all'
        ? logs
        : logs.where((l) => l.eventType == filter || (filter == 'dispense' && l.eventType == 'manual_request')).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Historique alimentation',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _statChip('$todayGrams g', 'Aujourd\'hui'),
                const SizedBox(width: 8),
                _statChip('$weekGrams g', '7 jours'),
                const SizedBox(width: 8),
                _statChip('$dispenseCount', 'Repas'),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: filters.map((f) {
                final selected = filter == f.$1;
                return FilterChip(
                  label: Text(f.$2),
                  selected: selected,
                  onSelected: (_) => onFilterChanged(f.$1),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            if (filtered.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: Text('Aucun événement', style: TextStyle(color: Colors.grey))),
              )
            else
              ...filtered.take(25).map((log) {
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  leading: CircleAvatar(
                    radius: 16,
                    backgroundColor: _colorFor(log.eventType).withValues(alpha: 0.15),
                    child: Icon(_iconFor(log.eventType), size: 16, color: _colorFor(log.eventType)),
                  ),
                  title: Text(
                    _label(log),
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  subtitle: Text(
                    [if (log.message != null && log.message!.isNotEmpty) log.message, if (log.createdAt != null) fmt.format(log.createdAt!)].join(' · '),
                    style: const TextStyle(fontSize: 12),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String value, String label) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              Text(label, style: const TextStyle(fontSize: 10, color: Colors.black54)),
            ],
          ),
        ),
      );

  Color _colorFor(String type) => switch (type) {
        'dispense' => const Color(0xFF059669),
        'alert' => const Color(0xFFDC2626),
        'refill' => const Color(0xFF2563EB),
        'manual_request' => const Color(0xFF7C3AED),
        _ => Colors.grey,
      };

  IconData _iconFor(String type) => switch (type) {
        'dispense' => Icons.check_circle,
        'alert' => Icons.warning,
        'refill' => Icons.inventory_2,
        'manual_request' => Icons.phone_android,
        _ => Icons.sensors,
      };

  String _label(FeederLog log) {
    switch (log.eventType) {
      case 'dispense':
        return 'Distribution ${log.portionGrams?.toInt() ?? ''} g';
      case 'alert':
        return 'Alerte réservoir';
      case 'refill':
        return 'Recharge réservoir';
      case 'manual_request':
        return 'Commande mobile ${log.portionGrams?.toInt() ?? ''} g';
      case 'dispense_failed':
        return 'Échec distribution';
      default:
        return log.eventType;
    }
  }
}
