class FitnessProgram {
  const FitnessProgram({
    required this.emoji,
    required this.name,
    required this.duration,
    required this.level,
    required this.category,
  });

  final String emoji;
  final String name;
  final String duration;
  final String level;
  final String category;
}

class Coach {
  const Coach({
    required this.name,
    required this.specialty,
    required this.rating,
    required this.initial,
  });

  final String name;
  final String specialty;
  final double rating;
  final String initial;
}

const programs = <FitnessProgram>[
  FitnessProgram(emoji: '💪', name: 'Force & Hypertrophie', duration: '8 sem.', level: 'Intermédiaire', category: 'muscu'),
  FitnessProgram(emoji: '🔥', name: 'Brûle-graisse HIIT', duration: '6 sem.', level: 'Tous niveaux', category: 'cardio'),
  FitnessProgram(emoji: '🧘', name: 'Yoga & Mobilité', duration: '4 sem.', level: 'Débutant', category: 'yoga'),
  FitnessProgram(emoji: '🏃', name: 'Prépa 10 km', duration: '10 sem.', level: 'Intermédiaire', category: 'cardio'),
  FitnessProgram(emoji: '🏠', name: 'Full Body Maison', duration: '5 sem.', level: 'Débutant', category: 'maison'),
  FitnessProgram(emoji: '🌿', name: 'Fitness Senior+', duration: '12 sem.', level: 'Adapté', category: 'senior'),
];

const coaches = <Coach>[
  Coach(name: 'Maya Ben Salah', specialty: 'Yoga · Pilates', rating: 4.9, initial: 'M'),
  Coach(name: 'Sofien Jebali', specialty: 'HIIT · CrossFit', rating: 4.8, initial: 'S'),
  Coach(name: 'Rami Khelil', specialty: 'Musculation', rating: 4.7, initial: 'R'),
  Coach(name: 'Amina Dridi', specialty: 'Nutrition sportive', rating: 5.0, initial: 'A'),
];

const filters = <String, String>{
  'all': 'Tous',
  'muscu': 'Musculation',
  'cardio': 'Cardio',
  'yoga': 'Yoga',
  'maison': 'Maison',
  'senior': 'Senior',
};

const timeSlots = [
  '08:00 — Matin énergie',
  '12:30 — Express 30 min',
  '18:00 — Soirée cardio',
  '20:00 — Stretch & récup',
];
