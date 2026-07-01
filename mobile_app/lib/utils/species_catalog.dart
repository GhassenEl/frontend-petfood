/// Référentiel espèces — chiens, chats, NAC et autres animaux de compagnie.
class FeedingScheduleSlot {
  const FeedingScheduleSlot({
    required this.time,
    required this.portionGrams,
    required this.label,
  });

  final String time;
  final int portionGrams;
  final String label;
}

class SpeciesInfo {
  const SpeciesInfo({
    required this.id,
    required this.labelFr,
    required this.emoji,
    required this.idealWaterRatio,
    required this.mlPerKgDay,
    required this.hydrationTip,
    this.usesAquarium = false,
  });

  final String id;
  final String labelFr;
  final String emoji;
  final int idealWaterRatio;
  final double mlPerKgDay;
  final String hydrationTip;
  final bool usesAquarium;
}

class SpeciesCatalog {
  static const _species = <String, SpeciesInfo>{
    'dog': SpeciesInfo(
      id: 'dog',
      labelFr: 'Chien',
      emoji: '🐕',
      idealWaterRatio: 5,
      mlPerKgDay: 50,
      hydrationTip: 'Un chien actif a besoin d\'environ 50 ml/kg/jour. Eau fraîche après l\'exercice.',
    ),
    'chien': SpeciesInfo(
      id: 'dog',
      labelFr: 'Chien',
      emoji: '🐕',
      idealWaterRatio: 5,
      mlPerKgDay: 50,
      hydrationTip: 'Un chien actif a besoin d\'environ 50 ml/kg/jour. Eau fraîche après l\'exercice.',
    ),
    'cat': SpeciesInfo(
      id: 'cat',
      labelFr: 'Chat',
      emoji: '🐈',
      idealWaterRatio: 4,
      mlPerKgDay: 45,
      hydrationTip: 'Les chats boivent peu : une fontaine augmente la consommation.',
    ),
    'chat': SpeciesInfo(
      id: 'cat',
      labelFr: 'Chat',
      emoji: '🐈',
      idealWaterRatio: 4,
      mlPerKgDay: 45,
      hydrationTip: 'Les chats boivent peu : une fontaine augmente la consommation.',
    ),
    'bird': SpeciesInfo(
      id: 'bird',
      labelFr: 'Oiseau',
      emoji: '🐦',
      idealWaterRatio: 10,
      mlPerKgDay: 80,
      hydrationTip: 'Changez l\'eau des oiseaux 2×/jour — évitez les abreuvoirs sales.',
    ),
    'oiseau': SpeciesInfo(
      id: 'bird',
      labelFr: 'Oiseau',
      emoji: '🐦',
      idealWaterRatio: 10,
      mlPerKgDay: 80,
      hydrationTip: 'Changez l\'eau des oiseaux 2×/jour — évitez les abreuvoirs sales.',
    ),
    'fish': SpeciesInfo(
      id: 'fish',
      labelFr: 'Poisson',
      emoji: '🐠',
      idealWaterRatio: 0,
      mlPerKgDay: 0,
      usesAquarium: true,
      hydrationTip: 'Surveillez la qualité de l\'eau d\'aquarium (pH, température, nitrites).',
    ),
    'poisson': SpeciesInfo(
      id: 'fish',
      labelFr: 'Poisson',
      emoji: '🐠',
      idealWaterRatio: 0,
      mlPerKgDay: 0,
      usesAquarium: true,
      hydrationTip: 'Surveillez la qualité de l\'eau d\'aquarium (pH, température, nitrites).',
    ),
    'rabbit': SpeciesInfo(
      id: 'rabbit',
      labelFr: 'Lapin',
      emoji: '🐰',
      idealWaterRatio: 7,
      mlPerKgDay: 100,
      hydrationTip: 'Les lapins boivent beaucoup — bol lourd stable et eau fraîche quotidienne.',
    ),
    'lapin': SpeciesInfo(
      id: 'rabbit',
      labelFr: 'Lapin',
      emoji: '🐰',
      idealWaterRatio: 7,
      mlPerKgDay: 100,
      hydrationTip: 'Les lapins boivent beaucoup — bol lourd stable et eau fraîche quotidienne.',
    ),
    'hamster': SpeciesInfo(
      id: 'hamster',
      labelFr: 'Hamster',
      emoji: '🐹',
      idealWaterRatio: 8,
      mlPerKgDay: 120,
      hydrationTip: 'Biberon propre chaque jour — les hamsters déshydratent vite en cage chaude.',
    ),
    'reptile': SpeciesInfo(
      id: 'reptile',
      labelFr: 'Reptile',
      emoji: '🦎',
      idealWaterRatio: 3,
      mlPerKgDay: 30,
      hydrationTip: 'Bain tiède + bol d\'eau — l\'humidité du terrarium compte autant que la boisson.',
    ),
    'ferret': SpeciesInfo(
      id: 'ferret',
      labelFr: 'Furet',
      emoji: '🦡',
      idealWaterRatio: 5,
      mlPerKgDay: 55,
      hydrationTip: 'Les furets sont actifs : plusieurs points d\'eau dans la pièce.',
    ),
    'furet': SpeciesInfo(
      id: 'ferret',
      labelFr: 'Furet',
      emoji: '🦡',
      idealWaterRatio: 5,
      mlPerKgDay: 55,
      hydrationTip: 'Les furets sont actifs : plusieurs points d\'eau dans la pièce.',
    ),
    'guinea_pig': SpeciesInfo(
      id: 'guinea_pig',
      labelFr: 'Cochon d\'Inde',
      emoji: '🐹',
      idealWaterRatio: 7,
      mlPerKgDay: 100,
      hydrationTip: 'Cochons d\'Inde : eau + foin humide — surveillez le biberon quotidiennement.',
    ),
    'cochon_dinde': SpeciesInfo(
      id: 'guinea_pig',
      labelFr: 'Cochon d\'Inde',
      emoji: '🐹',
      idealWaterRatio: 7,
      mlPerKgDay: 100,
      hydrationTip: 'Cochons d\'Inde : eau + foin humide — surveillez le biberon quotidiennement.',
    ),
    'nac': SpeciesInfo(
      id: 'nac',
      labelFr: 'NAC',
      emoji: '🐾',
      idealWaterRatio: 6,
      mlPerKgDay: 60,
      hydrationTip: 'Adaptez bol ou biberon à la taille de votre NAC — consultez un vétérinaire NAC.',
    ),
    'other': SpeciesInfo(
      id: 'other',
      labelFr: 'Autre',
      emoji: '🐾',
      idealWaterRatio: 5,
      mlPerKgDay: 50,
      hydrationTip: 'Objectif hydratation personnalisé selon espèce et poids — avis vétérinaire recommandé.',
    ),
    'autre': SpeciesInfo(
      id: 'other',
      labelFr: 'Autre',
      emoji: '🐾',
      idealWaterRatio: 5,
      mlPerKgDay: 50,
      hydrationTip: 'Objectif hydratation personnalisé selon espèce et poids — avis vétérinaire recommandé.',
    ),
  };

