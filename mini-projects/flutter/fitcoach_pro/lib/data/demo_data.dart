class WorkoutExercise {
  WorkoutExercise({
    required this.id,
    required this.name,
    required this.muscle,
    required this.durationMin,
    required this.calories,
    required this.difficulty,
    this.done = false,
  });
  final String id;
  final String name;
  final String muscle;
  final int durationMin;
  final int calories;
  final String difficulty;
  bool done;
}

class MealEntry {
  MealEntry({
    required this.id,
    required this.name,
    required this.mealType,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.time,
  });
  final String id;
  final String name;
  final String mealType;
  final int calories;
  final int protein;
  final int carbs;
  final int fat;
  final String time;
}

class WatchSensor {
  WatchSensor({
    required this.label,
    required this.value,
    required this.unit,
    required this.icon,
    this.trend = '',
  });
  final String label;
  String value;
  final String unit;
  final String icon;
  String trend;
}

class CoachAiMessage {
  CoachAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

const mealTypes = ['Petit-déj', 'Déjeuner', 'Dîner', 'Snack'];
const muscleGroups = ['Full body', 'Jambes', 'Dos', 'Pectoraux', 'Cardio', 'Abdos'];

final initialExercises = <WorkoutExercise>[
  WorkoutExercise(id: 'EX-01', name: 'Course 5 km', muscle: 'Cardio', durationMin: 30, calories: 320, difficulty: 'Moyen'),
  WorkoutExercise(id: 'EX-02', name: 'Squats', muscle: 'Jambes', durationMin: 15, calories: 120, difficulty: 'Facile', done: true),
  WorkoutExercise(id: 'EX-03', name: 'Pompes', muscle: 'Pectoraux', durationMin: 12, calories: 90, difficulty: 'Moyen'),
  WorkoutExercise(id: 'EX-04', name: 'Gainage', muscle: 'Abdos', durationMin: 10, calories: 60, difficulty: 'Facile'),
  WorkoutExercise(id: 'EX-05', name: 'Tractions', muscle: 'Dos', durationMin: 15, calories: 110, difficulty: 'Difficile'),
];

final initialMeals = <MealEntry>[
  MealEntry(id: 'ML-01', name: 'Omelette + avocat', mealType: 'Petit-déj', calories: 420, protein: 28, carbs: 12, fat: 30, time: '08:00'),
  MealEntry(id: 'ML-02', name: 'Poulet grillé + riz', mealType: 'Déjeuner', calories: 650, protein: 45, carbs: 70, fat: 15, time: '13:00'),
  MealEntry(id: 'ML-03', name: 'Salade quinoa', mealType: 'Dîner', calories: 380, protein: 18, carbs: 42, fat: 14, time: '20:00'),
  MealEntry(id: 'ML-04', name: 'Banane + amandes', mealType: 'Snack', calories: 210, protein: 6, carbs: 28, fat: 10, time: '16:30'),
];

WatchSensor initialWatch() => WatchSensor(
      label: 'Montre FitBand Pro',
      value: 'Connectée',
      unit: '',
      icon: 'watch',
    );
