import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PushNotificationItem {
  PushNotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.at,
    this.read = false,
    this.category = 'iot',
  });

  final String id;
  final String title;
  final String body;
  final DateTime at;
  final String category;
  bool read;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'at': at.toIso8601String(),
        'read': read,
        'category': category,
      };

  factory PushNotificationItem.fromJson(Map<String, dynamic> json) => PushNotificationItem(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        body: json['body']?.toString() ?? '',
        at: DateTime.tryParse(json['at']?.toString() ?? '') ?? DateTime.now(),
        read: json['read'] == true,
        category: json['category']?.toString() ?? 'iot',
      );
}

/// Notifications push (in-app + persistance locale — FCM/APNs en production).
class PushNotificationService {
  static const _key = 'petfoodtn_push_notifications_v2';
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
    final items = raw
        .map((s) => PushNotificationItem.fromJson(jsonDecode(s) as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => b.at.compareTo(a.at));
    return items;
  }

  Future<void> push(String title, String body, {String category = 'iot'}) async {
    if (!await isEnabled()) return;
    final items = await loadAll();
    items.insert(
      0,
      PushNotificationItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        body: body,
        at: DateTime.now(),
        category: category,
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

  Future<void> markAllRead() async {
    final items = await loadAll();
    for (final n in items) {
      n.read = true;
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
    final now = DateTime.now();
    final demo = [
      PushNotificationItem(
        id: 'n1',
        title: 'Alerte IoT — Qualité alimentaire',
        body: 'ESP32-CAM : score 87 % — lot PF-TN-2026-A042 conforme.',
        at: now.subtract(const Duration(minutes: 25)),
        category: 'quality',
      ),
      PushNotificationItem(
        id: 'n2',
        title: 'Fontaine Rex — hydratation basse',
        body: 'Niveau d’eau sous le seuil (18 %). Remplissage recommandé.',
        at: now.subtract(const Duration(minutes: 40)),
        category: 'iot',
      ),
      PushNotificationItem(
        id: 'n3',
        title: 'Distributeur Mimi — repas manqué',
        body: 'Créneau 08:00 non distribué. Vérifiez le stock et le Wi-Fi.',
        at: now.subtract(const Duration(hours: 1, minutes: 10)),
        category: 'iot',
      ),
      PushNotificationItem(
        id: 'n4',
        title: 'Livraison en route',
        body: 'Commande PF-28491 arrive dans ~28 min. Chaîne du froid : 4 °C.',
        at: now.subtract(const Duration(hours: 2)),
        category: 'delivery',
        read: true,
      ),
      PushNotificationItem(
        id: 'n5',
        title: 'Rappel vaccin — Rex',
        body: 'Rappel antirabique prévu dans 5 jours. Prenez rendez-vous véto.',
        at: now.subtract(const Duration(hours: 5)),
        category: 'health',
      ),
      PushNotificationItem(
        id: 'n6',
        title: 'Stock croquettes bas',
        body: 'Réservoir distributeur à 12 %. Commande automatique possible.',
        at: now.subtract(const Duration(hours: 8)),
        category: 'iot',
      ),
      PushNotificationItem(
        id: 'n7',
        title: 'Humidité élevée — silo',
        body: 'Capteur HX711 / humidité 78 %. Surveillez la qualité des croquettes.',
        at: now.subtract(const Duration(hours: 12)),
        category: 'quality',
      ),
      PushNotificationItem(
        id: 'n8',
        title: 'Connexion MQTT rétablie',
        body: 'Gateway PetfoodTN reconnectée. 3 appareils synchronisés.',
        at: now.subtract(const Duration(days: 1)),
        category: 'iot',
        read: true,
      ),
      PushNotificationItem(
        id: 'n9',
        title: 'Promo fidélité',
        body: '+50 points : -10 % sur la prochaine commande croquettes premium.',
        at: now.subtract(const Duration(days: 1, hours: 4)),
        category: 'promo',
        read: true,
      ),
      PushNotificationItem(
        id: 'n10',
        title: 'Synergie eau + repas',
        body: 'Rex a bien bu après le repas de 18 h. Objectif hydratation atteint.',
        at: now.subtract(const Duration(days: 2)),
        category: 'health',
        read: true,
      ),
    ];
    await _save(demo);
    return demo;
  }
}
