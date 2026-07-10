class ZooAnimal {
  ZooAnimal({
    required this.name,
    required this.species,
    required this.habitat,
    required this.age,
    required this.status,
    required this.emoji,
  });
  final String name;
  final String species;
  final String habitat;
  final int age;
  String status;
  final String emoji;
}

class ZooHabitat {
  ZooHabitat({
    required this.name,
    required this.zone,
    required this.capacity,
    required this.animals,
    required this.status,
  });
  final String name;
  final String zone;
  final int capacity;
  int animals;
  String status;
}

class ZooVisit {
  ZooVisit({
    required this.id,
    required this.visitor,
    required this.ticketType,
    required this.date,
    required this.price,
    required this.status,
  });
  final String id;
  final String visitor;
  final String ticketType;
  final String date;
  final int price;
  String status;
}

final initialAnimals = <ZooAnimal>[
  ZooAnimal(name: 'Simba', species: 'Lion', habitat: 'Savane Africaine', age: 6, status: 'Visible', emoji: '🦁'),
  ZooAnimal(name: 'Maya', species: 'Girafe', habitat: 'Savane Africaine', age: 4, status: 'Visible', emoji: '🦒'),
  ZooAnimal(name: 'Koko', species: 'Panda', habitat: 'Asie', age: 5, status: 'Soins', emoji: '🐼'),
  ZooAnimal(name: 'Nori', species: 'Dauphin', habitat: 'Aquarium', age: 8, status: 'Visible', emoji: '🐬'),
  ZooAnimal(name: 'Rico', species: 'Perroquet', habitat: 'Volière', age: 3, status: 'Visible', emoji: '🦜'),
  ZooAnimal(name: 'Bella', species: 'Flamant rose', habitat: 'Lac', age: 2, status: 'Repos', emoji: '🦩'),
];

final initialHabitats = <ZooHabitat>[
  ZooHabitat(name: 'Savane Africaine', zone: 'Zone A', capacity: 12, animals: 8, status: 'Ouvert'),
  ZooHabitat(name: 'Asie', zone: 'Zone B', capacity: 6, animals: 4, status: 'Ouvert'),
  ZooHabitat(name: 'Aquarium', zone: 'Zone C', capacity: 20, animals: 15, status: 'Ouvert'),
  ZooHabitat(name: 'Volière', zone: 'Zone D', capacity: 30, animals: 22, status: 'Maintenance'),
];

final initialVisits = <ZooVisit>[
  ZooVisit(id: 'ZV-301', visitor: 'Famille Trabelsi', ticketType: 'Famille', date: 'Aujourd\'hui', price: 75, status: 'Validé'),
  ZooVisit(id: 'ZV-300', visitor: 'École El Manar', ticketType: 'Groupe', date: 'Demain', price: 320, status: 'Confirmé'),
  ZooVisit(id: 'ZV-299', visitor: 'Omar K.', ticketType: 'Adulte', date: 'Aujourd\'hui', price: 18, status: 'En attente'),
];

const animalStatuses = ['Visible', 'Repos', 'Soins', 'Quarantaine'];
const habitatStatuses = ['Ouvert', 'Fermé', 'Maintenance'];
const visitStatuses = ['En attente', 'Confirmé', 'Validé', 'Annulé'];
