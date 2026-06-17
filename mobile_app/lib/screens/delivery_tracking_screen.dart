import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/delivery_service.dart';

class DeliveryTrackingScreen extends StatefulWidget {
  const DeliveryTrackingScreen({super.key, required this.auth});

  final AuthService auth;

  @override
  State<DeliveryTrackingScreen> createState() => _DeliveryTrackingScreenState();
}

class _DeliveryTrackingScreenState extends State<DeliveryTrackingScreen> {
  late final DeliveryService _service = DeliveryService(widget.auth.api);
  DeliveryTracking? _tracking;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final t = await _service.fetchActiveDelivery();
    if (mounted) setState(() { _tracking = t; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final t = _tracking;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Suivi livraison'),
        backgroundColor: const Color(0xFFDBEAFE),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : t == null
              ? const Center(child: Text('Aucune livraison active'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      color: const Color(0xFF1E40AF),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Commande #${t.orderId}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            Text('En route', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.schedule, color: Colors.white70, size: 18),
                                const SizedBox(width: 6),
                                Text('ETA ~${t.etaMinutes} min', style: const TextStyle(color: Colors.white)),
                                const Spacer(),
                                const Icon(Icons.thermostat, color: Colors.white70, size: 18),
                                Text(' ${t.temperature}°C', style: const TextStyle(color: Colors.white)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('Livreur : ${t.driverName}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text('Chronologie', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    ...t.events.map((e) => _TimelineTile(event: e)),
                  ],
                ),
    );
  }
}

class _TimelineTile extends StatelessWidget {
  const _TimelineTile({required this.event});

  final DeliveryEvent event;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            event.done ? Icons.check_circle : Icons.radio_button_unchecked,
            color: event.done ? const Color(0xFF059669) : Colors.grey,
            size: 22,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(event.label, style: TextStyle(fontWeight: event.done ? FontWeight.w600 : FontWeight.normal)),
                if (event.detail != null) Text(event.detail!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text(
                  '${event.time.hour.toString().padLeft(2, '0')}:${event.time.minute.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
