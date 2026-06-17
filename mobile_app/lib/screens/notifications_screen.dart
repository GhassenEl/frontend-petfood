import 'package:flutter/material.dart';
import '../services/push_notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _service = PushNotificationService();
  List<PushNotificationItem> _items = [];
  bool _enabled = true;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final enabled = await _service.isEnabled();
    final items = await _service.loadAll();
    if (mounted) setState(() { _enabled = enabled; _items = items; _loading = false; });
  }

  Future<void> _toggle(bool v) async {
    await _service.setEnabled(v);
    setState(() => _enabled = v);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications push'), backgroundColor: const Color(0xFFFEF3C7)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                SwitchListTile(
                  title: const Text('Notifications actives'),
                  subtitle: const Text('Alertes IoT, livraison et santé animal'),
                  value: _enabled,
                  onChanged: _toggle,
                ),
                const Divider(),
                if (_items.isEmpty)
                  const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Aucune notification')))
                else
                  ..._items.map((n) => Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Icon(n.read ? Icons.notifications_none : Icons.notifications_active, color: const Color(0xFF059669)),
                          title: Text(n.title, style: TextStyle(fontWeight: n.read ? FontWeight.normal : FontWeight.bold)),
                          subtitle: Text(n.body),
                          onTap: () async {
                            await _service.markRead(n.id);
                            _load();
                          },
                        ),
                      )),
              ],
            ),
    );
  }
}
