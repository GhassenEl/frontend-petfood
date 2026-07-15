class RunEntry {
  RunEntry({
    required this.id,
    required this.date,
    required this.distanceKm,
    required this.duration,
    required this.type,
    this.notes = '',
  });

  final String id;
  final DateTime date;
  final double distanceKm;
  final Duration duration;
  final String type;
  final String notes;

  Duration get pacePerKm {
    if (distanceKm <= 0) return Duration.zero;
    final sec = duration.inSeconds / distanceKm;
    return Duration(seconds: sec.round());
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date.toIso8601String(),
        'distanceKm': distanceKm,
        'durationSec': duration.inSeconds,
        'type': type,
        'notes': notes,
      };

  factory RunEntry.fromJson(Map<String, dynamic> json) => RunEntry(
        id: json['id'] as String,
        date: DateTime.parse(json['date'] as String),
        distanceKm: (json['distanceKm'] as num).toDouble(),
        duration: Duration(seconds: json['durationSec'] as int),
        type: json['type'] as String? ?? 'Endurance',
        notes: json['notes'] as String? ?? '',
      );
}

class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    this.read = false,
    this.kind = 'info',
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;
  final String kind;

  AppNotification copyWith({bool? read}) => AppNotification(
        id: id,
        title: title,
        body: body,
        createdAt: createdAt,
        read: read ?? this.read,
        kind: kind,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'createdAt': createdAt.toIso8601String(),
        'read': read,
        'kind': kind,
      };

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        title: json['title'] as String,
        body: json['body'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        read: json['read'] as bool? ?? false,
        kind: json['kind'] as String? ?? 'info',
      );
}

class AthleteProfile {
  AthleteProfile({
    this.name = 'Athlète',
    this.targetMarathon = '3h30',
    this.weeklyGoalKm = 45,
  });

  final String name;
  final String targetMarathon;
  final double weeklyGoalKm;

  Map<String, dynamic> toJson() => {
        'name': name,
        'targetMarathon': targetMarathon,
        'weeklyGoalKm': weeklyGoalKm,
      };

  factory AthleteProfile.fromJson(Map<String, dynamic>? json) {
    if (json == null) return AthleteProfile();
    return AthleteProfile(
      name: json['name'] as String? ?? 'Athlète',
      targetMarathon: json['targetMarathon'] as String? ?? '3h30',
      weeklyGoalKm: (json['weeklyGoalKm'] as num?)?.toDouble() ?? 45,
    );
  }
}
