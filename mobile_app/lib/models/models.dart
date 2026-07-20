class PetFeeder {
  PetFeeder({
    required this.id,
    required this.name,
    required this.deviceKey,
    required this.status,
    this.reservoirCm,
    this.foodGrams,
    this.temperature,
    this.humidity,
    this.animalPresent = false,
    this.isLowFood = false,
    this.schedules = const [],
    this.logs = const [],
  });

  final String id;
  final String name;
  final String deviceKey;
  final String status;
  final double? reservoirCm;
  final double? foodGrams;
  final double? temperature;
  final double? humidity;
  final bool animalPresent;
  final bool isLowFood;
  final List<FeederSchedule> schedules;
  final List<FeederLog> logs;

  bool get isOnline => status == 'online';

  factory PetFeeder.fromJson(Map<String, dynamic> j) => PetFeeder(
        id: j['id']?.toString() ?? j['_id']?.toString() ?? '',
        name: j['name']?.toString() ?? 'Distributeur',
        deviceKey: j['deviceKey']?.toString() ?? '',
        status: j['status']?.toString() ?? 'offline',
        reservoirCm: _dbl(j['reservoirCm']),
        foodGrams: _dbl(j['foodGrams']),
        temperature: _dbl(j['temperature']),
        humidity: _dbl(j['humidity']),
        animalPresent: j['animalPresent'] == true,
        isLowFood: j['isLowFood'] == true,
        schedules: (j['schedules'] as List<dynamic>? ?? [])
            .map((e) => FeederSchedule.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        logs: (j['logs'] as List<dynamic>? ?? [])
            .map((e) => FeederLog.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
      );

  static double? _dbl(dynamic v) => v == null ? null : (v as num).toDouble();
}

class FeederSchedule {
  FeederSchedule({required this.id, required this.time, required this.portionGrams, this.label});

  final String id;
  final String time;
  final double portionGrams;
  final String? label;

  factory FeederSchedule.fromJson(Map<String, dynamic> j) => FeederSchedule(
        id: j['id']?.toString() ?? '',
        time: j['time']?.toString() ?? '',
        portionGrams: (j['portionGrams'] as num?)?.toDouble() ?? 30,
        label: j['label']?.toString(),
      );
}

class FeederLog {
  FeederLog({required this.id, required this.eventType, this.message, this.portionGrams, this.createdAt});

  final String id;
  final String eventType;
  final String? message;
  final double? portionGrams;
  final DateTime? createdAt;

  factory FeederLog.fromJson(Map<String, dynamic> j) => FeederLog(
        id: j['id']?.toString() ?? '',
        eventType: j['eventType']?.toString() ?? '',
        message: j['message']?.toString(),
        portionGrams: (j['portionGrams'] as num?)?.toDouble(),
        createdAt: j['createdAt'] != null ? DateTime.tryParse(j['createdAt'].toString()) : null,
      );
}

class FeederStats {
  FeederStats({
    this.todayGrams = 0,
    this.weekGrams = 0,
    this.dispenseCount = 0,
    this.refillCount = 0,
  });

  final int todayGrams;
  final int weekGrams;
  final int dispenseCount;
  final int refillCount;

  factory FeederStats.fromJson(Map<String, dynamic> j) => FeederStats(
        todayGrams: (j['todayGrams'] as num?)?.toInt() ?? 0,
        weekGrams: (j['weekGrams'] as num?)?.toInt() ?? 0,
        dispenseCount: (j['dispenseCount'] as num?)?.toInt() ?? 0,
        refillCount: (j['refillCount'] as num?)?.toInt() ?? 0,
      );
}

class FeederAlert {
  FeederAlert({
    required this.code,
    required this.title,
    required this.message,
    this.level = 'warning',
  });

  final String code;
  final String title;
  final String message;
  final String level;

  bool get isCritical => level == 'critical' || code == 'low_food';

  factory FeederAlert.fromJson(Map<String, dynamic> j) => FeederAlert(
        code: j['code']?.toString() ?? '',
        title: j['title']?.toString() ?? 'Alerte',
        message: j['message']?.toString() ?? '',
        level: j['level']?.toString() ?? 'warning',
      );
}

class NutritionPlan {
  NutritionPlan({this.petName, required this.dailyGrams, required this.portionGrams, required this.mealsPerDay});

  final String? petName;
  final int dailyGrams;
  final int portionGrams;
  final int mealsPerDay;

  factory NutritionPlan.fromJson(Map<String, dynamic> j) {
    final pet = j['pet'] as Map<String, dynamic>?;
    return NutritionPlan(
      petName: pet?['name']?.toString(),
      dailyGrams: (j['dailyGrams'] as num?)?.toInt() ?? 60,
      portionGrams: (j['portionGrams'] as num?)?.toInt() ?? 30,
      mealsPerDay: (j['mealsPerDay'] as num?)?.toInt() ?? 2,
    );
  }
}

class Product {
  Product({required this.id, required this.name, required this.price, this.discount = 0, this.stock = 0, this.imageUrl, this.animalType});

  final String id;
  final String name;
  final double price;
  final double discount;
  final int stock;
  final String? imageUrl;
  final String? animalType;

  double get finalPrice => price * (1 - discount / 100);

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        id: j['id']?.toString() ?? j['_id']?.toString() ?? '',
        name: j['name']?.toString() ?? '',
        price: (j['price'] as num?)?.toDouble() ?? 0,
        discount: (j['discount'] as num?)?.toDouble() ?? 0,
        stock: (j['stock'] as num?)?.toInt() ?? 0,
        imageUrl: j['imageUrl']?.toString(),
        animalType: j['animalType']?.toString(),
      );
}
