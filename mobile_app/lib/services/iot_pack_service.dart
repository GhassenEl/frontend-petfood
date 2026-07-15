import '../models/iot_pack.dart';
import 'api_client.dart';

/// Pack IoT unifié — même contrat que le web (`/client/iot/pack`).
class IotPackService {
  IotPackService(this.api);

  final ApiClient api;
  bool lastFetchWasLive = false;

  Future<IotPack> fetchPack() async {
    try {
      final data = await api.get('/client/iot/pack');
      if (data is Map && (data['devices'] as List?)?.isNotEmpty == true) {
        lastFetchWasLive = true;
        final pack = IotPack.fromJson(Map<String, dynamic>.from(data));
        return _withAnomalies(pack.copyWith(mode: data['mode']?.toString() ?? 'live'));
      }
    } catch (_) {
      lastFetchWasLive = false;
    }
    lastFetchWasLive = false;
    return _withAnomalies(_demoPack());
  }

  Future<Map<String, dynamic>> sendCommand(String commandId) async {
    try {
      final data = await api.post('/client/iot/commands', {'commandId': commandId});
      if (data is Map) return Map<String, dynamic>.from(data);
    } catch (_) {}
    return {'message': 'Commande $commandId (mode démo)', 'mode': 'demo'};
  }

  Future<Map<String, dynamic>> toggleAutomation(String automationId, bool enabled) async {
    try {
      final data = await api.patch('/client/iot/automations/$automationId', {'enabled': enabled});
      if (data is Map) return Map<String, dynamic>.from(data);
    } catch (_) {}
    return {'id': automationId, 'enabled': enabled, 'mode': 'demo'};
  }

  IotPack _withAnomalies(IotPack pack) {
    final detected = <IotAnomaly>[];
    for (final d in pack.devices) {
      detected.addAll(_detectDeviceAnomalies(d));
    }
    final anomalies = pack.anomalies.isNotEmpty ? pack.anomalies : detected;
    final alerts = pack.alerts.isNotEmpty
        ? _enrichAlertsWithPets(pack.alerts, pack.devices)
        : _alertsFromDevices(pack.devices, anomalies);
    return pack.copyWith(
      anomalies: anomalies,
      alerts: alerts,
      counts: IotCounts(
        feeders: pack.counts.feeders,
        feedersOnline: pack.counts.feedersOnline,
        feederCams: pack.counts.feederCams,
        feederCamsOnline: pack.counts.feederCamsOnline,
        waterMonitors: pack.counts.waterMonitors,
        waterOnline: pack.counts.waterOnline,
        alerts: alerts.length,
        criticalAlerts: alerts.where((a) => a.severity == 'high' || a.severity == 'critical').length,
      ),
    );
  }

  List<IotAlert> _enrichAlertsWithPets(List<IotAlert> alerts, List<IotDevice> devices) {
    return alerts.map((a) {
      if (a.petName != null && a.petName!.isNotEmpty) return a;
      final device = devices.cast<IotDevice?>().firstWhere(
            (d) => d?.id == a.deviceId,
            orElse: () => null,
          );
      if (device?.petName == null) return a;
      return IotAlert(
        id: a.id,
        title: a.title,
        message: a.message,
        source: a.source,
        severity: a.severity,
        deviceId: a.deviceId,
        petName: device!.petName,
        at: a.at,
      );
    }).toList();
  }

  List<IotAlert> _alertsFromDevices(List<IotDevice> devices, List<IotAnomaly> anomalies) {
    final now = DateTime.now();
    final out = <IotAlert>[];
    var i = 0;
    for (final a in anomalies) {
      final device = devices.cast<IotDevice?>().firstWhere(
            (d) => d?.name == a.deviceName,
            orElse: () => null,
          );
      out.add(IotAlert(
        id: a.id,
        title: _titleForAnomaly(a),
        message: a.message,
        source: a.type,
        severity: a.severity,
        deviceId: device?.id,
        petName: device?.petName,
        at: now.subtract(Duration(minutes: 8 + i * 17)),
      ));
      i++;
    }
    for (final d in devices) {
      if (!d.isOnline) {
        out.add(IotAlert(
          id: '${d.id}-offline',
          title: 'ESP32 hors ligne — ${d.petName ?? d.name}',
          message: '${d.name} ne répond plus (MQTT / Wi-Fi). Dernière synchro : ${d.lastSeen ?? 'inconnue'}.',
          source: d.type,
          severity: 'high',
          deviceId: d.id,
          petName: d.petName,
          at: now.subtract(const Duration(minutes: 5)),
        ));
      }
      final pct = d.metrics['percentOfTarget'] as num?;
      if (d.type == 'water' && pct != null && pct < 70) {
        out.add(IotAlert(
          id: '${d.id}-hydration',
          title: 'Hydratation basse — ${d.petName ?? 'animal'}',
          message: '${pct.toStringAsFixed(0)} % de l’objectif journalier via ${d.name}.',
          source: 'water',
          severity: pct < 50 ? 'high' : 'medium',
          deviceId: d.id,
          petName: d.petName,
          at: now.subtract(const Duration(minutes: 35)),
        ));
      }
      if (d.metrics['isLowFood'] == true) {
        final reservoir = d.metrics['reservoirPercent'];
        out.add(IotAlert(
          id: '${d.id}-lowfood',
          title: 'Croquettes basses — ${d.petName ?? d.name}',
          message: 'ESP32 distributeur : réservoir à ${reservoir ?? '?'} %. Recharge recommandée.',
          source: 'feeder',
          severity: 'medium',
          deviceId: d.id,
          petName: d.petName,
          at: now.subtract(const Duration(hours: 1)),
        ));
      }
    }
    return out;
  }

