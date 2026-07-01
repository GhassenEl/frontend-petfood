import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/pet.dart';
import '../utils/species_catalog.dart';
import 'api_client.dart';

class PetService {
  PetService(this.api);

  final ApiClient api;
  static const _cacheKey = 'petfoodtn_mobile:pets';

  static final List<PetProfile> _demoPets = [
    PetProfile(id: 'demo-1', name: 'Max', species: 'chien', breed: 'Labrador', weightKg: 28.5, birthDate: '2020-03-15'),
    PetProfile(id: 'demo-2', name: 'Luna', species: 'chat', breed: 'Européen', weightKg: 4.2, birthDate: '2022-07-08'),
  ];

  Map<String, dynamic> _payload(PetProfile pet) {
    final apiType = SpeciesCatalog.resolve(pet.species).id;
    return {
      'name': pet.name,
      'type': apiType,
      'species': pet.species,
      if (pet.breed != null && pet.breed!.isNotEmpty) 'breed': pet.breed,
      if (pet.weightKg != null) 'weight': pet.weightKg,
      if (pet.weightKg != null) 'weightKg': pet.weightKg,
      if (pet.birthDate != null) 'birthDate': pet.birthDate,
      if (pet.notes != null && pet.notes!.isNotEmpty) 'notes': pet.notes,
    };
  }

  Future<List<PetProfile>> _loadCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw == null) return [];
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map((e) => PetProfile.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _saveCache(List<PetProfile> pets) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _cacheKey,
        jsonEncode(pets.map((p) => {...p.toJson(), 'id': p.id, '_id': p.id}).toList()),
      );
    } catch (_) {}
  }

  Future<List<PetProfile>> fetchPets() async {
    try {
      final data = await api.get('/pets');
      final list = data is List ? data : (data is Map ? (data['pets'] as List?) : null);
      if (list != null && list.isNotEmpty) {
        final pets = list.map((e) => PetProfile.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        await _saveCache(pets);
        return pets;
      }
    } catch (_) {}

    final cached = await _loadCache();
    if (cached.isNotEmpty) return cached;
    return List.from(_demoPets);
  }

  Future<PetProfile> addPet(PetProfile pet) async {
    try {
      final data = await api.post('/pets', _payload(pet));
      PetProfile? created;
      if (data is Map) {
        final body = data['pet'] is Map ? data['pet'] as Map : data;
        created = PetProfile.fromJson(Map<String, dynamic>.from(body));
      }
      if (created != null && created.id.isNotEmpty) {
        return created;
      }
    } catch (_) {}

    final local = PetProfile(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      weightKg: pet.weightKg,
      birthDate: pet.birthDate,
      notes: pet.notes,
    );
    final cached = await _loadCache();
    cached.add(local);
    await _saveCache(cached);
    return local;
  }
}
