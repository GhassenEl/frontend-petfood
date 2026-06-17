import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PushNotificationItem {
  PushNotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.at,
    this.read = false,
  });

  final String id;
  final String title;
  final String body;
  final DateTime at;
  bool read;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'at': at.toIso8601String(),
        'read': read,
      };

  factory PushNotificationItem.fromJson(Map<String, dynamic> json) => PushNotificationItem(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        body: json['body']?.toString() ?? '',
        at: DateTime.tryParse(json['at']?.toString() ?? '') ?? DateTime.now(),
        read: json['read'] == true,
      );
}

/// Notifications push (in-app + persistance locale — FCM/APNs en production).
class PushNotificationService {
  static const _key = 'petfoodtn_push_notifications';
  static const _enabledKey = 'petfoodtn_push_enabled';

  Future<bool> isEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_enabledKey) ?? true;
  }

  Future<void> setEnabled(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_enabledKey, value);
  }

  Future<List<PushNotificationItem>> loadAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_key) ?? [];
    if (raw.isEmpty) return _seedDemo();
    return raw.map((s) => PushNotificationItem.fromJson(jsonDecode(s) as Map<String, dynamic>)).toList();
  }

  Future<void> push(String title, String body) async {
    if (!await isEnabled()) return;
    final items = await loadAll();
    items.insert(
      0,
      PushNotificationItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        body: body,
        at: DateTime.now(),
      ),
    );
    await _save(items.take(50).toList());
  }

  Future<void> markRead(String id) async {
    final items = await loadAll();
    for (final n in items) {
      if (n.id == id) n.read = true;
    }
    await _save(items);
  }

  Future<int> unreadCount() async {
    final items = await loadAll();
    return items.where((n) => !n.read).length;
  }

  Future<void> _save(List<PushNotificationItem> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_key, items.map((n) => jsonEncode(n.toJson())).toList());
  }

  Future<List<PushNotificationItem>> _seedDemo() async {
    final demo = [
      PushNotificationItem(
        id: '1',
        title: 'Alerte IoT — Qualité alimentaire',
        body: 'ESP32-CAM : score 87% — lot PF-TN-2026-A042 conforme.',
        at: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      PushNotificationItem(
        id: '2',
        title: 'Livraison en route',
        body: 'Votre commande PF-28491 arrive dans ~28 min. Chaîne du froid : 4°C.',
        at: DateTime.now().subtract(const Duration(minutes: 40)),
      ),
    ];
    await _save(demo);
    return demo;
  }
}
