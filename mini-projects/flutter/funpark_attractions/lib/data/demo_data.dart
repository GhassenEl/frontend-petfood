class ParkAttraction {
  ParkAttraction({
    required this.name,
    required this.category,
    required this.waitMin,
    required this.status,
  });
  final String name;
  final String category;
  int waitMin;
  String status;
}

class ParkTicket {
  ParkTicket({required this.name, required this.price, required this.sold});
  final String name;
  final int price;
  int sold;
}

class ParkVisitor {
  ParkVisitor({required this.zone, required this.count, required this.capacity});
  final String zone;
  int count;
  final int capacity;
}

final initialAttractions = <ParkAttraction>[
  ParkAttraction(name: 'Montagnes russes', category: 'Sensations', waitMin: 25, status: 'Ouvert'),
  ParkAttraction(name: 'Grand roue', category: 'Famille', waitMin: 10, status: 'Ouvert'),
  ParkAttraction(name: 'Splash Zone', category: 'Aquatique', waitMin: 15, status: 'Ouvert'),
  ParkAttraction(name: 'Simulateur VR', category: 'Tech', waitMin: 5, status: 'Ouvert'),
  ParkAttraction(name: 'Carrousel', category: 'Enfants', waitMin: 0, status: 'Maintenance'),
];

final initialTickets = <ParkTicket>[
  ParkTicket(name: 'Journée adulte', price: 65, sold: 142),
  ParkTicket(name: 'Journée enfant', price: 45, sold: 89),
  ParkTicket(name: 'Pass VIP', price: 120, sold: 28),
  ParkTicket(name: 'Soirée nocturne', price: 55, sold: 64),
];

final initialZones = <ParkVisitor>[
  ParkVisitor(zone: 'Zone A — Sensations', count: 320, capacity: 500),
  ParkVisitor(zone: 'Zone B — Famille', count: 210, capacity: 400),
  ParkVisitor(zone: 'Zone C — Aquatique', count: 180, capacity: 350),
];

const attractionStatuses = ['Ouvert', 'Fermé', 'Maintenance'];
