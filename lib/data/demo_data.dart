class GymMember {
  const GymMember({
    required this.name,
    required this.plan,
    required this.endDate,
    required this.status,
  });

  final String name;
  final String plan;
  final String endDate;
  final String status;
}

class GymClass {
  const GymClass({
    required this.time,
    required this.name,
    required this.coach,
    required this.spots,
  });

  final String time;
  final String name;
  final String coach;
  final String spots;
}

class SubscriptionPlan {
  const SubscriptionPlan({
    required this.name,
    required this.price,
    required this.features,
    this.featured = false,
  });

  final String name;
  final String price;
  final List<String> features;
  final bool featured;
}

const members = <GymMember>[
  GymMember(name: 'Amine Trabelsi', plan: 'Premium', endDate: '12/09/2026', status: 'Actif'),
  GymMember(name: 'Salma Gharbi', plan: 'Mensuel', endDate: '02/04/2026', status: 'Actif'),
  GymMember(name: 'Karim Bouazizi', plan: 'Annuel', endDate: '15/01/2027', status: 'Actif'),
  GymMember(name: 'Ines Mejri', plan: 'Mensuel', endDate: '28/03/2026', status: 'Expire bientôt'),
  GymMember(name: 'Youssef Sassi', plan: 'Découverte', endDate: '10/03/2026', status: 'Expiré'),
  GymMember(name: 'Nadia Ferchichi', plan: 'Premium', endDate: '20/11/2026', status: 'Actif'),
];

const todayClasses = <GymClass>[
  GymClass(time: '07:00', name: 'HIIT Matinal', coach: 'Sofien', spots: '12/15'),
  GymClass(time: '10:30', name: 'Yoga Flow', coach: 'Maya', spots: '8/10'),
  GymClass(time: '17:00', name: 'Musculation guidée', coach: 'Rami', spots: '14/16'),
  GymClass(time: '19:30', name: 'Spinning', coach: 'Sofien', spots: '18/20'),
];

const plans = <SubscriptionPlan>[
  SubscriptionPlan(
    name: 'Découverte',
    price: '49 DT/mois',
    features: ['Accès salle', '1 cours/semaine', 'Vestiaires'],
  ),
  SubscriptionPlan(
    name: 'Mensuel',
    price: '89 DT/mois',
    features: ['Accès illimité', 'Cours collectifs', 'App suivi'],
    featured: true,
  ),
  SubscriptionPlan(
    name: 'Premium',
    price: '149 DT/mois',
    features: ['Tout Mensuel', '2 séances coaching', 'Nutrition'],
  ),
  SubscriptionPlan(
    name: 'Annuel',
    price: '899 DT/an',
    features: ['−15 % vs mensuel', 'Bilan corporel', 'Invité 1×/mois'],
  ),
];

const weekSchedule = <String, List<String>>{
  'Lun': ['07:00 HIIT', '18:00 CrossFit'],
  'Mar': ['10:00 Yoga', '19:00 Boxe'],
  'Mer': ['07:30 Cardio', '17:30 Pilates'],
  'Jeu': ['12:00 Stretch', '19:30 Spinning'],
  'Ven': ['08:00 Full Body', '18:30 Zumba'],
  'Sam': ['09:00 Bootcamp', '11:00 Kids'],
  'Dim': ['10:00 Yoga détente'],
};
