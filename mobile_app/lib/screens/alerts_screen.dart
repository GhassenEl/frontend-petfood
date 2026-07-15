import 'dart:async';
import 'package:flutter/material.dart';
import '../models/mobile_bi.dart';
import '../services/auth_service.dart';
import '../services/mobile_bi_service.dart';
import '../utils/page_scroll.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key, required this.auth, this.bottomNavPadding = false});

  final AuthService auth;
  final bool bottomNavPadding;

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  late final MobileBiService _service = MobileBiService(widget.auth.api);
  BiDashboardPack? _pack;
  bool _loading = true;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _load();
    _pollTimer = Timer.periodic(const Duration(seconds: 45), (_) {
      if (mounted) _load(silent: true);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final pack = await _service.loadPack();
      if (mounted) setState(() => _pack = pack);
    } finally {
      if (mounted) setState(() => _loading = silent ? _loading : false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final alerts = _pack?.alerts ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alertes animal & IoT'),
        backgroundColor: const Color(0xFFFFF7ED),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: _loading && _pack == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: PageScroll.physics,
                padding: PageScroll.listPadding(context, bottomNav: widget.bottomNavPadding),
                children: [
                  if (_pack?.mode == 'demo')
                    const Chip(
                      avatar: Icon(Icons.science, size: 16),
                      label: Text('Données enrichies — mode démo'),
                    ),
                  if (_pack?.mode == 'demo') const SizedBox(height: 12),
                  _SummaryRow(
                    total: alerts.length,
                    warnings: alerts.where((a) => a.level == 'warning').length,
                    critical: alerts.where((a) => a.level == 'critical').length,
                  ),
                  const SizedBox(height: 16),
                  if (alerts.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 48),
                        child: Text('Aucune alerte pour le moment'),
                      ),
                    )
                  else
                    ...alerts.map((a) => _AlertCard(alert: a)),
                ],
              ),
            ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.total, required this.warnings, required this.critical});

  final int total;
  final int warnings;
  final int critical;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _pill('Total', '$total', const Color(0xFF2563EB)),
        const SizedBox(width: 8),
        _pill('Attention', '$warnings', const Color(0xFFD97706)),
        const SizedBox(width: 8),
        _pill('Critique', '$critical', const Color(0xFFDC2626)),
      ],
    );
  }

  Widget _pill(String label, String value, Color color) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: TextStyle(fontSize: 11, color: color)),
            ],
          ),
        ),
      );
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({required this.alert});

  final BiAlert alert;

  Color get _color {
    switch (alert.level) {
      case 'warning':
        return const Color(0xFFD97706);
      case 'critical':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFF2563EB);
    }
  }

  IconData get _icon {
    switch (alert.level) {
      case 'warning':
        return Icons.warning_amber_rounded;
      case 'critical':
        return Icons.error_outline;
      default:
        return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(_icon, color: _color, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(alert.message, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      if (alert.detail != null && alert.detail!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(alert.detail!, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                Chip(
                  label: Text(alert.level, style: const TextStyle(fontSize: 11)),
                  visualDensity: VisualDensity.compact,
                  backgroundColor: _color.withValues(alpha: 0.1),
                  side: BorderSide.none,
                ),
                if (alert.petName != null)
                  Chip(
                    avatar: const Text('🐾', style: TextStyle(fontSize: 12)),
                    label: Text(alert.petName!, style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                  ),
                if (alert.source != null)
                  Chip(
                    avatar: const Icon(Icons.sensors, size: 14),
                    label: Text(alert.source!, style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                  ),
                if (alert.at != null)
                  Chip(
                    avatar: const Icon(Icons.schedule, size: 14),
                    label: Text(formatRelativeTime(alert.at!), style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
