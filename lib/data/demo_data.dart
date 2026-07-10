class PlantProduct {
  PlantProduct({
    required this.name,
    required this.species,
    required this.category,
    required this.price,
    required this.light,
    required this.watering,
    required this.stock,
    required this.emoji,
    this.inCart = false,
  });
  final String name;
  final String species;
  final String category;
  final int price;
  final String light;
  final String watering;
  int stock;
  final String emoji;
  bool inCart;
}

class PlantOrder {
  PlantOrder({
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

class AiPlantMessage {
  AiPlantMessage({required this.role, required this.text});
  final String role;
  final String text;
}

final initialPlants = <PlantProduct>[
  PlantProduct(name: 'Monstera Deliciosa', species: 'Monstera', category: 'Tropical', price: 89, light: 'Lumière indirecte', watering: '1×/semaine', stock: 14, emoji: '🌿', inCart: true),
  PlantProduct(name: 'Ficus Lyrata', species: 'Ficus', category: 'Intérieur', price: 120, light: 'Lumière vive', watering: '1×/10 jours', stock: 8, emoji: '🪴'),
  PlantProduct(name: 'Lavande Provence', species: 'Lavandula', category: 'Extérieur', price: 35, light: 'Plein soleil', watering: '2×/semaine', stock: 22, emoji: '💜', inCart: true),
  PlantProduct(name: 'Cactus Golden', species: 'Echinocactus', category: 'Succulente', price: 28, light: 'Soleil direct', watering: '1×/mois', stock: 30, emoji: '🌵'),
  PlantProduct(name: 'Orchidée Phalaenopsis', species: 'Phalaenopsis', category: 'Fleur', price: 55, light: 'Indirecte', watering: '1×/semaine', stock: 12, emoji: '🌸'),
  PlantProduct(name: 'Basilic Grand Vert', species: 'Ocimum', category: 'Aromatique', price: 18, light: 'Mi-ombre', watering: '3×/semaine', stock: 40, emoji: '🌱'),
  PlantProduct(name: 'Calathea Medallion', species: 'Calathea', category: 'Tropical', price: 65, light: 'Ombre', watering: '2×/semaine', stock: 10, emoji: '🍃'),
];

final initialOrders = <PlantOrder>[
  PlantOrder(id: 'GL-4401', client: 'Amira S.', items: 'Monstera + Lavande', total: 124, status: 'En préparation'),
  PlantOrder(id: 'GL-4400', client: 'Karim B.', items: 'Cactus Golden x2', total: 56, status: 'Expédiée'),
  PlantOrder(id: 'GL-4399', client: 'Salma T.', items: 'Orchidée Phalaenopsis', total: 55, status: 'Livrée'),
  PlantOrder(id: 'GL-4398', client: 'Youssef M.', items: 'Basilic x3', total: 54, status: 'En attente'),
];

const orderStatuses = ['En attente', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'];

const plantAdvice = {
  'débutant': ['Cactus Golden', 'Basilic Grand Vert', 'Lavande Provence'],
  'debutant': ['Cactus Golden', 'Basilic Grand Vert', 'Lavande Provence'],
  'appartement': ['Monstera Deliciosa', 'Calathea Medallion', 'Ficus Lyrata'],
  'soleil': ['Lavande Provence', 'Cactus Golden', 'Basilic Grand Vert'],
  'ombre': ['Calathea Medallion', 'Monstera Deliciosa', 'Orchidée Phalaenopsis'],
  'cadeau': ['Orchidée Phalaenopsis', 'Monstera Deliciosa', 'Ficus Lyrata'],
  'aromatique': ['Basilic Grand Vert', 'Lavande Provence'],
  'tropical': ['Monstera Deliciosa', 'Calathea Medallion', 'Ficus Lyrata'],
};

String aiCareTip(PlantProduct p) {
  return '${p.emoji} **${p.name}** — ${p.light} · Arrosage : ${p.watering}. '
      'Conseil IA : ${p.category == 'Succulente' ? 'Laissez sécher le sol entre deux arrosages.' : p.category == 'Tropical' ? 'Brumisez les feuilles en été.' : 'Surveillez le drainage du pot.'}';
}

List<PlantProduct> aiRecommendPlants(List<PlantProduct> catalog, String query, {List<PlantProduct>? cart}) {
  final q = query.toLowerCase();
  final names = <String>{};
  for (final entry in plantAdvice.entries) {
    if (q.contains(entry.key)) names.addAll(entry.value);
  }
  if (cart != null && cart.isNotEmpty) {
    for (final c in cart) {
      names.add(c.name);
    }
  }
  var results = catalog.where((p) => names.contains(p.name)).toList();
  if (results.isEmpty) {
    results = catalog.where((p) => p.stock > 0).toList();
  }
  results.sort((a, b) => b.stock.compareTo(a.stock));
  return results.take(4).toList();
}

String aiPlantChat(String input, List<PlantProduct> catalog, List<PlantProduct> cart) {
  final q = input.toLowerCase().trim();
  if (q.isEmpty) return 'Décrivez votre espace (appartement, soleil, ombre) ou votre niveau (débutant).';
  if (q.contains('bonjour') || q.contains('salut')) {
    return 'Bonjour ! Je suis GreenBot 🌱\nJe peux vous conseiller une plante, expliquer l\'arrosage ou analyser votre panier.';
  }
  if (q.contains('arros') || q.contains('eau')) {
  final picks = catalog.take(2).map((p) => '• ${p.emoji} ${p.name} : ${p.watering}').join('\n');
    return 'Règles d\'arrosage :\n$picks\nAstuce : touchez le sol — s\'il est sec sur 2 cm, arrosez.';
  }
  if (q.contains('panier') || q.contains('analyse')) {
    if (cart.isEmpty) return 'Votre panier est vide. Ajoutez des plantes depuis le catalogue.';
    final list = cart.map((p) => '• ${p.emoji} ${p.name}').join('\n');
    return 'Votre sélection :\n$list\nJe recommande un engrais organique 1×/mois pour ces variétés.';
  }
  if (q.contains('prix') || q.contains('budget') || q.contains('moins cher')) {
    final cheap = List.of(catalog)..sort((a, b) => a.price.compareTo(b.price));
    return 'Petits budgets :\n${cheap.take(3).map((p) => '• ${p.emoji} ${p.name} — ${p.price} DT').join('\n')}';
  }
  final picks = aiRecommendPlants(catalog, q, cart: cart);
  final intro = q.contains('cadeau') ? 'Idées cadeau :' : 'Plantes recommandées pour vous :';
  return '$intro\n${picks.map((p) => '• ${p.emoji} ${p.name} — ${p.price} DT · ${p.light}').join('\n')}';
}