  static SpeciesInfo resolve(String? raw) {
    final key = (raw ?? 'dog').toLowerCase().trim();
    return _species[key] ?? _species['other']!;
  }

  static String emoji(String? raw) => resolve(raw).emoji;
  static String label(String? raw) => resolve(raw).labelFr;
  static int idealWaterRatio(String? raw) => resolve(raw).idealWaterRatio;

  static int estimateTargetMl(String? species, {double? weightKg}) {
    final info = resolve(species);
    if (info.usesAquarium) return 0;
    if (weightKg != null && weightKg > 0) {
      return (weightKg * info.mlPerKgDay).round().clamp(20, 5000);
    }
    return switch (info.id) {
      'bird' => 40,
      'hamster' => 15,
      'rabbit' => 350,
      'reptile' => 80,
      'ferret' => 200,
      'guinea_pig' => 200,
      'cat' => 250,
      _ => 550,
    };
  }

  static (int min, int max) portionLimits(String? raw) {
    return switch (resolve(raw).id) {
      'hamster' => (3, 15),
      'bird' => (5, 20),
      'rabbit' => (20, 80),
      'reptile' => (5, 40),
      'ferret' => (15, 60),
      'guinea_pig' => (15, 50),
      'cat' => (10, 80),
      'fish' => (0, 0),
      'nac' => (5, 50),
      _ => (10, 200),
    };
  }

  static int clampPortion(String? species, int grams) {
    final (min, max) = portionLimits(species);
    if (max == 0) return 0;
    return grams.clamp(min, max);
  }

