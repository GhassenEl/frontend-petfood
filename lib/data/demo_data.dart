class ProductionLine {
  ProductionLine({
    required this.id,
    required this.name,
    required this.product,
    required this.targetPerHour,
    required this.actualPerHour,
    required this.status,
    required this.oee,
    required this.shift,
    this.defectRate = 0,
  });

  final String id;
  final String name;
  final String product;
  int targetPerHour;
  int actualPerHour;
  String status;
  double oee;
  final String shift;
  double defectRate;
}

class FactoryMachine {
  FactoryMachine({
    required this.id,
    required this.name,
    required this.line,
    required this.type,
    required this.temperature,
    required this.vibration,
    required this.powerKw,
    required this.uptimePct,
    required this.qrPayload,
    this.status = 'En marche',
    this.lastMaintenance = '2026-06-01',
  });

  final String id;
  final String name;
  final String line;
  final String type;
  double temperature;
  double vibration;
  double powerKw;
  double uptimePct;
  final String qrPayload;
  String status;
  String lastMaintenance;
}

class FactoryAlert {
  FactoryAlert({
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

class MaintenanceOrder {
  MaintenanceOrder({
    required this.id,
    required this.machineId,
    required this.machineName,
    required this.task,
    required this.priority,
    required this.dueDate,
    this.status = 'Planifié',
  });

  final String id;
  final String machineId;
  final String machineName;
  final String task;
  final String priority;
  final String dueDate;
  String status;
}

const alertTypes = ['Vibration', 'Température', 'Arrêt', 'Qualité', 'Énergie', 'Maintenance', 'Système'];

final initialLines = <ProductionLine>[
  ProductionLine(id: 'L-01', name: 'Ligne assemblage A', product: 'Boîtier moteur X200', targetPerHour: 120, actualPerHour: 108, status: 'En marche', oee: 87.5, shift: 'Matin', defectRate: 1.2),
  ProductionLine(id: 'L-02', name: 'Ligne injection B', product: 'Carter plastique P45', targetPerHour: 200, actualPerHour: 195, status: 'En marche', oee: 92.1, shift: 'Matin', defectRate: 0.8),
  ProductionLine(id: 'L-03', name: 'Ligne soudure C', product: 'Châssis acier S12', targetPerHour: 80, actualPerHour: 0, status: 'Arrêt', oee: 0, shift: 'Matin', defectRate: 0),
  ProductionLine(id: 'L-04', name: 'Ligne conditionnement', product: 'Pack fini multi-SKU', targetPerHour: 300, actualPerHour: 278, status: 'En marche', oee: 89.3, shift: 'Matin', defectRate: 0.5),
];

final initialMachines = <FactoryMachine>[
  FactoryMachine(id: 'M-101', name: 'Presse hydraulique PH-1', line: 'Ligne assemblage A', type: 'Presse', temperature: 42.3, vibration: 2.1, powerKw: 18.5, uptimePct: 96.2, qrPayload: 'FACTORYLINK|M-101|Presse PH-1|Ligne A', status: 'En marche'),
  FactoryMachine(id: 'M-102', name: 'Robot pick & place R-2', line: 'Ligne assemblage A', type: 'Robot', temperature: 38.7, vibration: 1.4, powerKw: 4.2, uptimePct: 98.1, qrPayload: 'FACTORYLINK|M-102|Robot R-2|Ligne A', status: 'En marche'),
  FactoryMachine(id: 'M-201', name: 'Injecteur INJ-3', line: 'Ligne injection B', type: 'Injection', temperature: 185.0, vibration: 3.8, powerKw: 32.0, uptimePct: 94.5, qrPayload: 'FACTORYLINK|M-201|Injecteur INJ-3|Ligne B', status: 'En marche'),
  FactoryMachine(id: 'M-202', name: 'Refroidisseur RF-1', line: 'Ligne injection B', type: 'Refroidissement', temperature: 12.5, vibration: 0.6, powerKw: 8.1, uptimePct: 99.0, qrPayload: 'FACTORYLINK|M-202|Refroidisseur RF-1|Ligne B', status: 'En marche'),
  FactoryMachine(id: 'M-301', name: 'Poste soudure SW-1', line: 'Ligne soudure C', type: 'Soudure', temperature: 55.0, vibration: 8.5, powerKw: 22.0, uptimePct: 12.0, qrPayload: 'FACTORYLINK|M-301|Poste SW-1|Ligne C', status: 'Arrêt', lastMaintenance: '2026-05-15'),
  FactoryMachine(id: 'M-401', name: 'Convoyeur CV-7', line: 'Ligne conditionnement', type: 'Convoyeur', temperature: 29.1, vibration: 1.9, powerKw: 2.5, uptimePct: 97.8, qrPayload: 'FACTORYLINK|M-401|Convoyeur CV-7|Ligne D', status: 'En marche'),
];

final initialAlerts = <FactoryAlert>[
  FactoryAlert(id: 'AL-01', title: 'Vibration élevée SW-1', body: 'Poste soudure : 8.5 mm/s > seuil 6.0 — arrêt automatique.', type: 'Vibration', time: 'Il y a 12 min'),
  FactoryAlert(id: 'AL-02', title: 'Ligne C à l\'arrêt', body: 'Ligne soudure C : 0 pièce/h depuis 45 min. Cause : maintenance corrective.', type: 'Arrêt', time: 'Il y a 45 min'),
  FactoryAlert(id: 'AL-03', title: 'Température injecteur', body: 'INJ-3 : 185°C — proche limite haute (190°C).', type: 'Température', time: 'Il y a 1 h', read: true),
];

final initialMaintenance = <MaintenanceOrder>[
  MaintenanceOrder(id: 'MT-01', machineId: 'M-301', machineName: 'Poste soudure SW-1', task: 'Remplacement buse + calibration', priority: 'Urgent', dueDate: '2026-07-08', status: 'En cours'),
  MaintenanceOrder(id: 'MT-02', machineId: 'M-201', machineName: 'Injecteur INJ-3', task: 'Graissage vis + contrôle température', priority: 'Normal', dueDate: '2026-07-12', status: 'Planifié'),
  MaintenanceOrder(id: 'MT-03', machineId: 'M-101', machineName: 'Presse PH-1', task: 'Inspection hydraulique trimestrielle', priority: 'Normal', dueDate: '2026-07-20', status: 'Planifié'),
  MaintenanceOrder(id: 'MT-04', machineId: 'M-102', machineName: 'Robot R-2', task: 'Mise à jour firmware axe 4', priority: 'Bas', dueDate: '2026-07-25', status: 'Planifié'),
];
