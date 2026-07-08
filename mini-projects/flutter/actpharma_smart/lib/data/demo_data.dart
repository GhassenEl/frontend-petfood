class PharmaMed {
  PharmaMed({
    required this.id,
    required this.name,
    required this.category,
    required this.stock,
    required this.minStock,
    required this.zone,
    required this.tempMin,
    required this.tempMax,
    required this.humidityMax,
    required this.expiry,
    required this.qrPayload,
    this.unit = 'boîtes',
  });
  final String id;
  final String name;
  final String category;
  int stock;
  final int minStock;
  final String zone;
  final double tempMin;
  final double tempMax;
  final double humidityMax;
  final String expiry;
  final String qrPayload;
  final String unit;

  bool get isLowStock => stock <= minStock;
  bool get isRupture => stock <= 0;
}

class SensorReading {
  SensorReading({
    required this.zone,
    required this.temperature,
    required this.humidity,
    required this.updatedAt,
    this.status = 'OK',
  });
  final String zone;
  double temperature;
  double humidity;
  String updatedAt;
  String status;
}

class PharmaAlert {
  PharmaAlert({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.time,
    this.read = false,
    this.resolved = false,
  });
  final String id;
  final String title;
  final String body;
  final String type;
  final String time;
  bool read;
  bool resolved;
}

const alertTypes = ['Température', 'Humidité', 'Stock', 'Péremption', 'QR', 'Système'];
const medCategories = ['Antibiotique', 'Analgésique', 'Vitamine', 'Chronique', 'Froid', 'Autre'];

final initialMeds = <PharmaMed>[
  PharmaMed(
    id: 'MED-101',
    name: 'Amoxicilline 500mg',
    category: 'Antibiotique',
    stock: 48,
    minStock: 20,
    zone: 'Zone A',
    tempMin: 15,
    tempMax: 25,
    humidityMax: 60,
    expiry: '2027-03',
    qrPayload: 'ACTPHARMA|MED-101|Amoxicilline 500mg|Zone A',
  ),
  PharmaMed(
    id: 'MED-102',
    name: 'Insuline Humalog',
    category: 'Froid',
    stock: 12,
    minStock: 15,
    zone: 'Frigo 1',
    tempMin: 2,
    tempMax: 8,
    humidityMax: 55,
    expiry: '2026-11',
    qrPayload: 'ACTPHARMA|MED-102|Insuline Humalog|Frigo 1',
  ),
  PharmaMed(
    id: 'MED-103',
    name: 'Paracétamol 1g',
    category: 'Analgésique',
    stock: 120,
    minStock: 40,
    zone: 'Zone B',
    tempMin: 15,
    tempMax: 25,
    humidityMax: 65,
    expiry: '2028-01',
    qrPayload: 'ACTPHARMA|MED-103|Paracetamol 1g|Zone B',
  ),
  PharmaMed(
    id: 'MED-104',
    name: 'Vaccin grippe',
    category: 'Froid',
    stock: 8,
    minStock: 10,
    zone: 'Frigo 2',
    tempMin: 2,
    tempMax: 8,
    humidityMax: 50,
    expiry: '2026-09',
    qrPayload: 'ACTPHARMA|MED-104|Vaccin grippe|Frigo 2',
  ),
  PharmaMed(
    id: 'MED-105',
    name: 'Vitamine D3',
    category: 'Vitamine',
    stock: 0,
    minStock: 25,
    zone: 'Zone A',
    tempMin: 15,
    tempMax: 25,
    humidityMax: 60,
    expiry: '2027-08',
    qrPayload: 'ACTPHARMA|MED-105|Vitamine D3|Zone A',
  ),
  PharmaMed(
    id: 'MED-106',
    name: 'Metformine 850mg',
    category: 'Chronique',
    stock: 65,
    minStock: 30,
    zone: 'Zone B',
    tempMin: 15,
    tempMax: 25,
    humidityMax: 60,
    expiry: '2027-12',
    qrPayload: 'ACTPHARMA|MED-106|Metformine 850mg|Zone B',
  ),
];

final initialSensors = <SensorReading>[
  SensorReading(zone: 'Zone A', temperature: 21.4, humidity: 48, updatedAt: 'Il y a 30 s', status: 'OK'),
  SensorReading(zone: 'Zone B', temperature: 23.1, humidity: 52, updatedAt: 'Il y a 45 s', status: 'OK'),
  SensorReading(zone: 'Frigo 1', temperature: 5.2, humidity: 41, updatedAt: 'Il y a 20 s', status: 'OK'),
  SensorReading(zone: 'Frigo 2', temperature: 9.8, humidity: 58, updatedAt: 'À l\'instant', status: 'Alerte'),
];

final initialAlerts = <PharmaAlert>[
  PharmaAlert(
    id: 'AL-501',
    title: 'Température Frigo 2',
    body: '9.8°C — hors plage (2–8°C). Vérifier porte / compresseur.',
    type: 'Température',
    time: 'Il y a 2 min',
  ),
  PharmaAlert(
    id: 'AL-500',
    title: 'Stock bas — Insuline',
    body: 'Insuline Humalog : 12 ≤ seuil 15.',
    type: 'Stock',
    time: 'Il y a 18 min',
  ),
  PharmaAlert(
    id: 'AL-499',
    title: 'Rupture — Vitamine D3',
    body: 'MED-105 en rupture. Relancer commande Act Pharma.',
    type: 'Stock',
    time: 'Il y a 1 h',
  ),
  PharmaAlert(
    id: 'AL-498',
    title: 'Humidité Frigo 2',
    body: 'Humidité 58% proche du max (50%).',
    type: 'Humidité',
    time: 'Il y a 1 h',
    read: true,
  ),
];
