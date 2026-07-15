class TaxiDriver {
  TaxiDriver({
    required this.name,
    required this.car,
    required this.plate,
    required this.rating,
    required this.status,
    required this.rides,
  });
  final String name;
  final String car;
  final String plate;
  final double rating;
  String status;
  int rides;
}

class TaxiRide {
  TaxiRide({
    required this.id,
    required this.passenger,
    required this.pickup,
    required this.destination,
    required this.driver,
    required this.fare,
    required this.status,
  });
  final String id;
  final String passenger;
  final String pickup;
  final String destination;
  String driver;
  final int fare;
  String status;
}

class TaxiFare {
  TaxiFare({
    required this.zone,
    required this.baseFare,
    required this.perKm,
    required this.description,
  });
  final String zone;
  final int baseFare;
  final int perKm;
  final String description;
}

final initialDrivers = <TaxiDriver>[
  TaxiDriver(name: 'Mohamed S.', car: 'Peugeot 301', plate: '123 TU 4567', rating: 4.9, status: 'Disponible', rides: 1240),
  TaxiDriver(name: 'Fatma K.', car: 'Hyundai i10', plate: '98 TU 2210', rating: 4.8, status: 'En course', rides: 890),
  TaxiDriver(name: 'Youssef B.', car: 'Dacia Logan', plate: '77 TU 8891', rating: 4.7, status: 'Disponible', rides: 2105),
  TaxiDriver(name: 'Sonia M.', car: 'Kia Picanto', plate: '45 TU 3344', rating: 4.6, status: 'Hors ligne', rides: 560),
  TaxiDriver(name: 'Hichem A.', car: 'Toyota Corolla', plate: '12 TU 9900', rating: 4.9, status: 'En course', rides: 1780),
];

final initialRides = <TaxiRide>[
  TaxiRide(id: 'TG-8034', passenger: 'Amine B.', pickup: 'Lac 1, Tunis', destination: 'Aéroport Tunis-Carthage', driver: 'Fatma K.', fare: 28, status: 'En cours'),
  TaxiRide(id: 'TG-8033', passenger: 'Salma R.', pickup: 'Menzah 6', destination: 'Centre Ville Tunis', driver: 'Mohamed S.', fare: 12, status: 'En route'),
  TaxiRide(id: 'TG-8032', passenger: 'Karim T.', pickup: 'Sousse Corniche', destination: 'Port El Kantaoui', driver: 'Youssef B.', fare: 18, status: 'Terminée'),
  TaxiRide(id: 'TG-8031', passenger: 'Ines M.', pickup: 'La Marsa', destination: 'Carthage', driver: '', fare: 15, status: 'En attente'),
  TaxiRide(id: 'TG-8030', passenger: 'Omar H.', pickup: 'Ariana Ville', destination: 'Tunis Belvédère', driver: 'Hichem A.', fare: 10, status: 'Chauffeur assigné'),
];

final initialFares = <TaxiFare>[
  TaxiFare(zone: 'Tunis centre', baseFare: 4, perKm: 2, description: 'Tarif jour · 06h–22h'),
  TaxiFare(zone: 'Grand Tunis', baseFare: 5, perKm: 2, description: 'Lac, Ariana, Ben Arous, La Marsa'),
  TaxiFare(zone: 'Aéroport', baseFare: 8, perKm: 3, description: 'Forfait minimum 25 DT'),
  TaxiFare(zone: 'Nuit / week-end', baseFare: 6, perKm: 3, description: '22h–06h · vendredi & samedi'),
];

const rideStatuses = ['En attente', 'Chauffeur assigné', 'En route', 'En cours', 'Terminée', 'Annulée'];
const driverStatuses = ['Disponible', 'En course', 'Hors ligne'];
