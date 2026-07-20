import '../models/models.dart';
import 'api_client.dart';

class FeederRepository {
  FeederRepository(this.api);
  final ApiClient api;

  Future<List<PetFeeder>> listFeeders() async {
    final data = await api.get('/feeder');
    return (data as List<dynamic>)
        .map((e) => PetFeeder.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<PetFeeder> getFeeder(String id) async {
    final data = await api.get('/feeder/$id');
    return PetFeeder.fromJson(Map<String, dynamic>.from(data));
  }

  Future<PetFeeder> registerFeeder({String name = 'Gamelle intelligente PetfoodTN'}) async {
    final data = await api.post('/feeder', {'name': name});
    return PetFeeder.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> dispense(String feederId, double grams) async {
    await api.post('/feeder/$feederId/dispense', {'grams': grams});
  }

  Future<NutritionPlan> nutritionPlan(String feederId) async {
    final data = await api.get('/feeder/$feederId/nutrition-plan');
    return NutritionPlan.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> applySchedules(String feederId) async {
    await api.post('/feeder/$feederId/apply-schedules');
  }

  Future<void> markRefill(String feederId, {double? grams}) async {
    await api.post('/feeder/$feederId/refill', {
      if (grams != null) 'grams': grams,
    });
  }

  Future<List<FeederLog>> getHistory(String feederId, {String? type, int limit = 50}) async {
    final data = await api.get('/feeder/$feederId/history', query: {
      'limit': '$limit',
      if (type != null && type != 'all') 'type': type,
    });
    return (data as List<dynamic>)
        .map((e) => FeederLog.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<FeederStats> getStats(String feederId, {int days = 7}) async {
    final data = await api.get('/feeder/$feederId/stats', query: {'days': '$days'});
    return FeederStats.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<FeederAlert>> getAlerts(String feederId) async {
    final data = await api.get('/feeder/$feederId/alerts');
    final list = data is List ? data : (data['alerts'] as List<dynamic>? ?? []);
    return list.map((e) => FeederAlert.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<FeederSchedule> addSchedule(
    String feederId, {
    required String time,
    double portionGrams = 30,
    String? label,
  }) async {
    final data = await api.post('/feeder/$feederId/schedules', {
      'time': time,
      'portionGrams': portionGrams,
      if (label != null) 'label': label,
    });
    return FeederSchedule.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> toggleSchedule(String scheduleId, {bool? enabled}) async {
    await api.patch('/feeder/schedules/$scheduleId', {
      if (enabled != null) 'enabled': enabled,
    });
  }

  Future<Map<String, dynamic>> analyzeBehavior() async {
    final data = await api.post('/behavior/analyze', {});
    return Map<String, dynamic>.from(data as Map);
  }

  Future<List<Map<String, dynamic>>> listBehaviorAnomalies({int limit = 8}) async {
    final data = await api.get('/behavior/anomalies', query: {'limit': '$limit'});
    final list = data['anomalies'] as List<dynamic>? ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }
}

class ProductRepository {
  ProductRepository(this.api);
  final ApiClient api;

  Future<List<Product>> listProducts() async {
    final data = await api.get('/products');
    return (data as List<dynamic>)
        .map((e) => Product.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<Product>> petRecommendations({String? petId}) async {
    final query = petId != null ? {'petId': petId, 'limit': '8'} : {'limit': '8'};
    final data = await api.get('/products/recommendations/pets', query: query);
    final list = data['recommendations'] as List<dynamic>? ?? [];
    return list
        .map((e) => Product.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
