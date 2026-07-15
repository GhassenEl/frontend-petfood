import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/models.dart';
import 'ai_coach.dart';

class AppStore extends ChangeNotifier {
  AppStore._(this._prefs);

  final SharedPreferences _prefs;
  final _rng = Random();

  List<RunEntry> runs = [];
  List<AppNotification> notifications = [];
  AthleteProfile profile = AthleteProfile();
  AiAdvice? lastAdvice;

  static const _kRuns = 'marathub_runs';
  static const _kNotifs = 'marathub_notifs';
  static const _kProfile = 'marathub_profile';
  static const _kAdvice = 'marathub_advice';

  static Future<AppStore> create() async {
    final prefs = await SharedPreferences.getInstance();
    final store = AppStore._(prefs);
    store._load();
    if (store.runs.isEmpty) store._seedDemo();
    store._ensureTrainingReminders();
    return store;
  }

  int get unreadNotifications => notifications.where((n) => !n.read).length;

  double get weekKm {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day)
        .subtract(Duration(days: now.weekday - 1));
    return runs
        .where((r) => !r.date.isBefore(start))
        .fold(0.0, (a, r) => a + r.distanceKm);
  }

  double get totalKm => runs.fold(0.0, (a, r) => a + r.distanceKm);

  int get streakDays {
    if (runs.isEmpty) return 0;
    final days = runs
        .map((r) => DateTime(r.date.year, r.date.month, r.date.day))
        .toSet();
    var cursor = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    if (!days.contains(cursor)) {
      cursor = cursor.subtract(const Duration(days: 1));
      if (!days.contains(cursor)) return 0;
    }
    var streak = 0;
    while (days.contains(cursor)) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak;
  }

  void _load() {
    runs = (_decode(_prefs.getString(_kRuns))).map(RunEntry.fromJson).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
    notifications =
        (_decode(_prefs.getString(_kNotifs))).map(AppNotification.fromJson).toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final profileRaw = _prefs.getString(_kProfile);
    if (profileRaw != null) {
      profile = AthleteProfile.fromJson(
        jsonDecode(profileRaw) as Map<String, dynamic>,
      );
    }
    final adviceRaw = _prefs.getString(_kAdvice);
    if (adviceRaw != null) {
      lastAdvice = AiAdvice.fromJson(jsonDecode(adviceRaw) as Map<String, dynamic>);
    }
  }

  List<Map<String, dynamic>> _decode(String? raw) {
    if (raw == null || raw.isEmpty) return [];
    final data = jsonDecode(raw);
    if (data is! List) return [];
    return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<void> _persist() async {
    await _prefs.setString(_kRuns, jsonEncode(runs.map((e) => e.toJson()).toList()));
    await _prefs.setString(
      _kNotifs,
      jsonEncode(notifications.map((e) => e.toJson()).toList()),
    );
    await _prefs.setString(_kProfile, jsonEncode(profile.toJson()));
    if (lastAdvice != null) {
      await _prefs.setString(_kAdvice, jsonEncode(lastAdvice!.toJson()));
    }
  }

  void _seedDemo() {
    final now = DateTime.now();
    runs = [
      RunEntry(
        id: 'r1',
        date: now.subtract(const Duration(days: 1)),
        distanceKm: 12,
        duration: const Duration(hours: 1, minutes: 8),
        type: 'Endurance',
        notes: 'Allure confortable',
      ),
      RunEntry(
        id: 'r2',
        date: now.subtract(const Duration(days: 3)),
        distanceKm: 8,
        duration: const Duration(minutes: 42),
        type: 'Fractionné',
        notes: '8x400m',
      ),
      RunEntry(
        id: 'r3',
        date: now.subtract(const Duration(days: 5)),
        distanceKm: 18,
        duration: const Duration(hours: 1, minutes: 42),
        type: 'Sortie longue',
      ),
      RunEntry(
        id: 'r4',
        date: now.subtract(const Duration(days: 8)),
        distanceKm: 10,
        duration: const Duration(minutes: 52),
        type: 'Tempo',
      ),
      RunEntry(
        id: 'r5',
        date: now.subtract(const Duration(days: 12)),
        distanceKm: 21.1,
        duration: const Duration(hours: 1, minutes: 48),
        type: 'Semi-marathon',
        notes: 'Course officielle',
      ),
    ];
    notifications = [
      AppNotification(
        id: 'n1',
        title: 'Séance fractionné demain',
        body: 'Prévois 8x400m après 15 min d’échauffement.',
        createdAt: now.subtract(const Duration(hours: 2)),
        kind: 'training',
      ),
      AppNotification(
        id: 'n2',
        title: 'Hydratation',
        body: 'Objectif : 2,5 L d’eau aujourd’hui (chaleur).',
        createdAt: now.subtract(const Duration(hours: 5)),
        kind: 'health',
      ),
    ];
    _persist();
  }

  void _ensureTrainingReminders() {
    final today = DateTime.now();
    final key = 'reminder_${today.year}_${today.month}_${today.day}';
    if (_prefs.getBool(key) == true) return;
    addNotification(
      title: 'Rappel entraînement',
      body: weekKm < profile.weeklyGoalKm * 0.4
          ? 'Volume bas cette semaine (${weekKm.toStringAsFixed(0)} km). Une sortie facile de 8–10 km serait idéale.'
          : 'Tu es à ${weekKm.toStringAsFixed(0)}/${profile.weeklyGoalKm.toStringAsFixed(0)} km. Continue sur ta lancée.',
      kind: 'training',
    );
    _prefs.setBool(key, true);
  }

  Future<void> addRun(RunEntry run) async {
    runs = [run, ...runs];
    await _persist();
    addNotification(
      title: 'Course enregistrée',
      body: '${run.distanceKm.toStringAsFixed(1)} km · ${run.type}',
      kind: 'success',
    );
    notifyListeners();
  }

  Future<void> deleteRun(String id) async {
    runs = runs.where((r) => r.id != id).toList();
    await _persist();
    notifyListeners();
  }

  Future<void> addNotification({
    required String title,
    required String body,
    String kind = 'info',
  }) async {
    notifications = [
      AppNotification(
        id: 'n${DateTime.now().microsecondsSinceEpoch}',
        title: title,
        body: body,
        createdAt: DateTime.now(),
        kind: kind,
      ),
      ...notifications,
    ];
    await _persist();
    notifyListeners();
  }

  Future<void> markRead(String id) async {
    notifications = notifications
        .map((n) => n.id == id ? n.copyWith(read: true) : n)
        .toList();
    await _persist();
    notifyListeners();
  }

  Future<void> markAllRead() async {
    notifications = notifications.map((n) => n.copyWith(read: true)).toList();
    await _persist();
    notifyListeners();
  }

  Future<void> clearNotifications() async {
    notifications = [];
    await _persist();
    notifyListeners();
  }

  Future<AiAdvice> generateAiAdvice() async {
    final advice = AiCoach.analyze(runs: runs, profile: profile, rng: _rng);
    lastAdvice = advice;
    await _persist();
    await addNotification(
      title: 'Nouveau plan IA',
      body: advice.headline,
      kind: 'ai',
    );
    notifyListeners();
    return advice;
  }

  Future<void> updateProfile(AthleteProfile next) async {
    profile = next;
    await _persist();
    notifyListeners();
  }
}
