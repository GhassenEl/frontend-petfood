class DrivingStudent {
  const DrivingStudent({
    required this.name,
    required this.packageName,
    required this.hours,
    required this.status,
  });
  final String name;
  final String packageName;
  final String hours;
  final String status;
}

class DrivingLesson {
  const DrivingLesson({
    required this.time,
    required this.student,
    required this.type,
    required this.instructor,
  });
  final String time;
  final String student;
  final String type;
  final String instructor;
}

class DrivingPackage {
  const DrivingPackage({
    required this.name,
    required this.price,
    required this.features,
    this.featured = false,
  });
  final String name;
  final String price;
  final List<String> features;
  final bool featured;
}

const students = <DrivingStudent>[
  DrivingStudent(name: 'Amine Trabelsi', packageName: 'Permis B — 30h', hours: '18/30', status: 'En cours'),
  DrivingStudent(name: 'Salma Gharbi', packageName: 'Permis B — 20h', hours: '20/20', status: 'Exam. code'),
  DrivingStudent(name: 'Karim Bouazizi', packageName: 'Conduite accompagnée', hours: '12/20', status: 'En cours'),
  DrivingStudent(name: 'Ines Mejri', packageName: 'Permis B — 30h', hours: '8/30', status: 'Débutant'),
  DrivingStudent(name: 'Youssef Sassi', packageName: 'Permis B — 20h', hours: '20/20', status: 'Exam. conduite'),
];

const lessonsToday = <DrivingLesson>[
  DrivingLesson(time: '08:30', student: 'Amine T.', type: 'Circulation', instructor: 'Hedi'),
  DrivingLesson(time: '10:00', student: 'Ines M.', type: 'Créneau', instructor: 'Leila'),
  DrivingLesson(time: '14:30', student: 'Karim B.', type: 'Manœuvres', instructor: 'Hedi'),
  DrivingLesson(time: '16:00', student: 'Nadia F.', type: 'Autoroute', instructor: 'Sami'),
];

const weekLessons = <String, List<String>>{
  'Lun': ['08h Amine', '14h Karim', '17h Nadia'],
  'Mar': ['09h Ines', '15h Salma'],
  'Mer': ['08h Youssef', '11h Amine', '16h Karim'],
  'Jeu': ['10h Nadia', '14h Ines'],
  'Ven': ['08h Salma', '13h Amine', '17h Youssef'],
  'Sam': ['09h Examens blancs'],
};

const packages = <DrivingPackage>[
  DrivingPackage(name: 'Permis B — 20h', price: '1 290 DT', features: ['20h conduite', 'Code en ligne', 'Accompagnement examen']),
  DrivingPackage(name: 'Permis B — 30h', price: '1 690 DT', features: ['30h conduite', 'Code + 2 examens blancs', 'Suivi personnalisé'], featured: true),
  DrivingPackage(name: 'Conduite accompagnée', price: '1 450 DT', features: ['20h minimum', 'AAC 1 an', 'Briefing parents']),
  DrivingPackage(name: 'Stage intensif', price: '890 DT', features: ['2 semaines', '10h / semaine', 'Groupe réduit']),
];
