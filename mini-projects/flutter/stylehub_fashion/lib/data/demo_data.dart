class FashionProduct {
  FashionProduct({
    required this.name,
    required this.category,
    required this.size,
    required this.price,
    required this.stock,
    required this.emoji,
    this.brand = 'StyleHub',
  });
  final String name;
  final String category;
  final String size;
  final int price;
  int stock;
  final String emoji;
  final String brand;
}

class FashionOrder {
  FashionOrder({
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

class FashionPromo {
  FashionPromo({
    required this.title,
    required this.description,
    required this.code,
    required this.discount,
  });
  final String title;
  final String description;
  final String code;
  final int discount;
}

class CartItem {
  CartItem({required this.product, this.qty = 1});
  final FashionProduct product;
  int qty;
  int get lineTotal => product.price * qty;
}

final initialProducts = <FashionProduct>[
  FashionProduct(name: 'Veste denim classic', category: 'Homme', size: 'M–XL', price: 189, stock: 14, emoji: '🧥', brand: 'UrbanTN'),
  FashionProduct(name: 'Robe lin été', category: 'Femme', size: 'S–L', price: 145, stock: 20, emoji: '👗', brand: 'Medina Wear'),
  FashionProduct(name: 'T-shirt coton bio', category: 'Unisexe', size: 'S–XXL', price: 45, stock: 50, emoji: '👕', brand: 'EcoFit'),
  FashionProduct(name: 'Jean slim stretch', category: 'Homme', size: '28–36', price: 120, stock: 22, emoji: '👖', brand: 'UrbanTN'),
  FashionProduct(name: 'Blazer élégant', category: 'Femme', size: 'S–L', price: 260, stock: 4, emoji: '🤵', brand: 'Luxe Nord'),
  FashionProduct(name: 'Baskets urbaine', category: 'Chaussures', size: '36–44', price: 175, stock: 16, emoji: '👟', brand: 'StepCity'),
  FashionProduct(name: 'Sac cabas cuir', category: 'Accessoires', size: 'Unique', price: 210, stock: 3, emoji: '👜', brand: 'Luxe Nord'),
  FashionProduct(name: 'Ensemble enfant', category: 'Enfant', size: '4–10 ans', price: 85, stock: 18, emoji: '🧒', brand: 'KidsBox'),
  FashionProduct(name: 'Hoodie oversized', category: 'Unisexe', size: 'M–XXL', price: 110, stock: 25, emoji: '🧥', brand: 'EcoFit'),
  FashionProduct(name: 'Sandales été', category: 'Chaussures', size: '36–42', price: 75, stock: 2, emoji: '🩴', brand: 'StepCity'),
];

final initialOrders = <FashionOrder>[
  FashionOrder(id: 'ST-6102', client: 'Amira B.', items: 'Robe lin été x1', total: 145, status: 'En préparation'),
  FashionOrder(id: 'ST-6101', client: 'Karim M.', items: 'Veste denim + Jean', total: 309, status: 'Expédiée'),
  FashionOrder(id: 'ST-6100', client: 'Salma K.', items: 'Baskets urbaine', total: 175, status: 'Livrée'),
  FashionOrder(id: 'ST-6099', client: 'Youssef T.', items: 'T-shirt bio x3', total: 135, status: 'En attente'),
];

final initialPromos = <FashionPromo>[
  FashionPromo(title: '-20 % soldes été', description: 'Toutes les robes et t-shirts', code: 'ETE20', discount: 20),
  FashionPromo(title: 'Livraison gratuite', description: 'Commande > 200 DT', code: 'LIVRAISON0', discount: 0),
  FashionPromo(title: '2e article -50 %', description: 'Sur la catégorie Unisexe', code: 'DEUX50', discount: 50),
  FashionPromo(title: '-10 % nouveaux clients', description: 'Première commande StyleHub', code: 'WELCOME10', discount: 10),
];

const orderStatuses = ['En attente', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'];
const fashionCategories = ['Tous', 'Homme', 'Femme', 'Unisexe', 'Enfant', 'Chaussures', 'Accessoires'];
