import 'package:flutter/material.dart';
import '../models/mobile_bi.dart';
import '../services/auth_service.dart';
import '../services/mobile_bi_service.dart';

class BiDashboardScreen extends StatefulWidget {
  const BiDashboardScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<BiDashboardScreen> createState() => _BiDashboardScreenState();
}

class _BiDashboardScreenState extends State<BiDashboardScreen> {
  late final MobileBiService _service = MobileBiService(widget.auth.api);
  BiDashboardPack? _pack;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final pack = await _service.loadPack();
      if (mounted) setState(() => _pack = pack);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            title: const Text('Tableau de bord BI'),
            backgroundColor: const Color(0xFFD1FAE5),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFD1FAE5), Color(0xFFECFDF5), Color(0xFFEDE9FE)],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
            ],
          ),
          if (_loading && _pack == null)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else if (_pack != null)
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (_pack!.mode == 'demo')
                    const Chip(
                      avatar: Icon(Icons.science, size: 16),
                      label: Text('Mode démo — données BI simulées'),
                    ),
                  _LoyaltyBanner(points: _pack!.loyaltyPoints, tier: _pack!.loyaltyTier),
                  const SizedBox(height: 16),
                  _SectionTitle('Indicateurs clés'),
                  _KpiGrid(kpis: _pack!.kpis),
                  const SizedBox(height: 20),
                  _SectionTitle('Tendance qualité alimentaire (7 j)'),
                  _QualityChart(points: _pack!.qualityTrend),
                  const SizedBox(height: 20),
                  _SectionTitle('Alertes IoT (${_pack!.alerts.length})'),
                  if (_pack!.alerts.isEmpty)
                    const Text('Aucune alerte', style: TextStyle(color: Colors.grey))
                  else
                    ..._pack!.alerts.map(_AlertTile.new),
                  const SizedBox(height: 24),
                ]),
              ),
            ),
        ],
      ),
    );
  }
}

class _LoyaltyBanner extends StatelessWidget {
  const _LoyaltyBanner({required this.points, required this.tier});
  final int points;
  final String tier;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF059669), Color(0xFF10B981)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 8)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.stars, color: Colors.white, size: 32),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$points points', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  Text('Niveau $tier · Fidélité PetfoodTN', style: TextStyle(color: Colors.white.withValues(alpha: 0.9))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
    );
  }
}

class _KpiGrid extends StatelessWidget {
  const _KpiGrid({required this.kpis});
  final List<BiKpi> kpis;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.6,
      children: kpis.map((k) {
        final color = Color(k.colorValue);
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          color: color.withValues(alpha: 0.08),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(height: 8),
                Text(k.label, style: TextStyle(fontSize: 11, color: color.withValues(alpha: 0.85), height: 1.2)),
                const SizedBox(height: 4),
                Text(
                  k.value,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: color,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _QualityChart extends StatelessWidget {
  const _QualityChart({required this.points});
  final List<BiQualityPoint> points;

  @override
  Widget build(BuildContext context) {
    if (points.isEmpty) {
      return const Text('Pas de données qualité');
    }

    final maxScore = points.map((p) => p.score).reduce((a, b) => a > b ? a : b).clamp(1, 100);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: SizedBox(
          height: 160,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: points.map((p) {
              final h = (p.score / maxScore) * 120;
              final color = p.score >= 80
                  ? const Color(0xFF059669)
                  : p.score >= 50
                      ? const Color(0xFFD97706)
                      : const Color(0xFFDC2626);
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text('${p.score}', style: TextStyle(fontSize: 10, color: color)),
                      const SizedBox(height: 2),
                      Container(
                        height: h,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(p.label, style: const TextStyle(fontSize: 10), overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _AlertTile extends StatelessWidget {
  const _AlertTile(this.alert);
  final BiAlert alert;

  Color _levelColor() {
    switch (alert.level) {
      case 'warning':
        return const Color(0xFFD97706);
      case 'critical':
        return const Color(0xFFDC2626);
      default:
        return const Color(0xFF2563EB);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.sensors, color: _levelColor()),
        title: Text(alert.message),
        trailing: Chip(
          label: Text(alert.level, style: const TextStyle(fontSize: 11)),
          visualDensity: VisualDensity.compact,
        ),
      ),
    );
  }
}
