class MobilityProduct {
  MobilityProduct({
    required this.name,
    required this.category,
    required this.price,
    required this.specs,
    required this.stock,
    required this.emoji,
  });
  final String name;
  final String category;
  final int price;
  final String specs;
  int stock;
  final String emoji;
}

class MobilityOrder {
  MobilityOrder({
    required this.id,
    required this.client,
    required this.product,
    required this.quantity,
    required this.total,
    required this.status,
  });
  final String id;
  final String client;
  final String product;
  final int quantity;
  final int total;
  String status;
}

class MobilityPromo {
  MobilityPromo({required this.title, required this.description, required this.code});
  final String title;
  final String description;
  final String code;
}

final initialProducts = <MobilityProduct>[
  MobilityProduct(name: 'Trottinette X-Pro 500W', category: 'Trottinette électrique', price: 1890, specs: '45 km autonomie · 25 km/h', stock: 12, emoji: '🛴'),
  MobilityProduct(name: 'Trottinette City Lite', category: 'Trottinette', price: 650, specs: 'Pliable · 120 kg max', stock: 24, emoji: '🛴'),
  MobilityProduct(name: 'Vélo électrique Urban E', category: 'Vélo électrique', price: 2450, specs: '80 km · moteur 250W', stock: 8, emoji: '🚲'),
  MobilityProduct(name: 'VTT Trail 27.5"', category: 'VTT', price: 980, specs: '21 vitesses · freins disque', stock: 15, emoji: '🚵'),
  MobilityProduct(name: 'Vélo ville Classique', category: 'Vélo ville', price: 520, specs: 'Panier · garde-boue', stock: 20, emoji: '🚲'),
  MobilityProduct(name: 'Trottinette enfant Fun', category: 'Enfant', price: 280, specs: '3 roues · 6-10 ans', stock: 18, emoji: '🛹'),
];

final initialOrders = <MobilityOrder>[
  MobilityOrder(id: 'RS-5022', client: 'Amine B.', product: 'Trottinette X-Pro 500W', quantity: 1, total: 1890, status: 'En préparation'),
  MobilityOrder(id: 'RS-5021', client: 'Salma K.', product: 'Vélo électrique Urban E', quantity: 1, total: 2450, status: 'Expédiée'),
  MobilityOrder(id: 'RS-5020', client: 'Karim M.', product: 'Vélo ville Classique', quantity: 2, total: 1040, status: 'Livrée'),
  MobilityOrder(id: 'RS-5019', client: 'Ines T.', product: 'Trottinette City Lite', quantity: 1, total: 650, status: 'En attente'),
];

final initialPromos = <MobilityPromo>[
  MobilityPromo(title: '-10 % trottinettes', description: 'Tous les modèles électriques', code: 'SCOOT10'),
  MobilityPromo(title: 'Livraison gratuite', description: 'Commande > 500 DT', code: 'LIVRAISON0'),
  MobilityPromo(title: 'Pack vélo + casque', description: 'Casque offert sur vélos ville', code: 'VELOPACK'),
];

const orderStatuses = ['En attente', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'];
