import '../models/food_quality.dart';
import '../models/iot_pack.dart';
import '../models/mobile_bi.dart';
import 'api_client.dart';
import 'food_quality_repository.dart';
import 'iot_pack_service.dart';

class MobileBiService {
  MobileBiService(this.api, {FoodQualityRepository? foodQualityRepo, IotPackService? iotPackService})
      : _fqRepo = foodQualityRepo ?? FoodQualityRepository(api),
        _iotService = iotPackService ?? IotPackService(api);

  final ApiClient api;
  final FoodQualityRepository _fqRepo;
  final IotPackService _iotService;

  Future<BiDashboardPack> loadPack() async {
    final iotPack = await _iotService.fetchPack();

    try {
      final data = await api.get('/client/dashboard');
      if (data is Map && (data['stats'] != null || data['activeOrder'] != null)) {
        return _fromDashboard(Map<String, dynamic>.from(data), iotPack: iotPack);
      }
    } catch (_) {}

    return _demoPack(await _fqRepo.loadJournal(), iotPack: iotPack);
  }

  Future<BiDashboardPack> _fromDashboard(Map<String, dynamic> d, {required IotPack iotPack}) async {
    final stats = d['stats'] as Map? ?? {};
    final loyalty = d['loyalty'] as Map? ?? {};
    final alertsRaw = d['iotAlerts'] as List? ?? [];
    final journal = await _fqRepo.loadJournal();
    final iotAlerts = iotPack.counts.alerts;
    final iotOnline = iotPack.devicesOnline;

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
        BiKpi(label: 'Alertes IoT', value: '${stats['iotAlertCount'] ?? iotAlerts}', colorValue: 0xFFD97706),
        BiKpi(label: 'Capteurs live', value: '$iotOnline', colorValue: 0xFF0D9488),
        BiKpi(label: 'Qualité moy.', value: '$avgQuality%', colorValue: 0xFF7C3AED),
        BiKpi(label: 'Score IoT', value: '${iotPack.healthScore}%', colorValue: 0xFF2563EB),
      ],
      qualityTrend: qualityTrend,
      alerts: [
        ...alertsRaw.map((a) => BiAlert(
              id: a['id']?.toString() ?? '',
              message: a['message']?.toString() ?? '',
              level: a['level']?.toString() ?? 'info',
            )),
        ...iotPack.anomalies.take(3).map((a) => BiAlert(
              id: a.id,
              message: '${a.deviceName} — ${a.message}',
              level: a.severity,
            )),
      ],
      loyaltyPoints: (loyalty['points'] as num?)?.toInt() ?? 0,
      loyaltyTier: loyalty['tier']?.toString() ?? 'standard',
      monthlySpend: (d['activeOrder']?['total'] as num?)?.toDouble() ?? 0,
      activeOrders: (stats['ordersActive'] as num?)?.toInt() ?? 0,
    );
  }

  BiDashboardPack _demoPack(List<FoodQualityReading> journal, {required IotPack iotPack}) {
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
      kpis: [
        BiKpi(label: 'Commandes actives', value: '1', colorValue: 0xFF059669),
        BiKpi(label: 'Alertes IoT', value: '${iotPack.counts.alerts}', colorValue: 0xFFD97706),
        BiKpi(label: 'Capteurs live', value: '${iotPack.devicesOnline}', colorValue: 0xFF0D9488),
        BiKpi(label: 'Qualité moy.', value: '88%', colorValue: 0xFF7C3AED),
        BiKpi(label: 'Score IoT', value: '${iotPack.healthScore}%', colorValue: 0xFF2563EB),
      ],
      qualityTrend: qualityTrend,
      alerts: [
        const BiAlert(id: 'a1', message: 'Distributeur : niveau bas (18 %)', level: 'warning'),
        const BiAlert(id: 'a2', message: 'Hydratation sous l\'objectif — Luna', level: 'info'),
        const BiAlert(id: 'a3', message: 'ESP32-CAM qualité limite — 72%', level: 'warning'),
        ...iotPack.anomalies.take(2).map((a) => BiAlert(
              id: a.id,
              message: '${a.deviceName} — ${a.message}',
              level: a.severity,
            )),
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
