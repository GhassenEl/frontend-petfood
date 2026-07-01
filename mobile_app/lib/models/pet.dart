class PetProfile {
  PetProfile({
    required this.id,
    required this.name,
    required this.species,
    this.breed,
    this.weightKg,
    this.birthDate,
    this.notes,
  });

  final String id;
  final String name;
  final String species;
  final String? breed;
  final double? weightKg;
  final String? birthDate;
  final String? notes;

  factory PetProfile.fromJson(Map<String, dynamic> json) {
    return PetProfile(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name']?.toString() ?? 'Animal',
      species: json['species']?.toString() ?? json['type']?.toString() ?? 'chien',
      breed: json['breed']?.toString(),
      weightKg: json['weight'] != null
          ? double.tryParse(json['weight'].toString())
          : json['weightKg'] != null
              ? double.tryParse(json['weightKg'].toString())
              : null,
      birthDate: json['birthDate']?.toString(),
      notes: json['notes']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'species': species,
        if (breed != null) 'breed': breed,
        if (weightKg != null) 'weight': weightKg,
        if (birthDate != null) 'birthDate': birthDate,
        if (notes != null) 'notes': notes,
      };
}
