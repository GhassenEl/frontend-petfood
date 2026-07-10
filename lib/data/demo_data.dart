class MenuItem {
  const MenuItem({required this.name, required this.category, required this.price, required this.emoji});
  final String name;
  final String category;
  final int price;
  final String emoji;
}

class FoodOrder {
  FoodOrder({
    required this.id,
    required this.client,
    required this.items,
    required this.total,
    required this.status,
  });
  final String id;
  final String client;
  final String items;
  final int total;
  String status;
}

class Promo {
  const Promo({required this.title, required this.description, required this.code});
  final String title;
  final String description;
  final String code;
}

const initialMenu = <MenuItem>[
  MenuItem(name: 'Menu Burger Classic', category: 'Burger', price: 18, emoji: '🍔'),
  MenuItem(name: 'Double Cheese', category: 'Burger', price: 22, emoji: '🧀'),
  MenuItem(name: 'Wrap Poulet', category: 'Wrap', price: 14, emoji: '🌯'),
  MenuItem(name: 'Frites XL', category: 'Accomp.', price: 7, emoji: '🍟'),
  MenuItem(name: 'Menu Enfant', category: 'Kids', price: 12, emoji: '🎈'),
  MenuItem(name: 'Milkshake Vanille', category: 'Boisson', price: 9, emoji: '🥤'),
];

final initialOrders = <FoodOrder>[
  FoodOrder(id: 'QB-1042', client: 'Amine B.', items: 'Burger + Frites', total: 25, status: 'En préparation'),
  FoodOrder(id: 'QB-1041', client: 'Salma K.', items: 'Wrap x2', total: 28, status: 'Prête'),
  FoodOrder(id: 'QB-1040', client: 'Karim M.', items: 'Menu Enfant', total: 12, status: 'Livrée'),
  FoodOrder(id: 'QB-1039', client: 'Ines T.', items: 'Double Cheese', total: 22, status: 'En attente'),
];

const initialPromos = <Promo>[
  Promo(title: 'Midi -15 %', description: 'Tous les menus 11h–14h', code: 'MIDI15'),
  Promo(title: '2 achetés = 1 offert', description: 'Frites uniquement', code: 'FRITE2+1'),
  Promo(title: 'Livraison gratuite', description: 'Commande > 40 DT', code: 'LIVRAISON0'),
];
