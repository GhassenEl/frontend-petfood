class HotelProperty {
  HotelProperty({
    required this.name,
    required this.city,
    required this.stars,
    required this.pricePerNight,
    required this.rooms,
    required this.emoji,
  });
  final String name;
  final String city;
  final int stars;
  final int pricePerNight;
  int rooms;
  final String emoji;
}

class HotelBooking {
  HotelBooking({
    required this.id,
    required this.guest,
    required this.hotel,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.total,
    required this.status,
  });
  final String id;
  final String guest;
  final String hotel;
  final String checkIn;
  final String checkOut;
  final int nights;
  final int total;
  String status;
}

final initialHotels = <HotelProperty>[
  HotelProperty(name: 'Mövenpick Resort', city: 'Sousse', stars: 5, pricePerNight: 320, rooms: 8, emoji: '🏖️'),
  HotelProperty(name: 'Dar El Medina', city: 'Tunis', stars: 4, pricePerNight: 180, rooms: 5, emoji: '🏛️'),
  HotelProperty(name: 'Sahara Palace', city: 'Tozeur', stars: 4, pricePerNight: 210, rooms: 12, emoji: '🏜️'),
  HotelProperty(name: 'Hotel Africa', city: 'Tunis', stars: 3, pricePerNight: 95, rooms: 15, emoji: '🏨'),
  HotelProperty(name: 'Iberostar Averroes', city: 'Hammamet', stars: 5, pricePerNight: 280, rooms: 6, emoji: '🌊'),
];

final initialBookings = <HotelBooking>[
  HotelBooking(id: 'BK-701', guest: 'Amira B.', hotel: 'Mövenpick Resort', checkIn: '20/06', checkOut: '25/06', nights: 5, total: 1600, status: 'Confirmée'),
  HotelBooking(id: 'BK-700', guest: 'Karim M.', hotel: 'Dar El Medina', checkIn: '18/06', checkOut: '20/06', nights: 2, total: 360, status: 'En attente'),
  HotelBooking(id: 'BK-699', guest: 'Salma K.', hotel: 'Sahara Palace', checkIn: '22/06', checkOut: '24/06', nights: 2, total: 420, status: 'Confirmée'),
  HotelBooking(id: 'BK-698', guest: 'Youssef T.', hotel: 'Iberostar Averroes', checkIn: '15/06', checkOut: '18/06', nights: 3, total: 840, status: 'Annulée'),
];

const bookingStatuses = ['En attente', 'Confirmée', 'Check-in', 'Terminée', 'Annulée'];