  String _titleForAnomaly(IotAnomaly a) {
    switch (a.type) {
      case 'temperature':
        return 'Température ESP32';
      case 'humidity':
        return 'Humidité silo';
      case 'food-quality':
        return 'Qualité — ESP32-CAM';
      case 'stock':
        return 'Stock distributeur';
      default:
        return 'Alerte ${a.deviceName}';
    }
  }

  List<IotAnomaly> _detectDeviceAnomalies(IotDevice device) {
    final m = device.metrics;
    final out = <IotAnomaly>[];
    final temp = (m['temperatureC'] ?? m['temperature']) as num?;
    if (temp != null && temp > 28) {
      out.add(IotAnomaly(
        id: '${device.id}-temp',
        deviceName: device.name,
        type: 'temperature',
        severity: temp > 32 ? 'high' : 'medium',
        message: 'Température ${temp.toStringAsFixed(1)} °C — risque aliments.',
      ));
    }
    final hum = (m['humidityPct'] ?? m['humidity']) as num?;
    if (hum != null && hum >= 75) {
      out.add(IotAnomaly(
        id: '${device.id}-hum',
        deviceName: device.name,
        type: 'humidity',
        severity: hum >= 82 ? 'high' : 'medium',
        message: 'Humidité $hum % — surveillance recommandée.',
      ));
    }
    final score = m['qualityScore'] as num?;
    if (m['foodQuality'] == 'bad' || (score != null && score < 50)) {
      out.add(IotAnomaly(
        id: '${device.id}-quality',
        deviceName: device.name,
        type: 'food-quality',
        severity: 'high',
        message: 'Qualité alimentaire faible (${score ?? '—'} %).',
      ));
    }
    if (m['foodQuality'] == 'warning' || (score != null && score < 80 && score >= 50)) {
      out.add(IotAnomaly(
        id: '${device.id}-quality-warn',
        deviceName: device.name,
        type: 'food-quality',
        severity: 'medium',
        message: 'Score qualité $score % — contrôle ESP32-CAM recommandé.',
      ));
    }
    final reservoir = m['reservoirPercent'] as num?;
    if (reservoir != null && reservoir < 35) {
      out.add(IotAnomaly(
        id: '${device.id}-stock',
        deviceName: device.name,
        type: 'stock',
        severity: reservoir < 15 ? 'high' : 'medium',
        message: 'Réservoir bas — $reservoir %.',
      ));
    }
    return out;
  }

