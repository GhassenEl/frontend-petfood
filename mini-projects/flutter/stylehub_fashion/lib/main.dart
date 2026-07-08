import 'package:flutter/material.dart';
import 'package:stylehub_fashion/data/demo_data.dart';

void main() => runApp(const StyleHubApp());

class StyleHubApp extends StatefulWidget {
  const StyleHubApp({super.key});
  @override
  State<StyleHubApp> createState() => _StyleHubAppState();
}

class _StyleHubAppState extends State<StyleHubApp> {
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
      title: 'StyleHub — Boutique vêtements',
      debugShowCheckedModeBanner: false,
      theme: _light,
      darkTheme: _dark,
      themeMode: _mode,
      home: StyleHubHome(
        isDark: _mode == ThemeMode.dark,
        onToggleTheme: () => setState(() => _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}

class StyleHubHome extends StatefulWidget {
  const StyleHubHome({super.key, required this.isDark, required this.onToggleTheme});
  final bool isDark;
  final VoidCallback onToggleTheme;
  @override
  State<StyleHubHome> createState() => _StyleHubHomeState();
}

class _StyleHubHomeState extends State<StyleHubHome> {
  int _tab = 0;
  int _orderSeq = 6103;
  final List<FashionProduct> _products = List.of(initialProducts);
  final List<FashionOrder> _orders = List.of(initialOrders);
  final List<FashionPromo> _promos = List.of(initialPromos);

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
    final category = TextEditingController(text: 'Unisexe');
    final price = TextEditingController(text: '99');
    final stock = TextEditingController(text: '10');
    final ok = await _dialog('Nouvel article', [
      TextField(controller: name, decoration: const InputDecoration(labelText: 'Nom')),
      TextField(controller: category, decoration: const InputDecoration(labelText: 'Catégorie')),
      TextField(controller: price, decoration: const InputDecoration(labelText: 'Prix DT'), keyboardType: TextInputType.number),
      TextField(controller: stock, decoration: const InputDecoration(labelText: 'Stock'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && name.text.isNotEmpty) {
      setState(() => _products.insert(0, FashionProduct(
        name: name.text,
        category: category.text,
        size: 'S–L',
        price: int.tryParse(price.text) ?? 99,
        stock: int.tryParse(stock.text) ?? 10,
        emoji: '🛍️',
      )));
    }
  }

  void _addOrder() async {
    final client = TextEditingController();
    final items = TextEditingController();
    final total = TextEditingController(text: '100');
    final ok = await _dialog('Nouvelle commande', [
      TextField(controller: client, decoration: const InputDecoration(labelText: 'Client')),
      TextField(controller: items, decoration: const InputDecoration(labelText: 'Articles')),
      TextField(controller: total, decoration: const InputDecoration(labelText: 'Total DT'), keyboardType: TextInputType.number),
    ]);
    if (ok == true && client.text.isNotEmpty) {
      setState(() => _orders.insert(0, FashionOrder(
        id: 'ST-${_orderSeq++}',
        client: client.text,
        items: items.text.isNotEmpty ? items.text : 'Article mode',
        total: int.tryParse(total.text) ?? 100,
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
      setState(() => _promos.add(FashionPromo(
        title: title.text,
        description: 'Offre spéciale boutique',
        code: code.text.isNotEmpty ? code.text : 'PROMO',
        discount: 15,
      )));
    }
  }

  void _sellProduct(FashionProduct p) {
    if (p.stock > 0) {
      setState(() {
        p.stock--;
        _orders.insert(0, FashionOrder(
          id: 'ST-${_orderSeq++}',
          client: 'Boutique',
          items: p.name,
          total: p.price,
          status: 'En attente',
        ));
      });
    }
  }

  void _cycleOrder(FashionOrder o) {
    final i = orderStatuses.indexOf(o.status);
    setState(() => o.status = orderStatuses[(i + 1) % orderStatuses.length]);
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
        title: const Text('🛍️ StyleHub'),
        actions: [IconButton(onPressed: widget.onToggleTheme, icon: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined))],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: FloatingActionButton(onPressed: _fabAction, child: const Icon(Icons.add)),
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: [
            Text('Boutique de vêtements', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.6,
              children: [
                _Kpi(label: 'Commandes actives', value: '$_activeOrders'),
                _Kpi(label: 'CA total', value: '$_revenue DT'),
                _Kpi(label: 'Stock total', value: '$_totalStock'),
                _Kpi(label: 'Articles', value: '${_products.length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Commandes en cours', style: TextStyle(fontWeight: FontWeight.w700)),
            ..._orders.where((o) => o.status != 'Livrée' && o.status != 'Annulée').take(3).map((o) => Card(
              child: ListTile(
                title: Text('${o.id} — ${o.client}'),
                subtitle: Text(o.items),
                trailing: Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            )),
          ]),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _products.map((p) => Card(
            child: ListTile(
              leading: Text(p.emoji, style: const TextStyle(fontSize: 32)),
              title: Text(p.name),
              subtitle: Text('${p.category} · Taille ${p.size}'),
              onTap: () => _sellProduct(p),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${p.price} DT', style: const TextStyle(fontWeight: FontWeight.w800)),
                Text('Stock: ${p.stock}', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _orders.map((o) => Card(
            child: ListTile(
              leading: const Icon(Icons.shopping_bag_outlined),
              title: Text('${o.id} — ${o.client}'),
              subtitle: Text(o.items),
              onTap: () => _cycleOrder(o),
              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('${o.total} DT', style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(o.status, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.secondary)),
              ]),
            ),
          )).toList()),
          ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 88), children: _promos.map((p) => Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text(p.description),
                const SizedBox(height: 8),
                Text('Code : ${p.code}${p.discount > 0 ? ' · -${p.discount} %' : ''}', style: const TextStyle(fontWeight: FontWeight.w700)),
              ]),
            ),
          )).toList()),
        ],
      ),
      bottomNavigationBar: Material(
        elevation: 12,
        color: Theme.of(context).colorScheme.surface,
        child: SafeArea(
          top: false,
          child: BottomNavigationBar(
            currentIndex: _tab,
            onTap: (i) => setState(() => _tab = i),
            type: BottomNavigationBarType.fixed,
            selectedItemColor: Theme.of(context).colorScheme.primary,
            unselectedItemColor: Theme.of(context).colorScheme.secondary,
            showUnselectedLabels: true,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Boutique'),
              BottomNavigationBarItem(icon: Icon(Icons.checkroom_outlined), label: 'Catalogue'),
              BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), label: 'Commandes'),
              BottomNavigationBarItem(icon: Icon(Icons.local_offer_outlined), label: 'Promos'),
            ],
          ),
        ),
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
