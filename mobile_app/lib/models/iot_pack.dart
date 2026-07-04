class IotCounts {
  const IotCounts({
    this.feeders = 0,
    this.feedersOnline = 0,
    this.feederCams = 0,
    this.feederCamsOnline = 0,
    this.waterMonitors = 0,
    this.waterOnline = 0,
    this.alerts = 0,
    this.criticalAlerts = 0,
  });

  final int feeders;
  final int feedersOnline;
  final int feederCams;
  final int feederCamsOnline;
  final int waterMonitors;
  final int waterOnline;
  final int alerts;
  final int criticalAlerts;

  factory IotCounts.fromJson(Map<String, dynamic>? json) {
    final m = json ?? {};
    return IotCounts(
      feeders: (m['feeders'] as num?)?.toInt() ?? 0,
      feedersOnline: (m['feedersOnline'] as num?)?.toInt() ?? 0,
      feederCams: (m['feederCams'] as num?)?.toInt() ?? 0,
      feederCamsOnline: (m['feederCamsOnline'] as num?)?.toInt() ?? 0,
      waterMonitors: (m['waterMonitors'] as num?)?.toInt() ?? 0,
      waterOnline: (m['waterOnline'] as num?)?.toInt() ?? 0,
      alerts: (m['alerts'] as num?)?.toInt() ?? 0,
      criticalAlerts: (m['criticalAlerts'] as num?)?.toInt() ?? 0,
    );
  }
}

class IotDevice {
  const IotDevice({
    required this.id,
    required this.type,
    required this.name,
    this.status = 'offline',
    this.petName,
    this.metrics = const {},
    this.signalStrength,
    this.lastSeen,
  });

  final String id;
  final String type;
  final String name;
  final String status;
  final String? petName;
  final Map<String, dynamic> metrics;
  final int? signalStrength;
  final DateTime? lastSeen;

  bool get isOnline => status == 'online';

  factory IotDevice.fromJson(Map<String, dynamic> json) {
    DateTime? seen;
    final raw = json['lastSeen'];
    if (raw is String) seen = DateTime.tryParse(raw);

    return IotDevice(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'device',
      name: json['name']?.toString() ?? 'Appareil IoT',
      status: json['status']?.toString() ?? 'offline',
      petName: json['petName']?.toString(),
      metrics: Map<String, dynamic>.from(json['metrics'] as Map? ?? {}),
      signalStrength: (json['signalStrength'] as num?)?.toInt(),
      lastSeen: seen,
    );
  }
}

class IotAnomaly {
  const IotAnomaly({
    required this.id,
    required this.deviceName,
    required this.type,
    required this.severity,
    required this.message,
  });

  final String id;
  final String deviceName;
  final String type;
  final String severity;
  final String message;

  factory IotAnomaly.fromJson(Map<String, dynamic> json) => IotAnomaly(
        id: json['id']?.toString() ?? '',
        deviceName: json['deviceName']?.toString() ?? '—',
        type: json['type']?.toString() ?? 'iot',
        severity: json['severity']?.toString() ?? 'medium',
        message: json['message']?.toString() ?? '',
      );
}

class IotPack {
  const IotPack({
    this.mode = 'demo',
    this.healthScore = 0,
    this.counts = const IotCounts(),
    this.devices = const [],
    this.anomalies = const [],
  });

  final String mode;
  final int healthScore;
  final IotCounts counts;
  final List<IotDevice> devices;
  final List<IotAnomaly> anomalies;

  bool get isLive => mode == 'live' || mode == 'api';

  int get devicesOnline => devices.where((d) => d.isOnline).length;

  factory IotPack.fromJson(Map<String, dynamic> json) {
    final devicesRaw = json['devices'] as List? ?? [];
    final anomaliesRaw = json['anomalies'] as List? ?? [];
    return IotPack(
      mode: json['mode']?.toString() ?? 'live',
      healthScore: (json['healthScore'] as num?)?.toInt() ?? 0,
      counts: IotCounts.fromJson(json['counts'] as Map<String, dynamic>?),
      devices: devicesRaw
          .map((e) => IotDevice.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      anomalies: anomaliesRaw
          .map((e) => IotAnomaly.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}
