import 'dart:convert';

import 'package:flutter/services.dart';

import '../models/water_tracking.dart';
import '../utils/species_catalog.dart';
import 'api_client.dart';

class WaterRepository {
  WaterRepository(this.api);

  final ApiClient api;
  bool lastFetchWasLive = false;
  Map<String, dynamic>? _demoCache;
  Map<String, double> petWeights = {};

  Future<Map<String, dynamic>> _loadDemo() async {
    _demoCache ??= jsonDecode(await rootBundle.loadString('assets/demo_water.json')) as Map<String, dynamic>;
    return _demoCache!;
  }

  WaterTracking _enrich(WaterTracking t, {String? petId}) {
    final pid = petId ?? t.petId;
    final weight = petWeights[pid] ?? (t.stats['weightKg'] as num?)?.toDouble();
    var target = t.targetMl;
    if (!SpeciesCatalog.resolve(t.petType).usesAquarium && weight != null && weight > 0) {
      final computed = SpeciesCatalog.estimateTargetMl(t.petType, weightKg: weight);
      if (computed > 0) target = computed;
    } else if (target <= 0 && !SpeciesCatalog.resolve(t.petType).usesAquarium) {
      target = SpeciesCatalog.estimateTargetMl(t.petType, weightKg: weight);
    }
    final pct = target > 0 ? ((t.todayMl / target) * 100).round().clamp(0, 100) : t.percentOfTarget ?? 0;
    return WaterTracking(
      petId: t.petId,
      petName: t.petName,
      petType: t.petType,
      todayMl: t.todayMl,
      targetMl: target,
      percentOfTarget: pct,
      monitor: t.monitor,
      stats: {...t.stats, if (weight != null) 'weightKg': weight},
      alerts: t.alerts,
      hourlyToday: t.hourlyToday,
      series: t.series,
      hydrationTip: t.hydrationTip ?? SpeciesCatalog.resolve(t.petType).hydrationTip,
    );
  }

  Future<List<WaterPetOverview>> fetchOverview() async {
    try {
      final data = await api.get('/ecosystem/water-monitor');
      final pets = (data['pets'] as List<dynamic>? ?? []);
      lastFetchWasLive = true;
      return pets.map((e) {
        final o = WaterPetOverview.fromJson(Map<String, dynamic>.from(e));
        final w = petWeights[o.petId];
        if (w != null && w > 0 && o.targetMl <= 0) {
          final target = SpeciesCatalog.estimateTargetMl(o.type, weightKg: w);
          return WaterPetOverview(
            petId: o.petId,
            name: o.name,
            type: o.type,
            alert: o.alert,
            todayMl: o.todayMl,
            targetMl: target,
            percentOfTarget: o.todayMl > 0 ? ((o.todayMl / target) * 100).round() : o.percentOfTarget,
          );
        }
        return o;
      }).toList();
    } catch (_) {
      lastFetchWasLive = false;
      final demo = await _loadDemo();
      return (demo['pets'] as List<dynamic>)
          .map((e) => WaterPetOverview.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
  }

  Future<WaterTracking> fetchTracking(String petId) async {
    try {
      final data = await api.get('/ecosystem/water-monitor/$petId');
      if (data != null) {
        lastFetchWasLive = true;
        return _enrich(WaterTracking.fromJson(Map<String, dynamic>.from(data as Map)), petId: petId);
      }
    } catch (_) {}
    lastFetchWasLive = false;
    final demo = await _loadDemo();
    final tracking = (demo['tracking'] as Map<String, dynamic>)[petId] ??
        (demo['tracking'] as Map<String, dynamic>)['demo-pet-1'];
    return _enrich(WaterTracking.fromJson(Map<String, dynamic>.from(tracking as Map)), petId: petId);
  }

  Future<WaterTracking> logWater(String petId, int volumeMl) async {
    try {
      final data = await api.post('/ecosystem/water-monitor/$petId/log', {'volumeMl': volumeMl});
      lastFetchWasLive = true;
      return _enrich(WaterTracking.fromJson(Map<String, dynamic>.from(data as Map)), petId: petId);
    } catch (_) {
      lastFetchWasLive = false;
      final t = await fetchTracking(petId);
      final nextMl = t.todayMl + volumeMl;
      return t.copyWith(
        todayMl: nextMl,
        percentOfTarget: t.targetMl > 0 ? ((nextMl / t.targetMl) * 100).round().clamp(0, 100) : 0,
      );
    }
  }

  Future<WaterTracking> refill(String petId) async {
    try {
      final data = await api.post('/ecosystem/water-monitor/$petId/refill', {});
      lastFetchWasLive = true;
      return _enrich(WaterTracking.fromJson(Map<String, dynamic>.from(data as Map)), petId: petId);
    } catch (_) {
      lastFetchWasLive = false;
      return fetchTracking(petId);
    }
  }

  Future<List<WaterAlert>> fetchAlerts() async {
    try {
      final data = await api.get('/ecosystem/water-monitor/alerts');
      lastFetchWasLive = true;
      return (data['alerts'] as List<dynamic>? ?? [])
          .map((e) => WaterAlert.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      lastFetchWasLive = false;
      final demo = await _loadDemo();
      final alerts = <WaterAlert>[];
      for (final entry in (demo['tracking'] as Map<String, dynamic>).entries) {
        final id = entry.key;
        final t = WaterTracking.fromJson(Map<String, dynamic>.from(entry.value as Map));
        for (final a in t.alerts) {
          alerts.add(WaterAlert(severity: a.severity, message: a.message, petId: id, petName: t.petName));
        }
      }
      return alerts;
    }
  }
}
