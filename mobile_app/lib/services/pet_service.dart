import '../models/pet.dart';
import 'api_client.dart';

class PetService {
  PetService(this.api);

  final ApiClient api;

  static final List<PetProfile> _demoPets = [
    PetProfile(id: 'demo-1', name: 'Max', species: 'chien', breed: 'Labrador', weightKg: 28.5, birthDate: '2020-03-15'),
    PetProfile(id: 'demo-2', name: 'Luna', species: 'chat', breed: 'Européen', weightKg: 4.2, birthDate: '2022-07-08'),
  ];

  Future<List<PetProfile>> fetchPets() async {
    try {
      final data = await api.get('/pets');
      final list = data is List ? data : (data is Map ? (data['pets'] as List?) : null);
      if (list == null || list.isEmpty) return List.from(_demoPets);
      return list.map((e) => PetProfile.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } catch (_) {
      return List.from(_demoPets);
    }
  }

  Future<PetProfile> addPet(PetProfile pet) async {
    try {
      final data = await api.post('/pets', pet.toJson());
      if (data is Map) return PetProfile.fromJson(Map<String, dynamic>.from(data));
    } catch (_) {}
    return PetProfile(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      weightKg: pet.weightKg,
      birthDate: pet.birthDate,
      notes: pet.notes,
    );
  }
}