  static int estimateDailyGrams(String? species, {double? weightKg}) {
    final id = resolve(species).id;
    if (id == 'fish') return 0;
    if (weightKg != null && weightKg > 0) {
      return switch (id) {
        'cat' => (weightKg * 12).round().clamp(40, 120),
        'dog' => (weightKg * 10).round().clamp(80, 450),
        'bird' => (weightKg * 80).round().clamp(8, 25),
        'rabbit' => (weightKg * 35).round().clamp(60, 180),
        'hamster' => (weightKg * 100).round().clamp(10, 20),
        'reptile' => (weightKg * 15).round().clamp(10, 50),
        'ferret' => (weightKg * 20).round().clamp(40, 120),
        'guinea_pig' => (weightKg * 25).round().clamp(30, 100),
        _ => (weightKg * 10).round().clamp(30, 200),
      };
    }
    return switch (id) {
      'cat' => 55,
      'bird' => 10,
      'rabbit' => 85,
      'hamster' => 14,
      'reptile' => 25,
      'ferret' => 70,
      'guinea_pig' => 60,
      'nac' => 40,
      _ => 230,
    };
  }

  /// Consommation démo du jour (g) — alignée sur les profils demo_water.json.
  static const demoTodayGramsByPetId = <String, int>{
    'demo-pet-1': 65,
    'demo-pet-2': 45,
    'demo-pet-3': 6,
    'demo-pet-4': 72,
    'demo-pet-5': 0,
    'demo-pet-6': 4,
  };

  static int demoTodayGrams(String petId) => demoTodayGramsByPetId[petId] ?? 0;

  static int remainingDailyGrams(String? species, {double? weightKg, int todayGrams = 0}) {
    final daily = estimateDailyGrams(species, weightKg: weightKg);
    if (daily <= 0) return 0;
    return (daily - todayGrams).clamp(0, daily);
  }

  static List<FeedingScheduleSlot> feedingSchedule(String? species, {double? weightKg}) {
    final id = resolve(species).id;
    if (id == 'fish') {
      return const [
        FeedingScheduleSlot(time: '09:00', portionGrams: 0, label: 'Flocons matin'),
        FeedingScheduleSlot(time: '18:00', portionGrams: 0, label: 'Flocons soir'),
      ];
    }

    final daily = estimateDailyGrams(species, weightKg: weightKg);
    final templates = switch (id) {
      'cat' => [
        ('07:30', 'Matin', 0.35),
        ('13:00', 'Midi', 0.33),
        ('20:00', 'Soir', 0.32),
      ],
      'bird' => [
        ('08:00', 'Matin', 0.5),
        ('17:00', 'Soir', 0.5),
      ],
      'hamster' => [
        ('09:00', 'Matin', 0.55),
        ('21:00', 'Soir', 0.45),
      ],
      'rabbit' => [
        ('08:00', 'Matin', 0.35),
        ('14:00', 'Après-midi', 0.3),
        ('19:00', 'Soir', 0.35),
      ],
      'reptile' => [
        ('10:00', 'Matin', 0.5),
        ('17:00', 'Soir', 0.5),
      ],
      'ferret' => [
        ('08:00', 'Petit-déjeuner', 0.4),
        ('14:00', 'Déjeuner', 0.25),
        ('20:00', 'Dîner', 0.35),
      ],
      'guinea_pig' => [
        ('08:00', 'Matin', 0.4),
        ('13:00', 'Midi', 0.25),
        ('19:00', 'Soir', 0.35),
      ],
      _ => [
        ('08:00', 'Petit-déjeuner', 0.4),
        ('12:30', 'Déjeuner', 0.2),
        ('19:00', 'Dîner', 0.4),
      ],
    };

    final slots = <FeedingScheduleSlot>[];
    var allocated = 0;
    for (var i = 0; i < templates.length; i++) {
      final (time, label, ratio) = templates[i];
      final grams = i == templates.length - 1
          ? daily - allocated
          : (daily * ratio).round();
      final clamped = clampPortion(species, grams);
      allocated += clamped;
      slots.add(FeedingScheduleSlot(time: time, portionGrams: clamped, label: label));
    }
    return slots;
  }

  static const addableSpecies = [
    ('chien', 'Chien', '🐕'),
    ('chat', 'Chat', '🐈'),
    ('oiseau', 'Oiseau', '🐦'),
    ('poisson', 'Poisson', '🐠'),
    ('lapin', 'Lapin', '🐰'),
    ('hamster', 'Hamster', '🐹'),
    ('reptile', 'Reptile', '🦎'),
    ('furet', 'Furet', '🦡'),
    ('cochon_dinde', 'Cochon d\'Inde', '🐹'),
    ('nac', 'NAC', '🐾'),
    ('autre', 'Autre', '🐾'),
  ];
}
