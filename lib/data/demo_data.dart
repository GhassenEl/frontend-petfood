class TourCircuit {
  TourCircuit({
    required this.title,
    required this.region,
    required this.duration,
    required this.price,
    required this.type,
  });
  final String title;
  final String region;
  final String duration;
  final int price;
  final String type;
}

class TouristClient {
  TouristClient({required this.name, required this.phone, this.nationality = ''});
  final String name;
  final String phone;
  final String nationality;
}

class TourBooking {
  TourBooking({
    required this.id,
    required this.client,
    required this.circuit,
    required this.date,
    required this.participants,
    required this.total,
    required this.status,
  });
  final String id;
  final String client;
  final String circuit;
  final String date;
  final int participants;
  final int total;
  String status;
}

class TourGuide {
  const TourGuide({required this.name, required this.languages, required this.toursWeek});
  final String name;
  final String languages;
  final int toursWeek;
}

final initialCircuits = <TourCircuit>[
  TourCircuit(title: 'Sidi Bou Said & Carthage', region: 'Tunis', duration: '1 jour', price: 120, type: 'Culture'),
  TourCircuit(title: 'Désert & Douz', region: 'Sud', duration: '3 jours', price: 890, type: 'Aventure'),
  TourCircuit(title: 'Kairouan & El Jem', region: 'Sahel', duration: '1 jour', price: 95, type: 'Patrimoine'),
  TourCircuit(title: 'Djerba & plages', region: 'Sud-Est', duration: '2 jours', price: 450, type: 'Détente'),
  TourCircuit(title: 'Randonnée Zaghouan', region: 'Nord', duration: '1 jour', price: 75, type: 'Nature'),
];

final initialTouristClients = <TouristClient>[
  TouristClient(name: 'Amine Trabelsi', phone: '98 111 222', nationality: 'Tunisie'),
  TouristClient(name: 'Marie Dubois', phone: '+33 6 12 34 56', nationality: 'France'),
  TouristClient(name: 'Luca Rossi', phone: '+39 340 987 654', nationality: 'Italie'),
];

final initialTourBookings = <TourBooking>[
  TourBooking(id: 'TH-3042', client: 'Amine T.', circuit: 'Sidi Bou Said & Carthage', date: '10/07/2026', participants: 4, total: 480, status: 'Confirmée'),
  TourBooking(id: 'TH-3041', client: 'Marie D.', circuit: 'Désert & Douz', date: '15/07/2026', participants: 2, total: 1780, status: 'En attente'),
  TourBooking(id: 'TH-3040', client: 'Luca R.', circuit: 'Djerba & plages', date: '08/07/2026', participants: 3, total: 1350, status: 'En cours'),
];

final initialGuides = <TourGuide>[
  const TourGuide(name: 'Hedi Mansouri', languages: 'FR, EN, AR', toursWeek: 8),
  const TourGuide(name: 'Leila Gharbi', languages: 'FR, IT, AR', toursWeek: 6),
  const TourGuide(name: 'Sami Bouazizi', languages: 'FR, DE, AR', toursWeek: 10),
];

const tourStatuses = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
