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

class StyleAiMessage {
  StyleAiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

const styleAdvice = {
  'homme': ['Homme'],
  'femme': ['Femme'],
  'enfant': ['Enfant'],
  'unisexe': ['Unisexe'],
  'chaussure': ['Chaussures'],
  'basket': ['Chaussures'],
  'accessoire': ['Accessoires'],
  'sac': ['Accessoires'],
  'bureau': ['Homme', 'Femme'],
  'travail': ['Homme', 'Femme'],
  'été': ['Unisexe', 'Femme', 'Chaussures'],
  'ete': ['Unisexe', 'Femme', 'Chaussures'],
  'hiver': ['Homme', 'Unisexe'],
  'sport': ['Chaussures', 'Unisexe'],
  'cadeau': ['Accessoires', 'Femme', 'Homme'],
  'pas cher': ['Unisexe', 'Enfant'],
  'budget': ['Unisexe', 'Enfant'],
  'luxe': ['Femme', 'Accessoires'],
  'élégant': ['Femme', 'Homme'],
  'elegant': ['Femme', 'Homme'],
};

List<FashionProduct> aiRecommendFashion(List<FashionProduct> catalog, String query, {List<CartItem>? cart}) {
  final q = query.toLowerCase();
  final cats = <String>{};
  for (final entry in styleAdvice.entries) {
    if (q.contains(entry.key)) cats.addAll(entry.value);
  }
  if (cart != null && cart.isNotEmpty) {
    for (final c in cart) {
      cats.add(c.product.category);
    }
  }
  var results = catalog.where((p) => p.stock > 0 && (cats.isEmpty || cats.contains(p.category))).toList();
  if (q.contains('pas cher') || q.contains('budget') || q.contains('moins')) {
    results.sort((a, b) => a.price.compareTo(b.price));
  } else if (q.contains('luxe') || q.contains('élégant') || q.contains('elegant')) {
    results.sort((a, b) => b.price.compareTo(a.price));
  } else {
    results.sort((a, b) => b.stock.compareTo(a.stock));
  }
  if (results.isEmpty) {
    results = catalog.where((p) => p.stock > 0).toList()..sort((a, b) => a.price.compareTo(b.price));
  }
  return results.take(4).toList();
}

String aiStyleTip(FashionProduct p) {
  final tips = {
    'Homme': 'Associez avec baskets blanches ou une chemise unie.',
    'Femme': 'Parfait pour un look smart-casual ; ajoutez un accessoire doré.',
    'Unisexe': 'Coupez oversized pour un style street — taillez une taille au-dessus.',
    'Enfant': 'Choisissez des tissus respirants et faciles à laver.',
    'Chaussures': 'Essayez avec un jean slim et un t-shirt uni.',
    'Accessoires': 'Un seul accessoire fort suffit pour relever une tenue simple.',
  };
  return '${p.emoji} ${p.name} (${p.brand}) — ${p.price} DT.\nConseil StyleBot : ${tips[p.category] ?? 'Mixez avec des pièces basiques noires/blanches.'}';
}

String aiStyleChat(
  String input,
  List<FashionProduct> catalog,
  List<CartItem> cart,
  List<FashionPromo> promos,
  List<FashionOrder> orders,
) {
  final q = input.toLowerCase().trim();
  if (q.isEmpty) return 'Dites-moi un style (été, bureau, sport), un budget ou « analyse mon panier ».';
  if (q.contains('bonjour') || q.contains('salut') || q.contains('hello')) {
    return 'Bonjour ! Je suis StyleBot 🛍️\nJe conseille des looks, des tailles, des promos et j\'analyse votre panier.';
  }
  if (q.contains('panier') || q.contains('analyse')) {
    if (cart.isEmpty) return 'Panier vide. Ajoutez des articles depuis le catalogue, puis demandez-moi une analyse.';
    final list = cart.map((c) => '• ${c.product.emoji} ${c.product.name} x${c.qty} — ${c.lineTotal} DT').join('\n');
    final total = cart.fold(0, (s, c) => s + c.lineTotal);
    final cats = cart.map((c) => c.product.category).toSet();
    final tip = cats.length == 1
        ? 'Votre panier est mono-catégorie ($cats). Ajoutez un accessoire pour compléter le look.'
        : 'Bon mix de catégories. Astuce : une seule pièce "forte" suffit.';
    return 'Analyse panier ($total DT) :\n$list\n\n$tip';
  }
  if (q.contains('promo') || q.contains('code') || q.contains('remise')) {
    if (promos.isEmpty) return 'Aucune promo active pour le moment.';
    return 'Codes utiles :\n${promos.take(3).map((p) => '• ${p.code} — ${p.title}${p.discount > 0 ? ' (-${p.discount}%)' : ''}').join('\n')}';
  }
  if (q.contains('stock') || q.contains('rupture')) {
    final low = catalog.where((p) => p.stock > 0 && p.stock <= 5).toList();
    if (low.isEmpty) return 'Pas d\'alerte stock bas. Inventaire OK.';
    return 'Stock bas :\n${low.map((p) => '• ${p.emoji} ${p.name} — ${p.stock} restant(s)').join('\n')}';
  }
  if (q.contains('commande') || q.contains('vente') || q.contains('ca')) {
    final active = orders.where((o) => o.status != 'Annulée' && o.status != 'Livrée').length;
    final ca = orders.where((o) => o.status != 'Annulée').fold(0, (s, o) => s + o.total);
    return 'Vue IA boutique :\n• Commandes actives : $active\n• CA : $ca DT\n• Articles catalogue : ${catalog.length}';
  }
  if (q.contains('taille') || q.contains('mesur')) {
    return 'Guide tailles StyleBot :\n• T-shirts/hoodies : prenez votre taille habituelle (oversized = +1)\n• Jeans : regardez le tour de taille en cm (28–36)\n• Chaussures : measurez le pied le soir\n• Enfant : âge indiqué = fourchette confort';
  }
  final picks = aiRecommendFashion(catalog, q, cart: cart);
  final intro = q.contains('cadeau')
      ? 'Idées cadeau :'
      : q.contains('budget') || q.contains('pas cher')
          ? 'Sélection budget :'
          : 'Looks StyleBot :';
  return '$intro\n${picks.map((p) => '• ${p.emoji} ${p.name} — ${p.price} DT · ${p.category}').join('\n')}\n\nTapez le nom d\'un article pour plus de conseils.';
}