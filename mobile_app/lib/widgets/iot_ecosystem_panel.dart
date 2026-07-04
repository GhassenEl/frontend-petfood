import 'package:flutter/material.dart';
import '../models/iot_pack.dart';

/// Panneau écosystème IoT — aligné sur le Centre IoT web (`/client/iot/pack`).
class IotEcosystemPanel extends StatelessWidget {
  const IotEcosystemPanel({
    super.key,
    required this.pack,
    this.onRefresh,
    this.compact = false,
  });

  final IotPack pack;
  final VoidCallback? onRefresh;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = pack.counts;
    final anomalies = pack.anomalies.take(compact ? 2 : 4).toList();

    return Card(
      elevation: 0,
      color: const Color(0xFFF0FDF4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFBBF7D0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.hub, size: 20, color: Color(0xFF059669)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    pack.isLive ? 'Écosystème IoT — API live' : 'Écosystème IoT — démo',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                ),
                if (onRefresh != null)
                  IconButton(
                    icon: const Icon(Icons.refresh, size: 20),
                    onPressed: onRefresh,
                    tooltip: 'Actualiser IoT',
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _chip('Score', '${pack.healthScore}%'),
                _chip('En ligne', '${pack.devicesOnline}/${pack.devices.length}'),
                _chip('Distributeurs', '${c.feedersOnline}/${c.feeders}'),
                _chip('ESP32-CAM', '${c.feederCamsOnline}/${c.feederCams}'),
                _chip('Fontaines', '${c.waterOnline}/${c.waterMonitors}'),
                _chip('Alertes', '${c.alerts}', warn: c.alerts > 0),
              ],
            ),
            if (!compact && pack.devices.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Appareils', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
              const SizedBox(height: 6),
              ...pack.devices.take(4).map(_deviceRow),
            ],
            if (anomalies.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Anomalies détectées', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
              const SizedBox(height: 6),
              ...anomalies.map(_anomalyRow),
            ],
          ],
        ),
      ),
    );
  }

  Widget _chip(String label, String value, {bool warn = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: warn ? const Color(0xFFFFF7ED) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: warn ? const Color(0xFFFDBA74) : const Color(0xFFE2E8F0)),
      ),
      child: Text(
        '$label · $value',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: warn ? const Color(0xFFC2410C) : const Color(0xFF334155),
        ),
      ),
    );
  }

  Widget _deviceRow(IotDevice d) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(
            d.isOnline ? Icons.circle : Icons.circle_outlined,
            size: 10,
            color: d.isOnline ? const Color(0xFF059669) : const Color(0xFF94A3B8),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '${d.name}${d.petName != null ? ' (${d.petName})' : ''}',
              style: const TextStyle(fontSize: 12),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(d.type, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _anomalyRow(IotAnomaly a) {
    final color = a.severity == 'high' ? const Color(0xFFDC2626) : const Color(0xFFD97706);
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        '• ${a.deviceName} — ${a.message}',
        style: TextStyle(fontSize: 11, color: color, height: 1.35),
      ),
    );
  }
}
