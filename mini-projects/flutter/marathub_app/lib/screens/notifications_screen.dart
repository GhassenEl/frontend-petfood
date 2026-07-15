import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../services/app_store.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key, required this.store});

  final AppStore store;

  Color _kindColor(String kind) {
    return switch (kind) {
      'training' => const Color(0xFFB8FF3C),
      'health' => const Color(0xFF4AC8FF),
      'ai' => const Color(0xFFE2C078),
      'success' => const Color(0xFF7DFFB3),
      _ => const Color(0xFFFF6B4A),
    };
  }

  IconData _kindIcon(String kind) {
    return switch (kind) {
      'training' => Icons.fitness_center,
      'health' => Icons.water_drop_outlined,
      'ai' => Icons.auto_awesome,
      'success' => Icons.check_circle_outline,
      _ => Icons.notifications_outlined,
    };
  }

  Future<void> _createReminder(BuildContext context) async {
    final titleCtrl = TextEditingController(text: 'Rappel course');
    final bodyCtrl = TextEditingController(text: 'Séance prévue — n’oublie pas tes baskets.');
    String kind = 'training';

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161A1F),
        title: const Text('Nouvelle notification'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              decoration: const InputDecoration(labelText: 'Titre', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: bodyCtrl,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Message', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: kind,
              decoration: const InputDecoration(labelText: 'Type', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'training', child: Text('Entraînement')),
                DropdownMenuItem(value: 'health', child: Text('Santé')),
                DropdownMenuItem(value: 'ai', child: Text('IA')),
                DropdownMenuItem(value: 'info', child: Text('Info')),
              ],
              onChanged: (v) => kind = v ?? kind,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFB8FF3C),
              foregroundColor: const Color(0xFF0B0D10),
            ),
            child: const Text('Créer'),
          ),
        ],
      ),
    );

    if (ok == true) {
      await store.addNotification(
        title: titleCtrl.text.trim().isEmpty ? 'Rappel' : titleCtrl.text.trim(),
        body: bodyCtrl.text.trim(),
        kind: kind,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 12, 8),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Notifications',
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -0.8),
                  ),
                ),
                IconButton(
                  tooltip: 'Tout lu',
                  onPressed: store.unreadNotifications == 0 ? null : store.markAllRead,
                  icon: const Icon(Icons.done_all),
                  color: const Color(0xFFB8FF3C),
                ),
                IconButton(
                  tooltip: 'Nouvelle alerte',
                  onPressed: () => _createReminder(context),
                  icon: const Icon(Icons.add_alert_outlined),
                  color: const Color(0xFFB8FF3C),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${store.unreadNotifications} non lue(s) · rappels entraînement & IA',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: store.notifications.isEmpty
                ? Center(
                    child: Text(
                      'Aucune notification.',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.45)),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    itemCount: store.notifications.length,
                    itemBuilder: (context, i) {
                      final n = store.notifications[i];
                      final color = _kindColor(n.kind);
                      return InkWell(
                        onTap: () => store.markRead(n.id),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: n.read ? const Color(0xFF12151A) : const Color(0xFF1A2218),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: n.read ? const Color(0xFF2A3340) : color.withValues(alpha: 0.45),
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(_kindIcon(n.kind), color: color, size: 22),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            n.title,
                                            style: TextStyle(
                                              fontWeight: FontWeight.w800,
                                              color: n.read
                                                  ? Colors.white.withValues(alpha: 0.65)
                                                  : Colors.white,
                                            ),
                                          ),
                                        ),
                                        if (!n.read)
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              color: color,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      n.body,
                                      style: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.55),
                                        height: 1.35,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      DateFormat('dd MMM · HH:mm').format(n.createdAt),
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.white.withValues(alpha: 0.35),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
