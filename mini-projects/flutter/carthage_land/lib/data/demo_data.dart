class ParkAttraction {
  ParkAttraction({
    required this.name,
    required this.zone,
    required this.duration,
    required this.minAge,
    required this.waitMin,
    required this.status,
    required this.emoji,
  });
  final String name;
  final String zone;
  final String duration;
  final int minAge;
  int waitMin;
  String status;
  final String emoji;
}

class ParkTicket {
  ParkTicket({
    required this.id,
    required this.visitor,
    required this.type,
    required this.date,
    required this.price,
    required this.status,
  });
  final String id;
  final String visitor;
  final String type;
  final String date;
  final int price;
  String status;
}

class ParkShow {
  ParkShow({
    required this.title,
    required this.stage,
    required this.time,
    required this.capacity,
    required this.booked,
    required this.status,
  });
  final String title;
  final String stage;
  final String time;
  final int capacity;
  int booked;
  String status;
}

final initialAttractions = <ParkAttraction>[
  ParkAttraction(name: 'Colosseum Coaster', zone: 'Rome Antique', duration: '3 min', minAge: 12, waitMin: 25, status: 'Ouverte', emoji: '🎢'),
  ParkAttraction(name: 'Bain de Carthage', zone: 'Baies', duration: '8 min', minAge: 3, waitMin: 10, status: 'Ouverte', emoji: '💦'),
  ParkAttraction(name: 'Tour des Eléphants', zone: 'Famille', duration: '5 min', minAge: 0, waitMin: 5, status: 'Ouverte', emoji: '🐘'),
  ParkAttraction(name: 'Temple de Baal', zone: 'Aventure', duration: '12 min', minAge: 8, waitMin: 40, status: 'Maintenance', emoji: '🏛️'),
  ParkAttraction(name: 'Grand Carrousel Punique', zone: 'Famille', duration: '4 min', minAge: 0, waitMin: 8, status: 'Ouverte', emoji: '🎠'),
];

final initialTickets = <ParkTicket>[
  ParkTicket(id: 'TK-8801', visitor: 'Famille Amira', type: 'Journée Famille', date: 'Aujourd\'hui', price: 180, status: 'Validé'),
  ParkTicket(id: 'TK-8800', visitor: 'Karim M.', type: 'Adulte', date: 'Aujourd\'hui', price: 45, status: 'En attente'),
  ParkTicket(id: 'TK-8799', visitor: 'Groupe scolaire', type: 'Scolaire x24', date: 'Demain', price: 480, status: 'Confirmé'),
  ParkTicket(id: 'TK-8798', visitor: 'Salma K.', type: 'Pass Premium', date: 'Week-end', price: 95, status: 'Confirmé'),
];

final initialShows = <ParkShow>[
  ParkShow(title: 'Parade des Eléphants', stage: 'Avenue Principale', time: '11h30', capacity: 200, booked: 145, status: 'À venir'),
  ParkShow(title: 'Spectacle pirate', stage: 'Lagune', time: '15h00', capacity: 150, booked: 150, status: 'Complet'),
  ParkShow(title: 'Feu d\'artifice Carthage', stage: 'Esplanade', time: '21h00', capacity: 500, booked: 220, status: 'À venir'),
];

const attractionStatuses = ['Ouverte', 'Fermée', 'Maintenance', 'File d\'attente'];
const ticketStatuses = ['En attente', 'Confirmé', 'Validé', 'Annulé'];
const showStatuses = ['À venir', 'En cours', 'Complet', 'Terminé'];
