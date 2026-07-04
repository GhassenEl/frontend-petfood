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
    if (pack.anomalies.isNotEmpty) return pack;
    final detected = <IotAnomaly>[];
    for (final d in pack.devices) {
      detected.addAll(_detectDeviceAnomalies(d));
    }
    return pack.copyWith(anomalies: detected);
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
    final reservoir = m['reservoirPercent'] as num?;
    if (reservoir != null && reservoir < 15) {
      out.add(IotAnomaly(
        id: '${device.id}-stock',
        deviceName: device.name,
        type: 'stock',
        severity: 'medium',
        message: 'Réservoir bas — $reservoir %.',
      ));
    }
    return out;
  }

  IotPack _demoPack() => IotPack(
        mode: 'demo',
        healthScore: 76,
        counts: const IotCounts(
          feeders: 1,
          feedersOnline: 1,
          feederCams: 1,
          feederCamsOnline: 1,
          waterMonitors: 2,
          waterOnline: 2,
          alerts: 3,
          criticalAlerts: 1,
        ),
        devices: [
          IotDevice(
            id: 'demo-feeder-1',
            type: 'feeder',
            name: 'Distributeur Max — Salon',
            status: 'online',
            petName: 'Max',
            metrics: const {
              'reservoirPercent': 42,
              'temperature': 24.2,
              'todayGrams': 65,
              'isLowFood': true,
            },
            signalStrength: 82,
            lastSeen: DateTime.now().subtract(const Duration(minutes: 2)),
          ),
          IotDevice(
            id: 'demo-esp32cam-1',
            type: 'feeder-cam',
            name: 'ESP32-CAM — Bac croquettes',
            status: 'online',
            petName: 'Max',
            metrics: const {
              'qualityScore': 72,
              'foodQuality': 'warning',
              'temperatureC': 24.2,
              'humidityPct': 58,
            },
            signalStrength: 88,
            lastSeen: DateTime.now().subtract(const Duration(seconds: 30)),
          ),
          IotDevice(
            id: 'demo-water-1',
            type: 'water',
            name: 'Fontaine Max',
            status: 'online',
            petName: 'Max',
            metrics: const {'todayMl': 420, 'targetMl': 550, 'percentOfTarget': 76},
            signalStrength: 91,
            lastSeen: DateTime.now().subtract(const Duration(minutes: 1)),
          ),
        ],
      );
}

extension _IotPackCopy on IotPack {
  IotPack copyWith({
    String? mode,
    int? healthScore,
    IotCounts? counts,
    List<IotDevice>? devices,
    List<IotAnomaly>? anomalies,
  }) =>
      IotPack(
        mode: mode ?? this.mode,
        healthScore: healthScore ?? this.healthScore,
        counts: counts ?? this.counts,
        devices: devices ?? this.devices,
        anomalies: anomalies ?? this.anomalies,
      );
}
