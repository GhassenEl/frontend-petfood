class DentalPatient {
  DentalPatient({
    this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.birthYear,
    required this.notes,
    required this.lastVisit,
    this.allergies = '',
  });

  final int? id;
  final String name;
  final String phone;
  final String email;
  final int birthYear;
  final String notes;
  final String lastVisit;
  final String allergies;

  int get age => DateTime.now().year - birthYear;

  DentalPatient copyWith({
    int? id,
    String? name,
    String? phone,
    String? email,
    int? birthYear,
    String? notes,
    String? lastVisit,
    String? allergies,
  }) {
    return DentalPatient(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      birthYear: birthYear ?? this.birthYear,
      notes: notes ?? this.notes,
      lastVisit: lastVisit ?? this.lastVisit,
      allergies: allergies ?? this.allergies,
    );
  }

  Map<String, Object?> toMap() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'birth_year': birthYear,
        'notes': notes,
        'last_visit': lastVisit,
        'allergies': allergies,
      };

  factory DentalPatient.fromMap(Map<String, Object?> map) => DentalPatient(
        id: map['id'] as int?,
        name: map['name'] as String? ?? '',
        phone: map['phone'] as String? ?? '',
        email: map['email'] as String? ?? '',
        birthYear: map['birth_year'] as int? ?? 1990,
        notes: map['notes'] as String? ?? '',
        lastVisit: map['last_visit'] as String? ?? '—',
        allergies: map['allergies'] as String? ?? '',
      );
}

class DentalConsultation {
  DentalConsultation({
    this.id,
    required this.patientId,
    required this.patientName,
    required this.dateTime,
    required this.type,
    required this.reason,
    required this.status,
  });

  final int? id;
  final int patientId;
  final String patientName;
  final String dateTime;
  final String type;
  final String reason;
  String status;

  bool get isTele => type == 'Téléconsultation';

  Map<String, Object?> toMap() => {
        'id': id,
        'patient_id': patientId,
        'patient_name': patientName,
        'date_time': dateTime,
        'type': type,
        'reason': reason,
        'status': status,
      };

  factory DentalConsultation.fromMap(Map<String, Object?> map) => DentalConsultation(
        id: map['id'] as int?,
        patientId: map['patient_id'] as int? ?? 0,
        patientName: map['patient_name'] as String? ?? '',
        dateTime: map['date_time'] as String? ?? '',
        type: map['type'] as String? ?? 'Cabinet',
        reason: map['reason'] as String? ?? '',
        status: map['status'] as String? ?? 'Planifiée',
      );
}

class DentalHistory {
  DentalHistory({
    this.id,
    required this.patientId,
    required this.patientName,
    required this.action,
    required this.detail,
    required this.date,
  });

  final int? id;
  final int patientId;
  final String patientName;
  final String action;
  final String detail;
  final String date;

  Map<String, Object?> toMap() => {
        'id': id,
        'patient_id': patientId,
        'patient_name': patientName,
        'action': action,
        'detail': detail,
        'date': date,
      };

  factory DentalHistory.fromMap(Map<String, Object?> map) => DentalHistory(
        id: map['id'] as int?,
        patientId: map['patient_id'] as int? ?? 0,
        patientName: map['patient_name'] as String? ?? '',
        action: map['action'] as String? ?? '',
        detail: map['detail'] as String? ?? '',
        date: map['date'] as String? ?? '',
      );
}

class DentalNotification {
  DentalNotification({
    this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.read = false,
  });

  final int? id;
  final String title;
  final String body;
  final String type;
  final String createdAt;
  bool read;

  Map<String, Object?> toMap() => {
        'id': id,
        'title': title,
        'body': body,
        'type': type,
        'created_at': createdAt,
        'read': read ? 1 : 0,
      };

  factory DentalNotification.fromMap(Map<String, Object?> map) => DentalNotification(
        id: map['id'] as int?,
        title: map['title'] as String? ?? '',
        body: map['body'] as String? ?? '',
        type: map['type'] as String? ?? 'Info',
        createdAt: map['created_at'] as String? ?? '',
        read: (map['read'] as int? ?? 0) == 1,
      );
}

class DentiAiMessage {
  DentiAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

class TreatmentRecommendation {
  TreatmentRecommendation({
    required this.patientName,
    required this.title,
    required this.detail,
    required this.priority,
  });
  final String patientName;
  final String title;
  final String detail;
  final String priority;
}

const consultTypes = ['Cabinet', 'Téléconsultation'];
const consultStatuses = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
