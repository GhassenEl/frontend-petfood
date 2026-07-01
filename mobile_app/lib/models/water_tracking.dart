class WaterPetOverview {
  WaterPetOverview({
    required this.petId,
    required this.name,
    required this.type,
    this.alert = false,
    this.todayMl = 0,
    this.targetMl = 0,
    this.percentOfTarget = 0,
  });

  final String petId;
  final String name;
  final String type;
  final bool alert;
  final int todayMl;
  final int targetMl;
  final int percentOfTarget;

  factory WaterPetOverview.fromJson(Map<String, dynamic> j) => WaterPetOverview(
        petId: j['petId']?.toString() ?? '',
        name: j['name']?.toString() ?? j['petName']?.toString() ?? 'Animal',
        type: j['type']?.toString() ?? j['petType']?.toString() ?? 'dog',
        alert: j['alert'] == true,
        todayMl: (j['todayMl'] as num?)?.toInt() ?? 0,
        targetMl: (j['targetMl'] as num?)?.toInt() ?? 0,
        percentOfTarget: (j['percentOfTarget'] as num?)?.toInt() ?? 0,
      );
}

class WaterMonitor {
  WaterMonitor({
    required this.id,
    required this.name,
    this.online = false,
    this.reservoirMl,
    this.reservoirCapacityMl,
    this.waterTempC,
    this.filterDaysLeft,
    this.pumpActive = false,
  });

  final String id;
  final String name;
  final bool online;
  final int? reservoirMl;
  final int? reservoirCapacityMl;
  final double? waterTempC;
  final int? filterDaysLeft;
  final bool pumpActive;

  int? get reservoirPct {
    if (reservoirMl == null || reservoirCapacityMl == null || reservoirCapacityMl! <= 0) return null;
    return ((reservoirMl! / reservoirCapacityMl!) * 100).round();
  }

  factory WaterMonitor.fromJson(Map<String, dynamic> j) => WaterMonitor(
        id: j['id']?.toString() ?? '',
        name: j['name']?.toString() ?? 'Fontaine',
        online: j['online'] == true || j['status']?.toString() == 'online',
        reservoirMl: (j['reservoirMl'] as num?)?.toInt(),
        reservoirCapacityMl: (j['reservoirCapacityMl'] as num?)?.toInt(),
        waterTempC: (j['waterTempC'] as num?)?.toDouble(),
        filterDaysLeft: (j['filterDaysLeft'] as num?)?.toInt(),
        pumpActive: j['pumpActive'] == true,
      );
}

class WaterAlert {
  WaterAlert({required this.severity, required this.message, this.petId, this.petName});

  final String severity;
  final String message;
  final String? petId;
  final String? petName;

  factory WaterAlert.fromJson(Map<String, dynamic> j) => WaterAlert(
        severity: j['severity']?.toString() ?? 'low',
        message: j['message']?.toString() ?? '',
        petId: j['petId']?.toString(),
        petName: j['petName']?.toString(),
      );
}

class WaterHourlyPoint {
  WaterHourlyPoint({required this.label, required this.hour, required this.volumeMl});

  final String label;
  final int hour;
  final int volumeMl;

  factory WaterHourlyPoint.fromJson(Map<String, dynamic> j) => WaterHourlyPoint(
        label: j['label']?.toString() ?? '',
        hour: (j['hour'] as num?)?.toInt() ?? 0,
        volumeMl: (j['volumeMl'] as num?)?.toInt() ?? 0,
      );
}

class WaterDayPoint {
  WaterDayPoint({required this.label, required this.totalMl});

  final String label;
  final int totalMl;

  factory WaterDayPoint.fromJson(Map<String, dynamic> j) => WaterDayPoint(
        label: j['label']?.toString() ?? '',
        totalMl: (j['totalMl'] as num?)?.toInt() ?? 0,
      );
}

class WaterTracking {
  WaterTracking({
    required this.petId,
    required this.petName,
    required this.petType,
    required this.todayMl,
    required this.targetMl,
    this.percentOfTarget,
    this.monitor,
    this.stats = const {},
    this.alerts = const [],
    this.hourlyToday = const [],
    this.series = const [],
    this.hydrationTip,
  });

  final String petId;
  final String petName;
  final String petType;
  final int todayMl;
  final int targetMl;
  final int? percentOfTarget;
  final WaterMonitor? monitor;
  final Map<String, dynamic> stats;
  final List<WaterAlert> alerts;
  final List<WaterHourlyPoint> hourlyToday;
  final List<WaterDayPoint> series;
  final String? hydrationTip;

  int get pct => percentOfTarget ?? (targetMl > 0 ? ((todayMl / targetMl) * 100).round() : 0);

  factory WaterTracking.fromJson(Map<String, dynamic> j) {
    final tracking = j['tracking'] is Map ? Map<String, dynamic>.from(j['tracking'] as Map) : j;
    return WaterTracking(
      petId: tracking['petId']?.toString() ?? '',
      petName: tracking['petName']?.toString() ?? 'Animal',
      petType: tracking['petType']?.toString() ?? 'dog',
      todayMl: (tracking['todayMl'] as num?)?.toInt() ?? 0,
      targetMl: (tracking['targetMl'] as num?)?.toInt() ?? 550,
      percentOfTarget: (tracking['percentOfTarget'] as num?)?.toInt(),
      monitor: tracking['monitor'] != null ? WaterMonitor.fromJson(Map<String, dynamic>.from(tracking['monitor'] as Map)) : null,
      stats: Map<String, dynamic>.from(tracking['stats'] as Map? ?? {}),
      alerts: (tracking['alerts'] as List<dynamic>? ?? [])
          .map((e) => WaterAlert.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      hourlyToday: (tracking['hourlyToday'] as List<dynamic>? ?? [])
          .map((e) => WaterHourlyPoint.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      series: (tracking['series'] as List<dynamic>? ?? [])
          .map((e) => WaterDayPoint.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      hydrationTip: tracking['hydrationTip']?.toString(),
    );
  }

  WaterTracking copyWith({int? todayMl, int? percentOfTarget}) => WaterTracking(
        petId: petId,
        petName: petName,
        petType: petType,
        todayMl: todayMl ?? this.todayMl,
        targetMl: targetMl,
        percentOfTarget: percentOfTarget ?? this.percentOfTarget,
        monitor: monitor,
        stats: stats,
        alerts: alerts,
        hourlyToday: hourlyToday,
        series: series,
        hydrationTip: hydrationTip,
      );
}
