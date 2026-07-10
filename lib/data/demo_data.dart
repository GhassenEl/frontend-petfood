class Car {
  Car({required this.model, required this.category, required this.pricePerDay, required this.status});
  final String model;
  final String category;
  final int pricePerDay;
  String status;
}

class RentalClient {
  RentalClient({required this.name, required this.phone, this.license = ''});
  final String name;
  final String phone;
  final String license;
}

class Rental {
  Rental({
    required this.id,
    required this.client,
    required this.car,
    required this.start,
    required this.end,
    required this.total,
    required this.status,
  });
  final String id;
  final String client;
  final String car;
  final String start;
  final String end;
  final int total;
  String status;
}

final initialCars = <Car>[
  Car(model: 'Peugeot 208', category: 'Citadine', pricePerDay: 85, status: 'Disponible'),
  Car(model: 'Renault Clio V', category: 'Citadine', pricePerDay: 80, status: 'Louée'),
  Car(model: 'Hyundai Tucson', category: 'SUV', pricePerDay: 140, status: 'Disponible'),
  Car(model: 'Mercedes Classe C', category: 'Premium', pricePerDay: 220, status: 'Maintenance'),
];

final initialClients = <RentalClient>[
  RentalClient(name: 'Amine Trabelsi', phone: '98 111 222', license: 'TN-884521'),
  RentalClient(name: 'Salma Gharbi', phone: '97 222 333', license: 'TN-772190'),
  RentalClient(name: 'Karim Bouazizi', phone: '96 333 444', license: 'TN-901234'),
];

final initialRentals = <Rental>[
  Rental(id: 'DR-1042', client: 'Amine T.', car: 'Renault Clio V', start: '05/07', end: '10/07', total: 400, status: 'En cours'),
  Rental(id: 'DR-1041', client: 'Salma G.', car: 'Hyundai Tucson', start: '08/07', end: '12/07', total: 560, status: 'Confirmée'),
  Rental(id: 'DR-1040', client: 'Karim B.', car: 'Peugeot 208', start: '28/06', end: '02/07', total: 340, status: 'Terminée'),
];

const rentalStatuses = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
