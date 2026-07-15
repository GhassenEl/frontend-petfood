class TravelPackage {
  TravelPackage({
    required this.destination,
    required this.duration,
    required this.price,
    required this.type,
  });
  final String destination;
  final String duration;
  final int price;
  final String type;
}

class TravelClient {
  TravelClient({required this.name, required this.phone, this.passport = ''});
  final String name;
  final String phone;
  final String passport;
}

class TravelBooking {
  TravelBooking({
    required this.id,
    required this.client,
    required this.destination,
    required this.departure,
    required this.total,
    required this.status,
  });
  final String id;
  final String client;
  final String destination;
  final String departure;
  final int total;
  String status;
}

final initialPackages = <TravelPackage>[
  TravelPackage(destination: 'Paris', duration: '5 jours', price: 2890, type: 'City break'),
  TravelPackage(destination: 'Istanbul', duration: '4 jours', price: 1950, type: 'Culture'),
  TravelPackage(destination: 'Dubai', duration: '6 jours', price: 4200, type: 'Luxe'),
  TravelPackage(destination: 'Barcelone', duration: '5 jours', price: 2400, type: 'Plage'),
  TravelPackage(destination: 'Marrakech', duration: '3 jours', price: 980, type: 'Week-end'),
];

final initialTravelClients = <TravelClient>[
  TravelClient(name: 'Amine Trabelsi', phone: '98 111 222', passport: 'TN884521'),
  TravelClient(name: 'Salma Gharbi', phone: '97 222 333', passport: 'TN772190'),
  TravelClient(name: 'Karim Bouazizi', phone: '96 333 444', passport: 'TN901234'),
];

final initialBookings = <TravelBooking>[
  TravelBooking(id: 'TH-2042', client: 'Amine T.', destination: 'Paris', departure: '15/07/2026', total: 2890, status: 'Confirmée'),
  TravelBooking(id: 'TH-2041', client: 'Salma G.', destination: 'Istanbul', departure: '22/07/2026', total: 1950, status: 'En attente'),
  TravelBooking(id: 'TH-2040', client: 'Karim B.', destination: 'Marrakech', departure: '10/07/2026', total: 980, status: 'En cours'),
];

const bookingStatuses = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
