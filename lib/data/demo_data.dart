class TrailHike {
  TrailHike({
    required this.name,
    required this.region,
    required this.difficulty,
    required this.duration,
    required this.guide,
    required this.maxParticipants,
    required this.participants,
    required this.status,
  });
  final String name;
  final String region;
  final String difficulty;
  final String duration;
  final String guide;
  final int maxParticipants;
  int participants;
  String status;
}

class TrailExcursion {
  TrailExcursion({
    required this.id,
    required this.title,
    required this.destination,
    required this.date,
    required this.price,
    required this.guide,
    required this.spots,
    required this.maxSpots,
    required this.status,
  });
  final String id;
  final String title;
  final String destination;
  final String date;
  final int price;
  final String guide;
  int spots;
  final int maxSpots;
  String status;
}

final initialHikes = <TrailHike>[
  TrailHike(name: 'Djebel Zaghouan', region: 'Zaghouan', difficulty: 'Moyen', duration: '6h', guide: 'Hichem A.', maxParticipants: 15, participants: 9, status: 'Ouvert'),
  TrailHike(name: 'Cap Bon — Korbous', region: 'Nabeul', difficulty: 'Facile', duration: '4h', guide: 'Ines R.', maxParticipants: 20, participants: 14, status: 'Ouvert'),
  TrailHike(name: 'Oued El Abid', region: 'Kairouan', difficulty: 'Difficile', duration: '8h', guide: 'Omar K.', maxParticipants: 10, participants: 10, status: 'Complet'),
  TrailHike(name: 'Mont Chenoua', region: 'Tipaza', difficulty: 'Moyen', duration: '5h', guide: 'Fatma S.', maxParticipants: 12, participants: 6, status: 'Ouvert'),
];

final initialExcursions = <TrailExcursion>[
  TrailExcursion(id: 'EX-501', title: 'Sahara — Douz & dunes', destination: 'Douz', date: '28/06', price: 450, guide: 'Mehdi B.', spots: 8, maxSpots: 12, status: 'Ouvert'),
  TrailExcursion(id: 'EX-500', title: 'Carthage & Sidi Bou Saïd', destination: 'Tunis', date: '21/06', price: 120, guide: 'Salma K.', spots: 15, maxSpots: 20, status: 'Ouvert'),
  TrailExcursion(id: 'EX-499', title: 'Îles Kerkennah', destination: 'Kerkennah', date: '19/06', price: 180, guide: 'Karim T.', spots: 10, maxSpots: 10, status: 'Complet'),
  TrailExcursion(id: 'EX-498', title: 'Matmata & troglodytes', destination: 'Gabès', date: '25/06', price: 220, guide: 'Amira L.', spots: 5, maxSpots: 14, status: 'Ouvert'),
];

const hikeStatuses = ['Ouvert', 'Complet', 'En cours', 'Terminé', 'Annulé'];
const excursionStatuses = ['Ouvert', 'Complet', 'En cours', 'Terminé', 'Annulé'];