  IotPack _demoPack() {
    final now = DateTime.now();
    return IotPack(
      mode: 'demo',
      healthScore: 68,
      counts: const IotCounts(
        feeders: 2,
        feedersOnline: 1,
        feederCams: 1,
        feederCamsOnline: 1,
        waterMonitors: 2,
        waterOnline: 2,
        alerts: 7,
        criticalAlerts: 2,
      ),
      devices: [
        IotDevice(
          id: 'esp32-feeder-mimi',
          type: 'feeder',
          name: 'Distributeur ESP32 — Mimi',
          status: 'online',
          petName: 'Mimi',
          metrics: const {
            'reservoirPercent': 12,
            'temperature': 29.4,
            'todayGrams': 48,
            'isLowFood': true,
            'firmware': 'ESP32-HX711',
          },
          signalStrength: 74,
          lastSeen: now.subtract(const Duration(minutes: 1)),
        ),
        IotDevice(
          id: 'esp32-feeder-rex',
          type: 'feeder',
          name: 'Distributeur ESP32 — Rex',
          status: 'offline',
          petName: 'Rex',
          metrics: const {
            'reservoirPercent': 58,
            'temperature': 23.1,
            'todayGrams': 0,
            'isLowFood': false,
            'firmware': 'ESP32-HX711',
          },
          signalStrength: 0,
          lastSeen: now.subtract(const Duration(hours: 2)),
        ),
        IotDevice(
          id: 'esp32-cam-mimi',
          type: 'feeder-cam',
          name: 'ESP32-CAM — Bac Mimi',
          status: 'online',
          petName: 'Mimi',
          metrics: const {
            'qualityScore': 71,
            'foodQuality': 'warning',
            'temperatureC': 29.4,
            'humidityPct': 79,
          },
          signalStrength: 81,
          lastSeen: now.subtract(const Duration(seconds: 40)),
        ),
        IotDevice(
          id: 'esp32-water-mimi',
          type: 'water',
          name: 'Fontaine Mimi',
          status: 'online',
          petName: 'Mimi',
          metrics: const {'todayMl': 210, 'targetMl': 280, 'percentOfTarget': 75},
          signalStrength: 90,
          lastSeen: now.subtract(const Duration(minutes: 2)),
        ),
        IotDevice(
          id: 'esp32-water-rex',
          type: 'water',
          name: 'Fontaine Rex',
          status: 'online',
          petName: 'Rex',
          metrics: const {'todayMl': 95, 'targetMl': 500, 'percentOfTarget': 19},
          signalStrength: 86,
          lastSeen: now.subtract(const Duration(minutes: 3)),
        ),
      ],
      alerts: [
        IotAlert(
          id: 'a1',
          title: 'Croquettes critiques — Mimi',
          message: 'ESP32-HX711 : réservoir à 12 %. Distribution risque d’échouer.',
          source: 'feeder',
          severity: 'high',
          deviceId: 'esp32-feeder-mimi',
          petName: 'Mimi',
          at: now.subtract(const Duration(minutes: 12)),
        ),
        IotAlert(
          id: 'a2',
          title: 'ESP32 hors ligne — Rex',
          message: 'Distributeur Rex déconnecté du broker MQTT depuis ~2 h.',
          source: 'feeder',
          severity: 'high',
          deviceId: 'esp32-feeder-rex',
          petName: 'Rex',
          at: now.subtract(const Duration(hours: 2)),
        ),
        IotAlert(
          id: 'a3',
          title: 'Hydratation basse — Rex',
          message: 'Fontaine ESP32 : 19 % de l’objectif (95 / 500 ml).',
          source: 'water',
          severity: 'high',
          deviceId: 'esp32-water-rex',
          petName: 'Rex',
          at: now.subtract(const Duration(minutes: 40)),
        ),
        IotAlert(
          id: 'a4',
          title: 'Humidité élevée — silo Mimi',
          message: 'Capteur ESP32 : humidité 79 %. Surveillez la qualité des croquettes.',
          source: 'humidity',
          severity: 'medium',
          deviceId: 'esp32-cam-mimi',
          petName: 'Mimi',
          at: now.subtract(const Duration(hours: 1)),
        ),
        IotAlert(
          id: 'a5',
          title: 'Qualité CAM — Mimi',
          message: 'ESP32-CAM score 71 % — contrôle visuel recommandé.',
          source: 'feeder-cam',
          severity: 'medium',
          deviceId: 'esp32-cam-mimi',
          petName: 'Mimi',
          at: now.subtract(const Duration(hours: 3)),
        ),
        IotAlert(
          id: 'a6',
          title: 'Température élevée — Mimi',
          message: 'Bac à 29,4 °C — risque de dégradation des croquettes.',
          source: 'temperature',
          severity: 'medium',
          deviceId: 'esp32-feeder-mimi',
          petName: 'Mimi',
          at: now.subtract(const Duration(hours: 4)),
        ),
        IotAlert(
          id: 'a7',
          title: 'Repas programmé — Mimi',
          message: 'Prochaine distribution ESP32 à 12:30 (30 g).',
          source: 'feeder',
          severity: 'low',
          deviceId: 'esp32-feeder-mimi',
          petName: 'Mimi',
          at: now.subtract(const Duration(hours: 5)),
        ),
      ],
    );
  }
}

extension _IotPackCopy on IotPack {
  IotPack copyWith({
    String? mode,
    int? healthScore,
    IotCounts? counts,
    List<IotDevice>? devices,
    List<IotAnomaly>? anomalies,
    List<IotAlert>? alerts,
  }) =>
      IotPack(
        mode: mode ?? this.mode,
        healthScore: healthScore ?? this.healthScore,
        counts: counts ?? this.counts,
        devices: devices ?? this.devices,
        anomalies: anomalies ?? this.anomalies,
        alerts: alerts ?? this.alerts,
      );
}
