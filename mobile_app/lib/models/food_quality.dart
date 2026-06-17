class FoodQualityDevice {
  FoodQualityDevice({
    required this.id,
    required this.name,
    this.petName,
    this.model,
    this.status = 'online',
  });

  final String id;
  final String name;
  final String? petName;
  final String? model;
  final String status;

  bool get isOnline => status == 'online';

  factory FoodQualityDevice.fromJson(Map<String, dynamic>? j) {
    if (j == null) {
      return FoodQualityDevice(id: 'demo-esp32cam-1', name: 'ESP32-CAM — Récipient Max', petName: 'Max');
    }
    return FoodQualityDevice(
      id: j['id']?.toString() ?? 'esp32-cam',
      name: j['name']?.toString() ?? 'ESP32-CAM',
      petName: j['petName']?.toString(),
      model: j['model']?.toString(),
      status: j['status']?.toString() ?? 'online',
    );
  }
}

class FoodQualityReading {
  FoodQualityReading({
    required this.quality,
    required this.qualityScore,
    this.state,
    this.label,
    this.temperatureC,
    this.humidityPct,
    this.stockLevelPct,
    this.moldPixelRatio,
    this.insectPixelRatio,
    this.avgR,
    this.avgG,
    this.avgB,
    this.aiSummary,
    this.recommendedAction,
    this.isCritical = false,
    this.isNonConforme = false,
    this.anomalyDetected = false,
    this.analyzedAt,
    this.aiClassification,
    this.aiClassificationLabel,
    this.aiClassificationConfidence,
    this.moldDetected,
    this.moldSeverity,
    this.moldConfidence,
    this.moldRegions,
    this.stockEstimateConfidence,
    this.expirationDate,
    this.expirationDaysRemaining,
    this.expirationConfidence,
    this.expirationRisk,
  });

  final String quality;
  final int qualityScore;
  final String? state;
  final String? label;
  final double? temperatureC;
  final double? humidityPct;
  final int? stockLevelPct;
  final double? moldPixelRatio;
  final double? insectPixelRatio;
  final int? avgR;
  final int? avgG;
  final int? avgB;
  final String? aiSummary;
  final String? recommendedAction;
  final bool isCritical;
  final bool isNonConforme;
  final bool anomalyDetected;
  final DateTime? analyzedAt;
  final String? aiClassification;
  final String? aiClassificationLabel;
  final double? aiClassificationConfidence;
  final bool? moldDetected;
  final String? moldSeverity;
  final double? moldConfidence;
  final int? moldRegions;
  final double? stockEstimateConfidence;
  final DateTime? expirationDate;
  final int? expirationDaysRemaining;
  final double? expirationConfidence;
  final String? expirationRisk;

  String get aiClassLabel => aiClassificationLabel ?? displayState;

  String get displayState {
    if (isNonConforme && !isCritical) return 'Nourriture altérée';
    if (state != null && state!.isNotEmpty) return state!;
    switch (quality) {
      case 'good':
        return 'Frais';
      case 'warning':
        return 'Limite';
      case 'bad':
      case 'critical':
        return 'Aliment altéré';
      default:
        return '—';
    }
  }

  factory FoodQualityReading.fromJson(Map<String, dynamic> j) => FoodQualityReading(
        quality: j['quality']?.toString() ?? 'good',
        qualityScore: (j['qualityScore'] as num?)?.toInt() ?? 0,
        state: j['state']?.toString(),
        label: j['label']?.toString(),
        temperatureC: (j['temperatureC'] as num?)?.toDouble(),
        humidityPct: (j['humidityPct'] as num?)?.toDouble(),
        stockLevelPct: (j['stockLevelPct'] as num?)?.toInt(),
        moldPixelRatio: (j['moldPixelRatio'] as num?)?.toDouble(),
        insectPixelRatio: (j['insectPixelRatio'] as num?)?.toDouble(),
        avgR: (j['avgR'] as num?)?.toInt(),
        avgG: (j['avgG'] as num?)?.toInt(),
        avgB: (j['avgB'] as num?)?.toInt(),
        aiSummary: j['aiSummary']?.toString(),
        recommendedAction: j['recommendedAction']?.toString(),
        isCritical: j['isCritical'] == true || j['quality']?.toString() == 'critical',
        isNonConforme: j['isNonConforme'] == true || ((j['qualityScore'] as num?)?.toInt() ?? 100) < 50,
        anomalyDetected: j['anomalyDetected'] == true,
        analyzedAt: j['analyzedAt'] != null ? DateTime.tryParse(j['analyzedAt'].toString()) : null,
        aiClassification: j['aiClassification']?.toString(),
        aiClassificationLabel: j['aiClassificationLabel']?.toString(),
        aiClassificationConfidence: (j['aiClassificationConfidence'] as num?)?.toDouble(),
        moldDetected: j['moldDetected'] == true,
        moldSeverity: j['moldSeverity']?.toString(),
        moldConfidence: (j['moldConfidence'] as num?)?.toDouble(),
        moldRegions: (j['moldRegions'] as num?)?.toInt(),
        stockEstimateConfidence: (j['stockEstimateConfidence'] as num?)?.toDouble(),
        expirationDate: j['expirationDate'] != null ? DateTime.tryParse(j['expirationDate'].toString()) : null,
        expirationDaysRemaining: (j['expirationDaysRemaining'] as num?)?.toInt(),
        expirationConfidence: (j['expirationConfidence'] as num?)?.toDouble(),
        expirationRisk: j['expirationRisk']?.toString(),
      );
}

class FoodQualityState {
  FoodQualityState({
    required this.mode,
    required this.current,
    this.history = const [],
    this.device,
  });

  final String mode;
  final FoodQualityReading current;
  final List<FoodQualityReading> history;
  final FoodQualityDevice? device;

  factory FoodQualityState.fromJson(Map<String, dynamic> j) {
    final historyRaw = j['history'] as List<dynamic>? ?? [];
    return FoodQualityState(
      mode: j['mode']?.toString() ?? 'demo',
      current: FoodQualityReading.fromJson(
        Map<String, dynamic>.from(j['current'] as Map? ?? {}),
      ),
      history: historyRaw
          .map((e) => FoodQualityReading.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      device: FoodQualityDevice.fromJson(j['device'] as Map<String, dynamic>?),
    );
  }
}

class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    this.message,
    this.type,
    this.read = false,
    this.createdAt,
  });

  final String id;
  final String title;
  final String? message;
  final String? type;
  final bool read;
  final DateTime? createdAt;

  bool get isFoodQuality => type == 'iot_food_quality';

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: j['id']?.toString() ?? j['_id']?.toString() ?? '',
        title: j['title']?.toString() ?? 'Notification',
        message: (j['message'] ?? j['description'] ?? j['body'])?.toString(),
        type: j['type']?.toString(),
        read: j['read'] == true,
        createdAt: j['createdAt'] != null ? DateTime.tryParse(j['createdAt'].toString()) : null,
      );
}
