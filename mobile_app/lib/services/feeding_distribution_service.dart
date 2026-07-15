import '../models/client_account.dart';
import '../models/pet_feeding_summary.dart';
import '../utils/species_catalog.dart';
import 'api_client.dart';

class FeedingDistributionService {
  FeedingDistributionService(this.api);

  final ApiClient api;

  Future<ClientFeedingPack> loadForClient(
    ClientAccount client, {
    required bool isOwnAccount,
  }) async {
    if (isOwnAccount && api.hasAuth) {
      try {
        final pack = await _loadLive(client);
        if (pack.pets.isNotEmpty) return pack;
      } catch (_) {}
    }
    return _demoPack(client);
  }

  Future<ClientFeedingPack> _loadLive(ClientAccount client) async {
    final petsRaw = await api.get('/pets');
    final petsList = _extractList(petsRaw);
    if (petsList.isEmpty) return _demoPack(client);

    Map<String, Map<String, dynamic>> nutritionByPet = {};
    try {
      final nutrition = await api.get('/pets/nutrition');
      if (nutrition is Map) {
        for (final p in (nutrition['pets'] as List? ?? [])) {
          if (p is Map) {
            final id = (p['petId'] ?? p['id'] ?? '').toString();
            if (id.isNotEmpty) nutritionByPet[id] = Map<String, dynamic>.from(p);
          }
        }
      }
    } catch (_) {}

    final feederMetrics = <String, Map<String, dynamic>>{};
    try {
      final iot = await api.get('/client/iot/pack');
      if (iot is Map) {
        for (final d in (iot['devices'] as List? ?? [])) {
          if (d is! Map) continue;
          final type = d['type']?.toString() ?? '';
          if (type != 'feeder' && type != 'feeder-cam') continue;
          final petName = d['petName']?.toString().toLowerCase() ?? '';
          feederMetrics[petName] = Map<String, dynamic>.from(d);
        }
      }
    } catch (_) {}

    final summaries = <PetFeedingSummary>[];
    for (final raw in petsList) {
      final pet = Map<String, dynamic>.from(raw as Map);
      final petId = (pet['id'] ?? pet['_id'] ?? '').toString();
      final name = pet['name']?.toString() ?? 'Animal';
      final species = pet['species']?.toString() ?? pet['type']?.toString() ?? 'chien';
      final weight = _dbl(pet['weight'] ?? pet['weightKg']);

      final nut = nutritionByPet[petId];
      final calories = nut?['calories'] as Map?;
      final dailyTarget = (calories?['dryFoodGramsPerDay'] as num?)?.toInt() ??
          (calories?['gramsPerMeal'] as num?)?.toInt() ??
          _estimateDailyGrams(species, weight);
      final meals = (calories?['mealCount'] as num?)?.toInt() ?? 2;
      final perMeal = (calories?['gramsPerMeal'] as num?)?.toInt() ?? (dailyTarget / meals).round();

      final feeder = feederMetrics[name.toLowerCase()];
      final metrics = feeder?['metrics'] as Map?;
      final todayGrams = (metrics?['todayGrams'] as num?)?.toInt() ?? _estimateToday(dailyTarget, name);
      final reservoir = _dbl(metrics?['reservoirPercent'] ?? metrics?['reservoir']);
      final online = feeder?['status']?.toString() == 'online';

      summaries.add(PetFeedingSummary(
        petId: petId,
        name: name,
        species: species,
        breed: pet['breed']?.toString(),
        weightKg: weight,
        dailyTargetGrams: dailyTarget,
        todayGrams: todayGrams,
        mealsPerDay: meals,
        gramsPerMeal: perMeal,
        reservoirPercent: reservoir,
        feederOnline: online,
        isLowFood: metrics?['isLowFood'] == true || (reservoir != null && reservoir < 25),
        mode: 'live',
        schedules: _defaultSchedules(perMeal),
      ));
    }

    return ClientFeedingPack(client: client, pets: summaries, mode: 'live');
  }

  ClientFeedingPack _demoPack(ClientAccount client) {
    final pets = <PetFeedingSummary>[
      PetFeedingSummary(
        petId: '${client.id}-pet-1',
        name: 'Max',
        species: 'chien',
        breed: 'Labrador',
        weightKg: 28.5,
        dailyTargetGrams: 380,
        todayGrams: 265,
        mealsPerDay: 2,
        gramsPerMeal: 190,
        reservoirPercent: 42,
        feederOnline: true,
        isLowFood: true,
        mode: 'demo',
        schedules: _defaultSchedules(190),
      ),
      PetFeedingSummary(
        petId: '${client.id}-pet-2',
        name: 'Luna',
        species: 'chat',
        breed: 'Européen',
        weightKg: 4.2,
        dailyTargetGrams: 55,
        todayGrams: 48,
        mealsPerDay: 2,
        gramsPerMeal: 28,
        reservoirPercent: 68,
        feederOnline: true,
        mode: 'demo',
        schedules: _defaultSchedules(28),
      ),
    ];

    if (client.petType == 'cat') {
      return ClientFeedingPack(
        client: client,
        pets: [pets[1]],
        mode: 'demo',
      );
    }
    if (client.petType == 'dog') {
      return ClientFeedingPack(
        client: client,
        pets: [pets[0]],
        mode: 'demo',
      );
    }

    return ClientFeedingPack(client: client, pets: pets, mode: 'demo');
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      final inner = data['pets'] ?? data['value'] ?? data['data'];
      if (inner is List) return inner;
    }
    return [];
  }

  double? _dbl(dynamic v) => v == null ? null : (v as num).toDouble();

  int _estimateDailyGrams(String species, double? weightKg) {
    final w = weightKg ?? 10;
    final info = SpeciesCatalog.resolve(species);
    if (info.id == 'cat') return (w * 12).round().clamp(40, 90);
    return (w * 14).round().clamp(120, 500);
  }

  int _estimateToday(int target, String name) {
    final hash = name.codeUnits.fold(0, (a, b) => a + b);
    final ratio = 0.55 + (hash % 40) / 100;
    return (target * ratio).round();
  }

  List<FeedingScheduleRow> _defaultSchedules(int grams) => [
        FeedingScheduleRow(time: '08:00', grams: grams, label: 'Matin'),
        FeedingScheduleRow(time: '18:30', grams: grams, label: 'Soir'),
      ];
}
