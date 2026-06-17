import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/food_quality.dart';
import '../services/auth_service.dart';
import '../services/food_quality_engine.dart';
import '../widgets/food_quality_ai_panel.dart';
import '../services/food_quality_repository.dart';

class FoodQualityScreen extends StatefulWidget {
  const FoodQualityScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<FoodQualityScreen> createState() => _FoodQualityScreenState();
}

class _FoodQualityScreenState extends State<FoodQualityScreen> with SingleTickerProviderStateMixin {
  late final FoodQualityRepository _repo = FoodQualityRepository(widget.auth.api);
  late final TabController _tabs = TabController(length: 5, vsync: this);

  FoodQualityState? _state;
  List<AppNotification> _notifications = [];
  List<FoodQualityReading> _alerts = [];
  List<FoodQualityReading> _journal = [];
  bool _loading = true;
  bool _live = true;
  Timer? _liveTimer;

  @override
  void initState() {
    super.initState();
    _loadAll();
    _liveTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (_live && mounted) _refreshLive();
    });
  }

  @override
  void dispose() {
    _liveTimer?.cancel();
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    setState(() => _loading = true);
    try {
      final state = await _repo.fetchState();
      final notifs = await _repo.fetchNotifications();
      final journal = await _repo.loadJournal();
      final alerts = await _repo.getActiveAlerts();
      setState(() {
        _state = state;
        _notifications = notifs;
        _journal = journal;
        _alerts = alerts;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _refreshLive() async {
    try {
      FoodQualityReading reading;
      if (_state?.mode == 'live') {
        final state = await _repo.fetchState();
        if (!mounted) return;
        setState(() => _state = state);
        return;
      }
      reading = FoodQualityEngine.simulate();
      if (!mounted) return;
      setState(() {
        _state = FoodQualityState(
          mode: _state?.mode ?? 'demo',
          current: reading,
          history: [reading, ...(_state?.history ?? []).take(19)],
          device: _state?.device,
        );
      });
    } catch (_) {}
  }

  Future<void> _simulate(String scenario) async {
    setState(() => _loading = true);
    try {
      final reading = await _repo.simulateReading(scenario);
      final state = await _repo.fetchState();
      final notifs = await _repo.fetchNotifications();
      final journal = await _repo.loadJournal();
      final alerts = await _repo.getActiveAlerts();
      setState(() {
        _state = FoodQualityState(
          mode: state.mode,
          current: reading,
          history: [reading, ...state.history.take(19)],
          device: state.device,
        );
        _notifications = notifs;
        _journal = journal;
        _alerts = alerts;
      });
      if (mounted && reading.isNonConforme) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠ ALERTE — Notification envoyée sur PetFoodTN'),
            backgroundColor: Color(0xFFDC2626),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar.large(
            title: const Text('Qualité alimentaire'),
            backgroundColor: const Color(0xFFEDE9FE),
            actions: [
              IconButton(
                icon: Icon(_live ? Icons.sensors : Icons.sensors_off),
                tooltip: _live ? 'Flux live actif' : 'Flux en pause',
                onPressed: () => setState(() => _live = !_live),
              ),
              IconButton(icon: const Icon(Icons.refresh), onPressed: _loadAll),
            ],
            bottom: TabBar(
              controller: _tabs,
              isScrollable: true,
              tabs: const [
                Tab(icon: Icon(Icons.speed), text: 'Score'),
                Tab(icon: Icon(Icons.psychology), text: 'IA'),
                Tab(icon: Icon(Icons.warning_amber), text: 'Alertes'),
                Tab(icon: Icon(Icons.notifications), text: 'Notifs'),
                Tab(icon: Icon(Icons.history), text: 'Journal'),
              ],
            ),
          ),
        ],
        body: _loading && _state == null
            ? const Center(child: CircularProgressIndicator())
            : TabBarView(
                controller: _tabs,
                children: [
                  _ScoreTab(
                    state: _state,
                    live: _live,
                    onSimulate: _simulate,
                  ),
                  _AiTab(reading: _state?.current),
                  _AlertsTab(alerts: _alerts),
                  _NotificationsTab(notifications: _notifications),
                  _JournalTab(journal: _journal),
                ],
              ),
      ),
    );
  }
}

class _ScoreTab extends StatelessWidget {
  const _ScoreTab({required this.state, required this.live, required this.onSimulate});

  final FoodQualityState? state;
  final bool live;
  final Future<void> Function(String) onSimulate;

  @override
  Widget build(BuildContext context) {
    final cur = state?.current;
    if (cur == null) {
      return const Center(child: Text('Aucune lecture'));
    }

    final color = _scoreColor(cur.qualityScore);
    final device = state?.device;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (state?.mode == 'demo')
          const Chip(
            avatar: Icon(Icons.science, size: 16),
            label: Text('Mode démo / simulation'),
          ),
        if (live)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                _LiveDot(),
                SizedBox(width: 8),
                Text('Flux ESP32-CAM actif · 8 s', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF059669))),
              ],
            ),
          ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _OledCard(reading: cur)),
            const SizedBox(width: 12),
            _ScoreRing(score: cur.qualityScore, color: color, state: cur.displayState),
          ],
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(device?.name ?? 'ESP32-CAM', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('🟢 ${device?.status ?? 'online'} · ${device?.model ?? 'ESP32-CAM + OLED'}'),
                if (cur.aiSummary != null) ...[
                  const SizedBox(height: 12),
                  Text(cur.aiSummary!, style: const TextStyle(color: Color(0xFF475569))),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _MetricChip(Icons.thermostat, '${cur.temperatureC?.toStringAsFixed(1) ?? '—'} °C'),
            _MetricChip(Icons.water_drop, '${cur.humidityPct?.round() ?? '—'} % HR'),
            _MetricChip(Icons.inventory_2, 'Stock ${cur.stockLevelPct ?? '—'} %'),
            _MetricChip(Icons.bug_report, 'Insectes ${((cur.insectPixelRatio ?? 0) * 100).toStringAsFixed(2)} %'),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Simuler un scénario', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            FilledButton(onPressed: () => onSimulate('good'), child: const Text('Fraîche')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFFD97706)),
              onPressed: () => onSimulate('warning'),
              child: const Text('Acceptable'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFFD97706)),
              onPressed: () => onSimulate('deteriorated'),
              child: const Text('Dégradée 42%'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
              onPressed: () => onSimulate('critical'),
              child: const Text('35% Critique'),
            ),
          ],
        ),
      ],
    );
  }
}

