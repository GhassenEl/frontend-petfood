class Doctor {
  const Doctor({required this.name, required this.specialty, this.phone = ''});
  final String name;
  final String specialty;
  final String phone;
}

class Patient {
  Patient({required this.name, required this.age, this.phone = '', this.condition = ''});
  final String name;
  final int age;
  final String phone;
  final String condition;
}

class Appointment {
  Appointment({
    required this.date,
    required this.time,
    required this.patient,
    required this.doctor,
    required this.status,
  });
  final String date;
  final String time;
  final String patient;
  final String doctor;
  String status;
}

class Prescription {
  const Prescription({
    required this.patient,
    required this.doctor,
    required this.drug,
    required this.dosage,
    required this.durationDays,
  });
  final String patient;
  final String doctor;
  final String drug;
  final String dosage;
  final int durationDays;
}

final initialDoctors = <Doctor>[
  const Doctor(name: 'Dr. Leila Mansouri', specialty: 'Médecine générale', phone: '22 123 456'),
  const Doctor(name: 'Dr. Hedi Riahi', specialty: 'Cardiologie', phone: '22 234 567'),
  const Doctor(name: 'Dr. Maya Ben Salah', specialty: 'Pédiatrie', phone: '22 345 678'),
];

final initialPatients = <Patient>[
  Patient(name: 'Amine Trabelsi', age: 34, phone: '98 111 222', condition: 'Suivi tension'),
  Patient(name: 'Salma Gharbi', age: 28, phone: '97 222 333', condition: 'Allergie saisonnière'),
  Patient(name: 'Karim Bouazizi', age: 45, phone: '96 333 444', condition: 'Diabète type 2'),
];

final initialAppointments = <Appointment>[
  Appointment(date: '2026-07-07', time: '09:00', patient: 'Amine T.', doctor: 'Dr. Mansouri', status: 'Planifié'),
  Appointment(date: '2026-07-07', time: '10:30', patient: 'Salma G.', doctor: 'Dr. Riahi', status: 'En salle'),
  Appointment(date: '2026-07-07', time: '14:00', patient: 'Karim B.', doctor: 'Dr. Mansouri', status: 'Planifié'),
];

final initialPrescriptions = <Prescription>[
  const Prescription(patient: 'Amine T.', doctor: 'Dr. Mansouri', drug: 'Amlodipine 5mg', dosage: '1 cp/j', durationDays: 30),
  const Prescription(patient: 'Salma G.', doctor: 'Dr. Riahi', drug: 'Cetirizine 10mg', dosage: '1 cp/soir', durationDays: 14),
];

const rdvStatuses = ['Planifié', 'En salle', 'Terminé', 'Annulé'];
