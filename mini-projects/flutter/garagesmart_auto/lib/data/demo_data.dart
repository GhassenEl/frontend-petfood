class GarageVehicle {
  GarageVehicle({
    required this.id,
    required this.plate,
    required this.brand,
    required this.model,
    required this.owner,
    required this.bay,
    required this.status,
    this.mileage = 0,
  });
  final String id;
  final String plate;
  final String brand;
  final String model;
  final String owner;
  String bay;
  String status; // En attente | En atelier | Prêt | Livré
  final int mileage;
}

class GarageJob {
  GarageJob({
    required this.id,
    required this.vehicleId,
    required this.plate,
    required this.service,
    required this.technician,
    required this.cost,
    required this.status,
    required this.qrPayload,
    this.progress = 0,
  });
  final String id;
  final String vehicleId;
  final String plate;
  final String service;
  final String technician;
  final double cost;
  String status; // Ouvert | En cours | Attente pièces | Terminé | Facturé
  final String qrPayload;
  int progress;
}

class GarageBay {
  GarageBay({
    required this.id,
    required this.name,
    required this.occupied,
    this.vehiclePlate = '',
    this.doorOpen = false,
  });
  final String id;
  final String name;
  bool occupied;
  String vehiclePlate;
  bool doorOpen;
}

class GarageAlert {
  GarageAlert({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.time,
    this.read = false,
  });
  final String id;
  final String title;
  final String body;
  final String type;
  final String time;
  bool read;
}

const vehicleStatuses = ['En attente', 'En atelier', 'Prêt', 'Livré'];
const jobStatuses = ['Ouvert', 'En cours', 'Attente pièces', 'Terminé', 'Facturé'];
const serviceTypes = ['Vidange', 'Freins', 'Diagnostic', 'Climatisation', 'Pneus', 'Révision'];

final initialVehicles = <GarageVehicle>[
  GarageVehicle(id: 'VH-01', plate: '123 TU 4567', brand: 'Peugeot', model: '208', owner: 'Amira T.', bay: 'Box 1', status: 'En atelier', mileage: 64200),
  GarageVehicle(id: 'VH-02', plate: '987 TUN 1122', brand: 'Renault', model: 'Clio', owner: 'Karim B.', bay: 'Box 2', status: 'En attente', mileage: 38100),
  GarageVehicle(id: 'VH-03', plate: '555 TN 7788', brand: 'Volkswagen', model: 'Golf', owner: 'Ines M.', bay: '—', status: 'Prêt', mileage: 90500),
  GarageVehicle(id: 'VH-04', plate: '220 TU 3344', brand: 'Hyundai', model: 'i10', owner: 'Omar G.', bay: 'Box 3', status: 'En atelier', mileage: 21400),
];

final initialJobs = <GarageJob>[
  GarageJob(id: 'JB-501', vehicleId: 'VH-01', plate: '123 TU 4567', service: 'Vidange', technician: 'Sami', cost: 120, status: 'En cours', qrPayload: 'GARAGESMART|JB-501|123 TU 4567|Vidange', progress: 60),
  GarageJob(id: 'JB-500', vehicleId: 'VH-04', plate: '220 TU 3344', service: 'Freins', technician: 'Nour', cost: 280, status: 'Attente pièces', qrPayload: 'GARAGESMART|JB-500|220 TU 3344|Freins', progress: 35),
  GarageJob(id: 'JB-499', vehicleId: 'VH-03', plate: '555 TN 7788', service: 'Révision', technician: 'Sami', cost: 350, status: 'Terminé', qrPayload: 'GARAGESMART|JB-499|555 TN 7788|Revision', progress: 100),
  GarageJob(id: 'JB-498', vehicleId: 'VH-02', plate: '987 TUN 1122', service: 'Diagnostic', technician: 'Nour', cost: 80, status: 'Ouvert', qrPayload: 'GARAGESMART|JB-498|987 TUN 1122|Diagnostic', progress: 10),
];

final initialBays = <GarageBay>[
  GarageBay(id: 'B1', name: 'Box 1', occupied: true, vehiclePlate: '123 TU 4567', doorOpen: false),
  GarageBay(id: 'B2', name: 'Box 2', occupied: true, vehiclePlate: '987 TUN 1122', doorOpen: true),
  GarageBay(id: 'B3', name: 'Box 3', occupied: true, vehiclePlate: '220 TU 3344', doorOpen: false),
  GarageBay(id: 'B4', name: 'Box 4', occupied: false, doorOpen: false),
];

final initialAlerts = <GarageAlert>[
  GarageAlert(id: 'GA-01', title: 'Porte Box 2 ouverte', body: 'Capteur IoT : porte ouverte depuis > 5 min.', type: 'Porte', time: 'Il y a 3 min'),
  GarageAlert(id: 'GA-02', title: 'Pièces freins', body: 'JB-500 en attente de plaquettes.', type: 'Stock', time: 'Il y a 25 min'),
  GarageAlert(id: 'GA-03', title: 'Véhicule prêt', body: '555 TN 7788 prêt à livrer.', type: 'Livraison', time: 'Il y a 1 h', read: true),
];
