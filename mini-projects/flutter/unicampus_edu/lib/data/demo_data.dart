class UniProfessor {
  UniProfessor({
    required this.name,
    required this.department,
    required this.subject,
    required this.email,
    required this.courses,
    required this.status,
  });
  final String name;
  final String department;
  final String subject;
  final String email;
  int courses;
  String status;
}

class UniStudent {
  UniStudent({
    required this.name,
    required this.filiere,
    required this.level,
    required this.email,
    required this.gpa,
    required this.status,
  });
  final String name;
  final String filiere;
  final String level;
  final String email;
  final double gpa;
  String status;
}

class UniSession {
  UniSession({
    required this.id,
    required this.title,
    required this.professor,
    required this.date,
    required this.mode,
    required this.enrolled,
    required this.status,
  });
  final String id;
  final String title;
  final String professor;
  final String date;
  final String mode;
  int enrolled;
  String status;
}

final initialProfessors = <UniProfessor>[
  UniProfessor(name: 'Dr. Amira B.', department: 'Informatique', subject: 'Flutter & Mobile', email: 'amira@univ.tn', courses: 3, status: 'En ligne'),
  UniProfessor(name: 'Pr. Karim S.', department: 'Mathématiques', subject: 'Analyse III', email: 'karim@univ.tn', courses: 2, status: 'En ligne'),
  UniProfessor(name: 'Dr. Salma M.', department: 'Économie', subject: 'Macroéconomie', email: 'salma@univ.tn', courses: 2, status: 'Hors ligne'),
  UniProfessor(name: 'Dr. Youssef H.', department: 'Droit', subject: 'Droit des affaires', email: 'youssef@univ.tn', courses: 1, status: 'En ligne'),
];

final initialStudents = <UniStudent>[
  UniStudent(name: 'Ines T.', filiere: 'Génie Info', level: 'L3', email: 'ines@etud.univ.tn', gpa: 14.5, status: 'Actif'),
  UniStudent(name: 'Omar K.', filiere: 'Génie Info', level: 'M1', email: 'omar@etud.univ.tn', gpa: 13.2, status: 'Actif'),
  UniStudent(name: 'Fatma R.', filiere: 'Économie', level: 'L2', email: 'fatma@etud.univ.tn', gpa: 12.8, status: 'Actif'),
  UniStudent(name: 'Hichem A.', filiere: 'Droit', level: 'L3', email: 'hichem@etud.univ.tn', gpa: 11.9, status: 'Suspendu'),
  UniStudent(name: 'Mariem L.', filiere: 'Maths', level: 'M2', email: 'mariem@etud.univ.tn', gpa: 15.1, status: 'Actif'),
];

final initialSessions = <UniSession>[
  UniSession(id: 'SES-701', title: 'Flutter avancé — TP live', professor: 'Dr. Amira B.', date: '18/06 14h', mode: 'Visio', enrolled: 42, status: 'En cours'),
  UniSession(id: 'SES-700', title: 'Analyse III — QCM', professor: 'Pr. Karim S.', date: '17/06 10h', mode: 'En ligne', enrolled: 68, status: 'Terminée'),
  UniSession(id: 'SES-699', title: 'Macroéconomie — TD', professor: 'Dr. Salma M.', date: '19/06 09h', mode: 'Hybride', enrolled: 35, status: 'Planifiée'),
  UniSession(id: 'SES-698', title: 'Droit des affaires — Forum', professor: 'Dr. Youssef H.', date: '20/06 16h', mode: 'Visio', enrolled: 28, status: 'Planifiée'),
];

const profStatuses = ['En ligne', 'Hors ligne', 'En cours de cours'];
const studentStatuses = ['Actif', 'Suspendu', 'Diplômé', 'En pause'];
const sessionStatuses = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
