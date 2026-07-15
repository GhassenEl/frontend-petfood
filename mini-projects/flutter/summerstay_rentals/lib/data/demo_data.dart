class SummerProperty {
  SummerProperty({
    required this.name,
    required this.type,
    required this.city,
    required this.region,
    required this.pricePerNight,
    required this.guests,
    required this.bedrooms,
    required this.emoji,
    required this.amenities,
    this.status = 'Disponible',
    this.pool = false,
    this.seaView = false,
  });
  final String name;
  final String type;
  final String city;
  final String region;
  final int pricePerNight;
  final int guests;
  final int bedrooms;
  final String emoji;
  final List<String> amenities;
  String status;
  final bool pool;
  final bool seaView;
}

class SummerBooking {
  SummerBooking({
    required this.id,
    required this.guest,
    required this.property,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.total,
    required this.status,
  });
  final String id;
  final String guest;
  final String property;
  final String checkIn;
  final String checkOut;
  final int nights;
  final int total;
  String status;
}

class SummerAiMessage {
  SummerAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

const propertyTypes = ['Maison d\'été', 'Bungalow', 'Villa'];
const bookingStatuses = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
const propertyStatuses = ['Disponible', 'Réservé', 'Maintenance'];

final initialProperties = <SummerProperty>[
  SummerProperty(
    name: 'Villa Azur Hammamet',
    type: 'Villa',
    city: 'Hammamet',
    region: 'Nabeul',
    pricePerNight: 450,
    guests: 8,
    bedrooms: 4,
    emoji: '🏡',
    amenities: ['Piscine', 'Vue mer', 'Wi-Fi', 'Clim', 'BBQ'],
    pool: true,
    seaView: true,
  ),
  SummerProperty(
    name: 'Bungalow Palmier Djerba',
    type: 'Bungalow',
    city: 'Djerba',
    region: 'Médenine',
    pricePerNight: 220,
    guests: 4,
    bedrooms: 2,
    emoji: '🏝️',
    amenities: ['Jardin', 'Wi-Fi', 'Clim', 'Parking'],
    pool: false,
    seaView: true,
  ),
  SummerProperty(
    name: 'Maison Bleue Sidi Bou',
    type: 'Maison d\'été',
    city: 'Sidi Bou Said',
    region: 'Tunis',
    pricePerNight: 280,
    guests: 5,
    bedrooms: 3,
    emoji: '🏠',
    amenities: ['Terrasse', 'Vue mer', 'Wi-Fi', 'Cuisine'],
    seaView: true,
  ),
  SummerProperty(
    name: 'Villa Atlas Tabarka',
    type: 'Villa',
    city: 'Tabarka',
    region: 'Jendouba',
    pricePerNight: 380,
    guests: 6,
    bedrooms: 3,
    emoji: '🌲',
    amenities: ['Piscine', 'BBQ', 'Wi-Fi', 'Parking'],
    pool: true,
  ),
  SummerProperty(
    name: 'Bungalow Soleil Monastir',
    type: 'Bungalow',
    city: 'Monastir',
    region: 'Monastir',
    pricePerNight: 190,
    guests: 3,
    bedrooms: 1,
    emoji: '☀️',
    amenities: ['Plage', 'Wi-Fi', 'Clim'],
    seaView: true,
  ),
  SummerProperty(
    name: 'Villa Oasis Tozeur',
    type: 'Villa',
    city: 'Tozeur',
    region: 'Tozeur',
    pricePerNight: 320,
    guests: 7,
    bedrooms: 4,
    emoji: '🏜️',
    amenities: ['Piscine', 'Jardin', 'Wi-Fi', 'Clim'],
    pool: true,
    status: 'Réservé',
  ),
];

final initialBookings = <SummerBooking>[
  SummerBooking(id: 'SS-801', guest: 'Amira Trabelsi', property: 'Villa Azur Hammamet', checkIn: '12 Jul', checkOut: '19 Jul', nights: 7, total: 3150, status: 'Confirmée'),
  SummerBooking(id: 'SS-800', guest: 'Karim Ben Ali', property: 'Bungalow Palmier Djerba', checkIn: '15 Jul', checkOut: '18 Jul', nights: 3, total: 660, status: 'En attente'),
  SummerBooking(id: 'SS-799', guest: 'Ines Mejri', property: 'Villa Oasis Tozeur', checkIn: '08 Jul', checkOut: '14 Jul', nights: 6, total: 1920, status: 'En cours'),
  SummerBooking(id: 'SS-798', guest: 'Omar Gharbi', property: 'Maison Bleue Sidi Bou', checkIn: '01 Jul', checkOut: '05 Jul', nights: 4, total: 1120, status: 'Terminée'),
];
