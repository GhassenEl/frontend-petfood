import '../models/food_quality.dart';
import '../models/mobile_bi.dart';
import 'api_client.dart';
import 'food_quality_repository.dart';

class MobileBiService {
  MobileBiService(this.api, {FoodQualityRepository? foodQualityRepo})
      : _fqRepo = foodQualityRepo ?? FoodQualityRepository(api);

  final ApiClient api;
  final FoodQualityRepository _fqRepo;

  Future<BiDashboardPack> loadPack() async {
    try {
      final data = await api.get('/client/dashboard');
      if (data is Map && (data['stats'] != null || data['activeOrder'] != null)) {
        return _fromDashboard(Map<String, dynamic>.from(data));
      }
    } catch (_) {}

    return _demoPack(await _fqRepo.loadJournal());
  }

  Future<BiDashboardPack> _fromDashboard(Map<String, dynamic> d) async {
    final stats = d['stats'] as Map? ?? {};
    final loyalty = d['loyalty'] as Map? ?? {};
    final alertsRaw = d['iotAlerts'] as List? ?? [];
    final journal = await _fqRepo.loadJournal();

    var qualityTrend = journal.take(7).toList().reversed.map((r) {
      final t = r.analyzedAt;
      final label = t != null ? '${t.hour.toString().padLeft(2, '0')}h' : '—';
      return BiQualityPoint(label: label, score: r.qualityScore);
    }).toList();

    if (qualityTrend.isEmpty) {
      qualityTrend.addAll(_demoQualityTrend());
    }

    final avgQuality = journal.isEmpty
        ? 88
        : (journal.map((r) => r.qualityScore).reduce((a, b) => a + b) / journal.length).round();

    return BiDashboardPack(
      mode: 'live',
      kpis: [
        BiKpi(label: 'Commandes actives', value: '${stats['ordersActive'] ?? 0}', colorValue: 0xFF059669),
        BiKpi(label: 'Alertes IoT', value: '${stats['iotAlertCount'] ?? 0}', colorValue: 0xFFD97706),
        BiKpi(label: 'Qualité moy.', value: '$avgQuality%', colorValue: 0xFF7C3AED),
        BiKpi(label: 'Abonnements', value: '${stats['subscriptionCount'] ?? 0}', colorValue: 0xFF2563EB),
        BiKpi(label: 'Foyer', value: '${stats['familyMembers'] ?? 0}', colorValue: 0xFFE67E22),
      ],
      qualityTrend: qualityTrend,
      alerts: alertsRaw
          .map((a) => BiAlert(
                id: a['id']?.toString() ?? '',
                message: a['message']?.toString() ?? '',
                level: a['level']?.toString() ?? 'info',
              ))
          .toList(),
      loyaltyPoints: (loyalty['points'] as num?)?.toInt() ?? 0,
      loyaltyTier: loyalty['tier']?.toString() ?? 'standard',
      monthlySpend: (d['activeOrder']?['total'] as num?)?.toDouble() ?? 0,
      activeOrders: (stats['ordersActive'] as num?)?.toInt() ?? 0,
    );
  }

  BiDashboardPack _demoPack(List<FoodQualityReading> journal) {
    final qualityTrend = journal.isEmpty
        ? _demoQualityTrend()
        : journal.take(7).toList().reversed.map((r) {
            final t = r.analyzedAt;
            return BiQualityPoint(
              label: t != null ? '${t.day}/${t.month}' : '—',
              score: r.qualityScore,
            );
          }).toList();

    return BiDashboardPack(
      mode: 'demo',
      kpis: const [
        BiKpi(label: 'Commandes actives', value: '1', colorValue: 0xFF059669),
        BiKpi(label: 'Alertes IoT', value: '2', colorValue: 0xFFD97706),
        BiKpi(label: 'Qualité moy.', value: '88%', colorValue: 0xFF7C3AED),
        BiKpi(label: 'Points fidélité', value: '142', colorValue: 0xFF2563EB),
        BiKpi(label: 'Membres foyer', value: '2', colorValue: 0xFFE67E22),
      ],
      qualityTrend: qualityTrend,
      alerts: const [
        BiAlert(id: 'a1', message: 'Distributeur : niveau bas (18 %)', level: 'warning'),
        BiAlert(id: 'a2', message: 'Hydratation sous l\'objectif — Luna', level: 'info'),
        BiAlert(id: 'a3', message: 'ESP32-CAM qualité limite — 72%', level: 'warning'),
      ],
      loyaltyPoints: 142,
      loyaltyTier: 'standard',
      monthlySpend: 54.9,
      activeOrders: 1,
    );
  }

  List<BiQualityPoint> _demoQualityTrend() => const [
        BiQualityPoint(label: 'Lun', score: 92),
        BiQualityPoint(label: 'Mar', score: 88),
        BiQualityPoint(label: 'Mer', score: 85),
        BiQualityPoint(label: 'Jeu', score: 90),
        BiQualityPoint(label: 'Ven', score: 72),
        BiQualityPoint(label: 'Sam', score: 94),
        BiQualityPoint(label: 'Dim', score: 91),
      ];
}
