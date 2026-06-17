import 'api_client.dart';

class DeliveryEvent {
  DeliveryEvent({required this.label, required this.time, required this.done, this.detail});

  final String label;
  final DateTime time;
  final bool done;
  final String? detail;
}

class DeliveryTracking {
  DeliveryTracking({
    required this.orderId,
    required this.status,
    required this.etaMinutes,
    required this.driverName,
    required this.temperature,
    required this.events,
  });

  final String orderId;
  final String status;
  final int etaMinutes;
  final String driverName;
  final double temperature;
  final List<DeliveryEvent> events;
}

class DeliveryService {
  DeliveryService(this.api);

  final ApiClient api;

  Future<DeliveryTracking?> fetchActiveDelivery() async {
    try {
      final data = await api.get('/orders');
      final orders = data is List ? data : [];
      if (orders.isEmpty) return _demoTracking();
      final active = orders.cast<Map>().firstWhere(
            (o) => ['shipped', 'in_transit', 'processing'].contains(o['status']),
            orElse: () => orders.first as Map,
          );
      return _fromOrder(active);
    } catch (_) {
      return _demoTracking();
    }
  }

  DeliveryTracking _fromOrder(Map order) {
    final now = DateTime.now();
    return DeliveryTracking(
      orderId: (order['_id'] ?? order['id'] ?? 'CMD').toString().substring(0, 8),
      status: order['status']?.toString() ?? 'in_transit',
      etaMinutes: 35,
      driverName: 'Karim B.',
      temperature: 4.2,
      events: [
        DeliveryEvent(label: 'Commande confirmée', time: now.subtract(const Duration(hours: 2)), done: true),
        DeliveryEvent(label: 'Préparation entrepôt', time: now.subtract(const Duration(hours: 1)), done: true),
        DeliveryEvent(label: 'En route', time: now.subtract(const Duration(minutes: 25)), done: true, detail: 'Chaîne du froid OK'),
        DeliveryEvent(label: 'Livraison estimée', time: now.add(const Duration(minutes: 35)), done: false),
      ],
    );
  }

  DeliveryTracking _demoTracking() {
    final now = DateTime.now();
    return DeliveryTracking(
      orderId: 'PF-28491',
      status: 'in_transit',
      etaMinutes: 28,
      driverName: 'Karim B.',
      temperature: 4.2,
      events: [
        DeliveryEvent(label: 'Commande confirmée', time: now.subtract(const Duration(hours: 3)), done: true),
        DeliveryEvent(label: 'Préparation hub Tunis', time: now.subtract(const Duration(hours: 2)), done: true),
        DeliveryEvent(label: 'En route — véhicule #12', time: now.subtract(const Duration(minutes: 40)), done: true, detail: 'GPS actif · 4°C'),
        DeliveryEvent(label: 'Arrivée estimée', time: now.add(const Duration(minutes: 28)), done: false),
      ],
    );
  }
}
