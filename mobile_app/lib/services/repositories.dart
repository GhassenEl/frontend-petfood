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

  Future<PetFeeder> registerFeeder({String name = 'Mon distributeur'}) async {
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
