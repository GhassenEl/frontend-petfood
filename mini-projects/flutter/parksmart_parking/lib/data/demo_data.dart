class ParkingSpot {
  ParkingSpot({
    required this.id,
    required this.zone,
    required this.row,
    required this.col,
    required this.status,
    this.level = 'P1',
  });
  final String id;
  final String zone;
  final int row;
  final int col;
  String status; // libre | occupe | reserve | hors-service
  final String level;

  bool get isFree => status == 'libre';
}

class ParkingBooking {
  ParkingBooking({
    required this.id,
    required this.spotId,
    required this.plate,
    required this.driver,
    required this.hours,
    required this.amount,
    required this.status,
    required this.createdAt,
    required this.qrPayload,
    this.paid = false,
    this.paymentMethod = '',
  });
  final String id;
  final String spotId;
  final String plate;
  final String driver;
  final int hours;
  final double amount;
  String status; // En attente | Confirmée | Active | Terminée | Annulée
  final String createdAt;
  final String qrPayload;
  bool paid;
  String paymentMethod;
}

const spotStatuses = ['libre', 'occupe', 'reserve', 'hors-service'];
const bookingStatuses = ['En attente', 'Confirmée', 'Active', 'Terminée', 'Annulée'];
const hourlyRate = 2.5;

List<ParkingSpot> buildInitialSpots() {
  final spots = <ParkingSpot>[];
  const zones = ['A', 'B', 'C'];
  var n = 1;
  for (final z in zones) {
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 4; c++) {
        final id = '$z${n.toString().padLeft(2, '0')}';
        String status = 'libre';
        if (n % 5 == 0) status = 'occupe';
        if (n % 7 == 0) status = 'reserve';
        if (n == 12) status = 'hors-service';
        spots.add(ParkingSpot(id: id, zone: z, row: r, col: c, status: status, level: z == 'C' ? 'P2' : 'P1'));
        n++;
      }
    }
  }
  return spots;
}

final initialBookings = <ParkingBooking>[
  ParkingBooking(
    id: 'PK-901',
    spotId: 'A07',
    plate: '123 TU 4567',
    driver: 'Amira Trabelsi',
    hours: 2,
    amount: 5,
    status: 'Active',
    createdAt: 'Aujourd\'hui 09:10',
    qrPayload: 'PARKSMART|PK-901|A07|123 TU 4567',
    paid: true,
    paymentMethod: 'Carte',
  ),
  ParkingBooking(
    id: 'PK-900',
    spotId: 'B03',
    plate: '987 TUN 1122',
    driver: 'Karim Ben Ali',
    hours: 4,
    amount: 10,
    status: 'Confirmée',
    createdAt: 'Aujourd\'hui 08:40',
    qrPayload: 'PARKSMART|PK-900|B03|987 TUN 1122',
    paid: false,
  ),
];