class _AiTab extends StatelessWidget {
  const _AiTab({required this.reading});
  final FoodQualityReading? reading;

  @override
  Widget build(BuildContext context) {
    if (reading == null) {
      return const Center(child: Text('Aucune analyse IA'));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FoodQualityAiPanel(reading: reading!),
        if (reading!.aiSummary != null) ...[
          const SizedBox(height: 12),
          Card(
            color: const Color(0xFFF5F3FF),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Text(reading!.aiSummary!, style: const TextStyle(fontSize: 13, height: 1.45)),
            ),
          ),
        ],
      ],
    );
  }
}

class _OledCard extends StatelessWidget {
  const _OledCard({required this.reading});
  final FoodQualityReading reading;

  @override
  Widget build(BuildContext context) {
    final alert = reading.isNonConforme;
    return Card(
      color: const Color(0xFF1E293B),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('PetFoodTN IoT', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0A1628),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: alert
                  ? Column(
                      children: [
                        const Text('⚠ ALERTE', style: TextStyle(color: Color(0xFFF87171), fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                        const SizedBox(height: 4),
                        Text(
                          reading.displayState,
                          style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 12, fontFamily: 'monospace'),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Qualité : ${reading.qualityScore}%',
                          style: const TextStyle(color: Color(0xFF86EFAC), fontFamily: 'monospace'),
                        ),
                      ],
                    )
                  : Column(
                      children: [
                        _OledLine('Qualité', '${reading.qualityScore}%'),
                        _OledLine('État', reading.displayState),
                        _OledLine('Stock', '${reading.stockLevelPct ?? '—'}%'),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OledLine extends StatelessWidget {
  const _OledLine(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontFamily: 'monospace', fontSize: 12)),
          Text(value, style: const TextStyle(color: Color(0xFF86EFAC), fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _ScoreRing extends StatelessWidget {
  const _ScoreRing({required this.score, required this.color, required this.state});
  final int score;
  final Color color;
  final String state;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 100,
      height: 100,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 100,
            height: 100,
            child: CircularProgressIndicator(
              value: score / 100,
              strokeWidth: 8,
              color: color,
              backgroundColor: color.withValues(alpha: 0.15),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('$score%', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
              Text(state, style: TextStyle(fontSize: 10, color: color), textAlign: TextAlign.center),
            ],
          ),
        ],
      ),
    );
  }
}

class _AlertsTab extends StatelessWidget {
  const _AlertsTab({required this.alerts});
  final List<FoodQualityReading> alerts;

  @override
  Widget build(BuildContext context) {
    if (alerts.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, size: 48, color: Color(0xFF059669)),
            SizedBox(height: 12),
            Text('Aucune alerte active'),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: alerts.length,
      itemBuilder: (_, i) {
        final a = alerts[i];
        final isAlt = a.isNonConforme && !a.isCritical;
        return Card(
          color: isAlt ? const Color(0xFFFFF7ED) : const Color(0xFFFEF2F2),
          child: ListTile(
            leading: Icon(
              isAlt ? Icons.warning_amber : Icons.error,
              color: isAlt ? const Color(0xFFD97706) : const Color(0xFFDC2626),
            ),
            title: Text(isAlt ? '⚠ ALERTE — Nourriture non conforme' : 'Aliment altéré'),
            subtitle: Text('Qualité : ${a.qualityScore}% · ${a.recommendedAction ?? ''}'),
            trailing: Text(_fmt(a.analyzedAt), style: const TextStyle(fontSize: 11)),
          ),
        );
      },
    );
  }
}

class _NotificationsTab extends StatelessWidget {
  const _NotificationsTab({required this.notifications});
  final List<AppNotification> notifications;

  @override
  Widget build(BuildContext context) {
    if (notifications.isEmpty) {
      return const Center(child: Text('Aucune notification qualité alimentaire'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      itemBuilder: (_, i) {
        final n = notifications[i];
        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: n.read ? Colors.grey.shade200 : const Color(0xFFEDE9FE),
              child: Icon(Icons.camera_alt, color: n.read ? Colors.grey : const Color(0xFF7C3AED)),
            ),
            title: Text(n.title, style: TextStyle(fontWeight: n.read ? FontWeight.normal : FontWeight.bold)),
            subtitle: Text(n.message ?? ''),
            trailing: Text(_fmt(n.createdAt), style: const TextStyle(fontSize: 11)),
          ),
        );
      },
    );
  }
}

class _JournalTab extends StatelessWidget {
  const _JournalTab({required this.journal});
  final List<FoodQualityReading> journal;

  @override
  Widget build(BuildContext context) {
    if (journal.isEmpty) {
      return const Center(child: Text('Journal vide'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: journal.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (_, i) {
        final r = journal[i];
        final c = _scoreColor(r.qualityScore);
        return Card(
          child: ListTile(
            leading: CircleAvatar(backgroundColor: c.withValues(alpha: 0.15), child: Text('${r.qualityScore}', style: TextStyle(color: c, fontWeight: FontWeight.bold, fontSize: 12))),
            title: Text(r.aiClassLabel),
            subtitle: Text(
              'Stock ${r.stockLevelPct ?? '—'} % · Péremption ${r.expirationDaysRemaining ?? '—'} j'
              '${r.moldDetected == true ? ' · Moisissure IA' : ''}',
            ),
            trailing: Text(_fmt(r.analyzedAt), style: const TextStyle(fontSize: 11)),
          ),
        );
      },
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip(this.icon, this.label);
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(avatar: Icon(icon, size: 16), label: Text(label));
  }
}

class _LiveDot extends StatefulWidget {
  const _LiveDot();

  @override
  State<_LiveDot> createState() => _LiveDotState();
}

class _LiveDotState extends State<_LiveDot> {
  bool _on = true;

  @override
  void initState() {
    super.initState();
    Timer.periodic(const Duration(milliseconds: 900), (_) {
      if (mounted) setState(() => _on = !_on);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _on ? const Color(0xFFEF4444) : const Color(0xFFEF4444).withValues(alpha: 0.3),
      ),
    );
  }
}

Color _scoreColor(int score) {
  if (score < 40) return const Color(0xFF991B1B);
  if (score < 50) return const Color(0xFFDC2626);
  if (score < 75) return const Color(0xFFD97706);
  return const Color(0xFF059669);
}

String _fmt(DateTime? d) {
  if (d == null) return '—';
  return DateFormat('dd/MM HH:mm').format(d);
}
