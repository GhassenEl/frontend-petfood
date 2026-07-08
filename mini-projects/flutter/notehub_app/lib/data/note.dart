class Note {
  Note({
    this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  final int? id;
  final String title;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;

  Note copyWith({
    int? id,
    String? title,
    String? content,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Note(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, Object?> toMap() => {
        'id': id,
        'title': title,
        'content': content,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
      };

  factory Note.fromMap(Map<String, Object?> map) => Note(
        id: map['id'] as int?,
        title: map['title'] as String? ?? '',
        content: map['content'] as String? ?? '',
        createdAt: DateTime.tryParse('${map['created_at']}') ?? DateTime.now(),
        updatedAt: DateTime.tryParse('${map['updated_at']}') ?? DateTime.now(),
      );
}
