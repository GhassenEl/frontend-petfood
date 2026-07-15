import 'dart:async';
import 'package:flutter/material.dart';
import '../models/iot_pack.dart';
import '../services/auth_service.dart';
import '../services/iot_pack_service.dart';
import '../utils/page_scroll.dart';

/// Notifications IoT réelles — alertes ESP32 par profil animal (distributeurs / fontaines / CAM).
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({
    super.key,
    required this.auth,
    this.bottomNavPadding = false,
  });

  final AuthService auth;
  final bool bottomNavPadding;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final IotPackService _iot = IotPackService(widget.auth.api);
  IotPack? _pack;
  String? _petFilter;
  bool _loading = true;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) _load(silent: true);
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final pack = await _iot.fetchPack();
      if (!mounted) return;
      setState(() {
        _pack = pack;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<String> get _petNames {
    final names = <String>{};
    for (final d in _pack?.devices ?? const <IotDevice>[]) {
      if (d.petName != null && d.petName!.trim().isNotEmpty) names.add(d.petName!);
    }
    for (final a in _pack?.alerts ?? const <IotAlert>[]) {
      if (a.petName != null && a.petName!.trim().isNotEmpty) names.add(a.petName!);
    }
    final list = names.toList()..sort();
    return list;
  }

  List<IotAlert> get _alerts {
    final all = List<IotAlert>.from(_pack?.alerts ?? const []);
    all.sort((a, b) {
      final ta = a.at ?? DateTime.fromMillisecondsSinceEpoch(0);
      final tb = b.at ?? DateTime.fromMillisecondsSinceEpoch(0);
      return tb.compareTo(ta);
    });
    if (_petFilter == null) return all;
    return all.where((a) => a.petName == _petFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final alerts = _alerts;
    final pets = _petNames;
    final live = _pack?.isLive == true;
    final critical = alerts.where((a) => a.severity == 'high' || a.severity == 'critical').length;

    return Scaffold(
      appBar: AppBar(
        title: Text(alerts.isEmpty ? 'Notifications IoT' : 'Notifications (${alerts.length})'),
        backgroundColor: const Color(0xFFECFDF5),
        foregroundColor: const Color(0xFF065F46),
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
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF6EE7B7)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          live ? Icons.sensors : Icons.science,
                          color: const Color(0xFF059669),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            live
                                ? 'ESP32 live · distributeurs liés aux profils animaux'
                                : 'Alertes ESP32 (démo) · Mimi & Rex — MQTT / HX711 / CAM',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF065F46),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _stat('Alertes', '${alerts.length}', const Color(0xFF2563EB)),
                      const SizedBox(width: 8),
                      _stat('Critiques', '$critical', const Color(0xFFDC2626)),
                      const SizedBox(width: 8),
                      _stat(
                        'ESP32',
                        '${_pack?.devices.where((d) => d.isOnline).length ?? 0}/${_pack?.devices.length ?? 0}',
                        const Color(0xFF059669),
                      ),
                    ],
                  ),
                  if (pets.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: const Text('Tous'),
                              selected: _petFilter == null,
                              onSelected: (_) => setState(() => _petFilter = null),
                            ),
                          ),
                          ...pets.map(
                            (p) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                avatar: const Icon(Icons.pets, size: 16),
                                label: Text(p),
                                selected: _petFilter == p,
                                onSelected: (_) => setState(() => _petFilter = p),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  if (alerts.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 48),
                      child: Center(
                        child: Text(
                          'Aucune notification ESP32 pour ces profils',
                          style: TextStyle(color: Color(0xFF64748B)),
                        ),
                      ),
                    )
                  else
                    ...alerts.map((a) => _IotNotifCard(alert: a)),
                ],
              ),
            ),
    );
  }

  Widget _stat(String label, String value, Color color) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: TextStyle(fontSize: 11, color: color)),
            ],
          ),
        ),
      );
}

class _IotNotifCard extends StatelessWidget {
  const _IotNotifCard({required this.alert});

  final IotAlert alert;

  Color get _color {
    switch (alert.severity) {
      case 'high':
      case 'critical':
        return const Color(0xFFDC2626);
      case 'medium':
      case 'warning':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFF2563EB);
    }
  }

  IconData get _icon {
    switch (alert.source) {
      case 'water':
        return Icons.water_drop;
      case 'feeder-cam':
      case 'food-quality':
        return Icons.camera_alt;
      case 'temperature':
        return Icons.thermostat;
      case 'humidity':
        return Icons.water;
      default:
        return Icons.memory;
    }
  }

  String _timeLabel() {
    final at = alert.at;
    if (at == null) return 'ESP32';
    return formatRelativeTime(at);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: alert.severity == 'high' || alert.severity == 'critical'
          ? const Color(0xFFFEF2F2)
          : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: _color.withValues(alpha: 0.15),
                  child: Icon(_icon, color: _color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        alert.title,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        alert.message,
                        style: const TextStyle(fontSize: 13, height: 1.35, color: Color(0xFF475569)),
                      ),
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
                if (alert.petName != null)
                  Chip(
                    avatar: const Icon(Icons.pets, size: 14),
                    label: Text(alert.petName!, style: const TextStyle(fontSize: 11)),
                    visualDensity: VisualDensity.compact,
                    backgroundColor: const Color(0xFFF0FDF4),
                    side: BorderSide.none,
                  ),
                Chip(
                  avatar: Icon(Icons.sensors, size: 14, color: _color),
                  label: Text(alert.source, style: const TextStyle(fontSize: 11)),
                  visualDensity: VisualDensity.compact,
                  side: BorderSide.none,
                ),
                Chip(
                  label: Text(alert.severity, style: TextStyle(fontSize: 11, color: _color)),
                  visualDensity: VisualDensity.compact,
                  backgroundColor: _color.withValues(alpha: 0.1),
                  side: BorderSide.none,
                ),
                Chip(
                  avatar: const Icon(Icons.schedule, size: 14),
                  label: Text(_timeLabel(), style: const TextStyle(fontSize: 11)),
                  visualDensity: VisualDensity.compact,
                  side: BorderSide.none,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
