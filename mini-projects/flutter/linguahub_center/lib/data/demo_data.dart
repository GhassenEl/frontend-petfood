class LanguageCourse {
  LanguageCourse({
    required this.language,
    required this.level,
    required this.durationWeeks,
    required this.price,
    required this.mode,
  });
  final String language;
  final String level;
  final int durationWeeks;
  final int price;
  final String mode;
}

class LanguageStudent {
  LanguageStudent({
    required this.name,
    required this.language,
    required this.level,
    required this.progress,
    required this.status,
  });
  final String name;
  final String language;
  final String level;
  int progress;
  String status;
}

class ClassSession {
  ClassSession({
    required this.time,
    required this.language,
    required this.level,
    required this.teacher,
    required this.room,
  });
  final String time;
  final String language;
  final String level;
  final String teacher;
  final String room;
}

class LanguageTeacher {
  const LanguageTeacher({required this.name, required this.languages, required this.sessionsWeek});
  final String name;
  final String languages;
  final int sessionsWeek;
}

final initialCourses = <LanguageCourse>[
  LanguageCourse(language: 'Anglais', level: 'B1', durationWeeks: 8, price: 890, mode: 'Présentiel'),
  LanguageCourse(language: 'Français', level: 'A2', durationWeeks: 6, price: 650, mode: 'Hybride'),
  LanguageCourse(language: 'Espagnol', level: 'A1', durationWeeks: 10, price: 720, mode: 'Présentiel'),
  LanguageCourse(language: 'Allemand', level: 'B2', durationWeeks: 12, price: 1100, mode: 'En ligne'),
  LanguageCourse(language: 'Italien', level: 'A1', durationWeeks: 8, price: 680, mode: 'Présentiel'),
];

final initialStudents = <LanguageStudent>[
  LanguageStudent(name: 'Amine Trabelsi', language: 'Anglais', level: 'B1', progress: 65, status: 'En cours'),
  LanguageStudent(name: 'Salma Gharbi', language: 'Espagnol', level: 'A1', progress: 30, status: 'En cours'),
  LanguageStudent(name: 'Karim Bouazizi', language: 'Allemand', level: 'B2', progress: 80, status: 'En cours'),
  LanguageStudent(name: 'Ines Mejri', language: 'Français', level: 'A2', progress: 100, status: 'Certifié'),
  LanguageStudent(name: 'Youssef Sassi', language: 'Italien', level: 'A1', progress: 15, status: 'Débutant'),
];

final initialSessions = <ClassSession>[
  ClassSession(time: '09:00', language: 'Anglais', level: 'B1', teacher: 'Ms. Johnson', room: 'Salle A'),
  ClassSession(time: '11:00', language: 'Espagnol', level: 'A1', teacher: 'Carlos M.', room: 'Salle B'),
  ClassSession(time: '14:30', language: 'Allemand', level: 'B2', teacher: 'Hans K.', room: 'Salle C'),
  ClassSession(time: '17:00', language: 'Français', level: 'A2', teacher: 'Leila B.', room: 'Salle A'),
];

final initialTeachers = <LanguageTeacher>[
  const LanguageTeacher(name: 'Ms. Johnson', languages: 'Anglais', sessionsWeek: 12),
  const LanguageTeacher(name: 'Carlos M.', languages: 'Espagnol', sessionsWeek: 8),
  const LanguageTeacher(name: 'Hans K.', languages: 'Allemand', sessionsWeek: 10),
  const LanguageTeacher(name: 'Leila B.', languages: 'Français', sessionsWeek: 14),
];

const studentStatuses = ['Débutant', 'En cours', 'Certifié', 'Suspendu'];
