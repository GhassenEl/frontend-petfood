import 'package:flutter/material.dart';
import 'package:rideshop_mobility/data/demo_data.dart';

void main() => runApp(const RideShopApp());

class RideShopApp extends StatefulWidget {
  const RideShopApp({super.key});
  @override
  State<RideShopApp> createState() => _RideShopAppState();
}

class _RideShopAppState extends State<RideShopApp> {
  ThemeMode _mode = ThemeMode.dark;

  static final _light = ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    colorScheme: const ColorScheme.light(primary: Colors.black, onPrimary: Colors.white, secondary: Color(0xFF525252), surface: Colors.white, onSurface: Colors.black),
    scaffoldBackgroundColor: const Color(0xFFFAFAFA),
  );

  static final _dark = ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(primary: Colors.white, onPrimary: Colors.black, secondary: Color(0xFFB0B0B0), surface: Color(0xFF141414), onSurface: Colors.white),
    scaffoldBackgroundColor: Colors.black,
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RideShop — Trottinettes & vélos',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: RideShopHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class RideShopHome extends StatefulWidget {
  const RideShopHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<RideShopHome> createState() => _RideShopHomeState();
}

class _RideShopHomeState extends State<RideShopHome> {
  int _tab = 0;
  int _orderSeq = 5023;
  final List<MobilityProduct> _products = List.of(initialProducts);
  final List<MobilityOrder> _orders = List.of(initialOrders);
  final List<MobilityPromo> _promos = List.of(initialPromos);

  int get _revenue => _orders.where((o) => o.status != 'Annulée').fold(0, (s, o) => s + o.total);
  int get _activeOrders => _orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').length;
  int get _totalStock => _products.fold(0, (s, p) => s + p.stock);

  Future<bool?> _dialog(String title, List<Widget> fields) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Column(mainAxisSize: MainAxisSize.min, children: fields),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Valider')),
        ],
      ),
    );
  }

  void _addProduct() async {
    final name = TextEditingController();
    final price = TextEditingController();
    final stock = TextEditingController(text: '10');
    final ok = await _dialog('Nouveau produit', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
      TextField(controller: stock, decoration: const InputDecoration(labelText: 'Stock'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _products.add(MobilityProduct(
        name: name.text,
        category: 'Trottinette',
        price: int.tryParse(price.text) ?? 500,
        specs: 'Nouveau modèle',
        stock: int.tryParse(stock.text) ?? 10,
        emoji: '🛴',
      )));
    }
  }

  void _addOrder() async {
    final client = TextEditingController();
    final product = TextEditingController();
    final qty = TextEditingController(text: '1');
    final ok = await _dialog('Nouvelle commande', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: product, decoration: const InputDecoration(labelText: 'Produit')),
      TextField(controller: qty, decoration: const InputDecoration(labelText: 'Quantité'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      final q = int.tryParse(qty.text) ?? 1;
      setState(() => _orders.insert(0, MobilityOrder(
        id: 'RS-${_orderSeq++}',
        client: client.text,
        product: product.text,
        quantity: q,
        total: q * 650,
        status: 'En attente',
      )));
    }
  }

  void _addPromo() async {
    final title = TextEditingController();
    final code = TextEditingController();
    final ok = await _dialog('Nouvelle promo', [
      TextField(controller: title, decoration: const InputDecoration(labelText: 'Titre')),
      TextField(controller: code, decoration: const InputDecoration(labelText: 'Code')),
    ]);
    if (ok == true && title.text.isNotEmpty) {
      setState(() => _promos.add(MobilityPromo(title: title.text, description: 'Offre spéciale', code: code.text)));
    }
  }

  void _cycleOrder(MobilityOrder o) {
    final i = orderStatuses.indexOf(o.status);
    setState(() => o.status = orderStatuses[(i + 1) % orderStatuses.length]);
  }

  void _sellProduct(MobilityProduct p) {
    if (p.stock > 0) {
      setState(() => p.stock--);
    }
  }

  VoidCallback? get _fabAction {
    switch (_tab) {
      case 0:
      case 2:
        return _addOrder;
      case 1:
        return _addProduct;
      case 3:
        return _addPromo;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🛴 RideShop'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.all(16), children: [
            Text('Tableau de bord', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Commandes actives', value: '$_activeOrders'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Stock total', value: '$_totalStock'),
                _Kpi(label: 'Produits', value: '${_products.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Commandes en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').take(3).map((o) => Card(
              child: ListTile(title: Text('${o.id} — ${o.client}'), subtitle: Text(o.product), trailing: Text('${o.total} DT')),
            )),
          ]),
          ListView(padding: const EdgeInsets.all(16), children: _products.map((p) => Card(
            child: ListTile(
              leading: Text(p.emoji, style: const TextStyle(fontSize: 28)),
              title: Text(p.name),
              subtitle: Text('${p.category} · ${p.specs}'),
              onTap: () => _sellProduct(p),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${p.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
                Text('Stock: ${p.stock}', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _orders.map((o) => Card(
            child: ListTile(
              title: Text('${o.id} — ${o.client}'),
              subtitle: Text('${o.product} x${o.quantity}'),
              onTap: () => _cycleOrder(o),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(o.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.all(16), children: _promos.map((p) => Card(
            child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(p.description),
              const SizedBox(height: 8),
              Text('Code : ${p.code}', style: const TextStyle(fontWeight: FontWeight.w700)),
            ])),
          )).toList()),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.two_wheeler_outlined), label: 'Catalogue'),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), label: 'Commandes'),
          NavigationDestination(icon: Icon(Icons.local_offer_outlined), label: 'Promos'),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      ],
    )));
  }
}
