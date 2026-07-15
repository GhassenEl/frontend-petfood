class HrEmployee {
  HrEmployee({
    required this.name,
    required this.role,
    required this.department,
    required this.email,
    required this.status,
    required this.salary,
  });
  final String name;
  final String role;
  final String department;
  final String email;
  String status;
  final int salary;
}

class HrLeave {
  HrLeave({
    required this.id,
    required this.employee,
    required this.type,
    required this.from,
    required this.to,
    required this.status,
  });
  final String id;
  final String employee;
  final String type;
  final String from;
  final String to;
  String status;
}

class HrJob {
  HrJob({
    required this.title,
    required this.department,
    required this.candidates,
    required this.status,
    required this.salary,
  });
  final String title;
  final String department;
  int candidates;
  String status;
  final int salary;
}

final initialEmployees = <HrEmployee>[
  HrEmployee(name: 'Amira B.', role: 'DRH', department: 'RH', email: 'amira@hrhub.tn', status: 'Actif', salary: 4200),
  HrEmployee(name: 'Karim M.', role: 'Développeur', department: 'IT', email: 'karim@hrhub.tn', status: 'Actif', salary: 3800),
  HrEmployee(name: 'Salma K.', role: 'Comptable', department: 'Finance', email: 'salma@hrhub.tn', status: 'Actif', salary: 3200),
  HrEmployee(name: 'Youssef T.', role: 'Commercial', department: 'Ventes', email: 'youssef@hrhub.tn', status: 'En congé', salary: 2900),
  HrEmployee(name: 'Ines R.', role: 'Designer', department: 'Marketing', email: 'ines@hrhub.tn', status: 'Actif', salary: 3100),
];

final initialLeaves = <HrLeave>[
  HrLeave(id: 'LV-301', employee: 'Youssef T.', type: 'Annuel', from: '10/06', to: '20/06', status: 'Approuvé'),
  HrLeave(id: 'LV-302', employee: 'Karim M.', type: 'Maladie', from: '15/06', to: '17/06', status: 'En attente'),
  HrLeave(id: 'LV-303', employee: 'Salma K.', type: 'Personnel', from: '22/06', to: '23/06', status: 'En attente'),
  HrLeave(id: 'LV-304', employee: 'Ines R.', type: 'Annuel', from: '01/07', to: '10/07', status: 'Approuvé'),
];

final initialJobs = <HrJob>[
  HrJob(title: 'Ingénieur Flutter', department: 'IT', candidates: 12, status: 'Ouvert', salary: 3500),
  HrJob(title: 'Responsable RH', department: 'RH', candidates: 5, status: 'Entretiens', salary: 4000),
  HrJob(title: 'Stagiaire Marketing', department: 'Marketing', candidates: 18, status: 'Ouvert', salary: 800),
  HrJob(title: 'Chef de projet', department: 'IT', candidates: 7, status: 'Clôturé', salary: 4500),
];

const employeeStatuses = ['Actif', 'En congé', 'Suspendu', 'Départ'];
const leaveStatuses = ['En attente', 'Approuvé', 'Refusé', 'Annulé'];
const jobStatuses = ['Ouvert', 'Entretiens', 'Offre envoyée', 'Clôturé'];
