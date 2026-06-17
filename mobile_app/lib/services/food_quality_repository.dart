import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/food_quality.dart';
import 'api_client.dart';
import 'food_quality_ai_engine.dart';
import 'food_quality_engine.dart';

class FoodQualityRepository {
  FoodQualityRepository(this.api);

  final ApiClient api;
  static const _journalKey = 'petfoodtn_mobile:fq-journal';
  static const _alertsKey = 'petfoodtn_mobile:fq-alerts';

  Future<FoodQualityState> fetchState() async {
    try {
      final data = await api.get('/client/iot/food-quality');
      if (data is Map && data['current'] != null) {
        return _enrichState(FoodQualityState.fromJson(Map<String, dynamic>.from(data)));
      }
    } catch (_) {
      /* fallback demo */
    }

    final stored = await _loadJournal();
    if (stored.isNotEmpty) {
      return FoodQualityState(
        mode: 'demo',
        current: stored.first,
        history: stored,
        device: FoodQualityDevice(
          id: 'demo-esp32cam-1',
          name: 'ESP32-CAM — Récipient Max',
          petName: 'Max',
          model: 'ESP32-CAM + OLED',
        ),
      );
    }
    return FoodQualityEngine.demoState();
  }

  Future<FoodQualityReading> simulateReading(String scenario) async {
    final reading = FoodQualityEngine.simulate(scenario);
    try {
      final data = await api.post('/client/iot/food-quality/reading', {
        'quality': reading.quality,
        'qualityScore': reading.qualityScore,
        'state': reading.state,
        'aiClassification': reading.aiClassification,
        'aiClassificationLabel': reading.aiClassificationLabel,
        'temperatureC': reading.temperatureC,
        'humidityPct': reading.humidityPct,
        'stockLevelPct': reading.stockLevelPct,
        'moldPixelRatio': reading.moldPixelRatio,
        'insectPixelRatio': reading.insectPixelRatio,
        'moldDetected': reading.moldDetected,
        'expirationDaysRemaining': reading.expirationDaysRemaining,
        'isNonConforme': reading.isNonConforme,
        'anomalyDetected': reading.anomalyDetected,
        'analyzedAt': reading.analyzedAt?.toIso8601String(),
      });
      if (data is Map && data['reading'] != null) {
        final r = _enrichReading(FoodQualityReading.fromJson(Map<String, dynamic>.from(data['reading'])));
        await _appendJournal(r);
        if (r.isNonConforme) await _storeLocalAlert(r);
        return r;
      }
    } catch (_) {
      /* local */
    }
    await _appendJournal(reading);
    if (reading.isNonConforme) await _storeLocalAlert(reading);
    return reading;
  }

  FoodQualityState _enrichState(FoodQualityState state) => FoodQualityState(
        mode: state.mode,
        current: _enrichReading(state.current),
        history: state.history.map(_enrichReading).toList(),
        device: state.device,
      );

  FoodQualityReading _enrichReading(FoodQualityReading r) {
    if (r.aiClassification != null) return r;
    return FoodQualityAiEngine.enrich(r);
  }

  Future<List<AppNotification>> fetchNotifications() async {
    try {
      final data = await api.get('/notifications');
      if (data is List) {
        return data
            .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e)))
            .where((n) => n.isFoodQuality || n.title.contains('ALERTE') || n.title.contains('Qualité'))
            .toList();
      }
    } catch (_) {}

    return _loadLocalAlerts();
  }

  Future<List<FoodQualityReading>> loadJournal() async {
    final state = await fetchState();
    final stored = await _loadJournal();
    if (stored.isNotEmpty) return stored;
    return state.history;
  }

  Future<List<FoodQualityReading>> getActiveAlerts() async {
    final journal = await loadJournal();
    return journal.where((r) => r.isNonConforme || r.isCritical).toList();
  }

  Future<void> _appendJournal(FoodQualityReading reading) async {
    final list = await _loadJournal();
    list.insert(0, reading);
    final trimmed = list.take(30).toList();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _journalKey,
      jsonEncode(trimmed.map(_readingToJson).toList()),
    );
  }

  Future<List<FoodQualityReading>> _loadJournal() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_journalKey);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map((e) => FoodQualityReading.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _storeLocalAlert(FoodQualityReading reading) async {
    final alert = AppNotification(
      id: 'fq-${reading.analyzedAt?.millisecondsSinceEpoch ?? DateTime.now().millisecondsSinceEpoch}',
      title: reading.isCritical
          ? 'Qualité alimentaire critique'
          : '⚠ ALERTE — Nourriture non conforme',
      message: 'Qualité : ${reading.qualityScore}%',
      type: 'iot_food_quality',
      read: false,
      createdAt: reading.analyzedAt ?? DateTime.now(),
    );
    final prefs = await SharedPreferences.getInstance();
    final existing = await _loadLocalAlerts();
    final next = [alert, ...existing.where((a) => a.id != alert.id)].take(20).toList();
    await prefs.setString(
      _alertsKey,
      jsonEncode(next.map(_notifToJson).toList()),
    );
  }

  Future<List<AppNotification>> _loadLocalAlerts() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_alertsKey);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (_) {
      return [];
    }
  }

  Map<String, dynamic> _readingToJson(FoodQualityReading r) => {
        'quality': r.quality,
        'qualityScore': r.qualityScore,
        'state': r.state,
        'temperatureC': r.temperatureC,
        'humidityPct': r.humidityPct,
        'stockLevelPct': r.stockLevelPct,
        'moldPixelRatio': r.moldPixelRatio,
        'insectPixelRatio': r.insectPixelRatio,
        'isCritical': r.isCritical,
        'isNonConforme': r.isNonConforme,
        'anomalyDetected': r.anomalyDetected,
        'recommendedAction': r.recommendedAction,
        'aiSummary': r.aiSummary,
        'analyzedAt': r.analyzedAt?.toIso8601String(),
        'aiClassification': r.aiClassification,
        'aiClassificationLabel': r.aiClassificationLabel,
        'aiClassificationConfidence': r.aiClassificationConfidence,
        'moldDetected': r.moldDetected,
        'moldSeverity': r.moldSeverity,
        'moldConfidence': r.moldConfidence,
        'moldRegions': r.moldRegions,
        'stockEstimateConfidence': r.stockEstimateConfidence,
        'expirationDate': r.expirationDate?.toIso8601String(),
        'expirationDaysRemaining': r.expirationDaysRemaining,
        'expirationConfidence': r.expirationConfidence,
        'expirationRisk': r.expirationRisk,
      };

  Map<String, dynamic> _notifToJson(AppNotification n) => {
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'type': n.type,
        'read': n.read,
        'createdAt': n.createdAt?.toIso8601String(),
      };
}
